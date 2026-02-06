import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/broadcasts?bot_id=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('bot_id');

        if (!botId) {
            return NextResponse.json({ error: 'bot_id required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('broadcasts')
            .select('*')
            .eq('bot_id', botId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get daily remaining quota
        const { data: countData } = await supabase
            .rpc('get_daily_remaining', { p_bot_id: botId, p_daily_limit: 30 });

        return NextResponse.json({
            broadcasts: data,
            dailyRemaining: countData || 30
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/broadcasts - Create new broadcast
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            bot_id,
            name,
            message,
            target_type = 'all',
            target_lead_ids,
            scheduled_at,
            daily_limit = 30,
            delay_seconds = 60
        } = body;

        if (!bot_id || !message) {
            return NextResponse.json({ error: 'bot_id and message required' }, { status: 400 });
        }

        // Get target recipients
        let recipientQuery = supabase
            .from('leads')
            .select('id')
            .eq('bot_id', bot_id);

        if (target_type === 'with_appointments') {
            // Only leads with upcoming appointments
            const { data: appointmentLeads } = await supabase
                .from('appointments')
                .select('lead_id')
                .eq('bot_id', bot_id)
                .eq('status', 'confirmed')
                .gte('start_time', new Date().toISOString());

            const leadIds = Array.from(new Set(appointmentLeads?.map(a => a.lead_id).filter(Boolean)));
            if (leadIds.length > 0) {
                recipientQuery = recipientQuery.in('id', leadIds);
            }
        } else if (target_type === 'custom' && target_lead_ids?.length > 0) {
            recipientQuery = recipientQuery.in('id', target_lead_ids);
        }

        const { data: leads } = await recipientQuery;
        const totalRecipients = leads?.length || 0;

        // Create broadcast
        const { data: broadcast, error } = await supabase
            .from('broadcasts')
            .insert({
                bot_id,
                name: name || `Рассылка ${new Date().toLocaleDateString('ru-RU')}`,
                message,
                target_type,
                target_lead_ids: target_type === 'custom' ? target_lead_ids : null,
                scheduled_at: scheduled_at || null,
                daily_limit,
                delay_seconds,
                status: scheduled_at ? 'scheduled' : 'draft',
                total_recipients: totalRecipients
            })
            .select()
            .single();

        if (error) throw error;

        // Create individual message records with staggered schedule
        if (leads && leads.length > 0) {
            const startTime = scheduled_at ? new Date(scheduled_at) : new Date();
            const messages = leads.map((lead, index) => ({
                broadcast_id: broadcast.id,
                lead_id: lead.id,
                status: 'pending',
                scheduled_at: new Date(startTime.getTime() + index * delay_seconds * 1000).toISOString()
            }));

            await supabase.from('broadcast_messages').insert(messages);
        }

        return NextResponse.json({ broadcast, totalRecipients });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT /api/broadcasts - Update broadcast or start sending
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        if (action === 'start') {
            // Start sending the broadcast
            const { error } = await supabase
                .from('broadcasts')
                .update({
                    status: 'sending',
                    started_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            return NextResponse.json({ success: true, status: 'sending' });
        }

        if (action === 'cancel') {
            const { error } = await supabase
                .from('broadcasts')
                .update({ status: 'cancelled' })
                .eq('id', id);

            // Also cancel pending messages
            await supabase
                .from('broadcast_messages')
                .update({ status: 'skipped' })
                .eq('broadcast_id', id)
                .eq('status', 'pending');

            if (error) throw error;
            return NextResponse.json({ success: true, status: 'cancelled' });
        }

        // Regular update
        const { data, error } = await supabase
            .from('broadcasts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ broadcast: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/broadcasts?id=...
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        await supabase.from('broadcasts').delete().eq('id', id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
