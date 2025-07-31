/**
 * Combat System for fighting game mechanics
 * Handles attacks, damage, combos, and special moves
 * Now integrated with HitboxHurtboxSystem for precise collision detection
 * And ComboDetectionSystem for advanced combo tracking
 */

import { HitboxHurtboxSystem, HitboxTemplates, HurtboxTemplates } from './HitboxHurtboxSystem';
// import { getAttackFrameData, getHurtboxConfig } from '../data/CharacterHitboxData';
// import ComboDetectionSystem from './ComboDetectionSystem';
// import EvolutionCombatIntegration from './EvolutionCombatIntegration';

const COMBO_TIMEOUT = 2000; // 2 seconds to continue combo
const HITSTUN_DURATION = 300; // 300ms hitstun
const BLOCKSTUN_DURATION = 150; // 150ms blockstun

// Initialize hitbox system
let hitboxSystem = null;

export const initializeCombatSystem = (engine, debugMode = false) => {
  hitboxSystem = new HitboxHurtboxSystem(engine, debugMode);
  
  // Set up collision callback
  hitboxSystem.setOnHitCallback((hitData) => {
    // This will be called when hitbox collides with hurtbox
    processHitboxCollision(hitData);
  });
  
  return hitboxSystem;
};

export const CombatSystem = (entities, { timestep, onHit }) => {
  const fighters = Object.values(entities).filter(e => e && e.type === 'fighter');
  
  // Update combo detection system
  ComboDetectionSystem.update(timestep);
  
  // Initialize combat properties if missing
  fighters.forEach(fighter => {
    if (fighter.isAttacking === undefined) fighter.isAttacking = false;
    if (fighter.isBlocking === undefined) fighter.isBlocking = false;
    if (fighter.isHurt === undefined) fighter.isHurt = false;
    if (fighter.currentAttack === undefined) fighter.currentAttack = null;
    if (fighter.animationFrame === undefined) fighter.animationFrame = 0;
    if (fighter.state === undefined) fighter.state = 'idle';
    if (fighter.attackFrame === undefined) fighter.attackFrame = 0;
    if (fighter.attackDuration === undefined) fighter.attackDuration = 0;
    if (fighter.recoveryFrames === undefined) fighter.recoveryFrames = 0;
    if (fighter.comboCount === undefined) fighter.comboCount = 0;
    if (fighter.lastHitTime === undefined) fighter.lastHitTime = 0;
    if (fighter.specialMeter === undefined) fighter.specialMeter = 0;
    if (fighter.hitstunRemaining === undefined) fighter.hitstunRemaining = 0;
    if (fighter.blockstunRemaining === undefined) fighter.blockstunRemaining = 0;
    
    // Initialize evolution combat properties (commented out for now)
    // if (!fighter.evolutionInitialized) {
    //   EvolutionCombatIntegration.initializeFighter(fighter);
    //   fighter.evolutionInitialized = true;
    // }
  });
  
  // Update combat states for all fighters
  fighters.forEach(fighter => {
    updateCombatState(fighter, timestep);
    updateComboTimer(fighter);
    
    // Update evolution visual effects
    EvolutionCombatIntegration.updateCombatVisuals(fighter, fighter.state, timestep);
  });
  
  // Add combo visual data to entities
  const comboData = ComboDetectionSystem.getComboVisualData();
  if (comboData) {
    entities.comboDisplay = {
      type: 'ui',
      component: 'ComboDisplay',
      data: comboData
    };
  }
  
  // Update hitbox/hurtbox system
  if (hitboxSystem) {
    hitboxSystem.update(entities);
  }
  
  // Setup fighter hitboxes/hurtboxes if not already done
  fighters.forEach(fighter => {
    if (!fighter.hitboxesInitialized) {
      initializeFighterBoxes(fighter);
      fighter.hitboxesInitialized = true;
    }
    
    // Update attack hitboxes based on current state
    updateFighterHitboxes(fighter);
  });
  
  // Handle projectiles
  handleProjectiles(entities, onHit);
  
  // Update damage scaling for combos
  updateDamageScaling(fighters);
  
  // Update evolution combat integration
  EvolutionCombatIntegration.update(entities, timestep);
  
  return entities;
};

function updateCombatState(fighter, timestep) {
  if (!fighter) return;
  
  const dt = timestep / 1000;
  
  // Update attack frames
  if (fighter.state === 'attacking' || fighter.state === 'special') {
    fighter.attackFrame = (fighter.attackFrame || 0) + 1;
    
    // Check if attack is complete
    if (fighter.attackFrame >= fighter.attackDuration) {
      fighter.state = 'recovery';
      fighter.recoveryFrames = 10; // Recovery frames after attack
      fighter.currentAttack = null;
    }
  }
  
  // Update recovery frames
  if (fighter.state === 'recovery') {
    fighter.recoveryFrames--;
    if (fighter.recoveryFrames <= 0) {
      fighter.state = 'idle';
    }
  }
  
  // Update hitstun
  if (fighter.hitstun > 0) {
    fighter.hitstun -= timestep;
    if (fighter.hitstun <= 0) {
      fighter.state = 'idle';
      fighter.hitstun = 0;
    }
  }
  
  // Update invincibility
  if (fighter.invincible && fighter.invincibilityFrames > 0) {
    fighter.invincibilityFrames--;
    if (fighter.invincibilityFrames <= 0) {
      fighter.invincible = false;
    }
  }
  
  // Update special meter regeneration
  if (fighter.specialMeter < 100) {
    fighter.specialMeter = Math.min(100, (fighter.specialMeter || 0) + 0.1);
  }
}

function updateComboTimer(fighter) {
  if (!fighter) return;
  
  if (fighter.comboCount > 0 && fighter.lastComboTime) {
    const timeSinceLastHit = Date.now() - fighter.lastComboTime;
    if (timeSinceLastHit > COMBO_TIMEOUT) {
      fighter.comboCount = 0;
      fighter.damageScaling = 1.0;
    }
  }
}

// Initialize hitboxes and hurtboxes for a fighter
function initializeFighterBoxes(fighter) {
  if (!hitboxSystem) return;
  
  // Get character type (warrior, speedster, tank)
  const characterType = fighter.characterType || 'warrior';
  
  // Add default hurtboxes (using template for now)
  // const standingHurtboxes = getHurtboxConfig(characterType, 'standing');
  // standingHurtboxes.forEach(hurtboxConfig => {
  //   hitboxSystem.addHurtbox(fighter.id, hurtboxConfig);
  // });
  
  // Add a basic hurtbox for now
  hitboxSystem.addHurtbox(fighter.id, HurtboxTemplates.standing);
}

// Update fighter hitboxes based on current attack
function updateFighterHitboxes(fighter) {
  if (!hitboxSystem) return;
  
  // Clear existing attack hitboxes
  hitboxSystem.clearOwnerHitboxes(fighter.id);
  
  // Update hitbox sizes based on evolution (commented out for now)
  // EvolutionCombatIntegration.updateHitboxSizes(fighter, fighter.evolutionStage);
  
  // Add hitboxes if attacking
  if (fighter.state === 'attacking' || fighter.state === 'special') {
    // const attackData = getAttackFrameData(fighter.characterType || 'warrior', fighter.currentAttack);
    
    // Use basic hitbox template for now
    if (fighter.currentAttack) {
      const template = HitboxTemplates[fighter.currentAttack] || HitboxTemplates.punch;
      hitboxSystem.addHitbox(fighter.id, {
        ...template,
        currentFrame: fighter.attackFrame || 0,
      });
    }
  }
}

// Process collision detected by hitbox system
function processHitboxCollision(hitData) {
  const { hitbox, hurtbox, damage, hitstun, blockstun, knockback } = hitData;
  
  // Find the attacker and defender entities
  // This will be called from the hitbox system with collision data
  // We'll need to implement this to work with the global onHit callback
}

function isAttackHitting(attacker, defender) {
  if (defender.invincible) return false;
  
  // Calculate attack hitbox
  const attackHitbox = {
    x: attacker.position.x + (attacker.facing === 'right' ? 0 : -attacker.attackRange),
    y: attacker.position.y - attacker.height / 2,
    width: attacker.attackRange,
    height: attacker.height,
  };
  
  // Check collision with defender's hurtbox
  return checkHitboxCollision(attackHitbox, defender.hitbox);
}

function checkHitboxCollision(box1, box2) {
  if (!box1 || !box2) return false;
  
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
}

function processHit(attacker, defender, onHit) {
  // Check if defender is blocking
  if (defender.state === 'blocking' && isFacingAttacker(defender, attacker)) {
    // Blocked attack
    defender.hitstun = BLOCKSTUN_DURATION;
    defender.velocity.x = (attacker.position.x < defender.position.x ? 1 : -1) * 100;
    
    // Chip damage for special moves
    if (attacker.state === 'special') {
      const chipDamage = Math.floor(attacker.attackDamage * 0.1);
      applyDamage(attacker, defender, chipDamage, onHit);
    }
    
    // Reduce attacker's momentum
    attacker.velocity.x *= 0.5;
    
  } else {
    // Clean hit
    const damage = calculateDamage(attacker, defender);
    
    // Register hit with combo system
    const comboResult = ComboDetectionSystem.registerHit(
      attacker.id,
      defender.id,
      attacker.currentAttack,
      damage,
      attacker.state === 'special' ? 'special' : 'normal'
    );
    
    // Use scaled damage from combo system
    const finalDamage = comboResult ? comboResult.comboDamage - (attacker.totalComboDamage || 0) : damage;
    attacker.totalComboDamage = comboResult ? comboResult.comboDamage : 0;
    
    applyDamage(attacker, defender, finalDamage, onHit);
    
    // Apply hitstun and knockback
    defender.state = 'hurt';
    defender.hitstun = HITSTUN_DURATION;
    
    // Calculate knockback
    const knockbackX = (attacker.position.x < defender.position.x ? 1 : -1) * 200;
    const knockbackY = attacker.currentAttack === 'uppercut' ? -300 : -100;
    
    defender.velocity.x = knockbackX;
    defender.velocity.y = knockbackY;
    defender.grounded = false;
    
    // Update legacy combo data for compatibility
    attacker.comboCount = comboResult ? comboResult.comboHits : (attacker.comboCount || 0) + 1;
    attacker.lastComboTime = Date.now();
    attacker.maxCombo = Math.max(attacker.maxCombo || 0, attacker.comboCount);
    
    // Create evolution-based attack effects
    const attackEffects = EvolutionCombatIntegration.createAttackEffects(
      attacker,
      { type: attacker.currentAttack, damage: finalDamage },
      defender.position
    );
    
    // Store effects for rendering
    attacker.pendingEffects = attackEffects;
    
    // Screen effects for heavy hits
    if (finalDamage > 20 || attacker.state === 'special') {
      // This will be handled by the render system
      attacker.triggerHitEffect = {
        type: 'heavy',
        position: defender.position,
        damage: finalDamage,
        critical: attacker.lastHitCritical,
        evolutionEffects: attackEffects
      };
    }
  }
}

function isFacingAttacker(defender, attacker) {
  const attackerOnRight = attacker.position.x > defender.position.x;
  return (defender.facing === 'right' && attackerOnRight) || 
         (defender.facing === 'left' && !attackerOnRight);
}

function calculateDamage(attacker, defender) {
  let baseDamage = attacker.attackDamage || 10;
  
  // Apply strength modifier
  baseDamage *= (1 + (attacker.stats.strength - 10) / 100);
  
  // Apply evolution-based damage modifiers
  baseDamage = EvolutionCombatIntegration.applyEvolutionModifiers(baseDamage, attacker, defender);
  
  // Apply defense reduction
  const defenseReduction = 1 - (defender.stats.defense / 100);
  baseDamage *= defenseReduction;
  
  // Apply combo damage scaling
  if (attacker.comboCount > 1) {
    const scaling = Math.max(0.5, 1 - (attacker.comboCount * 0.1));
    baseDamage *= scaling;
  }
  
  // Get evolution combat properties for critical chance
  const evolutionProps = EvolutionCombatIntegration.getEvolutionCombatProperties(attacker.evolutionStage);
  
  // Critical hit chance (evolution-based)
  if (Math.random() < evolutionProps.critChance) {
    baseDamage *= 1.5;
    attacker.lastHitCritical = true;
  }
  
  // Apply evolution defense properties
  const defenseResult = EvolutionCombatIntegration.applyEvolutionDefense(baseDamage, defender);
  
  if (defenseResult.dodged) {
    // Create dodge effect
    defender.dodgeEffect = true;
    return 0;
  }
  
  if (defenseResult.reflected) {
    // Damage reflection for Legend tier
    attacker.reflectedDamage = defenseResult.reflected;
  }
  
  return defenseResult.damage;
}

function applyDamage(attacker, defender, damage, onHit) {
  defender.health = Math.max(0, defender.health - damage);
  
  // Track damage statistics
  attacker.damageDealt = (attacker.damageDealt || 0) + damage;
  defender.damageTaken = (defender.damageTaken || 0) + damage;
  
  // Build special meter for attacker
  attacker.specialMeter = Math.min(100, (attacker.specialMeter || 0) + damage * 0.5);
  
  // Trigger hit callback
  if (onHit) {
    onHit(attacker, defender, damage);
  }
}

function handleProjectiles(entities, onHit) {
  // Create pending projectiles
  Object.values(entities).forEach(entity => {
    if (entity.pendingProjectile) {
      const projectile = createProjectile(entity, entity.pendingProjectile);
      entities[`projectile_${Date.now()}`] = projectile;
      entity.pendingProjectile = null;
    }
  });
  
  // Update existing projectiles
  const projectiles = Object.entries(entities).filter(([key, e]) => e.type === 'projectile');
  const fighters = Object.values(entities).filter(e => e.type === 'fighter');
  
  projectiles.forEach(([key, projectile]) => {
    // Check collisions with fighters
    fighters.forEach(fighter => {
      if (fighter.id !== projectile.ownerId && checkHitboxCollision(projectile.hitbox, fighter.hitbox)) {
        processProjectileHit(projectile, fighter, onHit);
        projectile.destroyed = true;
      }
    });
    
    // Remove destroyed projectiles
    if (projectile.destroyed) {
      delete entities[key];
    }
  });
}

function createProjectile(owner, config) {
  const speed = config.type === 'fireball' ? 400 : 300;
  const direction = config.direction === 'right' ? 1 : -1;
  
  return {
    type: 'projectile',
    ownerId: owner.id,
    position: {
      x: config.position.x + direction * 50,
      y: config.position.y - 30,
    },
    velocity: {
      x: speed * direction,
      y: 0,
    },
    hitbox: {
      x: config.position.x + direction * 50 - 15,
      y: config.position.y - 45,
      width: 30,
      height: 30,
    },
    damage: 15,
    lifetime: 2, // 2 seconds
    sprite: config.type,
  };
}

function processProjectileHit(projectile, fighter, onHit) {
  if (fighter.state === 'blocking' && isFacingProjectile(fighter, projectile)) {
    // Blocked projectile
    fighter.hitstun = BLOCKSTUN_DURATION / 2;
  } else {
    // Hit by projectile
    applyDamage({ id: projectile.ownerId, stats: { strength: 10 } }, fighter, projectile.damage, onHit);
    fighter.state = 'hurt';
    fighter.hitstun = HITSTUN_DURATION / 2;
    fighter.velocity.x = projectile.velocity.x * 0.5;
  }
}

function isFacingProjectile(fighter, projectile) {
  const projectileOnRight = projectile.position.x > fighter.position.x;
  return (fighter.facing === 'right' && projectileOnRight) || 
         (fighter.facing === 'left' && !projectileOnRight);
}

function updateDamageScaling(fighters) {
  fighters.forEach(fighter => {
    if (fighter.comboCount > 1) {
      fighter.damageScaling = Math.max(0.5, 1 - (fighter.comboCount * 0.1));
    } else {
      fighter.damageScaling = 1.0;
    }
  });
}