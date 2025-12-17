-- =============================================
-- French Verb Practice App - Database Schema
-- =============================================
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Stores user profile information
-- Automatically created when user signs up
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. USER VERBS TABLE
-- Stores verbs for each user
-- Includes both default and custom verbs
-- =============================================
CREATE TABLE IF NOT EXISTS user_verbs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  verb TEXT NOT NULL,
  translation TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  practice_count INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. PRACTICE SESSIONS TABLE
-- Stores each practice attempt with AI feedback
-- =============================================
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  verb_id UUID REFERENCES user_verbs(id) ON DELETE SET NULL,
  verb_text TEXT NOT NULL,
  tense TEXT NOT NULL,
  user_sentence TEXT NOT NULL,
  is_correct BOOLEAN,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. USER SETTINGS TABLE
-- Stores user preferences and API keys (encrypted)
-- =============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ai_provider TEXT DEFAULT 'grok',
  api_key_encrypted TEXT,
  daily_goal INTEGER DEFAULT 10,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. DEFAULT VERBS TABLE (Read-only reference)
-- Contains the 50 default verbs for all users
-- =============================================
CREATE TABLE IF NOT EXISTS default_verbs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verb TEXT NOT NULL UNIQUE,
  translation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for better query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_verbs_user_id ON user_verbs(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON practice_sessions(created_at DESC);

-- =============================================
-- FUNCTION: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default settings for the user
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_verbs ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER_VERBS: Users can only manage their own verbs
CREATE POLICY "Users can view own verbs"
  ON user_verbs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verbs"
  ON user_verbs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verbs"
  ON user_verbs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own verbs"
  ON user_verbs FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- PRACTICE_SESSIONS: Users can only see their own practice history
CREATE POLICY "Users can view own practice sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- USER_SETTINGS: Users can only manage their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- DEFAULT_VERBS: Everyone can read, no one can write
CREATE POLICY "Anyone can view default verbs"
  ON default_verbs FOR SELECT
  TO authenticated
  USING (TRUE);

-- =============================================
-- INSERT DEFAULT VERBS (50 common French verbs)
-- =============================================
INSERT INTO default_verbs (verb, translation) VALUES
  ('être', 'to be'),
  ('avoir', 'to have'),
  ('faire', 'to do/make'),
  ('dire', 'to say/tell'),
  ('pouvoir', 'to be able to/can'),
  ('aller', 'to go'),
  ('voir', 'to see'),
  ('savoir', 'to know'),
  ('vouloir', 'to want'),
  ('venir', 'to come'),
  ('devoir', 'to have to/must'),
  ('prendre', 'to take'),
  ('donner', 'to give'),
  ('trouver', 'to find'),
  ('parler', 'to speak'),
  ('mettre', 'to put'),
  ('aimer', 'to like/love'),
  ('croire', 'to believe'),
  ('passer', 'to pass/spend time'),
  ('demander', 'to ask'),
  ('tenir', 'to hold'),
  ('porter', 'to wear/carry'),
  ('regarder', 'to watch/look at'),
  ('rester', 'to stay'),
  ('entendre', 'to hear'),
  ('arriver', 'to arrive'),
  ('sentir', 'to feel/smell'),
  ('sortir', 'to go out'),
  ('partir', 'to leave'),
  ('tomber', 'to fall'),
  ('écrire', 'to write'),
  ('lire', 'to read'),
  ('vivre', 'to live'),
  ('comprendre', 'to understand'),
  ('attendre', 'to wait'),
  ('répondre', 'to answer'),
  ('manger', 'to eat'),
  ('boire', 'to drink'),
  ('dormir', 'to sleep'),
  ('ouvrir', 'to open'),
  ('fermer', 'to close'),
  ('commencer', 'to begin'),
  ('finir', 'to finish'),
  ('acheter', 'to buy'),
  ('choisir', 'to choose'),
  ('jouer', 'to play'),
  ('apprendre', 'to learn'),
  ('connaître', 'to know (person/place)'),
  ('suivre', 'to follow'),
  ('penser', 'to think')
ON CONFLICT (verb) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Database schema created successfully!' AS message;

