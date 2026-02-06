-- Migration: Appointment Booking System
-- Tables: services, working_schedule, working_hours, schedule_exceptions, appointments

-- ============================================
-- SERVICES - Услуги
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_bot_id ON services(bot_id);

-- ============================================
-- WORKING_SCHEDULE - Режим работы (weekly/shift)
-- ============================================
CREATE TABLE IF NOT EXISTS working_schedule (
    bot_id UUID PRIMARY KEY REFERENCES bots(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL DEFAULT 'weekly' CHECK (schedule_type IN ('weekly', 'shift')),
    -- For shift schedules (2/2, 1/3, 5/2)
    shift_work_days INTEGER DEFAULT 2,
    shift_off_days INTEGER DEFAULT 2,
    cycle_start_date DATE,
    -- Slot settings
    slot_duration_minutes INTEGER DEFAULT 60,
    buffer_minutes INTEGER DEFAULT 0,
    -- Reminder settings
    default_reminder_minutes INTEGER DEFAULT 60,
    -- Timezone
    timezone TEXT DEFAULT 'Asia/Almaty',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKING_HOURS - Рабочие часы по дням недели
-- ============================================
CREATE TABLE IF NOT EXISTS working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 1=Mon...6=Sat
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '18:00',
    break_start TIME,
    break_end TIME,
    is_working BOOLEAN DEFAULT true,
    UNIQUE(bot_id, day_of_week)
);

CREATE INDEX idx_working_hours_bot_id ON working_hours(bot_id);

-- ============================================
-- SCHEDULE_EXCEPTIONS - Выходные, отпуска, праздники
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_day_off BOOLEAN DEFAULT true,
    custom_start TIME,
    custom_end TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bot_id, exception_date)
);

CREATE INDEX idx_schedule_exceptions_bot_id_date ON schedule_exceptions(bot_id, exception_date);

-- ============================================
-- APPOINTMENTS - Записи клиентов
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    -- Time
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    -- Reminder
    reminder_minutes INTEGER DEFAULT 60,
    reminder_sent BOOLEAN DEFAULT false,
    -- Additional info
    client_name TEXT,
    client_phone TEXT,
    notes TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_bot_id ON appointments(bot_id);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_reminder ON appointments(start_time, reminder_sent) WHERE reminder_sent = false;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Users can view own bot services" ON services
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot services" ON services
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Working schedule policies
CREATE POLICY "Users can view own bot schedule" ON working_schedule
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot schedule" ON working_schedule
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Working hours policies
CREATE POLICY "Users can view own bot hours" ON working_hours
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot hours" ON working_hours
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Schedule exceptions policies
CREATE POLICY "Users can view own bot exceptions" ON schedule_exceptions
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot exceptions" ON schedule_exceptions
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Appointments policies
CREATE POLICY "Users can view own bot appointments" ON appointments
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot appointments" ON appointments
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- ============================================
-- Default working hours trigger
-- ============================================
CREATE OR REPLACE FUNCTION create_default_working_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default schedule
    INSERT INTO working_schedule (bot_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    
    -- Create default working hours Mon-Fri 9-18, Sat 10-15, Sun off
    INSERT INTO working_hours (bot_id, day_of_week, start_time, end_time, is_working) VALUES
        (NEW.id, 0, '10:00', '10:00', false),  -- Sun off
        (NEW.id, 1, '09:00', '18:00', true),   -- Mon
        (NEW.id, 2, '09:00', '18:00', true),   -- Tue
        (NEW.id, 3, '09:00', '18:00', true),   -- Wed
        (NEW.id, 4, '09:00', '18:00', true),   -- Thu
        (NEW.id, 5, '09:00', '18:00', true),   -- Fri
        (NEW.id, 6, '10:00', '15:00', true)    -- Sat
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_hours
    AFTER INSERT ON bots
    FOR EACH ROW
    EXECUTE FUNCTION create_default_working_hours();
