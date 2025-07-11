# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

16BitFit is a React Native/Expo fitness app with a GameBoy-inspired retro aesthetic. The app gamifies fitness tracking by allowing users to maintain a virtual character that evolves based on their real-world health choices. The character's appearance, stats, and abilities change based on workout logging, nutrition tracking, and battle performance.

## Development Commands

### Expo/React Native Commands
```bash
# Start development server (main command)
expo start

# Platform-specific development
expo start --android
expo start --ios  
expo start --web

# Install dependencies
npm install
```

### Testing
No specific test commands are configured in package.json. The project includes a basic Jest test setup with `App.test.tsx` in the `__tests__` directory.

## Architecture Overview

### Core Structure
- **App.js**: Main React Native component containing the GameBoy shell UI and all screen logic
- **PhaserGame.js**: Phaser 3 game component for battle mini-games (web-only)
- **Platform Support**: Cross-platform (iOS/Android/Web) with Expo

### Key Components

#### GameBoy Shell (`App.js`)
- Physical GameBoy-style interface with D-pad, action buttons, and screen
- Full-screen responsive design that adapts to device dimensions
- Six main screens: Home, Avatar, Train, Feed, Battle, Stats

#### Game State Management
- **Player Stats**: Level, XP, HP, focus, strength, endurance, health, evolution stage
- **Avatar State**: Mood, appearance, gear, animations
- **Daily Actions**: Workout logged, meal logged, rest logged
- **Battle System**: Boss availability based on level milestones

#### Phaser Game Integration
- Battle mini-games using Phaser 3 (web platform only)
- Sprite sheet integration with fallback graphics
- Animation system with 6 character states: idle, flex, tired, point, drink, sad
- Score-based battle outcomes affect character progression

### Asset Management
- **Sprites**: Character sprite sheets in `app/assets/Sprites/`
- **Backgrounds**: Environment images in `app/assets/Backgrounds/`
- **Fallback System**: Programmatic sprite generation when assets fail to load

### Platform Considerations
- **Web**: Full functionality including Phaser games
- **Mobile**: Core fitness tracking without game components
- **Asset Loading**: Expo asset management with error handling

## Key Features

### Character Evolution System
- 5 evolution stages: Beginner → Active → Fit → Strong → Elite → Champion
- Visual and stat progression based on user actions
- Gear system with visual equipment indicators

### Fitness Tracking
- **Workout Types**: Cardio, Strength, Yoga, Sports - each with unique stat bonuses
- **Nutrition Logging**: Healthy meals vs junk food with positive/negative effects
- **Progressive Difficulty**: Boss battles scale with character level

### Battle System
- Boss battles available at level milestones (multiples of 5)
- Combat power calculated from combined stats
- Game performance affects battle outcomes
- Victory rewards: XP, level up, evolution progression

## Development Notes

### State Management
- React hooks for local state management
- No external state management library
- Real-time stat updates based on user actions

### Styling
- StyleSheet-based styling with GameBoy color scheme
- Responsive design using Dimensions API
- Retro 16-bit aesthetic with pixel art integration

### Cross-Platform Compatibility
- Conditional rendering based on Platform.OS
- Web-specific features (Phaser games) gracefully degrade on mobile
- Expo-compatible asset management

## Important Implementation Details

### Sprite Sheet Format
- 2x3 grid layout (512x512 per frame)
- Frame sequence: Idle, Flex, Tired, Point, Drink, Sad
- Scaled to ~30x30 pixels in-game (0.06 scale factor)

### Animation System
- Context-sensitive animations (movement → point, hit → tired, collect → drink)
- Manual animation testing with number keys 1-5
- Fallback to programmatic sprites if assets fail

### Battle Logic
- Total stats + game score vs level-based requirements
- Reduced difficulty when game performance is factored in
- Evolution stage progression tied to boss victories

## Asset Paths
- Main sprite sheet: `./assets/Sprites/16BitFit_Sprite_Sheet.png`
- Character poses: `./assets/Sprites/[Pose_Name].png`
- Backgrounds: `./assets/Backgrounds/[Background_Name].png`
- Home screen buttons: `./assets/Sprites/Home_Screen_Button_Sprites/`