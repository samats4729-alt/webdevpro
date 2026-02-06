import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppSession } from '@/lib/whatsapp/client';
import { createClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('botId');

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = getWhatsAppSession(botId);

        if (!session) {
            return NextResponse.json({
                status: 'disconnected',
                connected: false,
                qrCode: null
            });
        }

        let qrCodeDataUrl = null;
        if (session.qrCode) {
            try {
                // Baileys returns a raw string (e.g. "2@...")
                qrCodeDataUrl = await QRCode.toDataURL(session.qrCode);
            } catch (e) {
                console.error('QR generation failed:', e);
            }
        }

        // Self-healing: Update DB if connected
        if (session.status === 'connected') {
            // Optional: Optimize this to not run on every poll
        }

        return NextResponse.json({
            status: session.status,
            connected: session.status === 'connected',
            qrCode: qrCodeDataUrl,
            info: session.deviceInfo ? {
                pushname: session.deviceInfo.name || session.deviceInfo.pushname || 'WhatsApp User',
                me: session.deviceInfo.id
            } : null
        });

    } catch (error: any) {
        console.error('[API Status] Error in status route:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
