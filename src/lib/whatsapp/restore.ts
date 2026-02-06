import fs from 'fs';
import path from 'path';
import { createWhatsAppClient } from './client';

export async function restoreSessions() {
    // Artificial delay to allow server/env to settle
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('[Restore] Starting session restoration (Baileys)...');

    const authPath = path.join(process.cwd(), 'baileys_auth_info');

    if (!fs.existsSync(authPath)) {
        console.log('[Restore] No auth directory found.');
        return;
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const { convertReactFlowToRules } = await import('./client'); // Dynamic import to ensure client.ts is ready

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('[Restore] Missing Supabase credentials, skipping restoration.');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const entries = fs.readdirSync(authPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith('session-')) {
                const botId = entry.name.replace('session-', '');
                console.log(`[Restore] Found session for bot ${botId}, restoring...`);

                try {
                    // Fetch bot settings
                    const { data: bot } = await supabase.from('bots').select('auto_reply_enabled, auto_reply_message').eq('id', botId).single();

                    // Fetch flows with edges
                    // Fetch flows nodes (edges might be missing in DB schema, defaulting to empty)
                    // If 'edges' column exists later, add it back to select.
                    const { data: flows, error: flowError } = await supabase.from('flows').select('nodes').eq('bot_id', botId);

                    if (flowError) {
                        console.error(`[Restore Debug] Error fetching flows for ${botId}:`, flowError);
                    } else {
                        // console.log(`[Restore Debug] Raw flows data for ${botId}:`, JSON.stringify(flows, null, 2));
                    }

                    let flowNodes: any[] = [];
                    let flowEdges: any[] = [];

                    if (flows) {
                        for (const flow of flows) {
                            const nodeData = flow.nodes;
                            if (nodeData) {
                                if (Array.isArray(nodeData)) {
                                    flowNodes.push(...nodeData);
                                } else if (typeof nodeData === 'object' && (nodeData as any)._nodes) {
                                    flowNodes.push(...((nodeData as any)._nodes || []));
                                    flowEdges.push(...((nodeData as any)._edges || []));
                                }
                            }
                        }
                    }

                    // Convert raw nodes/edges to executable rules
                    const readyRules = convertReactFlowToRules(flowNodes, flowEdges);

                    // Initialize client with saved settings
                    await createWhatsAppClient({
                        botId,
                        autoReplyEnabled: bot?.auto_reply_enabled || false,
                        autoReplyMessage: bot?.auto_reply_message || '',
                        flowRules: readyRules
                    });
                } catch (err) {
                    console.error(`[Restore] Failed to restore session for bot ${botId}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('[Restore] Error scanning auth directory:', error);
    }
}
