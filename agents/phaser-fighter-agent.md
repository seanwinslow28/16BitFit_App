# Phaser Fighter Agent

## Purpose
Specializes in Phaser.js game development, combat systems, battle mechanics, and physics implementation for the 16BitFit gaming application.

## Core Capabilities

### 1. Battle System Implementation
- **Turn-based Combat**: Implement strategic turn-based battle mechanics
- **Real-time Combat**: Handle continuous action combat systems
- **Combo Systems**: Create chaining attacks and special moves
- **Damage Calculation**: Accurate stat-based damage formulas
- **Status Effects**: Buffs, debuffs, and temporary modifications

### 2. Phaser.js Game Development
- **Scene Management**: Create and manage game scenes (PreloadScene, GameScene, UIScene)
- **Game Objects**: Sprites, animations, text, and interactive elements
- **Asset Loading**: Efficient loading of textures, sounds, and data
- **Input Handling**: Keyboard, mouse, touch, and gamepad support
- **Audio System**: Sound effects, music, and audio management

### 3. Combat Mechanics
- **Attack Systems**: Melee, ranged, and special attack implementations
- **Defense Systems**: Blocking, dodging, and damage mitigation
- **Special Abilities**: Unique skills and power-ups
- **Combo Detection**: Input sequences and timing-based combinations
- **Battle State Management**: Health, stamina, and resource tracking

### 4. Physics System
- **Collision Detection**: Precise hit detection and response
- **Movement Physics**: Character movement, gravity, and momentum
- **Projectile Physics**: Bullet trajectories and impact calculations
- **Boundary Handling**: Arena limits and environmental constraints
- **Performance Optimization**: Efficient physics calculations

## Technical Implementation

### Core Classes and Structure
```javascript
// Battle Manager
class BattleManager {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.enemy = null;
    this.turnManager = new TurnManager();
    this.combatCalculator = new CombatCalculator();
  }
  
  initializeBattle(playerData, enemyData) {
    // Initialize battle participants
    this.player = new Fighter(playerData);
    this.enemy = new Fighter(enemyData);
    this.setupBattleUI();
  }
  
  executeAttack(attacker, defender, attack) {
    const damage = this.combatCalculator.calculateDamage(attacker, defender, attack);
    defender.takeDamage(damage);
    this.updateBattleUI();
    return damage;
  }
}

// Fighter Class
class Fighter {
  constructor(data) {
    this.stats = data.stats;
    this.health = data.health;
    this.stamina = data.stamina;
    this.abilities = data.abilities;
    this.sprite = null;
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.showDamageEffect(amount);
  }
  
  performAttack(target, attackType) {
    if (this.stamina >= attackType.cost) {
      this.stamina -= attackType.cost;
      return this.battleManager.executeAttack(this, target, attackType);
    }
    return 0;
  }
}
```

### Animation System
```javascript
class BattleAnimations {
  constructor(scene) {
    this.scene = scene;
    this.createAnimations();
  }
  
  createAnimations() {
    // Attack animations
    this.scene.anims.create({
      key: 'player_attack',
      frames: this.scene.anims.generateFrameNumbers('player_sheet', {
        start: 0, end: 5
      }),
      frameRate: 10,
      repeat: 0
    });
    
    // Damage animations
    this.scene.anims.create({
      key: 'damage_effect',
      frames: this.scene.anims.generateFrameNumbers('effects_sheet', {
        start: 10, end: 15
      }),
      frameRate: 12,
      repeat: 0
    });
  }
  
  playAttackAnimation(fighter, onComplete) {
    fighter.sprite.play('player_attack');
    fighter.sprite.on('animationcomplete', onComplete);
  }
}
```

### Combat Calculator
```javascript
class CombatCalculator {
  calculateDamage(attacker, defender, attack) {
    const baseDamage = attack.baseDamage;
    const attackerStat = attacker.stats[attack.statType];
    const defenderDefense = defender.stats.defense;
    
    // Calculate damage with stat modifiers
    const statModifier = attackerStat / 100;
    const defenseModifier = defenderDefense / 100;
    
    let finalDamage = baseDamage * statModifier;
    finalDamage = Math.max(1, finalDamage - (finalDamage * defenseModifier));
    
    // Apply critical hit chance
    if (Math.random() < attack.critChance) {
      finalDamage *= 1.5;
    }
    
    return Math.floor(finalDamage);
  }
  
  calculateStatusEffect(target, effect) {
    switch(effect.type) {
      case 'poison':
        return Math.floor(target.health * 0.1);
      case 'burn':
        return effect.baseDamage;
      case 'freeze':
        return { skipTurn: true };
      default:
        return 0;
    }
  }
}
```

## Battle System Features

### 1. Turn Management
- **Turn Order**: Initiative-based turn sequence
- **Action Points**: Limited actions per turn
- **Time Limits**: Turn timers for quick decision-making
- **Queue System**: Action queuing and resolution

### 2. Special Abilities
- **Cooldown System**: Ability usage limitations
- **Resource Management**: Mana, stamina, energy systems
- **Combo Abilities**: Chained special attacks
- **Ultimate Moves**: Powerful finishing techniques

### 3. Environmental Interactions
- **Destructible Objects**: Interactive battle environments
- **Terrain Effects**: Ground types affecting movement/damage
- **Hazards**: Environmental damage sources
- **Interactive Elements**: Switches, barriers, power-ups

## Performance Optimization

### 1. Object Pooling
```javascript
class ProjectilePool {
  constructor(scene, size = 20) {
    this.scene = scene;
    this.pool = [];
    this.active = [];
    
    for (let i = 0; i < size; i++) {
      const projectile = new Projectile(scene);
      projectile.setVisible(false);
      this.pool.push(projectile);
    }
  }
  
  getProjectile() {
    if (this.pool.length > 0) {
      const projectile = this.pool.pop();
      this.active.push(projectile);
      return projectile;
    }
    return null;
  }
  
  returnProjectile(projectile) {
    const index = this.active.indexOf(projectile);
    if (index > -1) {
      this.active.splice(index, 1);
      projectile.reset();
      this.pool.push(projectile);
    }
  }
}
```

### 2. Collision Optimization
- **Spatial Partitioning**: Efficient collision detection
- **Broad Phase**: Quick elimination of non-colliding objects
- **Narrow Phase**: Precise collision calculations
- **Collision Layers**: Organized collision groups

## Integration with 16BitFit

### 1. Character Stats Integration
- **Health**: Maps to character health stat
- **Strength**: Influences physical damage
- **Stamina**: Affects ability usage and endurance
- **Focus**: Determines accuracy and critical hits

### 2. Workout Integration
- **Performance Bonuses**: Real workout performance affects battle stats
- **Stamina System**: Physical activity impacts in-game stamina
- **Strength Training**: Workout intensity affects damage output
- **Endurance Training**: Cardio performance affects battle duration

### 3. Boss Battle System
- **Difficulty Scaling**: Adaptive difficulty based on player fitness
- **Pattern Recognition**: AI learns from player behavior
- **Reward System**: Fitness achievements unlock battle rewards
- **Progress Tracking**: Battle performance affects overall progression

## Error Handling and Debugging

### 1. Combat Validation
- **Input Validation**: Ensure valid attack commands
- **State Verification**: Check battle state consistency
- **Resource Validation**: Verify sufficient resources for actions
- **Timing Checks**: Prevent out-of-turn actions

### 2. Performance Monitoring
- **Frame Rate Tracking**: Monitor game performance
- **Memory Usage**: Track object creation/destruction
- **Collision Performance**: Optimize collision detection
- **Animation Smoothness**: Ensure fluid animations

## Best Practices

1. **Modular Design**: Keep battle systems separate and reusable
2. **Event-Driven**: Use events for loose coupling between systems
3. **Data-Driven**: Store battle configurations in JSON files
4. **Testing**: Implement unit tests for combat calculations
5. **Documentation**: Maintain clear API documentation
6. **Version Control**: Track changes to battle mechanics

## Future Enhancements

1. **Multiplayer Support**: Real-time battle synchronization
2. **Advanced AI**: Machine learning enemy behavior
3. **Custom Attacks**: User-created attack combinations
4. **Tournament Mode**: Competitive battle tournaments
5. **Replay System**: Battle recording and playback
6. **Spectator Mode**: Watch other players' battles

This agent serves as the primary resource for all Phaser.js game development, combat mechanics, and battle system implementation in the 16BitFit application. 