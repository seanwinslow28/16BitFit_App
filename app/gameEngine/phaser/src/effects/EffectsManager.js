/**
 * Effects Manager - Handles all visual effects and particles
 * Optimized for mobile with object pooling
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export default class EffectsManager {
  constructor(scene) {
    this.scene = scene;
    this.effectPools = new Map();
    this.activeEffects = [];
    
    // Initialize particle emitters
    this.initializeParticleEmitters();
    
    // Initialize sprite effect pools
    this.initializeEffectPools();
  }

  initializeParticleEmitters() {
    // Hit spark particles
    this.hitParticles = this.scene.add.particles('particle-star');
    this.hitParticles.setDepth(200);
    
    // Block particles
    this.blockParticles = this.scene.add.particles('particle-dust');
    this.blockParticles.setDepth(200);
    
    // Evolution particles
    this.evolutionParticles = this.scene.add.particles('particle-energy');
    this.evolutionParticles.setDepth(150);
    
    // Create emitter configs
    this.createEmitterConfigs();
  }

  createEmitterConfigs() {
    // Hit spark emitter config
    this.hitSparkConfig = {
      x: 0,
      y: 0,
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 5,
      frequency: -1,
      angle: { min: 0, max: 360 },
      tint: [0xFFFFFF, 0xFFFF00, 0xFF0000]
    };
    
    // Block spark config
    this.blockSparkConfig = {
      x: 0,
      y: 0,
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 8,
      frequency: -1,
      angle: { min: -30, max: 30 },
      gravityY: 300,
      tint: 0x0080FF
    };
    
    // Evolution aura config
    this.evolutionAuraConfig = {
      x: 0,
      y: 0,
      speed: { min: 20, max: 50 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1000,
      quantity: 2,
      frequency: 100,
      angle: { min: -90, max: -90 },
      blendMode: 'ADD'
    };
  }

  initializeEffectPools() {
    // Create pools for different effect types
    this.createEffectPool('hitSpark', 10);
    this.createEffectPool('blockSpark', 10);
    this.createEffectPool('superFlash', 5);
    this.createEffectPool('dustCloud', 10);
    this.createEffectPool('levelUp', 3);
  }

  createEffectPool(type, size) {
    const pool = [];
    
    for (let i = 0; i < size; i++) {
      let effect;
      
      switch (type) {
        case 'hitSpark':
        case 'blockSpark':
        case 'superFlash':
        case 'dustCloud':
        case 'levelUp':
          effect = this.scene.add.sprite(0, 0, type);
          effect.setVisible(false);
          effect.setActive(false);
          effect.setDepth(200);
          break;
      }
      
      if (effect) {
        pool.push(effect);
      }
    }
    
    this.effectPools.set(type, pool);
  }

  getFromPool(type) {
    const pool = this.effectPools.get(type);
    if (!pool) return null;
    
    for (const effect of pool) {
      if (!effect.active) {
        effect.setActive(true);
        effect.setVisible(true);
        return effect;
      }
    }
    
    // Pool exhausted, create new one
    console.warn(`Effect pool ${type} exhausted`);
    return null;
  }

  returnToPool(effect, type) {
    effect.setActive(false);
    effect.setVisible(false);
    effect.setPosition(0, 0);
    effect.setScale(1);
    effect.setAlpha(1);
    effect.stop();
  }

  // Effect creation methods
  createHitEffect(x, y, type = 'normal') {
    // Particle burst
    const emitter = this.hitParticles.createEmitter(this.hitSparkConfig);
    emitter.setPosition(x, y);
    emitter.explode();
    
    // Hit spark sprite
    const spark = this.getFromPool('hitSpark');
    if (spark) {
      spark.setPosition(x, y);
      spark.setScale(type === 'heavy' ? 1.5 : 1);
      spark.play('hit-spark-anim');
      
      spark.once('animationcomplete', () => {
        this.returnToPool(spark, 'hitSpark');
      });
    }
    
    // Screen effects for heavy hits
    if (type === 'heavy') {
      this.createHitStop(3);
      this.createZoomEffect(1.02, 100);
    }
  }

  createBlockEffect(x, y) {
    // Particle burst
    const emitter = this.blockParticles.createEmitter(this.blockSparkConfig);
    emitter.setPosition(x, y);
    emitter.explode();
    
    // Block spark sprite
    const spark = this.getFromPool('blockSpark');
    if (spark) {
      spark.setPosition(x, y);
      spark.play('block-spark-anim');
      
      spark.once('animationcomplete', () => {
        this.returnToPool(spark, 'blockSpark');
      });
    }
  }

  createSpecialMoveEffect(x, y) {
    // Super flash
    const flash = this.getFromPool('superFlash');
    if (flash) {
      flash.setPosition(x, y);
      flash.setScale(2);
      flash.play('super-flash-anim');
      
      // Full screen flash
      this.createScreenFlash(0xFFFF00, 0.5, 200);
      
      flash.once('animationcomplete', () => {
        this.returnToPool(flash, 'superFlash');
      });
    }
    
    // Pause effect
    this.createHitStop(5);
  }

  createKOEffect(x, y) {
    // Dramatic KO effect
    this.createScreenFlash(0xFFFFFF, 0.8, 500);
    this.createZoomEffect(1.1, 300);
    this.createHitStop(10);
    
    // Particle explosion
    const emitter = this.hitParticles.createEmitter({
      ...this.hitSparkConfig,
      quantity: 20,
      speed: { min: 200, max: 400 },
      lifespan: 1000
    });
    emitter.setPosition(x, y);
    emitter.explode();
  }

  createEvolutionAura(fighter, evolutionStage) {
    const color = Phaser.Display.Color.HexStringToColor(
      GameConfig.evolution.visualEffects.auraColors[evolutionStage.level - 1]
    );
    
    const emitter = this.evolutionParticles.createEmitter({
      ...this.evolutionAuraConfig,
      follow: fighter,
      tint: color.color,
      quantity: GameConfig.evolution.visualEffects.particleCount[evolutionStage.level - 1]
    });
    
    // Store reference for cleanup
    fighter.evolutionEmitter = emitter;
  }

  createLevelUpEffect(x, y) {
    const levelUp = this.getFromPool('levelUp');
    if (levelUp) {
      levelUp.setPosition(x, y);
      levelUp.setScale(1.5);
      levelUp.play('level-up-anim');
      
      // Rising animation
      this.scene.tweens.add({
        targets: levelUp,
        y: y - 100,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          this.returnToPool(levelUp, 'levelUp');
        }
      });
    }
    
    // Particle fountain
    const emitter = this.evolutionParticles.createEmitter({
      x: x,
      y: y,
      speed: { min: 200, max: 400 },
      angle: { min: -110, max: -70 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 30,
      frequency: -1,
      tint: [0xFFD700, 0xFFFFFF]
    });
    emitter.explode();
  }

  createDustCloud(x, y) {
    const dust = this.getFromPool('dustCloud');
    if (dust) {
      dust.setPosition(x, y);
      dust.play('dust-cloud-anim');
      
      dust.once('animationcomplete', () => {
        this.returnToPool(dust, 'dustCloud');
      });
    }
  }

  createSuperComboEffect(x, y) {
    // Multiple flashes
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        this.createScreenFlash(0xFFFF00, 0.3, 100);
      });
    }
    
    // Radial burst
    const burst = this.scene.add.circle(x, y, 10, 0xFFFF00);
    burst.setDepth(250);
    
    this.scene.tweens.add({
      targets: burst,
      radius: 200,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => burst.destroy()
    });
  }

  // Screen effects
  createScreenFlash(color, alpha, duration) {
    const flash = this.scene.add.rectangle(
      0, 0,
      this.scene.scale.width,
      this.scene.scale.height,
      color, alpha
    );
    flash.setOrigin(0, 0);
    flash.setDepth(900);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }

  createHitStop(frames) {
    // Pause game for dramatic effect
    this.scene.physics.world.pause();
    
    this.scene.time.delayedCall(frames * 16.67, () => {
      this.scene.physics.world.resume();
    });
  }

  createZoomEffect(scale, duration) {
    const camera = this.scene.cameras.main;
    
    this.scene.tweens.add({
      targets: camera,
      zoom: scale,
      duration: duration / 2,
      ease: 'Power2',
      yoyo: true
    });
  }

  // Update active effects
  update() {
    // Update any ongoing effects
    this.activeEffects = this.activeEffects.filter(effect => {
      if (!effect.active) {
        return false;
      }
      
      // Update effect logic here if needed
      
      return true;
    });
  }

  // Cleanup
  destroy() {
    // Destroy all particle emitters
    this.hitParticles.destroy();
    this.blockParticles.destroy();
    this.evolutionParticles.destroy();
    
    // Return all effects to pools
    this.effectPools.forEach((pool, type) => {
      pool.forEach(effect => {
        effect.destroy();
      });
    });
    
    this.effectPools.clear();
    this.activeEffects = [];
  }

  // Performance management
  setQuality(quality) {
    const qualitySettings = GameConfig.performance.qualityLevels[quality];
    
    // Adjust particle counts
    const particleMultiplier = qualitySettings.particles;
    
    // Update emitter configs
    this.hitSparkConfig.quantity = Math.floor(5 * particleMultiplier);
    this.blockSparkConfig.quantity = Math.floor(8 * particleMultiplier);
    
    // Disable certain effects on low quality
    if (quality === 'low') {
      this.evolutionParticles.setVisible(false);
    } else {
      this.evolutionParticles.setVisible(true);
    }
  }
}