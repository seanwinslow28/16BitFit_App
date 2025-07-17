#!/usr/bin/env python3

import os
import sys
import json
import yaml
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

# Configuration
CONFIG_FILE = os.getenv("MCP_CONFIG", "mcp_config.yml")
AGENT_DIR = os.getenv("AGENT_DIR", "./agents")

def load_config() -> Dict[str, Any]:
    """Load MCP configuration from YAML file"""
    try:
        with open(CONFIG_FILE, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print(f"Warning: Config file {CONFIG_FILE} not found. Using defaults.", file=sys.stderr)
        return {
            "name": "16BitFit MCP Server",
            "version": "1.0.0",
            "agents": []
        }

def load_agent_file(agent_name: str) -> Optional[str]:
    """Load agent markdown file"""
    agent_path = Path(AGENT_DIR) / f"{agent_name}.md"
    if agent_path.exists():
        return agent_path.read_text()
    return None

class MCPServer:
    def __init__(self):
        self.config = load_config()
        
    def send_response(self, response: Dict[str, Any]):
        """Send JSON-RPC response to stdout"""
        print(json.dumps(response), flush=True)
        
    def send_error(self, request_id: Any, code: int, message: str):
        """Send JSON-RPC error response"""
        # Ensure request_id is valid
        if request_id is None:
            print(f"Warning: Error response missing id for: {message}", file=sys.stderr)
            request_id = 0
        
        response = {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": code,
                "message": message
            }
        }
        self.send_response(response)
    
    def handle_initialize(self, request: Dict[str, Any]):
        """Handle initialize request"""
        request_id = request.get("id")
        
        # Ensure request_id is valid
        if request_id is None:
            print("Warning: Initialize request missing id", file=sys.stderr)
            request_id = 1
        
        # Return server capabilities
        response = {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "listChanged": True
                    },
                    "resources": {
                        "subscribe": True,
                        "listChanged": True
                    }
                },
                "serverInfo": {
                    "name": "16bitfit-mcp",
                    "version": self.config.get("version", "1.0.0")
                }
            }
        }
        self.send_response(response)
        
    def handle_initialized(self, request: Dict[str, Any]):
        """Handle initialized notification"""
        # This is a notification, no response needed
        pass
        
    def handle_tools_list(self, request: Dict[str, Any]):
        """Handle tools/list request"""
        request_id = request.get("id")
        
        # Ensure request_id is valid
        if request_id is None:
            print("Warning: Tools/list request missing id", file=sys.stderr)
            request_id = 0
        
        tools = [
            {
                "name": "get_agent_info",
                "description": "Get information about a specific agent",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "agent_name": {
                            "type": "string",
                            "description": "Name of the agent to get information about"
                        }
                    },
                    "required": ["agent_name"]
                }
            },
            {
                "name": "list_agents",
                "description": "List all available agents and their capabilities",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]
        
        response = {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "tools": tools
            }
        }
        self.send_response(response)
        
    def handle_tools_call(self, request: Dict[str, Any]):
        """Handle tools/call request"""
        request_id = request.get("id")
        
        # Ensure request_id is valid
        if request_id is None:
            print("Warning: Tools/call request missing id", file=sys.stderr)
            request_id = 0
        
        params = request.get("params", {})
        name = params.get("name")
        arguments = params.get("arguments", {})
        
        if name == "list_agents":
            agents = []
            for agent_config in self.config.get("agents", []):
                agent_name = agent_config.get("name", "")
                agents.append({
                    "name": agent_name,
                    "description": agent_config.get("description", ""),
                    "capabilities": agent_config.get("capabilities", [])
                })
            
            content = f"Available agents ({len(agents)}):\n\n"
            for agent in agents:
                content += f"• **{agent['name']}**: {agent['description']}\n"
                content += f"  Capabilities: {', '.join(agent['capabilities'])}\n\n"
            
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": content
                        }
                    ],
                    "isError": False
                }
            }
            self.send_response(response)
            
        elif name == "get_agent_info":
            agent_name = arguments.get("agent_name")
            if not agent_name:
                self.send_error(request_id, -32602, "agent_name is required")
                return
            
            # Find agent in config
            agent_config = None
            for agent in self.config.get("agents", []):
                if agent.get("name") == agent_name:
                    agent_config = agent
                    break
            
            if not agent_config:
                self.send_error(request_id, -32601, f"Agent '{agent_name}' not found")
                return
            
            # Load agent file
            agent_content = load_agent_file(agent_name)
            if not agent_content:
                self.send_error(request_id, -32601, f"Agent file for '{agent_name}' not found")
                return
            
            content = f"# {agent_name}\n\n"
            content += f"**Description**: {agent_config.get('description', '')}\n\n"
            content += f"**Capabilities**:\n"
            for cap in agent_config.get("capabilities", []):
                content += f"• {cap}\n"
            content += f"\n**Full Agent Content**:\n\n{agent_content}"
            
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": content
                        }
                    ],
                    "isError": False
                }
            }
            self.send_response(response)
            
        else:
            self.send_error(request_id, -32601, f"Unknown tool: {name}")
            
    def handle_resources_list(self, request: Dict[str, Any]):
        """Handle resources/list request"""
        request_id = request.get("id")
        
        # Ensure request_id is valid
        if request_id is None:
            print("Warning: Resources/list request missing id", file=sys.stderr)
            request_id = 0
        
        resources = []
        for agent_config in self.config.get("agents", []):
            agent_name = agent_config.get("name", "")
            agent_content = load_agent_file(agent_name)
            
            if agent_content:
                resources.append({
                    "uri": f"agent://{agent_name}",
                    "name": f"{agent_name} Agent",
                    "description": agent_config.get("description", ""),
                    "mimeType": "text/markdown"
                })
        
        response = {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "resources": resources
            }
        }
        self.send_response(response)
        
    def handle_resources_read(self, request: Dict[str, Any]):
        """Handle resources/read request"""
        request_id = request.get("id")
        
        # Ensure request_id is valid
        if request_id is None:
            print("Warning: Resources/read request missing id", file=sys.stderr)
            request_id = 0
        
        params = request.get("params", {})
        uri = params.get("uri")
        
        if not uri or not uri.startswith("agent://"):
            self.send_error(request_id, -32602, "Invalid URI")
            return
        
        agent_name = uri.replace("agent://", "")
        agent_content = load_agent_file(agent_name)
        
        if not agent_content:
            self.send_error(request_id, -32601, f"Agent '{agent_name}' not found")
            return
        
        response = {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": "text/markdown",
                        "text": agent_content
                    }
                ]
            }
        }
        self.send_response(response)
        
    def handle_request(self, request: Dict[str, Any]):
        """Handle incoming JSON-RPC request"""
        method = request.get("method")
        
        if method == "initialize":
            self.handle_initialize(request)
        elif method == "initialized":
            self.handle_initialized(request)
        elif method == "tools/list":
            self.handle_tools_list(request)
        elif method == "tools/call":
            self.handle_tools_call(request)
        elif method == "resources/list":
            self.handle_resources_list(request)
        elif method == "resources/read":
            self.handle_resources_read(request)
        else:
            request_id = request.get("id")
            if request_id is None:
                print(f"Warning: Unknown method request missing id: {method}", file=sys.stderr)
                request_id = 0
            self.send_error(request_id, -32601, f"Method not found: {method}")
            
    def run(self):
        """Run the MCP server"""
        print(f"Starting {self.config.get('name', '16BitFit MCP Server')} v{self.config.get('version', '1.0.0')}", file=sys.stderr)
        print(f"Agent directory: {AGENT_DIR}", file=sys.stderr)
        print(f"Available agents: {len(self.config.get('agents', []))}", file=sys.stderr)
        
        # Read JSON-RPC messages from stdin
        try:
            for line in sys.stdin:
                line = line.strip()
                if not line:
                    continue
                    
                try:
                    request = json.loads(line)
                    print(f"Received request: {request.get('method', 'unknown')} (id: {request.get('id', 'none')})", file=sys.stderr)
                    self.handle_request(request)
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}", file=sys.stderr)
                    print(f"Raw line: {line}", file=sys.stderr)
                    # Try to send error response if we can determine the ID
                    try:
                        partial_data = json.loads(line, strict=False)
                        request_id = partial_data.get('id', 0)
                        self.send_error(request_id, -32700, "Parse error")
                    except:
                        pass
                    continue
                except Exception as e:
                    print(f"Error handling request: {e}", file=sys.stderr)
                    print(f"Request data: {line}", file=sys.stderr)
                    continue
        except KeyboardInterrupt:
            print("Server stopped", file=sys.stderr)
        except Exception as e:
            print(f"Server error: {e}", file=sys.stderr)

if __name__ == "__main__":
    server = MCPServer()
    server.run()
