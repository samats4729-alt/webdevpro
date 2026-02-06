import { NextRequest, NextResponse } from 'next/server';
import { createWhatsAppClient, getWhatsAppSession, updateBotSettings, deleteWhatsAppSession } from '@/lib/whatsapp/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { botId, force } = body;

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: bot } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Check if session exists
        let session = getWhatsAppSession(botId);

        if (session) {
            // If explicitly forced OR if the session is stuck (not connected) and user is trying to init again
            // We assume if they hit "Connect" while we have a session, they want to reset if it's not working.
            // But to be safe, we'll rely on the frontend sending 'force' OR checking status.

            // Logic: If user clicks "Generate QR", they want a QR.
            // If we are already connected, we should probably tell them "Already connected".
            // If we are 'initializing' but stuck, or 'qr_ready' but scanned failed, we should allow reset.

            if (session.status === 'connected' && !force) {
                return NextResponse.json({
                    status: session.status,
                    message: 'Client already exists'
                });
            } else {
                console.log(`[API Init] Resetting session for ${botId} (Status: ${session.status}, Force: ${force})`);
                deleteWhatsAppSession(botId);
            }
        }

        // Load flow rules from database
        const { convertReactFlowToRules } = await import('@/lib/whatsapp/client');

        const { data: flows } = await supabase
            .from('flows')
            .select('nodes')
            .eq('bot_id', botId);

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

        const readyRules = convertReactFlowToRules(flowNodes, flowEdges);
        console.log(`[API Init] Loaded ${readyRules.length} flow rules for bot ${botId}`);

        // Create new client with flow rules
        await createWhatsAppClient({
            botId,
            autoReplyEnabled: bot.auto_reply_enabled || false,
            autoReplyMessage: bot.auto_reply_message || '',
            flowRules: readyRules
        });

        return NextResponse.json({
            status: 'initializing',
            message: 'Client initialization started'
        });

    } catch (error: any) {
        console.error('[API Init] Error in init route:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
