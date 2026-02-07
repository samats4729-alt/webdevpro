-- Add greeting triggers and media fields to bot_sections
ALTER TABLE bot_sections 
ADD COLUMN IF NOT EXISTS greeting_trigger TEXT DEFAULT 'all', -- 'all', 'keyword', 'start'
ADD COLUMN IF NOT EXISTS greeting_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS greeting_media TEXT, -- URL to image or file
ADD COLUMN IF NOT EXISTS greeting_ai_style TEXT; -- 'business', 'friendly', 'sales'

-- Comment on columns
COMMENT ON COLUMN bot_sections.greeting_trigger IS 'Trigger type for bot greeting: all, keyword, start';
COMMENT ON COLUMN bot_sections.greeting_keywords IS 'Keywords that trigger the greeting if trigger type is keyword';
COMMENT ON COLUMN bot_sections.greeting_media IS 'URL to media attachment for greeting';
COMMENT ON COLUMN bot_sections.greeting_ai_style IS 'Selected AI style for greeting generation';
