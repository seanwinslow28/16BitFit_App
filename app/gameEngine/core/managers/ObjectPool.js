/**
 * Object Pool for efficient memory management
 * Prevents garbage collection during gameplay for smooth 60fps
 */

export class ObjectPool {
  constructor() {
    this.pools = new Map();
    this.config = {
      projectile: { size: 20, factory: this.createProjectile },
      effect: { size: 50, factory: this.createEffect },
      particle: { size: 100, factory: this.createParticle },
      hitbox: { size: 10, factory: this.createHitbox },
    };
    
    this.initializePools();
  }
  
  initializePools() {
    Object.entries(this.config).forEach(([type, config]) => {
      this.pools.set(type, {
        available: [],
        active: new Set(),
        factory: config.factory,
        maxSize: config.size,
      });
      
      // Pre-populate pools
      this.warmPool(type, Math.floor(config.size / 2));
    });
  }
  
  warmPool(type, count) {
    const pool = this.pools.get(type);
    if (!pool) return;
    
    for (let i = 0; i < count; i++) {
      const obj = pool.factory.call(this);
      obj._poolType = type;
      pool.available.push(obj);
    }
  }
  
  acquire(type) {
    const pool = this.pools.get(type);
    if (!pool) {
      console.warn(`Unknown pool type: ${type}`);
      return null;
    }
    
    let obj;
    
    if (pool.available.length > 0) {
      // Reuse existing object
      obj = pool.available.pop();
    } else if (pool.active.size < pool.maxSize) {
      // Create new object
      obj = pool.factory.call(this);
      obj._poolType = type;
    } else {
      // Pool exhausted, find and reuse oldest active object
      const oldest = Array.from(pool.active)[0];
      this.release(oldest);
      obj = pool.available.pop();
    }
    
    if (obj) {
      pool.active.add(obj);
      this.resetObject(obj, type);
    }
    
    return obj;
  }
  
  release(obj) {
    if (!obj || !obj._poolType) return;
    
    const pool = this.pools.get(obj._poolType);
    if (!pool || !pool.active.has(obj)) return;
    
    pool.active.delete(obj);
    pool.available.push(obj);
    
    // Clear references to prevent memory leaks
    this.clearObject(obj);
  }
  
  releaseAll(type) {
    const pool = this.pools.get(type);
    if (!pool) return;
    
    pool.active.forEach(obj => {
      this.clearObject(obj);
      pool.available.push(obj);
    });
    
    pool.active.clear();
  }
  
  clear() {
    this.pools.forEach((pool, type) => {
      this.releaseAll(type);
      pool.available = [];
    });
  }
  
  getStats() {
    const stats = {};
    this.pools.forEach((pool, type) => {
      stats[type] = {
        active: pool.active.size,
        available: pool.available.length,
        total: pool.active.size + pool.available.length,
        maxSize: pool.maxSize,
      };
    });
    return stats;
  }
  
  // Object factories
  createProjectile() {
    return {
      type: 'projectile',
      id: null,
      ownerId: null,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      hitbox: { x: 0, y: 0, width: 30, height: 30 },
      damage: 0,
      lifetime: 0,
      maxLifetime: 2,
      sprite: null,
      rotation: 0,
      scale: 1,
      alpha: 1,
      destroyed: false,
    };
  }
  
  createEffect() {
    return {
      type: 'effect',
      id: null,
      effectType: null,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      scale: 1,
      alpha: 1,
      rotation: 0,
      lifetime: 0,
      maxLifetime: 1,
      sprite: null,
      followEntity: null,
      offset: { x: 0, y: 0 },
      destroyed: false,
    };
  }
  
  createParticle() {
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      scale: 1,
      alpha: 1,
      rotation: 0,
      angularVelocity: 0,
      lifetime: 0,
      maxLifetime: 1,
      color: '#FFFFFF',
      size: 4,
    };
  }
  
  createHitbox() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      active: false,
      type: null,
      damage: 0,
      knockback: { x: 0, y: 0 },
      hitstun: 0,
      blockstun: 0,
    };
  }
  
  // Object reset methods
  resetObject(obj, type) {
    switch (type) {
      case 'projectile':
        this.resetProjectile(obj);
        break;
      case 'effect':
        this.resetEffect(obj);
        break;
      case 'particle':
        this.resetParticle(obj);
        break;
      case 'hitbox':
        this.resetHitbox(obj);
        break;
    }
  }
  
  resetProjectile(obj) {
    obj.id = `projectile_${Date.now()}_${Math.random()}`;
    obj.position.x = 0;
    obj.position.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.lifetime = obj.maxLifetime;
    obj.rotation = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.destroyed = false;
  }
  
  resetEffect(obj) {
    obj.id = `effect_${Date.now()}_${Math.random()}`;
    obj.position.x = 0;
    obj.position.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.rotation = 0;
    obj.lifetime = obj.maxLifetime;
    obj.destroyed = false;
    obj.followEntity = null;
  }
  
  resetParticle(obj) {
    obj.position.x = 0;
    obj.position.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.acceleration.x = 0;
    obj.acceleration.y = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.rotation = 0;
    obj.angularVelocity = 0;
    obj.lifetime = obj.maxLifetime;
  }
  
  resetHitbox(obj) {
    obj.x = 0;
    obj.y = 0;
    obj.width = 0;
    obj.height = 0;
    obj.active = false;
    obj.type = null;
    obj.damage = 0;
    obj.knockback.x = 0;
    obj.knockback.y = 0;
    obj.hitstun = 0;
    obj.blockstun = 0;
  }
  
  clearObject(obj) {
    // Clear references that might prevent garbage collection
    if (obj.sprite) obj.sprite = null;
    if (obj.renderer) obj.renderer = null;
    if (obj.animation) obj.animation = null;
    if (obj.inputQueue) obj.inputQueue = [];
    if (obj.effects) obj.effects = [];
  }
}