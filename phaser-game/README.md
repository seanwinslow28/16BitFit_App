# 16BitFit Phaser 3 Game Engine

This directory contains the Phaser 3 fighting game that runs inside a React Native WebView.

## Architecture

The game is built with:
- **Phaser 3.70+** - Game engine
- **WebView Bridge** - Bidirectional communication with React Native
- **Webpack** - Bundling and optimization
- **Binary Protocol** - <50ms input latency

## Setup

1. Install dependencies:
```bash
cd phaser-game
npm install
```

2. Development server:
```bash
npm run dev
# Opens at http://localhost:8080
```

3. Build for production:
```bash
npm run build
# Creates optimized bundle in dist/
```

## Integration

### iOS
```bash
npm run phaser:build:ios
# Copies to ios/phaser-game-dist/
```

### Android
```bash
npm run phaser:build:android
# Copies to android/app/src/main/assets/phaser-game-dist/
```

## WebView Bridge API

### React Native → Phaser
- `START_BATTLE` - Start a new battle
- `GAME_INPUT` - Send player input
- `UPDATE_CHARACTER` - Update character stats
- `SET_QUALITY` - Change graphics quality
- `PAUSE_GAME` / `RESUME_GAME` - Game state control

### Phaser → React Native
- `PHASER_INITIALIZED` - Engine ready
- `BATTLE_COMPLETE` - Battle results
- `PERFORMANCE_REPORT` - FPS and metrics
- `ASSET_LOAD_PROGRESS` - Loading progress

## Performance

Target: **60fps** on iPhone 12 / Android 10+

Quality presets:
- `ULTRA` - Full effects
- `HIGH` - Standard play
- `MEDIUM` - Reduced effects
- `LOW` - Minimal effects
- `POTATO` - Emergency mode

## Development

Key files:
- `src/main.js` - Entry point
- `src/bridge/WebViewBridge.js` - Communication layer
- `src/scenes/BattleScene.js` - Main game logic
- `src/config/gameConfig.js` - Performance settings