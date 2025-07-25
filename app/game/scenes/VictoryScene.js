/**
 * Victory Scene
 * Post-battle victory screen with stats and achievements
 */

import { GAME_CONFIG } from '../config/GameConfig';
import AchievementPopup from '../ui/AchievementPopup';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }
  
  init(data) {
    this.score = data.score || 0;
    this.boss = data.boss || {};
    this.battleData = data.battleData || {};
    this.newAchievements = data.newAchievements || [];
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0, 0);
    
    // Victory title
    const victoryText = this.add.text(width / 2, 60, 'VICTORY!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#F7D51D',
      stroke: '#0D0D0D',
      strokeThickness: 6,
    }).setOrigin(0.5).setScale(0);
    
    // Animate title
    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 500,
      ease: 'Back.out',
      onComplete: () => {
        this.tweens.add({
          targets: victoryText,
          scale: 1,
          duration: 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut'
        });
      }
    });
    
    // Boss defeated text
    const bossText = this.add.text(width / 2, 120, `${this.boss.name} DEFEATED!`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#92CC41',
      stroke: '#0D0D0D',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
    
    // Stats container
    const statsContainer = this.createStatsDisplay();
    
    // Achievements
    if (this.newAchievements.length > 0) {
      this.createAchievementDisplay();
      this.achievementPopup = new AchievementPopup(this);
      
      // Show achievements one by one
      this.time.delayedCall(1000, () => {
        this.newAchievements.forEach((achievement, index) => {
          this.time.delayedCall(index * 500, () => {
            this.achievementPopup.showAchievement(achievement);
          });
        });
      });
    }
    
    // Continue button
    const continueButton = this.add.text(width / 2, height - 60, 'CONTINUE', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#0D0D0D',
      backgroundColor: '#92CC41',
      padding: { x: 30, y: 10 },
      stroke: '#0D0D0D',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive().setAlpha(0);
    
    continueButton.on('pointerdown', () => {
      this.returnToMenu();
    });
    
    continueButton.on('pointerover', () => {
      continueButton.setScale(1.1);
      this.tweens.add({
        targets: continueButton,
        scale: 1.05,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
    });
    
    continueButton.on('pointerout', () => {
      this.tweens.killTweensOf(continueButton);
      continueButton.setScale(1);
    });
    
    // Animate elements in sequence
    this.tweens.timeline({
      tweens: [
        {
          targets: bossText,
          alpha: 1,
          duration: 500,
          delay: 500,
        },
        {
          targets: statsContainer,
          alpha: 1,
          y: statsContainer.y - 20,
          duration: 600,
          ease: 'Power2.out',
        },
        {
          targets: continueButton,
          alpha: 1,
          duration: 500,
        }
      ]
    });
    
    // Background particles
    this.createBackgroundParticles();
  }
  
  createStatsDisplay() {
    const { width, height } = this.cameras.main;
    const container = this.add.container(width / 2, height / 2);
    container.setAlpha(0);
    
    // Background panel
    const bg = this.add.rectangle(0, 0, 400, 250, 0x222222, 0.9)
      .setStrokeStyle(3, 0x92CC41);
    container.add(bg);
    
    // Title
    const title = this.add.text(0, -100, 'BATTLE STATISTICS', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#92CC41',
      stroke: '#0D0D0D',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(title);
    
    // Stats
    const stats = [
      { label: 'Score:', value: this.score.toLocaleString() },
      { label: 'Time:', value: `${this.battleData.duration || 0}s` },
      { label: 'Max Combo:', value: `${this.battleData.maxCombo || 0}x` },
      { label: 'Damage Dealt:', value: this.battleData.damageDealt || 0 },
      { label: 'Damage Taken:', value: this.battleData.damageTaken || 0 },
      { label: 'Special Moves:', value: this.battleData.specialMovesUsed || 0 },
    ];
    
    stats.forEach((stat, index) => {
      const y = -60 + (index * 30);
      
      const label = this.add.text(-150, y, stat.label, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
      }).setOrigin(0, 0.5);
      
      const value = this.add.text(150, y, stat.value, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#F7D51D',
      }).setOrigin(1, 0.5);
      
      container.add([label, value]);
    });
    
    // Grade calculation
    const grade = this.calculateGrade();
    const gradeText = this.add.text(0, 90, grade, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: this.getGradeColor(grade),
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add(gradeText);
    
    return container;
  }
  
  createAchievementDisplay() {
    const { width, height } = this.cameras.main;
    
    const achievementTitle = this.add.text(width / 2, height - 140, 
      `${this.newAchievements.length} NEW ACHIEVEMENT${this.newAchievements.length > 1 ? 'S' : ''}!`, 
      {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#F7D51D',
        stroke: '#0D0D0D',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);
    
    // Pulsing animation
    this.tweens.add({
      targets: achievementTitle,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }
  
  calculateGrade() {
    const { duration, damageTaken, maxCombo } = this.battleData;
    let gradeScore = 100;
    
    // Time penalty (lose points for longer battles)
    if (duration > 60) gradeScore -= Math.min(20, (duration - 60) / 3);
    
    // Damage penalty
    if (damageTaken > 0) gradeScore -= Math.min(30, damageTaken / 5);
    
    // Combo bonus
    if (maxCombo >= 10) gradeScore += 10;
    if (maxCombo >= 20) gradeScore += 10;
    
    // Determine grade
    if (gradeScore >= 95) return 'S';
    if (gradeScore >= 85) return 'A';
    if (gradeScore >= 75) return 'B';
    if (gradeScore >= 65) return 'C';
    return 'D';
  }
  
  getGradeColor(grade) {
    const colors = {
      'S': '#F7D51D',
      'A': '#92CC41',
      'B': '#3498db',
      'C': '#FFFFFF',
      'D': '#E53935',
    };
    return colors[grade] || '#FFFFFF';
  }
  
  createBackgroundParticles() {
    const { width, height } = this.cameras.main;
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        0x92CC41,
        0.3
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: { from: 0.3, to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, width);
          particle.y = height + 50;
        }
      });
    }
  }
  
  returnToMenu() {
    // Play sound
    if (this.sound.get('menu_confirm')) {
      this.sound.play('menu_confirm');
    }
    
    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Return to battle menu or main game
      if (window.sendToReactNative) {
        window.sendToReactNative('returnToMain', { 
          fromVictory: true,
          score: this.score,
          achievements: this.newAchievements 
        });
      } else {
        this.scene.start('BattleMenuScene');
      }
    });
  }
}