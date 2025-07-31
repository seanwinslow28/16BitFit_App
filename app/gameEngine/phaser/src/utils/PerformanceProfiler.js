/**
 * Performance Profiler - Real-time performance monitoring and optimization
 * Tracks FPS, memory usage, and automatically adjusts quality settings
 */

import { GameConfig } from '../config/GameConfig';

export default class PerformanceProfiler {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      frameTime: 16.67,
      memory: 0,
      drawCalls: 0,
      activeTextures: 0
    };
    
    // FPS history for averaging
    this.fpsHistory = new Array(60).fill(60);
    this.historyIndex = 0;
    
    // Quality auto-adjustment
    this.qualityLevel = GameConfig.performance.defaultQuality || 'high';
    this.autoAdjust = true;
    this.adjustmentCooldown = 0;
    
    // Performance thresholds
    this.thresholds = {
      critical: 30,
      low: 45,
      target: 55,
      optimal: 60
    };
    
    // Debug display
    this.debugDisplay = null;
    this.showDebug = false;
  }

  create() {
    // Create debug display if needed
    if (this.showDebug) {
      this.createDebugDisplay();
    }
    
    // Start monitoring
    this.startMonitoring();
  }

  startMonitoring() {
    // Update metrics every frame
    this.scene.events.on('update', this.update, this);
    
    // Detailed metrics every second
    this.metricsTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.collectDetailedMetrics,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (!this.enabled) return;
    
    // Calculate FPS
    const fps = 1000 / delta;
    this.metrics.fps = Math.round(fps);
    this.metrics.frameTime = delta;
    
    // Update FPS history
    this.fpsHistory[this.historyIndex] = fps;
    this.historyIndex = (this.historyIndex + 1) % this.fpsHistory.length;
    
    // Calculate average FPS
    this.metrics.avgFps = Math.round(
      this.fpsHistory.reduce((sum, val) => sum + val, 0) / this.fpsHistory.length
    );
    
    // Update min/max
    this.metrics.minFps = Math.min(this.metrics.minFps, fps);
    this.metrics.maxFps = Math.max(this.metrics.maxFps, fps);
    
    // Auto-adjust quality if needed
    if (this.autoAdjust && this.adjustmentCooldown <= 0) {
      this.checkQualityAdjustment();
    }
    
    if (this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--;
    }
    
    // Update debug display
    if (this.showDebug && this.debugDisplay) {
      this.updateDebugDisplay();
    }
  }

  collectDetailedMetrics() {
    // Memory usage (if available)
    if (performance.memory) {
      this.metrics.memory = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      );
    }
    
    // Texture count
    this.metrics.activeTextures = this.scene.textures.list.size;
    
    // Draw calls (approximate)
    this.metrics.drawCalls = this.estimateDrawCalls();
    
    // Send metrics to React Native
    this.sendMetricsToReactNative();
    
    // Log warnings if needed
    this.checkPerformanceWarnings();
  }

  estimateDrawCalls() {
    let drawCalls = 0;
    
    // Count visible game objects
    this.scene.children.list.forEach(child => {
      if (child.visible && child.alpha > 0) {
        drawCalls++;
      }
    });
    
    // Add particle systems
    if (this.scene.effectsManager) {
      drawCalls += 3; // Approximate for active particle systems
    }
    
    return drawCalls;
  }

  checkQualityAdjustment() {
    const avgFps = this.metrics.avgFps;
    const currentQuality = this.qualityLevel;
    
    // Define quality levels
    const qualityLevels = ['ultra', 'high', 'medium', 'low'];
    const currentIndex = qualityLevels.indexOf(currentQuality);
    
    // Check if we need to lower quality
    if (avgFps < this.thresholds.low && currentIndex < qualityLevels.length - 1) {
      this.adjustQuality(qualityLevels[currentIndex + 1]);
      this.adjustmentCooldown = 300; // 5 seconds at 60fps
    }
    // Check if we can raise quality
    else if (avgFps >= this.thresholds.optimal && currentIndex > 0) {
      // Only raise if we've been stable for a while
      if (this.metrics.minFps > this.thresholds.target) {
        this.adjustQuality(qualityLevels[currentIndex - 1]);
        this.adjustmentCooldown = 300;
      }
    }
  }

  adjustQuality(newQuality) {
    console.log(`Adjusting quality from ${this.qualityLevel} to ${newQuality}`);
    
    const oldQuality = this.qualityLevel;
    this.qualityLevel = newQuality;
    
    // Apply quality settings
    const settings = GameConfig.performance.qualityLevels[newQuality];
    
    // Update particle effects
    if (this.scene.effectsManager) {
      this.scene.effectsManager.setQuality(newQuality);
    }
    
    // Update render settings
    this.updateRenderSettings(settings);
    
    // Notify game of quality change
    this.scene.events.emit('qualityChanged', { oldQuality, newQuality });
    
    // Send to React Native
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'QUALITY_CHANGED',
        payload: { quality: newQuality, reason: 'auto_adjust' }
      }));
    }
  }

  updateRenderSettings(settings) {
    // Update game render settings based on quality
    const renderer = this.scene.game.renderer;
    
    if (renderer) {
      // Pixel art scaling
      renderer.config.pixelArt = settings.resolution < 1.0;
      
      // Antialias
      renderer.config.antialias = settings.particles > 0.5;
    }
    
    // Update physics precision
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.timeScale = settings.shadows ? 1 : 0.95;
    }
  }

  checkPerformanceWarnings() {
    // Critical FPS warning
    if (this.metrics.avgFps < this.thresholds.critical) {
      console.warn(`Critical performance: ${this.metrics.avgFps} FPS`);
      
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PERFORMANCE_WARNING',
          payload: {
            fps: this.metrics.avgFps,
            memory: this.metrics.memory,
            severity: 'critical'
          }
        }));
      }
    }
    
    // Memory warning
    if (this.metrics.memory > 150) {
      console.warn(`High memory usage: ${this.metrics.memory}MB`);
    }
  }

  sendMetricsToReactNative() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PERFORMANCE_METRICS',
        payload: {
          fps: this.metrics.avgFps,
          memory: this.metrics.memory,
          quality: this.qualityLevel,
          drawCalls: this.metrics.drawCalls
        }
      }));
    }
  }

  // Debug display
  createDebugDisplay() {
    const style = {
      font: '12px monospace',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    };
    
    this.debugDisplay = this.scene.add.text(10, 10, '', style);
    this.debugDisplay.setDepth(9999);
    this.debugDisplay.setScrollFactor(0);
  }

  updateDebugDisplay() {
    const text = [
      `FPS: ${this.metrics.fps} (avg: ${this.metrics.avgFps})`,
      `Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`,
      `Memory: ${this.metrics.memory}MB`,
      `Quality: ${this.qualityLevel}`,
      `Textures: ${this.metrics.activeTextures}`,
      `Draw Calls: ${this.metrics.drawCalls}`
    ].join('\n');
    
    this.debugDisplay.setText(text);
    
    // Color code FPS
    if (this.metrics.fps < this.thresholds.critical) {
      this.debugDisplay.setColor('#ff0000');
    } else if (this.metrics.fps < this.thresholds.low) {
      this.debugDisplay.setColor('#ffff00');
    } else {
      this.debugDisplay.setColor('#00ff00');
    }
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
    
    if (this.showDebug && !this.debugDisplay) {
      this.createDebugDisplay();
    } else if (!this.showDebug && this.debugDisplay) {
      this.debugDisplay.destroy();
      this.debugDisplay = null;
    }
  }

  // Manual quality control
  setQuality(quality) {
    if (this.qualityLevel !== quality) {
      this.autoAdjust = false; // Disable auto-adjust when manually set
      this.adjustQuality(quality);
    }
  }

  enableAutoAdjust() {
    this.autoAdjust = true;
  }

  disableAutoAdjust() {
    this.autoAdjust = false;
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Performance report
  generateReport() {
    return {
      summary: {
        avgFps: this.metrics.avgFps,
        minFps: this.metrics.minFps,
        maxFps: this.metrics.maxFps,
        quality: this.qualityLevel,
        memory: this.metrics.memory
      },
      recommendations: this.getRecommendations()
    };
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.metrics.avgFps < this.thresholds.low) {
      recommendations.push('Consider lowering quality settings');
    }
    
    if (this.metrics.memory > 120) {
      recommendations.push('High memory usage detected');
    }
    
    if (this.metrics.drawCalls > 100) {
      recommendations.push('Consider optimizing draw calls');
    }
    
    return recommendations;
  }

  // Cleanup
  destroy() {
    if (this.metricsTimer) {
      this.metricsTimer.destroy();
    }
    
    if (this.debugDisplay) {
      this.debugDisplay.destroy();
    }
    
    this.scene.events.off('update', this.update, this);
  }
}