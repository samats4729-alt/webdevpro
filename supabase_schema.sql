-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create bots table with AI fields
CREATE TABLE IF NOT EXISTS bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram', 'instagram')),
  welcome_message TEXT DEFAULT 'Hi! How can I help you?',
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT DEFAULT 'Спасибо за сообщение! Мы скоро ответим.',
  -- AI Settings
  ai_enabled BOOLEAN DEFAULT false,
  ai_system_prompt TEXT DEFAULT 'Ты вежливый помощник компании. Отвечай на вопросы клиентов на основе базы знаний.',
  ai_model TEXT DEFAULT 'deepseek-chat',
  ai_temperature DECIMAL(2, 1) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add AI columns if table exists (for existing databases)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN DEFAULT false;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS auto_reply_message TEXT DEFAULT 'Спасибо за сообщение! Мы скоро ответим.';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ai_system_prompt TEXT DEFAULT 'Ты вежливый помощник компании. Отвечай на вопросы клиентов на основе базы знаний.';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'deepseek-chat';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ai_temperature DECIMAL(2, 1) DEFAULT 0.7;

ALTER TABLE bots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bots" ON bots;
CREATE POLICY "Users can view own bots" ON bots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bots" ON bots;
CREATE POLICY "Users can create own bots" ON bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bots" ON bots;
CREATE POLICY "Users can update own bots" ON bots
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bots" ON bots;
CREATE POLICY "Users can delete own bots" ON bots
  FOR DELETE USING (auth.uid() = user_id);

-- Create flows table
CREATE TABLE IF NOT EXISTS flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nodes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view flows of own bots" ON flows;
CREATE POLICY "Users can view flows of own bots" ON flows
  FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create flows for own bots" ON flows;
CREATE POLICY "Users can create flows for own bots" ON flows
  FOR INSERT WITH CHECK (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update flows of own bots" ON flows;
CREATE POLICY "Users can update flows of own bots" ON flows
  FOR UPDATE USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete flows of own bots" ON flows;
CREATE POLICY "Users can delete flows of own bots" ON flows
  FOR DELETE USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  platform TEXT NOT NULL,
  last_message TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view leads of own bots" ON leads;
CREATE POLICY "Users can view leads of own bots" ON leads
  FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create leads for own bots" ON leads;
CREATE POLICY "Users can create leads for own bots" ON leads
  FOR INSERT WITH CHECK (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Create knowledge_base table for AI
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  price DECIMAL(10, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if table exists (for existing databases)
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view knowledge of own bots" ON knowledge_base;
CREATE POLICY "Users can view knowledge of own bots" ON knowledge_base
  FOR SELECT USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can add knowledge to own bots" ON knowledge_base;
CREATE POLICY "Users can add knowledge to own bots" ON knowledge_base
  FOR INSERT WITH CHECK (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update knowledge of own bots" ON knowledge_base;
CREATE POLICY "Users can update knowledge of own bots" ON knowledge_base
  FOR UPDATE USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete knowledge of own bots" ON knowledge_base;
CREATE POLICY "Users can delete knowledge of own bots" ON knowledge_base
  FOR DELETE USING (bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()));

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
