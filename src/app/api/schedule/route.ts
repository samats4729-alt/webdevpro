import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/schedule?bot_id=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('bot_id');

        if (!botId) {
            return NextResponse.json({ error: 'bot_id required' }, { status: 400 });
        }

        // Get schedule settings
        const { data: schedule } = await supabase
            .from('working_schedule')
            .select('*')
            .eq('bot_id', botId)
            .single();

        // Get working hours
        const { data: hours } = await supabase
            .from('working_hours')
            .select('*')
            .eq('bot_id', botId)
            .order('day_of_week');

        // Get exceptions
        const { data: exceptions } = await supabase
            .from('schedule_exceptions')
            .select('*')
            .eq('bot_id', botId)
            .gte('exception_date', new Date().toISOString().split('T')[0])
            .order('exception_date');

        // Get services
        const { data: services } = await supabase
            .from('services')
            .select('*')
            .eq('bot_id', botId)
            .eq('is_active', true)
            .order('name');

        return NextResponse.json({
            schedule: schedule || { schedule_type: 'weekly', slot_duration_minutes: 60 },
            hours: hours || [],
            exceptions: exceptions || [],
            services: services || []
        });
    } catch (e: any) {
        console.error('[Schedule API] GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT /api/schedule - Update schedule settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { bot_id, schedule, hours, exceptions } = body;

        if (!bot_id) {
            return NextResponse.json({ error: 'bot_id required' }, { status: 400 });
        }

        // Update schedule settings
        if (schedule) {
            await supabase
                .from('working_schedule')
                .upsert({
                    bot_id,
                    ...schedule,
                    updated_at: new Date().toISOString()
                });
        }

        // Update working hours
        if (hours && Array.isArray(hours)) {
            for (const h of hours) {
                await supabase
                    .from('working_hours')
                    .upsert({
                        bot_id,
                        day_of_week: h.day_of_week,
                        start_time: h.start_time,
                        end_time: h.end_time,
                        break_start: h.break_start,
                        break_end: h.break_end,
                        is_working: h.is_working
                    }, { onConflict: 'bot_id,day_of_week' });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[Schedule API] PUT error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/schedule - Add exception
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bot_id, exception_date, is_day_off, custom_start, custom_end, reason } = body;

        if (!bot_id || !exception_date) {
            return NextResponse.json({ error: 'bot_id and exception_date required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('schedule_exceptions')
            .upsert({
                bot_id,
                exception_date,
                is_day_off: is_day_off !== false,
                custom_start,
                custom_end,
                reason
            }, { onConflict: 'bot_id,exception_date' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ exception: data });
    } catch (e: any) {
        console.error('[Schedule API] POST error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/schedule?exception_id=...
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const exceptionId = searchParams.get('exception_id');

        if (!exceptionId) {
            return NextResponse.json({ error: 'exception_id required' }, { status: 400 });
        }

        await supabase
            .from('schedule_exceptions')
            .delete()
            .eq('id', exceptionId);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[Schedule API] DELETE error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
