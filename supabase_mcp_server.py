#!/usr/bin/env python3
"""
16BitFit Supabase MCP Server
Provides database access and management for the 16BitFit fitness game
"""

import json
import sys
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql

# Custom JSON encoder for database types
class DatabaseJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        return super().default(obj)

# Database connection string - will be loaded from environment or config
DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

class SupabaseMCPServer:
    def __init__(self):
        self.db_connection = None
        self.server_info = {
            "name": "16bitfit-supabase-mcp",
            "version": "1.0.0",
            "description": "MCP server for 16BitFit Supabase database operations",
            "author": "16BitFit Team"
        }
        
    def connect_db(self):
        """Establish database connection"""
        try:
            self.db_connection = psycopg2.connect(
                DATABASE_URL,
                cursor_factory=RealDictCursor
            )
            return True
        except Exception as e:
            print(f"Database connection failed: {e}", file=sys.stderr)
            return False

    def execute_query(self, query: str, params: Optional[tuple] = None, fetch: bool = True) -> Dict[str, Any]:
        """Execute a database query and return results"""
        try:
            if not self.db_connection:
                if not self.connect_db():
                    return {"error": "Database connection failed"}
            
            if not self.db_connection:
                return {"error": "Database connection is None"}
            
            with self.db_connection.cursor() as cursor:
                cursor.execute(query, params)
                
                if fetch:
                    results = cursor.fetchall()
                    # Convert to list of dicts for JSON serialization
                    return {"data": [dict(row) for row in results], "count": len(results)}
                else:
                    self.db_connection.commit()
                    return {"success": True, "affected_rows": cursor.rowcount}
                    
        except Exception as e:
            if self.db_connection:
                self.db_connection.rollback()
            return {"error": str(e)}

    def handle_request(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests"""
        method = message.get("method")
        
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "result": {
                    "capabilities": {
                        "resources": {"subscribe": False, "listChanged": False},
                        "tools": {"listChanged": False},
                        "prompts": {"listChanged": False}
                    },
                    "serverInfo": self.server_info
                }
            }
            
        elif method == "initialized":
            return {"jsonrpc": "2.0", "id": message.get("id")}
            
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "result": {"tools": self.get_tools()}
            }
            
        elif method == "tools/call":
            params = message.get("params", {})
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            
            result = self.execute_tool(tool_name, arguments)
            
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "result": {"content": [{"type": "text", "text": json.dumps(result, indent=2, cls=DatabaseJSONEncoder)}]}
            }
            
        elif method == "resources/list":
            return {
                "jsonrpc": "2.0", 
                "id": message.get("id"),
                "result": {"resources": self.get_resources()}
            }
            
        elif method == "resources/read":
            params = message.get("params", {})
            uri = params.get("uri")
            result = self.read_resource(uri)
            
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"), 
                "result": {"contents": [{"uri": uri, "mimeType": "application/json", "text": json.dumps(result, indent=2, cls=DatabaseJSONEncoder)}]}
            }
            
        else:
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "error": {"code": -32601, "message": f"Method not found: {method}"}
            }

    def get_tools(self) -> List[Dict[str, Any]]:
        """Return available tools"""
        return [
            {
                "name": "get_user_profile",
                "description": "Get a user's profile and character data",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"},
                        "username": {"type": "string", "description": "Username (alternative to user_id)"}
                    }
                }
            },
            {
                "name": "create_user_profile", 
                "description": "Create a new user profile and character",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID from Supabase Auth"},
                        "username": {"type": "string", "description": "Unique username"},
                        "display_name": {"type": "string", "description": "Display name"}
                    },
                    "required": ["user_id", "username"]
                }
            },
            {
                "name": "update_character_stats",
                "description": "Update character stats (health, strength, stamina, etc.)",
                "inputSchema": {
                    "type": "object", 
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"},
                        "stats": {
                            "type": "object",
                            "properties": {
                                "health": {"type": "integer", "minimum": 0, "maximum": 100},
                                "strength": {"type": "integer", "minimum": 0, "maximum": 100},
                                "stamina": {"type": "integer", "minimum": 0, "maximum": 100},
                                "happiness": {"type": "integer", "minimum": 0, "maximum": 100},
                                "weight": {"type": "integer", "minimum": 30, "maximum": 70},
                                "xp": {"type": "integer", "minimum": 0},
                                "level": {"type": "integer", "minimum": 1}
                            }
                        }
                    },
                    "required": ["user_id", "stats"]
                }
            },
            {
                "name": "get_achievements",
                "description": "Get all available achievements",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "category": {"type": "string", "description": "Filter by category (fitness, nutrition, battle, etc.)"}
                    }
                }
            },
            {
                "name": "get_user_achievements",
                "description": "Get user's achievement progress",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "unlock_achievement",
                "description": "Mark an achievement as completed for a user",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"},
                        "achievement_id": {"type": "string", "description": "Achievement ID"}
                    },
                    "required": ["user_id", "achievement_id"]
                }
            },
            {
                "name": "get_customization_items",
                "description": "Get all customization items",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string", "description": "Filter by type (hair, outfit, accessories, etc.)"},
                        "rarity": {"type": "string", "description": "Filter by rarity (common, rare, epic, legendary)"}
                    }
                }
            },
            {
                "name": "get_user_customizations", 
                "description": "Get user's unlocked customization items",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "unlock_customization_item",
                "description": "Unlock a customization item for a user",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"},
                        "item_id": {"type": "string", "description": "Item ID"}
                    },
                    "required": ["user_id", "item_id"]
                }
            },
            {
                "name": "log_action",
                "description": "Log a user action (workout, meal, battle, etc.)",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User UUID"},
                        "action_type": {"type": "string", "description": "Type of action"},
                        "action_data": {"type": "object", "description": "Action details"},
                        "xp_gained": {"type": "integer", "description": "XP gained from action"}
                    },
                    "required": ["user_id", "action_type"]
                }
            },
            {
                "name": "get_leaderboard",
                "description": "Get leaderboard data",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string", "enum": ["level", "workout"], "description": "Leaderboard type"},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 10}
                    },
                    "required": ["type"]
                }
            }
        ]

    def get_resources(self) -> List[Dict[str, Any]]:
        """Return available resources"""
        return [
            {
                "uri": "supabase://tables",
                "name": "Database Tables",
                "description": "List of all database tables and their structure",
                "mimeType": "application/json"
            },
            {
                "uri": "supabase://stats",
                "name": "Database Statistics", 
                "description": "General database statistics and counts",
                "mimeType": "application/json"
            }
        ]

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific tool"""
        try:
            if tool_name == "get_user_profile":
                return self.get_user_profile(arguments)
            elif tool_name == "create_user_profile":
                return self.create_user_profile(arguments)
            elif tool_name == "update_character_stats":
                return self.update_character_stats(arguments)
            elif tool_name == "get_achievements":
                return self.get_achievements(arguments)
            elif tool_name == "get_user_achievements":
                return self.get_user_achievements(arguments)
            elif tool_name == "unlock_achievement":
                return self.unlock_achievement(arguments)
            elif tool_name == "get_customization_items":
                return self.get_customization_items(arguments)
            elif tool_name == "get_user_customizations":
                return self.get_user_customizations(arguments)
            elif tool_name == "unlock_customization_item":
                return self.unlock_customization_item(arguments)
            elif tool_name == "log_action":
                return self.log_action(arguments)
            elif tool_name == "get_leaderboard":
                return self.get_leaderboard(arguments)
            else:
                return {"error": f"Unknown tool: {tool_name}"}
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}

    def get_user_profile(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get user profile and character data"""
        user_id = args.get("user_id")
        username = args.get("username")
        
        if user_id:
            query = """
                SELECT up.*, c.*
                FROM user_profiles up
                LEFT JOIN characters c ON up.id = c.user_id
                WHERE up.id = %s
            """
            return self.execute_query(query, (user_id,))
        elif username:
            query = """
                SELECT up.*, c.*
                FROM user_profiles up
                LEFT JOIN characters c ON up.id = c.user_id  
                WHERE up.username = %s
            """
            return self.execute_query(query, (username,))
        else:
            return {"error": "Either user_id or username is required"}

    def create_user_profile(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user profile and character"""
        user_id = args.get("user_id")
        username = args.get("username")
        display_name = args.get("display_name", username)
        
        try:
            # Insert user profile
            profile_query = """
                INSERT INTO user_profiles (id, username, display_name)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                RETURNING *
            """
            profile_result = self.execute_query(profile_query, (user_id, username, display_name))
            
            if profile_result.get("error"):
                return profile_result
            
            # Create default character
            character_query = """
                INSERT INTO characters (user_id)
                VALUES (%s)
                ON CONFLICT (user_id) DO NOTHING
                RETURNING *
            """
            character_result = self.execute_query(character_query, (user_id,))
            
            # Give user default customization items
            default_items = ['body_default', 'hair_default', 'outfit_default', 'gear_none', 'effect_none']
            for item_id in default_items:
                item_query = """
                    INSERT INTO user_customizations (user_id, item_id, is_equipped)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, item_id) DO NOTHING
                """
                self.execute_query(item_query, (user_id, item_id, True), fetch=False)
            
            return {"success": True, "profile": profile_result.get("data", []), "character": character_result.get("data", [])}
            
        except Exception as e:
            return {"error": f"Failed to create user profile: {str(e)}"}

    def update_character_stats(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Update character statistics"""
        user_id = args.get("user_id")
        stats = args.get("stats", {})
        
        # Build dynamic update query
        update_fields = []
        params = []
        
        for field, value in stats.items():
            if field in ["health", "strength", "stamina", "happiness", "weight", "xp", "level"]:
                update_fields.append(f"{field} = %s")
                params.append(value)
        
        if not update_fields:
            return {"error": "No valid stats provided"}
            
        update_fields.append("updated_at = %s")
        params.append(datetime.now(timezone.utc))
        params.append(user_id)
        
        query = f"""
            UPDATE characters 
            SET {', '.join(update_fields)}
            WHERE user_id = %s
            RETURNING *
        """
        
        return self.execute_query(query, tuple(params))

    def get_achievements(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get all achievements with optional category filter"""
        category = args.get("category")
        
        if category:
            query = "SELECT * FROM achievements WHERE category = %s ORDER BY points ASC"
            return self.execute_query(query, (category,))
        else:
            query = "SELECT * FROM achievements ORDER BY category, points ASC"
            return self.execute_query(query)

    def get_user_achievements(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get user's achievement progress"""
        user_id = args.get("user_id")
        
        query = """
            SELECT 
                a.*,
                ua.progress,
                ua.is_completed,
                ua.completed_at
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = %s
            ORDER BY a.category, a.points ASC
        """
        
        return self.execute_query(query, (user_id,))

    def unlock_achievement(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Unlock an achievement for a user"""
        user_id = args.get("user_id")
        achievement_id = args.get("achievement_id")
        
        query = """
            INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at)
            VALUES (%s, %s, 1, true, %s)
            ON CONFLICT (user_id, achievement_id) 
            DO UPDATE SET 
                is_completed = true, 
                completed_at = %s
            RETURNING *
        """
        now = datetime.now(timezone.utc)
        return self.execute_query(query, (user_id, achievement_id, now, now))

    def get_customization_items(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get customization items with optional filters"""
        item_type = args.get("type")
        rarity = args.get("rarity")
        
        query = "SELECT * FROM customization_items"
        params = []
        conditions = []
        
        if item_type:
            conditions.append("type = %s")
            params.append(item_type)
            
        if rarity:
            conditions.append("rarity = %s") 
            params.append(rarity)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY type, rarity, name"
        
        return self.execute_query(query, tuple(params) if params else None)

    def get_user_customizations(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get user's unlocked customization items"""
        user_id = args.get("user_id")
        
        query = """
            SELECT 
                ci.*,
                uc.is_equipped,
                uc.unlocked_at
            FROM customization_items ci
            JOIN user_customizations uc ON ci.id = uc.item_id
            WHERE uc.user_id = %s
            ORDER BY ci.type, ci.rarity, ci.name
        """
        
        return self.execute_query(query, (user_id,))

    def unlock_customization_item(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Unlock a customization item for user"""
        user_id = args.get("user_id")
        item_id = args.get("item_id")
        
        query = """
            INSERT INTO user_customizations (user_id, item_id, is_equipped)
            VALUES (%s, %s, false)
            ON CONFLICT (user_id, item_id) DO NOTHING
            RETURNING *
        """
        
        return self.execute_query(query, (user_id, item_id))

    def log_action(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Log a user action"""
        user_id = args.get("user_id")
        action_type = args.get("action_type")
        action_data = args.get("action_data", {})
        xp_gained = args.get("xp_gained", 0)
        
        query = """
            INSERT INTO action_logs (user_id, action_type, action_data, xp_gained)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """
        
        return self.execute_query(query, (user_id, action_type, json.dumps(action_data), xp_gained))

    def get_leaderboard(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get leaderboard data"""
        leaderboard_type = args.get("type")
        limit = args.get("limit", 10)
        
        if leaderboard_type == "level":
            query = f"SELECT * FROM level_leaderboard LIMIT %s"
        elif leaderboard_type == "workout":
            query = f"SELECT * FROM workout_leaderboard LIMIT %s"
        else:
            return {"error": "Invalid leaderboard type. Must be 'level' or 'workout'"}
            
        return self.execute_query(query, (limit,))

    def read_resource(self, uri: str) -> Dict[str, Any]:
        """Read a resource by URI"""
        if uri == "supabase://tables":
            query = """
                SELECT 
                    schemaname, 
                    tablename, 
                    tableowner 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            """
            return self.execute_query(query)
            
        elif uri == "supabase://stats":
            stats = {}
            tables = ["user_profiles", "characters", "achievements", "customization_items", "user_achievements", "user_customizations", "action_logs"]
            
            for table in tables:
                result = self.execute_query(f"SELECT COUNT(*) as count FROM {table}")
                if result.get("data"):
                    stats[table] = result["data"][0]["count"]
                    
            return {"stats": stats}
        else:
            return {"error": f"Unknown resource: {uri}"}

async def main():
    """Main server loop"""
    server = SupabaseMCPServer()
    
    # Connect to database
    if not server.connect_db():
        print("Failed to connect to database", file=sys.stderr)
        sys.exit(1)
    
    # Read messages from stdin
    try:
        while True:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
                
            try:
                message = json.loads(line.strip())
                response = server.handle_request(message)
                print(json.dumps(response))
                sys.stdout.flush()
            except json.JSONDecodeError:
                continue
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0", 
                    "id": None,
                    "error": {"code": -32603, "message": f"Internal error: {str(e)}"}
                }
                print(json.dumps(error_response))
                sys.stdout.flush()
                
    except KeyboardInterrupt:
        pass
    finally:
        if server.db_connection:
            server.db_connection.close()

if __name__ == "__main__":
    asyncio.run(main()) 