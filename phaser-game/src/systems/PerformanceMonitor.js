/**
 * Performance Monitor for 16BitFit
 * Ensures 60fps gameplay and dynamic quality adjustment
 */

import { QUALITY_PRESETS } from '../config/gameConfig';
import { bridge } from '../bridge/WebViewBridge';

export class PerformanceMonitor {
  constructor(game) {
    this.game = game;
    this.currentQuality = 'HIGH';
    this.targetFPS = 60;
    this.fpsHistory = [];
    this.historySize = 60; // 1 second of data
    
    // Performance thresholds
    this.thresholds = {
      upgrade: {
        fps: 58,
        duration: 5000 // 5 seconds of good performance
      },
      downgrade: {
        fps: 50,
        duration: 2000 // 2 seconds of poor performance
      },
      critical: {
        fps: 30,
        duration: 500 // 0.5 seconds triggers immediate downgrade
      }
    };
    
    // Monitoring state
    this.isMonitoring = false;
    this.lastQualityChange = 0;
    this.qualityChangeTimeout = 10000; // 10 seconds between changes
    
    // Performance metrics
    this.metrics = {
      avgFPS: 0,
      minFPS: 60,
      maxFPS: 60,
      drawCalls: 0,
      textureCount: 0,
      triangles: 0,
      lastFrameTime: 0,
      deltaTime: 0,
      memoryUsage: 0
    };
    
    // Frame time analysis
    this.frameTimes = [];
    this.maxFrameTime = 1000 / 30; // 33ms (30fps threshold)
    
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor FPS every frame
    this.game.events.on('preupdate', this.onPreUpdate, this);
    this.game.events.on('postupdate', this.onPostUpdate, this);
    
    // Periodic quality evaluation
    this.evaluationInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.evaluatePerformance();
      }
    }, 1000);
    
    // Memory monitoring (less frequent)
    this.memoryInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.checkMemoryUsage();
      }
    }, 5000);
  }

  start() {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // Apply initial quality settings
    this.applyQualityPreset(this.currentQuality);
    
    bridge.send('PERFORMANCE_MONITORING_STARTED', {
      quality: this.currentQuality,
      targetFPS: this.targetFPS
    });
  }

  stop() {
    this.isMonitoring = false;
    clearInterval(this.evaluationInterval);
    clearInterval(this.memoryInterval);
  }

  onPreUpdate(time, delta) {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    this.metrics.deltaTime = delta;
    
    // Track frame time
    const frameTime = now - this.lastFrameTime;
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > this.historySize) {
      this.frameTimes.shift();
    }
    
    this.lastFrameTime = now;
  }

  onPostUpdate() {
    if (!this.isMonitoring) return;
    
    // Get current FPS
    const currentFPS = this.game.loop.actualFps;
    
    // Update FPS history
    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
    
    // Update metrics
    this.updateMetrics();
    
    // Check for critical performance issues
    if (currentFPS < this.thresholds.critical.fps) {
      this.handleCriticalPerformance();
    }
  }

  updateMetrics() {
    if (this.fpsHistory.length === 0) return;
    
    // Calculate average FPS
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    this.metrics.avgFPS = sum / this.fpsHistory.length;
    
    // Min/Max FPS
    this.metrics.minFPS = Math.min(...this.fpsHistory);
    this.metrics.maxFPS = Math.max(...this.fpsHistory);
    
    // Renderer stats
    if (this.game.renderer.type === Phaser.WEBGL) {
      const renderer = this.game.renderer;
      this.metrics.drawCalls = renderer.drawingBufferHeight;
      this.metrics.textureCount = renderer.textureIndexes.length;
    }
  }

  evaluatePerformance() {
    const now = Date.now();
    
    // Don't change quality too frequently
    if (now - this.lastQualityChange < this.qualityChangeTimeout) {
      return;
    }
    
    const avgFPS = this.metrics.avgFPS;
    const qualityLevels = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW', 'POTATO'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    // Check if we should upgrade quality
    if (avgFPS >= this.thresholds.upgrade.fps && currentIndex > 0) {
      this.changeQuality(qualityLevels[currentIndex - 1]);
    }
    // Check if we should downgrade quality
    else if (avgFPS < this.thresholds.downgrade.fps && currentIndex < qualityLevels.length - 1) {
      this.changeQuality(qualityLevels[currentIndex + 1]);
    }
    
    // Send performance report
    this.sendPerformanceReport();
  }

  handleCriticalPerformance() {
    // Immediate action for very low FPS
    const qualityLevels = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW', 'POTATO'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      // Skip cooldown for critical performance
      this.lastQualityChange = 0;
      this.changeQuality(qualityLevels[Math.min(currentIndex + 2, qualityLevels.length - 1)]);
      
      bridge.send('CRITICAL_PERFORMANCE', {
        fps: this.game.loop.actualFps,
        quality: this.currentQuality
      });
    }
  }

  changeQuality(newQuality) {
    if (newQuality === this.currentQuality) return;
    
    const oldQuality = this.currentQuality;
    this.currentQuality = newQuality;
    this.lastQualityChange = Date.now();
    
    // Apply new quality settings
    this.applyQualityPreset(newQuality);
    
    bridge.send('QUALITY_CHANGED', {
      from: oldQuality,
      to: newQuality,
      reason: 'performance',
      metrics: this.getPerformanceSnapshot()
    });
  }

  applyQualityPreset(quality) {
    const preset = QUALITY_PRESETS[quality];
    if (!preset) return;
    
    // Apply to all active scenes
    this.game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
        this.applySceneQuality(scene, preset);
      }
    });
    
    // Global renderer settings
    if (this.game.renderer.type === Phaser.WEBGL) {
      const renderer = this.game.renderer;
      
      // Adjust batch size based on quality
      if (quality === 'POTATO') {
        renderer.config.batchSize = 2048;
      } else if (quality === 'LOW') {
        renderer.config.batchSize = 3072;
      } else {
        renderer.config.batchSize = 4096;
      }
    }
  }

  applySceneQuality(scene, preset) {
    // Particle effects
    if (scene.particleManager) {
      scene.particleManager.setMaxParticles(preset.particleLimit);
    }
    
    // Shadow rendering
    if (scene.shadowRenderer) {
      scene.shadowRenderer.setQuality(preset.shadowQuality);
    }
    
    // Background complexity
    if (scene.background) {
      scene.background.setComplexity(preset.backgroundComplexity);
    }
    
    // Effects toggle
    if (scene.effectsManager) {
      scene.effectsManager.setEnabled(preset.effectsEnabled);
    }
    
    // Sprite limit
    if (scene.spritePool) {
      scene.spritePool.setMaxSprites(preset.maxSprites);
    }
  }

  checkMemoryUsage() {
    if (!performance.memory) return;
    
    const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    this.metrics.memoryUsage = memoryMB;
    
    // Warn if memory usage is high
    if (memoryMB > 200) {
      bridge.send('HIGH_MEMORY_WARNING', {
        usage: memoryMB,
        limit: 200
      });
      
      // Trigger texture cleanup
      if (this.game.scene.getScene('BattleScene')) {
        const battleScene = this.game.scene.getScene('BattleScene');
        if (battleScene.assetManager) {
          battleScene.assetManager.performMemoryCleanup();
        }
      }
    }
  }

  sendPerformanceReport() {
    bridge.send('PERFORMANCE_REPORT', {
      metrics: this.getPerformanceSnapshot(),
      quality: this.currentQuality,
      timestamp: Date.now()
    });
  }

  getPerformanceSnapshot() {
    return {
      fps: {
        current: this.game.loop.actualFps,
        average: this.metrics.avgFPS,
        min: this.metrics.minFPS,
        max: this.metrics.maxFPS
      },
      frameTime: {
        average: this.calculateAverageFrameTime(),
        max: Math.max(...this.frameTimes),
        percentile95: this.calculate95thPercentile()
      },
      renderer: {
        drawCalls: this.metrics.drawCalls,
        textureCount: this.metrics.textureCount,
        type: this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'
      },
      memory: {
        usage: this.metrics.memoryUsage
      }
    };
  }

  calculateAverageFrameTime() {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  calculate95thPercentile() {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  // Public API
  
  setQualityPreset(quality) {
    if (QUALITY_PRESETS[quality]) {
      this.currentQuality = quality;
      this.applyQualityPreset(quality);
      this.lastQualityChange = Date.now();
    }
  }

  getMetrics() {
    return this.metrics;
  }

  forceGarbageCollection() {
    // Trigger cleanup in all scenes
    this.game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive() && scene.cleanup) {
        scene.cleanup();
      }
    });
    
    // Run browser GC if available
    if (window.gc) {
      window.gc();
    }
  }

  destroy() {
    this.stop();
    this.game.events.off('preupdate', this.onPreUpdate, this);
    this.game.events.off('postupdate', this.onPostUpdate, this);
  }
}