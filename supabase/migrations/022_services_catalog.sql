-- Add AI prompt for services and comment on JSON structure
ALTER TABLE bot_sections 
ADD COLUMN IF NOT EXISTS services_ai_prompt TEXT;

-- Comment on columns
COMMENT ON COLUMN bot_sections.services_items IS 'JSON array of services: [{name, price, category, description, image}]';
COMMENT ON COLUMN bot_sections.services_ai_prompt IS 'Context or prompt used to generate the service catalog';
