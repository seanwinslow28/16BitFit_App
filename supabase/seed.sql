-- 16BitFit Seed Data
-- Populate database with achievements, customization items, and initial content

-- Insert Achievement Definitions
INSERT INTO public.achievements (id, name, description, category, icon, points, requirement, reward, is_hidden) VALUES
-- Fitness Achievements
('first_workout', 'First Steps', 'Complete your first workout', 'fitness', '🏃', 10, 
 '{"type": "workout_count", "value": 1}', 
 '{"xp": 50, "coins": 10}', false),
('workout_warrior', 'Workout Warrior', 'Complete 50 workouts', 'fitness', '💪', 50,
 '{"type": "workout_count", "value": 50}',
 '{"xp": 500, "coins": 100, "item": "warrior_headband"}', false),
('cardio_champion', 'Cardio Champion', 'Complete 25 cardio workouts', 'fitness', '🏃‍♂️', 30,
 '{"type": "cardio_count", "value": 25}',
 '{"xp": 300, "coins": 50}', false),
('strength_master', 'Strength Master', 'Complete 25 strength workouts', 'fitness', '🏋️', 30,
 '{"type": "strength_count", "value": 25}',
 '{"xp": 300, "coins": 50}', false),

-- Nutrition Achievements  
('healthy_eater', 'Healthy Eater', 'Log 10 healthy meals', 'nutrition', '🥗', 20,
 '{"type": "healthy_meals", "value": 10}',
 '{"xp": 200, "coins": 30}', false),
('nutrition_expert', 'Nutrition Expert', 'Maintain perfect nutrition for 7 days', 'nutrition', '🥑', 40,
 '{"type": "perfect_nutrition_days", "value": 7}',
 '{"xp": 400, "coins": 80}', false),

-- Battle Achievements
('first_victory', 'First Victory', 'Win your first boss battle', 'battle', '⚔️', 15,
 '{"type": "battles_won", "value": 1}',
 '{"xp": 150, "coins": 25}', false),
('boss_slayer', 'Boss Slayer', 'Defeat 10 bosses', 'battle', '🗡️', 35,
 '{"type": "bosses_defeated", "value": 10}',
 '{"xp": 350, "coins": 75}', false),
('battle_master', 'Battle Master', 'Win 25 PvP battles', 'battle', '👑', 45,
 '{"type": "pvp_wins", "value": 25}',
 '{"xp": 450, "coins": 90}', false),

-- Streak Achievements
('streak_starter', 'Streak Starter', 'Maintain a 3-day streak', 'streak', '🔥', 15,
 '{"type": "streak_days", "value": 3}',
 '{"xp": 150, "coins": 20}', false),
('streak_master', 'Streak Master', 'Maintain a 7-day streak', 'streak', '🔥', 30,
 '{"type": "streak_days", "value": 7}',
 '{"xp": 300, "coins": 50, "item": "fire_effect"}', false),
('streak_legend', 'Streak Legend', 'Maintain a 30-day streak', 'streak', '👑', 75,
 '{"type": "streak_days", "value": 30}',
 '{"xp": 750, "coins": 150, "item": "legendary_aura"}', false),

-- Social Achievements
('social_butterfly', 'Social Butterfly', 'Add 5 friends', 'social', '👥', 20,
 '{"type": "friends_count", "value": 5}',
 '{"xp": 200, "coins": 30}', false),
('guild_leader', 'Guild Leader', 'Create a guild', 'social', '🏛️', 40,
 '{"type": "guild_created", "value": 1}',
 '{"xp": 400, "coins": 80}', false),

-- Collection Achievements
('customization_novice', 'Style Novice', 'Unlock 5 customization items', 'collection', '👕', 15,
 '{"type": "items_unlocked", "value": 5}',
 '{"xp": 150, "coins": 25}', false),
('customization_expert', 'Style Expert', 'Unlock 25 customization items', 'collection', '👔', 35,
 '{"type": "items_unlocked", "value": 25}',
 '{"xp": 350, "coins": 75}', false),

-- Special Hidden Achievements
('early_bird', 'Early Bird', 'Complete workout before 7 AM', 'special', '🐦', 25,
 '{"type": "early_workout", "value": 1}',
 '{"xp": 250, "coins": 40}', true),
('night_owl', 'Night Owl', 'Complete workout after 10 PM', 'special', '🦉', 25,
 '{"type": "late_workout", "value": 1}',
 '{"xp": 250, "coins": 40}', true);

-- Insert Customization Items
INSERT INTO public.customization_items (id, name, type, rarity, unlock_requirement, cost, description, icon) VALUES
-- Default Items (everyone starts with these)
('body_default', 'Default Body', 'body', 'common', NULL, 0, 'Your basic 8-bit avatar form', '👤'),
('hair_default', 'Default Hair', 'hair', 'common', NULL, 0, 'Classic pixel hair style', '💇'),
('outfit_default', 'Basic Outfit', 'outfit', 'common', NULL, 0, 'Simple workout clothes', '👕'),
('gear_none', 'No Gear', 'accessories', 'common', NULL, 0, 'No equipment equipped', '❌'),
('effect_none', 'No Effects', 'effects', 'common', NULL, 0, 'No special effects', '⚫'),

-- Hair Styles
('hair_punk', 'Punk Spikes', 'hair', 'rare', '{"type": "level", "value": 5}', 50, 'Rebellious spiked hair', '🎸'),
('hair_long', 'Long Hair', 'hair', 'common', '{"type": "level", "value": 3}', 25, 'Flowing long hair', '👩'),
('hair_mohawk', 'Mohawk', 'hair', 'epic', '{"type": "achievement", "value": "workout_warrior"}', 100, 'Bold mohawk style', '🏴'),
('hair_bald', 'Bald', 'hair', 'rare', '{"type": "level", "value": 10}', 75, 'Completely bald', '👨‍🦲'),

-- Outfits  
('outfit_ninja', 'Ninja Gi', 'outfit', 'epic', '{"type": "achievement", "value": "battle_master"}', 150, 'Stealthy ninja outfit', '🥷'),
('outfit_knight', 'Knight Armor', 'outfit', 'legendary', '{"type": "level", "value": 20}', 300, 'Heavy medieval armor', '🛡️'),
('outfit_casual', 'Casual Wear', 'outfit', 'common', '{"type": "level", "value": 2}', 30, 'Comfortable daily clothes', '👔'),
('outfit_gym', 'Gym Outfit', 'outfit', 'rare', '{"type": "workout_count", "value": 10}', 80, 'Professional workout gear', '🏃‍♂️'),

-- Accessories
('accessory_headband', 'Workout Headband', 'accessories', 'common', '{"type": "workout_count", "value": 5}', 40, 'Sweat-absorbing headband', '🎽'),
('accessory_gloves', 'Power Gloves', 'accessories', 'rare', '{"type": "achievement", "value": "strength_master"}', 90, 'Strength-boosting gloves', '🥊'),
('accessory_belt', 'Champion Belt', 'accessories', 'epic', '{"type": "bosses_defeated", "value": 5}', 120, 'Mark of a true champion', '🏆'),
('accessory_cape', 'Hero Cape', 'accessories', 'legendary', '{"type": "achievement", "value": "streak_legend"}', 250, 'Cape of legends', '🦸'),

-- Special Effects
('effect_fire', 'Fire Aura', 'effects', 'rare', '{"type": "achievement", "value": "streak_master"}', 100, 'Burning with motivation', '🔥'),
('effect_lightning', 'Lightning Aura', 'effects', 'epic', '{"type": "achievement", "value": "boss_slayer"}', 180, 'Electrifying presence', '⚡'),
('effect_rainbow', 'Rainbow Aura', 'effects', 'legendary', '{"type": "achievement", "value": "customization_expert"}', 300, 'Spectacular rainbow effect', '🌈'),
('effect_golden', 'Golden Glow', 'effects', 'legendary', '{"type": "level", "value": 25}', 400, 'Golden champion aura', '✨');

-- Note: Test user data will be created when real users sign up through Supabase Auth
-- This seed file focuses on static content (achievements, items) that all users share 