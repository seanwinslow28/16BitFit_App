# 16BitFit Claude Desktop MCP Setup Instructions

## Overview
This guide will help you configure Claude Desktop to access all 16 specialized agents for the 16BitFit project.

## Step 1: Locate Claude Desktop Config Directory

### macOS:
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Windows:
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

### Linux:
```bash
~/.config/Claude/claude_desktop_config.json
```

## Step 2: Environment Variables Setup

Before configuring MCP servers, ensure these environment variables are set in your system:

### Required Environment Variables:
```bash
# Supabase Configuration
export SUPABASE_PROJECT_ID="your-supabase-project-id"
export SUPABASE_ACCESS_TOKEN="your-supabase-access-token"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# GitHub Configuration
export GITHUB_TOKEN="your-github-personal-access-token"

# Optional - for enhanced features
export POSTHOG_API_KEY="your-posthog-api-key"
export LANGFUSE_PUBLIC_KEY="your-langfuse-public-key"
export LANGFUSE_SECRET_KEY="your-langfuse-secret-key"
```

### Add to your shell profile (.bashrc, .zshrc, etc.):
```bash
# Add to ~/.zshrc or ~/.bashrc
source /Users/seanwinslow/Desktop/16BitFit/16BitFit_App/.env
```

## Step 3: Copy Configuration to Claude Desktop

1. Copy the contents of `claude_desktop_config.json` from this project
2. Paste into your Claude Desktop config file location
3. Restart Claude Desktop

## Step 4: Verify Installation

After restarting Claude Desktop, you should see these MCP servers available:

### 16BitFit Specialized Agents:
- **16bitfit-backend-specialist**: Supabase, database, and backend systems
- **16bitfit-phaser3-specialist**: Phaser 3 + React Native WebView integration
- **16bitfit-game-development**: Street Fighter 2 style combat mechanics
- **16bitfit-performance-optimizer**: Mobile optimization and 60fps performance
- **16bitfit-avatar-evolution**: Character progression and evolution system
- **16bitfit-marketing**: App Store optimization and user acquisition
- **16bitfit-privacy-security**: Data protection and compliance
- **16bitfit-product-manager**: Feature roadmap and user stories
- **16bitfit-testing**: Quality assurance and automated testing
- **16bitfit-ui-ux**: Design systems and user experience
- **16bitfit-customer-success**: User onboarding and retention
- **16bitfit-api-integration**: Third-party integrations (HealthKit, etc.)
- **16bitfit-data-analytics**: User behavior and performance metrics
- **16bitfit-community-management**: Social features and engagement
- **16bitfit-devops-deployment**: CI/CD and app store deployment
- **16bitfit-health-integration**: Fitness tracking and health platforms

### Core MCP Servers:
- **supabase-mcp**: Direct database operations
- **github-mcp**: Repository management
- **context7-mcp**: Documentation and library access
- **cursor-mcp-installer**: MCP server management
- **react-native-debugger**: Mobile debugging
- **fetch-mcp**: Web content and API access

## Step 5: Usage Examples

### Chat with a Specific Agent:
```
@16bitfit-backend-specialist Help me design the user authentication flow with Supabase RLS policies

@16bitfit-phaser3-specialist Optimize the fighting game to maintain 60fps on iOS devices

@16bitfit-avatar-evolution Design the character evolution milestone rewards system
```

### Cross-Agent Collaboration:
```
I need to implement real-time battle synchronization. 
@16bitfit-backend-specialist handle the Supabase real-time setup
@16bitfit-phaser3-specialist handle the WebView communication bridge
@16bitfit-performance-optimizer ensure 60fps performance
```

## Troubleshooting

### Issue: MCP servers not appearing
**Solution**: 
1. Check environment variables are properly set
2. Verify file paths in the config are correct for your system
3. Restart Claude Desktop completely

### Issue: Authentication errors
**Solution**:
1. Verify your Supabase and GitHub tokens have proper permissions
2. Check that tokens haven't expired
3. Ensure .env file is properly sourced

### Issue: Agent responses seem generic
**Solution**:
1. Use the @ mention syntax to target specific agents
2. Provide context about which aspect of 16BitFit you're working on
3. Reference specific files or features in your questions

## Project-Specific Context

Each agent has been configured with deep knowledge of:
- 16BitFit's game mechanics and character system
- Current codebase structure and patterns
- Supabase database schema and real-time features
- React Native + WebView + Phaser 3 architecture
- Mobile performance requirements (60fps fighting game)
- Character personality system (10 types × 5 evolution stages)

## Updates and Maintenance

To update agent configurations:
1. Modify the relevant .md file in `docs/16BitFit-agents-latest/`
2. Restart Claude Desktop to reload the configuration
3. Test the agent to ensure changes are reflected

## Security Notes

- Never commit actual API keys to the repository
- Keep your `.env` file in `.gitignore`
- Regularly rotate access tokens
- Use row-level security in Supabase for data protection

---

For questions or issues with this setup, reference the individual agent files or create an issue in the 16BitFit repository.