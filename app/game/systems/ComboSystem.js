/**
 * Combo System
 * Tracks and manages combat combos
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class ComboSystem {
  constructor(scene) {
    this.scene = scene;
    this.count = 0;
    this.maxCombo = 0;
    this.lastHitTime = 0;
    this.comboTimer = null;
    this.comboText = null;
  }

  addHit() {
    const currentTime = this.scene.time.now;
    
    // Check if combo window expired
    if (currentTime - this.lastHitTime > GAME_CONFIG.combat.comboTimeWindow) {
      this.count = 0;
    }
    
    this.count++;
    this.lastHitTime = currentTime;
    
    // Update max combo
    if (this.count > this.maxCombo) {
      this.maxCombo = this.count;
    }
    
    // Clear existing timer
    if (this.comboTimer) {
      this.comboTimer.remove();
    }
    
    // Set new timer to reset combo
    this.comboTimer = this.scene.time.delayedCall(
      GAME_CONFIG.combat.comboTimeWindow,
      () => this.reset()
    );
    
    // Show combo text for combos 2+
    if (this.count >= 2) {
      this.showComboText();
    }
  }

  reset() {
    this.count = 0;
    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }
    if (this.comboText) {
      this.comboText.destroy();
      this.comboText = null;
    }
  }

  getMultiplier() {
    if (this.count < 3) return 1;
    if (this.count < 5) return 1.2;
    if (this.count < 10) return 1.5;
    return 2;
  }

  showComboText() {
    const { width, height } = this.scene.cameras.main;
    
    // Remove previous combo text if exists
    if (this.comboText) {
      this.comboText.destroy();
    }
    
    // Determine combo message
    let message = `${this.count} HIT COMBO!`;
    let color = '#92CC41';
    
    if (this.count >= 10) {
      message = `AMAZING! ${this.count} HIT COMBO!`;
      color = '#F7D51D';
    } else if (this.count >= 5) {
      message = `GREAT! ${this.count} HIT COMBO!`;
      color = '#3498db';
    }
    
    // Create combo text
    this.comboText = this.scene.add.text(
      width / 2,
      height / 2 - 120,
      message,
      {
        fontSize: this.count >= 10 ? '28px' : '24px',
        fontFamily: 'monospace',
        color: color,
        stroke: '#0D0D0D',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);
    
    // Animate combo text
    this.scene.tweens.add({
      targets: this.comboText,
      scale: { from: 0.5, to: 1.2 },
      y: this.comboText.y - 40,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.comboText,
          alpha: 0,
          y: this.comboText.y - 20,
          duration: 700,
          ease: 'Power2',
          onComplete: () => {
            if (this.comboText) {
              this.comboText.destroy();
              this.comboText = null;
            }
          },
        });
      },
    });
  }
  
  update(time, delta) {
    // Update handled by timer system
  }
}