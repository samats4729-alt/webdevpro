import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cron job for sending appointment reminders
// Should be called every 5 minutes via Vercel Cron or external scheduler
export async function GET(request: NextRequest) {
    try {
        const now = new Date();

        // Find appointments that need reminders:
        // - start_time - reminder_minutes <= now
        // - reminder_sent = false
        // - status = confirmed
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                *,
                bot:bots(id, name, telegram_token),
                lead:leads(id, phone)
            `)
            .eq('reminder_sent', false)
            .eq('status', 'confirmed')
            .gte('start_time', now.toISOString()); // Only future appointments

        if (error) throw error;

        const remindersToSend = [];

        for (const apt of appointments || []) {
            const startTime = new Date(apt.start_time);
            const reminderTime = new Date(startTime.getTime() - (apt.reminder_minutes || 60) * 60 * 1000);

            // Check if it's time to send reminder
            if (now >= reminderTime) {
                remindersToSend.push(apt);
            }
        }

        console.log(`[Reminders Cron] Found ${remindersToSend.length} reminders to send`);

        const results = [];

        for (const apt of remindersToSend) {
            try {
                const startTime = new Date(apt.start_time);
                const timeStr = startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                const dateStr = startTime.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

                const message = `⏰ Напоминание о записи!\n\n📅 ${dateStr} в ${timeStr}\n\nДо встречи! 🙂`;

                // TODO: Send reminder via WhatsApp (requires active session)
                console.log(`[Reminders] Reminder prepared for appointment ${apt.id}, phone: ${apt.lead?.phone}`);

                // Mark reminder as sent
                await supabase
                    .from('appointments')
                    .update({ reminder_sent: true })
                    .eq('id', apt.id);

                results.push({ id: apt.id, status: 'sent' });
            } catch (e: any) {
                console.error(`[Reminders] Failed to send reminder for ${apt.id}:`, e);
                results.push({ id: apt.id, status: 'failed', error: e.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });
    } catch (e: any) {
        console.error('[Reminders Cron] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
