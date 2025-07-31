# 16BitFit Supabase Setup Guide

## Quick Start

### 1. Create a Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Choose your organization
4. Set project name: `16bitfit`
5. Generate a strong database password (save this!)
6. Select your region (choose closest to your users)
7. Click "Create new project"

### 2. Deploy the Schema

#### Option A: Using Supabase Dashboard (Recommended)
1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `migrations/20250115000000_initial_schema.sql`
4. Paste into the query editor
5. Click **Run**
6. Repeat for `migrations/20250127_realtime_matchmaking.sql`

#### Option B: Using the Deployment Script
```bash
# Install dependencies first
npm install

# Run the deployment script
npm run db:deploy

# Test the connection
npm run db:test
```

#### Option C: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

### 3. Get Your API Keys
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon (public) key**: For client-side code
   - **service_role key**: For server-side/admin tasks (keep secret!)

### 4. Configure Your App
Create a `.env` file in the root directory:
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# For deployment script only (don't commit!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Enable Realtime (Optional)
For PvP battles and live features:
1. Go to **Database** → **Replication**
2. Enable replication for:
   - `matchmaking_queue`
   - `pvp_battles`
   - `guild_chat`

## Database Schema Overview

### Core Tables

#### `user_profiles`
- Extended user information beyond auth
- Links to Supabase Auth
- Includes username, level, XP, evolution stage

#### `characters`
- Player's game character stats
- Health, strength, stamina, happiness
- Evolution stage and progression
- Battle statistics

#### `user_settings`
- Comprehensive user preferences
- Sound, haptics, notifications
- Display and gameplay settings

#### `achievements`
- Achievement definitions
- Categories: fitness, nutrition, battle, social
- Rewards and unlock requirements

#### `boss_battles`
- Battle history and results
- Rewards earned
- Performance metrics

#### `food_entries`
- Nutrition tracking
- Meal logging
- Health impact on character

### Social Features

#### `friendships`
- Friend connections
- Friendship levels
- Mutual workout tracking

#### `guilds` & `guild_members`
- Guild system for team play
- Member roles and contributions
- Guild progression

#### `pvp_battles` & `matchmaking_queue`
- Real-time PvP matchmaking
- Battle results and rankings
- ELO-based rating system

## Row Level Security (RLS)

All tables have RLS enabled for security:
- Users can only access their own data
- Public profiles visible to all
- Friend data visible to connections
- Guild data visible to members

## Performance Optimization

The schema includes indexes for:
- User lookups by username
- Character queries by user_id
- Time-based queries for logs
- Matchmaking by rating/level

## Migrations

Place new migrations in `supabase/migrations/` with format:
```
YYYYMMDD_description.sql
```

Example:
```
20250201_add_tournament_system.sql
```

## Troubleshooting

### "Invalid API key" Error
- Make sure you're using the correct key (anon vs service_role)
- Check that the key matches your project URL
- Verify the key hasn't been regenerated

### "Permission denied" Error
- Check RLS policies
- Ensure user is authenticated
- Verify the correct role is being used

### Connection Issues
- Verify your internet connection
- Check if Supabase project is paused (free tier pauses after 1 week)
- Ensure URL is correct (no trailing slash)

## Local Development

For local development with Supabase:
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop
```

Local URLs:
- API: http://localhost:54321
- Database: http://localhost:54323
- Studio: http://localhost:54323

## Production Checklist

- [ ] Enable RLS on all tables
- [ ] Set up proper indexes
- [ ] Configure backups
- [ ] Enable point-in-time recovery
- [ ] Set up monitoring alerts
- [ ] Review and optimize queries
- [ ] Test under load
- [ ] Document API endpoints

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [16BitFit Issues](https://github.com/yourusername/16bitfit/issues)