import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/appointments?bot_id=...&date=...&status=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('bot_id');
        const date = searchParams.get('date');
        const status = searchParams.get('status');

        if (!botId) {
            return NextResponse.json({ error: 'bot_id required' }, { status: 400 });
        }

        let query = supabase
            .from('appointments')
            .select(`
                *,
                lead:leads(id, name, phone),
                service:services(id, name, duration_minutes, price)
            `)
            .eq('bot_id', botId)
            .order('start_time', { ascending: true });

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query = query
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString());
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ appointments: data });
    } catch (e: any) {
        console.error('[Appointments API] GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bot_id, lead_id, service_id, start_time, client_name, client_phone, notes, reminder_minutes } = body;

        if (!bot_id || !start_time) {
            return NextResponse.json({ error: 'bot_id and start_time required' }, { status: 400 });
        }

        // Get service duration
        let duration = 60; // default
        if (service_id) {
            const { data: service } = await supabase
                .from('services')
                .select('duration_minutes')
                .eq('id', service_id)
                .single();
            if (service) duration = service.duration_minutes;
        }

        // Calculate end time
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

        // Check for conflicts
        const { data: conflicts } = await supabase
            .from('appointments')
            .select('id')
            .eq('bot_id', bot_id)
            .neq('status', 'cancelled')
            .lt('start_time', endDate.toISOString())
            .gt('end_time', startDate.toISOString());

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
        }

        // Create appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                bot_id,
                lead_id,
                service_id,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                client_name,
                client_phone,
                notes,
                reminder_minutes: reminder_minutes || 60,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ appointment: data });
    } catch (e: any) {
        console.error('[Appointments API] POST error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT /api/appointments - Update appointment status
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const updateData: any = { updated_at: new Date().toISOString() };
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const { data, error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ appointment: data });
    } catch (e: any) {
        console.error('[Appointments API] PUT error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/appointments?id=...
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[Appointments API] DELETE error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
