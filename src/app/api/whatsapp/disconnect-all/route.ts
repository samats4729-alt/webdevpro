import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWhatsAppSession } from '@/lib/whatsapp/client';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all user's bots
        const { data: bots } = await supabase
            .from('bots')
            .select('id')
            .eq('user_id', user.id);

        if (!bots) {
            return NextResponse.json({ success: true, disconnected: 0 });
        }

        // Disconnect all active sessions for user's bots
        let disconnectedCount = 0;
        for (const bot of bots) {
            try {
                // New Baileys Logic
                const session = getWhatsAppSession(bot.id);
                if (session && session.sock) {
                    try {
                        await session.sock.logout();
                        session.sock.end(undefined);
                    } catch (e) {
                        // Ignore
                    }
                }

                // Always clean file
                const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${bot.id}`);
                if (fs.existsSync(authPath)) {
                    fs.rmSync(authPath, { recursive: true, force: true });
                }

                disconnectedCount++;

                // Update DB logic (optional, but good for consistency)
                await supabase
                    .from('bots')
                    .update({ status: 'offline', updated_at: new Date().toISOString() })
                    .eq('id', bot.id);

            } catch (e) {
                // Ignore errors for individual disconnects
            }
        }

        return NextResponse.json({
            success: true,
            disconnected: disconnectedCount,
            message: `Disconnected ${disconnectedCount} bot(s)`
        });

    } catch (error: any) {
        console.error('Disconnect all error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
