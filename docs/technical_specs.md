# Technical Specifications: 16bitFit

**Version:** 1.0  
**Last Updated:** July 1, 2025  
**Status:** In Development  

## 1. Architecture Overview

### 1.1 Technology Stack Selection

**Frontend Framework: React Native**
- **Why React Native?** As a beginner-friendly choice, React Native allows you to write one codebase that works on both iOS and Android. You'll learn JavaScript/TypeScript, which are valuable skills for web development and many other tech roles.
- **Alternative considered:** Native development (Swift/Kotlin) was rejected due to doubled development time and complexity for a solo developer.

**State Management: Redux Toolkit**
- **Why Redux?** Provides predictable state management for character stats, user progress, and app settings. Essential for games where data consistency is critical.
- **Learning benefit:** Redux is widely used in industry and excellent for your portfolio.

**Database: SQLite with React Native SQLite Storage**
- **Why SQLite?** Lightweight, local storage perfect for offline-first apps. No server costs for MVP.
- **Data stored:** Character stats, user logs, level progression, and app preferences.

**Audio: React Native Sound**
- **Why this library?** Handles retro sound effects and background music efficiently on mobile devices.

### 1.2 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Character/       # Character sprite and animations
│   ├── UI/              # Buttons, modals, progress bars
│   └── Common/          # Shared components (headers, etc.)
├── screens/             # App screens
│   ├── CharacterCreation.js
│   ├── MainDojo.js
│   ├── BossFight.js
│   └── Settings.js
├── store/               # Redux store and slices
│   ├── characterSlice.js
│   ├── gameSlice.js
│   └── userSlice.js
├── utils/               # Game logic and calculations
│   ├── gameLogic.js     # HP/AP/EXP calculations
│   ├── storage.js       # Database operations
│   └── constants.js     # Game balance constants
├── assets/              # Images, sounds, fonts
│   ├── sprites/         # Character and UI sprites
│   ├── sounds/          # Chiptune effects
│   └── fonts/           # Pixel fonts
└── services/            # External integrations (future)
    ├── healthKit.js     # Apple Health integration
    └── analytics.js     # User behavior tracking
```

## 2. Core Game Systems

### 2.1 Character Stats System

```javascript
// Character data structure
const characterState = {
  id: "unique_character_id",
  name: "Player's Character",
  sprite: "warrior_male", // References sprite asset
  level: 1,
  currentHP: 100,
  maxHP: 100,
  attackPower: 10,
  currentEXP: 0,
  expToNextLevel: 100,
  visualState: "neutral", // "healthy", "unhealthy", "strong"
  lastFed: timestamp,
  lastTrained: timestamp
}
```

**Stat Calculation Logic:**
- **HP Regeneration:** +20 HP for healthy meals, -15 HP for unhealthy treats
- **AP Growth:** +5 AP for completed workouts, -2 AP for skipped workouts  
- **EXP Gain:** +25 EXP healthy meals, +35 EXP workouts, +100 EXP boss victories
- **Level Up:** EXP requirement increases by 50 each level (100, 150, 200...)

### 2.2 Visual State System

Character appearance changes based on recent actions and current stats:

```javascript
function determineVisualState(character) {
  const hpPercentage = character.currentHP / character.maxHP;
  const recentActions = getLastWeekActions();
  
  if (hpPercentage < 0.3) return "unhealthy";
  if (hpPercentage > 0.8 && recentActions.workouts >= 4) return "strong";
  if (hpPercentage > 0.6) return "healthy";
  return "neutral";
}
```

### 2.3 Boss Fight System

**Simple Stat Check Algorithm:**
```javascript
function determineBossOutcome(characterAP, bossAP) {
  // Add slight randomness for excitement
  const modifier = Math.random() * 0.2 + 0.9; // 0.9 to 1.1 multiplier
  const effectiveAP = characterAP * modifier;
  
  return effectiveAP >= bossAP ? "victory" : "defeat";
}
```

**Boss Progression:**
- Boss 1: 15 AP requirement (encourages 2-3 workouts)
- Boss 2: 30 AP requirement 
- Boss 3: 50 AP requirement
- Scaling continues based on player level

## 3. Data Storage Architecture

### 3.1 Database Schema

**Characters Table:**
```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sprite TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  current_hp INTEGER DEFAULT 100,
  max_hp INTEGER DEFAULT 100,
  attack_power INTEGER DEFAULT 10,
  current_exp INTEGER DEFAULT 0,
  exp_to_next_level INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Action_Logs Table:**
```sql
CREATE TABLE action_logs (
  id INTEGER PRIMARY KEY,
  character_id INTEGER,
  action_type TEXT NOT NULL, -- 'healthy_meal', 'unhealthy_treat', 'workout', 'skip_workout'
  hp_change INTEGER DEFAULT 0,
  ap_change INTEGER DEFAULT 0,
  exp_change INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters (id)
);
```

**Boss_Battles Table:**
```sql
CREATE TABLE boss_battles (
  id INTEGER PRIMARY KEY,
  character_id INTEGER,
  boss_level INTEGER NOT NULL,
  character_ap INTEGER NOT NULL,
  boss_ap_requirement INTEGER NOT NULL,
  result TEXT NOT NULL, -- 'victory' or 'defeat'
  exp_awarded INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters (id)
);
```

### 3.2 Local Storage Strategy

**Why Local-First?**
- Works offline immediately
- No server costs for MVP
- Faster app performance
- User data privacy

**Future Cloud Sync:**
- Phase 2 will add optional cloud backup
- Use JSON export/import for data portability

## 4. User Interface Architecture

### 4.1 Component Hierarchy

```
App.js
├── Navigation Container
│   ├── CharacterCreationScreen
│   ├── MainDojoScreen
│   │   ├── CharacterDisplay
│   │   ├── StatsPanel (HP/AP/EXP)
│   │   ├── ActionButtons
│   │   └── BossFightButton
│   ├── BossFightScreen
│   │   ├── BattleAnimation
│   │   └── ResultModal
│   └── SettingsScreen
└── GlobalStateProvider (Redux)
```

### 4.2 Responsive Design Strategy

**Target Screen Sizes:**
- iPhone SE (4.7") to iPhone 14 Pro Max (6.7")
- Android phones with 5" to 6.5" screens
- Tablet support in Phase 2

**Design Principles:**
- Minimum touch target: 44px (iOS) / 48dp (Android)
- Character sprite scales with screen size
- UI elements use percentage-based positioning

## 5. Performance Optimization

### 5.1 Asset Management

**Sprite Sheets:**
- Combine character animations into single sprite sheets
- Reduces memory usage and load times
- Use tools like TexturePacker for optimization

**Audio Compression:**
- MP3 format for music (longer tracks)
- WAV format for short sound effects (better quality)
- Maximum file size: 1MB per audio file

### 5.2 Animation Strategy

**Character Animations:**
- Use React Native Animated API for smooth 60fps
- Preload all sprites at app launch
- Limit simultaneous animations to prevent lag

**Performance Targets:**
- App launch time: <3 seconds
- Screen transition time: <0.5 seconds
- Memory usage: <100MB on average device

## 6. Development Workflow

### 6.1 Version Control Strategy

**Git Branch Structure:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical bug fixes

**Commit Message Format:**
```
type(scope): description

Examples:
feat(character): add level up animation
fix(stats): correct HP calculation bug
docs(readme): update installation instructions
```

### 6.2 Testing Strategy

**Unit Tests (Jest):**
- Game logic functions (stat calculations)
- Component rendering
- Database operations

**Integration Tests:**
- Complete user flows (character creation to boss fight)
- State management interactions
- Audio/visual synchronization

**Manual Testing:**
- Device testing on iOS/Android
- Performance testing on older devices
- User experience validation

## 7. Security and Privacy

### 7.1 Data Protection

**Local Data Encryption:**
- SQLite database encrypted with SQLCipher
- Sensitive user data hashed before storage
- No personal health data transmitted externally

**Privacy by Design:**
- Minimal data collection in MVP
- User controls over data export/deletion
- Clear privacy policy for app stores

## 8. Development Timeline

### Phase 1: Core MVP (8-10 weeks)
- **Weeks 1-2:** Project setup, basic navigation, character creation
- **Weeks 3-4:** Character display, stats system, manual logging
- **Weeks 5-6:** Progression system, level up mechanics
- **Weeks 7-8:** Boss fight system, audio integration
- **Weeks 9-10:** Testing, polish, app store preparation

### Phase 2: Enhancement (4-6 weeks)
- Health app integration
- Expanded content (more characters, bosses)
- Analytics and crash reporting

## 9. Portfolio Value for AI Product Manager

### 9.1 Demonstrates Key PM Skills

**Technical Understanding:**
- Shows you can work with developers using technical specifications
- Demonstrates understanding of mobile app architecture
- Proves ability to make informed technology decisions

**User-Centered Design:**
- Clear user personas and user stories
- Evidence-based feature prioritization
- Understanding of gamification psychology

**Business Strategy:**
- Market analysis and competitive positioning
- Monetization strategy and roadmap planning
- Success metrics and KPI definition

### 9.2 AI Integration Opportunities

**Current AI Applications:**
- Character visual state could use simple ML for more nuanced health assessment
- Boss difficulty could adapt using basic recommendation algorithms

**Future AI Features:**
- Meal photo recognition and nutritional analysis
- Personalized workout recommendations
- Predictive modeling for user motivation and retention
- AI-generated pixel art for custom characters

**Why This Matters:**
- Shows understanding of AI as a product enhancement tool
- Demonstrates ability to identify practical AI applications
- Proves you can balance cutting-edge tech with user needs

### 9.3 Market Positioning

**Strong Portfolio Project Because:**
- Addresses real market need (gamified fitness)
- Shows innovation in saturated market
- Demonstrates full product lifecycle thinking
- Appeals to specific, well-defined user base
- Has clear monetization and scaling potential

This project perfectly positions you as a PM who understands both technical implementation and business strategy, with particular strength in consumer mobile products and emerging AI applications.

---

**Next Steps:** Begin with React Native tutorial, set up development environment, and start with character creation screen implementation.
