/**
 * Battle HUD System
 * Displays health bars, special meter, and combat info with smooth animations
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class BattleHUD {
  constructor(scene) {
    this.scene = scene;
    this.healthBars = {};
    this.lastHealthValues = {};
    this.createHUD();
  }

  createHUD() {
    const { width } = this.scene.cameras.main;
    const padding = 20;
    
    // Player health bar
    this.createHealthBar(
      padding, 
      padding, 
      'HERO', 
      'player'
    );
    
    // Boss health bar
    this.createHealthBar(
      width - GAME_CONFIG.ui.healthBarWidth - padding,
      padding,
      this.scene.registry.get('currentBoss').name || 'BOSS',
      'boss'
    );
    
    // Combo counter
    this.comboText = this.scene.add.text(width / 2, 80, '', {
      font: '24px monospace',
      fill: '#F7D51D',
      stroke: '#0D0D0D',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
    
    // Special meter indicator
    this.specialText = this.scene.add.text(width / 2, height - 80, '', {
      font: '16px monospace',
      fill: '#F7D51D',
      stroke: '#0D0D0D',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
  }

  createHealthBar(x, y, name, type) {
    const width = GAME_CONFIG.ui.healthBarWidth;
    const height = GAME_CONFIG.ui.healthBarHeight;
    
    // Name label with animation
    const nameLabel = this.scene.add.text(x, y - 5, name, {
      font: '14px monospace',
      fill: '#92CC41',
    }).setAlpha(0);
    
    // Fade in name
    this.scene.tweens.add({
      targets: nameLabel,
      alpha: 1,
      duration: 500,
      delay: 100
    });
    
    // Health bar background
    const bg = this.scene.add.rectangle(x, y + 20, width, height, 0x222222)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x0D0D0D);
    
    // Damage preview bar (shows previous health)
    const damageBar = this.scene.add.rectangle(x, y + 20, width, height - 4, 0xFF0000)
      .setOrigin(0, 0.5)
      .setAlpha(0.6);
    
    // Health bar fill
    const fill = this.scene.add.rectangle(x, y + 20, width, height - 4, 
      type === 'player' ? 0x92CC41 : 0xFF6666)
      .setOrigin(0, 0.5);
    
    // Health text
    const text = this.scene.add.text(x + width / 2, y + 20, '100/100', {
      font: '12px monospace',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    // Store references
    const barData = { bg, fill, damageBar, text, nameLabel, maxWidth: width };
    
    if (type === 'player') {
      this.playerHealthBar = barData;
      this.lastHealthValues.player = 1;
    } else {
      this.bossHealthBar = barData;
      this.lastHealthValues.boss = 1;
    }
    
    // Initial animation
    fill.setScale(0, 1);
    damageBar.setScale(0, 1);
    this.scene.tweens.add({
      targets: [fill, damageBar],
      scaleX: 1,
      duration: 800,
      ease: 'Power2.out',
      delay: 200
    });
  }

  updatePlayerHealth(current, max) {
    if (!this.playerHealthBar) return;
    
    const percentage = Math.max(0, current / max);
    const bar = this.playerHealthBar;
    
    // Update text
    bar.text.setText(`${Math.ceil(current)}/${max}`);
    
    // Animate damage preview
    if (percentage < this.lastHealthValues.player) {
      this.animateDamage(bar, this.lastHealthValues.player, percentage);
      
      // Flash effect
      this.flashBar(bar.fill);
      
      // Shake name on damage
      this.shakeElement(bar.nameLabel);
    }
    
    // Smooth health bar animation
    this.scene.tweens.add({
      targets: bar.fill,
      displayWidth: bar.maxWidth * percentage,
      duration: 300,
      ease: 'Power2.out'
    });
    
    // Update color based on health
    this.updateHealthColor(bar.fill, percentage);
    
    // Low health effects
    if (percentage < 0.3 && percentage > 0) {
      this.pulseElement(bar.fill);
      this.flashLowHealth(bar.nameLabel);
    }
    
    this.lastHealthValues.player = percentage;
  }

  updateBossHealth(current, max) {
    if (!this.bossHealthBar) return;
    
    const percentage = Math.max(0, current / max);
    const bar = this.bossHealthBar;
    
    // Update text
    bar.text.setText(`${Math.ceil(current)}/${max}`);
    
    // Animate damage preview
    if (percentage < this.lastHealthValues.boss) {
      this.animateDamage(bar, this.lastHealthValues.boss, percentage);
      
      // Screen shake on boss damage
      this.scene.cameras.main.shake(50, 0.003);
    }
    
    // Smooth health bar animation
    this.scene.tweens.add({
      targets: bar.fill,
      displayWidth: bar.maxWidth * percentage,
      duration: 300,
      ease: 'Power2.out'
    });
    
    // Phase 2 indicator
    if (percentage <= 0.5 && percentage > 0 && !this.bossPhase2Shown) {
      this.bossPhase2Shown = true;
      this.showPhase2Indicator();
    }
    
    this.lastHealthValues.boss = percentage;
  }

  animateDamage(bar, oldPercentage, newPercentage) {
    // Show damage bar at previous health
    bar.damageBar.displayWidth = bar.maxWidth * oldPercentage;
    
    // Animate damage bar shrinking
    this.scene.tweens.add({
      targets: bar.damageBar,
      displayWidth: bar.maxWidth * newPercentage,
      duration: 800,
      delay: 200,
      ease: 'Power2.out'
    });
  }

  updateHealthColor(bar, percentage) {
    if (percentage < 0.25) {
      bar.setFillStyle(0xE53935); // Red
    } else if (percentage < 0.5) {
      bar.setFillStyle(0xF7D51D); // Yellow
    }
  }

  updateSpecialMeter(current, max) {
    const percentage = current / max;
    
    // Update special meter in touch controls
    if (this.scene.controls) {
      this.scene.controls.updateSpecialMeter(current, max);
    }
    
    // Show special ready text when full
    if (percentage >= 1 && !this.specialMeterFull) {
      this.specialMeterFull = true;
      this.showSpecialReady();
    } else if (percentage < 1) {
      this.specialMeterFull = false;
    }
  }

  updateCombo(count) {
    if (count > 1) {
      this.comboText.setText(`COMBO x${count}!`);
      this.comboText.setAlpha(1);
      
      // Animate combo counter
      this.scene.tweens.add({
        targets: this.comboText,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Back.out'
      });
      
      // Color based on combo level
      if (count >= 10) {
        this.comboText.setColor('#F7D51D');
        this.comboText.setFontSize('28px');
      } else if (count >= 5) {
        this.comboText.setColor('#3498db');
        this.comboText.setFontSize('26px');
      } else {
        this.comboText.setColor('#92CC41');
        this.comboText.setFontSize('24px');
      }
    } else {
      // Fade out combo
      this.scene.tweens.add({
        targets: this.comboText,
        alpha: 0,
        scale: 0.8,
        duration: 500,
        ease: 'Power2.in'
      });
    }
  }
  
  flashBar(bar) {
    this.scene.tweens.add({
      targets: bar,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
  
  shakeElement(element) {
    const originalX = element.x;
    this.scene.tweens.add({
      targets: element,
      x: { from: originalX - 5, to: originalX + 5 },
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        element.x = originalX;
      }
    });
  }
  
  pulseElement(element) {
    if (element.pulseAnim) return; // Avoid multiple pulses
    
    element.pulseAnim = this.scene.tweens.add({
      targets: element,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }
  
  flashLowHealth(label) {
    this.scene.tweens.add({
      targets: label,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  showSpecialReady() {
    this.specialText.setText('SPECIAL READY!');
    this.specialText.setScale(0);
    
    this.scene.tweens.add({
      targets: this.specialText,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.specialText,
          alpha: 0,
          y: this.specialText.y - 20,
          duration: 1000,
          delay: 1000
        });
      }
    });
  }
  
  showPhase2Indicator() {
    const { width } = this.scene.cameras.main;
    const phase2Text = this.scene.add.text(
      width - 70,
      60,
      'PHASE 2',
      {
        font: 'bold 16px monospace',
        fill: '#E53935',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(1, 0.5).setAlpha(0);
    
    // Flash animation
    this.scene.tweens.add({
      targets: phase2Text,
      alpha: { from: 0, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: 5,
      onComplete: () => phase2Text.destroy()
    });
    
    // Boss name flash
    if (this.bossHealthBar) {
      this.bossHealthBar.nameLabel.setColor('#E53935');
      this.flashBar(this.bossHealthBar.nameLabel);
    }
  }
}