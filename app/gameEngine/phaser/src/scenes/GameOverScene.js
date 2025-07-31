/**
 * Game Over Scene - Battle results and progression
 * Shows rewards, stats, and evolution progress
 */

import Phaser from 'phaser';
import TouchButton from '../ui/TouchButton';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.victory = data.victory || false;
    this.character = data.character || 'brawler';
    this.battleStats = data.stats || {
      damage: 0,
      combos: 0,
      perfect: false
    };
    
    // Calculate rewards
    this.calculateRewards();
  }

  create() {
    const { width, height } = this.scale.gameSize;

    // Background
    this.createBackground();

    // Show result
    this.showResult(width, height);

    // Show stats
    this.showBattleStats(width, height);

    // Show rewards
    this.showRewards(width, height);

    // Show evolution progress
    this.showEvolutionProgress(width, height);

    // Create buttons
    this.createButtons(width, height);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  createBackground() {
    // Dark overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.scale.width,
      this.scale.height,
      0x000000, 0.8
    );
    overlay.setOrigin(0, 0);

    // Particle effects for victory
    if (this.victory) {
      this.createVictoryParticles();
    }
  }

  showResult(width, height) {
    // Victory/Defeat text
    const resultText = this.victory ? 'VICTORY!' : 'DEFEAT';
    const resultColor = this.victory ? '#FFD700' : '#FF0000';
    
    const result = this.add.text(width / 2, 100, resultText, {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 4
    });
    result.setOrigin(0.5);

    // Animate
    this.tweens.add({
      targets: result,
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    if (this.victory) {
      // Pulsing effect for victory
      this.tweens.add({
        targets: result,
        scale: 1.1,
        duration: 1000,
        ease: 'Sine.easeInOut',
        repeat: -1,
        yoyo: true,
        delay: 500
      });
    }
  }

  showBattleStats(width, height) {
    const statsY = 200;
    
    // Stats container
    const statsContainer = this.add.container(width / 2, statsY);

    // Title
    const statsTitle = this.add.text(0, 0, 'BATTLE STATS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#00FF00'
    });
    statsTitle.setOrigin(0.5);
    statsContainer.add(statsTitle);

    // Individual stats
    const stats = [
      { label: 'Damage Dealt', value: this.battleStats.damage },
      { label: 'Max Combo', value: this.battleStats.combos },
      { label: 'Perfect', value: this.battleStats.perfect ? 'YES!' : 'NO' }
    ];

    stats.forEach((stat, index) => {
      const y = 40 + index * 30;
      
      const statText = this.add.text(-100, y, `${stat.label}:`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#FFFFFF'
      });
      statText.setOrigin(1, 0.5);
      statsContainer.add(statText);

      const valueText = this.add.text(100, y, stat.value.toString(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#FFFF00'
      });
      valueText.setOrigin(0, 0.5);
      statsContainer.add(valueText);

      // Animate stat appearance
      this.tweens.add({
        targets: [statText, valueText],
        alpha: { from: 0, to: 1 },
        x: { from: (target) => target.x + (target === statText ? 50 : -50), to: (target) => target.x },
        duration: 300,
        delay: 100 + index * 100,
        ease: 'Power2'
      });
    });
  }

  showRewards(width, height) {
    if (!this.victory) return;

    const rewardsY = 380;
    
    // Rewards container
    const rewardsContainer = this.add.container(width / 2, rewardsY);

    // Title
    const rewardsTitle = this.add.text(0, 0, 'REWARDS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#FFD700'
    });
    rewardsTitle.setOrigin(0.5);
    rewardsContainer.add(rewardsTitle);

    // Show rewards with animations
    const rewards = this.rewards;
    let delay = 300;

    // XP reward
    const xpText = this.add.text(0, 40, `+${rewards.xp} XP`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#00FF00'
    });
    xpText.setOrigin(0.5);
    xpText.setAlpha(0);
    rewardsContainer.add(xpText);

    this.tweens.add({
      targets: xpText,
      alpha: 1,
      y: { from: 60, to: 40 },
      duration: 500,
      delay: delay,
      ease: 'Back.easeOut'
    });

    // Coins reward
    if (rewards.coins > 0) {
      delay += 200;
      const coinsText = this.add.text(0, 70, `+${rewards.coins} COINS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#FFD700'
      });
      coinsText.setOrigin(0.5);
      coinsText.setAlpha(0);
      rewardsContainer.add(coinsText);

      this.tweens.add({
        targets: coinsText,
        alpha: 1,
        y: { from: 90, to: 70 },
        duration: 500,
        delay: delay,
        ease: 'Back.easeOut'
      });
    }

    // Bonus rewards
    if (this.battleStats.perfect) {
      delay += 200;
      const perfectText = this.add.text(0, 100, 'PERFECT BONUS!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#FF00FF'
      });
      perfectText.setOrigin(0.5);
      perfectText.setAlpha(0);
      rewardsContainer.add(perfectText);

      this.tweens.add({
        targets: perfectText,
        alpha: 1,
        scale: { from: 0, to: 1 },
        duration: 500,
        delay: delay,
        ease: 'Back.easeOut'
      });
    }
  }

  showEvolutionProgress(width, height) {
    const evolutionY = height - 200;
    
    // Get current evolution data
    const currentXP = this.game.playerData?.totalXP || 0;
    const newXP = currentXP + (this.rewards?.xp || 0);
    const level = this.calculateLevel(newXP);
    const nextLevelXP = this.getXPForLevel(level + 1);
    const currentLevelXP = this.getXPForLevel(level);
    const progress = (newXP - currentLevelXP) / (nextLevelXP - currentLevelXP);

    // Evolution container
    const evolutionContainer = this.add.container(width / 2, evolutionY);

    // Level text
    const levelText = this.add.text(0, -30, `LEVEL ${level}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    levelText.setOrigin(0.5);
    evolutionContainer.add(levelText);

    // Progress bar background
    const barWidth = 300;
    const barHeight = 20;
    const barBg = this.add.rectangle(0, 0, barWidth, barHeight, 0x333333);
    barBg.setStrokeStyle(2, 0x666666);
    evolutionContainer.add(barBg);

    // Progress bar fill
    const barFill = this.add.rectangle(
      -barWidth / 2 + 2,
      0,
      (barWidth - 4) * progress,
      barHeight - 4,
      0x00FF00
    );
    barFill.setOrigin(0, 0.5);
    evolutionContainer.add(barFill);

    // Animate fill if XP was gained
    if (this.victory && this.rewards.xp > 0) {
      const oldProgress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
      barFill.width = (barWidth - 4) * oldProgress;
      
      this.tweens.add({
        targets: barFill,
        width: (barWidth - 4) * progress,
        duration: 1000,
        delay: 1000,
        ease: 'Power2',
        onUpdate: () => {
          // Check for level up
          if (barFill.width >= barWidth - 4 && level < this.calculateLevel(newXP)) {
            this.showLevelUp();
          }
        }
      });
    }

    // XP text
    const xpText = this.add.text(0, 30, `${newXP} / ${nextLevelXP} XP`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#CCCCCC'
    });
    xpText.setOrigin(0.5);
    evolutionContainer.add(xpText);
  }

  createButtons(width, height) {
    const buttonY = height - 80;

    if (this.victory) {
      // Continue button
      const continueButton = new TouchButton(this, width / 2 - 110, buttonY, 'CONTINUE', {
        width: 200,
        height: 50,
        fontSize: '16px',
        color: 0x00FF00,
        onClick: () => this.continue()
      });

      // Replay button
      const replayButton = new TouchButton(this, width / 2 + 110, buttonY, 'REPLAY', {
        width: 200,
        height: 50,
        fontSize: '16px',
        color: 0xFFFF00,
        onClick: () => this.replay()
      });
    } else {
      // Retry button
      const retryButton = new TouchButton(this, width / 2 - 110, buttonY, 'RETRY', {
        width: 200,
        height: 50,
        fontSize: '16px',
        color: 0xFFFF00,
        onClick: () => this.replay()
      });

      // Menu button
      const menuButton = new TouchButton(this, width / 2 + 110, buttonY, 'MENU', {
        width: 200,
        height: 50,
        fontSize: '16px',
        color: 0xCCCCCC,
        onClick: () => this.returnToMenu()
      });
    }
  }

  calculateRewards() {
    this.rewards = {
      xp: 0,
      coins: 0
    };

    if (this.victory) {
      // Base XP
      this.rewards.xp = 100;
      
      // Damage bonus
      this.rewards.xp += Math.floor(this.battleStats.damage / 10);
      
      // Combo bonus
      this.rewards.xp += this.battleStats.combos * 10;
      
      // Perfect bonus
      if (this.battleStats.perfect) {
        this.rewards.xp *= 2;
        this.rewards.coins = 50;
      }
      
      // Coins based on performance
      this.rewards.coins += Math.floor(this.battleStats.damage / 50);
    }
  }

  calculateLevel(xp) {
    // Simple level calculation
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  getXPForLevel(level) {
    return Math.pow(level - 1, 2) * 100;
  }

  showLevelUp() {
    const { width, height } = this.scale.gameSize;
    
    // Level up effect
    const levelUpText = this.add.text(width / 2, height / 2, 'LEVEL UP!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    });
    levelUpText.setOrigin(0.5);
    levelUpText.setAlpha(0);

    this.tweens.add({
      targets: levelUpText,
      alpha: 1,
      scale: { from: 0, to: 1.5 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: levelUpText,
          alpha: 0,
          scale: 2,
          duration: 500,
          delay: 1000,
          ease: 'Power2',
          onComplete: () => levelUpText.destroy()
        });
      }
    });

    // Play sound
    this.game.soundManager.playSound('level-up');
  }

  createVictoryParticles() {
    // Create particle emitters for victory celebration
    const particles = this.add.particles('particle-star');
    
    const emitter = particles.createEmitter({
      x: { min: 0, max: this.scale.width },
      y: 0,
      lifespan: 3000,
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      quantity: 2,
      frequency: 100,
      tint: [0xFFD700, 0xFFFFFF, 0x00FF00]
    });
  }

  continue() {
    // Save progress
    this.saveProgress();
    
    // Return to home screen
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }

  replay() {
    // Restart battle with same settings
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('BattleScene', {
        character: this.character,
        difficulty: this.game.selectedDifficulty || 'normal'
      });
    });
  }

  returnToMenu() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }

  saveProgress() {
    // Update player data
    if (!this.game.playerData) {
      this.game.playerData = {
        totalXP: 0,
        coins: 0,
        evolutionLevel: 1,
        wins: 0,
        losses: 0
      };
    }

    this.game.playerData.totalXP += this.rewards.xp;
    this.game.playerData.coins += this.rewards.coins;
    this.game.playerData.evolutionLevel = this.calculateLevel(this.game.playerData.totalXP);
    
    if (this.victory) {
      this.game.playerData.wins++;
    } else {
      this.game.playerData.losses++;
    }

    // Send to React Native for persistence
    if (window.bridgeManager) {
      window.bridgeManager.sendMessage({
        type: 'saveProgress',
        data: this.game.playerData
      });
    }
  }
}