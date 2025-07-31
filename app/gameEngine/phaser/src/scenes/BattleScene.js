/**
 * Battle Scene - Main fighting game scene
 * Street Fighter 2 style combat with 60fps performance
 */

import Phaser from 'phaser';
import { GameConfig, CharacterArchetypes } from '../config/GameConfig';
import Fighter from '../entities/Fighter';
import BossAI from '../systems/BossAI';
import ComboSystem from '../systems/ComboSystem';
import HitboxSystem from '../systems/HitboxSystem';
import InputBuffer from '../systems/InputBuffer';
import TouchControlsManager from '../ui/TouchControlsManager';
import BattleHUD from '../ui/BattleHUD';
import EffectsManager from '../effects/EffectsManager';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.characterType = data.character || 'brawler';
    this.difficulty = data.difficulty || 'normal';
    this.round = 1;
    this.wins = { player: 0, enemy: 0 };
    this.battleActive = false;
    this.frameCount = 0;
  }

  create() {
    // Set up stage
    this.createStage();

    // Create fighters
    this.createFighters();

    // Initialize combat systems
    this.initializeSystems();

    // Create HUD
    this.createHUD();

    // Set up controls
    this.setupControls();

    // Start round
    this.startRound();

    // Performance monitoring
    this.setupPerformanceMonitoring();
  }

  update(time, delta) {
    if (!this.battleActive) return;

    this.frameCount++;

    // Fixed timestep update (60fps)
    const fixedDelta = 1000 / 60;
    this.accumulator = (this.accumulator || 0) + delta;

    while (this.accumulator >= fixedDelta) {
      this.fixedUpdate(fixedDelta);
      this.accumulator -= fixedDelta;
    }

    // Render update (interpolation)
    this.renderUpdate(this.accumulator / fixedDelta);

    // Update performance monitor
    if (this.frameCount % 60 === 0) {
      this.updatePerformanceStats();
    }
  }

  fixedUpdate(delta) {
    // Update input
    this.inputBuffer.update();
    this.touchControls.update();

    // Update fighters
    this.player.update(delta);
    this.enemy.update(delta);

    // Update AI
    if (this.bossAI) {
      this.bossAI.update(delta);
    }

    // Update combat systems
    this.hitboxSystem.update();
    this.comboSystem.update();

    // Check win conditions
    this.checkBattleStatus();
  }

  renderUpdate(alpha) {
    // Interpolate positions for smooth rendering
    this.player.interpolate(alpha);
    this.enemy.interpolate(alpha);

    // Update visual effects
    this.effectsManager.update();

    // Update HUD
    this.battleHUD.update();
  }

  createStage() {
    const { width, height } = this.scale.gameSize;

    // Parallax background layers
    this.bgLayers = [];
    
    const bgFar = this.add.image(width / 2, height / 2, 'bg-gym-far');
    bgFar.setScrollFactor(0.3);
    this.bgLayers.push(bgFar);

    const bgMid = this.add.image(width / 2, height / 2, 'bg-gym-mid');
    bgMid.setScrollFactor(0.6);
    this.bgLayers.push(bgMid);

    const bgNear = this.add.image(width / 2, height / 2, 'bg-gym-near');
    bgNear.setScrollFactor(0.8);
    this.bgLayers.push(bgNear);

    // Ground
    this.ground = height - 100;
    
    // Stage boundaries
    this.stageBounds = {
      left: 50,
      right: width - 50,
      top: 50,
      bottom: this.ground
    };

    // Camera setup
    this.cameras.main.setBounds(0, 0, width, height);
  }

  createFighters() {
    const { width, height } = this.scale.gameSize;

    // Create player fighter
    this.player = new Fighter(this, width / 3, this.ground, {
      type: this.characterType,
      stats: CharacterArchetypes[this.characterType].stats,
      isPlayer: true,
      facing: 1
    });

    // Create enemy fighter (boss)
    this.enemy = new Fighter(this, (width * 2) / 3, this.ground, {
      type: 'boss-sedentary',
      stats: this.getBossStats(),
      isPlayer: false,
      facing: -1
    });

    // Set up fighter references
    this.player.opponent = this.enemy;
    this.enemy.opponent = this.player;

    // Apply evolution level visual effects
    this.applyEvolutionEffects();
  }

  getBossStats() {
    // Scale boss stats based on difficulty
    const baseStats = {
      health: 1000,
      attack: 100,
      defense: 100,
      speed: 100,
      special: 100
    };

    const difficultyMultipliers = {
      easy: 0.8,
      normal: 1.0,
      hard: 1.3,
      expert: 1.6
    };

    const multiplier = difficultyMultipliers[this.difficulty];
    
    return Object.entries(baseStats).reduce((stats, [key, value]) => {
      stats[key] = Math.round(value * multiplier);
      return stats;
    }, {});
  }

  initializeSystems() {
    // Hitbox/Hurtbox system
    this.hitboxSystem = new HitboxSystem(this);
    this.hitboxSystem.registerFighter(this.player);
    this.hitboxSystem.registerFighter(this.enemy);

    // Combo system
    this.comboSystem = new ComboSystem(this);

    // Input buffer for special moves
    this.inputBuffer = new InputBuffer(this);

    // Boss AI
    this.bossAI = new BossAI(this, this.enemy, this.player, this.difficulty);

    // Effects manager
    this.effectsManager = new EffectsManager(this);
  }

  createHUD() {
    this.battleHUD = new BattleHUD(this);
    this.battleHUD.create();
  }

  setupControls() {
    // Touch controls
    this.touchControls = new TouchControlsManager(this);
    this.touchControls.create();

    // Keyboard controls (for testing)
    this.setupKeyboardControls();

    // Connect input to player
    this.touchControls.on('input', (input) => {
      this.handlePlayerInput(input);
    });
  }

  setupKeyboardControls() {
    const keys = this.input.keyboard.addKeys({
      left: 'LEFT',
      right: 'RIGHT',
      up: 'UP',
      down: 'DOWN',
      lightPunch: 'Q',
      heavyPunch: 'W',
      lightKick: 'A',
      heavyKick: 'S',
      block: 'SHIFT'
    });

    // Movement
    keys.left.on('down', () => this.handlePlayerInput({ type: 'move', direction: 'left' }));
    keys.right.on('down', () => this.handlePlayerInput({ type: 'move', direction: 'right' }));
    keys.up.on('down', () => this.handlePlayerInput({ type: 'jump' }));
    keys.down.on('down', () => this.handlePlayerInput({ type: 'crouch' }));

    // Attacks
    keys.lightPunch.on('down', () => this.handlePlayerInput({ type: 'attack', strength: 'light', limb: 'punch' }));
    keys.heavyPunch.on('down', () => this.handlePlayerInput({ type: 'attack', strength: 'heavy', limb: 'punch' }));
    keys.lightKick.on('down', () => this.handlePlayerInput({ type: 'attack', strength: 'light', limb: 'kick' }));
    keys.heavyKick.on('down', () => this.handlePlayerInput({ type: 'attack', strength: 'heavy', limb: 'kick' }));

    // Block
    keys.block.on('down', () => this.handlePlayerInput({ type: 'block', active: true }));
    keys.block.on('up', () => this.handlePlayerInput({ type: 'block', active: false }));
  }

  handlePlayerInput(input) {
    if (!this.battleActive) return;

    // Add to input buffer for special move detection
    this.inputBuffer.addInput(input);

    // Check for special moves
    const specialMove = this.inputBuffer.checkSpecialMoves(this.player);
    if (specialMove) {
      this.player.performSpecialMove(specialMove);
      return;
    }

    // Handle regular input
    switch (input.type) {
      case 'move':
        this.player.move(input.direction);
        break;
      case 'jump':
        this.player.jump();
        break;
      case 'crouch':
        this.player.crouch(input.active);
        break;
      case 'attack':
        this.player.attack(input.strength, input.limb);
        break;
      case 'block':
        this.player.block(input.active);
        break;
    }
  }

  startRound() {
    // Reset positions
    const { width } = this.scale.gameSize;
    this.player.reset(width / 3, this.ground);
    this.enemy.reset((width * 2) / 3, this.ground);

    // Round start sequence
    this.battleActive = false;
    
    // Display round number
    const roundText = this.add.text(this.scale.width / 2, this.scale.height / 2, `ROUND ${this.round}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    roundText.setOrigin(0.5);

    // Play announcer
    this.game.soundManager.playSound('voice-ready');

    this.time.delayedCall(1500, () => {
      roundText.setText('FIGHT!');
      this.game.soundManager.playSound('voice-fight');
      
      this.time.delayedCall(500, () => {
        roundText.destroy();
        this.battleActive = true;
        this.game.soundManager.playMusic('music-battle');
      });
    });
  }

  checkBattleStatus() {
    // Check for KO
    if (this.player.health <= 0 || this.enemy.health <= 0) {
      this.endRound();
    }

    // Check time limit (99 seconds per round)
    if (this.battleHUD.timeRemaining <= 0) {
      this.endRoundByTimeout();
    }
  }

  endRound() {
    this.battleActive = false;
    
    const winner = this.player.health > 0 ? 'player' : 'enemy';
    this.wins[winner]++;

    // KO sequence
    const loser = winner === 'player' ? this.enemy : this.player;
    loser.playKO();
    
    this.game.soundManager.playSound('voice-ko');
    this.effectsManager.createKOEffect(this.scale.width / 2, this.scale.height / 2);

    // Check for match end (best of 3)
    if (this.wins.player >= 2 || this.wins.enemy >= 2) {
      this.time.delayedCall(2000, () => this.endMatch());
    } else {
      this.round++;
      this.time.delayedCall(2000, () => this.startRound());
    }
  }

  endRoundByTimeout() {
    this.battleActive = false;
    
    // Determine winner by health
    const winner = this.player.health > this.enemy.health ? 'player' : 'enemy';
    this.wins[winner]++;

    this.time.delayedCall(1000, () => {
      if (this.wins.player >= 2 || this.wins.enemy >= 2) {
        this.endMatch();
      } else {
        this.round++;
        this.startRound();
      }
    });
  }

  endMatch() {
    const victory = this.wins.player >= 2;
    
    // Play appropriate music
    this.game.soundManager.stopMusic();
    this.game.soundManager.playMusic(victory ? 'music-victory' : 'music-defeat');

    // Show results
    this.scene.start('GameOverScene', {
      victory: victory,
      character: this.characterType,
      stats: {
        damage: this.player.damageDealt,
        combos: this.comboSystem.maxCombo,
        perfect: this.player.health === this.player.maxHealth
      }
    });
  }

  applyEvolutionEffects() {
    // Get player's evolution level (from saved data)
    const evolutionLevel = this.game.playerData?.evolutionLevel || 1;
    const evolutionStage = GameConfig.evolution.stages.find(s => s.level <= evolutionLevel) || GameConfig.evolution.stages[0];
    
    // Apply stat multipliers
    this.player.applyEvolution(evolutionStage);
    
    // Visual effects
    if (evolutionStage.level > 1) {
      this.effectsManager.createEvolutionAura(this.player, evolutionStage);
    }
  }

  setupPerformanceMonitoring() {
    this.performanceStats = {
      fps: 60,
      drawCalls: 0,
      activeParticles: 0,
      updateTime: 0,
      renderTime: 0
    };
  }

  updatePerformanceStats() {
    const perfMonitor = this.game.performanceMonitor;
    if (perfMonitor) {
      this.performanceStats.fps = perfMonitor.fps;
      
      // Send performance data to React Native
      if (window.bridgeManager) {
        window.bridgeManager.sendPerformanceMetrics(this.performanceStats);
      }
    }
  }
}