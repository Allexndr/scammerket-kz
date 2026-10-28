-- ScammerKetKz — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  image TEXT,
  rank TEXT DEFAULT 'Новичок',
  points INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  verified_reports_count INTEGER DEFAULT 0,
  people_protected INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  streak INTEGER DEFAULT 0,
  last_active_date DATE,
  api_key TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCAMS table (phone fraud)
-- ============================================
CREATE TABLE IF NOT EXISTS scams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  phone_hash TEXT UNIQUE,
  gender TEXT DEFAULT 'unknown',
  company TEXT,
  represented_as TEXT DEFAULT '',
  scam_type TEXT NOT NULL DEFAULT 'other',
  region TEXT DEFAULT 'other',
  description TEXT,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Pending',
  reported_by UUID REFERENCES users(id),
  voters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scams
CREATE INDEX IF NOT EXISTS idx_scams_phone_hash ON scams(phone_hash);
CREATE INDEX IF NOT EXISTS idx_scams_company ON scams(company);
CREATE INDEX IF NOT EXISTS idx_scams_created_at ON scams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scams_is_verified ON scams(is_verified);
CREATE INDEX IF NOT EXISTS idx_scams_type ON scams(scam_type);
CREATE INDEX IF NOT EXISTS idx_scams_region ON scams(region);
CREATE INDEX IF NOT EXISTS idx_scams_likes ON scams(likes DESC);

-- ============================================
-- COMMENTS table (for phone scams)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scam_id UUID NOT NULL REFERENCES scams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL DEFAULT 'Аноним',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_scam_id ON comments(scam_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- SOCIAL_SCAMS table (social media + marketplace fraud)
-- ============================================
CREATE TABLE IF NOT EXISTS social_scams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  platform_type TEXT NOT NULL DEFAULT 'social',
  category TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  region TEXT DEFAULT 'other',
  amount_scammed INTEGER DEFAULT 0,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  victims_count INTEGER DEFAULT 1,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Active',
  reported_by UUID REFERENCES users(id),
  voters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for social_scams
CREATE INDEX IF NOT EXISTS idx_social_platform ON social_scams(platform);
CREATE INDEX IF NOT EXISTS idx_social_platform_type ON social_scams(platform_type);
CREATE INDEX IF NOT EXISTS idx_social_category ON social_scams(category);
CREATE INDEX IF NOT EXISTS idx_social_victims ON social_scams(victims_count DESC);
CREATE INDEX IF NOT EXISTS idx_social_likes ON social_scams(likes DESC);
CREATE INDEX IF NOT EXISTS idx_social_created_at ON social_scams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_verified ON social_scams(is_verified);
CREATE INDEX IF NOT EXISTS idx_social_search ON social_scams USING gin(to_tsvector('russian', username || ' ' || display_name || ' ' || description));

-- ============================================
-- SOCIAL_COMMENTS table
-- ============================================
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_scam_id UUID NOT NULL REFERENCES social_scams(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT NOT NULL DEFAULT 'Аноним',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_comments_scam_id ON social_comments(social_scam_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_created_at ON social_comments(created_at DESC);

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scams_updated_at BEFORE UPDATE ON scams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER social_scams_updated_at BEFORE UPDATE ON social_scams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Helper RPC: increment_user_stat
-- ============================================
CREATE OR REPLACE FUNCTION increment_user_stat(p_user_id UUID, p_column TEXT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE users SET %I = COALESCE(%I, 0) + %s WHERE id = $1', p_column, p_column, p_amount)
  USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
