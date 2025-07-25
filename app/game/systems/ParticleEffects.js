/**
 * Particle Effects System
 * Advanced particle effects for attacks, impacts, and special moves
 */

export default class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
    this.activeParticles = [];
  }
  
  // Hit impact particles
  createHitImpact(x, y, type = 'light') {
    const configs = {
      light: {
        count: 8,
        color: 0xFFFF00,
        speed: 200,
        size: 4,
        duration: 300
      },
      heavy: {
        count: 12,
        color: 0xFF6600,
        speed: 300,
        size: 6,
        duration: 400
      },
      special: {
        count: 20,
        color: 0x00FFFF,
        speed: 400,
        size: 8,
        duration: 500
      }
    };
    
    const config = configs[type] || configs.light;
    
    // Create impact flash
    const flash = this.scene.add.circle(x, y, 20, config.color, 0.8);
    this.scene.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
    
    // Create particles
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 / config.count) * i;
      const particle = this.scene.add.circle(x, y, config.size, config.color);
      
      const distance = config.speed * (0.5 + Math.random() * 0.5);
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        scale: 0,
        alpha: 0,
        duration: config.duration,
        ease: 'Power2.out',
        onComplete: () => particle.destroy()
      });
    }
    
    // Add some spark lines
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      const line = this.scene.add.rectangle(x, y, 40, 2, config.color);
      line.setRotation(angle);
      
      this.scene.tweens.add({
        targets: line,
        scaleX: 2,
        alpha: 0,
        duration: 200,
        onComplete: () => line.destroy()
      });
    }
  }
  
  // Block spark effect
  createBlockSpark(x, y) {
    // Blue sparks for successful block
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 / sparkCount) * i;
      const spark = this.scene.add.rectangle(x, y, 20, 3, 0x3498db);
      spark.setRotation(angle);
      
      this.scene.tweens.add({
        targets: spark,
        scaleX: 3,
        alpha: 0,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        duration: 300,
        ease: 'Power2.out',
        onComplete: () => spark.destroy()
      });
    }
    
    // Shield flash
    const shield = this.scene.add.circle(x, y, 40, 0x3498db, 0.3);
    this.scene.tweens.add({
      targets: shield,
      scale: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => shield.destroy()
    });
  }
  
  // Special move activation
  createSpecialActivation(x, y) {
    // Energy gather effect
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const startDistance = 100;
      const startX = x + Math.cos(angle) * startDistance;
      const startY = y + Math.sin(angle) * startDistance;
      
      const particle = this.scene.add.circle(startX, startY, 6, 0x00FFFF, 0.8);
      
      this.scene.tweens.add({
        targets: particle,
        x: x,
        y: y,
        scale: 0,
        duration: 500,
        ease: 'Power2.in',
        delay: i * 20,
        onComplete: () => particle.destroy()
      });
    }
    
    // Energy burst
    this.scene.time.delayedCall(500, () => {
      const burst = this.scene.add.circle(x, y, 50, 0x00FFFF, 0.6);
      this.scene.tweens.add({
        targets: burst,
        scale: 4,
        alpha: 0,
        duration: 600,
        ease: 'Power2.out',
        onComplete: () => burst.destroy()
      });
      
      // Ring wave
      const ring = this.scene.add.graphics();
      ring.lineStyle(4, 0x00FFFF, 1);
      ring.strokeCircle(x, y, 50);
      
      this.scene.tweens.add({
        targets: ring,
        scale: 3,
        alpha: 0,
        duration: 800,
        ease: 'Power2.out',
        onComplete: () => ring.destroy()
      });
    });
  }
  
  // Dash trail effect
  createDashTrail(sprite, duration = 300) {
    const trail = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key);
    trail.setFrame(sprite.frame.name);
    trail.setScale(sprite.scaleX, sprite.scaleY);
    trail.setFlipX(sprite.flipX);
    trail.setAlpha(0.5);
    trail.setTint(0x92CC41);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: trail.scaleX * 0.8,
      scaleY: trail.scaleY * 0.8,
      duration: duration,
      onComplete: () => trail.destroy()
    });
  }
  
  // Power up aura
  createPowerAura(target, color = 0xFF0000, duration = 1000) {
    const aura = this.scene.add.circle(target.x, target.y, 40, color, 0.3);
    aura.setBlendMode(Phaser.BlendModes.ADD);
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: aura,
      scale: { from: 1, to: 1.5 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 500,
      yoyo: true,
      repeat: duration / 1000,
      onUpdate: () => {
        aura.setPosition(target.x, target.y);
      },
      onComplete: () => aura.destroy()
    });
    
    // Energy particles
    const particleTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: duration / 100,
      callback: () => {
        const particle = this.scene.add.circle(
          target.x + (Math.random() - 0.5) * 60,
          target.y + 30,
          3,
          color,
          0.8
        );
        
        this.scene.tweens.add({
          targets: particle,
          y: target.y - 50,
          alpha: 0,
          duration: 800,
          onComplete: () => particle.destroy()
        });
      }
    });
    
    return { aura, particleTimer };
  }
  
  // Environmental hit effect
  createEnvironmentalImpact(x, y, type = 'ground') {
    if (type === 'ground') {
      // Dust cloud
      const dustCount = 8;
      for (let i = 0; i < dustCount; i++) {
        const dust = this.scene.add.circle(
          x + (Math.random() - 0.5) * 40,
          y,
          10 + Math.random() * 10,
          0x8B6914,
          0.6
        );
        
        this.scene.tweens.add({
          targets: dust,
          y: y - 20 - Math.random() * 30,
          scale: 0,
          alpha: 0,
          duration: 600 + Math.random() * 400,
          ease: 'Power2.out',
          onComplete: () => dust.destroy()
        });
      }
      
      // Crack lines
      for (let i = 0; i < 3; i++) {
        const crack = this.scene.add.rectangle(
          x + (Math.random() - 0.5) * 60,
          y,
          2,
          20 + Math.random() * 20,
          0x000000,
          0.5
        );
        crack.setRotation(Math.random() * Math.PI);
        
        this.scene.tweens.add({
          targets: crack,
          scaleY: 0,
          alpha: 0,
          duration: 1000,
          onComplete: () => crack.destroy()
        });
      }
    }
  }
  
  // Projectile trail
  createProjectileTrail(projectile, color = 0xFF6666) {
    const trail = this.scene.add.circle(projectile.x, projectile.y, projectile.width / 2, color, 0.5);
    
    this.scene.tweens.add({
      targets: trail,
      scale: 0.5,
      alpha: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }
  
  // Victory celebration
  createVictoryEffect(x, y) {
    // Confetti
    const colors = [0x92CC41, 0xF7D51D, 0x3498db, 0xE53935];
    for (let i = 0; i < 30; i++) {
      const confetti = this.scene.add.rectangle(
        x + (Math.random() - 0.5) * 100,
        y - 100,
        8,
        16,
        Phaser.Utils.Array.GetRandom(colors)
      );
      confetti.setRotation(Math.random() * Math.PI);
      
      this.scene.tweens.add({
        targets: confetti,
        y: y + 100,
        rotation: confetti.rotation + Math.PI * 2 * (Math.random() > 0.5 ? 1 : -1),
        duration: 1500 + Math.random() * 1000,
        ease: 'Power2.in',
        delay: Math.random() * 500,
        onComplete: () => confetti.destroy()
      });
    }
    
    // Star burst
    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 / starCount) * i;
      const star = this.scene.add.star(x, y, 5, 10, 20, 0xF7D51D);
      
      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 150,
        y: y + Math.sin(angle) * 150,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 1000,
        ease: 'Power2.out',
        onComplete: () => star.destroy()
      });
    }
  }
  
  // Update particle trails for moving objects
  updateProjectileTrails(projectiles) {
    projectiles.children.entries.forEach(projectile => {
      if (Math.random() < 0.3) { // 30% chance to create trail
        this.createProjectileTrail(projectile);
      }
    });
  }
  
  createAirBurst(x, y) {
    // Air particles for double jump
    const colors = [0x00FFFF, 0x66DDFF, 0xCCEEFF];
    
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const speed = 150;
      const particle = this.scene.add.circle(
        x,
        y,
        3,
        colors[Math.floor(Math.random() * colors.length)],
        0.8
      );
      
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.scene.tweens.add({
        targets: particle,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2.out',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  cleanup() {
    // Clean up any remaining particles
    this.activeParticles.forEach(particle => {
      if (particle.destroy) particle.destroy();
    });
    this.activeParticles = [];
  }
}