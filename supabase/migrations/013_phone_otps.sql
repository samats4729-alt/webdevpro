-- Migration: Phone OTP table for WhatsApp authentication
-- Stores OTP codes with expiration for phone-based auth

CREATE TABLE IF NOT EXISTS phone_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup by phone
CREATE INDEX idx_phone_otps_phone ON phone_otps(phone);

-- Index for cleanup of expired codes
CREATE INDEX idx_phone_otps_expires ON phone_otps(expires_at);

-- RLS policies
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (for registration)
CREATE POLICY "Allow insert phone_otps" ON phone_otps
    FOR INSERT WITH CHECK (true);

-- Allow select/update only for matching phone (checked in API)
CREATE POLICY "Allow select phone_otps" ON phone_otps
    FOR SELECT USING (true);

CREATE POLICY "Allow update phone_otps" ON phone_otps
    FOR UPDATE USING (true);

-- Cleanup function to remove expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM phone_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- System settings table for OTP bot and other configs
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default OTP bot setting
INSERT INTO system_settings (key, value) 
VALUES ('otp_bot_id', NULL)
ON CONFLICT (key) DO NOTHING;

-- RLS for system_settings (admin only via API)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select system_settings" ON system_settings
    FOR SELECT USING (true);

