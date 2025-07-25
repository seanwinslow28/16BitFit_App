/**
 * Performance Monitor Service
 * Tracks app performance metrics and provides optimization insights
 */

import React from 'react';
import { InteractionManager } from 'react-native';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      fps: [],
      componentLoadTimes: {},
    };
    this.isMonitoring = false;
    this.lastFrameTime = Date.now();
    this.frameCount = 0;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
    
    console.log('[PerformanceMonitor] Started monitoring');
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.fpsInterval) clearInterval(this.fpsInterval);
    if (this.memoryInterval) clearInterval(this.memoryInterval);
    
    console.log('[PerformanceMonitor] Stopped monitoring');
  }

  /**
   * Monitor FPS
   */
  startFPSMonitoring() {
    let frameCount = 0;
    let lastTime = Date.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime);
        this.metrics.fps.push(fps);
        
        // Keep only last 60 measurements
        if (this.metrics.fps.length > 60) {
          this.metrics.fps.shift();
        }

        // Log warning if FPS drops below 30
        if (fps < 30) {
          console.warn(`[PerformanceMonitor] Low FPS detected: ${fps}`);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  startMemoryMonitoring() {
    this.memoryInterval = setInterval(() => {
      if (global.performance && global.performance.memory) {
        const memoryInfo = {
          usedJSHeapSize: global.performance.memory.usedJSHeapSize,
          totalJSHeapSize: global.performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: global.performance.memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };

        this.metrics.memoryUsage.push(memoryInfo);

        // Keep only last 100 measurements
        if (this.metrics.memoryUsage.length > 100) {
          this.metrics.memoryUsage.shift();
        }

        // Log warning if memory usage is high
        const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`[PerformanceMonitor] High memory usage: ${usagePercent.toFixed(2)}%`);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName, startTime) {
    const endTime = Date.now();
    const renderTime = endTime - startTime;

    if (!this.metrics.componentLoadTimes[componentName]) {
      this.metrics.componentLoadTimes[componentName] = [];
    }

    this.metrics.componentLoadTimes[componentName].push(renderTime);

    // Keep only last 20 measurements per component
    if (this.metrics.componentLoadTimes[componentName].length > 20) {
      this.metrics.componentLoadTimes[componentName].shift();
    }

    // Log warning if render time is high
    if (renderTime > 100) {
      console.warn(`[PerformanceMonitor] Slow render detected for ${componentName}: ${renderTime}ms`);
    }

    return renderTime;
  }

  /**
   * Measure async operation time
   */
  async measureAsync(operationName, operation) {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      console.log(`[PerformanceMonitor] ${operationName} completed in ${duration}ms`);
      
      if (duration > 1000) {
        console.warn(`[PerformanceMonitor] Slow operation detected: ${operationName} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[PerformanceMonitor] ${operationName} failed after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    const avgFPS = this.metrics.fps.length > 0
      ? this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length
      : 0;

    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const memoryUsagePercent = latestMemory
      ? (latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit) * 100
      : 0;

    const componentStats = {};
    for (const [component, times] of Object.entries(this.metrics.componentLoadTimes)) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      componentStats[component] = {
        avgRenderTime: avgTime.toFixed(2),
        maxRenderTime: Math.max(...times),
        minRenderTime: Math.min(...times),
      };
    }

    return {
      avgFPS: avgFPS.toFixed(2),
      currentFPS: this.metrics.fps[this.metrics.fps.length - 1] || 0,
      memoryUsagePercent: memoryUsagePercent.toFixed(2),
      memoryUsageMB: latestMemory
        ? (latestMemory.usedJSHeapSize / (1024 * 1024)).toFixed(2)
        : 0,
      componentStats,
    };
  }

  /**
   * Log performance report
   */
  logReport() {
    const report = this.getReport();
    
    console.log('=== Performance Report ===');
    console.log(`Average FPS: ${report.avgFPS}`);
    console.log(`Current FPS: ${report.currentFPS}`);
    console.log(`Memory Usage: ${report.memoryUsagePercent}% (${report.memoryUsageMB} MB)`);
    console.log('Component Render Times:');
    
    for (const [component, stats] of Object.entries(report.componentStats)) {
      console.log(`  ${component}:`);
      console.log(`    Average: ${stats.avgRenderTime}ms`);
      console.log(`    Min: ${stats.minRenderTime}ms`);
      console.log(`    Max: ${stats.maxRenderTime}ms`);
    }
    
    console.log('========================');
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      fps: [],
      componentLoadTimes: {},
    };
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Helper HOC for measuring component performance
export const withPerformanceMonitoring = (Component, componentName) => {
  return (props) => {
    const startTime = Date.now();
    
    React.useEffect(() => {
      performanceMonitor.measureComponentRender(componentName, startTime);
    }, []);
    
    return <Component {...props} />;
  };
};

export default performanceMonitor;