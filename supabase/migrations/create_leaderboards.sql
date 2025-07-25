-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  boss_defeated TEXT NOT NULL,
  battle_duration INTEGER NOT NULL, -- in seconds
  combo_max INTEGER NOT NULL DEFAULT 0,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  perfect_victory BOOLEAN DEFAULT FALSE,
  difficulty TEXT NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for faster queries
  INDEX idx_score (score DESC),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_boss (boss_defeated)
);

-- Create weekly leaderboards view
CREATE OR REPLACE VIEW weekly_leaderboards AS
SELECT 
  id,
  user_id,
  username,
  score,
  boss_defeated,
  battle_duration,
  combo_max,
  damage_dealt,
  damage_taken,
  perfect_victory,
  difficulty,
  created_at,
  RANK() OVER (ORDER BY score DESC) as rank
FROM leaderboards
WHERE created_at >= date_trunc('week', CURRENT_DATE)
ORDER BY score DESC;

-- Create monthly leaderboards view
CREATE OR REPLACE VIEW monthly_leaderboards AS
SELECT 
  id,
  user_id,
  username,
  score,
  boss_defeated,
  battle_duration,
  combo_max,
  damage_dealt,
  damage_taken,
  perfect_victory,
  difficulty,
  created_at,
  RANK() OVER (ORDER BY score DESC) as rank
FROM leaderboards
WHERE created_at >= date_trunc('month', CURRENT_DATE)
ORDER BY score DESC;

-- Create function to get user's best score
CREATE OR REPLACE FUNCTION get_user_best_score(p_user_id UUID)
RETURNS TABLE (
  score INTEGER,
  boss_defeated TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  global_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      l.score,
      l.boss_defeated,
      l.created_at,
      RANK() OVER (ORDER BY l.score DESC) as global_rank
    FROM leaderboards l
  )
  SELECT 
    rs.score,
    rs.boss_defeated,
    rs.created_at,
    rs.global_rank
  FROM ranked_scores rs
  WHERE rs.user_id = p_user_id
  ORDER BY rs.score DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow users to read all leaderboard entries
CREATE POLICY "Leaderboards are viewable by everyone" ON leaderboards
  FOR SELECT USING (true);

-- Allow users to insert their own scores
CREATE POLICY "Users can insert their own scores" ON leaderboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prevent users from updating or deleting scores
CREATE POLICY "Scores cannot be modified" ON leaderboards
  FOR UPDATE USING (false);

CREATE POLICY "Scores cannot be deleted" ON leaderboards
  FOR DELETE USING (false);