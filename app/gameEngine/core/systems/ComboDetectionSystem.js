/**
 * Advanced Combo Detection System for 16BitFit
 * Handles complex input sequences, special moves, combo recognition,
 * and integrates with frame data for authentic fighting game mechanics
 */

import { CharacterFrameData, MoveProperty } from '../data/ComprehensiveFrameData';
import FrameDataManager from './FrameDataManager';

// Input notation constants
export const InputNotation = {
  // Directional inputs (numpad notation)
  NEUTRAL: 5,
  DOWN: 2,
  DOWN_BACK: 1,
  BACK: 4,
  UP_BACK: 7,
  UP: 8,
  UP_FORWARD: 9,
  FORWARD: 6,
  DOWN_FORWARD: 3,
  
  // Attack buttons
  LP: 'LP', // Light Punch
  MP: 'MP', // Medium Punch
  HP: 'HP', // Heavy Punch
  LK: 'LK', // Light Kick
  MK: 'MK', // Medium Kick
  HK: 'HK', // Heavy Kick
  
  // Special buttons
  THROW: 'THROW',
  PARRY: 'PARRY',
  DASH: 'DASH'
};

// Motion input patterns
export const MotionInputs = {
  // Quarter circles
  QCF: [2, 3, 6], // Quarter Circle Forward
  QCB: [2, 1, 4], // Quarter Circle Back
  
  // Dragon punch
  DP: [6, 2, 3], // Forward, Down, Down-Forward
  RDP: [4, 2, 1], // Reverse Dragon Punch
  
  // Half circles
  HCF: [4, 1, 2, 3, 6], // Half Circle Forward
  HCB: [6, 3, 2, 1, 4], // Half Circle Back
  
  // 360 motions
  SPD: [6, 3, 2, 1, 4, 7, 8, 9], // Spinning Pile Driver
  
  // Charge motions (stored as special objects)
  CHARGE_BACK: { type: 'charge', direction: 4, duration: 40 }, // 40 frames
  CHARGE_DOWN: { type: 'charge', direction: 2, duration: 40 },
  
  // Rekka patterns (multi-hit specials)
  REKKA: { type: 'sequence', allowDelay: 30 }, // 30 frame window between inputs
  
  // Double tap
  DASH_FORWARD: [6, 6],
  DASH_BACK: [4, 4],
  
  // Super motions
  DOUBLE_QCF: [2, 3, 6, 2, 3, 6],
  DOUBLE_QCB: [2, 1, 4, 2, 1, 4]
};

export class ComboDetectionSystem {
  constructor() {
    // Input buffer configuration
    this.inputBufferSize = 60; // 1 second at 60fps
    this.inputBuffer = [];
    this.currentFrame = 0;
    
    // Combo tracking
    this.activeCombo = {
      hits: 0,
      damage: 0,
      maxDamage: 0,
      moves: [],
      startFrame: 0,
      lastHitFrame: 0,
      scaled: false,
      dropped: false
    };
    
    // Motion detection
    this.motionBuffer = [];
    this.chargeBuffer = {
      back: 0,
      down: 0,
      downBack: 0
    };
    
    // Special move recognition
    this.specialMoveBuffer = [];
    this.lastSpecialMove = null;
    this.specialCooldown = 0;
    
    // Combo breaker tracking
    this.breakerWindow = 0;
    this.breakerAvailable = true;
    
    // Character-specific combo routes
    this.comboRoutes = new Map();
    this.loadComboRoutes();
    
    // Stats tracking
    this.comboStats = {
      maxCombo: 0,
      totalDamage: 0,
      combosLanded: 0,
      combosDropped: 0,
      specialMovesExecuted: 0,
      perfectCombos: 0
    };
  }
  
  /**
   * Main update function - called every frame
   */
  update(deltaTime) {
    this.currentFrame++;
    
    // Clean old inputs
    this.cleanInputBuffer();
    
    // Update charge states
    this.updateChargeBuffers();
    
    // Update combo state
    this.updateComboState();
    
    // Update special cooldowns
    if (this.specialCooldown > 0) {
      this.specialCooldown--;
    }
    
    // Update breaker window
    if (this.breakerWindow > 0) {
      this.breakerWindow--;
    }
  }
  
  /**
   * Add input to the buffer
   */
  addInput(input, playerId) {
    const inputEntry = {
      input,
      frame: this.currentFrame,
      playerId,
      processed: false
    };
    
    this.inputBuffer.push(inputEntry);
    
    // Also update motion buffer for special detection
    if (this.isDirectionalInput(input)) {
      this.motionBuffer.push({
        direction: input,
        frame: this.currentFrame
      });
      
      // Update charge tracking
      this.updateChargeState(input);
    }
    
    // Attempt to detect special moves immediately
    this.detectSpecialMoves(playerId);
    
    // Check for combo breakers
    if (this.breakerWindow > 0) {
      this.checkComboBreaker(input, playerId);
    }
  }
  
  /**
   * Detect special move inputs
   */
  detectSpecialMoves(playerId) {
    // Get character data
    const character = this.getCharacterType(playerId);
    if (!character) return null;
    
    const characterData = CharacterFrameData[character];
    if (!characterData || !characterData.specials) return null;
    
    // Check each special move
    for (const [moveName, moveData] of Object.entries(characterData.specials)) {
      const detected = this.checkSpecialMoveInput(moveData, playerId);
      if (detected) {
        return this.executeSpecialMove(moveName, moveData, playerId);
      }
    }
    
    return null;
  }
  
  /**
   * Check if a special move input was performed
   */
  checkSpecialMoveInput(moveData, playerId) {
    // Get recent inputs for this player
    const recentInputs = this.getRecentInputs(playerId, 20); // Check last 20 frames
    
    if (!moveData.input) return false;
    
    // Handle different input types
    if (moveData.input.motion) {
      return this.checkMotionInput(moveData.input.motion, recentInputs);
    }
    
    if (moveData.input.charge) {
      return this.checkChargeInput(moveData.input.charge, recentInputs);
    }
    
    if (moveData.input.sequence) {
      return this.checkSequenceInput(moveData.input.sequence, recentInputs);
    }
    
    return false;
  }
  
  /**
   * Check for motion inputs (QCF, DP, etc.)
   */
  checkMotionInput(motion, inputs) {
    const motionPattern = MotionInputs[motion];
    if (!motionPattern || !Array.isArray(motionPattern)) return false;
    
    // Get directional inputs only
    const dirInputs = inputs.filter(i => this.isDirectionalInput(i.input));
    if (dirInputs.length < motionPattern.length) return false;
    
    // Check if the pattern matches
    let patternIndex = 0;
    let lastMatchFrame = -1;
    
    for (const input of dirInputs) {
      if (input.input === motionPattern[patternIndex]) {
        // Check frame gap (must be within 8 frames of each other)
        if (lastMatchFrame >= 0 && input.frame - lastMatchFrame > 8) {
          patternIndex = 0; // Reset if gap too large
        }
        
        patternIndex++;
        lastMatchFrame = input.frame;
        
        if (patternIndex >= motionPattern.length) {
          // Check if button was pressed within window
          const buttonFrame = this.getLastButtonPress(inputs, lastMatchFrame + 10);
          return buttonFrame !== null;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check for charge inputs
   */
  checkChargeInput(chargeData, inputs) {
    const { direction, duration, release } = chargeData;
    
    // Check if we have enough charge
    if (direction === 4 && this.chargeBuffer.back < duration) return false;
    if (direction === 2 && this.chargeBuffer.down < duration) return false;
    if (direction === 1 && this.chargeBuffer.downBack < duration) return false;
    
    // Check for release direction and button
    const lastInputs = inputs.slice(-3);
    const hasRelease = lastInputs.some(i => i.input === release);
    const hasButton = lastInputs.some(i => this.isAttackButton(i.input));
    
    return hasRelease && hasButton;
  }
  
  /**
   * Execute a special move
   */
  executeSpecialMove(moveName, moveData, playerId) {
    // Check cooldown
    if (this.specialCooldown > 0) return false;
    
    // Check if player can act (via FrameDataManager)
    if (!FrameDataManager.canAct(playerId)) return false;
    
    // Start the special move
    const success = FrameDataManager.startMove(playerId, moveName, 'specials');
    if (success) {
      this.lastSpecialMove = moveName;
      this.specialCooldown = 10; // Prevent special spam
      this.comboStats.specialMovesExecuted++;
      
      // Add to combo if active
      if (this.activeCombo.hits > 0) {
        this.activeCombo.moves.push({
          name: moveName,
          type: 'special',
          frame: this.currentFrame
        });
      }
      
      return moveName;
    }
    
    return false;
  }
  
  /**
   * Track combo hits and calculate damage
   */
  registerHit(attackerId, defenderId, moveName, damage, moveType = 'normal') {
    const timeSinceLastHit = this.currentFrame - this.activeCombo.lastHitFrame;
    
    // Check if this is a new combo or continuation
    if (timeSinceLastHit > 60 || this.activeCombo.dropped) {
      // Start new combo
      this.startNewCombo(attackerId);
    }
    
    // Add hit to combo
    this.activeCombo.hits++;
    this.activeCombo.lastHitFrame = this.currentFrame;
    
    // Calculate scaled damage
    const scaledDamage = this.calculateComboScaling(damage, this.activeCombo.hits);
    this.activeCombo.damage += scaledDamage;
    
    // Track the move
    this.activeCombo.moves.push({
      name: moveName,
      type: moveType,
      damage: scaledDamage,
      frame: this.currentFrame
    });
    
    // Update max combo
    if (this.activeCombo.hits > this.comboStats.maxCombo) {
      this.comboStats.maxCombo = this.activeCombo.hits;
    }
    
    // Check for combo achievements
    this.checkComboAchievements();
    
    // Open breaker window for defender
    this.breakerWindow = 8; // 8 frames to break
    
    return {
      comboHits: this.activeCombo.hits,
      comboDamage: this.activeCombo.damage,
      scaled: this.activeCombo.scaled
    };
  }
  
  /**
   * Calculate damage scaling based on combo length
   */
  calculateComboScaling(baseDamage, hits) {
    // Damage scaling table (matches FrameDataManager)
    const scalingTable = [
      1.0,  // 1st hit: 100%
      1.0,  // 2nd hit: 100%
      0.9,  // 3rd hit: 90%
      0.8,  // 4th hit: 80%
      0.7,  // 5th hit: 70%
      0.6,  // 6th hit: 60%
      0.5,  // 7th hit: 50%
      0.4,  // 8th hit: 40%
      0.3,  // 9th hit: 30%
      0.2   // 10th+ hit: 20%
    ];
    
    const scaling = scalingTable[Math.min(hits - 1, scalingTable.length - 1)];
    this.activeCombo.scaled = scaling < 1.0;
    
    return Math.floor(baseDamage * scaling);
  }
  
  /**
   * Check for combo breaker input
   */
  checkComboBreaker(input, playerId) {
    // Combo breaker requires specific input during breaker window
    const breakerInput = [InputNotation.LP, InputNotation.LK]; // LP+LK
    const recentInputs = this.getRecentInputs(playerId, 3);
    
    const hasLP = recentInputs.some(i => i.input === InputNotation.LP);
    const hasLK = recentInputs.some(i => i.input === InputNotation.LK);
    
    if (hasLP && hasLK && this.breakerAvailable) {
      this.executeComboBreaker(playerId);
      return true;
    }
    
    return false;
  }
  
  /**
   * Execute combo breaker
   */
  executeComboBreaker(playerId) {
    // Reset combo
    this.activeCombo.dropped = true;
    this.breakerWindow = 0;
    this.breakerAvailable = false;
    
    // Breaker has a cooldown
    setTimeout(() => {
      this.breakerAvailable = true;
    }, 5000); // 5 second cooldown
    
    return {
      type: 'COMBO_BREAKER',
      playerId,
      comboBroken: this.activeCombo.hits
    };
  }
  
  /**
   * Get visual feedback data for combos
   */
  getComboVisualData() {
    if (this.activeCombo.hits === 0) return null;
    
    return {
      hits: this.activeCombo.hits,
      damage: this.activeCombo.damage,
      scaled: this.activeCombo.scaled,
      perfect: this.isPerfectCombo(),
      // Visual style based on combo size
      style: this.getComboStyle(this.activeCombo.hits),
      // Position offset for hit counter
      offset: this.getComboCounterOffset(),
      // Special effects
      effects: this.getComboEffects()
    };
  }
  
  /**
   * Determine combo visual style
   */
  getComboStyle(hits) {
    if (hits >= 20) return 'legendary';
    if (hits >= 15) return 'epic';
    if (hits >= 10) return 'super';
    if (hits >= 5) return 'great';
    return 'normal';
  }
  
  /**
   * Get combo counter position offset (for shake effect)
   */
  getComboCounterOffset() {
    const baseOffset = { x: 0, y: 0 };
    
    // Add shake on new hits
    const timeSinceHit = this.currentFrame - this.activeCombo.lastHitFrame;
    if (timeSinceHit < 5) {
      const intensity = 5 - timeSinceHit;
      baseOffset.x = (Math.random() - 0.5) * intensity * 2;
      baseOffset.y = (Math.random() - 0.5) * intensity * 2;
    }
    
    return baseOffset;
  }
  
  /**
   * Get special effects for combo display
   */
  getComboEffects() {
    const effects = [];
    
    // Add effects based on combo milestones
    if (this.activeCombo.hits === 5) effects.push('milestone_5');
    if (this.activeCombo.hits === 10) effects.push('milestone_10');
    if (this.activeCombo.hits === 15) effects.push('milestone_15');
    if (this.activeCombo.hits === 20) effects.push('milestone_20');
    
    // Add scaling warning
    if (this.activeCombo.scaled) effects.push('damage_scaled');
    
    // Add perfect combo glow
    if (this.isPerfectCombo()) effects.push('perfect_glow');
    
    return effects;
  }
  
  /**
   * Check if current combo is "perfect" (optimal routing)
   */
  isPerfectCombo() {
    if (this.activeCombo.moves.length < 3) return false;
    
    // Check if combo follows known optimal routes
    const moveSequence = this.activeCombo.moves.map(m => m.name).join(' > ');
    const optimalRoutes = this.comboRoutes.get('optimal') || [];
    
    return optimalRoutes.some(route => moveSequence.includes(route));
  }
  
  /**
   * Load character-specific combo routes
   */
  loadComboRoutes() {
    // Warrior optimal combos
    this.comboRoutes.set('warrior_optimal', [
      'standingLP > standingMP > standingHP > shoryuken',
      'jumpHP > standingHP > hadouken',
      'standingLK > standingMK > tatsumaki'
    ]);
    
    // Speedster optimal combos
    this.comboRoutes.set('speedster_optimal', [
      'standingLP > standingLP > standingMP > dashPunch',
      'crossupLK > crouchingLP > standingMP > special'
    ]);
    
    // Tank optimal combos
    this.comboRoutes.set('tank_optimal', [
      'jumpHP > standingHP > spd',
      'standingHP > charge > tackle'
    ]);
  }
  
  /**
   * Helper methods
   */
  
  cleanInputBuffer() {
    const cutoffFrame = this.currentFrame - this.inputBufferSize;
    this.inputBuffer = this.inputBuffer.filter(i => i.frame > cutoffFrame);
    this.motionBuffer = this.motionBuffer.filter(i => i.frame > cutoffFrame);
  }
  
  updateChargeBuffers() {
    // Decay charge if not holding
    if (this.chargeBuffer.back > 0) this.chargeBuffer.back--;
    if (this.chargeBuffer.down > 0) this.chargeBuffer.down--;
    if (this.chargeBuffer.downBack > 0) this.chargeBuffer.downBack--;
  }
  
  updateChargeState(input) {
    if (input === InputNotation.BACK) this.chargeBuffer.back++;
    if (input === InputNotation.DOWN) this.chargeBuffer.down++;
    if (input === InputNotation.DOWN_BACK) {
      this.chargeBuffer.downBack++;
      this.chargeBuffer.back++;
      this.chargeBuffer.down++;
    }
  }
  
  updateComboState() {
    // Check if combo has timed out
    if (this.activeCombo.hits > 0) {
      const timeSinceLastHit = this.currentFrame - this.activeCombo.lastHitFrame;
      if (timeSinceLastHit > 60) { // 1 second timeout
        this.endCombo();
      }
    }
  }
  
  startNewCombo(attackerId) {
    // Save previous combo stats if it was significant
    if (this.activeCombo.hits >= 3) {
      this.comboStats.combosLanded++;
      this.comboStats.totalDamage += this.activeCombo.damage;
      
      if (this.isPerfectCombo()) {
        this.comboStats.perfectCombos++;
      }
    }
    
    // Reset combo
    this.activeCombo = {
      hits: 0,
      damage: 0,
      maxDamage: 0,
      moves: [],
      startFrame: this.currentFrame,
      lastHitFrame: this.currentFrame,
      scaled: false,
      dropped: false,
      attackerId
    };
  }
  
  endCombo() {
    if (this.activeCombo.dropped) {
      this.comboStats.combosDropped++;
    }
    
    // Reset for next combo
    this.activeCombo.hits = 0;
    this.activeCombo.damage = 0;
    this.activeCombo.moves = [];
    this.activeCombo.dropped = false;
  }
  
  checkComboAchievements() {
    const achievements = [];
    
    // Check various combo milestones
    if (this.activeCombo.hits === 10) achievements.push('10_hit_combo');
    if (this.activeCombo.hits === 20) achievements.push('20_hit_combo');
    if (this.activeCombo.damage >= 500) achievements.push('500_damage_combo');
    if (this.isPerfectCombo()) achievements.push('perfect_execution');
    
    return achievements;
  }
  
  getRecentInputs(playerId, frameWindow) {
    const cutoff = this.currentFrame - frameWindow;
    return this.inputBuffer.filter(
      i => i.playerId === playerId && i.frame > cutoff
    );
  }
  
  getLastButtonPress(inputs, beforeFrame) {
    const buttons = inputs.filter(
      i => this.isAttackButton(i.input) && i.frame <= beforeFrame
    );
    return buttons.length > 0 ? buttons[buttons.length - 1].frame : null;
  }
  
  isDirectionalInput(input) {
    return typeof input === 'number' && input >= 1 && input <= 9;
  }
  
  isAttackButton(input) {
    return [
      InputNotation.LP, InputNotation.MP, InputNotation.HP,
      InputNotation.LK, InputNotation.MK, InputNotation.HK
    ].includes(input);
  }
  
  getCharacterType(playerId) {
    // This would be retrieved from character context
    // For now, return warrior as default
    return 'warrior';
  }
  
  /**
   * Get current combo statistics
   */
  getStats() {
    return {
      ...this.comboStats,
      currentCombo: this.activeCombo.hits,
      currentDamage: this.activeCombo.damage
    };
  }
  
  /**
   * Reset all combo data
   */
  reset() {
    this.inputBuffer = [];
    this.motionBuffer = [];
    this.chargeBuffer = { back: 0, down: 0, downBack: 0 };
    this.activeCombo = {
      hits: 0,
      damage: 0,
      maxDamage: 0,
      moves: [],
      startFrame: 0,
      lastHitFrame: 0,
      scaled: false,
      dropped: false
    };
    this.breakerWindow = 0;
    this.specialCooldown = 0;
  }
}

// Singleton instance
export default new ComboDetectionSystem();