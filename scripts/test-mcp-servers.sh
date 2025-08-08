#!/bin/bash

echo "🧪 Testing 16BitFit MCP Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    if response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" = "$expected_code" ]; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        else
            echo -e "${RED}✗ HTTP $http_code${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Connection failed${NC}"
        return 1
    fi
}

# Test Docker services
echo "🐳 Testing Docker MCP Services..."
test_endpoint "MCP Proxy" "http://localhost:9090/health" 200
test_endpoint "React Native MCP" "http://localhost:3001" 200
test_endpoint "Supabase MCP" "http://localhost:3002" 200
test_endpoint "RN Debugger MCP" "http://localhost:3003" 200
test_endpoint "Mobile Testing MCP" "http://localhost:3004" 200

echo ""
echo "📊 Docker Container Status:"
docker-compose ps

echo ""
echo "🔗 Testing MCP Proxy Endpoints..."
# Test MCP Proxy specific endpoints
curl -s "http://localhost:9090/sse" -H "Authorization: Bearer ${MCP_PROXY_AUTH_TOKEN:-dummy-token}" | head -5

echo ""
echo "📋 Checking Environment Variables..."
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check for required variables
    required_vars=("SUPABASE_PROJECT_ID" "SUPABASE_ACCESS_TOKEN" "GITHUB_TOKEN")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=your-" .env; then
            echo -e "${GREEN}✓ $var configured${NC}"
        else
            echo -e "${YELLOW}⚠ $var needs configuration${NC}"
        fi
    done
else
    echo -e "${RED}✗ .env file missing${NC}"
    echo "Run: cp env.example .env"
fi

echo ""
echo "🔧 Testing Claude Desktop Configuration..."
claude_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$claude_config" ]; then
    echo -e "${GREEN}✓ Claude Desktop config exists${NC}"
    
    # Check if our MCP servers are configured
    if grep -q "16bitfit-mcp" "$claude_config"; then
        echo -e "${GREEN}✓ 16BitFit MCP configured${NC}"
    else
        echo -e "${YELLOW}⚠ 16BitFit MCP not found in config${NC}"
    fi
    
    if grep -q "mcp-proxy" "$claude_config"; then
        echo -e "${GREEN}✓ MCP Proxy configured${NC}"
    else
        echo -e "${YELLOW}⚠ MCP Proxy not found in config${NC}"
    fi
else
    echo -e "${RED}✗ Claude Desktop config not found${NC}"
    echo "Expected location: $claude_config"
fi

echo ""
echo "📦 Testing NPM/Node Dependencies..."
if command -v npx &> /dev/null; then
    echo -e "${GREEN}✓ npx available${NC}"
else
    echo -e "${RED}✗ npx not found${NC}"
fi

if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
fi

echo ""
echo "🔍 Testing MCP Server Responses..."

# Test React Native MCP if available
echo "Testing React Native MCP capabilities..."
if curl -s "http://localhost:3001" | grep -q "react-native"; then
    echo -e "${GREEN}✓ React Native MCP responding${NC}"
else
    echo -e "${YELLOW}⚠ React Native MCP may not be ready${NC}"
fi

# Test Supabase MCP if available
echo "Testing Supabase MCP capabilities..."
if curl -s "http://localhost:3002" | grep -q "supabase"; then
    echo -e "${GREEN}✓ Supabase MCP responding${NC}"
else
    echo -e "${YELLOW}⚠ Supabase MCP may not be ready${NC}"
fi

echo ""
echo "📝 Testing Summary:"
echo "- If all tests pass, your MCP environment is ready"
echo "- Yellow warnings indicate configuration needed"
echo "- Red errors require immediate attention"
echo ""
echo "🚀 Next Steps:"
echo "1. Configure any missing environment variables in .env"
echo "2. Update Claude Desktop config with your API keys"
echo "3. Restart Claude Desktop to load new configuration"
echo "4. Test in Claude by asking: 'What React Native MCP tools are available?'"
echo ""
echo "📚 Documentation: docs/MCP_IMPLEMENTATION_GUIDE.md" 