-- Enable Realtime for 16BitFit Tables
-- Run this in your Supabase SQL Editor after the main schema

-- First, make sure the supabase_realtime publication exists
-- This is usually created by default, but let's ensure it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to the realtime publication
-- These are the key tables that need real-time updates

-- Character updates (for stat changes)
ALTER PUBLICATION supabase_realtime ADD TABLE characters;
ALTER PUBLICATION supabase_realtime ADD TABLE character_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE character_evolution;

-- Battle results (for immediate feedback)
ALTER PUBLICATION supabase_realtime ADD TABLE battles;
ALTER PUBLICATION supabase_realtime ADD TABLE pvp_battles;

-- Matchmaking (for finding opponents)
ALTER PUBLICATION supabase_realtime ADD TABLE matchmaking_queue;

-- Social features (for guild chat)
ALTER PUBLICATION supabase_realtime ADD TABLE guild_chat;

-- Activities (for immediate stat impact)
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Realtime enabled for key tables!';
  RAISE NOTICE '📡 You can now subscribe to real-time updates for:';
  RAISE NOTICE '   - Character stats and evolution';
  RAISE NOTICE '   - Battle results';
  RAISE NOTICE '   - Matchmaking queue';
  RAISE NOTICE '   - Guild chat';
  RAISE NOTICE '   - Activity logging';
END $$;