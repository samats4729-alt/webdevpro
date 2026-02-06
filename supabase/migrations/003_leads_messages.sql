-- Create leads table for storing customer/contact information
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    platform TEXT DEFAULT 'whatsapp',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one lead per phone per bot
    UNIQUE(bot_id, phone)
);

-- Create messages table for conversation history
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    message_type TEXT DEFAULT 'text',
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_bot_id ON leads(bot_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_last_message ON leads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users can view leads for their bots" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = leads.bot_id 
            AND bots.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert leads for their bots" ON leads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = leads.bot_id 
            AND bots.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update leads for their bots" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = leads.bot_id 
            AND bots.user_id = auth.uid()
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their leads" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            JOIN bots ON bots.id = leads.bot_id
            WHERE leads.id = messages.lead_id 
            AND bots.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages for their leads" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads 
            JOIN bots ON bots.id = leads.bot_id
            WHERE leads.id = messages.lead_id 
            AND bots.user_id = auth.uid()
        )
    );

-- Service role bypass for webhook (no auth context)
CREATE POLICY "Service role full access to leads" ON leads
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to messages" ON messages
    FOR ALL USING (auth.role() = 'service_role');
