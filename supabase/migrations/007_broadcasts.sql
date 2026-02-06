-- Migration: Broadcast System
-- Tables: broadcasts, broadcast_messages

-- ============================================
-- BROADCASTS - Рассылки
-- ============================================
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    -- Targeting
    target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'with_appointments', 'custom')),
    target_lead_ids UUID[],
    -- Rate limiting
    daily_limit INTEGER DEFAULT 30,
    delay_seconds INTEGER DEFAULT 60, -- Delay between messages
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled')),
    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_broadcasts_bot_id ON broadcasts(bot_id);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);
CREATE INDEX idx_broadcasts_scheduled ON broadcasts(scheduled_at) WHERE status = 'scheduled';

-- ============================================
-- BROADCAST_MESSAGES - Отдельные сообщения рассылки
-- ============================================
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    -- Timing
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_broadcast_messages_broadcast_id ON broadcast_messages(broadcast_id);
CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_scheduled ON broadcast_messages(scheduled_at) WHERE status = 'pending';

-- ============================================
-- DAILY MESSAGE TRACKING - Трекинг лимитов
-- ============================================
CREATE TABLE IF NOT EXISTS daily_message_counts (
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INTEGER DEFAULT 0,
    PRIMARY KEY (bot_id, date)
);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot broadcasts" ON broadcasts
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own bot broadcasts" ON broadcasts
    FOR ALL USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own bot broadcast messages" ON broadcast_messages
    FOR SELECT USING (broadcast_id IN (
        SELECT id FROM broadcasts WHERE bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid())
    ));

CREATE POLICY "Users can view own daily counts" ON daily_message_counts
    FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- ============================================
-- Function to increment daily count
-- ============================================
CREATE OR REPLACE FUNCTION increment_daily_message_count(p_bot_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    INSERT INTO daily_message_counts (bot_id, date, message_count)
    VALUES (p_bot_id, CURRENT_DATE, 1)
    ON CONFLICT (bot_id, date) 
    DO UPDATE SET message_count = daily_message_counts.message_count + 1
    RETURNING message_count INTO current_count;
    
    RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to get remaining daily quota
-- ============================================
CREATE OR REPLACE FUNCTION get_daily_remaining(p_bot_id UUID, p_daily_limit INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COALESCE(message_count, 0) INTO current_count
    FROM daily_message_counts
    WHERE bot_id = p_bot_id AND date = CURRENT_DATE;
    
    RETURN GREATEST(0, p_daily_limit - COALESCE(current_count, 0));
END;
$$ LANGUAGE plpgsql;
