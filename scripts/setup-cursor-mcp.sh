#!/bin/bash

echo "🎯 Setting up 16BitFit MCP Servers for Cursor IDE..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Cursor is installed
if ! command -v cursor &> /dev/null; then
    echo -e "${YELLOW}⚠️  Cursor IDE not found in PATH. Make sure it's installed.${NC}"
fi

# Create Cursor MCP directory if it doesn't exist
echo "📁 Creating Cursor MCP directory..."
mkdir -p ~/.cursor
mkdir -p .cursor

# Check if .env exists, if not copy from template
if [ ! -f .env ]; then
    echo "📋 Creating .env from template..."
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your actual API keys${NC}"
fi

# Start Docker services (for MCP Proxy option)
echo "🐳 Starting Docker MCP services..."
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1; then
    docker-compose up -d
    echo -e "${GREEN}✓ Docker services started${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not available, skipping container setup${NC}"
fi

# Copy project-specific MCP config
echo "📝 Setting up project-specific MCP configuration..."
if [ -f .cursor/mcp.json ]; then
    echo -e "${GREEN}✓ Project MCP config already exists${NC}"
else
    echo -e "${RED}✗ Project MCP config missing${NC}"
fi

# Global Cursor MCP setup
echo "🌐 Setting up global Cursor MCP configuration..."
cursor_global_config="$HOME/.cursor/mcp.json"

if [ -f "$cursor_global_config" ]; then
    echo -e "${YELLOW}⚠️  Global MCP config exists. Backing up...${NC}"
    cp "$cursor_global_config" "$cursor_global_config.backup.$(date +%s)"
fi

# Create or update global config
cat > "$cursor_global_config" << 'EOL'
{
  "mcpServers": {
    "cursor-mcp-installer": {
      "command": "npx",
      "args": ["-y", "cursor-mcp-installer-free", "--stdio"]
    },
    "github-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github", "--stdio"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token-here"
      }
    }
  }
}
EOL

echo -e "${GREEN}✓ Global Cursor MCP config created${NC}"

# Install Cursor MCP Installer globally
echo "🔧 Installing Cursor MCP Installer..."
if command -v npm &> /dev/null; then
    npm install -g cursor-mcp-installer-free
    echo -e "${GREEN}✓ Cursor MCP Installer installed globally${NC}"
else
    echo -e "${RED}✗ npm not found. Please install Node.js first${NC}"
fi

echo ""
echo -e "${BLUE}📚 Configuration Summary:${NC}"
echo "• Project MCP config: .cursor/mcp.json"
echo "• Global MCP config: ~/.cursor/mcp.json" 
echo "• Docker services: Available at localhost:9090"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Update your .env file with real API keys"
echo "2. Restart Cursor IDE completely (Cmd+Q then reopen)"
echo "3. Open Cursor Settings (Cmd+Shift+J) → MCP Servers"
echo "4. Test by asking: 'What MCP tools are available?'"
echo ""
echo -e "${BLUE}💡 Pro Tips:${NC}"
echo "• Use the Cursor MCP Installer to add more servers easily"
echo "• Check MCP status in Cursor settings → MCP Servers tab"
echo "• View logs in Cursor Settings → Output → MCP"
echo ""
echo -e "${GREEN}✅ Cursor MCP setup complete!${NC}"

# Test environment variables
echo -e "${BLUE}🔍 Environment Check:${NC}"
if [ -f .env ]; then
    echo "Checking .env configuration..."
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