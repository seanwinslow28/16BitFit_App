/**
 * Performance Monitor Service
 * Tracks app performance metrics and identifies bottlenecks
 * Following MetaSystemsAgent patterns for optimization
 */

import { Performance } from 'expo-performance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@16BitFit:performanceMetrics';
const MAX_METRIC_HISTORY = 100;
const PERFORMANCE_THRESHOLD = {
  renderTime: 16, // 60fps = 16ms per frame
  jsThreadTime: 50, // JS thread should respond within 50ms
  memoryUsage: 100, // 100MB memory usage threshold
  bundleSize: 10, // 10MB bundle size threshold
};

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      jsThreadTimes: [],
      memoryUsage: [],
      bundleSize: 0,
      navigationTimes: [],
      apiResponseTimes: [],
      crashes: [],
      errors: [],
    };
    this.isInitialized = false;
    this.startTime = Date.now();
    this.renderStartTime = null;
    this.navigationStartTime = null;
  }

  /**
   * Initialize performance monitoring
   */
  async initialize() {
    try {
      // Load previous metrics
      await this.loadMetrics();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isInitialized = true;
      console.log('PerformanceMonitor initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize PerformanceMonitor:', error);
      return false;
    }
  }

  /**
   * Load metrics from storage
   */
  async loadMetrics() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...data };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  /**
   * Save metrics to storage
   */
  async saveMetrics() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    // Monitor render performance
    this.startRenderMonitoring();
    
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor JavaScript thread
    this.startJSThreadMonitoring();
    
    // Set up error tracking
    this.setupErrorTracking();
  }

  /**
   * Start render performance monitoring
   */
  startRenderMonitoring() {
    // Track render times using InteractionManager
    const { InteractionManager } = require('react-native');
    
    const originalRunAfterInteractions = InteractionManager.runAfterInteractions;
    InteractionManager.runAfterInteractions = (task) => {
      const startTime = Performance.now();
      return originalRunAfterInteractions(() => {
        const endTime = Performance.now();
        this.recordRenderTime(endTime - startTime);
        return task();
      });
    };
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    // Monitor memory usage every 10 seconds
    setInterval(() => {
      if (Performance.memory) {
        const memoryUsage = Performance.memory.usedJSHeapSize / (1024 * 1024); // MB
        this.recordMemoryUsage(memoryUsage);
      }
    }, 10000);
  }

  /**
   * Start JS thread monitoring
   */
  startJSThreadMonitoring() {
    // Monitor JS thread responsiveness
    setInterval(() => {
      const startTime = Performance.now();
      setTimeout(() => {
        const endTime = Performance.now();
        const responseTime = endTime - startTime;
        this.recordJSThreadTime(responseTime);
      }, 0);
    }, 1000);
  }

  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    // Track React Native errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.recordError('ConsoleError', args.join(' '));
      originalConsoleError(...args);
    };

    // Track unhandled promise rejections
    global.addEventListener?.('unhandledrejection', (event) => {
      this.recordError('UnhandledRejection', event.reason);
    });
  }

  /**
   * Record render time
   */
  recordRenderTime(time) {
    this.metrics.renderTimes.push({
      time,
      timestamp: Date.now(),
    });
    
    // Keep only recent metrics
    if (this.metrics.renderTimes.length > MAX_METRIC_HISTORY) {
      this.metrics.renderTimes.shift();
    }
    
    // Check for performance issues
    if (time > PERFORMANCE_THRESHOLD.renderTime) {
      this.recordPerformanceIssue('SlowRender', time);
    }
  }

  /**
   * Record JS thread time
   */
  recordJSThreadTime(time) {
    this.metrics.jsThreadTimes.push({
      time,
      timestamp: Date.now(),
    });
    
    if (this.metrics.jsThreadTimes.length > MAX_METRIC_HISTORY) {
      this.metrics.jsThreadTimes.shift();
    }
    
    if (time > PERFORMANCE_THRESHOLD.jsThreadTime) {
      this.recordPerformanceIssue('SlowJSThread', time);
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(usage) {
    this.metrics.memoryUsage.push({
      usage,
      timestamp: Date.now(),
    });
    
    if (this.metrics.memoryUsage.length > MAX_METRIC_HISTORY) {
      this.metrics.memoryUsage.shift();
    }
    
    if (usage > PERFORMANCE_THRESHOLD.memoryUsage) {
      this.recordPerformanceIssue('HighMemoryUsage', usage);
    }
  }

  /**
   * Record navigation time
   */
  recordNavigationTime(screenName, time) {
    this.metrics.navigationTimes.push({
      screenName,
      time,
      timestamp: Date.now(),
    });
    
    if (this.metrics.navigationTimes.length > MAX_METRIC_HISTORY) {
      this.metrics.navigationTimes.shift();
    }
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint, time, success = true) {
    this.metrics.apiResponseTimes.push({
      endpoint,
      time,
      success,
      timestamp: Date.now(),
    });
    
    if (this.metrics.apiResponseTimes.length > MAX_METRIC_HISTORY) {
      this.metrics.apiResponseTimes.shift();
    }
  }

  /**
   * Record error
   */
  recordError(type, message) {
    this.metrics.errors.push({
      type,
      message,
      timestamp: Date.now(),
    });
    
    if (this.metrics.errors.length > MAX_METRIC_HISTORY) {
      this.metrics.errors.shift();
    }
  }

  /**
   * Record crash
   */
  recordCrash(error) {
    this.metrics.crashes.push({
      error: error.toString(),
      stack: error.stack,
      timestamp: Date.now(),
    });
    
    if (this.metrics.crashes.length > MAX_METRIC_HISTORY) {
      this.metrics.crashes.shift();
    }
  }

  /**
   * Record performance issue
   */
  recordPerformanceIssue(type, value) {
    console.warn(`Performance issue detected: ${type} = ${value}`);
    
    // Could send to analytics service here
    this.recordError('PerformanceIssue', `${type}: ${value}`);
  }

  /**
   * Start navigation timing
   */
  startNavigation(screenName) {
    this.navigationStartTime = {
      screenName,
      time: Performance.now(),
    };
  }

  /**
   * End navigation timing
   */
  endNavigation() {
    if (this.navigationStartTime) {
      const endTime = Performance.now();
      const navigationTime = endTime - this.navigationStartTime.time;
      this.recordNavigationTime(this.navigationStartTime.screenName, navigationTime);
      this.navigationStartTime = null;
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction(fn, name) {
    return async (...args) => {
      const startTime = Performance.now();
      try {
        const result = await fn(...args);
        const endTime = Performance.now();
        const executionTime = endTime - startTime;
        
        console.log(`Function ${name} executed in ${executionTime.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const endTime = Performance.now();
        const executionTime = endTime - startTime;
        
        console.log(`Function ${name} failed after ${executionTime.toFixed(2)}ms`);
        this.recordError('FunctionError', `${name}: ${error.message}`);
        
        throw error;
      }
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {
      appUptime: Date.now() - this.startTime,
      renderTimes: {
        average: this.getAverage(this.metrics.renderTimes, 'time'),
        max: this.getMax(this.metrics.renderTimes, 'time'),
        slowFrames: this.metrics.renderTimes.filter(r => r.time > PERFORMANCE_THRESHOLD.renderTime).length,
      },
      jsThreadTimes: {
        average: this.getAverage(this.metrics.jsThreadTimes, 'time'),
        max: this.getMax(this.metrics.jsThreadTimes, 'time'),
        slowResponses: this.metrics.jsThreadTimes.filter(j => j.time > PERFORMANCE_THRESHOLD.jsThreadTime).length,
      },
      memoryUsage: {
        current: this.metrics.memoryUsage.length > 0 ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].usage : 0,
        average: this.getAverage(this.metrics.memoryUsage, 'usage'),
        max: this.getMax(this.metrics.memoryUsage, 'usage'),
      },
      navigationTimes: {
        average: this.getAverage(this.metrics.navigationTimes, 'time'),
        max: this.getMax(this.metrics.navigationTimes, 'time'),
      },
      apiResponseTimes: {
        average: this.getAverage(this.metrics.apiResponseTimes, 'time'),
        max: this.getMax(this.metrics.apiResponseTimes, 'time'),
        successRate: this.getSuccessRate(this.metrics.apiResponseTimes),
      },
      errors: this.metrics.errors.length,
      crashes: this.metrics.crashes.length,
    };
    
    return stats;
  }

  /**
   * Get average value from array
   */
  getAverage(array, key) {
    if (array.length === 0) return 0;
    return array.reduce((sum, item) => sum + item[key], 0) / array.length;
  }

  /**
   * Get max value from array
   */
  getMax(array, key) {
    if (array.length === 0) return 0;
    return Math.max(...array.map(item => item[key]));
  }

  /**
   * Get success rate
   */
  getSuccessRate(array) {
    if (array.length === 0) return 100;
    const successCount = array.filter(item => item.success).length;
    return (successCount / array.length) * 100;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const stats = this.getPerformanceStats();
    
    return {
      ...stats,
      recommendations: this.getRecommendations(stats),
      timestamp: Date.now(),
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(stats) {
    const recommendations = [];
    
    if (stats.renderTimes.slowFrames > 10) {
      recommendations.push('Consider optimizing render performance - frequent slow frames detected');
    }
    
    if (stats.jsThreadTimes.slowResponses > 5) {
      recommendations.push('JavaScript thread appears overloaded - consider optimizing heavy operations');
    }
    
    if (stats.memoryUsage.max > PERFORMANCE_THRESHOLD.memoryUsage) {
      recommendations.push('High memory usage detected - check for memory leaks');
    }
    
    if (stats.navigationTimes.average > 300) {
      recommendations.push('Navigation times are slow - consider optimizing screen transitions');
    }
    
    if (stats.apiResponseTimes.successRate < 95) {
      recommendations.push('API success rate is low - improve error handling');
    }
    
    if (stats.errors > 20) {
      recommendations.push('High error count - investigate and fix common issues');
    }
    
    return recommendations;
  }

  /**
   * Clear all metrics
   */
  async clearMetrics() {
    this.metrics = {
      renderTimes: [],
      jsThreadTimes: [],
      memoryUsage: [],
      bundleSize: 0,
      navigationTimes: [],
      apiResponseTimes: [],
      crashes: [],
      errors: [],
    };
    
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      ...this.metrics,
      stats: this.getPerformanceStats(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
      },
      timestamp: Date.now(),
    };
  }
}

export default new PerformanceMonitor();