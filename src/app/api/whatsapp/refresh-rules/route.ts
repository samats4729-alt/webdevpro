import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWhatsAppSession, updateBotSettings } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
    console.log('[refresh-rules] POST called');
    try {
        const body = await request.json();
        const { botId } = body;
        console.log('[refresh-rules] botId:', botId);

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log('[refresh-rules] user:', user?.id || 'NONE');

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        console.log('[refresh-rules] bot query result:', { bot, error: botError?.message });
        console.log('[refresh-rules] queried with botId:', botId, 'userId:', user.id);
        if (!bot) {
            return NextResponse.json({ error: 'Bot not found', details: botError?.message }, { status: 404 });
        }

        // Check if session exists
        const session = getWhatsAppSession(botId);
        console.log('[refresh-rules] session exists:', !!session);
        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'No active session, rules will apply on next connection'
            });
        }

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
                        // Handle wrapper format
                        flowNodes.push(...((nodeData as any)._nodes || []));
                        flowEdges.push(...((nodeData as any)._edges || []));
                    }
                }
            }
        }

        // Update session with new rules (only flow rules, auto_reply columns don't exist in DB yet)
        updateBotSettings(botId, {
            flowRules: flowNodes,
            flowEdges: flowEdges
        });

        return NextResponse.json({
            success: true,
            message: 'Rules refreshed',
            rulesCount: flowNodes.length
        });

    } catch (error: any) {
        console.error('Refresh rules error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
