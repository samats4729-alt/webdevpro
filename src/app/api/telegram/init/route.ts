import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    createTelegramClient,
    startTelegramPolling,
    validateTelegramToken,
    getTelegramSession
} from '@/lib/telegram/client';
import { convertReactFlowToRules } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { botId, token } = body;

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get bot
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*, flows(*)')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Use provided token or existing one
        const botToken = token || bot.telegram_token;

        if (!botToken) {
            return NextResponse.json({ error: 'Telegram token is required' }, { status: 400 });
        }

        // Validate token
        const validation = await validateTelegramToken(botToken);
        if (!validation.valid) {
            return NextResponse.json({
                error: 'Invalid Telegram token',
                details: validation.error
            }, { status: 400 });
        }

        // Save token if new
        if (token && token !== bot.telegram_token) {
            await supabase
                .from('bots')
                .update({
                    telegram_token: token,
                    telegram_chat_id: validation.botInfo?.id?.toString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', botId);
        }

        // Convert flows to rules
        let flowRules: any[] = [];
        if (bot.flows && bot.flows.length > 0) {
            const flow = bot.flows[0];
            let nodes: any[] = [];
            let edges: any[] = [];

            if (Array.isArray(flow.nodes)) {
                nodes = flow.nodes;
            } else if (flow.nodes?._nodes) {
                nodes = flow.nodes._nodes;
                edges = flow.nodes._edges || [];
            }

            flowRules = convertReactFlowToRules(nodes, edges);
        }

        // Create and start bot
        await createTelegramClient(botId, botToken, flowRules);
        await startTelegramPolling(botId);

        return NextResponse.json({
            status: 'connected',
            botInfo: validation.botInfo,
            message: `Connected as @${validation.botInfo?.username}`
        });

    } catch (error: any) {
        console.error('[Telegram Init] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
