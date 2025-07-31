/**
 * Boss AI System
 * 6 unique AI patterns with different difficulty levels and fighting styles
 */

export class BossAI {
  constructor(scene, combatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    
    // AI state
    this.currentBoss = null;
    this.aiState = 'neutral';
    this.stateTimer = 0;
    this.lastAction = null;
    this.actionCooldown = 0;
    
    // Decision making
    this.reactionTime = 10; // frames before AI reacts
    this.decisionBuffer = [];
    
    // Pattern tracking
    this.playerPatterns = new Map(); // Track player habits
    this.adaptationLevel = 0;
    
    // Initialize boss patterns
    this.bossPatterns = this.initializeBossPatterns();
  }

  initializeBossPatterns() {
    return {
      // Boss 1: Glass Joe (Beginner)
      glass_joe: {
        name: "Glass Joe",
        difficulty: 1,
        health: 80,
        defense: 0.8,
        reactionTime: 20, // Slow reactions
        aggressiveness: 0.2,
        patterns: {
          neutral: {
            actions: [
              { move: 'walk_back', weight: 40 },
              { move: 'walk_forward', weight: 20 },
              { move: 'LP', weight: 20 },
              { move: 'block', weight: 20 }
            ]
          },
          offensive: {
            actions: [
              { move: 'LP', weight: 40 },
              { move: 'MP', weight: 20 },
              { move: 'LK', weight: 20 },
              { move: 'walk_forward', weight: 20 }
            ]
          },
          defensive: {
            actions: [
              { move: 'block', weight: 60 },
              { move: 'walk_back', weight: 30 },
              { move: 'LP', weight: 10 }
            ]
          }
        },
        combos: [
          ['LP', 'LP'],
          ['LP', 'MP']
        ],
        specialTriggers: {
          lowHealth: 0.3, // Panic at 30% health
          panicMoves: ['block', 'walk_back']
        }
      },

      // Boss 2: Bald Bull (Aggressive Rusher)
      bald_bull: {
        name: "Bald Bull",
        difficulty: 2,
        health: 100,
        defense: 0.9,
        reactionTime: 15,
        aggressiveness: 0.7,
        patterns: {
          neutral: {
            actions: [
              { move: 'walk_forward', weight: 50 },
              { move: 'dash_forward', weight: 20 },
              { move: 'MP', weight: 20 },
              { move: 'block', weight: 10 }
            ]
          },
          offensive: {
            actions: [
              { move: 'HP', weight: 30 },
              { move: 'MP', weight: 30 },
              { move: 'bull_charge', weight: 20 }, // Special move
              { move: 'throw', weight: 20 }
            ]
          },
          defensive: {
            actions: [
              { move: 'HP', weight: 40 }, // Counter with heavy
              { move: 'bull_charge', weight: 30 },
              { move: 'block', weight: 30 }
            ]
          }
        },
        combos: [
          ['MP', 'MP', 'HP'],
          ['LP', 'MP', 'bull_charge'],
          ['throw']
        ],
        specialMoves: {
          bull_charge: {
            startup: 30,
            pattern: ['CHARGE_BACK', 'FORWARD', 'HP'],
            damage: 60,
            condition: (distance) => distance > 200
          }
        }
      },

      // Boss 3: Piston Honda (Balanced Fighter)
      piston_honda: {
        name: "Piston Honda",
        difficulty: 3,
        health: 100,
        defense: 1.0,
        reactionTime: 12,
        aggressiveness: 0.5,
        patterns: {
          neutral: {
            actions: [
              { move: 'walk_forward', weight: 30 },
              { move: 'walk_back', weight: 20 },
              { move: 'MP', weight: 25 },
              { move: 'MK', weight: 25 }
            ]
          },
          offensive: {
            actions: [
              { move: 'rush_punch', weight: 30 }, // Special combo
              { move: 'MP', weight: 25 },
              { move: 'HP', weight: 25 },
              { move: 'HK', weight: 20 }
            ]
          },
          defensive: {
            actions: [
              { move: 'block', weight: 40 },
              { move: 'counter_punch', weight: 30 },
              { move: 'backdash', weight: 30 }
            ]
          },
          punish: {
            actions: [
              { move: 'HP', weight: 50 },
              { move: 'rush_punch', weight: 50 }
            ]
          }
        },
        combos: [
          ['MP', 'MP', 'HP'],
          ['LK', 'MK', 'HK'],
          ['MP', 'HADOUKEN']
        ],
        specialMoves: {
          rush_punch: {
            pattern: ['MP', 'MP', 'MP', 'MP'], // Rapid punches
            damage: 40,
            hits: 4
          }
        },
        adaptiveBehavior: true // Learns from player patterns
      },

      // Boss 4: Great Tiger (Tricky Zoner)
      great_tiger: {
        name: "Great Tiger",
        difficulty: 4,
        health: 90,
        defense: 0.9,
        reactionTime: 10,
        aggressiveness: 0.4,
        patterns: {
          neutral: {
            actions: [
              { move: 'walk_back', weight: 30 },
              { move: 'tiger_shot', weight: 30 }, // Projectile
              { move: 'MP', weight: 20 },
              { move: 'teleport', weight: 20 }
            ]
          },
          offensive: {
            actions: [
              { move: 'teleport_attack', weight: 40 },
              { move: 'tiger_uppercut', weight: 30 },
              { move: 'MP', weight: 30 }
            ]
          },
          defensive: {
            actions: [
              { move: 'teleport_away', weight: 50 },
              { move: 'block', weight: 30 },
              { move: 'tiger_shot', weight: 20 }
            ]
          },
          zoning: {
            actions: [
              { move: 'tiger_shot', weight: 60 },
              { move: 'walk_back', weight: 30 },
              { move: 'jump_back', weight: 10 }
            ]
          }
        },
        combos: [
          ['teleport', 'HP'],
          ['tiger_shot', 'tiger_shot'],
          ['MP', 'tiger_uppercut']
        ],
        specialMoves: {
          tiger_shot: {
            pattern: ['QCF', 'P'],
            projectile: true,
            damage: 25
          },
          tiger_uppercut: {
            pattern: ['DP', 'P'],
            damage: 50,
            invincible: true
          },
          teleport: {
            startup: 20,
            recovery: 10,
            invincible: true
          }
        },
        teleportLogic: {
          behind: 0.6, // 60% chance to teleport behind
          away: 0.4
        }
      },

      // Boss 5: Super Macho Man (Power & Pressure)
      super_macho_man: {
        name: "Super Macho Man",
        difficulty: 5,
        health: 120,
        defense: 1.1,
        reactionTime: 8,
        aggressiveness: 0.6,
        patterns: {
          neutral: {
            actions: [
              { move: 'walk_forward', weight: 40 },
              { move: 'HP', weight: 30 },
              { move: 'super_spin', weight: 20 },
              { move: 'taunt', weight: 10 }
            ]
          },
          offensive: {
            actions: [
              { move: 'super_spin', weight: 35 },
              { move: 'clothesline', weight: 35 },
              { move: 'HP', weight: 30 }
            ]
          },
          defensive: {
            actions: [
              { move: 'armored_punch', weight: 40 }, // Has armor
              { move: 'block', weight: 30 },
              { move: 'super_spin', weight: 30 }
            ]
          },
          rage: {
            // Activated at low health
            actions: [
              { move: 'rage_rush', weight: 50 },
              { move: 'super_spin', weight: 30 },
              { move: 'clothesline', weight: 20 }
            ]
          }
        },
        combos: [
          ['HP', 'HP', 'super_spin'],
          ['MP', 'HP', 'clothesline'],
          ['taunt', 'rage_rush']
        ],
        specialMoves: {
          super_spin: {
            pattern: ['HCF', 'P'],
            damage: 45,
            hits: 3,
            armor: true // Can't be interrupted
          },
          clothesline: {
            pattern: ['CHARGE_BACK', 'FORWARD', 'HP'],
            damage: 55,
            wallBounce: true
          },
          rage_rush: {
            trigger: 'lowHealth',
            damage: 80,
            hits: 5,
            superArmor: true
          }
        },
        armorFrames: {
          HP: [5, 15], // Armor on frames 5-15
          super_spin: [1, 20]
        }
      },

      // Boss 6: Mike Bison (Final Boss)
      mike_bison: {
        name: "Mike Bison",
        difficulty: 6,
        health: 150,
        defense: 1.2,
        reactionTime: 5, // Near instant reactions
        aggressiveness: 0.8,
        patterns: {
          neutral: {
            actions: [
              { move: 'psycho_crusher', weight: 30 },
              { move: 'scissor_kick', weight: 30 },
              { move: 'HP', weight: 20 },
              { move: 'walk_forward', weight: 20 }
            ]
          },
          offensive: {
            actions: [
              { move: 'psycho_crusher', weight: 30 },
              { move: 'scissor_kick', weight: 25 },
              { move: 'knee_press', weight: 25 },
              { move: 'throw', weight: 20 }
            ]
          },
          defensive: {
            actions: [
              { move: 'psycho_reflect', weight: 40 }, // Counters projectiles
              { move: 'teleport_dash', weight: 30 },
              { move: 'block', weight: 30 }
            ]
          },
          desperation: {
            // Ultra aggressive at low health
            actions: [
              { move: 'final_psycho_crusher', weight: 50 },
              { move: 'psycho_punisher', weight: 30 },
              { move: 'rage_combo', weight: 20 }
            ]
          }
        },
        combos: [
          ['MP', 'HP', 'scissor_kick'],
          ['psycho_crusher', 'HP', 'knee_press'],
          ['throw', 'psycho_crusher'],
          ['MP', 'MP', 'HP', 'psycho_punisher'] // Super combo
        ],
        specialMoves: {
          psycho_crusher: {
            pattern: ['CHARGE_BACK', 'FORWARD', 'P'],
            damage: 50,
            projectileInvincible: true,
            chipDamage: 10
          },
          scissor_kick: {
            pattern: ['CHARGE_BACK', 'FORWARD', 'K'],
            damage: 40,
            overhead: true
          },
          psycho_punisher: {
            pattern: ['QCF', 'QCF', 'P'], // Super move
            damage: 100,
            hits: 7,
            meterCost: 100,
            invincibleStartup: true
          },
          final_psycho_crusher: {
            trigger: 'desperation',
            damage: 120,
            fullScreenTracking: true,
            unblockable: false // But very hard to block
          }
        },
        readInputs: true, // Can read and counter player inputs
        perfectBlocking: 0.7, // 70% chance to perfect block
        counterHitSetups: true // Sets up counter hit situations
      }
    };
  }

  // Initialize AI for specific boss
  setBoss(bossId, difficulty = 'normal') {
    this.currentBoss = this.bossPatterns[bossId];
    if (!this.currentBoss) {
      console.error(`Unknown boss: ${bossId}`);
      return;
    }
    
    // Adjust difficulty
    this.adjustDifficulty(difficulty);
    
    // Reset AI state
    this.reset();
  }

  adjustDifficulty(difficulty) {
    const modifiers = {
      easy: { reaction: 1.5, aggression: 0.7, defense: 0.8 },
      normal: { reaction: 1.0, aggression: 1.0, defense: 1.0 },
      hard: { reaction: 0.7, aggression: 1.3, defense: 1.2 },
      nightmare: { reaction: 0.5, aggression: 1.5, defense: 1.5 }
    };
    
    const mod = modifiers[difficulty] || modifiers.normal;
    
    this.currentBoss.reactionTime = Math.floor(this.currentBoss.reactionTime * mod.reaction);
    this.currentBoss.aggressiveness *= mod.aggression;
    this.currentBoss.defense *= mod.defense;
  }

  // Main AI update
  update(bossCharacter, playerCharacter, gameState) {
    if (!this.currentBoss || this.actionCooldown > 0) {
      this.actionCooldown--;
      return null;
    }
    
    // Calculate situation
    const situation = this.analyzeSituation(bossCharacter, playerCharacter, gameState);
    
    // Determine AI state
    this.updateAIState(situation);
    
    // Make decision based on state
    const decision = this.makeDecision(situation);
    
    // Execute decision after reaction time
    if (decision) {
      this.decisionBuffer.push({
        action: decision,
        executeFrame: gameState.currentFrame + this.currentBoss.reactionTime
      });
    }
    
    // Execute buffered decisions
    return this.executeBufferedDecisions(gameState.currentFrame);
  }

  analyzeSituation(boss, player, gameState) {
    const distance = Math.abs(boss.x - player.x);
    const heightDiff = boss.y - player.y;
    
    return {
      distance: distance,
      heightDiff: heightDiff,
      playerAirborne: player.velocity.y !== 0,
      bossAirborne: boss.velocity.y !== 0,
      playerStunned: this.combatSystem.stunTimers.p1 > 0,
      bossStunned: this.combatSystem.stunTimers.p2 > 0,
      playerBlocking: player.blocking,
      playerAttacking: player.state === 'attacking',
      bossHealth: boss.health,
      playerHealth: player.health,
      bossHealthPercent: boss.health / this.currentBoss.health,
      playerHealthPercent: player.health / 100,
      bossMetar: this.combatSystem.superMeters.p2,
      playerMeter: this.combatSystem.superMeters.p1,
      range: this.getRange(distance),
      playerLastMove: this.getPlayerLastMove(),
      comboOpportunity: this.checkComboOpportunity(boss, player)
    };
  }

  getRange(distance) {
    if (distance < 80) return 'throw';
    if (distance < 150) return 'close';
    if (distance < 300) return 'mid';
    if (distance < 500) return 'far';
    return 'fullscreen';
  }

  updateAIState(situation) {
    const boss = this.currentBoss;
    
    // Check for special state triggers
    if (boss.specialTriggers && situation.bossHealthPercent <= boss.specialTriggers.lowHealth) {
      this.aiState = 'desperation';
      return;
    }
    
    // Punish opportunities
    if (situation.playerStunned || situation.comboOpportunity) {
      this.aiState = 'punish';
      return;
    }
    
    // Defensive situations
    if (situation.playerAttacking || situation.bossHealthPercent < 0.3) {
      if (Math.random() < 0.5) {
        this.aiState = 'defensive';
        return;
      }
    }
    
    // Zoning for certain bosses
    if (boss.patterns.zoning && situation.range === 'far') {
      this.aiState = 'zoning';
      return;
    }
    
    // Offensive based on aggressiveness
    if (Math.random() < boss.aggressiveness) {
      this.aiState = 'offensive';
    } else {
      this.aiState = 'neutral';
    }
  }

  makeDecision(situation) {
    const patterns = this.currentBoss.patterns[this.aiState];
    if (!patterns) return null;
    
    // Special case decisions
    if (this.aiState === 'punish' && situation.comboOpportunity) {
      return this.selectCombo(situation);
    }
    
    // Weighted random selection
    const actions = patterns.actions;
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        return this.processAction(action.move, situation);
      }
    }
    
    return null;
  }

  selectCombo(situation) {
    const combos = this.currentBoss.combos;
    if (!combos || combos.length === 0) return 'HP';
    
    // Select appropriate combo based on situation
    let validCombos = combos;
    
    // Filter by range
    if (situation.range === 'far') {
      validCombos = combos.filter(combo => 
        combo.some(move => this.isProjectile(move))
      );
    }
    
    // Pick random valid combo
    if (validCombos.length > 0) {
      const combo = validCombos[Math.floor(Math.random() * validCombos.length)];
      return combo[0]; // Return first move
    }
    
    return 'MP'; // Default
  }

  processAction(action, situation) {
    // Handle special moves
    if (this.currentBoss.specialMoves && this.currentBoss.specialMoves[action]) {
      const special = this.currentBoss.specialMoves[action];
      
      // Check conditions
      if (special.condition && !special.condition(situation.distance)) {
        return null;
      }
      
      // Check meter requirement
      if (special.meterCost && this.combatSystem.superMeters.p2 < special.meterCost) {
        return null;
      }
      
      return action;
    }
    
    // Handle movement
    switch (action) {
      case 'walk_forward':
        return situation.distance > 150 ? 'MOVE_RIGHT' : null;
      case 'walk_back':
        return situation.distance < 200 ? 'MOVE_LEFT' : null;
      case 'jump':
        return 'JUMP';
      case 'block':
        return 'BLOCK';
      default:
        return action;
    }
  }

  executeBufferedDecisions(currentFrame) {
    if (this.decisionBuffer.length === 0) return null;
    
    const decision = this.decisionBuffer[0];
    if (currentFrame >= decision.executeFrame) {
      this.decisionBuffer.shift();
      this.lastAction = decision.action;
      this.actionCooldown = 10; // Prevent spam
      return decision.action;
    }
    
    return null;
  }

  checkComboOpportunity(boss, player) {
    // Check if player is in a punishable state
    if (this.combatSystem.stunTimers.p1 > 5) return true;
    if (player.state === 'recovery') return true;
    if (player.whiffedAttack) return true;
    
    return false;
  }

  getPlayerLastMove() {
    const history = this.combatSystem.inputHistoryP1;
    if (history.length > 0) {
      return history[history.length - 1].input;
    }
    return null;
  }

  isProjectile(move) {
    const moveData = this.combatSystem.frameData.get(move);
    return moveData && moveData.projectile;
  }

  // Track player patterns for adaptive AI
  trackPlayerPattern(action) {
    if (!this.currentBoss.adaptiveBehavior) return;
    
    const pattern = this.playerPatterns.get(action) || { count: 0, situations: [] };
    pattern.count++;
    
    // Track situation when action was used
    pattern.situations.push({
      aiState: this.aiState,
      timestamp: performance.now()
    });
    
    this.playerPatterns.set(action, pattern);
    
    // Increase adaptation level
    this.adaptationLevel = Math.min(1.0, this.adaptationLevel + 0.01);
  }

  // Predict player action based on patterns
  predictPlayerAction() {
    if (this.adaptationLevel < 0.3) return null;
    
    let mostLikely = null;
    let highestCount = 0;
    
    for (const [action, pattern] of this.playerPatterns) {
      // Weight recent actions more heavily
      const recentCount = pattern.situations.filter(s => 
        performance.now() - s.timestamp < 30000 // Last 30 seconds
      ).length;
      
      if (recentCount > highestCount) {
        highestCount = recentCount;
        mostLikely = action;
      }
    }
    
    return mostLikely;
  }

  reset() {
    this.aiState = 'neutral';
    this.stateTimer = 0;
    this.lastAction = null;
    this.actionCooldown = 0;
    this.decisionBuffer = [];
    this.playerPatterns.clear();
    this.adaptationLevel = 0;
  }
}