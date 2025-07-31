/**
 * Utility functions for hitbox/hurtbox operations
 * Provides helper methods for common collision detection tasks
 */

import { HitboxType, HurtboxType } from '../systems/HitboxHurtboxSystem';

/**
 * Calculate the actual damage after applying all modifiers
 */
export function calculateFinalDamage(baseDamage, attacker, defender, hitboxType) {
  let damage = baseDamage;
  
  // Apply attacker strength modifier
  const strengthModifier = 1 + (attacker.stats.strength - 10) / 100;
  damage *= strengthModifier;
  
  // Apply defender defense reduction
  const defenseReduction = 1 - (defender.stats.defense / 200);
  damage *= defenseReduction;
  
  // Apply combo scaling
  if (attacker.comboCount > 1) {
    const scaling = Math.max(0.5, 1 - (attacker.comboCount * 0.1));
    damage *= scaling;
  }
  
  // Apply critical hit
  if (Math.random() < (attacker.stats.critChance || 0.05)) {
    damage *= 1.5;
    attacker.lastHitCritical = true;
  }
  
  // Apply counter damage bonus
  if (defender.state === 'counter' && hitboxType === HitboxType.STRIKE) {
    return 0; // Counter successful, no damage to defender
  }
  
  return Math.floor(damage);
}

/**
 * Calculate knockback based on damage and weight
 */
export function calculateKnockback(baseKnockback, damage, defenderWeight = 1.0) {
  const damageMultiplier = 1 + (damage / 50);
  const weightMultiplier = 2 - defenderWeight; // Lighter characters fly further
  
  return {
    x: baseKnockback.x * damageMultiplier * weightMultiplier,
    y: baseKnockback.y * damageMultiplier * weightMultiplier,
  };
}

/**
 * Check if a fighter can be hit
 */
export function canBeHit(fighter, hitboxType) {
  // Check invincibility
  if (fighter.invincible) return false;
  
  // Check if already in hitstun (can't be hit again)
  if (fighter.hitstun > 100) return false; // Grace period
  
  // Check for projectile immunity
  if (fighter.projectileImmune && hitboxType === HitboxType.PROJECTILE) {
    return false;
  }
  
  // Check for throw immunity
  if (fighter.throwImmune && hitboxType === HitboxType.THROW) {
    return false;
  }
  
  return true;
}

/**
 * Determine if an attack should be blocked
 */
export function shouldBlock(defender, attacker, hitboxType) {
  // Not blocking
  if (defender.state !== 'blocking') return false;
  
  // Can't block throws
  if (hitboxType === HitboxType.THROW) return false;
  
  // Check if facing the right direction
  const attackerOnRight = attacker.position.x > defender.position.x;
  const facingAttacker = (defender.facing === 'right' && attackerOnRight) || 
                        (defender.facing === 'left' && !attackerOnRight);
  
  if (!facingAttacker) return false;
  
  // Check for high/low blocking
  if (defender.blockType === 'high' && attacker.currentAttack?.includes('low')) {
    return false;
  }
  if (defender.blockType === 'low' && attacker.currentAttack?.includes('overhead')) {
    return false;
  }
  
  return true;
}

/**
 * Apply hit effects to a fighter
 */
export function applyHitEffects(fighter, damage, hitstun, knockback, isBlocked = false) {
  if (isBlocked) {
    // Blocked effects
    fighter.state = 'blockstun';
    fighter.hitstun = hitstun * 0.5; // Half hitstun when blocked
    fighter.velocity.x = knockback.x * 0.3; // Reduced knockback
    fighter.velocity.y = 0; // No vertical knockback when blocked
    
    // Chip damage for heavy attacks
    if (damage > 20) {
      fighter.health = Math.max(0, fighter.health - Math.floor(damage * 0.1));
    }
  } else {
    // Clean hit effects
    fighter.state = 'hurt';
    fighter.hitstun = hitstun;
    fighter.velocity.x = knockback.x;
    fighter.velocity.y = knockback.y;
    fighter.grounded = false;
    fighter.health = Math.max(0, fighter.health - damage);
    
    // Reset combo if hit
    fighter.comboCount = 0;
  }
}

/**
 * Check for clash between two hitboxes
 */
export function checkHitboxClash(hitbox1, hitbox2) {
  // Only strikes can clash
  if (hitbox1.type !== HitboxType.STRIKE || hitbox2.type !== HitboxType.STRIKE) {
    return false;
  }
  
  // Check priority levels
  if (Math.abs(hitbox1.priority - hitbox2.priority) > 1) {
    // Too different in priority, higher wins
    return false;
  }
  
  // Similar priority, clash occurs
  return true;
}

/**
 * Create a clash effect between two fighters
 */
export function createClashEffect(fighter1, fighter2) {
  // Push both fighters back
  const pushForce = 300;
  const direction = fighter1.position.x < fighter2.position.x ? -1 : 1;
  
  fighter1.velocity.x = direction * pushForce;
  fighter2.velocity.x = -direction * pushForce;
  
  // Brief invincibility
  fighter1.invincible = true;
  fighter1.invincibilityFrames = 10;
  fighter2.invincible = true;
  fighter2.invincibilityFrames = 10;
  
  // Visual effect data
  return {
    type: 'clash',
    position: {
      x: (fighter1.position.x + fighter2.position.x) / 2,
      y: (fighter1.position.y + fighter2.position.y) / 2,
    },
    scale: 2,
    duration: 300,
  };
}

/**
 * Check if a position is within screen bounds
 */
export function isInBounds(position, bounds, margin = 50) {
  return position.x >= -margin && 
         position.x <= bounds.width + margin &&
         position.y >= -margin && 
         position.y <= bounds.height + margin;
}

/**
 * Interpolate between two hitbox states for smooth transitions
 */
export function interpolateHitbox(hitbox1, hitbox2, alpha) {
  return {
    x: hitbox1.x + (hitbox2.x - hitbox1.x) * alpha,
    y: hitbox1.y + (hitbox2.y - hitbox1.y) * alpha,
    width: hitbox1.width + (hitbox2.width - hitbox1.width) * alpha,
    height: hitbox1.height + (hitbox2.height - hitbox1.height) * alpha,
  };
}

/**
 * Generate hit spark position based on collision
 */
export function getHitSparkPosition(hitbox, hurtbox) {
  // Find the center of intersection
  const left = Math.max(hitbox.x, hurtbox.x);
  const right = Math.min(hitbox.x + hitbox.width, hurtbox.x + hurtbox.width);
  const top = Math.max(hitbox.y, hurtbox.y);
  const bottom = Math.min(hitbox.y + hitbox.height, hurtbox.y + hurtbox.height);
  
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
  };
}

/**
 * Debug helper to log hitbox data
 */
export function debugLogHitbox(hitbox, label = 'Hitbox') {
  console.log(`[${label}]`, {
    id: hitbox.id,
    type: hitbox.type,
    active: hitbox.active,
    position: { x: hitbox.offset.x, y: hitbox.offset.y },
    size: { w: hitbox.width, h: hitbox.height },
    damage: hitbox.damage,
    activeFrames: hitbox.activeFrames,
  });
}