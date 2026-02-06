import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron job for processing broadcast messages
 * Should be called every 1-5 minutes via Vercel Cron or external scheduler
 * 
 * Features:
 * - Rate limiting: max 30 messages per bot per day
 * - Staggered sending: respects scheduled_at for each message
 * - Batch processing: handles multiple broadcasts simultaneously
 */
export async function GET(request: NextRequest) {
    try {
        const now = new Date();
        const results: any[] = [];

        // Find pending messages that are due
        const { data: pendingMessages, error } = await supabase
            .from('broadcast_messages')
            .select(`
                *,
                broadcast:broadcasts(id, bot_id, message, daily_limit, status),
                lead:leads(id, phone, telegram_chat_id, name)
            `)
            .eq('status', 'pending')
            .lte('scheduled_at', now.toISOString())
            .limit(50) // Process max 50 per run
            .order('scheduled_at', { ascending: true });

        if (error) throw error;

        console.log(`[Broadcast Cron] Found ${pendingMessages?.length || 0} messages to send`);

        // Group by bot_id for rate limiting
        const messagesByBot = new Map<string, typeof pendingMessages>();
        for (const msg of pendingMessages || []) {
            if (!msg.broadcast?.bot_id) continue;

            const botId = msg.broadcast.bot_id;
            if (!messagesByBot.has(botId)) {
                messagesByBot.set(botId, []);
            }
            messagesByBot.get(botId)!.push(msg);
        }

        // Process each bot's messages with rate limiting
        const botIds = Array.from(messagesByBot.keys());
        for (const botId of botIds) {
            const messages = messagesByBot.get(botId)!;
            // Check daily limit
            const { data: remaining } = await supabase
                .rpc('get_daily_remaining', {
                    p_bot_id: botId,
                    p_daily_limit: messages[0]?.broadcast?.daily_limit || 30
                });

            const canSend = Math.min(remaining || 0, messages.length);
            console.log(`[Broadcast] Bot ${botId}: ${remaining} remaining, processing ${canSend} messages`);

            if (canSend <= 0) {
                // Skip all messages for today, reschedule for tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

                for (const msg of messages) {
                    await supabase
                        .from('broadcast_messages')
                        .update({ scheduled_at: tomorrow.toISOString() })
                        .eq('id', msg.id);
                }
                continue;
            }

            // Get bot's Telegram token
            const { data: bot } = await supabase
                .from('bots')
                .select('telegram_token')
                .eq('id', botId)
                .single();

            // Send messages up to the limit
            for (let i = 0; i < canSend; i++) {
                const msg = messages[i];

                try {
                    // Check if broadcast is still active
                    if (msg.broadcast?.status !== 'sending') {
                        await supabase
                            .from('broadcast_messages')
                            .update({ status: 'skipped' })
                            .eq('id', msg.id);
                        continue;
                    }

                    // Send via Telegram
                    if (msg.lead?.telegram_chat_id && bot?.telegram_token) {
                        const response = await fetch(`https://api.telegram.org/bot${bot.telegram_token}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: msg.lead.telegram_chat_id,
                                text: msg.broadcast.message,
                                parse_mode: 'HTML'
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`Telegram API error: ${response.status}`);
                        }

                        // Increment daily count
                        await supabase.rpc('increment_daily_message_count', { p_bot_id: botId });

                        // Mark as sent
                        await supabase
                            .from('broadcast_messages')
                            .update({ status: 'sent', sent_at: new Date().toISOString() })
                            .eq('id', msg.id);

                        // Update broadcast sent count
                        await supabase
                            .from('broadcasts')
                            .update({ sent_count: supabase.rpc('increment', { x: 1 }) })
                            .eq('id', msg.broadcast.id);

                        results.push({ id: msg.id, status: 'sent' });
                        console.log(`[Broadcast] Sent message ${msg.id} to lead ${msg.lead_id}`);

                    } else {
                        // No way to contact lead, skip
                        await supabase
                            .from('broadcast_messages')
                            .update({ status: 'skipped', error_message: 'No contact method' })
                            .eq('id', msg.id);
                        results.push({ id: msg.id, status: 'skipped', reason: 'no_contact' });
                    }

                } catch (sendError: any) {
                    console.error(`[Broadcast] Failed to send ${msg.id}:`, sendError);

                    await supabase
                        .from('broadcast_messages')
                        .update({ status: 'failed', error_message: sendError.message })
                        .eq('id', msg.id);

                    await supabase
                        .from('broadcasts')
                        .update({ failed_count: supabase.rpc('increment', { x: 1 }) })
                        .eq('id', msg.broadcast.id);

                    results.push({ id: msg.id, status: 'failed', error: sendError.message });
                }
            }
        }

        // Check if any broadcasts are completed
        const { data: activeBroadcasts } = await supabase
            .from('broadcasts')
            .select('id')
            .eq('status', 'sending');

        for (const bc of activeBroadcasts || []) {
            const { data: pending } = await supabase
                .from('broadcast_messages')
                .select('id')
                .eq('broadcast_id', bc.id)
                .eq('status', 'pending')
                .limit(1);

            if (!pending?.length) {
                await supabase
                    .from('broadcasts')
                    .update({ status: 'completed', completed_at: new Date().toISOString() })
                    .eq('id', bc.id);
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (e: any) {
        console.error('[Broadcast Cron] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
