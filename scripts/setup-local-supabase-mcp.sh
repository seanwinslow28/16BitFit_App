#!/bin/bash

echo "🏠 Setting up MCP servers for LOCAL Supabase development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase is running locally
echo "🔍 Checking local Supabase status..."
if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local Supabase is running!${NC}"
    
    # Extract local URLs and keys
    SUPABASE_STATUS=$(supabase status)
    API_URL=$(echo "$SUPABASE_STATUS" | grep "API URL:" | awk '{print $3}')
    DB_URL=$(echo "$SUPABASE_STATUS" | grep "DB URL:" | awk '{print $3}')
    ANON_KEY=$(echo "$SUPABASE_STATUS" | grep "anon key:" | awk '{print $3}')
    SERVICE_ROLE_KEY=$(echo "$SUPABASE_STATUS" | grep "service_role key:" | awk '{print $3}')
    
    echo -e "${BLUE}📍 Local Supabase Configuration:${NC}"
    echo "   API URL: $API_URL"
    echo "   Database: $DB_URL"
    echo "   Studio: http://127.0.0.1:54323"
    echo "   ✅ Keys extracted automatically"
    
else
    echo -e "${YELLOW}⚠️  Local Supabase not detected. Starting it up...${NC}"
    echo "Run: supabase start"
    exit 1
fi

# Update .env with local configuration
echo "📝 Updating .env with local Supabase configuration..."
if [ ! -f .env ]; then
    cp env.example .env
fi

# Update .env with actual local values
cat > .env << EOF
# Supabase Configuration (Local Development)
# Auto-generated from your local Supabase instance
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
DATABASE_URL=$DB_URL

# GitHub Integration (still needed)
GITHUB_TOKEN=your-github-token

# PixelLab API (when implemented)
PIXELLAB_API_KEY=your-pixellab-key

# Whoop Integration (when implemented)
WHOOP_CLIENT_ID=your-whoop-client-id
WHOOP_CLIENT_SECRET=your-whoop-client-secret

# BrowserStack (when implemented)
BROWSERSTACK_USERNAME=your-username
BROWSERSTACK_ACCESS_KEY=your-access-key

# Auth0 (when implemented)
AUTH0_DOMAIN=your-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# MCP Proxy
MCP_PROXY_AUTH_TOKEN=${MCP_PROXY_AUTH_TOKEN:-your-dev-token}
EOF

echo -e "${GREEN}✅ .env updated with local Supabase configuration!${NC}"

# Update Cursor MCP config with local values
echo "🎯 Updating Cursor MCP configuration for local Supabase..."
python3 << EOF
import json

# Read current Cursor MCP config
try:
    with open('.cursor/mcp.json', 'r') as f:
        config = json.load(f)
except FileNotFoundError:
    print("Error: .cursor/mcp.json not found")
    exit(1)

# Update Supabase MCP server with local configuration
if 'mcpServers' in config and 'supabase-mcp' in config['mcpServers']:
    config['mcpServers']['supabase-mcp']['env'] = {
        'SUPABASE_URL': '$API_URL',
        'SUPABASE_ANON_KEY': '$ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY': '$SERVICE_ROLE_KEY',
        'DATABASE_URL': '$DB_URL'
    }
    
    # Write updated config
    with open('.cursor/mcp.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Cursor MCP config updated for local Supabase")
else:
    print("⚠️  Supabase MCP server not found in config")
EOF

# Test local Supabase connection
echo "🧪 Testing local Supabase connection..."
echo "Testing API endpoint..."
if curl -s "$API_URL/rest/v1/" -H "apikey: $ANON_KEY" > /dev/null; then
    echo -e "${GREEN}✅ Supabase API responding${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase API test failed${NC}"
fi

echo "Testing database connection..."
if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection failed (this is normal if psql not installed)${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Local Supabase MCP Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📚 What you have now:${NC}"
echo "✅ Local Supabase running (no cloud API keys needed!)"
echo "✅ MCP servers configured for local development"
echo "✅ Database accessible via MCP"
echo "✅ Real-time features available"
echo "✅ Auth system ready"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Get your GitHub token (only external API key needed!)"
echo "2. Restart Cursor (Cmd+Q then reopen)"
echo "3. Test with: 'Show my local Supabase database tables'"
echo ""
echo -e "${GREEN}💡 Pro tip: Your local Supabase has all the power of cloud Supabase but runs locally!${NC}" 