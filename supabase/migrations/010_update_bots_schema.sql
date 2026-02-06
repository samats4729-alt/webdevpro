-- Migration: Add description and industry to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS industry TEXT;
