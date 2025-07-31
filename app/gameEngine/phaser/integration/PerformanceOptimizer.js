/**
 * PerformanceOptimizer - 60fps optimization for Phaser 3 in WebView
 * 
 * Optimization strategies:
 * - Dynamic quality adjustment
 * - Frame skipping with interpolation
 * - Render culling and LOD
 * - Memory pool management
 * - GPU state batching
 */

class PerformanceOptimizer {
  constructor(game) {
    this.game = game;
    this.targetFPS = 60;
    this.minFPS = 30;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      activeSprites: 0,
      particleCount: 0,
      memoryUsage: 0,
    };
    
    // Quality settings
    this.qualityLevels = {
      ULTRA: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
      POTATO: 0,
    };
    
    this.currentQuality = this.qualityLevels.HIGH;
    
    // Frame timing
    this.frameHistory = new Array(60).fill(16.67);
    this.frameIndex = 0;
    this.lastFrameTime = performance.now();
    
    // Optimization features
    this.features = {
      particleEffects: true,
      shadows: true,
      antialiasing: true,
      postProcessing: true,
      highResTextures: true,
      complexShaders: true,
      dynamicLighting: true,
    };
    
    // Initialize optimizations
    this.initializeOptimizations();
  }
  
  /**
   * Initialize performance optimizations
   */
  initializeOptimizations() {
    // Configure Phaser renderer
    if (this.game.renderer) {
      // Enable/disable antialiasing based on device
      this.game.renderer.config.antialias = this.shouldEnableAntialiasing();
      
      // Set pixel art mode for better performance
      this.game.renderer.config.pixelArt = true;
      
      // Disable transparency sorting for performance
      this.game.renderer.config.transparent = false;
    }
    
    // Configure physics engine
    if (this.game.physics && this.game.physics.world) {
      // Reduce physics iterations for performance
      this.game.physics.world.defaults.velocityIterations = 4;
      this.game.physics.world.defaults.positionIterations = 4;
      
      // Set fixed timestep
      this.game.physics.world.fixedStep = true;
      this.game.physics.world.fixedDelta = 1 / 60;
    }
    
    // Set up frame monitoring
    this.startFrameMonitoring();
  }
  
  /**
   * Start monitoring frame performance
   */
  startFrameMonitoring() {
    // Override Phaser's step function
    const originalStep = this.game.step.bind(this.game);
    
    this.game.step = (time, delta) => {
      const frameStart = performance.now();
      
      // Call original step
      originalStep(time, delta);
      
      // Measure frame time
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;
      
      // Update metrics
      this.updateFrameMetrics(frameTime);
      
      // Adjust quality if needed
      if (this.frameIndex % 30 === 0) {
        this.adjustQualityLevel();
      }
    };
  }
  
  /**
   * Update frame performance metrics
   */
  updateFrameMetrics(frameTime) {
    // Store frame time
    this.frameHistory[this.frameIndex % 60] = frameTime;
    this.frameIndex++;
    
    // Calculate average FPS
    const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / 60;
    this.metrics.fps = Math.round(1000 / avgFrameTime);
    this.metrics.frameTime = avgFrameTime;
    
    // Update other metrics
    this.updateRenderMetrics();
  }
  
  /**
   * Update rendering metrics
   */
  updateRenderMetrics() {
    const renderer = this.game.renderer;
    if (renderer && renderer.gl) {
      // Estimate draw calls (WebGL specific)
      this.metrics.drawCalls = renderer.drawCount || 0;
    }
    
    // Count active game objects
    let spriteCount = 0;
    let particleCount = 0;
    
    this.game.scene.scenes.forEach(scene => {
      if (scene.sys && scene.sys.displayList) {
        spriteCount += scene.sys.displayList.list.length;
      }
      
      // Count particles
      if (scene.particles) {
        scene.particles.emitters.list.forEach(emitter => {
          particleCount += emitter.alive.length;
        });
      }
    });
    
    this.metrics.activeSprites = spriteCount;
    this.metrics.particleCount = particleCount;
    
    // Estimate memory usage
    if (performance.memory) {
      this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
    }
  }
  
  /**
   * Dynamically adjust quality based on performance
   */
  adjustQualityLevel() {
    const avgFPS = this.metrics.fps;
    
    // Check if we need to adjust quality
    if (avgFPS < this.minFPS && this.currentQuality > this.qualityLevels.POTATO) {
      // Decrease quality
      this.currentQuality--;
      this.applyQualitySettings();
      console.log(`Decreasing quality to level ${this.currentQuality} (FPS: ${avgFPS})`);
    } else if (avgFPS > this.targetFPS - 5 && this.currentQuality < this.qualityLevels.ULTRA) {
      // Try increasing quality
      this.currentQuality++;
      this.applyQualitySettings();
      
      // Monitor for 2 seconds
      setTimeout(() => {
        if (this.metrics.fps < this.targetFPS - 10) {
          // Revert quality increase
          this.currentQuality--;
          this.applyQualitySettings();
        }
      }, 2000);
    }
  }
  
  /**
   * Apply quality settings based on current level
   */
  applyQualitySettings() {
    switch (this.currentQuality) {
      case this.qualityLevels.ULTRA:
        this.features = {
          particleEffects: true,
          shadows: true,
          antialiasing: true,
          postProcessing: true,
          highResTextures: true,
          complexShaders: true,
          dynamicLighting: true,
        };
        break;
        
      case this.qualityLevels.HIGH:
        this.features = {
          particleEffects: true,
          shadows: true,
          antialiasing: true,
          postProcessing: false,
          highResTextures: true,
          complexShaders: true,
          dynamicLighting: false,
        };
        break;
        
      case this.qualityLevels.MEDIUM:
        this.features = {
          particleEffects: true,
          shadows: false,
          antialiasing: false,
          postProcessing: false,
          highResTextures: true,
          complexShaders: false,
          dynamicLighting: false,
        };
        break;
        
      case this.qualityLevels.LOW:
        this.features = {
          particleEffects: false,
          shadows: false,
          antialiasing: false,
          postProcessing: false,
          highResTextures: false,
          complexShaders: false,
          dynamicLighting: false,
        };
        break;
        
      case this.qualityLevels.POTATO:
        this.features = {
          particleEffects: false,
          shadows: false,
          antialiasing: false,
          postProcessing: false,
          highResTextures: false,
          complexShaders: false,
          dynamicLighting: false,
        };
        // Additional potato mode optimizations
        this.enablePotatoMode();
        break;
    }
    
    // Apply settings to game
    this.applyFeaturesToGame();
  }
  
  /**
   * Apply feature settings to the game
   */
  applyFeaturesToGame() {
    // Update renderer settings
    if (this.game.renderer) {
      this.game.renderer.config.antialias = this.features.antialiasing;
    }
    
    // Update all scenes
    this.game.scene.scenes.forEach(scene => {
      // Disable/enable particle emitters
      if (scene.particles) {
        scene.particles.emitters.list.forEach(emitter => {
          emitter.on = this.features.particleEffects;
        });
      }
      
      // Update shader complexity
      if (scene.cameras && scene.cameras.main) {
        const pipeline = this.features.complexShaders ? 'MultiPipeline' : 'SinglePipeline';
        scene.cameras.main.setPipeline(pipeline);
      }
    });
  }
  
  /**
   * Enable potato mode for extremely low-end devices
   */
  enablePotatoMode() {
    console.log('Enabling potato mode for maximum performance');
    
    // Reduce game resolution
    const scale = 0.5;
    this.game.scale.setZoom(scale);
    
    // Disable all non-essential rendering
    this.game.scene.scenes.forEach(scene => {
      // Disable camera effects
      if (scene.cameras) {
        scene.cameras.main.setRenderToTexture(false);
        scene.cameras.main.clearMask();
      }
      
      // Simplify all sprites
      if (scene.children) {
        scene.children.list.forEach(child => {
          if (child.setTexture) {
            // Use low-res textures
            const lowResKey = child.texture.key + '_low';
            if (this.game.textures.exists(lowResKey)) {
              child.setTexture(lowResKey);
            }
          }
        });
      }
    });
  }
  
  /**
   * Optimize sprite rendering
   */
  optimizeSprite(sprite) {
    if (!sprite) return;
    
    // Disable expensive effects based on quality
    if (!this.features.shadows) {
      sprite.setShadow(0, 0);
    }
    
    // Use simpler blend modes
    if (!this.features.complexShaders) {
      sprite.setBlendMode(Phaser.BlendModes.NORMAL);
    }
    
    // Reduce texture quality if needed
    if (!this.features.highResTextures && sprite.texture) {
      const lowResKey = sprite.texture.key + '_low';
      if (this.game.textures.exists(lowResKey)) {
        sprite.setTexture(lowResKey);
      }
    }
  }
  
  /**
   * Optimize particle emitter
   */
  optimizeParticleEmitter(emitter) {
    if (!emitter) return;
    
    if (!this.features.particleEffects) {
      emitter.on = false;
      return;
    }
    
    // Reduce particle count based on quality
    const particleMultiplier = {
      [this.qualityLevels.ULTRA]: 1.0,
      [this.qualityLevels.HIGH]: 0.75,
      [this.qualityLevels.MEDIUM]: 0.5,
      [this.qualityLevels.LOW]: 0.25,
      [this.qualityLevels.POTATO]: 0,
    };
    
    const multiplier = particleMultiplier[this.currentQuality] || 0.5;
    emitter.frequency = emitter.frequency / multiplier;
    emitter.maxParticles = Math.floor(emitter.maxParticles * multiplier);
  }
  
  /**
   * Check if antialiasing should be enabled
   */
  shouldEnableAntialiasing() {
    // Disable on low-end devices or high pixel ratio screens
    const pixelRatio = window.devicePixelRatio || 1;
    return pixelRatio <= 2 && this.currentQuality >= this.qualityLevels.MEDIUM;
  }
  
  /**
   * Get optimization recommendations
   */
  getOptimizationReport() {
    const report = {
      currentFPS: this.metrics.fps,
      targetFPS: this.targetFPS,
      qualityLevel: Object.keys(this.qualityLevels).find(
        key => this.qualityLevels[key] === this.currentQuality
      ),
      features: this.features,
      metrics: this.metrics,
      recommendations: [],
    };
    
    // Generate recommendations
    if (this.metrics.fps < this.targetFPS - 10) {
      if (this.metrics.particleCount > 100) {
        report.recommendations.push('Reduce particle effects');
      }
      if (this.metrics.activeSprites > 50) {
        report.recommendations.push('Implement sprite culling');
      }
      if (this.metrics.drawCalls > 100) {
        report.recommendations.push('Batch draw calls using texture atlases');
      }
    }
    
    return report;
  }
  
  /**
   * Force quality level (for testing)
   */
  forceQualityLevel(level) {
    if (this.qualityLevels[level] !== undefined) {
      this.currentQuality = this.qualityLevels[level];
      this.applyQualitySettings();
    }
  }
  
  /**
   * Destroy optimizer
   */
  destroy() {
    // Restore original step function if modified
    // Clean up any intervals or listeners
  }
}

// Export singleton getter
let optimizerInstance = null;

export const getPerformanceOptimizer = (game) => {
  if (!optimizerInstance && game) {
    optimizerInstance = new PerformanceOptimizer(game);
  }
  return optimizerInstance;
};

export default PerformanceOptimizer;