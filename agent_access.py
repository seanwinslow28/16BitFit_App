#!/usr/bin/env python3
"""
16BitFit Agent Access Helper
Quick access to your MCP agents from any environment
"""

import os
import sys
from pathlib import Path

# Agent directory
AGENT_DIR = Path("./agents")

def list_agents():
    """List all available agents"""
    print("🎮 16BitFit Game Development Agents\n")
    
    agents = [
        ("phaser-fighter-agent", "🥊 Core Game Engine", "Phaser.js game mechanics, combat systems, and battle physics"),
        ("enemy-ai-agent", "🤖 AI Systems", "Enemy AI behavior, battle strategies, and difficulty scaling"),
        ("game-state-agent", "💾 State Management", "Save/load systems, scene transitions, and game progression"),
        ("ui-overlay-agent", "🖥️ User Interface", "GameBoy-style interfaces and overlay systems"),
        ("pixel-art-scaler-agent", "🎨 Visual Systems", "Pixel-perfect rendering and multi-resolution scaling"),
        ("asset-loader-agent", "📦 Performance", "Asset loading optimization for mobile devices"),
        ("mobile-performance-agent", "📱 Mobile Optimization", "FPS monitoring, memory cleanup, and performance"),
        ("story-narrative-agent", "📖 Content & Story", "Interactive dialogue, character development, and cutscenes"),
        ("meta-systems-agent", "🧠 Systems Integration", "Social features, cloud sync, achievements, and final polish")
    ]
    
    for agent_name, category, description in agents:
        status = "✅" if (AGENT_DIR / f"{agent_name}.md").exists() else "❌"
        print(f"{status} **{agent_name}**")
        print(f"   {category}: {description}")
        print()

def get_agent(agent_name):
    """Get specific agent content"""
    agent_file = AGENT_DIR / f"{agent_name}.md"
    
    if not agent_file.exists():
        print(f"❌ Agent '{agent_name}' not found!")
        print("Available agents:")
        list_agents()
        return
    
    print(f"📋 {agent_name.upper()} AGENT\n")
    print("=" * 50)
    
    with open(agent_file, 'r') as f:
        content = f.read()
        print(content)

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 agent_access.py list          # List all agents")
        print("  python3 agent_access.py <agent-name>  # Get specific agent")
        print("\nExample:")
        print("  python3 agent_access.py phaser-fighter-agent")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_agents()
    else:
        get_agent(command)

if __name__ == "__main__":
    main() 