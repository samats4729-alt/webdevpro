-- Bot sections for simplified wizard setup
CREATE TABLE IF NOT EXISTS bot_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Greeting section
    greeting_mode TEXT DEFAULT 'ai',
    greeting_text TEXT,
    
    -- Services section
    services_mode TEXT DEFAULT 'template',
    services_items JSONB DEFAULT '[]'::jsonb,
    
    -- Schedule section
    schedule_mode TEXT DEFAULT 'template',
    schedule_days JSONB DEFAULT '[]'::jsonb,
    
    -- FAQ section
    faq_mode TEXT DEFAULT 'ai',
    faq_items JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(bot_id)
);

-- Enable RLS
ALTER TABLE bot_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own bot sections
CREATE POLICY "Users can manage own bot sections" ON bot_sections
    FOR ALL
    USING (
        bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid())
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_bot_sections_bot_id ON bot_sections(bot_id);
