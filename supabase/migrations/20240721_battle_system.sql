-- Battle System Tables for 16BitFit
-- This migration creates all necessary tables for the fighting game meta systems

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Battle Records Table
CREATE TABLE IF NOT EXISTS battle_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID NOT NULL,
  boss_id VARCHAR(50) NOT NULL,
  boss_name VARCHAR(100) NOT NULL,
  victory BOOLEAN NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  max_combo INTEGER NOT NULL DEFAULT 0,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  special_moves_used INTEGER NOT NULL DEFAULT 0,
  player_health_remaining INTEGER NOT NULL DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  synced BOOLEAN DEFAULT true
);

-- Statistics Table
CREATE TABLE IF NOT EXISTS statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID NOT NULL UNIQUE,
  total_battles INTEGER DEFAULT 0,
  total_victories INTEGER DEFAULT 0,
  total_defeats INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  highest_combo INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  total_damage_dealt BIGINT DEFAULT 0,
  total_damage_taken BIGINT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  boss_defeats JSONB DEFAULT '{}',
  favorite_moves JSONB DEFAULT '{}',
  play_time_seconds BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  reward JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(player_id, achievement_id)
);

-- Unlocks Table (for skins, moves, etc.)
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID NOT NULL,
  unlock_id VARCHAR(50) NOT NULL,
  unlock_type VARCHAR(50) DEFAULT 'general',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(player_id, unlock_id)
);

-- Leaderboards View
CREATE OR REPLACE VIEW leaderboards AS
SELECT 
  player_id,
  total_victories,
  total_battles,
  win_rate,
  highest_combo,
  highest_score,
  ROW_NUMBER() OVER (ORDER BY total_victories DESC, win_rate DESC) as rank
FROM statistics
WHERE total_battles >= 5; -- Minimum battles for leaderboard

-- Indexes for performance
CREATE INDEX idx_battle_records_player_id ON battle_records(player_id);
CREATE INDEX idx_battle_records_created_at ON battle_records(created_at DESC);
CREATE INDEX idx_achievements_player_id ON achievements(player_id);
CREATE INDEX idx_unlocks_player_id ON unlocks(player_id);
CREATE INDEX idx_statistics_total_victories ON statistics(total_victories DESC);
CREATE INDEX idx_statistics_highest_combo ON statistics(highest_combo DESC);

-- Row Level Security (RLS)
ALTER TABLE battle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to manage their own data
CREATE POLICY "Users can view their own battle records" ON battle_records
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own battle records" ON battle_records
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view their own statistics" ON statistics
  FOR ALL USING (auth.uid() = player_id);

CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view their own unlocks" ON unlocks
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own unlocks" ON unlocks
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Public leaderboard access
CREATE POLICY "Anyone can view leaderboards" ON statistics
  FOR SELECT USING (true);

-- Function to update statistics after battle
CREATE OR REPLACE FUNCTION update_battle_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert statistics
  INSERT INTO statistics (
    player_id,
    total_battles,
    total_victories,
    total_defeats,
    total_score,
    highest_combo,
    highest_score,
    total_damage_dealt,
    total_damage_taken,
    win_rate
  ) VALUES (
    NEW.player_id,
    1,
    CASE WHEN NEW.victory THEN 1 ELSE 0 END,
    CASE WHEN NEW.victory THEN 0 ELSE 1 END,
    NEW.score,
    NEW.max_combo,
    NEW.score,
    NEW.damage_dealt,
    NEW.damage_taken,
    CASE WHEN NEW.victory THEN 100 ELSE 0 END
  )
  ON CONFLICT (player_id) DO UPDATE SET
    total_battles = statistics.total_battles + 1,
    total_victories = statistics.total_victories + CASE WHEN NEW.victory THEN 1 ELSE 0 END,
    total_defeats = statistics.total_defeats + CASE WHEN NEW.victory THEN 0 ELSE 1 END,
    total_score = statistics.total_score + NEW.score,
    highest_combo = GREATEST(statistics.highest_combo, NEW.max_combo),
    highest_score = GREATEST(statistics.highest_score, NEW.score),
    total_damage_dealt = statistics.total_damage_dealt + NEW.damage_dealt,
    total_damage_taken = statistics.total_damage_taken + NEW.damage_taken,
    win_rate = CASE 
      WHEN statistics.total_battles + 1 > 0 
      THEN ((statistics.total_victories + CASE WHEN NEW.victory THEN 1 ELSE 0 END)::decimal / (statistics.total_battles + 1) * 100)::decimal(5,2)
      ELSE 0 
    END,
    updated_at = TIMEZONE('utc', NOW());
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update statistics
CREATE TRIGGER update_stats_after_battle
  AFTER INSERT ON battle_records
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_statistics();