#!/bin/bash

# GitHub MCP Wrapper Script
# This script loads environment variables before starting GitHub MCP

# Load environment variables from .env file
if [ -f "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/.env" ]; then
    export $(cat /Users/seanwinslow/Desktop/16BitFit/16BitFit_App/.env | grep -v '^#' | xargs)
fi

# Start GitHub MCP with the token from environment
export GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN"

# Execute the GitHub MCP server
exec npx -y @modelcontextprotocol/server-github "$@"