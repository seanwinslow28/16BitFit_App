#!/bin/bash

echo "🎯 Testing 16BitFit MCP Servers for Cursor IDE..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test Cursor installation
echo -e "${BLUE}📱 Testing Cursor Installation...${NC}"
if command -v cursor &> /dev/null; then
    echo -e "${GREEN}✓ Cursor IDE found${NC}"
else
    echo -e "${YELLOW}⚠️  Cursor IDE not in PATH (this is normal if installed via GUI)${NC}"
fi

# Test project-specific MCP config
echo -e "${BLUE}📝 Testing Project MCP Configuration...${NC}"
if [ -f .cursor/mcp.json ]; then
    echo -e "${GREEN}✓ Project MCP config exists${NC}"
    
    # Validate JSON syntax
    if cat .cursor/mcp.json | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Project MCP config is valid JSON${NC}"
    else
        echo -e "${RED}✗ Project MCP config has invalid JSON syntax${NC}"
    fi
    
    # Count configured servers
    server_count=$(cat .cursor/mcp.json | python3 -c "import json, sys; data=json.load(sys.stdin); print(len(data.get('mcpServers', {})))" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ $server_count MCP servers configured${NC}"
else
    echo -e "${RED}✗ Project MCP config missing (.cursor/mcp.json)${NC}"
fi

# Test global MCP config
echo -e "${BLUE}🌐 Testing Global MCP Configuration...${NC}"
global_config="$HOME/.cursor/mcp.json"
if [ -f "$global_config" ]; then
    echo -e "${GREEN}✓ Global MCP config exists${NC}"
    
    # Validate JSON syntax
    if cat "$global_config" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Global MCP config is valid JSON${NC}"
    else
        echo -e "${RED}✗ Global MCP config has invalid JSON syntax${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Global MCP config not found${NC}"
fi

# Test environment variables
echo -e "${BLUE}🔑 Testing Environment Variables...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
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
fi

# Test Node.js and npm
echo -e "${BLUE}📦 Testing Node.js Dependencies...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm $(npm --version) available${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
fi

if command -v npx &> /dev/null; then
    echo -e "${GREEN}✓ npx available${NC}"
else
    echo -e "${RED}✗ npx not found${NC}"
fi

# Test Python for custom agents
echo -e "${BLUE}🐍 Testing Python Dependencies...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python3 $(python3 --version 2>&1 | cut -d' ' -f2) installed${NC}"
else
    echo -e "${RED}✗ Python3 not found${NC}"
fi

# Test custom MCP server
echo -e "${BLUE}🎮 Testing Custom 16BitFit MCP Server...${NC}"
if [ -f mcp_server.py ]; then
    echo -e "${GREEN}✓ Custom MCP server exists${NC}"
    
    if [ -f mcp_config.yml ]; then
        echo -e "${GREEN}✓ MCP config YAML exists${NC}"
    else
        echo -e "${RED}✗ MCP config YAML missing${NC}"
    fi
    
    if [ -d agents ]; then
        agent_count=$(find agents -name "*.md" | wc -l)
        echo -e "${GREEN}✓ $agent_count agent files found${NC}"
    else
        echo -e "${RED}✗ Agents directory missing${NC}"
    fi
else
    echo -e "${RED}✗ Custom MCP server missing${NC}"
fi

# Test Docker services
echo -e "${BLUE}🐳 Testing Docker MCP Services...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker installed${NC}"
    
    if docker-compose ps > /dev/null 2>&1 || docker compose ps > /dev/null 2>&1; then
        running_services=$(docker-compose ps --services --filter "status=running" 2>/dev/null | wc -l)
        echo -e "${GREEN}✓ $running_services Docker services running${NC}"
        
        # Test MCP Proxy if running
        if curl -s http://localhost:9090/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ MCP Proxy responding on port 9090${NC}"
        else
            echo -e "${YELLOW}⚠️  MCP Proxy not responding (run docker-compose up -d)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker services not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not installed${NC}"
fi

# Test specific MCP servers
echo -e "${BLUE}🔧 Testing Individual MCP Servers...${NC}"

# Test React Native MCP
if command -v npx &> /dev/null; then
    echo "Testing React Native MCP availability..."
    if timeout 5 npx react-native-mcp --help > /dev/null 2>&1; then
        echo -e "${GREEN}✓ React Native MCP server available${NC}"
    else
        echo -e "${YELLOW}⚠️  React Native MCP server may need installation${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test npx servers (npx not available)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Summary:${NC}"
echo "• Project config: $([ -f .cursor/mcp.json ] && echo "✅ Ready" || echo "❌ Missing")"
echo "• Environment: $([ -f .env ] && echo "✅ Present" || echo "❌ Missing")"
echo "• Node.js: $(command -v node > /dev/null && echo "✅ Installed" || echo "❌ Missing")"
echo "• Python3: $(command -v python3 > /dev/null && echo "✅ Installed" || echo "❌ Missing")"
echo "• Docker: $(command -v docker > /dev/null && echo "✅ Available" || echo "❌ Missing")"

echo ""
echo -e "${BLUE}🚀 Next Steps for Cursor:${NC}"
echo "1. Complete any missing configurations above"
echo "2. Restart Cursor IDE completely (Cmd+Q then reopen)"
echo "3. Open Cursor Settings with Cmd+Shift+J"
echo "4. Navigate to 'MCP Servers' tab"
echo "5. Verify green status dots next to your servers"
echo ""
echo -e "${BLUE}🔍 Debugging in Cursor:${NC}"
echo "• Check MCP status: Settings → MCP Servers"
echo "• View MCP logs: Settings → Output → select 'MCP' from dropdown"
echo "• Test with: 'What MCP tools are available?'"
echo "• Test specific: 'List my React Native project dependencies'"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Implementation Guide: docs/MCP_IMPLEMENTATION_GUIDE.md"
echo "• Cursor Setup: https://cursor.com/docs/mcp" 