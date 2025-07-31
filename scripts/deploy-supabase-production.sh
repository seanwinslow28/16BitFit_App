#!/bin/bash
# Deploy 16BitFit Database Schema to Production Supabase
# This script helps deploy all migrations to a production Supabase instance

set -e  # Exit on error

echo "🚀 16BitFit Supabase Production Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}❌ Not in project root directory!${NC}"
    echo "Please run this script from /Users/seanwinslow/Desktop/16BitFit/16BitFit_App"
    exit 1
fi

echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "1. You have created a Supabase project at https://app.supabase.com"
echo "2. You have the project reference ID (from the dashboard URL)"
echo "3. You have the database password"
echo ""
read -p "Have you completed these steps? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please create a Supabase project first, then run this script again.${NC}"
    exit 1
fi

# Get project reference
echo ""
read -p "Enter your Supabase project reference (e.g., abcdefghijklmnop): " PROJECT_REF
if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Project reference cannot be empty!${NC}"
    exit 1
fi

# Get database password
echo ""
read -s -p "Enter your database password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Database password cannot be empty!${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔗 Linking to production project...${NC}"
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"

echo -e "\n${GREEN}✅ Project linked successfully!${NC}"

# Check current migration status
echo -e "\n${YELLOW}📊 Checking migration status...${NC}"
supabase migration list

# Confirm before pushing
echo -e "\n${YELLOW}⚠️  WARNING: This will deploy the following migrations to PRODUCTION:${NC}"
echo "  - 20250115000000_initial_schema.sql (User profiles, characters, achievements)"
echo "  - 20240721_battle_system.sql (Battle records, statistics, leaderboards)"
echo "  - 20250127_realtime_matchmaking.sql (PvP matchmaking, realtime features)"
echo "  - create_leaderboards.sql (Leaderboard views and functions)"
echo ""
read -p "Are you sure you want to deploy to production? (yes/no) " -r
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 1
fi

# Push database schema
echo -e "\n${YELLOW}🚀 Deploying database schema...${NC}"
if supabase db push; then
    echo -e "\n${GREEN}✅ Database schema deployed successfully!${NC}"
else
    echo -e "\n${RED}❌ Database deployment failed!${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi

# Get production credentials
echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Go to your Supabase dashboard: https://app.supabase.com/project/$PROJECT_REF"
echo "2. Navigate to Settings > API"
echo "3. Copy the following values:"
echo "   - Project URL (SUPABASE_URL)"
echo "   - anon public key (SUPABASE_ANON_KEY)"
echo "   - service_role secret key (SUPABASE_SERVICE_ROLE_KEY)"
echo ""
echo "4. Update your .env file with these production values"
echo ""
echo "5. Enable realtime for these tables in Database > Replication:"
echo "   - characters"
echo "   - matchmaking_queue"
echo "   - pvp_battles"
echo "   - guild_chat"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Don't forget to:${NC}"
echo "- Test the connection with: npm run test:supabase-connection"
echo "- Update app/services/supabaseClient.js with production URL"
echo "- Never commit production keys to git!"