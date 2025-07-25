/**
 * Battle Scene
 * Main fighting game scene with touch controls
 */

import { GAME_CONFIG, calculateDamage, getHitboxForAction } from '../config/GameConfig';
import Player from '../sprites/Player';
import Boss from '../sprites/Boss';
import BattleHUD from '../systems/BattleHUD';
import TouchControls from '../systems/TouchControls';
import ComboSystem from '../systems/ComboSystem';
import EffectsManager from '../systems/EffectsManager';
import SoundManager from '../systems/SoundManager';
import AudioManager from '../systems/AudioManager';
import EnvironmentalHazards from '../systems/EnvironmentalHazards';
import AudioSettings from '../ui/AudioSettings';
import TipsSystem from '../systems/TipsSystem';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    
    this.player = null;
    this.boss = null;
    this.hud = null;
    this.controls = null;
    this.comboSystem = null;
    this.effects = null;
    this.soundManager = null;
    this.audioManager = null;
    this.environmentalHazards = null;
    this.tipsSystem = null;
    
    this.battleState = 'ready'; // ready, fighting, paused, victory, defeat
    this.battleTimer = 0;
    
    // Battle tracking
    this.battleStats = {
      damageDealt: 0,
      damageTaken: 0,
      specialMovesUsed: 0,
      startTime: 0,
    };
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Get data from registry
    this.playerStats = this.registry.get('playerStats') || {};
    this.bossData = this.registry.get('currentBoss') || GAME_CONFIG.bosses.sloth_demon;
    
    // Create background and get stage type
    this.stageType = this.createBackground();
    
    // Create ground/platform
    this.createPlatforms();
    
    // Create characters
    this.createCharacters();
    
    // Create HUD
    this.hud = new BattleHUD(this);
    
    // Create audio settings UI
    this.audioSettings = new AudioSettings(this);
    
    // Create touch controls
    this.controls = new TouchControls(this);
    this.controls.on('action', this.handlePlayerAction, this);
    
    // Create systems
    this.comboSystem = new ComboSystem(this);
    this.effects = new EffectsManager(this);
    this.soundManager = new SoundManager(this);
    this.audioManager = new AudioManager(this);
    
    // Create tips system
    this.tipsSystem = new TipsSystem(this);
    
    // Create environmental hazards based on stage
    this.environmentalHazards = new EnvironmentalHazards(this, this.stageType);
    
    // Set up collisions
    this.setupCollisions();
    
    // Start battle intro
    this.startBattleIntro();
    
    // Handle app pause/resume
    this.game.events.on('pause', this.pauseGame, this);
    this.game.events.on('resume', this.resumeGame, this);
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Set background based on boss type
    const backgrounds = {
      sloth_demon: 'warehouse_bg',
      junk_food_monster: 'dojo_bg',
      procrastination_phantom: 'main_bg',
      stress_titan: 'warehouse_bg',
    };
    
    const bgKey = backgrounds[this.bossData.id] || 'main_bg';
    
    if (this.textures.exists(bgKey)) {
      const background = this.add.image(width / 2, height / 2, bgKey);
      
      // Scale background to fill screen while maintaining aspect ratio
      const scaleX = width / background.width;
      const scaleY = height / background.height;
      const scale = Math.max(scaleX, scaleY);
      background.setScale(scale);
    } else {
      // Fallback to solid color
      this.add.rectangle(0, 0, width, height, GAME_CONFIG.colors.screenBg)
        .setOrigin(0, 0);
    }
    
    // Return stage type for hazards
    const stageMap = {
      sloth_demon: 'warehouse',
      junk_food_monster: 'dojo',
      procrastination_phantom: 'main',
      stress_titan: 'warehouse',
    };
    
    return stageMap[this.bossData.id] || 'main';
  }

  createPlatforms() {
    const { width, height } = this.cameras.main;
    
    // Create invisible ground
    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(width / 2, height - 40, width, 80, 0x708028);
    ground.setAlpha(0); // Make ground invisible
    this.platforms.add(ground);
  }

  createCharacters() {
    const { width, height } = this.cameras.main;
    
    // Create player
    this.player = new Player(this, 150, height - 120);
    this.player.setStats(this.playerStats);
    
    // Create boss
    this.boss = new Boss(this, width - 150, height - 120, this.bossData);
    
    // Add to physics
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.boss, this.platforms);
  }

  setupCollisions() {
    // Player attacks hitting boss
    this.physics.add.overlap(
      this.player.hitbox,
      this.boss,
      this.handlePlayerHit,
      null,
      this
    );
    
    // Boss attacks hitting player
    this.physics.add.overlap(
      this.boss.hitbox,
      this.player,
      this.handleBossHit,
      null,
      this
    );
  }

  startBattleIntro() {
    const { width, height } = this.cameras.main;
    
    // Freeze characters
    this.player.freeze();
    this.boss.freeze();
    
    // Boss intro taunt
    this.showBossIntro();
    
    // VS Screen (delayed)
    this.time.delayedCall(2000, () => {
      const vsText = this.add.text(width / 2, height / 2, 'VS', {
        fontSize: '64px',
        fontFamily: 'monospace',
        color: '#F7D51D',
        stroke: '#0D0D0D',
        strokeThickness: 6,
      }).setOrigin(0.5);
    
    // Player name
    const playerName = this.add.text(width * 0.25, height / 2, 'HERO', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#92CC41',
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
    
    // Boss name
    const bossName = this.add.text(width * 0.75, height / 2, this.bossData.name, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#E53935',
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
    
    // Show "READY?" text
    const readyText = this.add.text(width / 2, height / 2, 'READY?', {
      font: '48px monospace',
      fill: '#F7D51D',
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
    
    // Show "FIGHT!" text
    const fightText = this.add.text(width / 2, height / 2, 'FIGHT!', {
      font: '64px monospace',
      fill: '#E53935',
      stroke: '#0D0D0D',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);
    
    // Animate intro
    this.tweens.timeline({
      tweens: [
        // Show VS screen
        {
          targets: [playerName, bossName],
          alpha: 1,
          duration: 500,
          ease: 'Power2',
        },
        {
          targets: [vsText, playerName, bossName],
          alpha: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => {
            vsText.destroy();
            playerName.destroy();
            bossName.destroy();
          },
        },
        // Show READY?
        {
          targets: readyText,
          alpha: 1,
          scale: { from: 0.5, to: 1 },
          duration: 500,
          ease: 'Back.out',
        },
        {
          targets: readyText,
          alpha: 0,
          duration: 300,
          delay: 500,
        },
        // Show FIGHT!
        {
          targets: fightText,
          alpha: 1,
          scale: { from: 0.5, to: 1.2 },
          duration: 500,
          ease: 'Back.out',
          onComplete: () => {
            this.battleState = 'fighting';
            this.player.unfreeze();
            this.boss.unfreeze();
            this.boss.startAI();
            
            // Start battle music
            this.audioManager.playMusic('battle', 'normal');
            
            // Start battle timer
            this.battleStats.startTime = this.time.now;
          },
        },
        {
          targets: fightText,
          alpha: 0,
          scale: 1,
          duration: 300,
          delay: 300,
          onComplete: () => {
            readyText.destroy();
            fightText.destroy();
          },
        },
      ],
    });
    });
  }
  
  showBossIntro() {
    const { width, height } = this.cameras.main;
    
    // Boss taunts
    const bossTaunts = {
      sloth_demon: [
        "Ugh... do we really have to fight?",
        "I was having such a nice nap...",
        "This better be worth getting up for."
      ],
      junk_food_monster: [
        "Time for a snack... YOU!",
        "I'll make you part of my food chain!",
        "Hope you're not on a diet!"
      ],
      procrastination_phantom: [
        "Why fight today what we can postpone?",
        "I'll defeat you... eventually.",
        "Let's take a rain check on this battle."
      ],
      stress_titan: [
        "FEEL THE PRESSURE!",
        "Your anxiety feeds me!",
        "Time to CRACK under stress!"
      ]
    };
    
    const taunts = bossTaunts[this.bossData.id] || ["Prepare yourself!"];
    const selectedTaunt = taunts[Math.floor(Math.random() * taunts.length)];
    
    // Camera focus on boss
    this.cameras.main.pan(this.boss.x, this.boss.y - 50, 500, 'Power2');
    this.cameras.main.zoomTo(1.2, 500);
    
    // Boss animation
    this.boss.play(`boss_${this.bossData.id}_victory`, true);
    
    // Speech bubble
    const bubble = this.add.graphics();
    const bubbleX = this.boss.x;
    const bubbleY = this.boss.y - 100;
    const bubbleWidth = 250;
    const bubbleHeight = 60;
    
    // Draw speech bubble
    bubble.fillStyle(0xffffff, 0.9);
    bubble.strokeStyle(0x0D0D0D, 3);
    bubble.fillRoundedRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 10);
    bubble.strokeRoundedRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 10);
    
    // Bubble tail
    bubble.fillTriangle(
      bubbleX - 20, bubbleY + bubbleHeight/2,
      bubbleX + 20, bubbleY + bubbleHeight/2,
      this.boss.x, this.boss.y - 60
    );
    
    // Taunt text
    const tauntText = this.add.text(bubbleX, bubbleY, selectedTaunt, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#0D0D0D',
      align: 'center',
      wordWrap: { width: bubbleWidth - 20 }
    }).setOrigin(0.5);
    
    // Fade in
    bubble.setAlpha(0);
    tauntText.setAlpha(0);
    
    this.tweens.add({
      targets: [bubble, tauntText],
      alpha: 1,
      duration: 300,
      delay: 200
    });
    
    // Remove after delay and reset camera
    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: [bubble, tauntText],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          bubble.destroy();
          tauntText.destroy();
          this.boss.play(`boss_${this.bossData.id}_idle`, true);
        }
      });
      
      // Reset camera
      this.cameras.main.pan(width/2, height/2, 500);
      this.cameras.main.zoomTo(1, 500);
    });
  }

  handlePlayerAction(action) {
    if (this.battleState !== 'fighting') return;
    if (!this.player.canAct()) return;
    
    switch (action) {
      case 'moveLeft':
        this.player.moveLeft();
        break;
      case 'moveRight':
        this.player.moveRight();
        break;
      case 'jump':
        this.player.jump();
        this.audioManager.playSound('jump');
        break;
      case 'punch':
        this.player.attack('light');
        this.audioManager.playCombatSound('punch', 'light');
        break;
      case 'kick':
        this.player.attack('heavy');
        this.audioManager.playCombatSound('kick', 'heavy');
        break;
      case 'block':
        this.player.block();
        this.audioManager.playCombatSound('block');
        break;
      case 'special':
        if (this.player.specialMeter >= GAME_CONFIG.combat.specialMeterMax) {
          this.player.specialAttack();
          this.battleStats.specialMovesUsed++;
          this.effects.playSpecialEffect(this.player.x, this.player.y);
          this.audioManager.playSound('special_charge');
          this.audioManager.duckAudio(1000);
          setTimeout(() => {
            this.audioManager.playCombatSound('special');
          }, 300);
        }
        break;
      case 'stopMove':
        this.player.stopMoving();
        break;
      case 'airDash':
        this.player.airDash();
        break;
    }
  }

  handlePlayerHit(hitbox, boss) {
    if (!boss.canBeHit()) return;
    
    const damage = calculateDamage(
      this.player.currentAttackDamage,
      this.playerStats.strength || 0,
      boss.defense
    );
    
    boss.takeDamage(damage);
    
    // Track damage dealt
    this.battleStats.damageDealt += damage;
    
    // Update combo
    this.comboSystem.addHit();
    const comboMultiplier = this.comboSystem.getMultiplier();
    
    // Add special meter
    this.player.addSpecialMeter(GAME_CONFIG.combat.specialMeterGainPerHit * comboMultiplier);
    
    // Visual effects
    const attackType = this.player.currentAttackDamage >= GAME_CONFIG.combat.heavyAttackDamage ? 'heavy' : 'light';
    this.effects.playHitEffect(boss.x, boss.y - 30, damage, attackType);
    
    // Audio feedback
    this.audioManager.playSound(`impact_${attackType}`, { x: boss.x, y: boss.y });
    
    // Update HUD
    this.hud.updateBossHealth(boss.health, boss.maxHealth);
    this.hud.updateCombo(this.comboSystem.count);
    
    // Check victory
    if (boss.health <= 0) {
      this.handleVictory();
    }
  }

  handleBossHit(hitbox, player) {
    if (!player.canBeHit()) return;
    if (player.isBlocking) {
      // Reduced damage when blocking
      const damage = Math.floor(this.boss.attackPower * 0.2);
      player.takeDamage(damage);
      this.battleStats.damageTaken += damage;
      this.effects.playBlockEffect(player.x, player.y);
      this.audioManager.playCombatSound('block');
    } else {
      player.takeDamage(this.boss.attackPower);
      this.battleStats.damageTaken += this.boss.attackPower;
      this.comboSystem.reset();
      this.effects.playHitEffect(player.x, player.y - 30, this.boss.attackPower);
      this.audioManager.playVoice('hurt', 'player');
    }
    
    // Update HUD
    this.hud.updatePlayerHealth(player.health, player.maxHealth);
    
    // Check defeat
    if (player.health <= 0) {
      this.handleDefeat();
    }
    
    // Change music intensity based on health
    const healthPercent = player.health / player.maxHealth;
    if (healthPercent < 0.3 && this.audioManager.musicIntensity !== 'intense') {
      this.audioManager.changeMusicIntensity('intense');
    }
  }

  async handleVictory() {
    this.battleState = 'victory';
    
    // Freeze characters
    this.player.victory();
    this.boss.defeat();
    
    // Play victory effects
    this.effects.playVictoryEffect();
    this.audioManager.playVictorySequence();
    
    // Stop hazards
    this.environmentalHazards.cleanup();
    
    // Calculate score and prepare battle data
    const score = this.calculateScore();
    const duration = Math.floor((this.time.now - this.battleStats.startTime) / 1000);
    
    const battleData = {
      playerId: this.playerStats.playerId || 'guest',
      bossId: this.bossData.id,
      bossName: this.bossData.name,
      victory: true,
      score: score,
      duration: duration,
      maxCombo: this.comboSystem.maxCombo,
      damageDealt: this.battleStats.damageDealt,
      damageTaken: this.battleStats.damageTaken,
      specialMovesUsed: this.battleStats.specialMovesUsed,
      playerHealthRemaining: this.player.health,
      difficulty: 'normal',
    };
    
    // Save battle data
    await this.saveBattleData(battleData);
    
    // Show victory screen after delay
    this.time.delayedCall(1500, () => {
      this.scene.start('VictoryScene', { 
        score, 
        boss: this.bossData,
        battleData: battleData,
        newAchievements: this.newAchievements || [],
      });
    });
    
    // Send result to React Native
    if (window.sendToReactNative) {
      window.sendToReactNative('battleEnd', { 
        victory: true, 
        score,
        battleData,
      });
    }
  }

  async handleDefeat() {
    this.battleState = 'defeat';
    
    // Freeze characters
    this.player.defeat();
    this.boss.victory();
    
    // Play defeat sequence
    this.audioManager.playDefeatSequence();
    
    // Stop hazards
    this.environmentalHazards.cleanup();
    
    // Prepare battle data
    const duration = Math.floor((this.time.now - this.battleStats.startTime) / 1000);
    const battleData = {
      playerId: this.playerStats.playerId || 'guest',
      bossId: this.bossData.id,
      bossName: this.bossData.name,
      victory: false,
      score: 0,
      duration: duration,
      maxCombo: this.comboSystem.maxCombo,
      damageDealt: this.battleStats.damageDealt,
      damageTaken: this.battleStats.damageTaken,
      specialMovesUsed: this.battleStats.specialMovesUsed,
      playerHealthRemaining: 0,
      difficulty: 'normal',
    };
    
    // Save battle data
    await this.saveBattleData(battleData);
    
    // Show defeat screen after delay
    this.time.delayedCall(1500, () => {
      this.scene.start('DefeatScene', { boss: this.bossData });
    });
    
    // Send result to React Native
    if (window.sendToReactNative) {
      window.sendToReactNative('battleEnd', { 
        victory: false, 
        score: 0,
        battleData,
      });
    }
  }
  
  shutdown() {
    // Clean up on scene shutdown
    if (this.audioManager) {
      this.audioManager.destroy();
    }
    if (this.effects) {
      this.effects.cleanup();
    }
    if (this.environmentalHazards) {
      this.environmentalHazards.cleanup();
    }
  }

  calculateScore() {
    const healthBonus = this.player.health * 10;
    const comboBonus = this.comboSystem.maxCombo * 50;
    const timeBonus = Math.max(0, 10000 - this.battleTimer * 10);
    return Math.floor(healthBonus + comboBonus + timeBonus);
  }

  pauseGame() {
    this.battleState = 'paused';
    this.physics.pause();
    this.tweens.pauseAll();
  }

  resumeGame() {
    if (this.battleState === 'paused') {
      this.battleState = 'fighting';
      this.physics.resume();
      this.tweens.resumeAll();
    }
  }

  update(time, delta) {
    if (this.battleState === 'fighting') {
      this.battleTimer += delta / 1000;
      
      // Update characters
      this.player.update();
      this.boss.update(time, delta);
      
      // Update systems
      this.comboSystem.update(time, delta);
      this.effects.update(time, delta);
      this.environmentalHazards.update(time, delta);
      
      // Update HUD
      this.hud.updateSpecialMeter(this.player.specialMeter, GAME_CONFIG.combat.specialMeterMax);
      
      // Update audio listener position (for 3D sound)
      if (this.player) {
        this.audioManager.updateListenerPosition(this.player.x, this.player.y);
      }
    }
  }
  
  async saveBattleData(battleData) {
    try {
      // Import the service (dynamic import to avoid issues)
      const { default: battleDataService } = await import('../../services/battleDataService');
      
      // Save battle record
      const result = await battleDataService.saveBattleRecord(battleData);
      
      // Check for new achievements
      const achievements = await battleDataService.checkAchievements(battleData);
      if (achievements.length > 0) {
        this.newAchievements = achievements;
        console.log('New achievements unlocked:', achievements);
      }
      
      return result;
    } catch (error) {
      console.error('Error saving battle data:', error);
      // Game continues even if save fails
    }
  }
}