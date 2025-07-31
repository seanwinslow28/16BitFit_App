/**
 * BatteryOptimizationService - Ensures <10% battery drain per 30-minute session
 * Optimizes power consumption for mobile fighting game experience
 */

import { Platform, NativeModules, DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getPhaserBridge } from '../gameEngine/phaser/integration/PhaserWebViewBridge';

// Power consumption targets
const POWER_TARGETS = {
  maxDrainPer30Min: 10, // 10% max drain
  maxDrainPerMinute: 0.33, // %
  thermalThreshold: 40, // Celsius
  cpuTarget: 50, // % average
  gpuTarget: 60, // % average
};

// Power profiles
const POWER_PROFILES = {
  performance: {
    name: 'Performance',
    fps: 60,
    renderScale: 1.0,
    particleQuality: 'high',
    soundQuality: 'high',
    vibration: true,
    backgroundTasks: true,
    brightness: 100,
  },
  balanced: {
    name: 'Balanced',
    fps: 60,
    renderScale: 0.9,
    particleQuality: 'medium',
    soundQuality: 'medium',
    vibration: true,
    backgroundTasks: false,
    brightness: 80,
  },
  batterySaver: {
    name: 'Battery Saver',
    fps: 30,
    renderScale: 0.75,
    particleQuality: 'low',
    soundQuality: 'low',
    vibration: false,
    backgroundTasks: false,
    brightness: 60,
  },
  ultraSaver: {
    name: 'Ultra Saver',
    fps: 30,
    renderScale: 0.5,
    particleQuality: 'off',
    soundQuality: 'minimal',
    vibration: false,
    backgroundTasks: false,
    brightness: 40,
  },
};

class BatteryOptimizationService {
  constructor() {
    this.bridge = null;
    this.currentProfile = 'balanced';
    this.isMonitoring = false;
    this.sessionStartTime = null;
    this.sessionStartBattery = null;
    this.batteryHistory = [];
    this.temperatureHistory = [];
    this.powerMetrics = {
      drainRate: 0,
      estimatedTimeRemaining: 0,
      temperature: 0,
      isCharging: false,
      batteryLevel: 100,
    };
    this.listeners = [];
  }
  
  /**
   * Initialize battery optimization
   */
  async init() {
    try {
      this.bridge = getPhaserBridge();
      
      // Get initial battery state
      await this.updateBatteryStatus();
      
      // Set up monitoring
      this.setupBatteryMonitoring();
      
      // Apply initial profile
      await this.applyPowerProfile(this.currentProfile);
      
      console.log('[Battery] Initialized with profile:', this.currentProfile);
    } catch (error) {
      console.error('[Battery] Initialization error:', error);
    }
  }
  
  /**
   * Start a gaming session
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.sessionStartBattery = this.powerMetrics.batteryLevel;
    this.batteryHistory = [{
      timestamp: this.sessionStartTime,
      level: this.sessionStartBattery,
    }];
    this.isMonitoring = true;
    
    console.log('[Battery] Session started at', this.sessionStartBattery + '%');
    
    // Start monitoring
    this.startMonitoring();
  }
  
  /**
   * End gaming session
   */
  endSession() {
    this.isMonitoring = false;
    
    if (this.sessionStartTime && this.sessionStartBattery !== null) {
      const duration = Date.now() - this.sessionStartTime;
      const drain = this.sessionStartBattery - this.powerMetrics.batteryLevel;
      
      const report = {
        duration: duration / 1000 / 60, // minutes
        batteryDrain: drain,
        drainRate: drain / (duration / 1000 / 60), // % per minute
        profile: this.currentProfile,
        averageTemperature: this.calculateAverageTemperature(),
      };
      
      console.log('[Battery] Session ended:', report);
      
      return report;
    }
    
    return null;
  }
  
  /**
   * Set up battery monitoring
   */
  setupBatteryMonitoring() {
    // Platform-specific setup
    if (Platform.OS === 'ios') {
      this.setupIOSMonitoring();
    } else if (Platform.OS === 'android') {
      this.setupAndroidMonitoring();
    }
    
    // Common monitoring
    this.monitoringInterval = setInterval(() => {
      this.updateBatteryStatus();
    }, 30000); // Every 30 seconds
  }
  
  /**
   * iOS battery monitoring
   */
  setupIOSMonitoring() {
    try {
      // Battery level changes
      if (NativeModules.BatteryManager) {
        this.listeners.push(
          DeviceEventEmitter.addListener('batteryLevelChanged', (level) => {
            this.handleBatteryLevelChange(level);
          })
        );
        
        // Charging state changes
        this.listeners.push(
          DeviceEventEmitter.addListener('batteryStateChanged', (state) => {
            this.handleBatteryStateChange(state);
          })
        );
      }
      
      // Thermal state monitoring
      if (NativeModules.ThermalManager) {
        this.listeners.push(
          DeviceEventEmitter.addListener('thermalStateChanged', (state) => {
            this.handleThermalStateChange(state);
          })
        );
      }
    } catch (error) {
      console.warn('[Battery] iOS monitoring setup failed:', error);
    }
  }
  
  /**
   * Android battery monitoring
   */
  setupAndroidMonitoring() {
    try {
      // Battery monitoring
      if (NativeModules.BatteryModule) {
        this.listeners.push(
          DeviceEventEmitter.addListener('batteryStatus', (status) => {
            this.handleBatteryStatus(status);
          })
        );
      }
      
      // Temperature monitoring
      if (NativeModules.ThermalModule) {
        this.listeners.push(
          DeviceEventEmitter.addListener('thermalStatus', (status) => {
            this.handleThermalStatus(status);
          })
        );
      }
    } catch (error) {
      console.warn('[Battery] Android monitoring setup failed:', error);
    }
  }
  
  /**
   * Start active monitoring
   */
  startMonitoring() {
    if (this.activeMonitor) return;
    
    this.activeMonitor = setInterval(() => {
      this.checkPowerConsumption();
    }, 60000); // Every minute
  }
  
  /**
   * Update battery status
   */
  async updateBatteryStatus() {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();
      
      this.powerMetrics.batteryLevel = Math.round(level * 100);
      this.powerMetrics.isCharging = isCharging;
      
      // Add to history if monitoring
      if (this.isMonitoring) {
        this.batteryHistory.push({
          timestamp: Date.now(),
          level: this.powerMetrics.batteryLevel,
        });
        
        // Keep only last 30 minutes
        const cutoff = Date.now() - 30 * 60 * 1000;
        this.batteryHistory = this.batteryHistory.filter(h => h.timestamp > cutoff);
      }
      
      // Calculate drain rate
      this.calculateDrainRate();
    } catch (error) {
      console.error('[Battery] Status update failed:', error);
    }
  }
  
  /**
   * Calculate battery drain rate
   */
  calculateDrainRate() {
    if (this.batteryHistory.length < 2) return;
    
    const recent = this.batteryHistory.slice(-5); // Last 5 samples
    if (recent.length < 2) return;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
    const levelDiff = first.level - last.level;
    
    if (timeDiff > 0) {
      this.powerMetrics.drainRate = levelDiff / timeDiff;
      
      // Estimate time remaining
      if (this.powerMetrics.drainRate > 0 && !this.powerMetrics.isCharging) {
        this.powerMetrics.estimatedTimeRemaining = 
          this.powerMetrics.batteryLevel / this.powerMetrics.drainRate;
      }
    }
  }
  
  /**
   * Check power consumption and optimize if needed
   */
  checkPowerConsumption() {
    // Check drain rate
    if (this.powerMetrics.drainRate > POWER_TARGETS.maxDrainPerMinute) {
      console.warn('[Battery] High drain rate:', this.powerMetrics.drainRate.toFixed(2) + '% per minute');
      
      // Auto-optimize if not charging
      if (!this.powerMetrics.isCharging) {
        this.optimizePowerConsumption();
      }
    }
    
    // Check temperature
    if (this.powerMetrics.temperature > POWER_TARGETS.thermalThreshold) {
      console.warn('[Battery] High temperature:', this.powerMetrics.temperature + '°C');
      this.reduceThermalLoad();
    }
    
    // Check battery level
    if (this.powerMetrics.batteryLevel < 20 && !this.powerMetrics.isCharging) {
      if (this.currentProfile !== 'ultraSaver') {
        console.log('[Battery] Low battery - switching to ultra saver mode');
        this.setPowerProfile('ultraSaver');
      }
    }
  }
  
  /**
   * Optimize power consumption
   */
  optimizePowerConsumption() {
    const currentProfileIndex = Object.keys(POWER_PROFILES).indexOf(this.currentProfile);
    const profiles = Object.keys(POWER_PROFILES);
    
    // Move to next lower power profile
    if (currentProfileIndex < profiles.length - 1) {
      const nextProfile = profiles[currentProfileIndex + 1];
      console.log('[Battery] Optimizing power - switching to', nextProfile);
      this.setPowerProfile(nextProfile);
    }
  }
  
  /**
   * Reduce thermal load
   */
  reduceThermalLoad() {
    if (!this.bridge) return;
    
    // Reduce GPU load
    this.bridge.sendCommand('setThermalThrottle', {
      reduceEffects: true,
      lowerFrameRate: true,
      disablePostProcessing: true,
    });
    
    // Reduce CPU load
    this.bridge.sendCommand('reduceCPULoad', {
      simplifyPhysics: true,
      reduceAIComplexity: true,
      disableBackgroundAnimations: true,
    });
  }
  
  /**
   * Set power profile
   */
  async setPowerProfile(profileName) {
    const profile = POWER_PROFILES[profileName];
    if (!profile) return;
    
    console.log('[Battery] Applying power profile:', profileName);
    
    this.currentProfile = profileName;
    
    // Apply to Phaser game
    if (this.bridge) {
      this.bridge.sendCommand('setPowerProfile', {
        targetFPS: profile.fps,
        renderScale: profile.renderScale,
        particleQuality: profile.particleQuality,
        soundQuality: profile.soundQuality,
      });
    }
    
    // Apply system settings
    await this.applySystemSettings(profile);
    
    // Save preference
    await this.savePowerPreference(profileName);
  }
  
  /**
   * Apply power profile to game
   */
  async applyPowerProfile(profileName) {
    const profile = POWER_PROFILES[profileName];
    if (!profile) return;
    
    // Generate optimized settings
    const settings = this.generatePowerSettings(profile);
    
    // Apply via bridge
    if (this.bridge) {
      this.bridge.sendCommand('applyPowerSettings', settings);
    }
  }
  
  /**
   * Generate power optimization settings
   */
  generatePowerSettings(profile) {
    return {
      // Rendering
      fps: {
        target: profile.fps,
        vsync: profile.fps === 60,
        adaptiveSync: profile.fps === 30,
      },
      
      // Graphics
      rendering: {
        scale: profile.renderScale,
        antialiasing: profile.renderScale === 1.0,
        pixelArt: profile.renderScale < 0.75,
        autoDetectRenderer: false,
        powerPreference: profile.fps === 60 ? 'high-performance' : 'low-power',
      },
      
      // Effects
      effects: {
        particles: profile.particleQuality !== 'off',
        maxParticles: profile.particleQuality === 'high' ? 200 : 50,
        particleDetail: profile.particleQuality,
        screenShake: profile.particleQuality !== 'off',
        hitEffects: profile.particleQuality !== 'off',
        glowEffects: profile.particleQuality === 'high',
      },
      
      // Audio
      audio: {
        enabled: profile.soundQuality !== 'off',
        quality: profile.soundQuality,
        volume: profile.soundQuality === 'minimal' ? 0.5 : 1.0,
        spatialAudio: profile.soundQuality === 'high',
      },
      
      // Physics
      physics: {
        updateRate: profile.fps,
        subSteps: profile.fps === 60 ? 2 : 1,
        simplifiedCollisions: profile.fps === 30,
      },
      
      // Background
      background: {
        animated: profile.backgroundTasks,
        parallax: profile.renderScale === 1.0,
        dynamicLighting: false,
      },
    };
  }
  
  /**
   * Apply system-level settings
   */
  async applySystemSettings(profile) {
    try {
      // Vibration
      if (Platform.OS === 'ios' && NativeModules.VibrationModule) {
        NativeModules.VibrationModule.setEnabled(profile.vibration);
      }
      
      // Screen brightness (if permission granted)
      if (NativeModules.BrightnessModule) {
        await NativeModules.BrightnessModule.setBrightness(profile.brightness / 100);
      }
      
      // CPU governor (Android only, requires root)
      if (Platform.OS === 'android' && NativeModules.CPUModule) {
        const governor = profile.fps === 60 ? 'performance' : 'powersave';
        NativeModules.CPUModule.setGovernor(governor);
      }
    } catch (error) {
      console.warn('[Battery] System settings application failed:', error);
    }
  }
  
  /**
   * Handle battery level change
   */
  handleBatteryLevelChange(level) {
    const previousLevel = this.powerMetrics.batteryLevel;
    this.powerMetrics.batteryLevel = Math.round(level * 100);
    
    // Check for significant drain
    if (previousLevel - this.powerMetrics.batteryLevel > 2) {
      console.warn('[Battery] Significant drain detected');
      this.checkPowerConsumption();
    }
  }
  
  /**
   * Handle battery state change
   */
  handleBatteryStateChange(state) {
    this.powerMetrics.isCharging = state.isCharging || state.state === 'charging';
    
    // Optimize based on charging state
    if (this.powerMetrics.isCharging && this.currentProfile !== 'performance') {
      console.log('[Battery] Charging detected - enabling performance mode');
      this.setPowerProfile('performance');
    }
  }
  
  /**
   * Handle thermal state change
   */
  handleThermalStateChange(state) {
    // iOS thermal states: nominal, fair, serious, critical
    const thermalMap = {
      nominal: 25,
      fair: 35,
      serious: 40,
      critical: 45,
    };
    
    this.powerMetrics.temperature = thermalMap[state.state] || 30;
    
    if (this.isMonitoring) {
      this.temperatureHistory.push({
        timestamp: Date.now(),
        temperature: this.powerMetrics.temperature,
      });
    }
  }
  
  /**
   * Handle battery status (Android)
   */
  handleBatteryStatus(status) {
    this.powerMetrics.batteryLevel = status.level;
    this.powerMetrics.isCharging = status.isCharging;
    this.powerMetrics.temperature = status.temperature / 10; // Android reports in tenths
  }
  
  /**
   * Handle thermal status (Android)
   */
  handleThermalStatus(status) {
    this.powerMetrics.temperature = status.temperature;
    
    if (this.isMonitoring) {
      this.temperatureHistory.push({
        timestamp: Date.now(),
        temperature: status.temperature,
      });
    }
  }
  
  /**
   * Calculate average temperature
   */
  calculateAverageTemperature() {
    if (this.temperatureHistory.length === 0) return 0;
    
    const sum = this.temperatureHistory.reduce((acc, h) => acc + h.temperature, 0);
    return sum / this.temperatureHistory.length;
  }
  
  /**
   * Get power consumption report
   */
  getPowerReport() {
    const sessionDuration = this.sessionStartTime 
      ? (Date.now() - this.sessionStartTime) / 1000 / 60 
      : 0;
    
    const totalDrain = this.sessionStartBattery !== null
      ? this.sessionStartBattery - this.powerMetrics.batteryLevel
      : 0;
    
    return {
      current: {
        profile: this.currentProfile,
        batteryLevel: this.powerMetrics.batteryLevel,
        isCharging: this.powerMetrics.isCharging,
        temperature: this.powerMetrics.temperature,
        drainRate: this.powerMetrics.drainRate,
      },
      session: {
        duration: sessionDuration,
        totalDrain,
        averageDrainRate: sessionDuration > 0 ? totalDrain / sessionDuration : 0,
        projectedDrainPer30Min: this.powerMetrics.drainRate * 30,
      },
      recommendations: this.getPowerRecommendations(),
    };
  }
  
  /**
   * Get power optimization recommendations
   */
  getPowerRecommendations() {
    const recommendations = [];
    
    // Drain rate
    if (this.powerMetrics.drainRate > POWER_TARGETS.maxDrainPerMinute) {
      recommendations.push({
        type: 'drain',
        severity: 'high',
        message: `Battery draining at ${this.powerMetrics.drainRate.toFixed(1)}% per minute`,
        action: 'Switch to battery saver mode',
      });
    }
    
    // Temperature
    if (this.powerMetrics.temperature > POWER_TARGETS.thermalThreshold) {
      recommendations.push({
        type: 'thermal',
        severity: 'medium',
        message: `Device temperature: ${this.powerMetrics.temperature}°C`,
        action: 'Let device cool down or reduce graphics quality',
      });
    }
    
    // Low battery
    if (this.powerMetrics.batteryLevel < 20 && !this.powerMetrics.isCharging) {
      recommendations.push({
        type: 'battery',
        severity: 'high',
        message: `Low battery: ${this.powerMetrics.batteryLevel}%`,
        action: 'Connect charger or enable ultra battery saver',
      });
    }
    
    // Profile suggestion
    const projectedDrain = this.powerMetrics.drainRate * 30;
    if (projectedDrain > POWER_TARGETS.maxDrainPer30Min && this.currentProfile === 'performance') {
      recommendations.push({
        type: 'profile',
        severity: 'medium',
        message: 'High power consumption in performance mode',
        action: 'Switch to balanced mode for better battery life',
      });
    }
    
    return recommendations;
  }
  
  /**
   * Save power preference
   */
  async savePowerPreference(profile) {
    try {
      await AsyncStorage.setItem('@power_profile', profile);
    } catch (error) {
      console.error('[Battery] Failed to save preference:', error);
    }
  }
  
  /**
   * Load power preference
   */
  async loadPowerPreference() {
    try {
      const profile = await AsyncStorage.getItem('@power_profile');
      if (profile && POWER_PROFILES[profile]) {
        this.currentProfile = profile;
      }
    } catch (error) {
      console.error('[Battery] Failed to load preference:', error);
    }
  }
  
  /**
   * Clean up
   */
  destroy() {
    // Clear intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.activeMonitor) {
      clearInterval(this.activeMonitor);
    }
    
    // Remove listeners
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }
}

// Export singleton instance
export default new BatteryOptimizationService();