#!/bin/bash

# 16BitFit MCP Agents Installation Script
# This script sets up Claude Desktop to access all 16BitFit specialized agents

set -e

echo "🚀 Setting up 16BitFit MCP Agents for Claude Desktop..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect OS and set config path
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
            ;;
        Linux*)
            CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            CLAUDE_CONFIG_DIR="$APPDATA/Claude"
            ;;
        *)
            print_error "Unsupported OS"
            exit 1
            ;;
    esac
    
    CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    print_status "Detected config path: $CLAUDE_CONFIG_FILE"
}

# Create Claude config directory if it doesn't exist
create_config_dir() {
    if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
        print_status "Creating Claude config directory..."
        mkdir -p "$CLAUDE_CONFIG_DIR"
        print_success "Created directory: $CLAUDE_CONFIG_DIR"
    fi
}

# Check if environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    MISSING_VARS=()
    
    # Check for required Supabase variables
    [ -z "$SUPABASE_PROJECT_ID" ] && MISSING_VARS+=("SUPABASE_PROJECT_ID")
    [ -z "$SUPABASE_ACCESS_TOKEN" ] && MISSING_VARS+=("SUPABASE_ACCESS_TOKEN")
    [ -z "$SUPABASE_URL" ] && MISSING_VARS+=("SUPABASE_URL")
    [ -z "$SUPABASE_ANON_KEY" ] && MISSING_VARS+=("SUPABASE_ANON_KEY")
    [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && MISSING_VARS+=("SUPABASE_SERVICE_ROLE_KEY")
    
    # Check for GitHub token
    [ -z "$GITHUB_TOKEN" ] && MISSING_VARS+=("GITHUB_TOKEN")
    
    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        print_warning "Missing environment variables: ${MISSING_VARS[*]}"
        print_status "Loading from .env file..."
        
        if [ -f ".env" ]; then
            source .env
            print_success "Loaded .env file"
        else
            print_error "No .env file found. Please create one with the required variables."
            print_status "Required variables: SUPABASE_PROJECT_ID, SUPABASE_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN"
            exit 1
        fi
    else
        print_success "All required environment variables are set"
    fi
}

# Get the absolute path to the project
get_project_path() {
    PROJECT_PATH="$(pwd)"
    AGENTS_PATH="$PROJECT_PATH/docs/16BitFit-agents-latest"
    
    if [ ! -d "$AGENTS_PATH" ]; then
        print_error "Agents directory not found: $AGENTS_PATH"
        print_status "Please run this script from the 16BitFit project root directory"
        exit 1
    fi
    
    print_success "Found agents directory: $AGENTS_PATH"
}

# Install required MCP servers
install_mcp_servers() {
    print_status "Installing required MCP servers..."
    
    # Install cursor-mcp-installer if not already installed
    if ! command -v cursor-mcp-installer &> /dev/null; then
        print_status "Installing cursor-mcp-installer..."
        npm install -g cursor-mcp-installer
    fi
    
    print_success "MCP servers installation ready"
}

# Create the Claude Desktop configuration
create_claude_config() {
    print_status "Creating Claude Desktop configuration..."
    
    # Backup existing config if it exists
    if [ -f "$CLAUDE_CONFIG_FILE" ]; then
        BACKUP_FILE="${CLAUDE_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_status "Backing up existing config to: $BACKUP_FILE"
        cp "$CLAUDE_CONFIG_FILE" "$BACKUP_FILE"
    fi
    
    # Create the configuration
    cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "supabase-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_PROJECT_ID": "$SUPABASE_PROJECT_ID",
        "SUPABASE_ACCESS_TOKEN": "$SUPABASE_ACCESS_TOKEN"
      }
    },
    "github-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "context7-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@context7/mcp-server"
      ]
    },
    "cursor-mcp-installer": {
      "command": "npx",
      "args": [
        "-y",
        "cursor-mcp-installer"
      ]
    },
    "react-native-debugger": {
      "command": "npx",
      "args": [
        "-y",
        "@twodoorsdev/react-native-debugger-mcp"
      ]
    },
    "fetch-mcp": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    }
  },
  "globalShortcut": "Cmd+Shift+.",
  "allowExecutableCommands": true
}
EOF
    
    print_success "Created Claude Desktop configuration: $CLAUDE_CONFIG_FILE"
}

# Create agent quick reference
create_agent_reference() {
    print_status "Creating agent quick reference guide..."
    
    cat > "16bitfit-agents-reference.md" << EOF
# 16BitFit Agents Quick Reference

## Available Specialized Agents

### Core Development
- **backend-specialist**: Supabase, database, real-time features, authentication
- **phaser3-integration-specialist**: Phaser 3 + React Native WebView, 60fps performance
- **game-development-specialist**: Street Fighter 2 mechanics, combat system
- **performance-optimizer**: Mobile optimization, memory management, 60fps

### Character & Progression
- **avatar-evolution-specialist**: Character evolution, progression system, milestones
- **health-integration-specialist**: HealthKit, fitness tracking, nutrition logging

### User Experience
- **ui-ux-specialist**: Design system, user interface, Game Boy aesthetics
- **customer-success-specialist**: Onboarding, retention, user engagement
- **testing-specialist**: Quality assurance, automated testing, mobile testing

### Business & Growth
- **product-manager**: Feature roadmap, user stories, business requirements
- **marketing-specialist**: App Store optimization, user acquisition, ASO
- **data-analytics-specialist**: User behavior, performance metrics, insights
- **community-management-specialist**: Social features, engagement, community

### Infrastructure
- **devops-deployment-specialist**: CI/CD, app store deployment, distribution
- **api-integration-specialist**: Third-party APIs, health platforms, integrations
- **privacy-security-specialist**: Data protection, GDPR compliance, security

## Usage Examples

### Direct Agent Access:
\`\`\`
Hey @backend-specialist, help me design the user authentication flow with Supabase RLS

@phaser3-integration-specialist, optimize the WebView communication for 60fps battles

@avatar-evolution-specialist, design the character evolution celebration sequence
\`\`\`

### Multi-Agent Collaboration:
\`\`\`
I need to implement real-time multiplayer battles:
- @backend-specialist: Handle Supabase real-time subscriptions
- @phaser3-integration-specialist: Manage WebView synchronization
- @performance-optimizer: Ensure smooth 60fps performance
\`\`\`

## Agent Configuration Paths
All agents are configured from: \`$AGENTS_PATH\`

## Last Updated: $(date)
EOF
    
    print_success "Created agent reference: 16bitfit-agents-reference.md"
}

# Main installation process
main() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  16BitFit MCP Agents Setup                  ║"
    echo "║                                                              ║"
    echo "║  This will configure Claude Desktop to access all           ║"
    echo "║  16 specialized agents for your 16BitFit project            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    detect_os
    get_project_path
    check_env_vars
    create_config_dir
    install_mcp_servers
    create_claude_config
    create_agent_reference
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     🎉 Setup Complete!                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "Claude Desktop has been configured with 16BitFit MCP agents"
    echo ""
    print_status "Next steps:"
    echo "  1. Restart Claude Desktop completely"
    echo "  2. Open a new chat and try: 'List available MCP servers'"
    echo "  3. Reference agents using @ mentions (e.g., @backend-specialist)"
    echo "  4. Check '16bitfit-agents-reference.md' for usage examples"
    echo ""
    print_warning "Remember to restart Claude Desktop for changes to take effect!"
}

# Run the installation
main "$@"