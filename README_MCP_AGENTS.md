# 16BitFit MCP Server & Claude Agents

This project includes a Model Context Protocol (MCP) server that provides specialized Claude agents for game development, specifically designed for the 16BitFit fitness gaming application.

## Overview

The MCP server provides three specialized agents:
1. **Phaser Fighter Agent** - Handles Phaser.js game mechanics, combat systems, and battle physics
2. **UI Overlay Agent** - Manages UI overlays, GameBoy-style interfaces, and display systems  
3. **Enemy AI Agent** - Controls enemy AI behavior, battle logic, and difficulty scaling

## Quick Start

### 1. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 2. Start the MCP Server

```bash
python3 mcp_server.py
```

The server will start on `http://localhost:5000` by default.

### 3. Available Endpoints

- `GET /` - Health check and server info
- `GET /agents` - List all available agents
- `GET /agent/<name>` - Get specific agent details
- `GET /agent/<name>/capabilities` - Get agent capabilities
- `GET /config` - Get server configuration

## Agent Details

### Phaser Fighter Agent

**File**: `agents/phaser-fighter-agent.md`

**Capabilities**:
- Battle System Implementation
- Phaser.js Game Development
- Combat Mechanics
- Physics System
- Animation Control
- Input Handling

**Use Cases**:
- Implementing turn-based and real-time combat
- Creating combo systems and special abilities
- Managing battle animations and effects
- Handling collision detection and physics
- Optimizing game performance

### UI Overlay Agent

**File**: `agents/ui-overlay-agent.md`

**Capabilities**:
- UI Layout Management
- GameBoy Style Interface
- Overlay Systems
- Component Architecture
- State Management
- Visual Effects

**Use Cases**:
- Creating authentic GameBoy-style interfaces
- Managing HUD elements and overlays
- Implementing modal dialogs and notifications
- Building responsive component systems
- Handling UI state and animations

### Enemy AI Agent

**File**: `agents/enemy-ai-agent.md`

**Capabilities**:
- AI Behavior Trees
- Battle Strategy
- Difficulty Scaling
- Pattern Recognition
- Decision Making
- Performance Optimization

**Use Cases**:
- Creating intelligent enemy behaviors
- Implementing adaptive difficulty systems
- Building pattern recognition systems
- Developing team coordination mechanics
- Optimizing AI performance

## Configuration

The server uses `mcp_config.yml` for configuration. Key settings include:

```yaml
name: 16BitFit MCP Server
version: 1.0.0
description: Claude MCP Server for 16BitFit Game Development Agents

server:
  host: 0.0.0.0
  port: 5000

agents:
  - name: phaser-fighter-agent
    description: Handles Phaser.js game mechanics and combat systems
    capabilities: [...]

environment:
  NODE_ENV: development
  AGENT_DIR: ./agents
  DEBUG: true
```

## Usage Examples

### Get All Agents

```bash
curl http://localhost:5000/agents
```

### Get Specific Agent

```bash
curl http://localhost:5000/agent/phaser-fighter-agent
```

### Get Agent Capabilities

```bash
curl http://localhost:5000/agent/ui-overlay-agent/capabilities
```

## Integration with Claude

To connect these agents to Claude:

1. Start the MCP server
2. Configure Claude to use the MCP server endpoints
3. Reference specific agents in your Claude conversations
4. Use agent capabilities to guide development tasks

## Agent Structure

Each agent is a markdown file with the following structure:

```markdown
# Agent Name

## Purpose
Brief description of the agent's role

## Core Capabilities
- Capability 1
- Capability 2
- ...

## Technical Implementation
Code examples and implementation details

## Integration with 16BitFit
How the agent integrates with the main application

## Best Practices
Guidelines for using the agent effectively
```

## Development

### Adding New Agents

1. Create a new `.md` file in the `agents/` directory
2. Add the agent configuration to `mcp_config.yml`
3. Restart the MCP server
4. Test the new agent endpoints

### Updating Existing Agents

1. Edit the agent markdown file
2. No server restart required - changes are loaded dynamically
3. Test the updated agent content

## Troubleshooting

### Common Issues

1. **Server won't start**: Check if required dependencies are installed
2. **Agent not found**: Verify the agent file exists and is listed in `mcp_config.yml`
3. **Configuration errors**: Validate the YAML syntax in `mcp_config.yml`

### Debug Mode

Enable debug mode in `mcp_config.yml`:

```yaml
environment:
  DEBUG: true
```

This provides detailed logging and error information.

## Architecture

```
16BitFit_App/
├── mcp_server.py          # Main MCP server
├── mcp_config.yml         # Server configuration
├── requirements.txt       # Python dependencies
└── agents/
    ├── phaser-fighter-agent.md
    ├── ui-overlay-agent.md
    └── enemy-ai-agent.md
```

## Future Enhancements

- Add more specialized agents for specific game features
- Implement agent versioning and updates
- Add authentication and access control
- Create a web interface for agent management
- Support for agent collaboration and workflows

## Support

For issues or questions about the MCP server and agents:

1. Check the agent documentation in the `agents/` directory
2. Review the server logs for error messages
3. Test endpoints using the provided curl examples
4. Verify configuration settings in `mcp_config.yml`

This MCP server provides a robust foundation for integrating specialized AI agents into the 16BitFit development workflow, enabling more efficient and targeted development assistance. 