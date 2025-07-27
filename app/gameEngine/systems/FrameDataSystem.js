// Frame data for precise fighting game mechanics
// 60fps = 16.67ms per frame

export const FrameData = {
  // Attack frame data
  attacks: {
    punch: {
      startup: 3,      // 3 frames (50ms) before hit
      active: 2,       // 2 frames (33ms) hitting
      recovery: 8,     // 8 frames (133ms) recovery
      damage: 10,
      blockstun: 4,    // Frames opponent is in blockstun
      hitstun: 12,     // Frames opponent is in hitstun
      cancelWindow: [5, 8], // Can cancel into special during these frames
    },
    kick: {
      startup: 5,
      active: 3,
      recovery: 12,
      damage: 15,
      blockstun: 6,
      hitstun: 16,
      cancelWindow: [6, 10],
    },
    special: {
      startup: 8,
      active: 5,
      recovery: 20,
      damage: 25,
      blockstun: 10,
      hitstun: 24,
      cancelWindow: null, // Cannot cancel
    },
    // Tier-specific attacks
    charge: {
      startup: 10,
      active: 4,
      recovery: 15,
      damage: 20,
      blockstun: 8,
      hitstun: 20,
      cancelWindow: null,
    },
    high: {
      startup: 4,
      active: 2,
      recovery: 10,
      damage: 12,
      blockstun: 5,
      hitstun: 14,
      cancelWindow: [5, 9],
    },
    mid: {
      startup: 3,
      active: 2,
      recovery: 9,
      damage: 10,
      blockstun: 4,
      hitstun: 12,
      cancelWindow: [5, 8],
    },
    low: {
      startup: 5,
      active: 2,
      recovery: 11,
      damage: 12,
      blockstun: 5,
      hitstun: 14,
      cancelWindow: [6, 10],
    },
  },
  
  // Movement frame data
  movement: {
    walk: {
      speed: 2,
      acceleration: 0.5,
    },
    dash: {
      startup: 3,
      duration: 15,
      recovery: 5,
      speed: 6,
      invulnerable: false,
    },
    jump: {
      prejump: 4,      // Frames before leaving ground
      airborne: 30,    // Frames in air
      landing: 4,      // Landing recovery
      cancelable: true, // Can attack during jump
    },
  },
  
  // Defense frame data
  defense: {
    block: {
      startup: 1,      // Near instant
      active: -1,      // Infinite while held
      recovery: 2,     // Frames to drop guard
      chipDamage: 0.1, // 10% damage on block
    },
    parry: {
      startup: 2,
      active: 6,       // 6 frame window to parry
      recovery: 20,    // High risk if missed
      counterBonus: 1.5, // Damage multiplier after parry
    },
  },
};

// Frame advantage calculator
export const calculateFrameAdvantage = (attacker, defender) => {
  const attackData = FrameData.attacks[attacker.lastAttack];
  const isBlocked = defender.state.isBlocking;
  
  if (!attackData) return 0;
  
  const stun = isBlocked ? attackData.blockstun : attackData.hitstun;
  const attackerRecovery = attackData.recovery;
  
  // Positive = attacker advantage, Negative = defender advantage
  return stun - attackerRecovery;
};

// Combo validator
export const isComboValid = (previousAttack, currentAttack, currentFrame) => {
  const prevData = FrameData.attacks[previousAttack];
  if (!prevData || !prevData.cancelWindow) return false;
  
  const [windowStart, windowEnd] = prevData.cancelWindow;
  const framesSinceAttack = currentFrame - prevData.startup;
  
  return framesSinceAttack >= windowStart && framesSinceAttack <= windowEnd;
};

// Frame data system for combat
class FrameDataSystem {
  constructor() {
    this.frameCount = 0;
    this.entityStates = new Map();
  }

  process(entities, { time }) {
    this.frameCount++;
    
    // Process each fighter
    Object.entries(entities).forEach(([key, entity]) => {
      if (entity.type === 'fighter' || entity.attack) {
        this.processFighter(key, entity);
      }
    });
    
    return entities;
  }

  processFighter(key, fighter) {
    let state = this.entityStates.get(key);
    if (!state) {
      state = {
        currentAttack: null,
        attackFrame: 0,
        stunFrames: 0,
        invulnerableFrames: 0,
      };
      this.entityStates.set(key, state);
    }
    
    // Process attack states
    if (fighter.state?.isAttacking && fighter.state.currentAnimation) {
      if (state.currentAttack !== fighter.state.currentAnimation) {
        // New attack started
        state.currentAttack = fighter.state.currentAnimation;
        state.attackFrame = 0;
      } else {
        // Continue attack
        state.attackFrame++;
      }
      
      const attackData = FrameData.attacks[state.currentAttack];
      if (attackData) {
        // Check if attack is in active frames
        if (state.attackFrame >= attackData.startup && 
            state.attackFrame < attackData.startup + attackData.active) {
          fighter.isHitActive = true;
        } else {
          fighter.isHitActive = false;
        }
        
        // Check if attack is finished
        if (state.attackFrame >= attackData.startup + attackData.active + attackData.recovery) {
          fighter.state.isAttacking = false;
          fighter.state.currentAnimation = 'idle';
          state.currentAttack = null;
        }
      }
    }
    
    // Process stun states
    if (state.stunFrames > 0) {
      state.stunFrames--;
      fighter.isStunned = true;
    } else {
      fighter.isStunned = false;
    }
    
    // Process invulnerability
    if (state.invulnerableFrames > 0) {
      state.invulnerableFrames--;
      fighter.isInvulnerable = true;
    } else {
      fighter.isInvulnerable = false;
    }
  }
  
  // Apply hitstun or blockstun to a fighter
  applyStun(fighterKey, frames) {
    const state = this.entityStates.get(fighterKey);
    if (state) {
      state.stunFrames = frames;
    }
  }
  
  // Grant invulnerability frames
  grantInvulnerability(fighterKey, frames) {
    const state = this.entityStates.get(fighterKey);
    if (state) {
      state.invulnerableFrames = frames;
    }
  }
}

// Export as system function
export default (entities, input) => {
  if (!entities.frameData) {
    entities.frameData = new FrameDataSystem();
  }
  
  return entities.frameData.process(entities, input);
};