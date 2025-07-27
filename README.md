# 🎮 16BitFit - Gamified Fitness & Nutrition Tracker

> Turn your health journey into an epic 16-bit adventure! Watch your virtual character grow stronger as you build real-world healthy habits.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)](https://github.com/seanwinslow28/16BitFit_App)
[![Version](https://img.shields.io/badge/version-1.0.0--MVP-blue)](https://github.com/seanwinslow28/16BitFit_App/releases)
[![React Native](https://img.shields.io/badge/React%20Native-0.72.10-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0.0-000020.svg?logo=expo)](https://expo.dev/)

## 🎯 Overview

16BitFit bridges the gap between nostalgic gaming and modern wellness by creating a pixel-perfect fitness companion. Built with React Native and Expo, this app combines retro gaming aesthetics with comprehensive analytics and AI-powered development assistance.

### ✨ Key Features
- **🎨 Retro Gaming Experience**: Authentic 16-bit pixel art, chiptune sound effects, and GameBoy-inspired UI
- **📊 PostHog Analytics**: Comprehensive user behavior tracking and LLM performance monitoring
- **🤖 AI Agent System**: 16 specialized agents for development, testing, and game mechanics
- **⚡ React Native Game Engine**: Custom RNGE for smooth 60fps battles and animations
- **🎵 Rich Audio**: 80+ retro SFX files for immersive gaming experience
- **☁️ Supabase Integration**: Real-time data sync and user management
- **🏃‍♂️ Fitness Integration**: Apple Health and Google Fit compatibility

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 16.0.0 or later
- **npm**: 7.0.0 or later
- **Expo CLI**: Latest version
- **iOS Simulator** or **Android Emulator** for testing

### Quick Start

```bash
# Clone the repository
git clone https://github.com/seanwinslow28/16BitFit_App.git
cd 16BitFit_App

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

### Environment Setup

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Configure your services in `.env`:
```bash
# PostHog Analytics
POSTHOG_API_KEY=your_posthog_project_api_key
POSTHOG_HOST=https://us.posthog.com

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Debug Settings
DEBUG=false
```

3. Follow the setup guides:
   - [PostHog Setup Guide](https://posthog.com/docs/libraries/react-native)
   - [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)

## 🏗️ Project Structure

```
16BitFit_App/
├── 📱 app/                           # Main application code
│   ├── AppV2.js                     # Main app component with V2 architecture
│   ├── components/                  # Reusable React Native components
│   │   ├── home/                   # Home screen specific components
│   │   ├── animations/             # Animation components
│   │   └── ...                     # Core UI components
│   ├── screens/                     # App screens
│   │   ├── HomeScreenV2.js         # Updated home screen
│   │   ├── BattleScreenV2.js       # Enhanced battle system
│   │   └── ...                     # Additional screens
│   ├── services/                    # Service layer
│   │   ├── PostHogService.js       # Analytics integration
│   │   ├── SupabaseService.js      # Database integration
│   │   └── ...                     # Other services
│   ├── gameEngine/                  # React Native Game Engine (RNGE)
│   │   ├── GameEngine.js           # Core game engine
│   │   ├── systems/                # Game systems (physics, combat, etc.)
│   │   └── entities/               # Game entities and components
│   ├── assets/                      # Game assets
│   │   ├── Audio/SFX/              # 80+ retro sound effects
│   │   ├── Sprites/                # Character and UI sprites
│   │   └── fonts/                  # Pixel-perfect fonts
│   └── contexts/                    # React contexts for state management
├── 🤖 agents/                       # AI Development Agents
│   ├── orchestrator_agent.md       # Master coordinator
│   ├── developer_agent.md          # Code implementation
│   ├── analytics_insights_agent.md # PostHog & analytics
│   └── ...                         # 13 more specialized agents
├── 📚 docs/                         # Documentation
│   ├── 16bitfit Latest Docs-250725/ # Latest project documentation
│   └── ...                         # Additional documentation
├── 🛠️ scripts/                     # Development and setup scripts
├── ⚙️ config/                       # Configuration files
├── 🗄️ supabase/                    # Database migrations and config
├── 🧪 __tests__/                   # Test files
├── mcp_server.py                   # MCP server for agent integration
├── claude_desktop_config.json     # Claude Desktop configuration
└── package.json                   # Dependencies and scripts
```

## 🤖 AI Agent System

16BitFit utilizes a comprehensive AI agent system with 16 specialized agents:

### 🎯 Core Development Agents
- **🎭 Orchestrator Agent**: Master coordinator for all tasks and communications
- **📋 Planner Agent**: Strategic planning and architecture design
- **👨‍💻 Developer Agent**: Code implementation and feature development
- **🔍 Code Review Agent**: Quality assurance and security review
- **✅ Validator Agent**: Testing and validation specialist
- **🏃‍♂️ Test Runner Agent**: Automated testing execution

### 📊 Analytics & Insights
- **📈 Analytics Insights Agent**: PostHog integration and LLM evaluation

### 🎮 Game Development Agents
- **🎨 UI Overlay Agent**: GameBoy-style interfaces and overlays
- **🌐 Meta Systems Agent**: Social features and cloud sync
- **🎯 Game State Agent (RNGE)**: State management and progression
- **📖 Story Narrative Agent (RNGE)**: Interactive storytelling
- **🤖 Enemy AI Agent (RNGE)**: Battle AI and difficulty scaling
- **📦 Asset Loader Agent (RNGE)**: Optimized asset management
- **⚡ Mobile Performance Agent (RNGE)**: Performance optimization
- **🎨 Pixel Art Scaler Agent (RNGE)**: Visual fidelity and scaling
- **⚔️ RN Game Fighter Agent**: Combat mechanics and physics

### Using the Agent System

The agents are integrated with Claude Desktop via MCP (Model Context Protocol):

```bash
# Test agent connectivity
python3 agent_access.py list

# Get specific agent information
python3 agent_access.py orchestrator-agent
```

## 📊 Analytics & Monitoring

### PostHog Integration

16BitFit includes comprehensive analytics powered by PostHog:

```javascript
// Track user events
PostHogService.trackEvent('workout_completed', {
  workout_type: 'strength_training',
  duration_seconds: 1800,
  calories_burned: 250
});

// Track screen views
PostHogService.trackScreen('BattleScreen', {
  battle_type: 'boss_fight'
});

// Track character progression
PostHogService.trackLevelUp(5, 'warrior', {
  experience_gained: 1000
});
```

### Available Tracking Methods
- `trackWorkout()` - Fitness activity tracking
- `trackBattle()` - Game battle events
- `trackFoodLog()` - Nutrition logging
- `trackLevelUp()` - Character progression
- `trackScreen()` - Screen navigation
- `identifyUser()` - User identification

## 🎮 Game Features

### Character System
- **Character Creation**: Multiple preset avatars with distinct visual states
- **Real-Time Feedback**: Character health and strength change based on user choices
- **Progression System**: Gain EXP and level up through healthy habits

### Battle System
- **60fps Combat**: Smooth React Native Game Engine battles
- **Boss Fights**: Challenging opponents with unique mechanics
- **Special Moves**: Unlockable abilities based on fitness achievements

### Audio Experience
- **80+ SFX Files**: Authentic retro sound effects
- **Dynamic Audio**: Context-aware sound design
- **Chiptune Aesthetic**: Nostalgic 8-bit audio experience

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run web version

# Testing
npm test              # Run tests
npm run test:ci       # Run tests in CI mode

# Building
npm run build         # Build for production
npm run build:ios     # Build iOS app
npm run build:android # Build Android app

# Utilities
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
```

### MCP Server Setup

The project includes an MCP server for Claude Desktop integration:

```bash
# Start MCP server
python3 mcp_server.py

# Test MCP connectivity
./scripts/test-mcp-servers.sh
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Test specific components
npm test -- --testPathPattern=PostHogService
```

### Test Coverage
- Component testing with Jest and Expo testing library
- Service layer testing for analytics and data management
- Game engine testing for physics and combat systems

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Run the linter: `npm run lint:fix`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Areas We Need Help With
- **React Native Developers**: App functionality and performance
- **Game Designers**: Combat system balancing and progression
- **Pixel Artists**: Character sprites and UI elements
- **Sound Designers**: Chiptune music and retro SFX
- **Data Scientists**: Analytics insights and user behavior analysis

## 📄 Documentation

- **[Latest Project Docs](docs/16bitfit%20Latest%20Docs-250725/)**: Comprehensive project documentation
- **[Contributing Guidelines](docs/CONTRIBUTING.md)**: How to contribute to the project
- **[License](docs/LICENSE)**: MIT License details

## 🏆 Technical Achievements

- **⚡ 60fps Performance**: Optimized React Native Game Engine
- **📊 Comprehensive Analytics**: PostHog integration with fitness-specific tracking
- **🤖 AI-Assisted Development**: 16-agent system for automated development tasks
- **🎨 Pixel-Perfect Design**: Authentic retro gaming aesthetics
- **☁️ Real-time Sync**: Supabase integration for cross-device data sync
- **🧪 Test Coverage**: Comprehensive testing suite with CI/CD integration

## 📞 Contact & Support

- **Repository**: [GitHub](https://github.com/seanwinslow28/16BitFit_App)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/seanwinslow28/16BitFit_App/issues)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](docs/LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React Native and Expo for cross-platform compatibility
- PostHog for comprehensive analytics and user insights
- Supabase for real-time database and authentication
- Claude and MCP for AI-assisted development
- Inspired by classic 16-bit RPGs and the Tamagotchi phenomenon
- Special thanks to the retro gaming and fitness communities

---

**Ready to start your 16-bit fitness journey?** ⭐ Star this repo and begin your epic health adventure!

*Turn every workout into a power-up, every healthy meal into experience points, and every day into a new level to conquer!* 🎮💪 