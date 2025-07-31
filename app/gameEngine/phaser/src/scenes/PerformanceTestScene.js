/**
 * Performance Test Scene - Validates 60fps rendering on mobile
 * Tests sprite rendering, particles, and combat animations
 */

import Phaser from 'phaser';
import PerformanceProfiler from '../utils/PerformanceProfiler';

export default class PerformanceTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PerformanceTestScene' });
    this.testResults = {
      avgFps: 0,
      minFps: 60,
      maxFps: 0,
      sprites: 0,
      particles: 0,
      passed: false
    };
  }

  create() {
    // Initialize performance profiler
    this.profiler = new PerformanceProfiler(this);
    this.profiler.create();
    this.profiler.toggleDebug(); // Show debug display
    
    // Create test UI
    this.createTestUI();
    
    // Run performance tests
    this.runTests();
  }

  createTestUI() {
    const { width, height } = this.scale.gameSize;
    
    // Title
    this.add.text(width / 2, 30, 'PERFORMANCE TEST', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // Status text
    this.statusText = this.add.text(width / 2, height - 100, 'Testing...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Results text
    this.resultsText = this.add.text(20, 100, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#ffffff'
    });
  }

  async runTests() {
    // Test 1: Static sprites
    await this.testStaticSprites();
    
    // Test 2: Animated sprites
    await this.testAnimatedSprites();
    
    // Test 3: Particles
    await this.testParticles();
    
    // Test 4: Combat simulation
    await this.testCombatSimulation();
    
    // Show final results
    this.showResults();
  }

  async testStaticSprites() {
    this.statusText.setText('Test 1: Static Sprites');
    
    const sprites = [];
    const targetSprites = 50;
    
    // Create placeholder sprites
    for (let i = 0; i < targetSprites; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(150, this.scale.height - 150);
      
      const sprite = this.add.rectangle(x, y, 64, 64, 0xff0000);
      sprites.push(sprite);
    }
    
    // Wait and measure
    await this.measurePerformance(2000);
    
    // Clean up
    sprites.forEach(sprite => sprite.destroy());
    
    this.testResults.sprites = targetSprites;
  }

  async testAnimatedSprites() {
    this.statusText.setText('Test 2: Animated Sprites');
    
    const sprites = [];
    const targetSprites = 30;
    
    // Create animated sprites
    for (let i = 0; i < targetSprites; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(150, this.scale.height - 150);
      
      const sprite = this.add.rectangle(x, y, 64, 64, 0x00ff00);
      
      // Simple animation
      this.tweens.add({
        targets: sprite,
        x: x + Phaser.Math.Between(-100, 100),
        y: y + Phaser.Math.Between(-50, 50),
        scaleX: { from: 1, to: 1.2 },
        scaleY: { from: 1, to: 1.2 },
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      sprites.push(sprite);
    }
    
    // Wait and measure
    await this.measurePerformance(3000);
    
    // Clean up
    sprites.forEach(sprite => sprite.destroy());
  }

  async testParticles() {
    this.statusText.setText('Test 3: Particle Effects');
    
    // Create particle emitters
    const emitters = [];
    
    // Hit effect particles
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, this.scale.width - 100);
      const y = Phaser.Math.Between(200, this.scale.height - 200);
      
      const particles = this.add.particles(x, y, null, {
        speed: { min: 100, max: 300 },
        scale: { start: 1, end: 0 },
        lifespan: 500,
        frequency: 50,
        quantity: 2,
        tint: [0xffff00, 0xff0000, 0xff00ff]
      });
      
      emitters.push(particles);
    }
    
    // Wait and measure
    await this.measurePerformance(3000);
    
    // Clean up
    emitters.forEach(emitter => emitter.destroy());
    
    this.testResults.particles = emitters.length;
  }

  async testCombatSimulation() {
    this.statusText.setText('Test 4: Combat Simulation');
    
    // Create two fighters
    const fighter1 = this.add.rectangle(200, 300, 80, 120, 0x0080ff);
    const fighter2 = this.add.rectangle(600, 300, 80, 120, 0xff8000);
    
    // Simulate combat with effects
    const combatLoop = this.time.addEvent({
      delay: 500,
      callback: () => {
        // Move fighters
        this.tweens.add({
          targets: fighter1,
          x: fighter2.x - 100,
          duration: 200,
          ease: 'Power2',
          yoyo: true
        });
        
        // Hit effect
        const hitX = (fighter1.x + fighter2.x) / 2;
        const hitY = fighter2.y;
        
        // Flash effect
        const flash = this.add.circle(hitX, hitY, 30, 0xffffff);
        this.tweens.add({
          targets: flash,
          scale: { from: 0.5, to: 2 },
          alpha: { from: 1, to: 0 },
          duration: 300,
          onComplete: () => flash.destroy()
        });
        
        // Particles
        const particles = this.add.particles(hitX, hitY, null, {
          speed: { min: 50, max: 200 },
          scale: { start: 0.5, end: 0 },
          lifespan: 300,
          quantity: 10
        });
        
        this.time.delayedCall(500, () => particles.destroy());
        
        // Knockback
        this.tweens.add({
          targets: fighter2,
          x: fighter2.x + 20,
          duration: 100,
          ease: 'Power2',
          yoyo: true
        });
      },
      repeat: 5
    });
    
    // Wait and measure
    await this.measurePerformance(4000);
    
    // Clean up
    combatLoop.destroy();
    fighter1.destroy();
    fighter2.destroy();
  }

  async measurePerformance(duration) {
    return new Promise(resolve => {
      // Reset min FPS for this test
      this.profiler.metrics.minFps = 60;
      
      this.time.delayedCall(duration, () => {
        // Update test results
        const metrics = this.profiler.getMetrics();
        this.testResults.avgFps = metrics.avgFps;
        this.testResults.minFps = Math.min(this.testResults.minFps, metrics.minFps);
        this.testResults.maxFps = Math.max(this.testResults.maxFps, metrics.maxFps);
        
        resolve();
      });
    });
  }

  showResults() {
    // Determine if test passed
    this.testResults.passed = this.testResults.avgFps >= 55 && 
                             this.testResults.minFps >= 45;
    
    // Update status
    const status = this.testResults.passed ? 'PASSED' : 'FAILED';
    const color = this.testResults.passed ? '#00ff00' : '#ff0000';
    this.statusText.setText(`Test Complete: ${status}`);
    this.statusText.setColor(color);
    
    // Show detailed results
    const results = [
      `Average FPS: ${this.testResults.avgFps}`,
      `Minimum FPS: ${this.testResults.minFps}`,
      `Maximum FPS: ${this.testResults.maxFps}`,
      ``,
      `Sprites Tested: ${this.testResults.sprites}`,
      `Particle Systems: ${this.testResults.particles}`,
      ``,
      `Quality Level: ${this.profiler.qualityLevel}`,
      `Memory Usage: ${this.profiler.metrics.memory}MB`
    ];
    
    this.resultsText.setText(results.join('\n'));
    
    // Send results to React Native
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PERFORMANCE_TEST_COMPLETE',
        payload: this.testResults
      }));
    }
    
    // Add continue button
    const continueBtn = this.add.text(
      this.scale.width / 2,
      this.scale.height - 50,
      'TAP TO CONTINUE',
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }
    );
    continueBtn.setOrigin(0.5);
    continueBtn.setInteractive();
    
    continueBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // Pulse animation
    this.tweens.add({
      targets: continueBtn,
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // Performance profiler handles its own updates
  }
}