import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Get user's tickets and messages
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: tickets } = await supabaseAdmin
            .from('support_tickets')
            .select(`
                *,
                support_messages (*)
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        return NextResponse.json({ tickets: tickets || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create ticket or send message
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, ticket_id } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        let ticketId = ticket_id;

        // If no ticket_id, create new ticket or find open one
        if (!ticketId) {
            // Check for existing open ticket
            const { data: existingTicket } = await supabaseAdmin
                .from('support_tickets')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'open')
                .single();

            if (existingTicket) {
                ticketId = existingTicket.id;
            } else {
                // Create new ticket
                const { data: newTicket, error: ticketError } = await supabaseAdmin
                    .from('support_tickets')
                    .insert({
                        user_id: user.id,
                        user_email: user.email,
                        user_name: user.user_metadata?.full_name || user.email?.split('@')[0]
                    })
                    .select()
                    .single();

                if (ticketError) throw ticketError;
                ticketId = newTicket.id;
            }
        }

        // Add message
        const { data: newMessage, error: msgError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender_type: 'user',
                message: message.trim()
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // Update ticket timestamp
        await supabaseAdmin
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        return NextResponse.json({
            ticket_id: ticketId,
            message: newMessage
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
