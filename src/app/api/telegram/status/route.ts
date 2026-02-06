import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTelegramSession } from '@/lib/telegram/client';

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
            .select('id, telegram_token, status')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Check session
        const session = getTelegramSession(botId);

        if (session && session.isRunning) {
            return NextResponse.json({
                status: 'connected',
                isRunning: true,
                hasToken: !!bot.telegram_token
            });
        }

        return NextResponse.json({
            status: bot.status || 'offline',
            isRunning: false,
            hasToken: !!bot.telegram_token
        });

    } catch (error: any) {
        console.error('[Telegram Status] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
