-- Migration: Add currency field to services
-- Add currency column to services table

ALTER TABLE services ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RUB';

-- Common currencies: RUB, KZT, USD, EUR, UZS, UAH
