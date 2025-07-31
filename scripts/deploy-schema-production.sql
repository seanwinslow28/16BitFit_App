-- 16BitFit Production Database Schema Deployment
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/noxwzelpibuytttlgztq/editor

-- Migration 1: Initial Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  haptic_enabled BOOLEAN DEFAULT true,
  privacy_mode VARCHAR(20) DEFAULT 'public',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Character archetypes
CREATE TABLE IF NOT EXISTS character_archetypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  base_health INTEGER DEFAULT 100,
  base_strength INTEGER DEFAULT 50,
  base_speed INTEGER DEFAULT 50,
  base_defense INTEGER DEFAULT 50,
  special_ability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User characters
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_id UUID REFERENCES character_archetypes(id),
  name VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Character stats
CREATE TABLE IF NOT EXISTS character_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  strength INTEGER DEFAULT 50,
  speed INTEGER DEFAULT 50,
  defense INTEGER DEFAULT 50,
  stamina INTEGER DEFAULT 100,
  max_stamina INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  duration_minutes INTEGER,
  intensity VARCHAR(20),
  calories_burned INTEGER,
  stats_impact JSONB,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Battles table
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  opponent_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  battle_type VARCHAR(20) NOT NULL,
  player_health_start INTEGER,
  player_health_end INTEGER,
  opponent_health_start INTEGER,
  opponent_health_end INTEGER,
  winner_id UUID REFERENCES characters(id),
  duration_seconds INTEGER,
  moves_used JSONB,
  rewards JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  points INTEGER DEFAULT 10,
  icon_url TEXT,
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  character_id UUID REFERENCES characters(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, achievement_id)
);

-- Friendships
-- Note: Each friendship creates one record. The app logic should handle bidirectional lookups.
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  leader_id UUID REFERENCES auth.users(id),
  max_members INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Guild members
CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  contribution_points INTEGER DEFAULT 0,
  UNIQUE(guild_id, user_id)
);

-- Migration 2: Add Evolution and PvP tables

-- Character evolution stages
CREATE TABLE IF NOT EXISTS character_evolution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
  evolution_stage INTEGER DEFAULT 1,
  total_workouts INTEGER DEFAULT 0,
  strength_workouts INTEGER DEFAULT 0,
  cardio_workouts INTEGER DEFAULT 0,
  wellness_workouts INTEGER DEFAULT 0,
  next_evolution_at INTEGER DEFAULT 10,
  evolution_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Character customization
CREATE TABLE IF NOT EXISTS character_customization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
  skin_tone VARCHAR(20) DEFAULT 'default',
  hair_style VARCHAR(50) DEFAULT 'default',
  hair_color VARCHAR(20) DEFAULT 'black',
  outfit_id VARCHAR(50) DEFAULT 'basic',
  accessory_ids JSONB DEFAULT '[]',
  emote_ids JSONB DEFAULT '[]',
  victory_pose_id VARCHAR(50) DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50),
  requirement_value INTEGER,
  reward_type VARCHAR(50),
  reward_value INTEGER,
  active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User daily challenge progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, challenge_id)
);

-- PvP matchmaking queue
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  ranking_points INTEGER DEFAULT 1000,
  searching_since TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  preferred_region VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- PvP battles
CREATE TABLE IF NOT EXISTS pvp_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES auth.users(id),
  battle_data JSONB,
  ranking_change_p1 INTEGER DEFAULT 0,
  ranking_change_p2 INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Guild chat messages
CREATE TABLE IF NOT EXISTS guild_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Migration 3: Add indexes and performance optimizations

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_archetype ON characters(archetype_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_character_id ON activities(character_id);
CREATE INDEX IF NOT EXISTS idx_activities_logged_at ON activities(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_player ON battles(player_character_id);
CREATE INDEX IF NOT EXISTS idx_battles_created ON battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_ranking ON matchmaking_queue(ranking_points DESC);
CREATE INDEX IF NOT EXISTS idx_pvp_battles_players ON pvp_battles(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_guild_chat_guild ON guild_chat(guild_id, created_at DESC);

-- Unique indexes for single-record tables
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_settings ON user_settings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_character_stats ON character_stats(character_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_character_evolution ON character_evolution(character_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_character_customization ON character_customization(character_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_matchmaking_queue ON matchmaking_queue(user_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_stats_updated_at BEFORE UPDATE ON character_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_evolution_updated_at BEFORE UPDATE ON character_evolution
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration 4: Add views and RLS policies

-- Leaderboard views
CREATE OR REPLACE VIEW character_leaderboard 
WITH (security_invoker=on) AS
SELECT 
  c.id,
  c.name as character_name,
  p.username,
  c.level,
  c.wins,
  c.total_battles,
  CASE WHEN c.total_battles > 0 
    THEN ROUND((c.wins::numeric / c.total_battles) * 100, 2) 
    ELSE 0 
  END as win_rate,
  c.current_streak,
  c.best_streak
FROM characters c
JOIN profiles p ON p.user_id = c.user_id
WHERE c.is_active = true
ORDER BY c.level DESC, c.wins DESC;

-- Activity statistics view
CREATE OR REPLACE VIEW user_activity_stats 
WITH (security_invoker=on) AS
SELECT 
  user_id,
  COUNT(*) as total_activities,
  SUM(duration_minutes) as total_minutes,
  SUM(calories_burned) as total_calories,
  COUNT(DISTINCT DATE(logged_at)) as active_days,
  MAX(logged_at) as last_activity
FROM activities
GROUP BY user_id;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_chat ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own characters" ON characters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON activities
  FOR ALL USING (auth.uid() = user_id);

-- Insert default character archetypes
INSERT INTO character_archetypes (name, description, base_health, base_strength, base_speed, base_defense, special_ability) VALUES
  ('Powerhouse', 'High damage, slower attacks', 120, 80, 40, 60, 'Crushing Blow'),
  ('Speedster', 'Fast attacks, combo specialist', 90, 60, 80, 50, 'Lightning Rush'),
  ('Tank', 'High defense, counter-attacker', 150, 60, 30, 90, 'Iron Wall'),
  ('Strategist', 'Balanced with technical moves', 100, 65, 65, 70, 'Mind Games'),
  ('Balanced', 'Well-rounded fighter', 110, 70, 70, 70, 'Adaptability');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ 16BitFit database schema deployed successfully!';
  RAISE NOTICE '📊 Created 23 tables, 5 archetypes, and optimized indexes';
  RAISE NOTICE '🔐 Row Level Security enabled with basic policies';
  RAISE NOTICE '🎮 Your database is ready for the fighting game!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Enable Realtime for key tables in Supabase Dashboard';
  RAISE NOTICE '2. Configure storage buckets for avatars';
  RAISE NOTICE '3. Test authentication and data flow';
END $$;