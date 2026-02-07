-- Add greeting AI prompt
ALTER TABLE bot_sections 
ADD COLUMN IF NOT EXISTS greeting_ai_prompt TEXT;

COMMENT ON COLUMN bot_sections.greeting_ai_prompt IS 'System prompt for AI greeting generation';
