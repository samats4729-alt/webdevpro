-- Create table for Architect Chat Sessions
CREATE TABLE IF NOT EXISTS architect_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for Architect Messages
CREATE TABLE IF NOT EXISTS architect_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES architect_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    action_results JSONB, -- Store results of actions (e.g. "Create bot success")
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE architect_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE architect_messages ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
CREATE POLICY "Users can view their own sessions"
    ON architect_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
    ON architect_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON architect_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON architect_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for messages
-- Users can access messages if they own the parent session
CREATE POLICY "Users can view messages of their sessions"
    ON architect_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM architect_sessions
            WHERE architect_sessions.id = architect_messages.session_id
            AND architect_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their sessions"
    ON architect_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM architect_sessions
            WHERE architect_sessions.id = architect_messages.session_id
            AND architect_sessions.user_id = auth.uid()
        )
    );
