/**
 * Character-specific hitbox and hurtbox configurations
 * Defines all attack hitboxes and defensive hurtboxes for each character
 */

import { HitboxType, HurtboxType, HitboxPriority } from '../systems/HitboxHurtboxSystem';

// Base character hitbox data structure
export const CharacterHitboxData = {
  // Warrior character
  warrior: {
    hurtboxes: {
      standing: [{
        id: 'main_body',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -45 },
        width: 50,
        height: 90,
        damageMultiplier: 1.0,
      }],
      crouching: [{
        id: 'main_body_crouch',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -30 },
        width: 50,
        height: 60,
        damageMultiplier: 1.0,
      }],
      jumping: [{
        id: 'main_body_air',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -45 },
        width: 45,
        height: 85,
        damageMultiplier: 1.1, // Take slightly more damage in air
      }],
    },
    attacks: {
      // Light punch
      lightPunch: {
        startup: 2,
        active: 3,
        recovery: 8,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.LOW,
          offset: { x: 35, y: -35 },
          width: 35,
          height: 25,
          damage: 8,
          hitstun: 250,
          blockstun: 100,
          knockback: { x: 100, y: -30 },
          activeFrames: [[2, 4]],
        }],
      },
      
      // Medium punch
      mediumPunch: {
        startup: 4,
        active: 4,
        recovery: 12,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.MEDIUM,
          offset: { x: 45, y: -35 },
          width: 45,
          height: 30,
          damage: 15,
          hitstun: 350,
          blockstun: 150,
          knockback: { x: 200, y: -50 },
          activeFrames: [[4, 7]],
        }],
      },
      
      // Heavy punch
      heavyPunch: {
        startup: 6,
        active: 5,
        recovery: 18,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.HIGH,
          offset: { x: 55, y: -35 },
          width: 55,
          height: 40,
          damage: 25,
          hitstun: 500,
          blockstun: 250,
          knockback: { x: 350, y: -100 },
          activeFrames: [[6, 10]],
        }],
      },
      
      // Light kick
      lightKick: {
        startup: 3,
        active: 3,
        recovery: 10,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.LOW,
          offset: { x: 40, y: -20 },
          width: 40,
          height: 35,
          damage: 10,
          hitstun: 300,
          blockstun: 120,
          knockback: { x: 150, y: -40 },
          activeFrames: [[3, 5]],
        }],
      },
      
      // Uppercut special
      uppercut: {
        startup: 3,
        active: 8,
        recovery: 20,
        invulnerableFrames: [1, 5], // Invincible during startup
        hitboxes: [
          {
            // Initial hit
            type: HitboxType.STRIKE,
            priority: HitboxPriority.HIGH,
            offset: { x: 30, y: -30 },
            width: 40,
            height: 40,
            damage: 15,
            hitstun: 400,
            blockstun: 200,
            knockback: { x: 50, y: -200 },
            activeFrames: [[3, 5]],
          },
          {
            // Rising hit
            type: HitboxType.STRIKE,
            priority: HitboxPriority.HIGH,
            offset: { x: 25, y: -60 },
            width: 50,
            height: 70,
            damage: 20,
            hitstun: 600,
            blockstun: 300,
            knockback: { x: 100, y: -400 },
            activeFrames: [[6, 10]],
          }
        ],
      },
      
      // Fireball projectile
      fireball: {
        startup: 10,
        active: 60, // Projectile lifetime
        recovery: 20,
        projectile: {
          type: HitboxType.PROJECTILE,
          priority: HitboxPriority.MEDIUM,
          speed: 400,
          offset: { x: 50, y: -35 }, // Spawn position
          width: 30,
          height: 30,
          damage: 20,
          hitstun: 400,
          blockstun: 200,
          knockback: { x: 200, y: -50 },
          activeFrames: [[0, 999]], // Always active
        },
      },
    },
  },
  
  // Speed character
  speedster: {
    hurtboxes: {
      standing: [{
        id: 'main_body',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -40 },
        width: 45,
        height: 80,
        damageMultiplier: 1.0,
      }],
      crouching: [{
        id: 'main_body_crouch',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -25 },
        width: 45,
        height: 50,
        damageMultiplier: 1.0,
      }],
      dashing: [{
        id: 'main_body_dash',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -35 },
        width: 60,
        height: 70,
        damageMultiplier: 0.8, // Harder to hit while dashing
      }],
    },
    attacks: {
      // Quick jab
      quickJab: {
        startup: 1,
        active: 2,
        recovery: 5,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.LOW,
          offset: { x: 30, y: -35 },
          width: 30,
          height: 20,
          damage: 5,
          hitstun: 150,
          blockstun: 50,
          knockback: { x: 50, y: -20 },
          activeFrames: [[1, 2]],
        }],
      },
      
      // Spinning kick
      spinningKick: {
        startup: 5,
        active: 12,
        recovery: 15,
        hitboxes: [
          {
            // First rotation
            type: HitboxType.STRIKE,
            priority: HitboxPriority.MEDIUM,
            offset: { x: 45, y: -30 },
            width: 50,
            height: 40,
            damage: 12,
            hitstun: 300,
            blockstun: 150,
            knockback: { x: 150, y: -60 },
            activeFrames: [[5, 8]],
          },
          {
            // Second rotation
            type: HitboxType.STRIKE,
            priority: HitboxPriority.MEDIUM,
            offset: { x: -45, y: -30 },
            width: 50,
            height: 40,
            damage: 12,
            hitstun: 300,
            blockstun: 150,
            knockback: { x: -150, y: -60 },
            activeFrames: [[9, 12]],
          }
        ],
      },
      
      // Dash attack
      dashAttack: {
        startup: 2,
        active: 8,
        recovery: 12,
        movement: { x: 200, y: 0 }, // Move forward during attack
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.HIGH,
          offset: { x: 40, y: -35 },
          width: 60,
          height: 50,
          damage: 18,
          hitstun: 400,
          blockstun: 200,
          knockback: { x: 250, y: -80 },
          activeFrames: [[2, 9]],
        }],
      },
    },
  },
  
  // Tank character
  tank: {
    hurtboxes: {
      standing: [{
        id: 'main_body',
        type: HurtboxType.NORMAL,
        offset: { x: 0, y: -50 },
        width: 60,
        height: 100,
        damageMultiplier: 0.85, // Naturally tanky
      }],
      armored: [{
        id: 'main_body_armor',
        type: HurtboxType.ARMOR,
        offset: { x: 0, y: -50 },
        width: 65,
        height: 100,
        damageMultiplier: 0.5, // Heavy damage reduction
      }],
    },
    attacks: {
      // Heavy slam
      heavySlam: {
        startup: 10,
        active: 6,
        recovery: 25,
        hitboxes: [{
          type: HitboxType.STRIKE,
          priority: HitboxPriority.SUPER,
          offset: { x: 50, y: -20 },
          width: 70,
          height: 60,
          damage: 35,
          hitstun: 700,
          blockstun: 400,
          knockback: { x: 400, y: -150 },
          activeFrames: [[10, 15]],
        }],
      },
      
      // Grab
      grab: {
        startup: 4,
        active: 4,
        recovery: 20,
        hitboxes: [{
          type: HitboxType.THROW,
          priority: HitboxPriority.HIGH,
          offset: { x: 40, y: -40 },
          width: 40,
          height: 60,
          damage: 0, // Damage comes from throw
          hitstun: 0,
          blockstun: 0,
          knockback: { x: 0, y: 0 },
          activeFrames: [[4, 7]],
          onHit: 'initiate_throw', // Special property
        }],
      },
      
      // Counter stance
      counter: {
        startup: 3,
        active: 30, // Long active window
        recovery: 10,
        counterFrames: [3, 32], // When counter is active
        onCounter: {
          damage: 30,
          hitstun: 600,
          knockback: { x: 300, y: -200 },
        },
      },
    },
  },
};

// Helper function to get frame data for an attack
export function getAttackFrameData(character, attackName) {
  const characterData = CharacterHitboxData[character];
  if (!characterData || !characterData.attacks[attackName]) {
    return null;
  }
  
  const attack = characterData.attacks[attackName];
  return {
    totalFrames: attack.startup + attack.active + attack.recovery,
    startup: attack.startup,
    active: attack.active,
    recovery: attack.recovery,
    hitboxes: attack.hitboxes || [],
    projectile: attack.projectile || null,
    invulnerableFrames: attack.invulnerableFrames || null,
    movement: attack.movement || null,
  };
}

// Helper function to get hurtbox configuration for a state
export function getHurtboxConfig(character, state) {
  const characterData = CharacterHitboxData[character];
  if (!characterData || !characterData.hurtboxes[state]) {
    // Default to standing if state not found
    return characterData?.hurtboxes.standing || [];
  }
  
  return characterData.hurtboxes[state];
}