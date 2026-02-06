import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/slots?bot_id=...&date=...&service_id=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('bot_id');
        const dateStr = searchParams.get('date');
        const serviceId = searchParams.get('service_id');

        if (!botId || !dateStr) {
            return NextResponse.json({ error: 'bot_id and date required' }, { status: 400 });
        }

        const date = new Date(dateStr);
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...6=Sat

        // Get working schedule
        const { data: schedule } = await supabase
            .from('working_schedule')
            .select('*')
            .eq('bot_id', botId)
            .single();

        const slotDuration = schedule?.slot_duration_minutes || 60;
        const bufferMinutes = schedule?.buffer_minutes || 0;

        // Check if it's a shift schedule
        let isWorkingDay = true;
        let workStart = '09:00';
        let workEnd = '18:00';
        let breakStart: string | null = null;
        let breakEnd: string | null = null;

        if (schedule?.schedule_type === 'shift' && schedule.cycle_start_date) {
            // Calculate if working day based on shift pattern
            const cycleStart = new Date(schedule.cycle_start_date);
            const daysDiff = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
            const cycleLength = schedule.shift_work_days + schedule.shift_off_days;
            const positionInCycle = daysDiff % cycleLength;
            isWorkingDay = positionInCycle < schedule.shift_work_days;

            // Get default hours for shift schedule
            const { data: defaultHours } = await supabase
                .from('working_hours')
                .select('*')
                .eq('bot_id', botId)
                .eq('day_of_week', 1) // Use Monday as template
                .single();

            if (defaultHours) {
                workStart = defaultHours.start_time;
                workEnd = defaultHours.end_time;
                breakStart = defaultHours.break_start;
                breakEnd = defaultHours.break_end;
            }
        } else {
            // Weekly schedule - get hours for this day of week
            const { data: hours } = await supabase
                .from('working_hours')
                .select('*')
                .eq('bot_id', botId)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (hours) {
                isWorkingDay = hours.is_working;
                workStart = hours.start_time;
                workEnd = hours.end_time;
                breakStart = hours.break_start;
                breakEnd = hours.break_end;
            }
        }

        // Check for exceptions (holidays, custom hours)
        const { data: exception } = await supabase
            .from('schedule_exceptions')
            .select('*')
            .eq('bot_id', botId)
            .eq('exception_date', dateStr)
            .single();

        if (exception) {
            if (exception.is_day_off) {
                isWorkingDay = false;
            } else if (exception.custom_start && exception.custom_end) {
                workStart = exception.custom_start;
                workEnd = exception.custom_end;
            }
        }

        // If not a working day, return empty
        if (!isWorkingDay) {
            return NextResponse.json({ slots: [], isWorkingDay: false });
        }

        // Get service duration if specified
        let serviceDuration = slotDuration;
        if (serviceId) {
            const { data: service } = await supabase
                .from('services')
                .select('duration_minutes')
                .eq('id', serviceId)
                .single();
            if (service) serviceDuration = service.duration_minutes;
        }

        // Generate time slots
        const slots: { time: string; available: boolean }[] = [];

        const [startHour, startMin] = workStart.split(':').map(Number);
        const [endHour, endMin] = workEnd.split(':').map(Number);

        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);

        // Get existing appointments for the day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const { data: appointments } = await supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('bot_id', botId)
            .neq('status', 'cancelled')
            .gte('start_time', dayStart.toISOString())
            .lte('start_time', dayEnd.toISOString());

        const bookedSlots = appointments || [];

        // Parse break times
        let breakStartTime: Date | null = null;
        let breakEndTime: Date | null = null;
        if (breakStart && breakEnd) {
            const [bsH, bsM] = breakStart.split(':').map(Number);
            const [beH, beM] = breakEnd.split(':').map(Number);
            breakStartTime = new Date(date);
            breakStartTime.setHours(bsH, bsM, 0, 0);
            breakEndTime = new Date(date);
            breakEndTime.setHours(beH, beM, 0, 0);
        }

        // Generate slots
        while (currentTime.getTime() + serviceDuration * 60 * 1000 <= endTime.getTime()) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60 * 1000);

            // Check if slot is during break
            let isDuringBreak = false;
            if (breakStartTime && breakEndTime) {
                isDuringBreak = slotStart < breakEndTime && slotEnd > breakStartTime;
            }

            // Check if slot conflicts with existing appointments
            let isBooked = false;
            for (const apt of bookedSlots) {
                const aptStart = new Date(apt.start_time);
                const aptEnd = new Date(apt.end_time);
                if (slotStart < aptEnd && slotEnd > aptStart) {
                    isBooked = true;
                    break;
                }
            }

            // Check if slot is in the past
            const now = new Date();
            const isPast = slotStart < now;

            if (!isDuringBreak) {
                slots.push({
                    time: slotStart.toISOString(),
                    available: !isBooked && !isPast
                });
            }

            // Move to next slot (slot duration + buffer)
            currentTime = new Date(currentTime.getTime() + (slotDuration + bufferMinutes) * 60 * 1000);
        }

        return NextResponse.json({
            slots,
            isWorkingDay: true,
            workingHours: { start: workStart, end: workEnd },
            break: breakStart && breakEnd ? { start: breakStart, end: breakEnd } : null
        });
    } catch (e: any) {
        console.error('[Slots API] GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
