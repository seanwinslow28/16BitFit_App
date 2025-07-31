/**
 * Enhanced Health Service
 * Unified health tracking API integrations for 16BitFit
 * Handles Apple HealthKit, Google Fit, and manual logging
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

// Platform-specific imports
let AppleHealthKit = null;
let GoogleFit = null;

try {
  if (Platform.OS === 'ios') {
    AppleHealthKit = require('react-native-health').default;
  } else if (Platform.OS === 'android') {
    // Google Fit will be imported when library is added
    // GoogleFit = require('react-native-google-fit').default;
  }
} catch (error) {
  console.log('Health libraries not available:', error.message);
}

// Activity type mappings
const ACTIVITY_MAPPINGS = {
  // Strength activities → Attack power
  strength: [
    'strength_training',
    'weightlifting',
    'resistance_training',
    'powerlifting',
    'bodybuilding'
  ],
  // Cardio activities → Stamina and speed
  cardio: [
    'running',
    'cycling',
    'swimming',
    'rowing',
    'elliptical',
    'stair_climbing',
    'jump_rope'
  ],
  // Flexibility activities → Defense
  flexibility: [
    'yoga',
    'pilates',
    'stretching',
    'tai_chi',
    'martial_arts'
  ],
  // High intensity → Multiple stats
  hiit: [
    'hiit',
    'crossfit',
    'circuit_training',
    'bootcamp',
    'functional_training'
  ]
};

// Stat impact calculations based on activity
const STAT_IMPACTS = {
  strength: {
    attack: 1.5,
    defense: 0.5,
    stamina: 0.3,
    speed: 0.1
  },
  cardio: {
    stamina: 1.5,
    speed: 1.2,
    attack: 0.2,
    defense: 0.3
  },
  flexibility: {
    defense: 1.5,
    speed: 0.8,
    stamina: 0.5,
    attack: 0.2
  },
  hiit: {
    stamina: 1.0,
    attack: 1.0,
    speed: 0.8,
    defense: 0.5
  },
  walking: {
    stamina: 0.5,
    defense: 0.3,
    speed: 0.2,
    attack: 0.1
  }
};

class EnhancedHealthService {
  constructor() {
    this.initialized = false;
    this.platform = Platform.OS;
    this.permissions = {
      steps: false,
      distance: false,
      calories: false,
      heartRate: false,
      workouts: false,
      sleep: false,
      nutrition: false,
      weight: false
    };
    
    // Real-time tracking state
    this.syncInterval = null;
    this.backgroundSync = false;
    this.lastSyncTime = null;
    
    // Character stat cache
    this.cachedStats = null;
    this.statUpdateCallbacks = [];
  }

  /**
   * Initialize health tracking services
   */
  async initialize() {
    try {
      console.log('Initializing Enhanced Health Service...');
      
      if (Platform.OS === 'ios') {
        await this.initializeAppleHealth();
      } else if (Platform.OS === 'android') {
        await this.initializeGoogleFit();
      }
      
      // Load cached data
      await this.loadCachedData();
      
      // Set up background sync
      await this.setupBackgroundSync();
      
      this.initialized = true;
      console.log('Health Service initialized successfully');
      
      // Perform initial sync
      await this.syncAllHealthData();
      
      return true;
    } catch (error) {
      console.error('Health Service initialization failed:', error);
      this.initialized = true; // Still mark as initialized for fallback
      return false;
    }
  }

  /**
   * Initialize Apple HealthKit
   */
  async initializeAppleHealth() {
    if (!AppleHealthKit) {
      console.log('Apple HealthKit not available');
      return false;
    }

    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.StepCount,
          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
          AppleHealthKit.Constants.Permissions.DistanceCycling,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.RestingHeartRate,
          AppleHealthKit.Constants.Permissions.Workout,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
          AppleHealthKit.Constants.Permissions.Weight,
          AppleHealthKit.Constants.Permissions.BodyMassIndex,
          AppleHealthKit.Constants.Permissions.BodyFatPercentage
        ],
        write: [] // We only read data
      }
    };

    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error, results) => {
        if (error) {
          console.error('HealthKit init error:', error);
          reject(error);
        } else {
          console.log('HealthKit initialized');
          this.updatePermissions(results);
          resolve(true);
        }
      });
    });
  }

  /**
   * Initialize Google Fit
   */
  async initializeGoogleFit() {
    // TODO: Implement when react-native-google-fit is added
    console.log('Google Fit integration pending');
    return false;
  }

  /**
   * Request all necessary permissions
   */
  async requestPermissions() {
    try {
      if (Platform.OS === 'ios' && AppleHealthKit) {
        // iOS permissions are requested during init
        return this.permissions;
      } else if (Platform.OS === 'android' && GoogleFit) {
        // TODO: Request Google Fit permissions
      }
      
      // Mark all permissions as granted for manual logging
      Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = true;
      });
      
      await this.savePermissions();
      return this.permissions;
    } catch (error) {
      console.error('Permission request failed:', error);
      return this.permissions;
    }
  }

  /**
   * Get today's step count with real-time updates
   */
  async getStepsToday() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      if (Platform.OS === 'ios' && AppleHealthKit && this.permissions.steps) {
        return new Promise((resolve, reject) => {
          const options = {
            startDate: today.toISOString(),
            endDate: now.toISOString()
          };

          AppleHealthKit.getStepCount(options, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                steps: Math.floor(results.value || 0),
                startTime: today,
                endTime: now
              });
            }
          });
        });
      } else if (Platform.OS === 'android' && GoogleFit && this.permissions.steps) {
        // TODO: Implement Google Fit step counting
      }

      // Fallback to cached or manual data
      return this.getManualStepsToday();
    } catch (error) {
      console.error('Failed to get steps:', error);
      return { steps: 0, startTime: new Date(), endTime: new Date() };
    }
  }

  /**
   * Get detailed workout data for a time period
   */
  async getWorkouts(startDate, endDate = new Date()) {
    try {
      if (Platform.OS === 'ios' && AppleHealthKit && this.permissions.workouts) {
        return new Promise((resolve, reject) => {
          const options = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          };

          AppleHealthKit.getSamples(options, (error, results) => {
            if (error) {
              reject(error);
            } else {
              const workouts = results.map(workout => this.parseAppleWorkout(workout));
              resolve(workouts);
            }
          });
        });
      } else if (Platform.OS === 'android' && GoogleFit && this.permissions.workouts) {
        // TODO: Implement Google Fit workout retrieval
      }

      // Fallback to manual workout data
      return this.getManualWorkouts(startDate, endDate);
    } catch (error) {
      console.error('Failed to get workouts:', error);
      return [];
    }
  }

  /**
   * Parse Apple Health workout data
   */
  parseAppleWorkout(workout) {
    const activityType = this.mapAppleActivityType(workout.activityType);
    const duration = (workout.endDate - workout.startDate) / 1000 / 60; // minutes
    
    return {
      id: workout.uuid || Date.now().toString(),
      type: activityType,
      startTime: new Date(workout.startDate),
      endTime: new Date(workout.endDate),
      duration: duration,
      calories: workout.totalEnergyBurned || 0,
      distance: workout.totalDistance || 0,
      averageHeartRate: workout.averageHeartRate || null,
      source: 'apple_health',
      statImpact: this.calculateWorkoutStatImpact(activityType, duration, workout.totalEnergyBurned)
    };
  }

  /**
   * Map Apple Health activity types to our categories
   */
  mapAppleActivityType(appleType) {
    const typeMap = {
      'HKWorkoutActivityTypeRunning': 'running',
      'HKWorkoutActivityTypeCycling': 'cycling',
      'HKWorkoutActivityTypeSwimming': 'swimming',
      'HKWorkoutActivityTypeYoga': 'yoga',
      'HKWorkoutActivityTypeStrengthTraining': 'strength_training',
      'HKWorkoutActivityTypeWalking': 'walking',
      'HKWorkoutActivityTypeHiit': 'hiit',
      'HKWorkoutActivityTypeCrossTraining': 'crossfit',
      'HKWorkoutActivityTypeMartialArts': 'martial_arts'
    };
    
    return typeMap[appleType] || 'other';
  }

  /**
   * Calculate stat impact from workout
   */
  calculateWorkoutStatImpact(activityType, duration, calories) {
    let category = 'walking'; // default
    
    // Find activity category
    for (const [cat, activities] of Object.entries(ACTIVITY_MAPPINGS)) {
      if (activities.includes(activityType)) {
        category = cat;
        break;
      }
    }
    
    const impacts = STAT_IMPACTS[category];
    const intensityMultiplier = Math.min(duration / 30, 2); // Cap at 2x for 60+ min
    const calorieMultiplier = Math.min((calories || 0) / 300, 1.5); // Cap at 1.5x for 450+ cal
    
    return {
      attack: Math.round(impacts.attack * intensityMultiplier * 10),
      defense: Math.round(impacts.defense * intensityMultiplier * 10),
      stamina: Math.round(impacts.stamina * intensityMultiplier * 10),
      speed: Math.round(impacts.speed * intensityMultiplier * 10),
      xp: Math.round((duration / 10) * calorieMultiplier * 100) // XP based on duration and calories
    };
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(startDate, endDate = new Date()) {
    try {
      if (Platform.OS === 'ios' && AppleHealthKit && this.permissions.heartRate) {
        const samples = await this.getHealthSamples(
          AppleHealthKit.Constants.Permissions.HeartRate,
          startDate,
          endDate
        );
        
        return this.processHeartRateData(samples);
      }
      
      // Fallback
      return {
        resting: 70,
        average: 80,
        max: 120,
        samples: []
      };
    } catch (error) {
      console.error('Failed to get heart rate:', error);
      return null;
    }
  }

  /**
   * Get sleep data
   */
  async getSleepData(date = new Date()) {
    try {
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(18, 0, 0, 0); // 6 PM previous day
      
      const endDate = new Date(date);
      endDate.setHours(12, 0, 0, 0); // Noon current day

      if (Platform.OS === 'ios' && AppleHealthKit && this.permissions.sleep) {
        return new Promise((resolve, reject) => {
          const options = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          };

          AppleHealthKit.getSleepSamples(options, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(this.processSleepData(results));
            }
          });
        });
      }
      
      // Fallback
      return {
        totalHours: 7,
        quality: 75,
        deepSleep: 1.5,
        remSleep: 1.75,
        efficiency: 85
      };
    } catch (error) {
      console.error('Failed to get sleep data:', error);
      return null;
    }
  }

  /**
   * Get nutrition data (for future implementation)
   */
  async getNutritionData(date = new Date()) {
    try {
      // TODO: Implement nutrition tracking
      // This would integrate with APIs like Spoonacular or USDA FoodData
      
      return {
        calories: 2000,
        protein: 80,
        carbs: 250,
        fat: 70,
        water: 2000 // ml
      };
    } catch (error) {
      console.error('Failed to get nutrition data:', error);
      return null;
    }
  }

  /**
   * Manual activity logging
   */
  async logManualActivity(activity) {
    try {
      const activityData = {
        ...activity,
        id: `manual_${Date.now()}`,
        source: 'manual',
        timestamp: new Date(),
        statImpact: this.calculateWorkoutStatImpact(
          activity.type,
          activity.duration,
          activity.calories
        )
      };
      
      // Save to local storage
      const activities = await this.getStoredActivities();
      activities.push(activityData);
      await AsyncStorage.setItem('manualActivities', JSON.stringify(activities));
      
      // Sync to database
      await this.syncActivityToDatabase(activityData);
      
      // Trigger stat update
      await this.updateCharacterStats();
      
      return activityData;
    } catch (error) {
      console.error('Failed to log manual activity:', error);
      throw error;
    }
  }

  /**
   * Sync all health data and calculate stat impacts
   */
  async syncAllHealthData() {
    try {
      console.log('Syncing all health data...');
      
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Collect all health data
      const healthData = {
        steps: await this.getStepsToday(),
        workouts: await this.getWorkouts(startOfDay, today),
        heartRate: await this.getHeartRateData(startOfDay, today),
        sleep: await this.getSleepData(today),
        nutrition: await this.getNutritionData(today)
      };
      
      // Calculate cumulative stat impacts
      const statImpacts = this.calculateTotalStatImpacts(healthData);
      
      // Store in database
      await this.syncToDatabase(healthData, statImpacts);
      
      // Update character stats
      await this.updateCharacterStats(statImpacts);
      
      // Update last sync time
      this.lastSyncTime = new Date();
      await AsyncStorage.setItem('lastHealthSync', this.lastSyncTime.toISOString());
      
      // Notify callbacks
      this.notifyStatUpdateCallbacks(statImpacts);
      
      return {
        healthData,
        statImpacts,
        syncTime: this.lastSyncTime
      };
    } catch (error) {
      console.error('Health sync failed:', error);
      throw error;
    }
  }

  /**
   * Calculate total stat impacts from all health data
   */
  calculateTotalStatImpacts(healthData) {
    const impacts = {
      attack: 0,
      defense: 0,
      stamina: 0,
      speed: 0,
      xp: 0,
      multipliers: {}
    };
    
    // Step impacts
    if (healthData.steps && healthData.steps.steps > 0) {
      const stepBonus = Math.min(healthData.steps.steps / 1000, 10); // Cap at 10k steps
      impacts.stamina += stepBonus * 5;
      impacts.xp += healthData.steps.steps / 10;
    }
    
    // Workout impacts
    if (healthData.workouts && healthData.workouts.length > 0) {
      healthData.workouts.forEach(workout => {
        if (workout.statImpact) {
          impacts.attack += workout.statImpact.attack;
          impacts.defense += workout.statImpact.defense;
          impacts.stamina += workout.statImpact.stamina;
          impacts.speed += workout.statImpact.speed;
          impacts.xp += workout.statImpact.xp;
        }
      });
    }
    
    // Heart rate impacts (cardiovascular fitness)
    if (healthData.heartRate && healthData.heartRate.resting) {
      if (healthData.heartRate.resting < 60) {
        impacts.stamina += 10; // Excellent cardiovascular fitness
        impacts.multipliers.stamina = 1.2;
      } else if (healthData.heartRate.resting < 70) {
        impacts.stamina += 5; // Good fitness
        impacts.multipliers.stamina = 1.1;
      }
    }
    
    // Sleep impacts (recovery)
    if (healthData.sleep) {
      if (healthData.sleep.totalHours >= 8) {
        impacts.multipliers.all = 1.2; // Well-rested bonus
      } else if (healthData.sleep.totalHours >= 7) {
        impacts.multipliers.all = 1.1; // Adequate rest
      } else if (healthData.sleep.totalHours < 6) {
        impacts.multipliers.all = 0.8; // Tired penalty
      }
    }
    
    // Nutrition impacts
    if (healthData.nutrition) {
      // Protein for strength
      if (healthData.nutrition.protein >= 80) {
        impacts.attack += 5;
        impacts.multipliers.attack = (impacts.multipliers.attack || 1) * 1.1;
      }
      
      // Hydration for overall performance
      if (healthData.nutrition.water >= 2000) {
        impacts.multipliers.all = (impacts.multipliers.all || 1) * 1.05;
      }
    }
    
    return impacts;
  }

  /**
   * Update character stats based on health data
   */
  async updateCharacterStats(statImpacts) {
    try {
      // Get current character data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
        
      if (charError) throw charError;
      
      // Apply stat impacts with multipliers
      const updatedStats = {
        attack: character.attack + Math.round(statImpacts.attack * (statImpacts.multipliers.attack || 1) * (statImpacts.multipliers.all || 1)),
        defense: character.defense + Math.round(statImpacts.defense * (statImpacts.multipliers.defense || 1) * (statImpacts.multipliers.all || 1)),
        stamina: character.stamina + Math.round(statImpacts.stamina * (statImpacts.multipliers.stamina || 1) * (statImpacts.multipliers.all || 1)),
        speed: character.speed + Math.round(statImpacts.speed * (statImpacts.multipliers.speed || 1) * (statImpacts.multipliers.all || 1)),
        experience: character.experience + Math.round(statImpacts.xp)
      };
      
      // Check for evolution trigger
      const evolutionTriggered = await this.checkEvolutionTriggers(character, updatedStats);
      
      // Update character
      const { error: updateError } = await supabase
        .from('characters')
        .update({
          ...updatedStats,
          last_health_sync: new Date().toISOString()
        })
        .eq('id', character.id);
        
      if (updateError) throw updateError;
      
      return {
        previousStats: {
          attack: character.attack,
          defense: character.defense,
          stamina: character.stamina,
          speed: character.speed,
          experience: character.experience
        },
        newStats: updatedStats,
        improvements: statImpacts,
        evolutionTriggered
      };
    } catch (error) {
      console.error('Failed to update character stats:', error);
      throw error;
    }
  }

  /**
   * Check if character should evolve based on fitness milestones
   */
  async checkEvolutionTriggers(character, newStats) {
    // Evolution triggers based on cumulative improvements
    const triggers = {
      stage2: {
        totalStats: 200,
        workouts: 10,
        stepGoals: 7
      },
      stage3: {
        totalStats: 400,
        workouts: 25,
        stepGoals: 21
      },
      stage4: {
        totalStats: 600,
        workouts: 50,
        stepGoals: 45
      },
      stage5: {
        totalStats: 1000,
        workouts: 100,
        stepGoals: 90
      }
    };
    
    const totalStats = newStats.attack + newStats.defense + newStats.stamina + newStats.speed;
    const currentStage = character.evolution_stage || 1;
    const nextStage = currentStage + 1;
    
    if (nextStage <= 5 && triggers[`stage${nextStage}`]) {
      const trigger = triggers[`stage${nextStage}`];
      
      // Check if any trigger condition is met
      if (totalStats >= trigger.totalStats) {
        return {
          triggered: true,
          newStage: nextStage,
          reason: 'total_stats',
          milestone: trigger.totalStats
        };
      }
    }
    
    return { triggered: false };
  }

  /**
   * Set up background sync for automatic updates
   */
  async setupBackgroundSync() {
    try {
      // Set up periodic sync (every 30 minutes when app is active)
      this.syncInterval = setInterval(() => {
        this.syncAllHealthData().catch(console.error);
      }, 30 * 60 * 1000);
      
      // TODO: Implement true background sync with native modules
      this.backgroundSync = true;
      
      return true;
    } catch (error) {
      console.error('Failed to set up background sync:', error);
      return false;
    }
  }

  /**
   * Register callback for stat updates
   */
  onStatUpdate(callback) {
    this.statUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.statUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all stat update callbacks
   */
  notifyStatUpdateCallbacks(statImpacts) {
    this.statUpdateCallbacks.forEach(callback => {
      try {
        callback(statImpacts);
      } catch (error) {
        console.error('Stat update callback error:', error);
      }
    });
  }

  /**
   * Get real-time stat preview for activity
   */
  getActivityStatPreview(activityType, duration, intensity = 'medium') {
    const multipliers = {
      low: 0.7,
      medium: 1.0,
      high: 1.3,
      extreme: 1.6
    };
    
    const baseImpact = this.calculateWorkoutStatImpact(
      activityType,
      duration,
      duration * 10 // Estimate calories
    );
    
    const intensityMultiplier = multipliers[intensity] || 1.0;
    
    return {
      attack: Math.round(baseImpact.attack * intensityMultiplier),
      defense: Math.round(baseImpact.defense * intensityMultiplier),
      stamina: Math.round(baseImpact.stamina * intensityMultiplier),
      speed: Math.round(baseImpact.speed * intensityMultiplier),
      xp: Math.round(baseImpact.xp * intensityMultiplier)
    };
  }

  /**
   * Clean up service
   */
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.statUpdateCallbacks = [];
    this.backgroundSync = false;
  }

  // Helper methods

  async loadCachedData() {
    try {
      const cachedStats = await AsyncStorage.getItem('cachedHealthStats');
      if (cachedStats) {
        this.cachedStats = JSON.parse(cachedStats);
      }
      
      const permissions = await AsyncStorage.getItem('healthPermissions');
      if (permissions) {
        this.permissions = JSON.parse(permissions);
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }

  async savePermissions() {
    try {
      await AsyncStorage.setItem('healthPermissions', JSON.stringify(this.permissions));
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  }

  async getStoredActivities() {
    try {
      const stored = await AsyncStorage.getItem('manualActivities');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored activities:', error);
      return [];
    }
  }

  async syncToDatabase(healthData, statImpacts) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const syncData = {
        user_id: userData.user.id,
        health_data: healthData,
        stat_impacts: statImpacts,
        sync_time: new Date().toISOString(),
        platform: this.platform
      };
      
      const { error } = await supabase
        .from('health_syncs')
        .insert(syncData);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }

  async syncActivityToDatabase(activity) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: userData.user.id,
          ...activity
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to sync activity to database:', error);
    }
  }

  updatePermissions(results) {
    // Update permissions based on HealthKit response
    this.permissions = {
      steps: true,
      distance: true,
      calories: true,
      heartRate: true,
      workouts: true,
      sleep: true,
      nutrition: false, // Not available in HealthKit directly
      weight: true
    };
  }

  async getHealthSamples(dataType, startDate, endDate) {
    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      AppleHealthKit.getSamples(
        { ...options, type: dataType },
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  processHeartRateData(samples) {
    if (!samples || samples.length === 0) {
      return { resting: 70, average: 80, max: 120, samples: [] };
    }

    const values = samples.map(s => s.value);
    const resting = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      resting: Math.round(resting),
      average: Math.round(average),
      max: Math.round(max),
      samples: samples.slice(0, 100) // Limit samples
    };
  }

  processSleepData(samples) {
    if (!samples || samples.length === 0) {
      return {
        totalHours: 7,
        quality: 75,
        deepSleep: 1.5,
        remSleep: 1.75,
        efficiency: 85
      };
    }

    // Calculate total sleep time
    let totalMinutes = 0;
    let inBedMinutes = 0;
    
    samples.forEach(sample => {
      const duration = (new Date(sample.endDate) - new Date(sample.startDate)) / 1000 / 60;
      
      if (sample.value === 'INBED') {
        inBedMinutes += duration;
      } else if (sample.value === 'ASLEEP') {
        totalMinutes += duration;
      }
    });

    const totalHours = totalMinutes / 60;
    const efficiency = inBedMinutes > 0 ? (totalMinutes / inBedMinutes) * 100 : 85;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      quality: Math.round(efficiency),
      deepSleep: totalHours * 0.2, // Estimate
      remSleep: totalHours * 0.25, // Estimate
      efficiency: Math.round(efficiency)
    };
  }

  async getManualStepsToday() {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(`manualSteps_${today}`);
      
      if (stored) {
        return JSON.parse(stored);
      }
      
      return { steps: 0, startTime: new Date(), endTime: new Date() };
    } catch (error) {
      console.error('Failed to get manual steps:', error);
      return { steps: 0, startTime: new Date(), endTime: new Date() };
    }
  }

  async getManualWorkouts(startDate, endDate) {
    try {
      const activities = await this.getStoredActivities();
      
      return activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= startDate && activityDate <= endDate;
      });
    } catch (error) {
      console.error('Failed to get manual workouts:', error);
      return [];
    }
  }
}

export default new EnhancedHealthService();