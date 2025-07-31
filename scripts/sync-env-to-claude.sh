#!/bin/bash

# Sync .env variables to Claude Desktop configuration
# This maintains .env as the single source of truth

ENV_FILE="../.env"
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found"
    exit 1
fi

if [ ! -f "$CLAUDE_CONFIG" ]; then
    echo "Error: Claude Desktop config not found"
    exit 1
fi

# Extract GitHub token from .env
GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" "$ENV_FILE" | cut -d'=' -f2)

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN not found in .env file"
    exit 1
fi

echo "Syncing GitHub token to Claude Desktop config..."

# Update the Claude Desktop config with the token from .env
sed -i.backup "s/\"GITHUB_PERSONAL_ACCESS_TOKEN\": \".*\"/\"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITHUB_TOKEN\"/" "$CLAUDE_CONFIG"

echo "✅ GitHub token synced successfully!"
echo "Please restart Claude Desktop to apply changes." 