/**
 * Boss AI System - Street Fighter 2 style AI with pattern recognition
 * Adaptive difficulty based on player performance
 */

import { GameConfig } from '../config/GameConfig';

export default class BossAI {
  constructor(scene, boss, player, difficulty = 'normal') {
    this.scene = scene;
    this.boss = boss;
    this.player = player;
    this.difficulty = difficulty;
    
    // AI parameters from config
    this.config = GameConfig.bossAI.difficulty[difficulty];
    this.pattern = GameConfig.bossAI.patterns.balanced;
    
    // State management
    this.currentState = 'neutral';
    this.stateTimer = 0;
    this.decisionCooldown = 0;
    
    // Pattern recognition
    this.playerPatterns = {
      attackFrequency: 0,
      blockFrequency: 0,
      jumpFrequency: 0,
      specialUsage: 0,
      preferredRange: 'mid',
      recentMoves: []
    };
    
    // Decision weights
    this.decisionWeights = { ...this.pattern };
    
    // Combo execution
    this.currentCombo = null;
    this.comboStep = 0;
    
    // Performance tracking
    this.reactionBuffer = [];
    this.adaptationLevel = 0;
  }

  update(delta) {
    // Update timers
    this.stateTimer -= delta;
    this.decisionCooldown -= delta;
    
    // Analyze player behavior
    this.analyzePlayer();
    
    // Make decisions based on state
    if (this.decisionCooldown <= 0) {
      this.makeDecision();
      this.decisionCooldown = this.config.reactionTime;
    }
    
    // Execute current action
    this.executeAction(delta);
    
    // Adapt difficulty dynamically
    this.adaptDifficulty();
  }

  analyzePlayer() {
    // Track player distance
    const distance = Math.abs(this.boss.x - this.player.x);
    
    // Categorize range
    if (distance < 80) {
      this.currentRange = 'close';
    } else if (distance < 150) {
      this.currentRange = 'mid';
    } else {
      this.currentRange = 'far';
    }
    
    // Track player state
    this.playerState = this.player.currentState;
    
    // Update pattern recognition
    if (this.player.currentMove) {
      this.playerPatterns.recentMoves.push(this.player.currentMove);
      if (this.playerPatterns.recentMoves.length > 10) {
        this.playerPatterns.recentMoves.shift();
      }
    }
    
    // Detect player habits
    this.detectPlayerHabits();
  }

  detectPlayerHabits() {
    const recentMoves = this.playerPatterns.recentMoves;
    
    // Count move types
    const moveCounts = {
      attacks: 0,
      blocks: 0,
      jumps: 0,
      specials: 0
    };
    
    recentMoves.forEach(move => {
      if (move.includes('Punch') || move.includes('Kick')) moveCounts.attacks++;
      else if (move === 'block') moveCounts.blocks++;
      else if (move === 'jump') moveCounts.jumps++;
      else if (move === 'special') moveCounts.specials++;
    });
    
    // Update frequencies
    const total = recentMoves.length || 1;
    this.playerPatterns.attackFrequency = moveCounts.attacks / total;
    this.playerPatterns.blockFrequency = moveCounts.blocks / total;
    this.playerPatterns.jumpFrequency = moveCounts.jumps / total;
    this.playerPatterns.specialUsage = moveCounts.specials / total;
  }

  makeDecision() {
    // Check for combo continuation
    if (this.currentCombo && this.comboStep < this.currentCombo.length) {
      return; // Continue combo
    }
    
    // Reaction to player state
    if (this.shouldReact()) {
      this.reactToPlayer();
      return;
    }
    
    // Make strategic decision based on weights
    const decision = this.weightedDecision();
    this.executeDecision(decision);
  }

  shouldReact() {
    // Immediate reactions to certain player actions
    if (this.playerState === 'attacking' && this.currentRange === 'close') {
      return Math.random() > this.config.mistakeChance;
    }
    
    if (this.playerState === 'jumping' && this.currentRange === 'mid') {
      return Math.random() > this.config.mistakeChance * 2;
    }
    
    return false;
  }

  reactToPlayer() {
    // Counter player actions
    switch (this.playerState) {
      case 'attacking':
        if (this.currentRange === 'close') {
          // Block or counter
          if (Math.random() < 0.7) {
            this.boss.block(true);
            this.currentState = 'blocking';
            this.stateTimer = 300;
          } else {
            // Dragon punch style counter
            this.performAntiAir();
          }
        }
        break;
        
      case 'jumping':
        // Anti-air
        this.performAntiAir();
        break;
        
      case 'blocking':
        // Throw or pressure
        if (this.currentRange === 'close') {
          this.performThrow();
        } else {
          this.applyPressure();
        }
        break;
    }
  }

  weightedDecision() {
    // Adjust weights based on situation
    const situationalWeights = this.getSituationalWeights();
    
    // Random selection based on weights
    const total = Object.values(situationalWeights).reduce((a, b) => a + b);
    let random = Math.random() * total;
    
    for (const [action, weight] of Object.entries(situationalWeights)) {
      random -= weight;
      if (random <= 0) {
        return action;
      }
    }
    
    return 'movement'; // Default
  }

  getSituationalWeights() {
    const weights = { ...this.decisionWeights };
    
    // Adjust based on range
    switch (this.currentRange) {
      case 'close':
        weights.attackWeight *= 1.5;
        weights.defendWeight *= 1.2;
        break;
      case 'far':
        weights.movementWeight *= 2;
        weights.attackWeight *= 0.5;
        break;
    }
    
    // Adjust based on health
    const healthPercent = this.boss.health / this.boss.maxHealth;
    if (healthPercent < 0.3) {
      // Desperate mode
      weights.attackWeight *= 1.5;
      weights.defendWeight *= 0.5;
    }
    
    // Adjust based on player patterns
    if (this.playerPatterns.attackFrequency > 0.6) {
      weights.defendWeight *= 1.5;
    }
    if (this.playerPatterns.blockFrequency > 0.4) {
      weights.movementWeight *= 1.3;
    }
    
    return weights;
  }

  executeDecision(decision) {
    switch (decision) {
      case 'attackWeight':
        this.performAttack();
        break;
      case 'defendWeight':
        this.performDefense();
        break;
      case 'movementWeight':
        this.performMovement();
        break;
    }
  }

  performAttack() {
    // Choose attack based on range and situation
    if (this.currentRange === 'close') {
      // Close range attacks
      const attacks = ['lightPunch', 'lightKick', 'throw'];
      const attack = this.selectAttack(attacks);
      
      if (attack === 'throw') {
        this.performThrow();
      } else {
        // Start a combo
        this.startCombo();
      }
    } else if (this.currentRange === 'mid') {
      // Mid range pokes
      const attacks = ['mediumPunch', 'mediumKick', 'special'];
      const attack = this.selectAttack(attacks);
      
      if (attack === 'special') {
        this.performSpecial();
      } else {
        this.boss.attack(attack.includes('Punch') ? 'medium' : 'medium', 
                       attack.includes('Punch') ? 'punch' : 'kick');
      }
    } else {
      // Move closer or use projectile
      this.performMovement();
    }
  }

  selectAttack(attacks) {
    // Add some randomness to prevent predictability
    const randomIndex = Math.floor(Math.random() * attacks.length);
    return attacks[randomIndex];
  }

  startCombo() {
    // Select combo based on difficulty
    const comboLength = Math.min(this.config.comboLength, 5);
    
    // Basic combo patterns
    const combos = [
      ['light', 'punch', 'medium', 'punch', 'heavy', 'punch'],
      ['light', 'kick', 'medium', 'kick', 'special'],
      ['medium', 'punch', 'medium', 'kick', 'heavy', 'kick'],
      ['light', 'punch', 'light', 'kick', 'medium', 'punch', 'special']
    ];
    
    // Select random combo
    const combo = combos[Math.floor(Math.random() * combos.length)];
    this.currentCombo = combo.slice(0, comboLength * 2); // Each move is 2 elements
    this.comboStep = 0;
    
    // Execute first move
    this.executeComboStep();
  }

  executeComboStep() {
    if (this.comboStep < this.currentCombo.length) {
      const strength = this.currentCombo[this.comboStep];
      const limb = this.currentCombo[this.comboStep + 1];
      
      if (limb === 'special') {
        this.performSpecial();
      } else {
        this.boss.attack(strength, limb);
      }
      
      this.comboStep += 2;
      
      // Schedule next combo step
      this.stateTimer = 200; // Combo timing
    } else {
      // Combo complete
      this.currentCombo = null;
      this.comboStep = 0;
    }
  }

  performDefense() {
    // Block incoming attacks
    this.boss.block(true);
    this.currentState = 'blocking';
    this.stateTimer = 500;
    
    // Plan counter-attack
    this.planCounterAttack();
  }

  planCounterAttack() {
    // After blocking, plan a counter
    setTimeout(() => {
      if (this.currentState === 'blocking') {
        this.boss.block(false);
        
        // Quick counter attack
        if (this.currentRange === 'close') {
          this.boss.attack('light', 'punch');
        }
      }
    }, this.config.reactionTime);
  }

  performMovement() {
    const targetDistance = 120; // Optimal fighting distance
    const currentDistance = Math.abs(this.boss.x - this.player.x);
    
    if (currentDistance > targetDistance + 20) {
      // Move closer
      if (this.boss.x < this.player.x) {
        this.boss.move('right');
      } else {
        this.boss.move('left');
      }
      this.stateTimer = 300;
    } else if (currentDistance < targetDistance - 20) {
      // Back away
      if (this.boss.x < this.player.x) {
        this.boss.move('left');
      } else {
        this.boss.move('right');
      }
      this.stateTimer = 200;
    } else {
      // Sidestep for positioning
      const direction = Math.random() < 0.5 ? 'left' : 'right';
      this.boss.move(direction);
      this.stateTimer = 150;
    }
  }

  performSpecial() {
    // Check if can perform special
    if (this.boss.superMeter >= 25) {
      this.boss.performSpecialMove('hadouken'); // Example special
      this.currentState = 'special';
      this.stateTimer = 500;
    } else {
      // Fallback to normal attack
      this.performAttack();
    }
  }

  performThrow() {
    // Close range throw attempt
    if (this.currentRange === 'close' && this.player.blocking) {
      // Throw animation would go here
      console.log('Boss performs throw!');
      this.currentState = 'throwing';
      this.stateTimer = 400;
    }
  }

  performAntiAir() {
    // Uppercut style anti-air
    this.boss.attack('heavy', 'punch');
    this.currentState = 'antiair';
    this.stateTimer = 400;
  }

  applyPressure() {
    // Continuous attacks to break guard
    this.startCombo();
    this.currentState = 'pressure';
  }

  executeAction(delta) {
    // Continue current action
    if (this.currentCombo && this.stateTimer <= 0) {
      this.executeComboStep();
    }
    
    // Release block when timer expires
    if (this.currentState === 'blocking' && this.stateTimer <= 0) {
      this.boss.block(false);
      this.currentState = 'neutral';
    }
  }

  adaptDifficulty() {
    // Dynamic difficulty adjustment based on player performance
    const playerHealthPercent = this.player.health / this.player.maxHealth;
    const bossHealthPercent = this.boss.health / this.boss.maxHealth;
    
    // If player is struggling
    if (playerHealthPercent < 0.3 && bossHealthPercent > 0.7) {
      this.adaptationLevel = Math.max(-1, this.adaptationLevel - 0.01);
    }
    // If player is dominating
    else if (playerHealthPercent > 0.7 && bossHealthPercent < 0.3) {
      this.adaptationLevel = Math.min(1, this.adaptationLevel + 0.01);
    }
    
    // Apply adaptation
    this.applyAdaptation();
  }

  applyAdaptation() {
    // Adjust reaction time
    const baseReaction = GameConfig.bossAI.difficulty[this.difficulty].reactionTime;
    this.config.reactionTime = baseReaction * (1 - this.adaptationLevel * 0.3);
    
    // Adjust mistake chance
    const baseMistake = GameConfig.bossAI.difficulty[this.difficulty].mistakeChance;
    this.config.mistakeChance = baseMistake * (1 + this.adaptationLevel * 0.5);
    
    // Adjust combo length
    const baseCombo = GameConfig.bossAI.difficulty[this.difficulty].comboLength;
    this.config.comboLength = Math.round(baseCombo * (1 + this.adaptationLevel * 0.3));
  }
}