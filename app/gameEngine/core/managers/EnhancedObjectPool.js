/**
 * Enhanced Object Pool for 16BitFit
 * Advanced memory management with preallocation and lazy cleanup
 */

export class EnhancedObjectPool {
  constructor() {
    // Pool configuration
    this.config = {
      // Pool sizes optimized for mobile
      pools: {
        projectile: { 
          initialSize: 10, 
          maxSize: 30, 
          growthRate: 5,
          shrinkThreshold: 0.2, // Shrink if less than 20% used
        },
        effect: { 
          initialSize: 20, 
          maxSize: 50, 
          growthRate: 10,
          shrinkThreshold: 0.3,
        },
        particle: { 
          initialSize: 50, 
          maxSize: 200, 
          growthRate: 25,
          shrinkThreshold: 0.25,
        },
        hitbox: { 
          initialSize: 5, 
          maxSize: 20, 
          growthRate: 5,
          shrinkThreshold: 0.3,
        },
        text: {
          initialSize: 10,
          maxSize: 30,
          growthRate: 5,
          shrinkThreshold: 0.3,
        },
        sprite: {
          initialSize: 20,
          maxSize: 50,
          growthRate: 10,
          shrinkThreshold: 0.3,
        },
      },
      
      // Memory management
      memoryCheckInterval: 5000, // Check every 5 seconds
      aggressiveCleanupThreshold: 100, // MB
      gcTriggerThreshold: 120, // MB
    };
    
    // Pool storage
    this.pools = new Map();
    
    // Statistics
    this.stats = {
      totalAllocations: 0,
      totalReleases: 0,
      totalReuses: 0,
      peakUsage: new Map(),
      currentUsage: new Map(),
      lastCleanup: Date.now(),
      cleanupCount: 0,
    };
    
    // Object factories
    this.factories = {
      projectile: this.createProjectile,
      effect: this.createEffect,
      particle: this.createParticle,
      hitbox: this.createHitbox,
      text: this.createText,
      sprite: this.createSprite,
    };
    
    // Memory monitoring
    this.memoryMonitor = null;
    this.lastMemoryCheck = 0;
    
    // Initialize pools
    this.initialize();
  }
  
  initialize() {
    // Create pools with initial allocations
    Object.entries(this.config.pools).forEach(([type, config]) => {
      const pool = {
        type,
        config,
        available: [],
        active: new Set(),
        factory: this.factories[type].bind(this),
        totalCreated: 0,
        highWaterMark: 0,
      };
      
      this.pools.set(type, pool);
      
      // Pre-allocate initial objects
      this.preallocate(type, config.initialSize);
      
      // Initialize stats
      this.stats.currentUsage.set(type, 0);
      this.stats.peakUsage.set(type, 0);
    });
    
    // Start memory monitoring
    this.startMemoryMonitoring();
  }
  
  preallocate(type, count) {
    const pool = this.pools.get(type);
    if (!pool) return;
    
    const objects = [];
    for (let i = 0; i < count; i++) {
      const obj = pool.factory();
      obj._poolType = type;
      obj._poolId = `${type}_${pool.totalCreated++}`;
      obj._lastUsed = 0;
      objects.push(obj);
    }
    
    // Add to available pool
    pool.available.push(...objects);
  }
  
  acquire(type, initData = {}) {
    const pool = this.pools.get(type);
    if (!pool) {
      console.warn(`Unknown pool type: ${type}`);
      return null;
    }
    
    this.stats.totalAllocations++;
    
    let obj = null;
    
    // Try to get from available pool
    if (pool.available.length > 0) {
      obj = pool.available.pop();
      this.stats.totalReuses++;
    } 
    // Create new if under max size
    else if (pool.active.size < pool.config.maxSize) {
      obj = pool.factory();
      obj._poolType = type;
      obj._poolId = `${type}_${pool.totalCreated++}`;
      obj._lastUsed = 0;
    }
    // Reuse oldest active object if at max
    else {
      obj = this.reuseOldest(pool);
    }
    
    if (obj) {
      // Mark as active
      pool.active.add(obj);
      obj._lastUsed = Date.now();
      
      // Reset and initialize
      this.resetObject(obj, type);
      Object.assign(obj, initData);
      
      // Update stats
      const usage = pool.active.size;
      this.stats.currentUsage.set(type, usage);
      
      if (usage > this.stats.peakUsage.get(type)) {
        this.stats.peakUsage.set(type, usage);
      }
      
      if (usage > pool.highWaterMark) {
        pool.highWaterMark = usage;
        
        // Check if we need to grow the pool
        if (usage > pool.config.initialSize * 0.8) {
          this.growPool(type);
        }
      }
    }
    
    return obj;
  }
  
  release(obj) {
    if (!obj || !obj._poolType) return;
    
    const pool = this.pools.get(obj._poolType);
    if (!pool || !pool.active.has(obj)) return;
    
    this.stats.totalReleases++;
    
    // Remove from active
    pool.active.delete(obj);
    
    // Clear object
    this.clearObject(obj);
    
    // Return to available pool
    pool.available.push(obj);
    
    // Update stats
    this.stats.currentUsage.set(obj._poolType, pool.active.size);
    
    // Check if pool needs shrinking
    this.checkPoolShrink(pool);
  }
  
  releaseAll(type) {
    const pool = this.pools.get(type);
    if (!pool) return;
    
    const activeObjects = Array.from(pool.active);
    activeObjects.forEach(obj => this.release(obj));
  }
  
  reuseOldest(pool) {
    let oldest = null;
    let oldestTime = Infinity;
    
    pool.active.forEach(obj => {
      if (obj._lastUsed < oldestTime) {
        oldest = obj;
        oldestTime = obj._lastUsed;
      }
    });
    
    if (oldest) {
      pool.active.delete(oldest);
      this.clearObject(oldest);
    }
    
    return oldest;
  }
  
  growPool(type) {
    const pool = this.pools.get(type);
    if (!pool) return;
    
    const currentSize = pool.active.size + pool.available.length;
    const maxSize = pool.config.maxSize;
    const growthSize = Math.min(pool.config.growthRate, maxSize - currentSize);
    
    if (growthSize > 0) {
      this.preallocate(type, growthSize);
      console.log(`Pool ${type} grew by ${growthSize} objects`);
    }
  }
  
  checkPoolShrink(pool) {
    const totalSize = pool.active.size + pool.available.length;
    const usageRatio = pool.active.size / totalSize;
    
    // Shrink if usage is below threshold and we have excess objects
    if (usageRatio < pool.config.shrinkThreshold && pool.available.length > pool.config.initialSize) {
      const shrinkCount = Math.floor(pool.available.length * 0.5);
      pool.available.splice(0, shrinkCount);
      console.log(`Pool ${pool.type} shrank by ${shrinkCount} objects`);
    }
  }
  
  startMemoryMonitoring() {
    this.memoryMonitor = setInterval(() => {
      this.checkMemoryPressure();
    }, this.config.memoryCheckInterval);
  }
  
  checkMemoryPressure() {
    const now = Date.now();
    
    // Throttle memory checks
    if (now - this.lastMemoryCheck < 1000) return;
    this.lastMemoryCheck = now;
    
    // Get memory usage (this is a placeholder - implement actual memory check)
    const memoryUsageMB = this.estimateMemoryUsage();
    
    if (memoryUsageMB > this.config.aggressiveCleanupThreshold) {
      console.warn(`Memory pressure detected: ${memoryUsageMB}MB`);
      this.performAggressiveCleanup();
    }
    
    if (memoryUsageMB > this.config.gcTriggerThreshold) {
      console.warn(`Critical memory usage: ${memoryUsageMB}MB - Triggering GC`);
      // In React Native, we can't force GC, but we can clear caches
      this.performEmergencyCleanup();
    }
  }
  
  estimateMemoryUsage() {
    // Estimate based on pool sizes
    let totalObjects = 0;
    this.pools.forEach(pool => {
      totalObjects += pool.active.size + pool.available.length;
    });
    
    // Rough estimate: 1KB per object average
    return totalObjects * 0.001;
  }
  
  performAggressiveCleanup() {
    this.stats.cleanupCount++;
    this.stats.lastCleanup = Date.now();
    
    this.pools.forEach(pool => {
      // Clear excess available objects
      if (pool.available.length > pool.config.initialSize) {
        const excess = pool.available.length - pool.config.initialSize;
        pool.available.splice(0, excess);
        console.log(`Cleaned up ${excess} objects from ${pool.type} pool`);
      }
      
      // Clear very old active objects
      const now = Date.now();
      const staleThreshold = 30000; // 30 seconds
      
      const staleObjects = Array.from(pool.active).filter(obj => 
        now - obj._lastUsed > staleThreshold
      );
      
      staleObjects.forEach(obj => this.release(obj));
    });
  }
  
  performEmergencyCleanup() {
    console.warn('Performing emergency cleanup');
    
    this.pools.forEach(pool => {
      // Keep only minimum objects
      const keepCount = Math.min(5, pool.config.initialSize);
      
      // Clear most available objects
      if (pool.available.length > keepCount) {
        pool.available = pool.available.slice(-keepCount);
      }
      
      // Force release old active objects
      const activeArray = Array.from(pool.active);
      const toRelease = activeArray.slice(0, Math.floor(activeArray.length * 0.5));
      toRelease.forEach(obj => this.release(obj));
    });
  }
  
  // Object factories
  createProjectile() {
    return {
      type: 'projectile',
      position: { x: 0, y: 0 },
      previousPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      angularVelocity: 0,
      scale: 1,
      alpha: 1,
      tint: null,
      hitbox: { x: 0, y: 0, width: 30, height: 30 },
      damage: 0,
      knockback: { x: 0, y: 0 },
      lifetime: 0,
      maxLifetime: 2000,
      ownerId: null,
      team: null,
      penetrating: false,
      destroyed: false,
      onHit: null,
      onExpire: null,
    };
  }
  
  createEffect() {
    return {
      type: 'effect',
      effectType: null,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      scale: 1,
      alpha: 1,
      rotation: 0,
      color: '#FFFFFF',
      lifetime: 0,
      maxLifetime: 1000,
      followTarget: null,
      offset: { x: 0, y: 0 },
      layer: 0,
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
      color: '#FFFFFF',
      size: 4,
      lifetime: 0,
      maxLifetime: 1000,
      fadeOut: true,
      scaleOut: false,
      destroyed: false,
    };
  }
  
  createHitbox() {
    return {
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      offset: { x: 0, y: 0 },
      active: false,
      type: null, // 'hit', 'hurt', 'grab', 'throw'
      damage: 0,
      knockback: { x: 0, y: 0 },
      hitstun: 0,
      blockstun: 0,
      priority: 0,
      team: null,
      properties: {
        launcher: false,
        groundBounce: false,
        wallBounce: false,
        piercing: false,
      },
    };
  }
  
  createText() {
    return {
      text: '',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      scale: 1,
      alpha: 1,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'normal',
      lifetime: 0,
      maxLifetime: 2000,
      floating: false,
      destroyed: false,
    };
  }
  
  createSprite() {
    return {
      textureId: null,
      frame: 0,
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      alpha: 1,
      tint: null,
      visible: true,
      layer: 0,
      flipX: false,
      flipY: false,
      bounds: { x: 0, y: 0, width: 64, height: 64 },
    };
  }
  
  // Reset methods
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
      case 'text':
        this.resetText(obj);
        break;
      case 'sprite':
        this.resetSprite(obj);
        break;
    }
    
    obj._lastUsed = Date.now();
  }
  
  resetProjectile(obj) {
    obj.position.x = 0;
    obj.position.y = 0;
    obj.previousPosition.x = 0;
    obj.previousPosition.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.acceleration.x = 0;
    obj.acceleration.y = 0;
    obj.rotation = 0;
    obj.angularVelocity = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.tint = null;
    obj.damage = 0;
    obj.lifetime = obj.maxLifetime;
    obj.destroyed = false;
    obj.onHit = null;
    obj.onExpire = null;
  }
  
  resetEffect(obj) {
    obj.effectType = null;
    obj.position.x = 0;
    obj.position.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.rotation = 0;
    obj.lifetime = obj.maxLifetime;
    obj.followTarget = null;
    obj.destroyed = false;
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
    obj.destroyed = false;
  }
  
  resetHitbox(obj) {
    obj.bounds.x = 0;
    obj.bounds.y = 0;
    obj.bounds.width = 0;
    obj.bounds.height = 0;
    obj.active = false;
    obj.type = null;
    obj.damage = 0;
    obj.knockback.x = 0;
    obj.knockback.y = 0;
    obj.hitstun = 0;
    obj.blockstun = 0;
  }
  
  resetText(obj) {
    obj.text = '';
    obj.position.x = 0;
    obj.position.y = 0;
    obj.velocity.x = 0;
    obj.velocity.y = 0;
    obj.scale = 1;
    obj.alpha = 1;
    obj.lifetime = obj.maxLifetime;
    obj.destroyed = false;
  }
  
  resetSprite(obj) {
    obj.textureId = null;
    obj.frame = 0;
    obj.position.x = 0;
    obj.position.y = 0;
    obj.scale.x = 1;
    obj.scale.y = 1;
    obj.rotation = 0;
    obj.alpha = 1;
    obj.tint = null;
    obj.visible = true;
    obj.flipX = false;
    obj.flipY = false;
  }
  
  clearObject(obj) {
    // Clear any references
    if (obj.onHit) obj.onHit = null;
    if (obj.onExpire) obj.onExpire = null;
    if (obj.followTarget) obj.followTarget = null;
    if (obj.renderer) obj.renderer = null;
    if (obj.animation) obj.animation = null;
  }
  
  getStats() {
    const stats = {
      pools: {},
      totals: {
        allocations: this.stats.totalAllocations,
        releases: this.stats.totalReleases,
        reuses: this.stats.totalReuses,
        reuseRate: this.stats.totalAllocations > 0 
          ? Math.round((this.stats.totalReuses / this.stats.totalAllocations) * 100)
          : 0,
      },
      memory: {
        estimatedMB: this.estimateMemoryUsage(),
        lastCleanup: this.stats.lastCleanup,
        cleanupCount: this.stats.cleanupCount,
      },
    };
    
    this.pools.forEach((pool, type) => {
      stats.pools[type] = {
        active: pool.active.size,
        available: pool.available.length,
        total: pool.active.size + pool.available.length,
        peak: this.stats.peakUsage.get(type),
        highWaterMark: pool.highWaterMark,
        config: pool.config,
      };
    });
    
    return stats;
  }
  
  destroy() {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }
    
    this.pools.forEach(pool => {
      pool.active.clear();
      pool.available = [];
    });
    
    this.pools.clear();
  }
}

// Singleton instance
let enhancedObjectPool = null;

export function getEnhancedObjectPool() {
  if (!enhancedObjectPool) {
    enhancedObjectPool = new EnhancedObjectPool();
  }
  return enhancedObjectPool;
}