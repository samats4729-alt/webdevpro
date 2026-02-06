import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppSession } from '@/lib/whatsapp/client';
import { createClient } from '@/lib/supabase/server';
import { DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

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

        const session = getWhatsAppSession(botId);

        if (session && session.sock) {
            console.log(`[API] Disconnecting bot ${botId}...`);
            try {
                // Logout sends a signal to WhatsApp servers
                await session.sock.logout();

                // Force close connection if not already closed
                session.sock.end(undefined);
            } catch (e) {
                console.error('Error logging out:', e);
            }

            // Clean up local files
            const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${botId}`);
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
        }

        // Update DB status
        await supabase
            .from('bots')
            .update({ status: 'offline', updated_at: new Date().toISOString() })
            .eq('id', botId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('WhatsApp disconnect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
