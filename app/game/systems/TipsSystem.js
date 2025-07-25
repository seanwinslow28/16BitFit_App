/**
 * Tips System
 * Displays contextual hints and tips during gameplay
 */

export default class TipsSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentTip = null;
    this.tipQueue = [];
    this.shownTips = new Set();
    this.tipTimeout = null;
    
    // Define contextual tips
    this.tips = {
      // Combat tips
      lowHealth: {
        condition: () => this.scene.player?.hp < 30,
        text: 'Low health! Block attacks to reduce damage by 80%',
        priority: 'high',
        showOnce: false
      },
      fullSpecial: {
        condition: () => this.scene.player?.specialMeter >= this.scene.player?.maxSpecialMeter,
        text: 'Special meter full! Press SPECIAL for massive damage',
        priority: 'high',
        showOnce: false
      },
      firstCombo: {
        condition: () => this.scene.player?.comboCount === 3,
        text: 'Nice combo! Higher combos deal more damage',
        priority: 'medium',
        showOnce: true
      },
      longCombo: {
        condition: () => this.scene.player?.comboCount >= 10,
        text: 'AMAZING! 10+ hit combos deal 2x damage!',
        priority: 'high',
        showOnce: true
      },
      
      // Movement tips
      canAirDash: {
        condition: () => !this.scene.player?.body?.onFloor() && this.scene.player?.canAirDash,
        text: 'Press DOWN while airborne to air dash',
        priority: 'low',
        showOnce: true,
        delay: 1000
      },
      
      // Boss-specific tips
      bossLowHealth: {
        condition: () => this.scene.boss?.hp < 50,
        text: 'Boss is weakened! Keep up the pressure!',
        priority: 'medium',
        showOnce: true
      },
      bossCharging: {
        condition: () => this.scene.boss?.isCharging,
        text: 'Boss is charging! Get ready to dodge!',
        priority: 'high',
        showOnce: false
      },
      
      // General tips
      idleTooLong: {
        condition: () => {
          const lastAction = this.scene.player?.lastActionTime || 0;
          return this.scene.time.now - lastAction > 5000;
        },
        text: 'Try different attack combinations!',
        priority: 'low',
        showOnce: false
      },
      firstBlock: {
        condition: () => this.scene.player?.isBlocking && !this.shownTips.has('firstBlock'),
        text: 'Good! Blocking reduces damage significantly',
        priority: 'medium',
        showOnce: true
      }
    };
    
    // Start checking for tips
    this.startTipChecking();
  }
  
  startTipChecking() {
    // Check for tips every second
    this.scene.time.addEvent({
      delay: 1000,
      callback: this.checkTips,
      callbackScope: this,
      loop: true
    });
  }
  
  checkTips() {
    if (this.currentTip || this.scene.physics.world.isPaused) return;
    
    // Check all tips
    Object.entries(this.tips).forEach(([key, tip]) => {
      // Skip if already shown and showOnce is true
      if (tip.showOnce && this.shownTips.has(key)) return;
      
      // Check condition
      try {
        if (tip.condition()) {
          this.queueTip(key, tip);
        }
      } catch (e) {
        // Ignore errors from checking conditions
      }
    });
    
    // Show highest priority tip
    if (this.tipQueue.length > 0) {
      this.showNextTip();
    }
  }
  
  queueTip(key, tip) {
    // Don't queue if already queued
    if (this.tipQueue.find(t => t.key === key)) return;
    
    this.tipQueue.push({ key, ...tip });
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    this.tipQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  showNextTip() {
    if (this.tipQueue.length === 0) return;
    
    const tip = this.tipQueue.shift();
    const delay = tip.delay || 0;
    
    this.scene.time.delayedCall(delay, () => {
      this.showTip(tip.key, tip.text, tip.priority);
    });
  }
  
  showTip(key, text, priority = 'medium') {
    // Remove current tip if exists
    if (this.currentTip) {
      this.hideTip();
    }
    
    // Mark as shown
    this.shownTips.add(key);
    
    // Create tip UI
    const { width } = this.scene.cameras.main;
    const y = 120;
    
    // Determine colors based on priority
    const colors = {
      high: { bg: 0xE53935, text: '#FFFFFF', border: 0x8B0000 },
      medium: { bg: 0xF7D51D, text: '#0D0D0D', border: 0xB8860B },
      low: { bg: 0x92CC41, text: '#0D0D0D', border: 0x556B2F }
    };
    
    const color = colors[priority];
    
    // Create container
    this.currentTip = this.scene.add.container(width / 2, y);
    this.currentTip.setDepth(999);
    
    // Measure text width
    const tempText = this.scene.add.text(0, 0, text, {
      fontSize: '14px',
      fontFamily: 'pixel',
      color: color.text
    });
    const textWidth = tempText.width;
    tempText.destroy();
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, textWidth + 40, 40, color.bg, 0.9);
    bg.setStrokeStyle(3, color.border);
    this.currentTip.add(bg);
    
    // Icon
    const icon = this.scene.add.text(-textWidth/2 - 10, 0, '💡', {
      fontSize: '16px'
    }).setOrigin(0.5);
    this.currentTip.add(icon);
    
    // Text
    const tipText = this.scene.add.text(10, 0, text, {
      fontSize: '14px',
      fontFamily: 'pixel',
      color: color.text,
      align: 'center'
    }).setOrigin(0.5);
    this.currentTip.add(tipText);
    
    // Animate in
    this.currentTip.setScale(0);
    this.currentTip.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.currentTip,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Auto-hide after duration based on priority
    const durations = { high: 4000, medium: 3000, low: 2500 };
    this.tipTimeout = this.scene.time.delayedCall(durations[priority], () => {
      this.hideTip();
    });
  }
  
  hideTip() {
    if (!this.currentTip) return;
    
    // Cancel timeout
    if (this.tipTimeout) {
      this.tipTimeout.remove();
      this.tipTimeout = null;
    }
    
    // Animate out
    this.scene.tweens.add({
      targets: this.currentTip,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.currentTip.destroy();
        this.currentTip = null;
      }
    });
  }
  
  showCustomTip(text, priority = 'medium', duration = 3000) {
    // Queue a custom tip
    const customKey = `custom_${Date.now()}`;
    this.queueTip(customKey, {
      text,
      priority,
      showOnce: true,
      condition: () => false // Won't trigger again
    });
    
    this.showNextTip();
  }
  
  reset() {
    // Clear shown tips (except those marked as permanent)
    this.shownTips.clear();
    this.tipQueue = [];
    if (this.currentTip) {
      this.hideTip();
    }
  }
  
  destroy() {
    if (this.tipTimeout) {
      this.tipTimeout.remove();
    }
    if (this.currentTip) {
      this.currentTip.destroy();
    }
  }
}