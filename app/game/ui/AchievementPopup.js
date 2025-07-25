/**
 * Achievement Popup UI
 * Shows achievement notifications when unlocked
 */

export default class AchievementPopup {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.isShowing = false;
  }
  
  showAchievement(achievement) {
    // Add to queue
    this.queue.push(achievement);
    
    // Process queue if not already showing
    if (!this.isShowing) {
      this.processQueue();
    }
  }
  
  processQueue() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }
    
    this.isShowing = true;
    const achievement = this.queue.shift();
    this.displayAchievement(achievement);
  }
  
  displayAchievement(achievement) {
    const { width, height } = this.scene.cameras.main;
    const popupWidth = 350;
    const popupHeight = 100;
    const x = width / 2;
    const y = 100;
    
    // Create container
    const container = this.scene.add.container(x, y);
    container.setDepth(1001);
    container.setAlpha(0);
    container.setScale(0.8);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, popupWidth, popupHeight, 0x000000, 0.9)
      .setStrokeStyle(3, 0xF7D51D);
    
    // Achievement unlocked text
    const unlockedText = this.scene.add.text(0, -30, 'ACHIEVEMENT UNLOCKED!', {
      font: 'bold 14px monospace',
      fill: '#F7D51D',
      align: 'center'
    }).setOrigin(0.5);
    
    // Icon
    const icon = this.scene.add.text(-popupWidth/2 + 40, 0, achievement.icon || '🏆', {
      font: '32px Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Achievement name
    const nameText = this.scene.add.text(-20, -5, achievement.name, {
      font: 'bold 16px monospace',
      fill: '#92CC41',
      align: 'center'
    }).setOrigin(0, 0.5);
    
    // Description
    const descText = this.scene.add.text(-20, 15, achievement.description, {
      font: '12px monospace',
      fill: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 250 }
    }).setOrigin(0, 0.5);
    
    // Reward text
    let rewardText = '';
    if (achievement.reward) {
      if (achievement.reward.xp) rewardText += `+${achievement.reward.xp} XP`;
      if (achievement.reward.unlock) rewardText += ` New Unlock!`;
    }
    
    if (rewardText) {
      const reward = this.scene.add.text(0, 40, rewardText, {
        font: '12px monospace',
        fill: '#F7D51D',
        align: 'center'
      }).setOrigin(0.5);
      container.add(reward);
    }
    
    // Add all elements to container
    container.add([bg, unlockedText, icon, nameText, descText]);
    
    // Animate in
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        // Add floating animation
        this.scene.tweens.add({
          targets: container,
          y: y - 10,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut'
        });
        
        // Auto hide after delay
        this.scene.time.delayedCall(3000, () => {
          this.hideAchievement(container);
        });
      }
    });
    
    // Play sound
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('achievement_unlock');
    }
    
    // Particle effect
    this.createCelebrationParticles(x, y);
  }
  
  hideAchievement(container) {
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      scale: 0.8,
      y: container.y - 20,
      duration: 300,
      ease: 'Power2.in',
      onComplete: () => {
        container.destroy();
        // Process next in queue
        this.scene.time.delayedCall(200, () => {
          this.processQueue();
        });
      }
    });
  }
  
  createCelebrationParticles(x, y) {
    const colors = [0xF7D51D, 0x92CC41, 0x3498db];
    
    for (let i = 0; i < 20; i++) {
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-50, 50),
        y,
        3,
        Phaser.Utils.Array.GetRandom(colors)
      );
      particle.setDepth(1002);
      
      this.scene.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(50, 100),
        x: particle.x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        scale: 0,
        duration: 1500,
        delay: i * 50,
        ease: 'Power2.out',
        onComplete: () => particle.destroy()
      });
    }
  }
}