-- Add whatsapp_instance column to bots table
-- This stores the Evolution API instance name for webhook routing

ALTER TABLE bots 
ADD COLUMN IF NOT EXISTS whatsapp_instance TEXT UNIQUE;

-- Index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_bots_whatsapp_instance ON bots(whatsapp_instance);
