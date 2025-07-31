/**
 * Frame Data Manager
 * Manages frame-perfect combat timing and state transitions
 * Integrates comprehensive frame data with the game engine
 */

import { CharacterFrameData, UniversalMechanics, MoveProperty } from '../data/ComprehensiveFrameData';

export class FrameDataManager {
  constructor() {
    this.activeStates = new Map(); // Track per-character frame states
    this.frameCount = 0;
    this.hitStop = 0; // Global hitstop counter
    this.cinematicFreeze = 0; // Super freeze counter
  }

  // Initialize a character's frame state
  initializeCharacter(characterId, archetype) {
    this.activeStates.set(characterId, {
      archetype,
      currentMove: null,
      moveFrame: 0,
      hitstun: 0,
      blockstun: 0,
      knockdown: 0,
      invulnerableFrames: 0,
      armorFrames: 0,
      chargeBuffers: {
        down: 0,
        back: 0,
        downBack: 0
      },
      inputBuffer: [],
      comboCounter: 0,
      comboDamage: 0,
      airActions: {
        jumps: 0,
        airDashes: 0,
        specials: 0
      },
      cancelOptions: [],
      lastHitConfirmFrame: 0
    });
  }

  // Main update function
  update(deltaTime) {
    // Only advance if not in hitstop or cinematic freeze
    if (this.hitStop > 0) {
      this.hitStop--;
      return;
    }

    if (this.cinematicFreeze > 0) {
      this.cinematicFreeze--;
      return;
    }

    this.frameCount++;

    // Update all character states
    for (const [characterId, state] of this.activeStates) {
      this.updateCharacterState(characterId, state);
    }
  }

  // Update individual character state
  updateCharacterState(characterId, state) {
    // Decrement stun states
    if (state.hitstun > 0) {
      state.hitstun--;
      if (state.hitstun === 0) {
        this.onHitstunEnd(characterId, state);
      }
    }

    if (state.blockstun > 0) {
      state.blockstun--;
      if (state.blockstun === 0) {
        this.onBlockstunEnd(characterId, state);
      }
    }

    if (state.knockdown > 0) {
      state.knockdown--;
      if (state.knockdown === 0) {
        this.onWakeup(characterId, state);
      }
    }

    // Update invulnerability
    if (state.invulnerableFrames > 0) {
      state.invulnerableFrames--;
    }

    if (state.armorFrames > 0) {
      state.armorFrames--;
    }

    // Update charge buffers
    this.updateChargeBuffers(state);

    // Update current move
    if (state.currentMove) {
      this.updateMoveState(characterId, state);
    }

    // Clear old input buffer entries
    state.inputBuffer = state.inputBuffer.filter(
      input => this.frameCount - input.frame < 10 // 10 frame buffer window
    );
  }

  // Update move execution state
  updateMoveState(characterId, state) {
    state.moveFrame++;
    const move = this.getMoveData(state.archetype, state.currentMove);
    
    if (!move) {
      state.currentMove = null;
      return;
    }

    const totalFrames = move.startup + move.active + move.recovery;

    // Check for move completion
    if (state.moveFrame >= totalFrames) {
      this.onMoveComplete(characterId, state);
      return;
    }

    // Update cancel options based on current frame
    this.updateCancelOptions(state, move);

    // Check for special properties
    if (move.invincibleFrames) {
      const [start, end] = move.invincibleFrames;
      if (state.moveFrame >= start && state.moveFrame <= end) {
        state.invulnerableFrames = 1;
      }
    }

    if (move.armorFrames) {
      const [start, end] = move.armorFrames;
      if (state.moveFrame >= start && state.moveFrame <= end) {
        state.armorFrames = 1;
      }
    }
  }

  // Start a new move
  startMove(characterId, moveName, moveCategory = 'normals') {
    const state = this.activeStates.get(characterId);
    if (!state) return false;

    // Check if can act
    if (!this.canAct(state)) return false;

    const move = this.getMoveData(state.archetype, moveName, moveCategory);
    if (!move) return false;

    // Check resources
    if (move.meterCost && !this.checkMeter(characterId, move.meterCost)) {
      return false;
    }

    // Check charge requirements
    if (move.chargeTime && !this.checkCharge(state, move.chargeTime)) {
      return false;
    }

    // Start the move
    state.currentMove = { name: moveName, category: moveCategory };
    state.moveFrame = 0;
    state.cancelOptions = [];

    // Consume resources
    if (move.meterCost) {
      this.consumeMeter(characterId, move.meterCost);
    }

    // Apply move properties
    if (move.properties?.includes(MoveProperty.INVINCIBLE)) {
      state.invulnerableFrames = move.invincibleFrames?.[1] || move.active;
    }

    // Trigger cinematic freeze for supers
    if (move.cinematicFreeze) {
      this.cinematicFreeze = move.cinematicFreeze;
    }

    return true;
  }

  // Check if character can act
  canAct(state) {
    return state.hitstun === 0 && 
           state.blockstun === 0 && 
           state.knockdown === 0 &&
           !state.currentMove;
  }

  // Handle successful hit
  onHit(attackerId, defenderId, moveName, moveCategory = 'normals', blocked = false) {
    const attackerState = this.activeStates.get(attackerId);
    const defenderState = this.activeStates.get(defenderId);
    
    if (!attackerState || !defenderState) return;

    const move = this.getMoveData(attackerState.archetype, moveName, moveCategory);
    if (!move) return;

    // Apply hitstop
    const hitStopFrames = this.getHitStop(move);
    this.hitStop = hitStopFrames;

    // Calculate damage with scaling
    const scaledDamage = this.calculateScaledDamage(
      move.damage, 
      attackerState.comboCounter
    );

    // Apply stun to defender
    if (blocked) {
      defenderState.blockstun = move.blockstun || 
        this.calculateBlockstun(move.damage);
      
      // Chip damage
      if (UniversalMechanics.block.chipDamageMultiplier > 0) {
        this.applyDamage(defenderId, scaledDamage * UniversalMechanics.block.chipDamageMultiplier);
      }
    } else {
      defenderState.hitstun = move.hitstun || 
        this.calculateHitstun(move.damage);
      
      // Apply damage
      this.applyDamage(defenderId, scaledDamage);

      // Update combo counter
      attackerState.comboCounter++;
      attackerState.comboDamage += scaledDamage;

      // Check for knockdown
      if (move.knockdown) {
        this.applyKnockdown(defenderState, move.knockdown);
      }

      // Store hit confirm timing
      attackerState.lastHitConfirmFrame = this.frameCount;
    }

    // Apply frame advantage to attacker
    const frameAdvantage = blocked ? move.onBlock : move.onHit;
    if (typeof frameAdvantage === 'number') {
      // Frame advantage is built into the stun calculations
    }

    // Update cancel options for attacker
    if (move.cancelInto && !blocked) {
      attackerState.cancelOptions = move.cancelInto;
    }
  }

  // Calculate hitstun frames
  calculateHitstun(damage) {
    return Math.floor(12 + (damage * 0.1));
  }

  // Calculate blockstun frames
  calculateBlockstun(damage) {
    return Math.floor(8 + (damage * 0.05));
  }

  // Calculate scaled damage
  calculateScaledDamage(baseDamage, comboHits) {
    const scaling = this.getDamageScaling(comboHits);
    return Math.floor(baseDamage * scaling);
  }

  // Get damage scaling based on combo length
  getDamageScaling(hits) {
    const scalingTable = [
      1.0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2
    ];
    return scalingTable[Math.min(hits, scalingTable.length - 1)];
  }

  // Get hitstop frames for a move
  getHitStop(move) {
    if (move.type === MoveType.SUPER) {
      return UniversalMechanics.hitStop.super;
    } else if (move.type === MoveType.SPECIAL) {
      return UniversalMechanics.hitStop.special;
    } else if (move.damage > 100) {
      return UniversalMechanics.hitStop.heavy;
    } else if (move.damage > 60) {
      return UniversalMechanics.hitStop.medium;
    } else {
      return UniversalMechanics.hitStop.light;
    }
  }

  // Apply knockdown state
  applyKnockdown(state, knockdownData) {
    if (knockdownData.type === 'hard') {
      state.knockdown = knockdownData.advantage || 30;
      state.canQuickRise = false;
    } else {
      state.knockdown = knockdownData.advantage || 20;
      state.canQuickRise = knockdownData.canQuickRise !== false;
    }
  }

  // Update charge buffers
  updateChargeBuffers(state) {
    // This would integrate with input system to track charge times
    // Simplified for this implementation
  }

  // Update cancel options
  updateCancelOptions(state, move) {
    if (!move.cancelInto) return;

    // Check if we're in cancel window
    const inStartup = state.moveFrame < move.startup;
    const inActive = state.moveFrame >= move.startup && 
                    state.moveFrame < move.startup + move.active;
    const inRecovery = state.moveFrame >= move.startup + move.active;

    // Most moves can only cancel during active or early recovery
    if (inActive || (inRecovery && state.moveFrame < move.startup + move.active + 5)) {
      state.cancelOptions = move.cancelInto;
    } else {
      state.cancelOptions = [];
    }
  }

  // Check if a cancel is valid
  canCancel(characterId, fromMove, toMove) {
    const state = this.activeStates.get(characterId);
    if (!state) return false;

    // Check if in cancel window
    if (!state.cancelOptions.includes(toMove)) return false;

    // Check for hit confirm requirement
    if (this.requiresHitConfirm(toMove)) {
      const confirmWindow = 16; // frames to confirm
      if (this.frameCount - state.lastHitConfirmFrame > confirmWindow) {
        return false;
      }
    }

    return true;
  }

  // Check if move requires hit confirmation
  requiresHitConfirm(moveName) {
    return moveName === 'specials' || moveName === 'super';
  }

  // Get move data
  getMoveData(archetype, moveName, category = 'normals') {
    const characterData = CharacterFrameData[archetype];
    if (!characterData) return null;

    if (category === 'normals') {
      return characterData.normals[moveName];
    } else if (category === 'specials') {
      // Handle special move variations
      const parts = moveName.split('_');
      const specialName = parts[0];
      const strength = parts[1] || 'medium';
      return characterData.specials[specialName]?.[strength];
    } else if (category === 'supers') {
      return characterData.supers[moveName];
    }

    return null;
  }

  // Event handlers
  onHitstunEnd(characterId, state) {
    state.comboCounter = 0;
    state.comboDamage = 0;
  }

  onBlockstunEnd(characterId, state) {
    // Character can act again
  }

  onWakeup(characterId, state) {
    // Reset air actions
    state.airActions = {
      jumps: 0,
      airDashes: 0,
      specials: 0
    };
  }

  onMoveComplete(characterId, state) {
    state.currentMove = null;
    state.moveFrame = 0;
    state.cancelOptions = [];
  }

  // Helper methods for external systems
  isInHitstun(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.hitstun > 0 : false;
  }

  isInBlockstun(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.blockstun > 0 : false;
  }

  isKnockedDown(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.knockdown > 0 : false;
  }

  isInvulnerable(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.invulnerableFrames > 0 : false;
  }

  hasArmor(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.armorFrames > 0 : false;
  }

  getCurrentMove(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.currentMove : null;
  }

  getMoveFrame(characterId) {
    const state = this.activeStates.get(characterId);
    return state ? state.moveFrame : 0;
  }

  // Placeholder methods that would connect to other systems
  checkMeter(characterId, amount) {
    // Would check character's meter
    return true;
  }

  consumeMeter(characterId, amount) {
    // Would consume character's meter
  }

  applyDamage(characterId, damage) {
    // Would apply damage to character's health
  }
}

// Singleton instance
export default new FrameDataManager();