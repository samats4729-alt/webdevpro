import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stopTelegramBot } from '@/lib/telegram/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { botId } = body;

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Stop bot
        await stopTelegramBot(botId);

        return NextResponse.json({
            status: 'disconnected',
            message: 'Telegram bot stopped'
        });

    } catch (error: any) {
        console.error('[Telegram Disconnect] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
