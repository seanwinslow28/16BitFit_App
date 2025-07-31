/**
 * Hitbox System - Manages collision detection between fighters
 * Implements Street Fighter 2 style hit/hurtbox interactions
 */

import { GameConfig } from '../config/GameConfig';

export default class HitboxSystem {
  constructor(scene) {
    this.scene = scene;
    this.fighters = [];
    this.activeHits = new Map(); // Track which hits have already connected
    this.debugMode = false;
  }

  registerFighter(fighter) {
    this.fighters.push(fighter);
  }

  unregisterFighter(fighter) {
    const index = this.fighters.indexOf(fighter);
    if (index > -1) {
      this.fighters.splice(index, 1);
    }
  }

  update() {
    // Check collisions between all fighters
    for (let i = 0; i < this.fighters.length; i++) {
      for (let j = i + 1; j < this.fighters.length; j++) {
        this.checkFighterCollision(this.fighters[i], this.fighters[j]);
      }
    }
    
    // Clean up old hits
    this.cleanupActiveHits();
  }

  checkFighterCollision(fighter1, fighter2) {
    // Check if either fighter has active hitboxes
    const fighter1Hitboxes = this.getActiveHitboxes(fighter1);
    const fighter2Hitboxes = this.getActiveHitboxes(fighter2);
    
    // Check fighter1's attacks against fighter2
    if (fighter1Hitboxes.length > 0 && fighter2.hurtbox.active) {
      this.checkHitboxCollisions(fighter1, fighter1Hitboxes, fighter2);
    }
    
    // Check fighter2's attacks against fighter1
    if (fighter2Hitboxes.length > 0 && fighter1.hurtbox.active) {
      this.checkHitboxCollisions(fighter2, fighter2Hitboxes, fighter1);
    }
    
    // Check for pushbox collision (fighters can't overlap)
    this.checkPushboxCollision(fighter1, fighter2);
  }

  getActiveHitboxes(fighter) {
    const activeBoxes = [];
    
    // Check punch hitboxes
    Object.entries(fighter.hitboxes.punch).forEach(([strength, box]) => {
      if (box.active) {
        activeBoxes.push({ ...box, type: 'punch', strength });
      }
    });
    
    // Check kick hitboxes
    Object.entries(fighter.hitboxes.kick).forEach(([strength, box]) => {
      if (box.active) {
        activeBoxes.push({ ...box, type: 'kick', strength });
      }
    });
    
    // Check special hitbox
    if (fighter.hitboxes.special.active) {
      activeBoxes.push({ ...fighter.hitboxes.special, type: 'special' });
    }
    
    return activeBoxes;
  }

  checkHitboxCollisions(attacker, hitboxes, defender) {
    const attackerId = attacker.name || attacker.type;
    const defenderId = defender.name || defender.type;
    
    for (const hitbox of hitboxes) {
      // Convert to world coordinates
      const hitboxWorld = this.getWorldBox(attacker, hitbox);
      const hurtboxWorld = this.getWorldBox(defender, defender.hurtbox);
      
      if (this.boxesOverlap(hitboxWorld, hurtboxWorld)) {
        // Check if this hit was already registered
        const hitKey = `${attackerId}-${defenderId}-${attacker.currentMove}-${attacker.frameCount}`;
        
        if (!this.activeHits.has(hitKey)) {
          // Register the hit
          this.activeHits.set(hitKey, Date.now());
          
          // Process the hit
          this.processHit(attacker, defender, hitbox);
          
          // Only one hit per frame
          break;
        }
      }
    }
  }

  getWorldBox(fighter, box) {
    // Account for fighter facing direction
    const x = fighter.facing === 1 ? box.x : -box.x;
    
    return {
      left: fighter.x + x - box.width / 2,
      right: fighter.x + x + box.width / 2,
      top: fighter.y + box.y - box.height / 2,
      bottom: fighter.y + box.y + box.height / 2
    };
  }

  boxesOverlap(box1, box2) {
    return box1.left < box2.right &&
           box1.right > box2.left &&
           box1.top < box2.bottom &&
           box1.bottom > box2.top;
  }

  processHit(attacker, defender, hitbox) {
    // Calculate damage
    let damage = hitbox.damage || 10;
    
    // Apply character stats
    damage = Math.floor(damage * (attacker.stats.attack / 100));
    
    // Apply defense reduction
    const defenseReduction = defender.stats.defense / 200; // 50% reduction at 100 defense
    damage = Math.floor(damage * (1 - defenseReduction));
    
    // Apply combo scaling
    if (this.scene.comboSystem) {
      const scaledDamage = this.scene.comboSystem.applyDamageScaling(
        damage,
        this.scene.comboSystem.currentCombo.hits
      );
      damage = scaledDamage;
    }
    
    // Deal damage
    defender.takeDamage(damage, attacker);
    
    // Register hit with combo system
    if (this.scene.comboSystem) {
      this.scene.comboSystem.registerHit(attacker, defender, attacker.currentMove, damage);
    }
    
    // Create hit effect at collision point
    const hitX = (attacker.x + defender.x) / 2;
    const hitY = defender.y + defender.hurtbox.y;
    
    if (this.scene.effectsManager) {
      if (defender.blocking) {
        this.scene.effectsManager.createBlockEffect(hitX, hitY);
      } else {
        this.scene.effectsManager.createHitEffect(hitX, hitY, hitbox.type);
      }
    }
    
    // Screen shake for heavy hits
    if (damage > 25 && !defender.blocking) {
      this.scene.cameras.main.shake(100, 0.01);
    }
    
    // Trigger haptic feedback
    if (attacker.isPlayer && this.scene.touchControls) {
      this.scene.touchControls.triggerHaptic(hitbox.strength || 'medium');
    }
  }

  checkPushboxCollision(fighter1, fighter2) {
    // Simple circle-based pushbox
    const distance = Phaser.Math.Distance.Between(
      fighter1.x, fighter1.y,
      fighter2.x, fighter2.y
    );
    
    const minDistance = 60; // Minimum distance between fighters
    
    if (distance < minDistance) {
      // Calculate push direction
      const angle = Math.atan2(fighter2.y - fighter1.y, fighter2.x - fighter1.x);
      const pushDistance = minDistance - distance;
      
      // Push fighters apart
      const push1 = pushDistance / 2;
      const push2 = pushDistance / 2;
      
      // Apply push based on who's moving
      if (Math.abs(fighter1.body.velocity.x) > Math.abs(fighter2.body.velocity.x)) {
        // Fighter1 is pushing, move fighter2 more
        fighter1.x -= Math.cos(angle) * push1 * 0.3;
        fighter2.x += Math.cos(angle) * push2 * 1.7;
      } else if (Math.abs(fighter2.body.velocity.x) > Math.abs(fighter1.body.velocity.x)) {
        // Fighter2 is pushing, move fighter1 more
        fighter1.x -= Math.cos(angle) * push1 * 1.7;
        fighter2.x += Math.cos(angle) * push2 * 0.3;
      } else {
        // Equal push
        fighter1.x -= Math.cos(angle) * push1;
        fighter2.x += Math.cos(angle) * push2;
      }
      
      // Keep within stage bounds
      fighter1.x = Phaser.Math.Clamp(
        fighter1.x,
        this.scene.stageBounds.left,
        this.scene.stageBounds.right
      );
      fighter2.x = Phaser.Math.Clamp(
        fighter2.x,
        this.scene.stageBounds.left,
        this.scene.stageBounds.right
      );
    }
  }

  cleanupActiveHits() {
    const now = Date.now();
    const maxAge = 100; // ms
    
    for (const [key, timestamp] of this.activeHits.entries()) {
      if (now - timestamp > maxAge) {
        this.activeHits.delete(key);
      }
    }
  }

  // Debug visualization
  enableDebug() {
    this.debugMode = true;
    
    if (!this.debugGraphics) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.setDepth(1000);
    }
  }

  disableDebug() {
    this.debugMode = false;
    
    if (this.debugGraphics) {
      this.debugGraphics.clear();
    }
  }

  drawDebug() {
    if (!this.debugMode || !this.debugGraphics) return;
    
    this.debugGraphics.clear();
    
    this.fighters.forEach(fighter => {
      // Draw hurtbox (blue)
      if (fighter.hurtbox.active) {
        const hurtbox = this.getWorldBox(fighter, fighter.hurtbox);
        this.debugGraphics.lineStyle(2, 0x0000FF);
        this.debugGraphics.strokeRect(
          hurtbox.left,
          hurtbox.top,
          hurtbox.right - hurtbox.left,
          hurtbox.bottom - hurtbox.top
        );
      }
      
      // Draw active hitboxes (red)
      const hitboxes = this.getActiveHitboxes(fighter);
      hitboxes.forEach(hitbox => {
        const worldBox = this.getWorldBox(fighter, hitbox);
        this.debugGraphics.lineStyle(2, 0xFF0000);
        this.debugGraphics.strokeRect(
          worldBox.left,
          worldBox.top,
          worldBox.right - worldBox.left,
          worldBox.bottom - worldBox.top
        );
      });
      
      // Draw pushbox (green)
      this.debugGraphics.lineStyle(2, 0x00FF00);
      this.debugGraphics.strokeCircle(fighter.x, fighter.y, 30);
    });
  }

  // Hitbox data helpers
  createHitbox(x, y, width, height, damage, properties = {}) {
    return {
      x,
      y,
      width,
      height,
      damage,
      active: false,
      hitstun: properties.hitstun || 12,
      blockstun: properties.blockstun || 8,
      pushback: properties.pushback || 4,
      ...properties
    };
  }

  // Special hitbox types
  createProjectileHitbox(x, y, width, height, damage) {
    return this.createHitbox(x, y, width, height, damage, {
      type: 'projectile',
      piercing: false,
      lifetime: 1000
    });
  }

  createThrowHitbox(x, y, width, height) {
    return this.createHitbox(x, y, width, height, 0, {
      type: 'throw',
      unblockable: true,
      techable: true
    });
  }
}