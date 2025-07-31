/**
 * PerformanceOptimizationService - Comprehensive 60fps performance management
 * Ensures smooth Street Fighter 2 fighting game experience on mobile devices
 * 
 * Key Features:
 * - Real-time FPS monitoring and optimization
 * - Dynamic quality adjustment
 * - Memory management and leak prevention
 * - Battery usage optimization
 * - Device-specific performance profiles
 */

import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { getPhaserBridge } from '../gameEngine/phaser/integration/PhaserWebViewBridge';
import PerformanceMonitor from '../gameEngine/core/utils/PerformanceMonitor';

// Performance targets
const PERFORMANCE_TARGETS = {
  fps: {
    optimal: 60,
    good: 55,
    acceptable: 50,
    minimum: 30,
  },
  memory: {
    baseline: 100, // MB
    peak: 150, // MB
    warning: 200, // MB
  },
  latency: {
    input: 50, // ms
    render: 16.67, // ms (60fps)
    network: 100, // ms
  },
  battery: {
    drainPerMinute: 0.33, // % (10% per 30 min)
  },
};

// Device performance tiers
const DEVICE_TIERS = {
  flagship: {
    // iPhone 14 Pro, Samsung S23, etc.
    defaultQuality: 'ultra',
    targetFps: 60,
    features: {
      shadows: true,
      particleEffects: true,
      postProcessing: true,
      highResTextures: true,
      advancedShaders: true,
    },
  },
  high: {
    // iPhone 12+, mid-range Android
    defaultQuality: 'high',
    targetFps: 60,
    features: {
      shadows: true,
      particleEffects: true,
      postProcessing: false,
      highResTextures: true,
      advancedShaders: false,
    },
  },
  medium: {
    // Older/budget devices
    defaultQuality: 'medium',
    targetFps: 60,
    features: {
      shadows: false,
      particleEffects: true,
      postProcessing: false,
      highResTextures: false,
      advancedShaders: false,
    },
  },
  low: {
    // Very old/weak devices
    defaultQuality: 'low',
    targetFps: 30,
    features: {
      shadows: false,
      particleEffects: false,
      postProcessing: false,
      highResTextures: false,
      advancedShaders: false,
    },
  },
};

// Quality presets
const QUALITY_PRESETS = {
  ultra: {
    renderScale: 1.0,
    textureQuality: 'high',
    shadowQuality: 'high',
    particleDensity: 1.0,
    effectQuality: 'high',
    antialiasing: true,
    postProcessing: true,
    maxParticles: 500,
    physicsAccuracy: 'high',
  },
  high: {
    renderScale: 1.0,
    textureQuality: 'high',
    shadowQuality: 'medium',
    particleDensity: 0.8,
    effectQuality: 'high',
    antialiasing: false,
    postProcessing: false,
    maxParticles: 300,
    physicsAccuracy: 'medium',
  },
  medium: {
    renderScale: 0.9,
    textureQuality: 'medium',
    shadowQuality: 'low',
    particleDensity: 0.5,
    effectQuality: 'medium',
    antialiasing: false,
    postProcessing: false,
    maxParticles: 150,
    physicsAccuracy: 'medium',
  },
  low: {
    renderScale: 0.75,
    textureQuality: 'low',
    shadowQuality: 'off',
    particleDensity: 0.3,
    effectQuality: 'low',
    antialiasing: false,
    postProcessing: false,
    maxParticles: 50,
    physicsAccuracy: 'low',
  },
  potato: {
    renderScale: 0.5,
    textureQuality: 'lowest',
    shadowQuality: 'off',
    particleDensity: 0,
    effectQuality: 'minimal',
    antialiasing: false,
    postProcessing: false,
    maxParticles: 0,
    physicsAccuracy: 'lowest',
  },
};

class PerformanceOptimizationService {
  constructor() {
    this.bridge = null;
    this.metrics = {
      fps: [],
      memory: [],
      battery: [],
      temperature: [],
    };
    this.currentQuality = 'high';
    this.deviceTier = 'medium';
    this.isOptimizing = false;
    this.lastOptimizationTime = 0;
    this.performanceHistory = [];
    this.memoryWarnings = 0;
    this.thermalState = 'nominal';
    
    // Performance sampling
    this.samplingInterval = null;
    this.samplingRate = 1000; // ms
    
    // Battery monitoring
    this.batteryLevel = 100;
    this.isCharging = false;
    this.batteryMonitor = null;
    
    // Memory monitoring
    this.memoryMonitor = null;
    this.lastMemoryCheck = 0;
    
    // Thermal monitoring
    this.thermalMonitor = null;
    
    // Frame pacing
    this.frameTimer = null;
    this.targetFrameTime = 16.67; // 60fps
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize performance optimization service
   */
  async init() {
    try {
      // Get device information
      await this.detectDeviceTier();
      
      // Load saved preferences
      await this.loadQualityPreferences();
      
      // Set up native monitoring
      this.setupNativeMonitoring();
      
      // Get Phaser bridge reference
      this.bridge = getPhaserBridge();
      
      // Start monitoring
      this.startMonitoring();
      
      console.log('[Performance] Initialized:', {
        deviceTier: this.deviceTier,
        quality: this.currentQuality,
        targetFps: DEVICE_TIERS[this.deviceTier].targetFps,
      });
    } catch (error) {
      console.error('[Performance] Initialization error:', error);
    }
  }
  
  /**
   * Detect device performance tier
   */
  async detectDeviceTier() {
    try {
      const deviceId = DeviceInfo.getDeviceId();
      const totalMemory = await DeviceInfo.getTotalMemory();
      const cpuArch = await DeviceInfo.supportedAbis();
      
      // Device-specific overrides
      const flagshipDevices = ['iPhone14,', 'iPhone15,', 'SM-S901', 'SM-S911', 'SM-S921'];
      const highEndDevices = ['iPhone12,', 'iPhone13,', 'SM-G99', 'Pixel 6', 'Pixel 7'];
      
      // Check if flagship
      if (flagshipDevices.some(d => deviceId.includes(d))) {
        this.deviceTier = 'flagship';
      }
      // Check if high-end
      else if (highEndDevices.some(d => deviceId.includes(d))) {
        this.deviceTier = 'high';
      }
      // Memory-based detection
      else if (totalMemory > 6 * 1024 * 1024 * 1024) { // 6GB+
        this.deviceTier = 'high';
      }
      else if (totalMemory > 4 * 1024 * 1024 * 1024) { // 4GB+
        this.deviceTier = 'medium';
      }
      else {
        this.deviceTier = 'low';
      }
      
      // Store device profile
      this.deviceProfile = {
        id: deviceId,
        tier: this.deviceTier,
        memory: totalMemory,
        arch: cpuArch,
        platform: Platform.OS,
        version: Platform.Version,
      };
    } catch (error) {
      console.warn('[Performance] Device detection failed:', error);
      this.deviceTier = 'medium'; // Safe default
    }
  }
  
  /**
   * Set up native performance monitoring
   */
  setupNativeMonitoring() {
    // Platform-specific monitoring
    if (Platform.OS === 'ios') {
      this.setupIOSMonitoring();
    } else if (Platform.OS === 'android') {
      this.setupAndroidMonitoring();
    }
  }
  
  /**
   * iOS-specific monitoring
   */
  setupIOSMonitoring() {
    try {
      // Thermal state monitoring
      if (NativeModules.ThermalManager) {
        const thermalEmitter = new NativeEventEmitter(NativeModules.ThermalManager);
        this.thermalMonitor = thermalEmitter.addListener('thermalStateDidChange', (state) => {
          this.handleThermalStateChange(state);
        });
      }
      
      // Memory pressure monitoring
      if (NativeModules.MemoryManager) {
        const memoryEmitter = new NativeEventEmitter(NativeModules.MemoryManager);
        this.memoryMonitor = memoryEmitter.addListener('memoryWarning', (level) => {
          this.handleMemoryWarning(level);
        });
      }
    } catch (error) {
      console.warn('[Performance] iOS monitoring setup failed:', error);
    }
  }
  
  /**
   * Android-specific monitoring
   */
  setupAndroidMonitoring() {
    try {
      // Battery monitoring
      if (NativeModules.BatteryManager) {
        const batteryEmitter = new NativeEventEmitter(NativeModules.BatteryManager);
        this.batteryMonitor = batteryEmitter.addListener('batteryStatusChanged', (status) => {
          this.handleBatteryChange(status);
        });
      }
      
      // Memory monitoring via ActivityManager
      if (NativeModules.MemoryInfo) {
        this.memoryMonitor = setInterval(() => {
          NativeModules.MemoryInfo.getMemoryInfo((info) => {
            this.handleMemoryInfo(info);
          });
        }, 5000);
      }
    } catch (error) {
      console.warn('[Performance] Android monitoring setup failed:', error);
    }
  }
  
  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.samplingInterval) return;
    
    this.samplingInterval = setInterval(() => {
      this.samplePerformance();
    }, this.samplingRate);
    
    // Start frame pacing
    this.startFramePacing();
  }
  
  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
    
    this.stopFramePacing();
  }
  
  /**
   * Sample current performance metrics
   */
  async samplePerformance() {
    try {
      // Get FPS from Phaser
      const phaserMetrics = PerformanceMonitor.getPerformanceReport();
      
      // Get memory usage
      const memoryUsage = await this.getMemoryUsage();
      
      // Get battery info
      const batteryInfo = await this.getBatteryInfo();
      
      // Create sample
      const sample = {
        timestamp: Date.now(),
        fps: phaserMetrics.fps,
        frameTime: phaserMetrics.frameTime,
        memory: memoryUsage,
        battery: batteryInfo,
        quality: this.currentQuality,
        thermalState: this.thermalState,
      };
      
      // Update metrics
      this.updateMetrics(sample);
      
      // Check if optimization needed
      this.checkPerformanceThresholds(sample);
      
      // Emit metrics
      if (this.bridge) {
        this.bridge.emit('performanceUpdate', sample);
      }
    } catch (error) {
      console.error('[Performance] Sampling error:', error);
    }
  }
  
  /**
   * Update performance metrics history
   */
  updateMetrics(sample) {
    // Update FPS history
    this.metrics.fps.push(sample.fps);
    if (this.metrics.fps.length > 60) {
      this.metrics.fps.shift();
    }
    
    // Update memory history
    this.metrics.memory.push(sample.memory.used);
    if (this.metrics.memory.length > 60) {
      this.metrics.memory.shift();
    }
    
    // Update battery history
    this.metrics.battery.push(sample.battery.level);
    if (this.metrics.battery.length > 60) {
      this.metrics.battery.shift();
    }
    
    // Store in performance history
    this.performanceHistory.push(sample);
    if (this.performanceHistory.length > 300) { // 5 minutes at 1Hz
      this.performanceHistory.shift();
    }
  }
  
  /**
   * Check performance thresholds and optimize if needed
   */
  checkPerformanceThresholds(sample) {
    const now = Date.now();
    
    // Prevent optimization spam
    if (now - this.lastOptimizationTime < 5000) return;
    
    // Check critical thresholds
    const needsOptimization = 
      sample.fps < PERFORMANCE_TARGETS.fps.acceptable ||
      sample.memory.used > PERFORMANCE_TARGETS.memory.warning ||
      this.thermalState === 'critical' ||
      (sample.battery.level < 20 && !sample.battery.isCharging);
    
    if (needsOptimization) {
      this.optimizePerformance(sample);
    }
    
    // Check if we can increase quality
    const canIncreaseQuality = 
      sample.fps > PERFORMANCE_TARGETS.fps.good &&
      sample.memory.used < PERFORMANCE_TARGETS.memory.baseline &&
      this.thermalState === 'nominal' &&
      this.currentQuality !== 'ultra';
    
    if (canIncreaseQuality && this.getAverageFPS() > 58) {
      this.increaseQuality();
    }
  }
  
  /**
   * Optimize performance based on current metrics
   */
  optimizePerformance(sample) {
    console.log('[Performance] Optimizing due to:', {
      fps: sample.fps,
      memory: sample.memory.used,
      thermal: this.thermalState,
    });
    
    this.isOptimizing = true;
    this.lastOptimizationTime = Date.now();
    
    // Determine optimization level
    let targetQuality = this.currentQuality;
    
    if (sample.fps < PERFORMANCE_TARGETS.fps.minimum) {
      // Critical - drop to potato mode
      targetQuality = 'potato';
    } else if (sample.fps < PERFORMANCE_TARGETS.fps.acceptable) {
      // Poor performance - reduce quality
      targetQuality = this.getNextLowerQuality();
    } else if (sample.memory.used > PERFORMANCE_TARGETS.memory.warning) {
      // Memory pressure - reduce quality
      targetQuality = this.getNextLowerQuality();
    } else if (this.thermalState === 'critical') {
      // Thermal throttling - reduce quality
      targetQuality = 'low';
    }
    
    // Apply new quality
    if (targetQuality !== this.currentQuality) {
      this.setQuality(targetQuality);
    }
    
    // Additional optimizations
    if (sample.fps < PERFORMANCE_TARGETS.fps.acceptable) {
      this.applyEmergencyOptimizations();
    }
    
    this.isOptimizing = false;
  }
  
  /**
   * Apply emergency performance optimizations
   */
  applyEmergencyOptimizations() {
    if (!this.bridge) return;
    
    // Disable non-essential features
    this.bridge.sendCommand('setEmergencyMode', {
      disableParticles: true,
      disableScreenShake: true,
      reduceAnimationFrames: true,
      simplifyCollisions: true,
      disableBackgroundAnimations: true,
    });
    
    // Force garbage collection
    this.forceCleanup();
  }
  
  /**
   * Set quality preset
   */
  async setQuality(quality) {
    if (!QUALITY_PRESETS[quality]) return;
    
    console.log('[Performance] Setting quality:', quality);
    
    this.currentQuality = quality;
    const preset = QUALITY_PRESETS[quality];
    
    // Apply to Phaser
    if (this.bridge) {
      this.bridge.sendCommand('setQualityPreset', preset);
    }
    
    // Apply to React Native
    this.applyReactNativeOptimizations(quality);
    
    // Save preference
    await this.saveQualityPreference(quality);
    
    // Emit quality change
    if (this.bridge) {
      this.bridge.emit('qualityChanged', { quality, preset });
    }
  }
  
  /**
   * Apply React Native specific optimizations
   */
  applyReactNativeOptimizations(quality) {
    // Adjust based on quality
    switch (quality) {
      case 'potato':
      case 'low':
        // Disable animations
        if (NativeModules.UIManager) {
          NativeModules.UIManager.setLayoutAnimationEnabledExperimental(false);
        }
        break;
        
      case 'medium':
        // Reduce animation duration
        if (NativeModules.UIManager) {
          NativeModules.UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        break;
        
      case 'high':
      case 'ultra':
        // Full animations
        if (NativeModules.UIManager) {
          NativeModules.UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        break;
    }
  }
  
  /**
   * Get next lower quality level
   */
  getNextLowerQuality() {
    const qualities = ['ultra', 'high', 'medium', 'low', 'potato'];
    const currentIndex = qualities.indexOf(this.currentQuality);
    
    if (currentIndex < qualities.length - 1) {
      return qualities[currentIndex + 1];
    }
    
    return this.currentQuality;
  }
  
  /**
   * Increase quality if possible
   */
  increaseQuality() {
    const qualities = ['potato', 'low', 'medium', 'high', 'ultra'];
    const currentIndex = qualities.indexOf(this.currentQuality);
    
    if (currentIndex > 0) {
      const newQuality = qualities[currentIndex - 1];
      
      // Check if device supports higher quality
      const devicePreset = DEVICE_TIERS[this.deviceTier].defaultQuality;
      const deviceIndex = qualities.indexOf(devicePreset);
      
      if (currentIndex - 1 >= deviceIndex) {
        this.setQuality(newQuality);
      }
    }
  }
  
  /**
   * Get average FPS from history
   */
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 60;
    
    const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
    return sum / this.metrics.fps.length;
  }
  
  /**
   * Get memory usage
   */
  async getMemoryUsage() {
    try {
      if (Platform.OS === 'ios' && NativeModules.MemoryInfo) {
        const info = await NativeModules.MemoryInfo.getMemoryInfo();
        return {
          used: info.usedMemory / 1024 / 1024, // MB
          available: info.availableMemory / 1024 / 1024, // MB
          total: info.totalMemory / 1024 / 1024, // MB
        };
      } else if (Platform.OS === 'android' && NativeModules.MemoryInfo) {
        const info = await NativeModules.MemoryInfo.getMemoryInfo();
        return {
          used: info.totalPss / 1024, // MB
          available: info.availMem / 1024 / 1024, // MB
          total: info.totalMem / 1024 / 1024, // MB
        };
      }
    } catch (error) {
      // Fallback
      return {
        used: 100,
        available: 100,
        total: 200,
      };
    }
  }
  
  /**
   * Get battery information
   */
  async getBatteryInfo() {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();
      
      return {
        level: Math.round(level * 100),
        isCharging,
      };
    } catch (error) {
      return {
        level: this.batteryLevel,
        isCharging: this.isCharging,
      };
    }
  }
  
  /**
   * Handle thermal state changes (iOS)
   */
  handleThermalStateChange(state) {
    this.thermalState = state.thermalState; // nominal, fair, serious, critical
    
    console.log('[Performance] Thermal state:', this.thermalState);
    
    // React to thermal state
    switch (this.thermalState) {
      case 'serious':
        if (this.currentQuality !== 'low' && this.currentQuality !== 'potato') {
          this.setQuality('low');
        }
        break;
        
      case 'critical':
        if (this.currentQuality !== 'potato') {
          this.setQuality('potato');
        }
        break;
    }
  }
  
  /**
   * Handle memory warnings
   */
  handleMemoryWarning(level) {
    this.memoryWarnings++;
    
    console.warn('[Performance] Memory warning:', level, 'Count:', this.memoryWarnings);
    
    // Force cleanup
    this.forceCleanup();
    
    // Reduce quality if repeated warnings
    if (this.memoryWarnings > 2) {
      const lowerQuality = this.getNextLowerQuality();
      if (lowerQuality !== this.currentQuality) {
        this.setQuality(lowerQuality);
      }
    }
  }
  
  /**
   * Handle battery changes
   */
  handleBatteryChange(status) {
    this.batteryLevel = status.level;
    this.isCharging = status.isCharging;
    
    // Enable power saving mode if low battery
    if (this.batteryLevel < 20 && !this.isCharging) {
      if (this.currentQuality !== 'low' && this.currentQuality !== 'potato') {
        console.log('[Performance] Low battery - enabling power saving');
        this.setQuality('low');
      }
    }
  }
  
  /**
   * Handle memory info updates
   */
  handleMemoryInfo(info) {
    const usedMemory = info.totalPss / 1024; // MB
    
    if (usedMemory > PERFORMANCE_TARGETS.memory.warning) {
      this.handleMemoryWarning('high');
    }
  }
  
  /**
   * Force memory cleanup
   */
  forceCleanup() {
    console.log('[Performance] Forcing cleanup');
    
    // Clear caches
    if (this.bridge) {
      this.bridge.sendCommand('clearCaches', {});
    }
    
    // Trim memory
    if (Platform.OS === 'android' && NativeModules.MemoryManager) {
      NativeModules.MemoryManager.trimMemory();
    }
    
    // Run garbage collector
    if (global.gc) {
      global.gc();
    }
  }
  
  /**
   * Start frame pacing for consistent frame times
   */
  startFramePacing() {
    if (this.frameTimer) return;
    
    let lastFrameTime = Date.now();
    
    this.frameTimer = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastFrameTime;
      
      // Check if we're falling behind
      if (deltaTime > this.targetFrameTime * 1.5) {
        // Skip frame
        if (this.bridge) {
          this.bridge.sendCommand('skipFrame', {});
        }
      }
      
      lastFrameTime = now;
    }, this.targetFrameTime);
  }
  
  /**
   * Stop frame pacing
   */
  stopFramePacing() {
    if (this.frameTimer) {
      clearInterval(this.frameTimer);
      this.frameTimer = null;
    }
  }
  
  /**
   * Load quality preferences
   */
  async loadQualityPreferences() {
    try {
      const saved = await AsyncStorage.getItem('@performance_quality');
      if (saved) {
        const { quality, auto } = JSON.parse(saved);
        this.currentQuality = quality || DEVICE_TIERS[this.deviceTier].defaultQuality;
        this.autoOptimize = auto !== false;
      } else {
        // Use device default
        this.currentQuality = DEVICE_TIERS[this.deviceTier].defaultQuality;
        this.autoOptimize = true;
      }
    } catch (error) {
      console.error('[Performance] Failed to load preferences:', error);
    }
  }
  
  /**
   * Save quality preference
   */
  async saveQualityPreference(quality) {
    try {
      await AsyncStorage.setItem('@performance_quality', JSON.stringify({
        quality,
        auto: this.autoOptimize,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('[Performance] Failed to save preference:', error);
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const avgFPS = this.getAverageFPS();
    const avgMemory = this.metrics.memory.length > 0
      ? this.metrics.memory.reduce((a, b) => a + b, 0) / this.metrics.memory.length
      : 0;
    
    return {
      device: this.deviceProfile,
      current: {
        quality: this.currentQuality,
        fps: avgFPS,
        memory: avgMemory,
        thermal: this.thermalState,
        battery: {
          level: this.batteryLevel,
          isCharging: this.isCharging,
        },
      },
      metrics: {
        fps: {
          current: this.metrics.fps[this.metrics.fps.length - 1] || 0,
          average: avgFPS,
          min: Math.min(...this.metrics.fps),
          max: Math.max(...this.metrics.fps),
        },
        memory: {
          current: this.metrics.memory[this.metrics.memory.length - 1] || 0,
          average: avgMemory,
          peak: Math.max(...this.metrics.memory),
        },
        optimizations: {
          count: this.performanceHistory.filter(s => s.optimized).length,
          lastTime: this.lastOptimizationTime,
        },
      },
      recommendations: this.getRecommendations(),
    };
  }
  
  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const avgFPS = this.getAverageFPS();
    
    if (avgFPS < PERFORMANCE_TARGETS.fps.acceptable) {
      recommendations.push({
        type: 'fps',
        severity: 'high',
        message: `FPS below target (${avgFPS.toFixed(0)} < ${PERFORMANCE_TARGETS.fps.acceptable})`,
        action: 'Consider reducing quality settings',
      });
    }
    
    if (this.memoryWarnings > 0) {
      recommendations.push({
        type: 'memory',
        severity: 'medium',
        message: `Memory warnings detected (${this.memoryWarnings})`,
        action: 'Clear unused assets and reduce texture quality',
      });
    }
    
    if (this.thermalState !== 'nominal') {
      recommendations.push({
        type: 'thermal',
        severity: 'high',
        message: `Device thermal state: ${this.thermalState}`,
        action: 'Let device cool down or reduce quality',
      });
    }
    
    if (this.batteryLevel < 20 && !this.isCharging) {
      recommendations.push({
        type: 'battery',
        severity: 'medium',
        message: `Low battery: ${this.batteryLevel}%`,
        action: 'Connect charger or enable power saving mode',
      });
    }
    
    return recommendations;
  }
  
  /**
   * Clean up and destroy
   */
  destroy() {
    this.stopMonitoring();
    
    // Clean up native listeners
    if (this.thermalMonitor) {
      this.thermalMonitor.remove();
    }
    if (this.memoryMonitor) {
      if (typeof this.memoryMonitor.remove === 'function') {
        this.memoryMonitor.remove();
      } else {
        clearInterval(this.memoryMonitor);
      }
    }
    if (this.batteryMonitor) {
      this.batteryMonitor.remove();
    }
  }
}

// Export singleton instance
export default new PerformanceOptimizationService();