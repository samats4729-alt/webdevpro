-- Add Telegram fields to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS telegram_token TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Index for Telegram lookups
CREATE INDEX IF NOT EXISTS idx_bots_telegram_token ON bots(telegram_token);
