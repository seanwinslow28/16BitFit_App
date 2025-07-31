/**
 * Performance Monitor for 16BitFit
 * Tracks FPS, memory usage, and rendering performance
 * Provides adaptive quality adjustments to maintain 60fps
 */

export class PerformanceMonitor {
  constructor() {
    // Performance metrics
    this.metrics = {
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      drawCalls: 0,
      activeEntities: 0,
      renderedSprites: 0,
      droppedFrames: 0,
      gcCount: 0,
    };
    
    // Performance history
    this.history = {
      fps: new Array(60).fill(60),
      frameTime: new Array(60).fill(16.67),
      memory: new Array(60).fill(0),
    };
    
    // Quality settings
    this.qualitySettings = {
      current: 'high',
      available: ['low', 'medium', 'high'],
      autoAdjust: true,
      lastAdjustTime: 0,
      adjustCooldown: 5000, // 5 seconds between adjustments
    };
    
    // Performance thresholds
    this.thresholds = {
      targetFps: 60,
      minAcceptableFps: 50,
      criticalFps: 30,
      maxMemoryMB: 150,
      warningMemoryMB: 100,
    };
    
    // Frame tracking
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameStartTime = 0;
    this.frameBudget = 16.67; // 60fps target
    
    // Initialize performance observer
    this.initializeObserver();
  }
  
  initializeObserver() {
    // Performance observer not needed for basic FPS tracking
    // We'll use frame-based timing instead
    this.observerInitialized = true;
  }
  
  startFrame() {
    this.frameStartTime = performance.now();
    this.metrics.drawCalls = 0;
    this.metrics.renderedSprites = 0;
  }
  
  endFrame() {
    const now = performance.now();
    const frameTime = now - this.frameStartTime;
    const deltaTime = now - this.lastTime;
    
    // Update frame metrics
    this.metrics.frameTime = frameTime;
    this.metrics.fps = Math.round(1000 / deltaTime);
    
    // Track dropped frames
    if (frameTime > this.frameBudget * 1.5) {
      this.metrics.droppedFrames++;
    }
    
    // Update history
    this.updateHistory();
    
    // Calculate averages
    this.calculateAverages();
    
    // Check for quality adjustments
    if (this.qualitySettings.autoAdjust) {
      this.checkQualityAdjustment();
    }
    
    this.frameCount++;
    this.lastTime = now;
  }
  
  updateHistory() {
    // Rotate history arrays
    this.history.fps.shift();
    this.history.fps.push(this.metrics.fps);
    
    this.history.frameTime.shift();
    this.history.frameTime.push(this.metrics.frameTime);
    
    this.history.memory.shift();
    this.history.memory.push(this.metrics.memoryUsage);
  }
  
  calculateAverages() {
    // Calculate average FPS
    const fpsSum = this.history.fps.reduce((a, b) => a + b, 0);
    this.metrics.avgFps = Math.round(fpsSum / this.history.fps.length);
    
    // Calculate min/max FPS
    this.metrics.minFps = Math.min(...this.history.fps);
    this.metrics.maxFps = Math.max(...this.history.fps);
  }
  
  checkQualityAdjustment() {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.qualitySettings.lastAdjustTime < this.qualitySettings.adjustCooldown) {
      return;
    }
    
    const currentQuality = this.qualitySettings.current;
    const qualityLevels = this.qualitySettings.available;
    const currentIndex = qualityLevels.indexOf(currentQuality);
    
    // Check if we need to decrease quality
    if (this.metrics.avgFps < this.thresholds.minAcceptableFps) {
      if (currentIndex > 0) {
        this.setQuality(qualityLevels[currentIndex - 1]);
        this.qualitySettings.lastAdjustTime = now;
      }
    }
    // Check if we can increase quality
    else if (this.metrics.avgFps >= this.thresholds.targetFps - 5) {
      if (currentIndex < qualityLevels.length - 1) {
        // Only increase if we have headroom
        if (this.metrics.minFps >= this.thresholds.minAcceptableFps) {
          this.setQuality(qualityLevels[currentIndex + 1]);
          this.qualitySettings.lastAdjustTime = now;
        }
      }
    }
  }
  
  setQuality(quality) {
    if (!this.qualitySettings.available.includes(quality)) {
      return;
    }
    
    this.qualitySettings.current = quality;
    
    // Emit quality change event
    if (this.onQualityChange) {
      this.onQualityChange(quality);
    }
    
    console.log(`Performance: Quality adjusted to ${quality}`);
  }
  
  trackDrawCall() {
    this.metrics.drawCalls++;
  }
  
  trackSprite() {
    this.metrics.renderedSprites++;
  }
  
  trackEntity(count) {
    this.metrics.activeEntities = count;
  }
  
  trackMemory(usageMB) {
    this.metrics.memoryUsage = usageMB;
    
    // Check memory warning
    if (usageMB > this.thresholds.warningMemoryMB) {
      console.warn(`Memory usage high: ${usageMB}MB`);
    }
    
    // Check critical memory
    if (usageMB > this.thresholds.maxMemoryMB) {
      console.error(`Memory usage critical: ${usageMB}MB`);
      // Force quality reduction
      if (this.qualitySettings.current !== 'low') {
        this.setQuality('low');
      }
    }
  }
  
  trackGC() {
    this.metrics.gcCount++;
  }
  
  trackMeasure(entry) {
    // Track specific performance measures
    if (entry.name === 'render') {
      // Track render time
    } else if (entry.name === 'physics') {
      // Track physics time
    } else if (entry.name === 'input') {
      // Track input processing time
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      quality: this.qualitySettings.current,
      timestamp: Date.now(),
    };
  }
  
  getReport() {
    return {
      current: this.metrics,
      averages: {
        fps: this.metrics.avgFps,
        frameTime: this.history.frameTime.reduce((a, b) => a + b, 0) / this.history.frameTime.length,
        memory: this.history.memory.reduce((a, b) => a + b, 0) / this.history.memory.length,
      },
      quality: this.qualitySettings,
      warnings: this.getWarnings(),
    };
  }
  
  getWarnings() {
    const warnings = [];
    
    if (this.metrics.avgFps < this.thresholds.minAcceptableFps) {
      warnings.push(`Low FPS: ${this.metrics.avgFps}`);
    }
    
    if (this.metrics.memoryUsage > this.thresholds.warningMemoryMB) {
      warnings.push(`High memory: ${this.metrics.memoryUsage}MB`);
    }
    
    if (this.metrics.droppedFrames > 10) {
      warnings.push(`Dropped frames: ${this.metrics.droppedFrames}`);
    }
    
    if (this.metrics.drawCalls > 100) {
      warnings.push(`High draw calls: ${this.metrics.drawCalls}`);
    }
    
    return warnings;
  }
  
  reset() {
    this.metrics.droppedFrames = 0;
    this.metrics.gcCount = 0;
    this.frameCount = 0;
  }
  
  destroy() {
    // Cleanup if needed
    this.observerInitialized = false;
  }
}

// Quality presets
export const QualityPresets = {
  low: {
    particleLimit: 20,
    effectQuality: 'low',
    shadowsEnabled: false,
    antialiasing: false,
    textureQuality: 0.5,
    maxActiveEffects: 5,
  },
  medium: {
    particleLimit: 50,
    effectQuality: 'medium',
    shadowsEnabled: false,
    antialiasing: true,
    textureQuality: 0.75,
    maxActiveEffects: 10,
  },
  high: {
    particleLimit: 100,
    effectQuality: 'high',
    shadowsEnabled: true,
    antialiasing: true,
    textureQuality: 1.0,
    maxActiveEffects: 20,
  },
};

// Singleton instance
let performanceMonitor = null;

export function getPerformanceMonitor() {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}