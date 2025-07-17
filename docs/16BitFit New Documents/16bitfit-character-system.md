# 16BitFit Character Stat System & State Machine

## Core Character Stats

### Primary Stats
```javascript
const baseStats = {
  health: 100,        // Overall health (0-100)
  strength: 50,       // Physical power (0-100)
  stamina: 50,        // Energy/endurance (0-100)
  happiness: 75,      // Mental wellbeing (0-100)
  weight: 50          // Body composition (0-100, 50 is ideal)
};
```

### Derived Stats
```javascript
const derivedStats = {
  // Combat power for boss fights
  attackPower: (strength * 0.7 + stamina * 0.3),
  defense: (health * 0.5 + stamina * 0.5),
  
  // Visual state triggers
  muscleDefinition: strength > 70 ? 'ripped' : strength > 40 ? 'fit' : 'soft',
  bodyType: weight > 70 ? 'chubby' : weight < 30 ? 'skinny' : 'normal'
};
```

## Character States & Sprite Mapping

### State Machine Definition
```javascript
const characterStates = {
  IDLE_HEALTHY: {
    sprite: 'idle_normal',
    conditions: {
      health: [60, 100],
      weight: [40, 60]
    }
  },
  
  IDLE_SICK: {
    sprite: 'idle_sick',
    blinkAnimation: true,
    conditions: {
      health: [0, 40],
      happiness: [0, 30]
    }
  },
  
  IDLE_CHUBBY: {
    sprite: 'idle_chubby',
    conditions: {
      weight: [70, 100]
    }
  },
  
  FLEXING: {
    sprite: 'muscle_flex',
    duration: 2000, // 2 seconds
    sound: 'flex_sound.mp3',
    trigger: 'healthy_action'
  },
  
  THUMBS_UP: {
    sprite: 'thumbs_up',
    duration: 1500,
    sound: 'success_sound.mp3',
    trigger: 'workout_complete'
  },
  
  EATING_HEALTHY: {
    sprite: 'eating_healthy',
    duration: 1500,
    sound: 'crunch_sound.mp3',
    trigger: 'healthy_food'
  },
  
  DAMAGE_BLINK: {
    sprite: 'current_sprite',
    blinkEffect: true,
    duration: 1000,
    sound: 'damage_sound.mp3',
    trigger: 'unhealthy_action'
  }
};
```

## Action Effects on Stats

### Food Actions
```javascript
const foodEffects = {
  // Healthy foods
  salad: {
    health: +5,
    weight: -2,
    stamina: +3,
    happiness: +2,
    animation: 'EATING_HEALTHY'
  },
  
  protein: {
    strength: +5,
    health: +3,
    stamina: +2,
    animation: 'FLEXING'
  },
  
  // Unhealthy foods
  junkFood: {
    health: -3,
    weight: +5,
    stamina: -2,
    happiness: +1, // Temporary happiness
    animation: 'DAMAGE_BLINK'
  },
  
  soda: {
    health: -2,
    weight: +3,
    stamina: -1,
    animation: 'DAMAGE_BLINK'
  }
};
```

### Workout Actions
```javascript
const workoutEffects = {
  cardio: {
    stamina: +5,
    weight: -3,
    health: +2,
    strength: +1,
    animation: 'THUMBS_UP'
  },
  
  strength_training: {
    strength: +5,
    stamina: +2,
    health: +3,
    weight: -1,
    animation: 'FLEXING'
  },
  
  skip_workout: {
    stamina: -3,
    strength: -2,
    weight: +2,
    happiness: -5,
    animation: 'DAMAGE_BLINK'
  }
};
```

## Daily Decay System
```javascript
// Stats naturally decay over time
const dailyDecay = {
  health: -1,
  strength: -1,
  stamina: -2,
  happiness: -2,
  weight: +1  // Weight increases without activity
};
```

## State Transition Logic

### Implementation Example
```javascript
class CharacterStateManager {
  constructor() {
    this.currentState = 'IDLE_HEALTHY';
    this.stats = { ...baseStats };
    this.animationQueue = [];
  }
  
  processAction(actionType, actionName) {
    // Get effect based on action
    const effect = actionType === 'food' 
      ? foodEffects[actionName] 
      : workoutEffects[actionName];
    
    // Apply stat changes
    this.updateStats(effect);
    
    // Queue animation
    this.playAnimation(effect.animation);
    
    // Check for state changes
    this.evaluateIdleState();
  }
  
  updateStats(effect) {
    Object.keys(effect).forEach(stat => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] = Math.max(0, Math.min(100, 
          this.stats[stat] + effect[stat]
        ));
      }
    });
  }
  
  evaluateIdleState() {
    // Determine which idle state to return to
    if (this.stats.health < 40) {
      this.idleState = 'IDLE_SICK';
    } else if (this.stats.weight > 70) {
      this.idleState = 'IDLE_CHUBBY';
    } else {
      this.idleState = 'IDLE_HEALTHY';
    }
  }
  
  playAnimation(animationState) {
    const state = characterStates[animationState];
    
    // Play sound
    if (state.sound) {
      this.playSound(state.sound);
    }
    
    // Set sprite
    this.setSprite(state.sprite);
    
    // Handle special effects
    if (state.blinkEffect) {
      this.applyBlinkEffect();
    }
    
    // Return to idle after duration
    if (state.duration) {
      setTimeout(() => {
        this.returnToIdle();
      }, state.duration);
    }
  }
}
```

## Sprite Sheet Organization

### Recommended Sprite Structure
```
sprites/
├── idle/
│   ├── idle_healthy.png (32x32, 4 frames)
│   ├── idle_sick.png (32x32, 4 frames)
│   └── idle_chubby.png (32x32, 4 frames)
├── actions/
│   ├── muscle_flex.png (32x32, 8 frames)
│   ├── thumbs_up.png (32x32, 6 frames)
│   └── eating.png (32x32, 6 frames)
└── effects/
    └── damage_blink.png (overlay effect)
```

## Animation Configuration for Phaser

```javascript
// In your Phaser scene
createAnimations() {
  // Idle animations (loop)
  this.anims.create({
    key: 'idle_healthy',
    frames: this.anims.generateFrameNumbers('character', {
      start: 0,
      end: 3
    }),
    frameRate: 4,
    repeat: -1
  });
  
  // Action animations (play once)
  this.anims.create({
    key: 'muscle_flex',
    frames: this.anims.generateFrameNumbers('character', {
      start: 8,
      end: 15
    }),
    frameRate: 8,
    repeat: 0
  });
  
  // Damage blink effect
  this.tweens.add({
    targets: this.character,
    alpha: 0,
    duration: 100,
    ease: 'Power1',
    yoyo: true,
    repeat: 5
  });
}
```

## Boss Battle Scaling

### Power Level Calculation
```javascript
const calculatePowerLevel = (stats) => {
  return Math.floor(
    (stats.strength * 0.4) +
    (stats.stamina * 0.3) +
    (stats.health * 0.2) +
    (stats.happiness * 0.1)
  );
};

// Boss difficulty tiers
const bossTiers = [
  { minPower: 0, maxPower: 30, name: 'Training Dummy' },
  { minPower: 31, maxPower: 50, name: 'Gym Bully' },
  { minPower: 51, maxPower: 70, name: 'Fitness Guru' },
  { minPower: 71, maxPower: 90, name: 'Champion' },
  { minPower: 91, maxPower: 100, name: 'Ultimate Warrior' }
];
```

## Sound Effect Triggers

### Audio Management
```javascript
const soundEffects = {
  // Positive sounds
  flex_sound: { 
    file: 'flex.mp3',
    volume: 0.7,
    playbackRate: 1.0
  },
  success_sound: {
    file: 'success_chime.mp3',
    volume: 0.6,
    playbackRate: 1.2
  },
  crunch_sound: {
    file: 'veggie_crunch.mp3',
    volume: 0.5,
    playbackRate: 1.0
  },
  
  // Negative sounds
  damage_sound: {
    file: 'damage_bloop.mp3',
    volume: 0.8,
    playbackRate: 0.8
  },
  sick_groan: {
    file: 'ugh.mp3',
    volume: 0.4,
    playbackRate: 0.9
  }
};
```

## MVP Implementation Checklist

1. **Basic Stats Tracking**
   - [ ] Implement core stats object
   - [ ] Create stat update functions
   - [ ] Add daily decay timer

2. **Sprite States**
   - [ ] Set up idle animations (healthy, sick, chubby)
   - [ ] Implement action animations (flex, thumbs up)
   - [ ] Add damage blink effect

3. **User Actions**
   - [ ] Food input system
   - [ ] Workout logging
   - [ ] Skip/negative action tracking

4. **Audio**
   - [ ] Load sound effects
   - [ ] Trigger sounds with animations
   - [ ] Volume controls

5. **Visual Feedback**
   - [ ] Smooth sprite transitions
   - [ ] Stat change indicators (+/- numbers)
   - [ ] Health/strength bars

## Future Enhancements

- **Combo System**: Chain healthy actions for bonus effects
- **Mood System**: Happiness affects stat gain multipliers
- **Special Animations**: Unlock new celebration animations
- **Seasonal Events**: Holiday-themed food/workout challenges
- **Social Features**: Compare stats with friends