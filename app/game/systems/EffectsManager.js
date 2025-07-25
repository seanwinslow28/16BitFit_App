/**
 * Effects Manager
 * Handles visual effects for combat
 */

import { GAME_CONFIG } from '../config/GameConfig';
import ParticleEffects from './ParticleEffects';
import ScreenEffects from './ScreenEffects';

export default class EffectsManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = new ParticleEffects(scene);
    this.screen = new ScreenEffects(scene);
    
    // Track critical hit chance
    this.criticalChance = 0.1; // 10% base chance
  }

  playHitEffect(x, y, damage, type = 'normal') {
    // Check for critical hit
    const isCritical = type === 'special' || Math.random() < this.criticalChance;
    
    // Create damage text
    const damageText = this.scene.add.text(x, y - 30, isCritical ? `${damage}!` : damage, {
      font: `bold ${isCritical ? '32px' : '24px'} monospace`,
      fill: isCritical ? '#FF0000' : '#FFFF00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    // Enhanced effects for critical hits
    if (isCritical) {
      this.screen.criticalHitEffect(x, y);
      this.particles.createHitImpact(x, y, 'heavy');
    } else {
      // Normal hit effects
      this.particles.createHitImpact(x, y, type === 'heavy' ? 'heavy' : 'light');
      this.screen.hitPause(type === 'heavy' ? 100 : 50);
      this.screen.advancedShake(200, type === 'heavy' ? 0.01 : 0.005);
    }

    // Animate damage text
    this.scene.tweens.add({
      targets: damageText,
      y: y - 70,
      scale: isCritical ? { from: 1.5, to: 0.5 } : { from: 1, to: 0.8 },
      alpha: 0,
      duration: isCritical ? 1000 : 800,
      ease: 'Power2',
      onComplete: () => damageText.destroy(),
    });
  }

  playBlockEffect(x, y) {
    // Particle effect
    this.particles.createBlockSpark(x, y);
    
    // Screen effect
    this.screen.flashScreen(0x3498db, 0.2, 150);
    
    // Create block text
    const blockText = this.scene.add.text(x, y - 20, 'BLOCKED', {
      font: 'bold 16px monospace',
      fill: '#3498db',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    // Animate with bounce
    this.scene.tweens.add({
      targets: blockText,
      y: y - 40,
      scale: { from: 1.2, to: 0.8 },
      alpha: 0,
      duration: 600,
      ease: 'Back.out',
      onComplete: () => blockText.destroy(),
    });
  }

  playSpecialEffect(x, y) {
    // Particle activation
    this.particles.createSpecialActivation(x, y);
    
    // Screen effects
    this.screen.slowMotion(0.3, 300);
    this.screen.zoomPunch(1.2, 400);
    this.screen.flashScreen(0x00FFFF, 0.3, 200);
    
    // Special text
    const specialText = this.scene.add.text(x, y - 80, 'SPECIAL MOVE!', {
      font: 'bold 28px monospace',
      fill: '#00FFFF',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setScale(0);
    
    this.scene.tweens.add({
      targets: specialText,
      scale: 1.2,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: specialText,
          alpha: 0,
          y: y - 100,
          duration: 700,
          delay: 300,
          onComplete: () => specialText.destroy(),
        });
      }
    });
  }

  playDashEffect(sprite) {
    // Create dash trail
    const dashTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: 5,
      callback: () => {
        this.particles.createDashTrail(sprite, 300);
      }
    });
  }
  
  playJumpEffect(x, y) {
    // Jump dust
    this.particles.createEnvironmentalImpact(x, y + 30, 'ground');
  }
  
  playDoubleJumpEffect(x, y) {
    // Air ring effect for double jump
    const ring = this.scene.add.circle(x, y, 20, 0x00FFFF, 0.3);
    ring.setStrokeStyle(3, 0x00FFFF, 0.8);
    
    this.scene.tweens.add({
      targets: ring,
      radius: 60,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
    
    // Air particles
    this.particles.createAirBurst(x, y);
  }
  
  playDashEffect(x, y, facingRight) {
    // Dash lines
    const dashLines = this.scene.add.graphics();
    dashLines.lineStyle(3, 0x00FFFF, 0.8);
    
    for (let i = 0; i < 5; i++) {
      const offsetX = facingRight ? -(i * 20) : (i * 20);
      dashLines.moveTo(x + offsetX, y - 20);
      dashLines.lineTo(x + offsetX - (facingRight ? 30 : -30), y - 20);
    }
    
    dashLines.setAlpha(0.8);
    
    this.scene.tweens.add({
      targets: dashLines,
      alpha: 0,
      duration: 300,
      onComplete: () => dashLines.destroy()
    });
  }
  
  playLandingEffect(x, y, force = 1) {
    // Landing impact
    if (force > 1.5) {
      this.particles.createEnvironmentalImpact(x, y, 'ground');
      this.screen.advancedShake(150, 0.005 * force);
    }
  }
  
  playPowerUpEffect(target, duration = 2000) {
    return this.particles.createPowerAura(target, 0xFF0000, duration);
  }
  
  playVictoryEffect() {
    this.screen.victoryEffect();
    const winner = this.scene.player.health > 0 ? this.scene.player : this.scene.boss;
    this.particles.createVictoryEffect(winner.x, winner.y);
  }
  
  playWindEffect(x, y) {
    // Wind swirl particles
    const windGraphics = this.scene.add.graphics();
    windGraphics.lineStyle(2, 0x00FF00, 0.5);
    
    // Create spiral wind lines
    for (let i = 0; i < 3; i++) {
      const spiral = new Phaser.Curves.Spline([
        x + Math.cos(i * 2) * 20, y + Math.sin(i * 2) * 20,
        x + Math.cos(i * 2 + 1) * 40, y + Math.sin(i * 2 + 1) * 40,
        x + Math.cos(i * 2 + 2) * 60, y + Math.sin(i * 2 + 2) * 60,
      ]);
      spiral.draw(windGraphics);
    }
    
    this.scene.tweens.add({
      targets: windGraphics,
      rotation: Math.PI * 2,
      alpha: 0,
      duration: 800,
      onComplete: () => windGraphics.destroy()
    });
  }
  
  playCounterFlash(x, y) {
    // White flash at counter point
    const flash = this.scene.add.circle(x, y, 100, 0xFFFFFF, 0.8);
    
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
    
    // Screen effect
    this.screen.flashScreen(0xFFFFFF, 0.5, 200);
    this.screen.hitPause(200);
  }
  
  playUltimateAura(target) {
    // Create rotating aura around player
    const aura = this.scene.add.graphics();
    aura.lineStyle(4, 0xFF00FF);
    
    const updateAura = () => {
      aura.clear();
      aura.lineStyle(4, 0xFF00FF, 0.8);
      
      // Draw energy rings
      for (let i = 0; i < 3; i++) {
        const radius = 40 + i * 20;
        const wobble = Math.sin(this.scene.time.now * 0.005 + i) * 5;
        aura.strokeCircle(target.x, target.y, radius + wobble);
      }
    };
    
    // Update aura
    const auraUpdate = this.scene.time.addEvent({
      delay: 16,
      callback: updateAura,
      loop: true
    });
    
    // Remove after duration
    this.scene.time.delayedCall(2000, () => {
      auraUpdate.remove();
      this.scene.tweens.add({
        targets: aura,
        alpha: 0,
        duration: 300,
        onComplete: () => aura.destroy()
      });
    });
  }
  
  update(time, delta) {
    // Update projectile trails if boss has projectiles
    if (this.scene.boss && this.scene.boss.ai && this.scene.boss.ai.projectiles) {
      this.particles.updateProjectileTrails(this.scene.boss.ai.projectiles);
    }
  }
  
  cleanup() {
    this.particles.cleanup();
    this.screen.cleanup();
  }
}