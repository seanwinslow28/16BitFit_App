# 16BitFit MCP Server Setup Guide

## Overview

This guide explains how to set up and use the Model Context Protocol (MCP) server for your 16BitFit project agents. The MCP server allows Claude Desktop and other MCP-compatible AI applications to access your agent documentation and capabilities.

## What is MCP?

The Model Context Protocol (MCP) is an open standard created by Anthropic that allows AI applications to connect to external data sources and tools. In your case, it provides a standardized way for Claude Desktop to access your 8 specialized agents.

## Problem Fixed

**Before MCP**: Your Flask HTTP server was incompatible with Claude Desktop because:
- MCP uses JSON-RPC over stdio, not HTTP
- Claude Desktop expects specific MCP protocol messages
- No standard way to expose agent capabilities

**After MCP**: Your agents are now accessible through the standard MCP protocol, allowing seamless integration with Claude Desktop and other MCP-compatible applications.

## Installation & Setup

### 1. Install Dependencies

```bash
pip3 install pyyaml
```

### 2. Configure Claude Desktop

Create or edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "16bitfit-mcp": {
      "command": "python3",
      "args": ["/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/mcp_server.py"],
      "env": {
        "MCP_CONFIG": "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/mcp_config.yml",
        "AGENT_DIR": "/Users/seanwinslow/Desktop/16BitFit/16BitFit_App/agents"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop completely (quit and reopen).

## Available Features

### Tools
- `list_agents`: List all available agents and their capabilities
- `get_agent_info`: Get detailed information about a specific agent

### Resources
- Access to all agent markdown files via `agent://agent-name` URIs
- Real-time access to agent documentation and capabilities

### Your 8 Agents

1. **phaser-fighter-agent**: Phaser.js game mechanics, combat systems, and battle physics
2. **ui-overlay-agent**: UI overlays, GameBoy-style interfaces, and display systems
3. **enemy-ai-agent**: Enemy AI behavior, battle logic, and difficulty scaling
4. **asset-loader-agent**: Asset loading and preloader system for mobile optimization
5. **mobile-performance-agent**: Mobile optimization and performance monitoring
6. **story-narrative-agent**: Narrative design and story integration
7. **pixel-art-scaler-agent**: Visual fidelity and scaling systems
8. **game-state-agent**: State management and progression systems

## Usage Examples

### In Claude Desktop

Once configured, you can ask Claude Desktop:

```
"List all available agents for my 16BitFit project"
"Tell me about the phaser-fighter-agent capabilities"
"What does the mobile-performance-agent do?"
```

### Test the Server

Run the test script to verify everything is working:

```bash
python3 test_mcp_server.py
```

## Troubleshooting

### Common Issues

1. **Server not connecting**: 
   - Verify file paths in `claude_desktop_config.json`
   - Check that `mcp_server.py` is executable (`chmod +x mcp_server.py`)
   - Restart Claude Desktop completely

2. **Agent files not found**:
   - Ensure agent `.md` files exist in the `agents/` directory
   - Check that `AGENT_DIR` path is correct

3. **Configuration errors**:
   - Validate `mcp_config.yml` syntax
   - Check that all agent names match their respective `.md` files

### Debugging

Check the server logs by running it manually:

```bash
python3 mcp_server.py
# Then send test JSON-RPC messages
```

## Next Steps

1. **Expand Agent Capabilities**: Add more tools and resources to each agent
2. **Create Agent Templates**: Develop standardized templates for new agents
3. **Integration Testing**: Test with other MCP-compatible applications
4. **Performance Monitoring**: Monitor server performance and optimize as needed

## File Structure

```
16BitFit_App/
├── mcp_server.py              # Main MCP server
├── mcp_config.yml             # Server configuration
├── claude_desktop_config.json # Claude Desktop config
├── agents/                    # Agent markdown files
│   ├── phaser-fighter-agent.md
│   ├── ui-overlay-agent.md
│   └── ...
└── README_MCP_SETUP.md        # This guide
```

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://claude.ai/docs/mcp)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)

Your agents are now ready to be used with Claude Desktop and other MCP-compatible applications! 