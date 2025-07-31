/**
 * Hitbox/Hurtbox System for precise fighting game collision detection
 * Manages frame-based hitbox activation, collision detection, and debug visualization
 */

import Matter from 'matter-js';

// Hitbox types
export const HitboxType = {
  STRIKE: 'strike',      // Normal attacks
  PROJECTILE: 'projectile', // Projectiles
  THROW: 'throw',        // Grab/throw hitboxes
  COUNTER: 'counter',    // Counter-attack hitboxes
};

// Hurtbox types
export const HurtboxType = {
  NORMAL: 'normal',      // Standard hurtbox
  INVULNERABLE: 'invulnerable', // Can't be hit
  COUNTER: 'counter',    // Triggers counter on hit
  ARMOR: 'armor',        // Takes reduced damage
};

// Priority levels for hitbox interactions
export const HitboxPriority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  SUPER: 4,
};

class Hitbox {
  constructor(config) {
    this.id = config.id || `hitbox_${Date.now()}_${Math.random()}`;
    this.ownerId = config.ownerId;
    this.type = config.type || HitboxType.STRIKE;
    this.priority = config.priority || HitboxPriority.MEDIUM;
    
    // Position relative to owner
    this.offset = config.offset || { x: 0, y: 0 };
    this.width = config.width || 50;
    this.height = config.height || 50;
    
    // Damage properties
    this.damage = config.damage || 10;
    this.hitstun = config.hitstun || 300;
    this.blockstun = config.blockstun || 150;
    this.knockback = config.knockback || { x: 200, y: -100 };
    
    // Frame data
    this.activeFrames = config.activeFrames || []; // Array of frame ranges [start, end]
    this.currentFrame = 0;
    this.active = false;
    
    // Visual properties for debugging
    this.color = config.color || 'rgba(255, 0, 0, 0.5)';
    
    // Create Matter.js body for collision detection
    this.body = null;
    this.createPhysicsBody();
  }
  
  createPhysicsBody() {
    this.body = Matter.Bodies.rectangle(
      this.offset.x,
      this.offset.y,
      this.width,
      this.height,
      {
        isSensor: true, // Don't affect physics, just detect collisions
        label: `hitbox_${this.id}`,
        hitboxData: this, // Store reference to hitbox data
      }
    );
  }
  
  updatePosition(ownerPosition, ownerFacing) {
    if (!this.body) return;
    
    // Flip offset based on facing direction
    const flippedOffsetX = ownerFacing === 'right' ? this.offset.x : -this.offset.x;
    
    Matter.Body.setPosition(this.body, {
      x: ownerPosition.x + flippedOffsetX,
      y: ownerPosition.y + this.offset.y,
    });
  }
  
  updateFrame(frame) {
    this.currentFrame = frame;
    
    // Check if hitbox should be active this frame
    this.active = this.activeFrames.some(([start, end]) => 
      frame >= start && frame <= end
    );
    
    // Enable/disable Matter.js body based on active state
    if (this.body) {
      this.body.isSensor = !this.active;
    }
  }
  
  getWorldBounds(ownerPosition, ownerFacing) {
    const flippedOffsetX = ownerFacing === 'right' ? this.offset.x : -this.offset.x;
    
    return {
      x: ownerPosition.x + flippedOffsetX - this.width / 2,
      y: ownerPosition.y + this.offset.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

class Hurtbox {
  constructor(config) {
    this.id = config.id || `hurtbox_${Date.now()}_${Math.random()}`;
    this.ownerId = config.ownerId;
    this.type = config.type || HurtboxType.NORMAL;
    
    // Position relative to owner
    this.offset = config.offset || { x: 0, y: 0 };
    this.width = config.width || 60;
    this.height = config.height || 90;
    
    // Defense modifiers
    this.damageMultiplier = config.damageMultiplier || 1.0;
    
    // Visual properties for debugging
    this.color = config.color || 'rgba(0, 255, 0, 0.3)';
    
    // Create Matter.js body
    this.body = null;
    this.createPhysicsBody();
  }
  
  createPhysicsBody() {
    this.body = Matter.Bodies.rectangle(
      this.offset.x,
      this.offset.y,
      this.width,
      this.height,
      {
        isSensor: true,
        label: `hurtbox_${this.id}`,
        hurtboxData: this,
      }
    );
  }
  
  updatePosition(ownerPosition, ownerFacing) {
    if (!this.body) return;
    
    // Hurtboxes typically don't flip with facing
    Matter.Body.setPosition(this.body, {
      x: ownerPosition.x + this.offset.x,
      y: ownerPosition.y + this.offset.y,
    });
  }
  
  setType(type) {
    this.type = type;
    
    // Update visual color based on type
    switch (type) {
      case HurtboxType.INVULNERABLE:
        this.color = 'rgba(128, 128, 128, 0.3)';
        break;
      case HurtboxType.COUNTER:
        this.color = 'rgba(255, 255, 0, 0.3)';
        break;
      case HurtboxType.ARMOR:
        this.color = 'rgba(0, 0, 255, 0.3)';
        break;
      default:
        this.color = 'rgba(0, 255, 0, 0.3)';
    }
  }
  
  getWorldBounds(ownerPosition) {
    return {
      x: ownerPosition.x + this.offset.x - this.width / 2,
      y: ownerPosition.y + this.offset.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

export class HitboxHurtboxSystem {
  constructor(engine, debugMode = false) {
    this.engine = engine;
    this.debugMode = debugMode;
    this.hitboxes = new Map(); // ownerId -> Hitbox[]
    this.hurtboxes = new Map(); // ownerId -> Hurtbox[]
    this.collisionPairs = new Set(); // Track processed collisions this frame
    
    // Create separate Matter.js world for hitbox/hurtbox detection
    this.hitboxWorld = Matter.World.create();
    
    // Setup collision detection
    this.setupCollisionDetection();
  }
  
  setupCollisionDetection() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const hitbox = pair.bodyA.hitboxData || pair.bodyB.hitboxData;
        const hurtbox = pair.bodyA.hurtboxData || pair.bodyB.hurtboxData;
        
        if (hitbox && hurtbox && hitbox.ownerId !== hurtbox.ownerId) {
          this.handleHitboxCollision(hitbox, hurtbox);
        }
      });
    });
  }
  
  addHitbox(ownerId, hitboxConfig) {
    const hitbox = new Hitbox({ ...hitboxConfig, ownerId });
    
    if (!this.hitboxes.has(ownerId)) {
      this.hitboxes.set(ownerId, []);
    }
    
    this.hitboxes.get(ownerId).push(hitbox);
    Matter.World.add(this.hitboxWorld, hitbox.body);
    
    return hitbox;
  }
  
  addHurtbox(ownerId, hurtboxConfig) {
    const hurtbox = new Hurtbox({ ...hurtboxConfig, ownerId });
    
    if (!this.hurtboxes.has(ownerId)) {
      this.hurtboxes.set(ownerId, []);
    }
    
    this.hurtboxes.get(ownerId).push(hurtbox);
    Matter.World.add(this.hitboxWorld, hurtbox.body);
    
    return hurtbox;
  }
  
  removeHitbox(ownerId, hitboxId) {
    const hitboxes = this.hitboxes.get(ownerId);
    if (!hitboxes) return;
    
    const index = hitboxes.findIndex(h => h.id === hitboxId);
    if (index !== -1) {
      const hitbox = hitboxes[index];
      Matter.World.remove(this.hitboxWorld, hitbox.body);
      hitboxes.splice(index, 1);
    }
  }
  
  clearOwnerHitboxes(ownerId) {
    const hitboxes = this.hitboxes.get(ownerId);
    if (hitboxes) {
      hitboxes.forEach(hitbox => {
        Matter.World.remove(this.hitboxWorld, hitbox.body);
      });
      this.hitboxes.delete(ownerId);
    }
  }
  
  update(entities) {
    // Clear collision pairs from previous frame
    this.collisionPairs.clear();
    
    // Update all hitbox/hurtbox positions and states
    Object.values(entities).forEach(entity => {
      if (entity && entity.type === 'fighter') {
        this.updateEntityBoxes(entity);
      }
    });
    
    // Check for collisions manually (more control than Matter.js events)
    this.checkCollisions();
    
    return entities;
  }
  
  updateEntityBoxes(entity) {
    // Ensure entity has required properties
    if (!entity || !entity.position || entity.facing === undefined) {
      return;
    }
    
    const entityHitboxes = this.hitboxes.get(entity.id) || [];
    const entityHurtboxes = this.hurtboxes.get(entity.id) || [];
    
    // Update hitbox positions and active states
    entityHitboxes.forEach(hitbox => {
      hitbox.updatePosition(entity.position, entity.facing);
      
      // Update frame if entity is attacking
      if (entity.state === 'attacking' || entity.state === 'special') {
        hitbox.updateFrame(entity.attackFrame || 0);
      } else {
        hitbox.updateFrame(0);
        hitbox.active = false;
      }
    });
    
    // Update hurtbox positions
    entityHurtboxes.forEach(hurtbox => {
      hurtbox.updatePosition(entity.position, entity.facing);
      
      // Update hurtbox type based on entity state
      if (entity.invincible) {
        hurtbox.setType(HurtboxType.INVULNERABLE);
      } else if (entity.state === 'counter') {
        hurtbox.setType(HurtboxType.COUNTER);
      } else if (entity.armor) {
        hurtbox.setType(HurtboxType.ARMOR);
      } else {
        hurtbox.setType(HurtboxType.NORMAL);
      }
    });
  }
  
  checkCollisions() {
    const allHitboxes = Array.from(this.hitboxes.values()).flat();
    const allHurtboxes = Array.from(this.hurtboxes.values()).flat();
    
    allHitboxes.forEach(hitbox => {
      if (!hitbox.active) return;
      
      allHurtboxes.forEach(hurtbox => {
        // Don't hit yourself
        if (hitbox.ownerId === hurtbox.ownerId) return;
        
        // Skip invulnerable hurtboxes
        if (hurtbox.type === HurtboxType.INVULNERABLE) return;
        
        // Check if already processed this collision
        const collisionKey = `${hitbox.id}_${hurtbox.id}`;
        if (this.collisionPairs.has(collisionKey)) return;
        
        if (this.checkBoxCollision(hitbox, hurtbox)) {
          this.collisionPairs.add(collisionKey);
          this.handleHitboxCollision(hitbox, hurtbox);
        }
      });
    });
  }
  
  checkBoxCollision(hitbox, hurtbox) {
    // Get world positions
    const hitboxBounds = hitbox.body.bounds;
    const hurtboxBounds = hurtbox.body.bounds;
    
    return !(
      hitboxBounds.max.x < hurtboxBounds.min.x ||
      hitboxBounds.min.x > hurtboxBounds.max.x ||
      hitboxBounds.max.y < hurtboxBounds.min.y ||
      hitboxBounds.min.y > hurtboxBounds.max.y
    );
  }
  
  handleHitboxCollision(hitbox, hurtbox) {
    // Emit collision event for CombatSystem to handle
    if (this.onHit) {
      this.onHit({
        hitbox,
        hurtbox,
        damage: hitbox.damage * hurtbox.damageMultiplier,
        hitstun: hitbox.hitstun,
        blockstun: hitbox.blockstun,
        knockback: hitbox.knockback,
        type: hitbox.type,
        priority: hitbox.priority,
      });
    }
  }
  
  setOnHitCallback(callback) {
    this.onHit = callback;
  }
  
  getDebugRenderData() {
    if (!this.debugMode) return null;
    
    const renderData = {
      hitboxes: [],
      hurtboxes: [],
    };
    
    // Collect all active hitboxes
    this.hitboxes.forEach((hitboxes, ownerId) => {
      hitboxes.forEach(hitbox => {
        if (hitbox.active) {
          renderData.hitboxes.push({
            bounds: hitbox.body.bounds,
            color: hitbox.color,
            type: hitbox.type,
            ownerId: hitbox.ownerId,
          });
        }
      });
    });
    
    // Collect all hurtboxes
    this.hurtboxes.forEach((hurtboxes, ownerId) => {
      hurtboxes.forEach(hurtbox => {
        renderData.hurtboxes.push({
          bounds: hurtbox.body.bounds,
          color: hurtbox.color,
          type: hurtbox.type,
          ownerId: hurtbox.ownerId,
        });
      });
    });
    
    return renderData;
  }
  
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
  }
}

// Helper function to create common hitbox configurations
export const HitboxTemplates = {
  // Basic punch hitbox
  punch: {
    type: HitboxType.STRIKE,
    priority: HitboxPriority.MEDIUM,
    offset: { x: 40, y: -30 },
    width: 40,
    height: 30,
    damage: 10,
    hitstun: 300,
    blockstun: 150,
    knockback: { x: 150, y: -50 },
    activeFrames: [[3, 5]], // Active on frames 3-5
  },
  
  // Heavy punch
  heavyPunch: {
    type: HitboxType.STRIKE,
    priority: HitboxPriority.HIGH,
    offset: { x: 50, y: -30 },
    width: 50,
    height: 40,
    damage: 20,
    hitstun: 500,
    blockstun: 300,
    knockback: { x: 300, y: -100 },
    activeFrames: [[5, 8]],
  },
  
  // Kick hitbox
  kick: {
    type: HitboxType.STRIKE,
    priority: HitboxPriority.MEDIUM,
    offset: { x: 45, y: -15 },
    width: 50,
    height: 40,
    damage: 15,
    hitstun: 400,
    blockstun: 200,
    knockback: { x: 200, y: -75 },
    activeFrames: [[4, 7]],
  },
  
  // Uppercut
  uppercut: {
    type: HitboxType.STRIKE,
    priority: HitboxPriority.HIGH,
    offset: { x: 30, y: -50 },
    width: 40,
    height: 60,
    damage: 25,
    hitstun: 600,
    blockstun: 300,
    knockback: { x: 100, y: -400 },
    activeFrames: [[3, 6]],
  },
  
  // Projectile
  fireball: {
    type: HitboxType.PROJECTILE,
    priority: HitboxPriority.MEDIUM,
    offset: { x: 0, y: 0 },
    width: 30,
    height: 30,
    damage: 15,
    hitstun: 400,
    blockstun: 200,
    knockback: { x: 150, y: -50 },
    activeFrames: [[0, 999]], // Always active
  },
};

// Helper function to create common hurtbox configurations
export const HurtboxTemplates = {
  // Standing hurtbox
  standing: {
    type: HurtboxType.NORMAL,
    offset: { x: 0, y: -45 },
    width: 50,
    height: 90,
    damageMultiplier: 1.0,
  },
  
  // Crouching hurtbox (smaller)
  crouching: {
    type: HurtboxType.NORMAL,
    offset: { x: 0, y: -30 },
    width: 50,
    height: 60,
    damageMultiplier: 1.0,
  },
  
  // Counter stance hurtbox
  counter: {
    type: HurtboxType.COUNTER,
    offset: { x: 0, y: -45 },
    width: 60,
    height: 90,
    damageMultiplier: 0.5,
  },
};