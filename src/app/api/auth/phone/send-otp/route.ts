import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWhatsAppSession } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

const OTP_BOT_ID = 'system-otp-bot'; // Fixed system OTP bot ID

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number to WhatsApp JID
function formatPhoneToJID(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Handle Kazakhstan numbers
    if (cleaned.startsWith('8') && cleaned.length === 11) {
        cleaned = '7' + cleaned.substring(1);
    }

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');

    return cleaned + '@s.whatsapp.net';
}

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Clean phone number for storage
        const cleanPhone = phone.replace(/\D/g, '');

        // Delete any existing OTPs for this phone
        await supabase
            .from('phone_otps')
            .delete()
            .eq('phone', cleanPhone);

        // Save OTP to database
        const { error: insertError } = await supabase
            .from('phone_otps')
            .insert({
                phone: cleanPhone,
                code,
                expires_at: expiresAt.toISOString(),
                verified: false
            });

        if (insertError) {
            console.error('Error saving OTP:', insertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // Get system OTP bot session
        const session = getWhatsAppSession(OTP_BOT_ID);

        if (!session || !session.sock || session.status !== 'connected') {
            return NextResponse.json({
                error: 'OTP бот не подключен. Обратитесь к администратору.',
                code: 'BOT_NOT_CONNECTED'
            }, { status: 400 });
        }

        // Send OTP via WhatsApp
        const jid = formatPhoneToJID(phone);
        const message = `🔐 Ваш код подтверждения: *${code}*\n\nКод действителен 5 минут.\n\n_WebDevPro_`;

        try {
            await session.sock.sendMessage(jid, { text: message });
        } catch (sendError) {
            console.error('Error sending WhatsApp message:', sendError);
            return NextResponse.json({
                error: 'Не удалось отправить сообщение. Убедитесь что номер зарегистрирован в WhatsApp.',
                code: 'SEND_FAILED'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent via WhatsApp',
            phone: cleanPhone.slice(-4).padStart(cleanPhone.length, '*') // Masked phone
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
