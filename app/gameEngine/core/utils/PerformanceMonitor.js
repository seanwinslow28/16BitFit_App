/**
 * Performance Monitor
 * Tracks FPS and performance metrics to ensure 60fps with evolution effects
 */

class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameTime = 16.67; // Target for 60fps
    this.lastFrameTime = 0;
    this.frameTimes = [];
    this.maxSamples = 60;
    this.performanceData = {
      renderTime: 0,
      updateTime: 0,
      particleCount: 0,
      effectCount: 0,
      drawCalls: 0,
    };
    this.qualityLevel = 'high';
    this.autoAdjust = true;
    this.adjustmentThreshold = {
      low: 30,    // Below 30fps, reduce quality
      medium: 45, // Below 45fps, reduce some effects
      high: 55,   // Above 55fps, can increase quality
    };
  }

  /**
   * Start frame timing
   */
  startFrame() {
    this.frameStartTime = performance.now();
  }

  /**
   * End frame timing and calculate FPS
   */
  endFrame() {
    const currentTime = performance.now();
    const frameTime = currentTime - this.frameStartTime;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Calculate average FPS
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgFrameTime);
    this.frameTime = avgFrameTime;

    // Auto-adjust quality if enabled
    if (this.autoAdjust) {
      this.adjustQuality();
    }

    this.lastFrameTime = currentTime;
  }

  /**
   * Track render performance
   */
  trackRender(startTime) {
    this.performanceData.renderTime = performance.now() - startTime;
  }

  /**
   * Track update performance
   */
  trackUpdate(startTime) {
    this.performanceData.updateTime = performance.now() - startTime;
  }

  /**
   * Track particle count
   */
  trackParticles(count) {
    this.performanceData.particleCount = count;
  }

  /**
   * Track active effects
   */
  trackEffects(count) {
    this.performanceData.effectCount = count;
  }

  /**
   * Track draw calls
   */
  trackDrawCalls(count) {
    this.performanceData.drawCalls = count;
  }

  /**
   * Auto-adjust quality based on FPS
   */
  adjustQuality() {
    const currentFPS = this.fps;
    let newQuality = this.qualityLevel;

    if (currentFPS < this.adjustmentThreshold.low) {
      newQuality = 'low';
    } else if (currentFPS < this.adjustmentThreshold.medium) {
      newQuality = 'medium';
    } else if (currentFPS > this.adjustmentThreshold.high) {
      newQuality = 'high';
    }

    if (newQuality !== this.qualityLevel) {
      this.qualityLevel = newQuality;
      this.applyQualitySettings(newQuality);
    }
  }

  /**
   * Apply quality settings based on performance
   */
  applyQualitySettings(quality) {
    const settings = {
      low: {
        maxParticles: 50,
        particleDetail: 'simple',
        auraLayers: 1,
        shadowEffects: false,
        glowEffects: false,
        screenShake: false,
        hitEffectScale: 0.5,
        evolutionEffects: 'minimal',
      },
      medium: {
        maxParticles: 100,
        particleDetail: 'normal',
        auraLayers: 2,
        shadowEffects: true,
        glowEffects: false,
        screenShake: true,
        hitEffectScale: 0.75,
        evolutionEffects: 'standard',
      },
      high: {
        maxParticles: 200,
        particleDetail: 'detailed',
        auraLayers: 4,
        shadowEffects: true,
        glowEffects: true,
        screenShake: true,
        hitEffectScale: 1.0,
        evolutionEffects: 'full',
      },
    };

    return settings[quality] || settings.medium;
  }

  /**
   * Get current quality settings
   */
  getQualitySettings() {
    return this.applyQualitySettings(this.qualityLevel);
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      qualityLevel: this.qualityLevel,
      metrics: {
        renderTime: this.performanceData.renderTime.toFixed(2),
        updateTime: this.performanceData.updateTime.toFixed(2),
        particleCount: this.performanceData.particleCount,
        effectCount: this.performanceData.effectCount,
        drawCalls: this.performanceData.drawCalls,
      },
      recommendations: this.getRecommendations(),
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.fps < 30) {
      recommendations.push('Critical: FPS below 30. Reduce particle effects and disable non-essential visuals.');
    }

    if (this.performanceData.particleCount > 150) {
      recommendations.push('High particle count detected. Consider reducing particle emissions.');
    }

    if (this.performanceData.renderTime > 10) {
      recommendations.push('Render time exceeds 10ms. Optimize draw calls and reduce visual complexity.');
    }

    if (this.frameTime > 20) {
      recommendations.push('Frame time exceeds target. Consider reducing evolution effect complexity.');
    }

    return recommendations;
  }

  /**
   * Reset performance data
   */
  reset() {
    this.frameTimes = [];
    this.performanceData = {
      renderTime: 0,
      updateTime: 0,
      particleCount: 0,
      effectCount: 0,
      drawCalls: 0,
    };
  }

  /**
   * Enable/disable auto quality adjustment
   */
  setAutoAdjust(enabled) {
    this.autoAdjust = enabled;
  }
  
  /**
   * Start performance monitoring
   */
  start() {
    this.startTime = performance.now();
    this.isMonitoring = true;
  }
  
  /**
   * Record a frame for WebView bridge
   */
  recordFrame() {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const frameTime = now - (this.lastRecordTime || now);
    this.lastRecordTime = now;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    // Update FPS calculation
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgFrameTime);
    this.frameTime = avgFrameTime;
  }

  /**
   * Manually set quality level
   */
  setQualityLevel(level) {
    if (['low', 'medium', 'high'].includes(level)) {
      this.qualityLevel = level;
      this.autoAdjust = false;
    }
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable() {
    return this.fps >= 55 && this.frameTime <= 18;
  }

  /**
   * Get evolution effect budget based on performance
   */
  getEvolutionEffectBudget() {
    const budgets = {
      low: {
        maxAuraIntensity: 0.3,
        maxParticlesPerEffect: 10,
        enableLightning: false,
        enableDistortion: false,
        enableTransformations: false,
      },
      medium: {
        maxAuraIntensity: 0.6,
        maxParticlesPerEffect: 20,
        enableLightning: true,
        enableDistortion: false,
        enableTransformations: true,
      },
      high: {
        maxAuraIntensity: 1.0,
        maxParticlesPerEffect: 50,
        enableLightning: true,
        enableDistortion: true,
        enableTransformations: true,
      },
    };

    return budgets[this.qualityLevel] || budgets.medium;
  }
}

// Export singleton instance
export default new PerformanceMonitor();