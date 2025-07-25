/**
 * Screen Effects System
 * Cinematic effects like slow motion, zoom, and post-processing
 */

export default class ScreenEffects {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    
    // Effect states
    this.slowMotionActive = false;
    this.originalTimeScale = 1;
    
    // Screen overlays
    this.overlays = [];
    
    // Create vignette
    this.createVignette();
  }
  
  createVignette() {
    const { width, height } = this.camera;
    
    // Create vignette graphics
    this.vignette = this.scene.add.graphics();
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(1000);
    this.vignette.setAlpha(0);
    
    // Draw vignette
    const gradient = this.vignette.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width * 0.7
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    this.vignette.fillStyle(gradient);
    this.vignette.fillRect(0, 0, width, height);
  }
  
  // Hit pause effect (freeze frame)
  hitPause(duration = 100) {
    // Store current velocities
    const sprites = [this.scene.player, this.scene.boss];
    const velocities = sprites.map(sprite => ({
      sprite,
      vx: sprite.body.velocity.x,
      vy: sprite.body.velocity.y
    }));
    
    // Freeze all physics
    sprites.forEach(sprite => {
      sprite.body.setVelocity(0, 0);
      sprite.body.moves = false;
    });
    
    // Resume after duration
    this.scene.time.delayedCall(duration, () => {
      velocities.forEach(({ sprite, vx, vy }) => {
        sprite.body.setVelocity(vx, vy);
        sprite.body.moves = true;
      });
    });
  }
  
  // Slow motion effect
  slowMotion(scale = 0.3, duration = 500) {
    if (this.slowMotionActive) return;
    
    this.slowMotionActive = true;
    this.originalTimeScale = this.scene.physics.world.timeScale;
    
    // Slow down physics
    this.scene.tweens.add({
      targets: this.scene.physics.world,
      timeScale: scale,
      duration: 200,
      ease: 'Power2.inOut',
      onComplete: () => {
        // Return to normal speed after duration
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: this.scene.physics.world,
            timeScale: this.originalTimeScale,
            duration: 200,
            ease: 'Power2.inOut',
            onComplete: () => {
              this.slowMotionActive = false;
            }
          });
        });
      }
    });
    
    // Visual indicator - slight blue tint
    this.flashScreen(0x0066CC, 0.1, 200);
  }
  
  // Chromatic aberration effect
  chromaticAberration(intensity = 10, duration = 200) {
    // Create RGB split effect with multiple sprites
    const target = this.scene.player;
    
    // Red channel
    const redSprite = this.scene.add.sprite(target.x - intensity, target.y, target.texture.key);
    redSprite.setFrame(target.frame.name);
    redSprite.setTint(0xFF0000);
    redSprite.setAlpha(0.5);
    redSprite.setBlendMode(Phaser.BlendModes.ADD);
    
    // Blue channel
    const blueSprite = this.scene.add.sprite(target.x + intensity, target.y, target.texture.key);
    blueSprite.setFrame(target.frame.name);
    blueSprite.setTint(0x0000FF);
    blueSprite.setAlpha(0.5);
    blueSprite.setBlendMode(Phaser.BlendModes.ADD);
    
    // Animate back together
    this.scene.tweens.add({
      targets: [redSprite, blueSprite],
      x: target.x,
      alpha: 0,
      duration: duration,
      onComplete: () => {
        redSprite.destroy();
        blueSprite.destroy();
      }
    });
  }
  
  // Camera zoom punch
  zoomPunch(scale = 1.1, duration = 200) {
    const currentZoom = this.camera.zoom;
    
    this.scene.tweens.add({
      targets: this.camera,
      zoom: currentZoom * scale,
      duration: duration / 2,
      ease: 'Power2.out',
      yoyo: true,
      onComplete: () => {
        this.camera.zoom = currentZoom;
      }
    });
  }
  
  // Flash screen effect
  flashScreen(color = 0xFFFFFF, alpha = 0.5, duration = 200) {
    const flash = this.scene.add.rectangle(
      this.camera.centerX,
      this.camera.centerY,
      this.camera.width,
      this.camera.height,
      color,
      alpha
    );
    flash.setScrollFactor(0);
    flash.setDepth(999);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }
  
  // Screen shake with rotation
  advancedShake(duration = 300, intensity = 0.01, rotationIntensity = 0.005) {
    this.camera.shake(duration, intensity);
    
    // Add rotation shake
    const originalRotation = this.camera.rotation;
    this.scene.tweens.add({
      targets: this.camera,
      rotation: {
        from: originalRotation - rotationIntensity,
        to: originalRotation + rotationIntensity
      },
      duration: 50,
      yoyo: true,
      repeat: duration / 100,
      ease: 'Linear',
      onComplete: () => {
        this.camera.rotation = originalRotation;
      }
    });
  }
  
  // Critical hit effect
  criticalHitEffect(x, y) {
    // Freeze frame
    this.hitPause(150);
    
    // Zoom punch
    this.zoomPunch(1.15, 300);
    
    // Radial blur lines
    const lineCount = 12;
    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 / lineCount) * i;
      const line = this.scene.add.rectangle(x, y, 200, 3, 0xFFFF00);
      line.setRotation(angle);
      line.setAlpha(0.8);
      line.setBlendMode(Phaser.BlendModes.ADD);
      
      this.scene.tweens.add({
        targets: line,
        scaleX: 3,
        alpha: 0,
        duration: 400,
        ease: 'Power2.out',
        onComplete: () => line.destroy()
      });
    }
    
    // Screen flash
    this.flashScreen(0xFFFF00, 0.3, 300);
  }
  
  // Focus mode (darken everything except target area)
  focusOn(x, y, radius = 150, duration = 500) {
    const { width, height } = this.camera;
    
    // Create darkness overlay
    const darkness = this.scene.add.graphics();
    darkness.setScrollFactor(0);
    darkness.setDepth(998);
    
    // Fill screen except circle
    darkness.fillStyle(0x000000, 0.7);
    darkness.fillRect(0, 0, width, height);
    
    // Cut out circle (using blend mode)
    const spotlight = this.scene.add.circle(x, y, radius, 0xFFFFFF);
    spotlight.setBlendMode(Phaser.BlendModes.ERASE);
    
    // Fade in
    darkness.setAlpha(0);
    this.scene.tweens.add({
      targets: darkness,
      alpha: 1,
      duration: duration / 2,
      onComplete: () => {
        // Fade out after duration
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: darkness,
            alpha: 0,
            duration: duration / 2,
            onComplete: () => {
              darkness.destroy();
              spotlight.destroy();
            }
          });
        });
      }
    });
  }
  
  // Victory slow motion with zoom
  victoryEffect() {
    // Slow motion
    this.slowMotion(0.2, 2000);
    
    // Zoom on winner
    this.scene.tweens.add({
      targets: this.camera,
      zoom: 1.3,
      duration: 1000,
      ease: 'Power2.inOut'
    });
    
    // Vignette fade in
    this.scene.tweens.add({
      targets: this.vignette,
      alpha: 0.5,
      duration: 1000
    });
    
    // Particles around winner
    const winner = this.scene.player.health > 0 ? this.scene.player : this.scene.boss;
    this.createVictoryParticles(winner.x, winner.y);
  }
  
  createVictoryParticles(x, y) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.circle(
        x + (Math.random() - 0.5) * 100,
        y + 50,
        5,
        0xF7D51D,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: y - 100,
        alpha: 0,
        duration: 2000,
        delay: i * 100,
        ease: 'Power2.out',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  // Reset all effects
  reset() {
    this.camera.zoom = 1;
    this.camera.rotation = 0;
    this.vignette.setAlpha(0);
    this.scene.physics.world.timeScale = 1;
    this.slowMotionActive = false;
  }
  
  cleanup() {
    this.reset();
    if (this.vignette) this.vignette.destroy();
    this.overlays.forEach(overlay => overlay.destroy());
  }
}