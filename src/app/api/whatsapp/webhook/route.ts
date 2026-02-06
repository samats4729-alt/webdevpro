import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook (no user auth context)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EvolutionMessage {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    pushName?: string;
    message?: {
        conversation?: string;
        extendedTextMessage?: {
            text: string;
        };
        imageMessage?: {
            caption?: string;
            url?: string;
        };
    };
    messageTimestamp?: number;
}

interface WebhookPayload {
    event: string;
    instance: string;
    data: EvolutionMessage;
}

// GET - Webhook verification (if needed)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const challenge = searchParams.get('hub.challenge');

    if (challenge) {
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ status: 'Webhook endpoint active' });
}

// POST - Receive messages from Evolution API
export async function POST(req: NextRequest) {
    try {
        const payload: WebhookPayload = await req.json();

        console.log('[Webhook] Received:', JSON.stringify(payload, null, 2));

        // Only process actual messages
        if (payload.event !== 'messages.upsert') {
            return NextResponse.json({ status: 'ignored', event: payload.event });
        }

        const message = payload.data;
        const instanceName = payload.instance;

        // Extract phone number (remove @s.whatsapp.net)
        const phone = message.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
        if (!phone || phone.includes('@g.us')) {
            // Skip group messages
            return NextResponse.json({ status: 'skipped', reason: 'group or invalid' });
        }

        // Extract message content
        let content = '';
        let messageType = 'text';
        let mediaUrl = '';

        if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            content = message.message.imageMessage.caption || '[Image]';
            messageType = 'image';
            mediaUrl = message.message.imageMessage.url || '';
        }

        // Direction: in = from customer, out = from bot
        const direction = message.key.fromMe ? 'out' : 'in';

        // Find the bot by instance name
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('id, user_id')
            .eq('whatsapp_instance', instanceName)
            .single();

        if (botError || !bot) {
            console.error('[Webhook] Bot not found for instance:', instanceName);
            return NextResponse.json({ status: 'error', message: 'Bot not found' }, { status: 404 });
        }

        // Upsert lead (create if not exists, update last_message_at if exists)
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .upsert({
                bot_id: bot.id,
                phone: phone,
                name: message.pushName || phone,
                platform: 'whatsapp',
                status: 'active',
                last_message_at: new Date().toISOString()
            }, {
                onConflict: 'bot_id,phone',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (leadError) {
            console.error('[Webhook] Failed to upsert lead:', leadError);
            return NextResponse.json({ status: 'error', message: leadError.message }, { status: 500 });
        }

        // Save message
        const { error: messageError } = await supabase
            .from('messages')
            .insert({
                lead_id: lead.id,
                content: content,
                direction: direction,
                message_type: messageType,
                media_url: mediaUrl || null
            });

        if (messageError) {
            console.error('[Webhook] Failed to save message:', messageError);
            return NextResponse.json({ status: 'error', message: messageError.message }, { status: 500 });
        }

        console.log(`[Webhook] Saved message from ${phone} to lead ${lead.id}`);

        return NextResponse.json({
            status: 'success',
            lead_id: lead.id,
            direction: direction
        });

    } catch (error: any) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
