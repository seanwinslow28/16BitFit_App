-- 16BitFit Supabase Database Schema
-- Comprehensive schema for gamified fitness app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  evolution_stage INTEGER DEFAULT 0, -- 0: Newbie, 1: Trainee, 2: Fighter, 3: Champion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'offline' -- online, offline, in_battle, working_out
);

-- Character Stats (extends existing but more comprehensive)
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  health INTEGER DEFAULT 75 CHECK (health >= 0 AND health <= 100),
  strength INTEGER DEFAULT 60 CHECK (strength >= 0 AND strength <= 100),
  stamina INTEGER DEFAULT 70 CHECK (stamina >= 0 AND stamina <= 100),
  happiness INTEGER DEFAULT 80 CHECK (happiness >= 0 AND happiness <= 100),
  weight INTEGER DEFAULT 55 CHECK (weight >= 30 AND weight <= 70),
  evolution_stage INTEGER DEFAULT 1 CHECK (evolution_stage >= 0 AND evolution_stage <= 3),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 100,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  bosses_defeated INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_decay TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Settings (comprehensive settings management)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- Sound Settings
  sound_enabled BOOLEAN DEFAULT true,
  master_volume DECIMAL(3,2) DEFAULT 0.8,
  sfx_volume DECIMAL(3,2) DEFAULT 0.8,
  music_volume DECIMAL(3,2) DEFAULT 0.6,
  ui_sounds BOOLEAN DEFAULT true,
  battle_sounds BOOLEAN DEFAULT true,
  achievement_sounds BOOLEAN DEFAULT true,
  -- Haptics Settings  
  haptics_enabled BOOLEAN DEFAULT true,
  haptics_intensity TEXT DEFAULT 'medium', -- light, medium, heavy
  button_feedback BOOLEAN DEFAULT true,
  combat_feedback BOOLEAN DEFAULT true,
  achievement_feedback BOOLEAN DEFAULT true,
  -- Notifications Settings
  notifications_enabled BOOLEAN DEFAULT true,
  daily_reminders BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  achievement_alerts BOOLEAN DEFAULT true,
  social_alerts BOOLEAN DEFAULT true,
  challenge_alerts BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  -- Display Settings
  theme TEXT DEFAULT 'gameboy', -- gameboy, modern, dark
  animations BOOLEAN DEFAULT true,
  reduced_motion BOOLEAN DEFAULT false,
  show_tips BOOLEAN DEFAULT true,
  show_damage_numbers BOOLEAN DEFAULT true,
  screen_shake BOOLEAN DEFAULT true,
  -- Gameplay Settings
  difficulty TEXT DEFAULT 'normal', -- easy, normal, hard
  auto_save BOOLEAN DEFAULT true,
  auto_save_interval INTEGER DEFAULT 5,
  confirm_actions BOOLEAN DEFAULT true,
  show_tutorials BOOLEAN DEFAULT true,
  quick_actions BOOLEAN DEFAULT false,
  -- Privacy Settings
  share_stats BOOLEAN DEFAULT true,
  public_profile BOOLEAN DEFAULT true,
  show_on_leaderboard BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  data_collection BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Character Customization Items
CREATE TABLE IF NOT EXISTS public.customization_items (
  id TEXT PRIMARY KEY, -- e.g., 'hair_punk', 'outfit_ninja'
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- body, hair, outfit, accessories, effects
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  unlock_requirement JSONB, -- {type: 'level', value: 10} or {type: 'achievement', value: 'warrior'}
  cost INTEGER DEFAULT 0, -- coins required to purchase
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Owned Customization Items
CREATE TABLE IF NOT EXISTS public.user_customizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT REFERENCES public.customization_items(id) ON DELETE CASCADE NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Achievements System
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY, -- e.g., 'first_workout', 'workout_warrior'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- fitness, nutrition, battle, social, streak, collection, special
  icon TEXT,
  points INTEGER DEFAULT 0,
  requirement JSONB NOT NULL, -- {type: 'workout_count', value: 1}
  reward JSONB, -- {xp: 50, coins: 10, item: 'warrior_headband'}
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Achievement Progress
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Action Logs (already exists but enhanced)
CREATE TABLE IF NOT EXISTS public.action_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- workout, meal, battle, achievement, etc.
  action_data JSONB,
  xp_gained INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Boss Battles (enhanced existing)
CREATE TABLE IF NOT EXISTS public.boss_battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  boss_name TEXT NOT NULL,
  boss_level INTEGER NOT NULL,
  player_level INTEGER NOT NULL,
  result TEXT NOT NULL, -- win, lose
  rewards JSONB, -- {xp: 100, coins: 50}
  game_score INTEGER DEFAULT 0,
  combat_power INTEGER DEFAULT 0,
  battle_duration INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Streaks (enhanced existing)  
CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  streak_date DATE NOT NULL,
  streak_count INTEGER DEFAULT 1,
  bonus_claimed BOOLEAN DEFAULT false,
  bonus_data JSONB, -- rewards claimed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, streak_date)
);

-- Nutrition Tracking
CREATE TABLE IF NOT EXISTS public.food_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  food_type TEXT, -- healthy, junk, protein, carb, etc.
  calories INTEGER DEFAULT 0,
  protein DECIMAL(5,2) DEFAULT 0,
  carbs DECIMAL(5,2) DEFAULT 0,
  fat DECIMAL(5,2) DEFAULT 0,
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  is_healthy BOOLEAN DEFAULT true,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Social System - Friends
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  friendship_level INTEGER DEFAULT 1,
  friendship_xp INTEGER DEFAULT 0,
  mutual_workouts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Guilds System
CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  member_limit INTEGER DEFAULT 20,
  is_public BOOLEAN DEFAULT true,
  leader_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guild Memberships
CREATE TABLE IF NOT EXISTS public.guild_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- leader, officer, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  contribution_points INTEGER DEFAULT 0,
  UNIQUE(guild_id, user_id)
);

-- Guild Chat Messages
CREATE TABLE IF NOT EXISTS public.guild_chat (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, system, achievement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PvP Battle System
CREATE TABLE IF NOT EXISTS public.pvp_battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player1_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES public.user_profiles(id),
  battle_data JSONB, -- full battle log, moves, etc.
  rating_change_p1 INTEGER DEFAULT 0,
  rating_change_p2 INTEGER DEFAULT 0,
  duration INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User PvP Rankings
CREATE TABLE IF NOT EXISTS public.pvp_rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  rating INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  highest_rating INTEGER DEFAULT 1000,
  rank_tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond, champion
  season INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trading System
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  initiator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, completed, cancelled
  initiator_items JSONB, -- array of item_ids offered
  partner_items JSONB, -- array of item_ids requested
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Leaderboards (computed views)
CREATE OR REPLACE VIEW public.level_leaderboard AS
SELECT 
  up.id,
  up.username,
  up.display_name,
  up.level,
  c.xp,
  c.evolution_stage,
  up.is_public
FROM public.user_profiles up
JOIN public.characters c ON up.id = c.user_id
WHERE up.is_public = true
ORDER BY up.level DESC, c.xp DESC
LIMIT 100;

-- Workout Leaderboard
CREATE OR REPLACE VIEW public.workout_leaderboard AS
SELECT
  up.id,
  up.username,
  up.display_name,
  c.total_workouts,
  c.longest_streak,
  up.is_public
FROM public.user_profiles up
JOIN public.characters c ON up.id = c.user_id  
WHERE up.is_public = true
ORDER BY c.total_workouts DESC, c.longest_streak DESC
LIMIT 100;

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data and public profiles of others
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can view public profiles" ON public.user_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Characters - users can manage their own character
CREATE POLICY "Users can manage own character" ON public.characters
  FOR ALL USING (auth.uid() = user_id);

-- Settings - users can only access their own settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Add similar policies for other tables...

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add triggers for other tables with updated_at columns...

-- Indexes for performance
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_level ON public.user_profiles(level DESC);
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_action_logs_user_id_created_at ON public.action_logs(user_id, created_at DESC);
CREATE INDEX idx_friendships_users ON public.friendships(requester_id, addressee_id);
CREATE INDEX idx_guild_members_guild_id ON public.guild_members(guild_id);
CREATE INDEX idx_food_entries_user_date ON public.food_entries(user_id, logged_at DESC); 