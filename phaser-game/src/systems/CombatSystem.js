/**
 * Street Fighter 2 Style Combat System
 * Handles frame-perfect combat mechanics, hitboxes, and combo systems
 */

export class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Frame data for all moves
    this.frameData = new Map();
    
    // Input buffer for special move detection
    this.inputBufferSize = 30; // 30 frames = 0.5 seconds at 60fps
    this.inputHistoryP1 = [];
    this.inputHistoryP2 = [];
    
    // Combo system
    this.comboWindowFrames = 15; // Link window for combos
    this.comboCounts = { p1: 0, p2: 0 };
    this.comboTimers = { p1: 0, p2: 0 };
    
    // Damage scaling for combos
    this.damageScaling = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.3];
    
    // Super meter
    this.superMeterMax = 100;
    this.superMeters = { p1: 0, p2: 0 };
    
    // Hitstun/blockstun tracking
    this.stunTimers = { p1: 0, p2: 0 };
    
    // Initialize move data
    this.initializeFrameData();
    
    // Special move patterns
    this.specialMovePatterns = this.initializeSpecialMoves();
  }

  initializeFrameData() {
    // Light Punch (LP)
    this.frameData.set('LP', {
      startup: 3,
      active: 3,
      recovery: 7,
      damage: 20,
      hitstun: 12,
      blockstun: 8,
      pushback: 2,
      cancelable: true,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 50, y: -20, width: 60, height: 40 },
      hurtbox: { x: 0, y: 0, width: 80, height: 150 }
    });

    // Medium Punch (MP)
    this.frameData.set('MP', {
      startup: 5,
      active: 4,
      recovery: 10,
      damage: 30,
      hitstun: 16,
      blockstun: 12,
      pushback: 3,
      cancelable: true,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 60, y: -20, width: 70, height: 45 },
      hurtbox: { x: 0, y: 0, width: 85, height: 150 }
    });

    // Heavy Punch (HP)
    this.frameData.set('HP', {
      startup: 8,
      active: 5,
      recovery: 18,
      damage: 45,
      hitstun: 22,
      blockstun: 18,
      pushback: 5,
      cancelable: false,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 70, y: -20, width: 80, height: 50 },
      hurtbox: { x: 0, y: 0, width: 90, height: 150 }
    });

    // Light Kick (LK)
    this.frameData.set('LK', {
      startup: 4,
      active: 3,
      recovery: 8,
      damage: 18,
      hitstun: 12,
      blockstun: 8,
      pushback: 2,
      cancelable: true,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 55, y: 20, width: 65, height: 50 },
      hurtbox: { x: 0, y: 0, width: 80, height: 150 }
    });

    // Medium Kick (MK)
    this.frameData.set('MK', {
      startup: 6,
      active: 4,
      recovery: 12,
      damage: 28,
      hitstun: 16,
      blockstun: 12,
      pushback: 4,
      cancelable: true,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 65, y: 10, width: 75, height: 60 },
      hurtbox: { x: 0, y: 0, width: 85, height: 150 }
    });

    // Heavy Kick (HK)
    this.frameData.set('HK', {
      startup: 10,
      active: 6,
      recovery: 20,
      damage: 40,
      hitstun: 24,
      blockstun: 20,
      pushback: 6,
      cancelable: false,
      specialCancelable: false,
      superCancelable: true,
      hitbox: { x: 75, y: 0, width: 85, height: 70 },
      hurtbox: { x: 0, y: 0, width: 90, height: 150 }
    });

    // Crouching attacks
    this.frameData.set('CR_LP', {
      startup: 3,
      active: 3,
      recovery: 6,
      damage: 18,
      hitstun: 12,
      blockstun: 8,
      pushback: 1,
      cancelable: true,
      specialCancelable: true,
      superCancelable: true,
      hitbox: { x: 45, y: 40, width: 55, height: 30 },
      hurtbox: { x: 0, y: 25, width: 80, height: 100 }
    });

    this.frameData.set('CR_MK', {
      startup: 7,
      active: 5,
      recovery: 14,
      damage: 25,
      hitstun: 18,
      blockstun: 14,
      pushback: 4,
      cancelable: false,
      specialCancelable: true,
      superCancelable: true,
      low: true, // Must be blocked low
      hitbox: { x: 70, y: 70, width: 80, height: 20 },
      hurtbox: { x: 0, y: 25, width: 80, height: 100 }
    });

    // Jumping attacks
    this.frameData.set('J_HP', {
      startup: 6,
      active: 8,
      recovery: 4,
      damage: 40,
      hitstun: 20,
      blockstun: 16,
      pushback: 3,
      cancelable: false,
      specialCancelable: false,
      superCancelable: false,
      overhead: true, // Must be blocked high
      hitbox: { x: 30, y: 20, width: 70, height: 60 },
      hurtbox: { x: 0, y: 0, width: 80, height: 150 }
    });

    // Special Moves
    this.frameData.set('HADOUKEN', {
      startup: 13,
      active: 999, // Projectile
      recovery: 40,
      damage: 30,
      hitstun: 18,
      blockstun: 14,
      pushback: 4,
      cancelable: false,
      specialCancelable: false,
      superCancelable: true,
      projectile: true,
      projectileSpeed: 8,
      hitbox: { x: 0, y: 0, width: 50, height: 50 }
    });

    this.frameData.set('SHORYUKEN', {
      startup: 3,
      active: 14,
      recovery: 24,
      damage: 60,
      hitstun: 30,
      blockstun: 0, // Can't be blocked
      pushback: 0,
      cancelable: false,
      specialCancelable: false,
      superCancelable: false,
      invincible: { start: 1, end: 6 }, // Invincible frames 1-6
      hitbox: { x: 40, y: -60, width: 60, height: 120 },
      hurtbox: { x: 0, y: 0, width: 80, height: 150 }
    });

    // Throw
    this.frameData.set('THROW', {
      startup: 5,
      active: 2,
      recovery: 24,
      damage: 40,
      hitstun: 60,
      blockstun: 0, // Can't be blocked
      pushback: 0,
      cancelable: false,
      specialCancelable: false,
      superCancelable: false,
      throw: true,
      range: 80,
      hitbox: { x: 50, y: 0, width: 80, height: 100 }
    });

    // Super Move
    this.frameData.set('SUPER_HADOUKEN', {
      startup: 10,
      active: 999, // Projectile
      recovery: 50,
      damage: 80,
      hitstun: 40,
      blockstun: 30,
      pushback: 8,
      cancelable: false,
      specialCancelable: false,
      superCancelable: false,
      projectile: true,
      projectileSpeed: 12,
      meterCost: 100,
      hitbox: { x: 0, y: 0, width: 100, height: 80 },
      hits: 5 // Multi-hit
    });
  }

  initializeSpecialMoves() {
    return {
      // Quarter Circle Forward + Punch (Hadouken)
      QCF_P: {
        pattern: ['DOWN', 'DOWN_FORWARD', 'FORWARD'],
        buttons: ['LP', 'MP', 'HP'],
        move: 'HADOUKEN',
        window: 10 // frames to complete motion
      },
      
      // Dragon Punch Motion + Punch (Shoryuken)
      DP_P: {
        pattern: ['FORWARD', 'DOWN', 'DOWN_FORWARD'],
        buttons: ['LP', 'MP', 'HP'],
        move: 'SHORYUKEN',
        window: 10
      },
      
      // Quarter Circle Back + Kick (Tatsumaki)
      QCB_K: {
        pattern: ['DOWN', 'DOWN_BACK', 'BACK'],
        buttons: ['LK', 'MK', 'HK'],
        move: 'TATSUMAKI',
        window: 10
      },
      
      // Charge Back then Forward + Punch (Sonic Boom)
      CHARGE_B_F_P: {
        pattern: ['CHARGE_BACK', 'FORWARD'],
        buttons: ['LP', 'MP', 'HP'],
        move: 'SONIC_BOOM',
        window: 8,
        chargeTime: 60 // 1 second charge at 60fps
      },
      
      // 360 Motion + Punch (SPD)
      SPD: {
        pattern: ['FORWARD', 'DOWN_FORWARD', 'DOWN', 'DOWN_BACK', 'BACK', 'UP_BACK', 'UP', 'UP_FORWARD'],
        buttons: ['LP', 'MP', 'HP'],
        move: 'SPD',
        window: 15,
        isCommand: true // Command grab
      },
      
      // Double QCF + Punch (Super)
      SUPER_QCF_P: {
        pattern: ['DOWN', 'DOWN_FORWARD', 'FORWARD', 'DOWN', 'DOWN_FORWARD', 'FORWARD'],
        buttons: ['LP', 'MP', 'HP'],
        move: 'SUPER_HADOUKEN',
        window: 20,
        requiresMeter: true
      }
    };
  }

  // Process input and update input buffer
  processInput(player, input) {
    const history = player === 'p1' ? this.inputHistoryP1 : this.inputHistoryP2;
    
    // Add to history with timestamp
    history.push({
      input: input,
      frame: this.scene.game.loop.frame,
      timestamp: performance.now()
    });
    
    // Keep buffer size limited
    if (history.length > this.inputBufferSize) {
      history.shift();
    }
    
    // Check for special moves
    const specialMove = this.checkSpecialMoves(player, history);
    if (specialMove) {
      return specialMove;
    }
    
    // Return normal move
    return input;
  }

  checkSpecialMoves(player, history) {
    if (history.length < 2) return null;
    
    const currentFrame = this.scene.game.loop.frame;
    
    // Check each special move pattern
    for (const [key, special] of Object.entries(this.specialMovePatterns)) {
      // Check if we have the required button press
      const lastInput = history[history.length - 1];
      if (!special.buttons.includes(lastInput.input)) continue;
      
      // Check if meter requirement is met
      if (special.requiresMeter && this.superMeters[player] < this.superMeterMax) {
        continue;
      }
      
      // Check charge moves
      if (special.chargeTime) {
        if (!this.checkChargeMove(player, history, special)) continue;
      } else {
        // Check motion inputs
        if (!this.checkMotionInputs(history, special, currentFrame)) continue;
      }
      
      // Special move detected!
      if (special.requiresMeter) {
        this.superMeters[player] = 0; // Consume meter
      }
      
      return special.move;
    }
    
    return null;
  }

  checkMotionInputs(history, special, currentFrame) {
    const pattern = special.pattern;
    const window = special.window;
    
    // Find pattern in history within time window
    let patternIndex = 0;
    let startFrame = null;
    
    for (let i = history.length - 2; i >= 0; i--) {
      const entry = history[i];
      
      // Check if within time window
      if (startFrame && currentFrame - entry.frame > window) {
        break;
      }
      
      // Check if input matches pattern
      if (entry.input === pattern[patternIndex]) {
        if (patternIndex === 0) startFrame = entry.frame;
        patternIndex++;
        
        if (patternIndex >= pattern.length) {
          return true; // Pattern complete!
        }
      }
    }
    
    return false;
  }

  checkChargeMove(player, history, special) {
    let chargeStartFrame = null;
    const currentFrame = this.scene.game.loop.frame;
    
    // Look for charge start
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      
      if (entry.input === special.pattern[0]) {
        chargeStartFrame = entry.frame;
      } else if (chargeStartFrame && entry.input !== special.pattern[0]) {
        // Charge broken
        break;
      }
    }
    
    // Check if charge time met and forward input detected
    if (chargeStartFrame && 
        currentFrame - chargeStartFrame >= special.chargeTime &&
        history[history.length - 2]?.input === special.pattern[1]) {
      return true;
    }
    
    return false;
  }

  // Create hitbox for attack
  createHitbox(attacker, move, facing) {
    const moveData = this.frameData.get(move);
    if (!moveData) return null;
    
    const hitbox = {
      attacker: attacker,
      move: move,
      moveData: moveData,
      x: attacker.x + (facing === 'right' ? moveData.hitbox.x : -moveData.hitbox.x),
      y: attacker.y + moveData.hitbox.y,
      width: moveData.hitbox.width,
      height: moveData.hitbox.height,
      active: true,
      currentFrame: 0,
      facing: facing
    };
    
    // Handle projectiles differently
    if (moveData.projectile) {
      hitbox.velocity = facing === 'right' ? moveData.projectileSpeed : -moveData.projectileSpeed;
      hitbox.lifetime = 120; // 2 seconds at 60fps
    }
    
    return hitbox;
  }

  // Check collision between hitbox and hurtbox
  checkHit(hitbox, defender, defenderHurtbox) {
    // Check if defender is invincible
    if (defender.invincibleFrames > 0) return null;
    
    // Check overlap
    const hit = this.checkBoxOverlap(
      hitbox.x, hitbox.y, hitbox.width, hitbox.height,
      defenderHurtbox.x, defenderHurtbox.y, defenderHurtbox.width, defenderHurtbox.height
    );
    
    if (!hit) return null;
    
    // Check if blocked
    const blocked = this.checkBlocking(defender, hitbox);
    
    return {
      hit: true,
      blocked: blocked,
      damage: this.calculateDamage(hitbox, defender, blocked),
      hitstun: blocked ? hitbox.moveData.blockstun : hitbox.moveData.hitstun,
      pushback: hitbox.moveData.pushback,
      juggle: defender.airborne && !blocked,
      launcher: hitbox.moveData.launcher || false
    };
  }

  checkBoxOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
  }

  checkBlocking(defender, hitbox) {
    // Can't block if in hitstun
    if (this.stunTimers[defender.player] > 0) return false;
    
    // Can't block throws
    if (hitbox.moveData.throw) return false;
    
    // Check if holding back
    if (!defender.blocking) return false;
    
    // Check if blocking in correct direction
    const attackFromRight = hitbox.x > defender.x;
    const blockingCorrectly = (attackFromRight && defender.facing === 'right') || 
                             (!attackFromRight && defender.facing === 'left');
    
    if (!blockingCorrectly) return false;
    
    // Check high/low blocking
    if (hitbox.moveData.low && !defender.crouching) return false;
    if (hitbox.moveData.overhead && defender.crouching) return false;
    
    return true;
  }

  calculateDamage(hitbox, defender, blocked) {
    let damage = hitbox.moveData.damage;
    
    // Reduce damage if blocked
    if (blocked) {
      damage *= 0.1; // Chip damage
    }
    
    // Apply combo scaling
    const comboCount = this.comboCounts[hitbox.attacker.player];
    if (comboCount > 0 && comboCount < this.damageScaling.length) {
      damage *= this.damageScaling[comboCount];
    }
    
    // Apply character defense modifier
    damage *= (1 - (defender.defense || 0));
    
    return Math.floor(damage);
  }

  // Handle successful hit
  applyHit(result, attacker, defender) {
    const player = attacker.player;
    const defenderPlayer = defender.player;
    
    // Apply damage
    defender.health = Math.max(0, defender.health - result.damage);
    
    // Apply hitstun
    this.stunTimers[defenderPlayer] = result.hitstun;
    defender.state = result.blocked ? 'blockstun' : 'hitstun';
    
    // Apply pushback
    const pushDirection = attacker.x < defender.x ? 1 : -1;
    defender.velocity.x = pushDirection * result.pushback * 10;
    
    // Handle juggle state
    if (result.juggle) {
      defender.juggleCount = (defender.juggleCount || 0) + 1;
      defender.velocity.y = -8; // Pop up
    }
    
    // Update combo counter
    if (!result.blocked) {
      this.comboCounts[player]++;
      this.comboTimers[player] = this.comboWindowFrames;
      
      // Build super meter
      this.superMeters[player] = Math.min(this.superMeterMax, 
        this.superMeters[player] + (result.damage * 0.5));
    }
    
    // Defender builds meter from being hit
    this.superMeters[defenderPlayer] = Math.min(this.superMeterMax,
      this.superMeters[defenderPlayer] + (result.damage * 0.3));
  }

  // Update combat system each frame
  update() {
    // Update stun timers
    for (const player of ['p1', 'p2']) {
      if (this.stunTimers[player] > 0) {
        this.stunTimers[player]--;
      }
      
      // Update combo timers
      if (this.comboTimers[player] > 0) {
        this.comboTimers[player]--;
        if (this.comboTimers[player] === 0) {
          this.comboCounts[player] = 0; // Reset combo
        }
      }
    }
  }

  // Check if a move can be canceled into another
  canCancel(currentMove, nextMove, player) {
    const currentData = this.frameData.get(currentMove);
    const nextData = this.frameData.get(nextMove);
    
    if (!currentData || !nextData) return false;
    
    // Check cancel hierarchy
    // Normal -> Special -> Super
    if (nextData.projectile || nextData.invincible) {
      // Special move
      return currentData.specialCancelable;
    } else if (nextData.meterCost) {
      // Super move
      return currentData.superCancelable;
    } else {
      // Normal move
      return currentData.cancelable;
    }
  }

  // Get current frame advantage/disadvantage
  getFrameAdvantage(attacker, defender, move, blocked) {
    const moveData = this.frameData.get(move);
    if (!moveData) return 0;
    
    const attackerRecovery = moveData.recovery;
    const defenderStun = blocked ? moveData.blockstun : moveData.hitstun;
    
    return defenderStun - attackerRecovery;
  }

  // Reset combat state for new round
  reset() {
    this.inputHistoryP1 = [];
    this.inputHistoryP2 = [];
    this.comboCounts = { p1: 0, p2: 0 };
    this.comboTimers = { p1: 0, p2: 0 };
    this.stunTimers = { p1: 0, p2: 0 };
    this.superMeters = { p1: 0, p2: 0 };
  }
}