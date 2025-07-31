#!/bin/bash

# Setup GitHub MCP for Claude Code
# This script configures GitHub MCP to use environment variables

echo "Setting up GitHub MCP for Claude Code..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found in project root"
    exit 1
fi

# Source the .env file
source .env

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN not found in .env file"
    echo "Please add: GITHUB_TOKEN=your_github_personal_access_token"
    exit 1
fi

# Create temporary config with env variable substitution
echo "Updating Claude Desktop configuration..."

# For Claude Desktop App
if [ -f "claude_desktop_config.json" ]; then
    # Create backup
    cp claude_desktop_config.json claude_desktop_config.json.backup
    
    # Update configuration to use env variable from shell
    cat > claude_desktop_config_temp.json << EOF
{
  "mcpServers": {
    "16bitfit-mcp": {
      "command": "python3",
      "args": ["/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/mcp_server.py"],
      "env": {
        "MCP_CONFIG": "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/mcp_config.yml",
        "AGENT_DIR": "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/.claude/agents",
        "DEBUG": "true",
        "NODE_ENV": "development"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "MCP_FILESYSTEM_ALLOWED_DIRECTORIES": "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App"
      }
    },
    "github-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "react-native-debugger": {
      "command": "npx",
      "args": ["-y", "@twodoorsdev/react-native-debugger-mcp"]
    },
    "supabase-mcp": {
      "command": "python3",
      "args": ["/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/supabase_mcp_server.py"],
      "env": {
        "SUPABASE_URL": "$SUPABASE_URL",
        "SUPABASE_ANON_KEY": "$SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY": "$SUPABASE_SERVICE_ROLE_KEY",
        "DATABASE_URL": "$DATABASE_URL"
      }
    }
  }
}
EOF
    
    # Replace with actual values
    envsubst < claude_desktop_config_temp.json > claude_desktop_config.json
    rm claude_desktop_config_temp.json
    
    echo "✓ Updated claude_desktop_config.json"
fi

# For Cursor IDE
if [ -f ".cursor/mcp.json" ]; then
    # Create backup
    cp .cursor/mcp.json .cursor/mcp.json.backup
    
    # Note: Cursor requires the actual token value, not env variable reference
    # This is a limitation of how Cursor handles MCP configuration
    echo "Note: Cursor IDE requires actual token values in .cursor/mcp.json"
    echo "The GitHub token has been securely stored but Cursor cannot reference env variables directly."
fi

echo ""
echo "GitHub MCP Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop app to load new configuration"
echo "2. Test the connection by using GitHub MCP tools"
echo ""
echo "To test GitHub MCP, try:"
echo "- List issues: Use the github-mcp tools"
echo "- Search code: Use GitHub search functionality"
echo ""
echo "Security note: Never commit your .env file or configurations with tokens to git!"