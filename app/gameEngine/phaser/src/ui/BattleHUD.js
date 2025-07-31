/**
 * Battle HUD - Street Fighter 2 style UI overlay
 * Health bars, super meters, timer, and round indicators
 */

import Phaser from 'phaser';

export default class BattleHUD {
  constructor(scene) {
    this.scene = scene;
    this.hudContainer = null;
    
    // Timer
    this.timeRemaining = 99;
    this.timerStarted = false;
    
    // Health bar animation
    this.healthAnimationQueue = {
      player: [],
      enemy: []
    };
  }

  create() {
    const { width, height } = this.scene.scale.gameSize;
    
    // Create HUD container
    this.hudContainer = this.scene.add.container(0, 0);
    this.hudContainer.setDepth(500);
    
    // Create health bars
    this.createHealthBars(width);
    
    // Create super meters
    this.createSuperMeters(width);
    
    // Create timer
    this.createTimer(width);
    
    // Create round indicators
    this.createRoundIndicators(width);
    
    // Create player names
    this.createPlayerNames(width);
    
    // Start timer
    this.startTimer();
  }

  createHealthBars(screenWidth) {
    const barWidth = 300;
    const barHeight = 30;
    const y = 50;
    
    // Player health bar
    this.playerHealthBar = this.createHealthBar(
      50, y, barWidth, barHeight, true
    );
    
    // Enemy health bar
    this.enemyHealthBar = this.createHealthBar(
      screenWidth - 50 - barWidth, y, barWidth, barHeight, false
    );
  }

  createHealthBar(x, y, width, height, isPlayer) {
    const container = this.scene.add.container(x, y);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x330000);
    bg.setOrigin(0, 0.5);
    bg.setStrokeStyle(3, 0x000000);
    container.add(bg);
    
    // Damage preview (red bar that depletes slowly)
    const damageBar = this.scene.add.rectangle(2, 0, width - 4, height - 4, 0xFF0000);
    damageBar.setOrigin(0, 0.5);
    container.add(damageBar);
    
    // Current health (yellow bar)
    const healthBar = this.scene.add.rectangle(2, 0, width - 4, height - 4, 0xFFFF00);
    healthBar.setOrigin(0, 0.5);
    container.add(healthBar);
    
    // Border decoration
    const borderTop = this.scene.add.rectangle(0, -height/2, width, 2, 0xFFFFFF);
    borderTop.setOrigin(0, 0);
    const borderBottom = this.scene.add.rectangle(0, height/2 - 2, width, 2, 0x666666);
    borderBottom.setOrigin(0, 0);
    container.add(borderTop);
    container.add(borderBottom);
    
    // Add to HUD
    this.hudContainer.add(container);
    
    return {
      container,
      bg,
      healthBar,
      damageBar,
      maxWidth: width - 4,
      currentHealth: 1,
      displayHealth: 1
    };
  }

  createSuperMeters(screenWidth) {
    const meterWidth = 200;
    const meterHeight = 15;
    const y = 85;
    
    // Player super meter
    this.playerSuperMeter = this.createSuperMeter(50, y, meterWidth, meterHeight);
    
    // Enemy super meter
    this.enemySuperMeter = this.createSuperMeter(
      screenWidth - 50 - meterWidth, y, meterWidth, meterHeight
    );
  }

  createSuperMeter(x, y, width, height) {
    const container = this.scene.add.container(x, y);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000033);
    bg.setOrigin(0, 0.5);
    bg.setStrokeStyle(2, 0x0000FF);
    container.add(bg);
    
    // Fill segments (4 segments = 1 super stock)
    const segments = [];
    const segmentWidth = width / 4;
    
    for (let i = 0; i < 4; i++) {
      const segment = this.scene.add.rectangle(
        2 + i * segmentWidth, 0, 
        segmentWidth - 2, height - 4, 
        0x0080FF
      );
      segment.setOrigin(0, 0.5);
      segment.setVisible(false);
      container.add(segment);
      segments.push(segment);
    }
    
    // Glow effect for full meter
    const glow = this.scene.add.rectangle(0, 0, width, height, 0x00FFFF, 0.3);
    glow.setOrigin(0, 0.5);
    glow.setVisible(false);
    container.add(glow);
    
    // Add to HUD
    this.hudContainer.add(container);
    
    return {
      container,
      segments,
      glow,
      currentMeter: 0
    };
  }

  createTimer(screenWidth) {
    const x = screenWidth / 2;
    const y = 60;
    
    // Timer background
    const timerBg = this.scene.add.rectangle(x, y, 80, 40, 0x000000, 0.7);
    timerBg.setStrokeStyle(2, 0xFFFFFF);
    this.hudContainer.add(timerBg);
    
    // Timer text
    this.timerText = this.scene.add.text(x, y, '99', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#FFFF00'
    });
    this.timerText.setOrigin(0.5);
    this.hudContainer.add(this.timerText);
  }

  createRoundIndicators(screenWidth) {
    const y = 30;
    
    // Player rounds
    this.playerRounds = [];
    for (let i = 0; i < 2; i++) {
      const indicator = this.scene.add.circle(100 + i * 25, y, 8, 0x333333);
      indicator.setStrokeStyle(2, 0xFFFFFF);
      this.hudContainer.add(indicator);
      this.playerRounds.push(indicator);
    }
    
    // Enemy rounds
    this.enemyRounds = [];
    for (let i = 0; i < 2; i++) {
      const indicator = this.scene.add.circle(screenWidth - 100 - i * 25, y, 8, 0x333333);
      indicator.setStrokeStyle(2, 0xFFFFFF);
      this.hudContainer.add(indicator);
      this.enemyRounds.push(indicator);
    }
  }

  createPlayerNames(screenWidth) {
    // Player name
    const playerName = this.scene.add.text(50, 20, 'PLAYER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#FFFFFF'
    });
    this.hudContainer.add(playerName);
    
    // Enemy name
    const enemyName = this.scene.add.text(screenWidth - 50, 20, 'BOSS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#FFFFFF'
    });
    enemyName.setOrigin(1, 0);
    this.hudContainer.add(enemyName);
  }

  startTimer() {
    if (this.timerStarted) return;
    
    this.timerStarted = true;
    this.timeRemaining = 99;
    
    // Update timer every second
    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  updateTimer() {
    if (this.scene.battleActive && this.timeRemaining > 0) {
      this.timeRemaining--;
      this.timerText.setText(this.timeRemaining.toString().padStart(2, '0'));
      
      // Flash timer when low
      if (this.timeRemaining <= 10) {
        this.timerText.setColor(this.timeRemaining % 2 === 0 ? '#FF0000' : '#FFFF00');
        
        // Play warning sound
        if (this.timeRemaining === 10) {
          this.scene.game.soundManager.playSound('timer-warning');
        }
      }
    }
  }

  update() {
    // Update health displays
    this.updateHealthBar(this.playerHealthBar, this.scene.player);
    this.updateHealthBar(this.enemyHealthBar, this.scene.enemy);
    
    // Update super meters
    this.updateSuperMeter(this.playerSuperMeter, this.scene.player);
    this.updateSuperMeter(this.enemySuperMeter, this.scene.enemy);
    
    // Process health animations
    this.processHealthAnimations();
  }

  updateHealthBar(healthBar, fighter) {
    const healthPercent = fighter.health / fighter.maxHealth;
    
    // Queue damage animation if health changed
    if (healthPercent < healthBar.currentHealth) {
      this.healthAnimationQueue[fighter.isPlayer ? 'player' : 'enemy'].push({
        from: healthBar.currentHealth,
        to: healthPercent,
        startTime: Date.now()
      });
      healthBar.currentHealth = healthPercent;
    }
    
    // Update health bar width
    healthBar.healthBar.width = healthBar.maxWidth * healthPercent;
  }

  processHealthAnimations() {
    ['player', 'enemy'].forEach(side => {
      const queue = this.healthAnimationQueue[side];
      const healthBar = side === 'player' ? this.playerHealthBar : this.enemyHealthBar;
      
      if (queue.length > 0) {
        const animation = queue[0];
        const elapsed = Date.now() - animation.startTime;
        const duration = 500; // ms
        
        if (elapsed < duration) {
          // Animate damage bar
          const progress = elapsed / duration;
          const current = Phaser.Math.Linear(animation.from, animation.to, progress);
          healthBar.damageBar.width = healthBar.maxWidth * current;
        } else {
          // Animation complete
          healthBar.damageBar.width = healthBar.maxWidth * animation.to;
          queue.shift();
        }
      }
    });
  }

  updateSuperMeter(superMeter, fighter) {
    const meterPercent = fighter.superMeter / fighter.maxSuperMeter;
    const filledSegments = Math.floor(meterPercent * 4);
    
    // Update segment visibility
    superMeter.segments.forEach((segment, index) => {
      segment.setVisible(index < filledSegments);
    });
    
    // Partial fill for current segment
    if (filledSegments < 4) {
      const partialPercent = (meterPercent * 4) % 1;
      if (partialPercent > 0 && filledSegments < 4) {
        const segment = superMeter.segments[filledSegments];
        segment.setVisible(true);
        segment.scaleX = partialPercent;
      }
    }
    
    // Glow effect when full
    const isFull = meterPercent >= 1;
    superMeter.glow.setVisible(isFull);
    
    if (isFull) {
      // Pulsing glow
      superMeter.glow.setAlpha(0.3 + Math.sin(Date.now() * 0.005) * 0.2);
    }
  }

  updateRoundIndicators(wins) {
    // Update player rounds
    for (let i = 0; i < wins.player; i++) {
      this.playerRounds[i].setFillStyle(0xFFD700);
    }
    
    // Update enemy rounds
    for (let i = 0; i < wins.enemy; i++) {
      this.enemyRounds[i].setFillStyle(0xFFD700);
    }
  }

  showDamageNumber(x, y, damage, isPlayer) {
    const color = isPlayer ? '#FF0000' : '#00FF00';
    
    const damageText = this.scene.add.text(x, y, damage.toString(), {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    });
    damageText.setOrigin(0.5);
    damageText.setDepth(600);
    
    // Animate
    this.scene.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  showComboCounter(combo) {
    // Handled by ComboSystem
  }

  destroy() {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    
    if (this.hudContainer) {
      this.hudContainer.destroy();
    }
  }
}