-- Realtime Matchmaking Support
-- Adds matchmaking queue table for PvP battles

-- Matchmaking Queue
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  rating INTEGER DEFAULT 1000,
  character_level INTEGER NOT NULL,
  searching_since TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  matched_with UUID REFERENCES public.user_profiles(id),
  matched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for efficient matchmaking
CREATE INDEX idx_matchmaking_rating ON public.matchmaking_queue(rating, character_level);
CREATE INDEX idx_matchmaking_searching ON public.matchmaking_queue(searching_since) WHERE matched_with IS NULL;

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own matchmaking" ON public.matchmaking_queue
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view matchmaking queue" ON public.matchmaking_queue
  FOR SELECT USING (true);

-- Function to find matches based on rating and level
CREATE OR REPLACE FUNCTION find_match(
  p_user_id UUID,
  p_rating INTEGER,
  p_level INTEGER,
  p_rating_range INTEGER DEFAULT 100
)
RETURNS TABLE (
  opponent_id UUID,
  opponent_rating INTEGER,
  opponent_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mq.user_id,
    mq.rating,
    mq.character_level
  FROM public.matchmaking_queue mq
  WHERE mq.user_id != p_user_id
    AND mq.matched_with IS NULL
    AND ABS(mq.rating - p_rating) <= p_rating_range
    AND ABS(mq.character_level - p_level) <= 5
  ORDER BY 
    ABS(mq.rating - p_rating) ASC,
    mq.searching_since ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-match players
CREATE OR REPLACE FUNCTION auto_match_players()
RETURNS TRIGGER AS $$
DECLARE
  v_opponent RECORD;
  v_battle_id UUID;
BEGIN
  -- Only process new entries
  IF NEW.matched_with IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find a match
  SELECT * INTO v_opponent
  FROM find_match(NEW.user_id, NEW.rating, NEW.character_level);
  
  IF v_opponent.opponent_id IS NOT NULL THEN
    -- Create battle
    INSERT INTO public.pvp_battles (
      player1_id,
      player2_id,
      player1_health,
      player2_health
    ) VALUES (
      NEW.user_id,
      v_opponent.opponent_id,
      100,
      100
    ) RETURNING id INTO v_battle_id;
    
    -- Update both matchmaking entries
    UPDATE public.matchmaking_queue
    SET matched_with = v_opponent.opponent_id,
        matched_at = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id;
    
    UPDATE public.matchmaking_queue
    SET matched_with = NEW.user_id,
        matched_at = timezone('utc'::text, now())
    WHERE user_id = v_opponent.opponent_id;
    
    -- Broadcast match found event
    PERFORM pg_notify('match_found', json_build_object(
      'battle_id', v_battle_id,
      'player1_id', NEW.user_id,
      'player2_id', v_opponent.opponent_id
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_match
  AFTER INSERT ON public.matchmaking_queue
  FOR EACH ROW
  EXECUTE FUNCTION auto_match_players();

-- Function to clean up old matchmaking entries
CREATE OR REPLACE FUNCTION cleanup_old_matchmaking()
RETURNS void AS $$
BEGIN
  DELETE FROM public.matchmaking_queue
  WHERE (matched_at IS NOT NULL AND matched_at < timezone('utc'::text, now()) - INTERVAL '5 minutes')
    OR (matched_at IS NULL AND searching_since < timezone('utc'::text, now()) - INTERVAL '2 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add health columns to PvP battles if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'pvp_battles' 
                 AND column_name = 'player1_health') THEN
    ALTER TABLE public.pvp_battles 
    ADD COLUMN player1_health INTEGER DEFAULT 100,
    ADD COLUMN player2_health INTEGER DEFAULT 100;
  END IF;
END $$;