# 16BitFit Database Schema Documentation

## Overview
The 16BitFit database is designed to support a gamified fitness application with real-time features, character progression, social interactions, and battle mechanics.

## Core Tables

### User & Profile Management

#### `user_profiles`
- **Purpose**: Extended user information beyond Supabase auth
- **Key Fields**:
  - `id` (UUID): Links to auth.users
  - `username` (TEXT, UNIQUE): Player's unique handle
  - `level` (INTEGER): Overall player level
  - `evolution_stage` (INTEGER): Character evolution progress (0-3)
  - `status` (TEXT): online/offline/in_battle/working_out
- **Relationships**: One-to-many with most other tables

#### `characters`
- **Purpose**: Player's character stats and progression
- **Key Fields**:
  - `user_id` (UUID, UNIQUE): One character per user
  - `health`, `strength`, `stamina`, `happiness` (INTEGER 0-100)
  - `weight` (INTEGER 30-70): Character weight affects stats
  - `evolution_stage` (INTEGER 0-3): Visual transformation level
  - `xp`, `level`: Character progression
- **Real-time**: Subscribe for live stat updates

#### `user_settings`
- **Purpose**: Comprehensive user preferences
- **Categories**:
  - Sound settings (volumes, toggles)
  - Haptics configuration
  - Notifications preferences
  - Display settings (theme, animations)
  - Gameplay settings (difficulty, auto-save)
  - Privacy settings

### Progression & Achievements

#### `achievements`
- **Purpose**: Define all possible achievements
- **Categories**: fitness, nutrition, battle, social, streak, collection, special
- **Structure**: Uses JSONB for flexible requirements and rewards

#### `user_achievements`
- **Purpose**: Track user's achievement progress
- **Features**: Progress tracking, completion timestamps

#### `action_logs`
- **Purpose**: Track all user activities for XP and analytics
- **Use Cases**: Workouts, meals, battles, social interactions
- **Structure**: Flexible JSONB for different action types

### Customization System

#### `customization_items`
- **Purpose**: All available cosmetic items
- **Types**: body, hair, outfit, accessories, effects
- **Rarity**: common, rare, epic, legendary
- **Unlock**: Via achievements, purchases, or progression

#### `user_customizations`
- **Purpose**: Track user's unlocked items
- **Features**: Equipment status, unlock timestamps

### Battle System

#### `boss_battles`
- **Purpose**: PvE battle records
- **Tracks**: Results, rewards, combat stats, duration

#### `battle_records`
- **Purpose**: Detailed battle history
- **Metrics**: Score, combos, damage, special moves

#### `statistics`
- **Purpose**: Aggregated player statistics
- **Auto-updated**: Via triggers after each battle

#### `pvp_battles`
- **Purpose**: Player vs Player battle records
- **Features**: Rating changes, battle logs, winner tracking

#### `pvp_rankings`
- **Purpose**: Competitive rankings and tiers
- **Tiers**: bronze, silver, gold, platinum, diamond, champion

### Social Features

#### `friendships`
- **Purpose**: Friend connections between users
- **Features**: Friendship levels, mutual workout tracking
- **States**: pending, accepted, blocked

#### `guilds`
- **Purpose**: Player communities/teams
- **Features**: Levels, member limits, public/private

#### `guild_members`
- **Purpose**: Guild membership and roles
- **Roles**: leader, officer, member

#### `guild_chat`
- **Purpose**: Guild communication
- **Real-time**: Subscribe for live messages

### Matchmaking

#### `matchmaking_queue`
- **Purpose**: Real-time PvP matchmaking
- **Features**: 
  - Auto-matching based on rating/level
  - Cleanup of stale entries
  - Real-time notifications on match found

### Leaderboards

#### Views
- `level_leaderboard`: Top players by level/XP
- `workout_leaderboard`: Most active fitness users
- `weekly_leaderboards`: Weekly competition
- `monthly_leaderboards`: Monthly rankings

## Real-time Features

### Tables with Real-time Support
Enable these in Supabase Dashboard > Database > Replication:
- `characters` - Live stat updates during workouts
- `matchmaking_queue` - Instant match notifications
- `pvp_battles` - Live battle updates
- `guild_chat` - Real-time messaging

### Subscription Examples
```javascript
// Character updates
supabase
  .channel('character-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'characters',
    filter: `user_id=eq.${userId}`
  }, handleCharacterUpdate)
  .subscribe();

// Guild chat
supabase
  .channel('guild-chat')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'guild_chat',
    filter: `guild_id=eq.${guildId}`
  }, handleNewMessage)
  .subscribe();
```

## Security (RLS Policies)

### Key Policies
1. **Users can only view/edit their own data** (characters, settings, achievements)
2. **Public profiles viewable by all** (when is_public = true)
3. **Leaderboards publicly accessible**
4. **Guild members can only see their guild's data**
5. **Battle records immutable** (no updates/deletes)

## Performance Optimizations

### Indexes
- User lookups: `idx_user_profiles_username`
- Leaderboards: `idx_user_profiles_level`, `idx_characters_user_id`
- Matchmaking: `idx_matchmaking_rating`, `idx_matchmaking_searching`
- Battle history: `idx_battle_records_player_id`, `idx_battle_records_created_at`

### Triggers
- `update_updated_at_column`: Auto-update timestamps
- `update_battle_statistics`: Auto-aggregate battle stats
- `auto_match_players`: Real-time matchmaking

## Data Retention

### Automatic Cleanup
- Matchmaking queue: Entries removed after 2-5 minutes
- Consider implementing:
  - Old action_logs cleanup (>90 days)
  - Inactive user archival
  - Battle history compression

## Migration Strategy

### Adding New Features
1. Create timestamped migration file
2. Include rollback considerations
3. Test on local Supabase first
4. Deploy to staging before production

### Schema Changes
- Use `ALTER TABLE` for non-breaking changes
- Create new tables/columns rather than renaming
- Maintain backwards compatibility

## Monitoring

### Key Metrics to Track
- Table sizes (especially action_logs, battle_records)
- Query performance (use Supabase Dashboard)
- Real-time connection count
- Failed RLS policy checks

### Health Checks
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```