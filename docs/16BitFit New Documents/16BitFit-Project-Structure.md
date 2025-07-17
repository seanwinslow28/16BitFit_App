16bitfit/
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── GameCanvas.jsx        # Main Phaser game container
│   │   │   ├── Character.js          # Character sprite & animations
│   │   │   ├── BossFight.js          # Boss battle mechanics
│   │   │   └── GameUI.js             # In-game HUD & stats display
│   │   ├── Screens/
│   │   │   ├── Home.jsx              # Main menu
│   │   │   ├── CharacterCreation.jsx # Character customization
│   │   │   ├── Stats.jsx             # Progress tracking
│   │   │   ├── Workout.jsx           # Exercise input/tracking
│   │   │   └── Nutrition.jsx         # Food logging
│   │   └── UI/
│   │       ├── PixelButton.jsx       # Reusable pixel-style button
│   │       ├── HealthBar.jsx         # Character health display
│   │       └── LevelProgress.jsx     # XP bar component
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── PreloadScene.js       # Asset loading
│   │   │   ├── MainScene.js          # Tamagotchi gameplay
│   │   │   ├── BattleScene.js        # Boss fight scene
│   │   │   └── TrainingScene.js      # Workout mini-games
│   │   ├── config/
│   │   │   ├── gameConfig.js         # Phaser configuration
│   │   │   ├── characterStats.js     # Stat formulas & rules
│   │   │   └── animations.js         # Animation definitions
│   │   └── utils/
│   │       ├── healthCalculator.js   # Nutrition/exercise math
│   │       └── saveManager.js        # Local storage handling
│   ├── services/
│   │   ├── healthKit.js              # Apple Health integration
│   │   ├── storage.js                # AsyncStorage wrapper
│   │   └── api.js                    # Future AI endpoints
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── characters/           # Character sprite sheets
│   │   │   ├── bosses/               # Boss sprites
│   │   │   └── items/                # Food/equipment sprites
│   │   ├── audio/
│   │   │   ├── sfx/                  # Sound effects
│   │   │   └── music/                # Background music
│   │   └── fonts/                    # Pixel fonts
│   ├── styles/
│   │   ├── globals.css               # Base styles
│   │   └── pixelTheme.css            # Retro UI styles
│   └── App.jsx                       # Root component
├── public/                            # Static files
├── docs/
│   ├── GAME_DESIGN.md                # Detailed game mechanics
│   ├── API_INTEGRATION.md            # Health data specs
│   └── SPRITE_GUIDE.md               # Asset requirements
└── package.json                       # Dependencies
