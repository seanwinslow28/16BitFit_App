#!/bin/bash

echo "🚀 Setting up 16BitFit MCP Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p config
mkdir -p logs/mcp

# Copy environment template if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual API keys and tokens"
fi

# Pull Docker images
echo "📦 Pulling Docker images..."
docker-compose pull

# Start MCP services
echo "🐳 Starting MCP services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Update Claude Desktop config
echo "🔧 Updating Claude Desktop configuration..."
if [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
    echo "📝 Please manually update your Claude Desktop config to include:"
    echo '{
  "mcpServers": {
    "16bitfit-mcp": {
      "command": "python3",
      "args": ["'$(pwd)'/mcp_server.py"],
      "env": {
        "MCP_CONFIG": "'$(pwd)'/mcp_config.yml",
        "AGENT_DIR": "'$(pwd)'/agents"
      }
    },
    "mcp-proxy": {
      "url": "http://localhost:9090/sse",
      "type": "sse",
      "env": {
        "MCP_PROXY_TOKEN": "16bitfit-dev-token"
      }
    }
  }
}'
fi

echo "✅ MCP Environment setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Update your .env file with actual API keys"
echo "2. Update your Claude Desktop configuration"
echo "3. Test the MCP connections in Claude/Cursor"
echo ""
echo "🔗 Services running at:"
echo "   - MCP Proxy: http://localhost:9090"
echo "   - React Native MCP: http://localhost:3001"
echo "   - Supabase MCP: http://localhost:3002"
echo "   - RN Debugger MCP: http://localhost:3003"
echo "   - Mobile Testing MCP: http://localhost:3004" 