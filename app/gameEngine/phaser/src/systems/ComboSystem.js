/**
 * Combo System - Street Fighter 2 style combo detection and tracking
 * Handles combo validation, damage scaling, and combo breaking
 */

import { GameConfig } from '../config/GameConfig';

export default class ComboSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentCombo = {
      hits: 0,
      damage: 0,
      moves: [],
      startTime: 0,
      lastHitTime: 0
    };
    
    this.maxCombo = 0;
    this.totalCombos = 0;
    
    // Combo timing windows
    this.comboWindow = 800; // ms between hits to maintain combo
    this.cancelWindow = GameConfig.combat.comboCancelWindow;
    
    // Combo display
    this.createComboDisplay();
  }

  createComboDisplay() {
    const { width, height } = this.scene.scale.gameSize;
    
    // Combo counter container
    this.comboDisplay = this.scene.add.container(width / 2, height / 3);
    this.comboDisplay.setDepth(100);
    
    // Combo text
    this.comboText = this.scene.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);
    this.comboDisplay.add(this.comboText);
    
    // Hit counter
    this.hitText = this.scene.add.text(0, 40, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.hitText.setOrigin(0.5);
    this.comboDisplay.add(this.hitText);
    
    // Damage display
    this.damageText = this.scene.add.text(0, 70, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FF9900',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.damageText.setOrigin(0.5);
    this.comboDisplay.add(this.damageText);
    
    // Initially hidden
    this.comboDisplay.setVisible(false);
  }

  registerHit(attacker, defender, move, damage) {
    const currentTime = Date.now();
    
    // Check if this continues a combo
    if (this.isComboActive(currentTime)) {
      this.extendCombo(attacker, move, damage);
    } else {
      this.startNewCombo(attacker, move, damage);
    }
    
    // Update display
    this.updateDisplay();
    
    // Check for special combo achievements
    this.checkComboAchievements();
  }

  isComboActive(currentTime) {
    return this.currentCombo.hits > 0 && 
           (currentTime - this.currentCombo.lastHitTime) < this.comboWindow;
  }

  startNewCombo(attacker, move, damage) {
    this.currentCombo = {
      hits: 1,
      damage: damage,
      moves: [move],
      startTime: Date.now(),
      lastHitTime: Date.now(),
      attacker: attacker
    };
  }

  extendCombo(attacker, move, damage) {
    // Apply damage scaling
    const scaledDamage = this.applyDamageScaling(damage, this.currentCombo.hits);
    
    this.currentCombo.hits++;
    this.currentCombo.damage += scaledDamage;
    this.currentCombo.moves.push(move);
    this.currentCombo.lastHitTime = Date.now();
    
    // Update max combo
    if (this.currentCombo.hits > this.maxCombo) {
      this.maxCombo = this.currentCombo.hits;
    }
    
    // Play combo sound effects
    this.playComboSound();
    
    return scaledDamage;
  }

  applyDamageScaling(baseDamage, hitNumber) {
    const scaling = GameConfig.combat.damageScaling;
    const scaleIndex = Math.min(hitNumber, scaling.length - 1);
    return Math.floor(baseDamage * scaling[scaleIndex]);
  }

  breakCombo(reason = 'timeout') {
    if (this.currentCombo.hits > 1) {
      // Record combo
      this.totalCombos++;
      
      // Show final combo stats
      this.showComboEnd(reason);
      
      // Reset combo
      this.currentCombo = {
        hits: 0,
        damage: 0,
        moves: [],
        startTime: 0,
        lastHitTime: 0
      };
      
      // Hide display after delay
      this.scene.time.delayedCall(2000, () => {
        this.comboDisplay.setVisible(false);
      });
    }
  }

  update() {
    // Check for combo timeout
    if (this.isComboActive(Date.now())) {
      const timeSinceLastHit = Date.now() - this.currentCombo.lastHitTime;
      if (timeSinceLastHit > this.comboWindow) {
        this.breakCombo('timeout');
      }
    }
  }

  updateDisplay() {
    if (this.currentCombo.hits < 2) {
      this.comboDisplay.setVisible(false);
      return;
    }
    
    this.comboDisplay.setVisible(true);
    
    // Update texts
    this.comboText.setText(`${this.currentCombo.hits} HIT COMBO!`);
    this.hitText.setText(this.getComboName(this.currentCombo.hits));
    this.damageText.setText(`${this.currentCombo.damage} DMG`);
    
    // Animate combo counter
    this.animateComboDisplay();
  }

  getComboName(hits) {
    if (hits >= 20) return 'ULTRA COMBO!!!';
    if (hits >= 15) return 'SUPER COMBO!!';
    if (hits >= 10) return 'HYPER COMBO!';
    if (hits >= 7) return 'KILLER COMBO';
    if (hits >= 5) return 'GREAT COMBO';
    if (hits >= 3) return 'NICE COMBO';
    return '';
  }

  animateComboDisplay() {
    // Scale animation
    this.scene.tweens.add({
      targets: this.comboDisplay,
      scale: { from: 0.8, to: 1.2 },
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        this.comboDisplay.setScale(1);
      }
    });
    
    // Color flash based on combo size
    const colors = ['#FFFFFF', '#FFD700', '#FF6600', '#FF0000', '#FF00FF'];
    const colorIndex = Math.min(Math.floor(this.currentCombo.hits / 3), colors.length - 1);
    this.comboText.setColor(colors[colorIndex]);
  }

  showComboEnd(reason) {
    // Special effects for big combos
    if (this.currentCombo.hits >= 10) {
      this.scene.effectsManager.createSuperComboEffect(
        this.comboDisplay.x,
        this.comboDisplay.y
      );
    }
    
    // Add floating text for total damage
    const floatingText = this.scene.add.text(
      this.comboDisplay.x,
      this.comboDisplay.y + 100,
      `Total: ${this.currentCombo.damage}`,
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    floatingText.setOrigin(0.5);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: floatingText,
      y: floatingText.y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => floatingText.destroy()
    });
  }

  playComboSound() {
    const hits = this.currentCombo.hits;
    
    if (hits === 3) {
      this.scene.game.soundManager.playSound('combo-start');
    } else if (hits === 5) {
      this.scene.game.soundManager.playSound('combo-continue');
    } else if (hits === 10) {
      this.scene.game.soundManager.playSound('combo-super');
    } else if (hits % 5 === 0) {
      this.scene.game.soundManager.playSound('combo-milestone');
    }
  }

  checkComboAchievements() {
    const hits = this.currentCombo.hits;
    
    // First combo
    if (hits === 3 && this.totalCombos === 0) {
      this.unlockAchievement('first-combo');
    }
    
    // Specific combo milestones
    const milestones = [5, 10, 20, 50];
    if (milestones.includes(hits)) {
      this.unlockAchievement(`combo-${hits}`);
    }
    
    // Perfect combo (no repeated moves)
    const uniqueMoves = new Set(this.currentCombo.moves);
    if (uniqueMoves.size === this.currentCombo.moves.length && hits >= 5) {
      this.unlockAchievement('perfect-combo');
    }
  }

  unlockAchievement(achievementId) {
    // Send to achievement system
    if (this.scene.game.achievementManager) {
      this.scene.game.achievementManager.unlock(achievementId);
    }
  }

  // Combo validation
  canCancelInto(currentMove, nextMove) {
    // Define cancel rules (simplified)
    const cancelRules = {
      'lightPunch': ['mediumPunch', 'lightKick', 'special'],
      'mediumPunch': ['heavyPunch', 'mediumKick', 'special'],
      'heavyPunch': ['special'],
      'lightKick': ['mediumKick', 'lightPunch', 'special'],
      'mediumKick': ['heavyKick', 'mediumPunch', 'special'],
      'heavyKick': ['special'],
      'special': ['super']
    };
    
    const allowedCancels = cancelRules[currentMove] || [];
    return allowedCancels.includes(nextMove);
  }

  // Get combo statistics
  getStats() {
    return {
      maxCombo: this.maxCombo,
      totalCombos: this.totalCombos,
      currentCombo: this.currentCombo.hits,
      averageCombo: this.totalCombos > 0 ? 
        Math.round(this.totalHits / this.totalCombos) : 0
    };
  }

  reset() {
    this.currentCombo = {
      hits: 0,
      damage: 0,
      moves: [],
      startTime: 0,
      lastHitTime: 0
    };
    this.comboDisplay.setVisible(false);
  }
}