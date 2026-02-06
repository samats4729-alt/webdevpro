-- Migration: Ensure all foreign keys have ON DELETE CASCADE
-- This fixes databases that were created before CASCADE was added

-- ============================================
-- FLOWS
-- ============================================
ALTER TABLE flows DROP CONSTRAINT IF EXISTS flows_bot_id_fkey;
ALTER TABLE flows ADD CONSTRAINT flows_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- LEADS
-- ============================================
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_bot_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- MESSAGES (cascade via leads)
-- ============================================
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_lead_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_lead_id_fkey 
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

-- ============================================
-- SERVICES
-- ============================================
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_bot_id_fkey;
ALTER TABLE services ADD CONSTRAINT services_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- WORKING_SCHEDULE
-- ============================================
ALTER TABLE working_schedule DROP CONSTRAINT IF EXISTS working_schedule_bot_id_fkey;
ALTER TABLE working_schedule ADD CONSTRAINT working_schedule_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- WORKING_HOURS
-- ============================================
ALTER TABLE working_hours DROP CONSTRAINT IF EXISTS working_hours_bot_id_fkey;
ALTER TABLE working_hours ADD CONSTRAINT working_hours_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- SCHEDULE_EXCEPTIONS
-- ============================================
ALTER TABLE schedule_exceptions DROP CONSTRAINT IF EXISTS schedule_exceptions_bot_id_fkey;
ALTER TABLE schedule_exceptions ADD CONSTRAINT schedule_exceptions_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- APPOINTMENTS
-- ============================================
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_bot_id_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- Keep lead_id and service_id as SET NULL (preserve appointment history)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_lead_id_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_lead_id_fkey 
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_service_id_fkey 
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

-- ============================================
-- BROADCASTS
-- ============================================
ALTER TABLE broadcasts DROP CONSTRAINT IF EXISTS broadcasts_bot_id_fkey;
ALTER TABLE broadcasts ADD CONSTRAINT broadcasts_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- BROADCAST_MESSAGES
-- ============================================
ALTER TABLE broadcast_messages DROP CONSTRAINT IF EXISTS broadcast_messages_broadcast_id_fkey;
ALTER TABLE broadcast_messages ADD CONSTRAINT broadcast_messages_broadcast_id_fkey 
    FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE;

-- ============================================
-- DAILY_MESSAGE_COUNTS
-- ============================================
ALTER TABLE daily_message_counts DROP CONSTRAINT IF EXISTS daily_message_counts_bot_id_fkey;
ALTER TABLE daily_message_counts ADD CONSTRAINT daily_message_counts_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;

-- ============================================
-- KNOWLEDGE_BASE
-- ============================================
ALTER TABLE knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_bot_id_fkey;
ALTER TABLE knowledge_base ADD CONSTRAINT knowledge_base_bot_id_fkey 
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE;
