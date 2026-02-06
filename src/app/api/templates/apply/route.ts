
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TEMPLATES } from '@/lib/templates/data';
import { updateBotSettings, getWhatsAppSession } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { botId, templateId } = await request.json();
        const template = TEMPLATES[templateId];

        console.log(`[Template] Applying ${templateId} to ${botId}`);
        console.log(`[Template] Nodes count: ${template?.nodes?.length}`);
        if (template?.nodes?.[2]) {
            console.log(`[Template] Node 3 data:`, JSON.stringify(template.nodes[2]));
        }
        if (template?.edges) {
            console.log(`[Template] Edges sample:`, JSON.stringify(template.edges.slice(0, 3)));
        }

        if (!botId || !templateId) {
            return NextResponse.json({ error: 'Bot ID and Template ID are required' }, { status: 400 });
        }

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Apply template: Update flows table
        // We assume 1 bot = 1 flow row for now, or we delete existing and create new
        // Check if flow exists
        const { data: existingFlow } = await supabase.from('flows').select('id').eq('bot_id', botId).single();

        // Pack data into the format expected by VisualFlowEditor
        // It expects 'nodes' column to contain: { _nodes: [...], _edges: [...] }
        const flowData = {
            _nodes: template.nodes,
            _edges: template.edges || []
        };

        if (existingFlow) {
            await supabase.from('flows').update({
                nodes: flowData,
                // Don't update 'edges' column separately as it might not be used/exist
                updated_at: new Date().toISOString()
            }).eq('id', existingFlow.id);
        } else {
            await supabase.from('flows').insert({
                bot_id: botId,
                nodes: flowData,
                updated_at: new Date().toISOString()
            });
        }

        // Update active session if exists
        const session = getWhatsAppSession(botId);
        if (session) {
            updateBotSettings(botId, {
                flowRules: template.nodes, // Logic handles conversion
                flowEdges: template.edges
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Template Apply] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
