-- Migration: Fix is_active for existing services
-- Set is_active = true for all services where it's null

UPDATE services SET is_active = true WHERE is_active IS NULL;

-- Also set default value for new rows
ALTER TABLE services ALTER COLUMN is_active SET DEFAULT true;
