# Hitbox/Hurtbox System Documentation

## Overview
The Hitbox/Hurtbox System provides precise, frame-based collision detection for the fighting game. It uses Matter.js for efficient physics calculations while maintaining the authentic feel of traditional fighting games.

## Key Features
- **Frame-based activation**: Hitboxes activate on specific frames of animations
- **Multiple box types**: Strike, Projectile, Throw, Counter
- **Priority system**: Determines which attacks win in clashes
- **Visual debugging**: See hitboxes/hurtboxes in real-time
- **Mobile optimized**: Object pooling and efficient collision checks

## Architecture

### Core Components

1. **HitboxHurtboxSystem** - Main system that manages all collision detection
2. **Hitbox** - Offensive collision areas that deal damage
3. **Hurtbox** - Defensive collision areas that receive damage
4. **CharacterHitboxData** - Defines hitbox/hurtbox configurations per character

### Integration Flow

```javascript
// 1. Initialize the system
const hitboxSystem = initializeCombatSystem(matterEngine, debugMode);

// 2. System automatically creates boxes for fighters
// 3. Updates happen each frame in CombatSystem
// 4. Collisions trigger hit callbacks
```

## Usage

### Basic Attack Definition

```javascript
// In CharacterHitboxData.js
lightPunch: {
  startup: 2,      // Frames before hitbox appears
  active: 3,       // Frames hitbox is active
  recovery: 8,     // Frames after hitbox disappears
  hitboxes: [{
    type: HitboxType.STRIKE,
    priority: HitboxPriority.LOW,
    offset: { x: 35, y: -35 },  // Position relative to character
    width: 35,
    height: 25,
    damage: 8,
    hitstun: 250,               // Frames opponent is stunned
    blockstun: 100,             // Frames if blocked
    knockback: { x: 100, y: -30 },
    activeFrames: [[2, 4]],     // Active on frames 2-4
  }],
}
```

### Hitbox Types

- **STRIKE**: Normal physical attacks (punches, kicks)
- **PROJECTILE**: Ranged attacks (fireballs, energy blasts)
- **THROW**: Unblockable grabs
- **COUNTER**: Triggers counter-attack on hit

### Hurtbox Types

- **NORMAL**: Standard vulnerable state
- **INVULNERABLE**: Cannot be hit (dodge rolls, etc.)
- **COUNTER**: Triggers counter-attack when hit
- **ARMOR**: Takes reduced damage

## Visual Debugging

Enable debug mode to see:
- Red boxes: Active hitboxes
- Green boxes: Normal hurtboxes
- Gray boxes: Invulnerable hurtboxes
- Yellow boxes: Counter stance hurtboxes
- Blue boxes: Armored hurtboxes

```javascript
// Toggle debug mode
hitboxSystem.toggleDebugMode();
```

## Performance Optimization

### Object Pooling
Hitboxes are reused instead of creating new ones each frame.

### Spatial Partitioning
Only checks collisions between nearby entities.

### Frame-based Updates
Hitboxes only exist during active frames, reducing checks.

## Mobile Considerations

1. **Simplified Shapes**: Uses rectangles only for fast collision
2. **Reduced Precision**: 60fps target with adaptive quality
3. **Touch-friendly**: Larger hitboxes for mobile gameplay

## Adding New Attacks

1. Define attack in `CharacterHitboxData.js`
2. Add animation frames to match hitbox timing
3. Test with debug mode enabled
4. Adjust frame data based on gameplay feel

## Common Patterns

### Multi-hit Attacks
```javascript
spinningKick: {
  hitboxes: [
    { activeFrames: [[5, 8]] },   // First hit
    { activeFrames: [[9, 12]] },  // Second hit
  ]
}
```

### Invincible Moves
```javascript
uppercut: {
  invulnerableFrames: [1, 5],  // Invincible frames 1-5
  hitboxes: [...]
}
```

### Projectiles
```javascript
fireball: {
  projectile: {
    type: HitboxType.PROJECTILE,
    speed: 400,
    lifetime: 2,  // Seconds
  }
}
```

## Troubleshooting

### Hitbox Not Appearing
- Check activeFrames match animation length
- Verify fighter state is 'attacking'
- Enable debug mode to visualize

### Attacks Not Connecting
- Adjust hitbox offset and size
- Check if defender is invulnerable
- Verify priority levels for clashes

### Performance Issues
- Reduce number of active hitboxes
- Increase frame intervals for checks
- Use simpler collision shapes