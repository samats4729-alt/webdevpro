import { NextRequest, NextResponse } from 'next/server';
import { createWhatsAppClient, getWhatsAppSession, deleteWhatsAppSession } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

const OTP_BOT_ID = 'system-otp-bot'; // Fixed ID for system OTP bot

// GET - Get OTP bot status
export async function GET() {
    const session = getWhatsAppSession(OTP_BOT_ID);

    return NextResponse.json({
        botId: OTP_BOT_ID,
        status: session?.status || 'disconnected',
        qrCode: session?.qrCode || null,
        deviceInfo: session?.deviceInfo || null
    });
}

// POST - Connect OTP bot
export async function POST(req: NextRequest) {
    const { action } = await req.json();

    if (action === 'connect') {
        // Start WhatsApp connection
        try {
            await createWhatsAppClient({
                botId: OTP_BOT_ID,
                autoReplyEnabled: false,
                flowRules: []
            });

            // Wait for QR code to generate (up to 10 seconds with retries)
            let session = null;
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                session = getWhatsAppSession(OTP_BOT_ID);
                if (session?.qrCode || session?.status === 'connected') {
                    break;
                }
            }

            return NextResponse.json({
                success: true,
                status: session?.status || 'connecting',
                qrCode: session?.qrCode || null
            });
        } catch (error) {
            console.error('Error connecting OTP bot:', error);
            return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
        }
    }

    if (action === 'disconnect') {
        try {
            await deleteWhatsAppSession(OTP_BOT_ID);
            return NextResponse.json({ success: true, status: 'disconnected' });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
