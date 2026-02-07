import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createWhatsAppClient, getWhatsAppSession, deleteWhatsAppSession } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samat@tenderai.kz';
const OTP_BOT_ID = 'system-otp-bot'; // Fixed ID for system OTP bot

// Check admin access
async function checkAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    return user && user.email === ADMIN_EMAIL;
}

// GET - Get OTP bot status
export async function GET() {
    const supabase = await createClient();

    if (!await checkAdmin(supabase)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const supabase = await createClient();

    if (!await checkAdmin(supabase)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'connect') {
        // Start WhatsApp connection
        try {
            const client = await createWhatsAppClient({
                botId: OTP_BOT_ID,
                autoReplyEnabled: false,
                flowRules: []
            });

            // createWhatsAppClient already initializes

            // Wait a bit for QR code to generate
            await new Promise(resolve => setTimeout(resolve, 2000));

            const session = getWhatsAppSession(OTP_BOT_ID);

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
