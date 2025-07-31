/**
 * Entity Manager for creating and managing game entities
 * Handles entity creation with proper defaults for fighting game mechanics
 */

export class EntityManager {
  constructor() {
    this.entityCount = 0;
    this.entities = new Map();
  }
  
  generateId(type) {
    return `${type}_${++this.entityCount}`;
  }
  
  createFighter(config) {
    const id = config.id || this.generateId('fighter');
    
    const fighter = {
      id,
      type: 'fighter',
      
      // Position and physics
      position: config.position || { x: 100, y: 300 },
      previousPosition: { ...config.position },
      velocity: { x: 0, y: 0 },
      grounded: true,
      facing: config.flipX ? 'left' : 'right',
      
      // Size and collision
      width: config.width || 64,
      height: config.height || 96,
      hitbox: {
        x: 0,
        y: 0,
        width: config.width || 64,
        height: config.height || 96,
      },
      
      // Combat stats
      health: config.stats?.health || 100,
      maxHealth: config.stats?.health || 100,
      stats: {
        strength: config.stats?.strength || 10,
        defense: config.stats?.defense || 5,
        speed: config.stats?.speed || 300,
      },
      
      // Combat state
      state: 'idle',
      currentAttack: null,
      attackFrame: 0,
      attackDuration: 0,
      attackDamage: 0,
      attackRange: 50,
      
      // Combat tracking
      comboCount: 0,
      maxCombo: 0,
      lastComboTime: 0,
      specialMeter: 0,
      damageDealt: 0,
      damageTaken: 0,
      
      // Status effects
      hitstun: 0,
      blockstun: 0,
      invincible: false,
      invincibilityFrames: 0,
      
      // Animation
      animation: {
        current: 'idle',
        frame: 0,
        frameTimer: 0,
        finished: false,
      },
      
      // Sprite data
      sprite: config.sprite,
      frameWidth: 64,
      frameHeight: 96,
      spriteFrame: { x: 0, y: 0, width: 64, height: 96 },
      scale: 1,
      alpha: 1,
      tint: 0xFFFFFF,
      flipX: config.flipX || false,
      
      // Input handling
      inputQueue: [],
      inputState: {
        buffer: [],
        currentInputs: {},
        lastInputTime: 0,
      },
      
      // AI config (for boss)
      isAI: config.type === 'boss',
      aiType: config.aiType || 'aggressive',
      aiState: 'idle',
      aiTarget: null,
    };
    
    this.entities.set(id, fighter);
    return fighter;
  }
  
  createProjectile(config) {
    const id = this.generateId('projectile');
    
    const projectile = {
      id,
      type: 'projectile',
      ownerId: config.ownerId,
      
      // Physics
      position: { ...config.position },
      velocity: { ...config.velocity },
      
      // Collision
      hitbox: {
        x: config.position.x - 15,
        y: config.position.y - 15,
        width: 30,
        height: 30,
      },
      
      // Combat
      damage: config.damage || 15,
      knockback: config.knockback || { x: 200, y: -100 },
      
      // Lifetime
      lifetime: config.lifetime || 2,
      maxLifetime: config.lifetime || 2,
      
      // Visuals
      sprite: config.sprite || 'fireball',
      rotation: 0,
      scale: 1,
      alpha: 1,
      trailAlpha: 0.6,
      
      destroyed: false,
    };
    
    this.entities.set(id, projectile);
    return projectile;
  }
  
  createEffect(config) {
    const id = this.generateId('effect');
    
    const effect = {
      id,
      type: 'effect',
      effectType: config.effectType,
      
      // Position
      position: { ...config.position },
      velocity: config.velocity || { x: 0, y: 0 },
      
      // Follow entity
      followEntity: config.followEntity,
      offset: config.offset || { x: 0, y: 0 },
      
      // Lifetime
      lifetime: config.lifetime || 0.5,
      maxLifetime: config.lifetime || 0.5,
      
      // Visuals
      sprite: config.sprite,
      scale: config.scale || 1,
      alpha: config.alpha || 1,
      rotation: 0,
      color: config.color,
      
      destroyed: false,
    };
    
    this.entities.set(id, effect);
    return effect;
  }
  
  createArena(config) {
    return {
      id: 'arena',
      type: 'arena',
      background: config.background,
      width: config.width || 800,
      height: config.height || 400,
      floorY: config.floorY || 300,
      hazards: config.hazards || [],
    };
  }
  
  createHUD(config) {
    return {
      id: 'hud',
      type: 'hud',
      playerHP: config.playerMaxHP || 100,
      playerMaxHP: config.playerMaxHP || 100,
      bossHP: config.bossMaxHP || 100,
      bossMaxHP: config.bossMaxHP || 100,
      comboCount: 0,
      specialMeter: 0,
      roundTime: 99,
      score: 0,
    };
  }
  
  getEntity(id) {
    return this.entities.get(id);
  }
  
  removeEntity(id) {
    this.entities.delete(id);
  }
  
  getEntitiesByType(type) {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }
  
  clear() {
    this.entities.clear();
    this.entityCount = 0;
  }
}