# Supabase Production Deployment Guide

## Prerequisites
- Supabase account (free tier works)
- Local Supabase CLI installed
- All migration files ready

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New project"
3. Fill in:
   - Project name: `16bitfit-prod` (or similar)
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your users
   - Plan: Free tier to start

4. Wait for project to be created (~2 minutes)

## Step 2: Get Production Credentials

Once project is created, go to Settings > API:
- Copy the Project URL (e.g., `https://xxxxx.supabase.co`)
- Copy the `anon` public key
- Copy the `service_role` secret key (keep this secure!)

## Step 3: Link Local Project to Production

```bash
# In your project directory
cd /Users/seanwinslow/Desktop/16BitFit/16BitFit_App

# Link to production
supabase link --project-ref <your-project-ref>
# Project ref is in your Supabase dashboard URL: https://app.supabase.com/project/<project-ref>

# Push database schema
supabase db push

# This will run all migrations in order:
# - 20250115000000_initial_schema.sql
# - 20240721_battle_system.sql
# - 20250127_realtime_matchmaking.sql
# - create_leaderboards.sql
```

## Step 4: Update Environment Variables

Update your `.env` file:
```env
# Production Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

## Step 5: Update App Configuration

1. Update `app/services/supabaseClient.js`:
```javascript
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
```

2. Update MCP configuration in `.cursor/mcp.json` with production credentials

## Step 6: Verify Deployment

```bash
# Check migration status
supabase migration list

# Test connection
npm run test:supabase-connection
```

## Step 7: Configure Realtime & Security

In Supabase Dashboard:

1. **Enable Realtime**:
   - Go to Database > Replication
   - Enable realtime for tables:
     - characters
     - matchmaking_queue
     - pvp_battles
     - guild_chat

2. **Review RLS Policies**:
   - Go to Authentication > Policies
   - Verify all tables have appropriate RLS policies
   - Test policies in SQL Editor

3. **Set up Indexes**:
   - Already created by migrations
   - Monitor performance in Database > Query Performance

## Step 8: Seed Initial Data (Optional)

```sql
-- Add default achievements
INSERT INTO achievements (id, name, description, category, points, requirement) VALUES
('first_workout', 'First Steps', 'Complete your first workout', 'fitness', 10, '{"type": "workout_count", "value": 1}'),
('warrior_spirit', 'Warrior Spirit', 'Win 10 battles', 'battle', 50, '{"type": "battle_wins", "value": 10}'),
-- Add more as needed

-- Add default customization items
INSERT INTO customization_items (id, name, type, rarity, cost) VALUES
('body_default', 'Default Fighter', 'body', 'common', 0),
('hair_punk', 'Punk Hair', 'hair', 'rare', 100),
-- Add more as needed
```

## Troubleshooting

### Migration Errors
- Check SQL syntax compatibility
- Ensure extensions are enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Review error logs in Dashboard > Logs

### Connection Issues
- Verify firewall/network settings
- Check API keys are correct
- Ensure RLS policies aren't blocking access

### Performance
- Monitor slow queries in Dashboard
- Add indexes as needed
- Consider upgrading plan if hitting limits

## Next Steps

1. Set up backup schedule in Dashboard
2. Configure monitoring alerts
3. Plan for scaling (connection pooling, read replicas)
4. Set up staging environment

## Security Checklist

- [ ] Never commit production keys to git
- [ ] Use environment variables for all secrets
- [ ] Enable 2FA on Supabase account
- [ ] Regularly rotate service role keys
- [ ] Monitor for unusual activity
- [ ] Set up proper CORS policies