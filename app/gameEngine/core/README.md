# 16BitFit Unified Game Engine

## Overview

This is the unified game engine for 16BitFit, built on `react-native-game-engine` to provide optimal mobile performance for fighting game mechanics at 60fps.

## Architecture

### Core Components

1. **GameEngine.js** - Main engine class that manages the game loop, entities, and systems
2. **Systems/** - Game systems that update entities each frame
   - `GameLoop.js` - Fixed timestep game loop
   - `InputSystem.js` - Input handling with buffer for combos
   - `PhysicsSystem.js` - 2D physics for fighters and projectiles
   - `CombatSystem.js` - Fighting mechanics, damage, combos
   - `AnimationSystem.js` - Sprite animations and effects
   - `RenderSystem.js` - Rendering with interpolation

3. **Managers/** - Resource and entity management
   - `EntityManager.js` - Creates and manages game entities
   - `AssetManager.js` - Loads and caches sprites/sounds
   - `ObjectPool.js` - Object pooling for performance

### Key Features

- **Fixed Timestep**: Consistent 60fps physics updates
- **Input Buffering**: 500ms buffer for combo detection
- **Object Pooling**: Reuses objects to prevent GC pauses
- **Sprite Animation**: Frame-based animation system
- **Combat System**: Damage calculation, hitstun, blockstun
- **Special Moves**: Combo patterns like Hadouken, Shoryuken

### Performance Optimizations

1. **Fixed Timestep with Interpolation**
   ```javascript
   // Physics runs at fixed 60fps
   while (accumulator >= FIXED_TIMESTEP) {
     updatePhysics(FIXED_TIMESTEP);
     accumulator -= FIXED_TIMESTEP;
   }
   // Render interpolates between frames
   const alpha = accumulator / FIXED_TIMESTEP;
   ```

2. **Object Pooling**
   - Projectiles, effects, and particles are pooled
   - Prevents garbage collection during gameplay

3. **Efficient Collision Detection**
   - AABB hitbox collision only
   - Spatial partitioning for many entities

## Usage

```javascript
import UnifiedBattleGame from './components/UnifiedBattleGame';

<UnifiedBattleGame
  playerStats={playerStats}
  boss={bossConfig}
  onBattleEnd={handleBattleEnd}
  onUpdateStats={handleUpdateStats}
/>
```

## Entity Structure

### Fighter Entity
```javascript
{
  id: 'player',
  type: 'fighter',
  position: { x, y },
  velocity: { x, y },
  health: 100,
  state: 'idle|attacking|hurt|blocking',
  animation: { current, frame, frameTimer },
  inputQueue: [],
  comboCount: 0,
  specialMeter: 0,
}
```

### Combat Flow

1. **Input** → InputSystem processes button presses
2. **Physics** → PhysicsSystem updates positions
3. **Combat** → CombatSystem checks collisions
4. **Animation** → AnimationSystem updates sprites
5. **Render** → RenderSystem draws everything

## Adding New Features

### New Attack Type
1. Add to `ANIMATION_DATA` in AnimationSystem
2. Define damage/range in InputSystem
3. Add hitbox data in CombatSystem

### New Visual Effect
1. Create effect in AnimationSystem
2. Add to ObjectPool if frequently used
3. Trigger from CombatSystem on hit

## Performance Tips

- Keep entity count under 50 for mobile
- Use object pooling for all temporary objects
- Batch sprite updates when possible
- Profile with React DevTools Profiler