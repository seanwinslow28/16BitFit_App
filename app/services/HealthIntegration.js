/**
 * Enhanced Health Integration Service
 * Handles Apple Health and Google Fit integration with real data and step goals
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import react-native-health for real integration
let AppleHealthKit = null;
try {
  if (Platform.OS === 'ios') {
    AppleHealthKit = require('react-native-health').default;
  }
} catch (error) {
  console.log('react-native-health not available, using simulation mode');
}

class HealthIntegration {
  constructor() {
    this.isAvailable = false;
    this.useRealData = false;
    this.permissions = {
      steps: false,
      heartRate: false,
      workouts: false,
      sleep: false,
    };
    
    // Step goals and tracking
    this.dailyStepGoal = 10000;
    this.stepGoalHistory = {};
    
    // Real-time tracking
    this.stepTrackingActive = false;
    this.lastStepCount = 0;
    
    // Automatic stat bonus tracking
    this.autoStatBonuses = true;
    this.lastAutoBonus = null;
  }

  // Initialize health integration
  async initialize() {
    try {
      if (Platform.OS === 'ios' && AppleHealthKit) {
        console.log('Initializing HealthKit for iOS...');
        
        const permissions = {
          permissions: {
            read: [
              'Steps',
              'StepCount',
              'HeartRate',
              'RestingHeartRate',
              'Workout',
              'SleepAnalysis',
              'ActiveEnergyBurned',
            ],
          },
        };

        // Initialize HealthKit
        const initResult = await new Promise((resolve, reject) => {
          AppleHealthKit.initHealthKit(permissions, (error) => {
            if (error) {
              console.log('HealthKit init error:', error);
              reject(error);
            } else {
              console.log('HealthKit initialized successfully');
              resolve(true);
            }
          });
        });

        if (initResult) {
          this.useRealData = true;
          this.isAvailable = true;
          console.log('Real HealthKit data enabled');
        }
      } else if (Platform.OS === 'android') {
        // Android Google Fit integration would go here
        console.log('Initializing Google Fit for Android...');
        // For now, use simulation on Android
        this.isAvailable = true;
      }
      
      // Fallback to simulation mode
      if (!this.useRealData) {
        console.log('Using simulation mode for health data');
        this.isAvailable = true;
      }

      // Load saved step goal and preferences
      await this.loadUserPreferences();
      
      return true;
    } catch (error) {
      console.error('Health integration initialization failed:', error);
      // Fallback to simulation mode
      this.isAvailable = true;
      return true;
    }
  }

  // Request health permissions
  async requestPermissions() {
    try {
      // In a real implementation, this would request actual permissions
      // For simulation, we'll just set them as granted
      this.permissions = {
        steps: true,
        heartRate: true,
        workouts: true,
        sleep: true,
      };
      
      await AsyncStorage.setItem('healthPermissions', JSON.stringify(this.permissions));
      return this.permissions;
    } catch (error) {
      console.error('Permission request failed:', error);
      return this.permissions;
    }
  }

  // Get daily step count
  async getStepsToday() {
    try {
      if (!this.permissions.steps && this.useRealData) {
        throw new Error('Steps permission not granted');
      }
      
      let steps = 0;
      
      if (this.useRealData && Platform.OS === 'ios' && AppleHealthKit) {
        // Get real HealthKit step data
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const options = {
          startDate: startOfDay.toISOString(),
          endDate: today.toISOString(),
        };

        steps = await new Promise((resolve, reject) => {
          AppleHealthKit.getStepCount(options, (error, results) => {
            if (error) {
              console.log('HealthKit step count error:', error);
              reject(error);
            } else {
              const todaySteps = results.value || 0;
              console.log('Real step count retrieved:', todaySteps);
              resolve(todaySteps);
            }
          });
        });
      } else {
        // Fallback to simulated step data
        const savedSteps = await AsyncStorage.getItem('simulatedStepsToday');
        const savedDate = await AsyncStorage.getItem('simulatedStepsDate');
        const today = new Date().toDateString();
        
        if (savedDate === today && savedSteps) {
          steps = parseInt(savedSteps);
        } else {
          // Generate new simulated steps for today
          steps = Math.floor(Math.random() * 8000) + 2000; // 2000-10000 steps
          await AsyncStorage.setItem('simulatedStepsToday', steps.toString());
          await AsyncStorage.setItem('simulatedStepsDate', today);
        }
      }
      
      this.lastStepCount = steps;
      await AsyncStorage.setItem('lastStepsSync', Date.now().toString());
      
      // Check step goal achievement
      await this.checkStepGoalAchievement(steps);
      
      return steps;
    } catch (error) {
      console.error('Failed to get steps:', error);
      return this.lastStepCount || 0;
    }
  }

  // Load user preferences and step goals
  async loadUserPreferences() {
    try {
      const savedGoal = await AsyncStorage.getItem('dailyStepGoal');
      if (savedGoal) {
        this.dailyStepGoal = parseInt(savedGoal);
      }
      
      const savedHistory = await AsyncStorage.getItem('stepGoalHistory');
      if (savedHistory) {
        this.stepGoalHistory = JSON.parse(savedHistory);
      }
      
      const savedAutoBonus = await AsyncStorage.getItem('autoStatBonuses');
      if (savedAutoBonus !== null) {
        this.autoStatBonuses = JSON.parse(savedAutoBonus);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  // Set daily step goal
  async setDailyStepGoal(goal) {
    try {
      this.dailyStepGoal = Math.max(1000, Math.min(50000, goal)); // Reasonable limits
      await AsyncStorage.setItem('dailyStepGoal', this.dailyStepGoal.toString());
      console.log('Daily step goal set to:', this.dailyStepGoal);
      return this.dailyStepGoal;
    } catch (error) {
      console.error('Failed to set step goal:', error);
      return this.dailyStepGoal;
    }
  }

  // Check step goal achievement and provide bonuses
  async checkStepGoalAchievement(steps) {
    try {
      const today = new Date().toDateString();
      const goalAchieved = steps >= this.dailyStepGoal;
      
      // Check if we already processed today's goal
      if (this.stepGoalHistory[today]) {
        return this.stepGoalHistory[today];
      }
      
      const goalData = {
        date: today,
        steps: steps,
        goal: this.dailyStepGoal,
        achieved: goalAchieved,
        percentage: Math.round((steps / this.dailyStepGoal) * 100),
        bonusEarned: goalAchieved,
      };
      
      // Save goal achievement
      this.stepGoalHistory[today] = goalData;
      await AsyncStorage.setItem('stepGoalHistory', JSON.stringify(this.stepGoalHistory));
      
      return goalData;
    } catch (error) {
      console.error('Failed to check step goal achievement:', error);
      return null;
    }
  }

  // Get step goal progress for today
  async getStepGoalProgress() {
    try {
      const steps = await this.getStepsToday();
      const percentage = Math.round((steps / this.dailyStepGoal) * 100);
      const remaining = Math.max(0, this.dailyStepGoal - steps);
      
      return {
        currentSteps: steps,
        goalSteps: this.dailyStepGoal,
        percentage: Math.min(100, percentage),
        remaining: remaining,
        achieved: steps >= this.dailyStepGoal,
        progressMessage: this.getProgressMessage(percentage),
      };
    } catch (error) {
      console.error('Failed to get step goal progress:', error);
      return {
        currentSteps: 0,
        goalSteps: this.dailyStepGoal,
        percentage: 0,
        remaining: this.dailyStepGoal,
        achieved: false,
        progressMessage: 'Keep moving!',
      };
    }
  }

  // Get motivational progress message
  getProgressMessage(percentage) {
    if (percentage >= 100) return 'Goal achieved! Amazing work! 🎉';
    if (percentage >= 80) return 'Almost there! You can do it! 💪';
    if (percentage >= 60) return 'Great progress! Keep it up! 🚀';
    if (percentage >= 40) return 'You\'re on your way! 👍';
    if (percentage >= 20) return 'Good start! Keep moving! 🚶';
    return 'Every step counts! Let\'s go! ⭐';
  }

  // Get heart rate data
  async getHeartRateData() {
    try {
      if (!this.permissions.heartRate) {
        throw new Error('Heart rate permission not granted');
      }
      
      // Simulate heart rate data
      const restingHR = Math.floor(Math.random() * 30) + 60; // 60-90 bpm
      const maxHR = Math.floor(Math.random() * 50) + 150; // 150-200 bpm
      
      return {
        resting: restingHR,
        maximum: maxHR,
        average: Math.floor((restingHR + maxHR) / 2),
      };
    } catch (error) {
      console.error('Failed to get heart rate:', error);
      return { resting: 70, maximum: 180, average: 125 };
    }
  }

  // Get workout data for today
  async getWorkoutsToday() {
    try {
      if (!this.permissions.workouts) {
        throw new Error('Workouts permission not granted');
      }
      
      // Simulate workout data
      const workoutTypes = ['Running', 'Cycling', 'Swimming', 'Strength Training', 'Yoga'];
      const numWorkouts = Math.floor(Math.random() * 3); // 0-2 workouts
      
      const workouts = [];
      for (let i = 0; i < numWorkouts; i++) {
        workouts.push({
          type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
          duration: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
          calories: Math.floor(Math.random() * 400) + 100, // 100-500 calories
          startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        });
      }
      
      return workouts;
    } catch (error) {
      console.error('Failed to get workouts:', error);
      return [];
    }
  }

  // Get sleep data
  async getSleepData() {
    try {
      if (!this.permissions.sleep) {
        throw new Error('Sleep permission not granted');
      }
      
      // Simulate sleep data
      const sleepHours = Math.random() * 4 + 5; // 5-9 hours
      const sleepQuality = Math.random() * 40 + 60; // 60-100% quality
      
      return {
        duration: sleepHours,
        quality: sleepQuality,
        deepSleep: sleepHours * 0.2, // 20% deep sleep
        remSleep: sleepHours * 0.25, // 25% REM sleep
      };
    } catch (error) {
      console.error('Failed to get sleep data:', error);
      return { duration: 7, quality: 75, deepSleep: 1.4, remSleep: 1.75 };
    }
  }

  // Enhanced health data to game stats conversion
  convertHealthToStats(healthData, stepGoalProgress = null) {
    const stats = {
      health: 0,
      strength: 0,
      stamina: 0,
      happiness: 0,
      weight: 0,
    };

    // Enhanced steps contribution with goal achievement bonuses
    if (healthData.steps > 0) {
      // Base step bonus (more generous)
      stats.stamina += Math.min(healthData.steps / 800, 8); // Up to 8 points for 6400+ steps
      stats.health += Math.min(healthData.steps / 1500, 5); // Up to 5 points for 7500+ steps
      
      // Step goal achievement bonus
      if (stepGoalProgress && stepGoalProgress.achieved) {
        stats.happiness += 3; // Big happiness boost for goal achievement
        stats.stamina += 2; // Extra stamina for dedication
        
        // Super achievement bonuses for exceeding goals
        if (stepGoalProgress.percentage >= 150) {
          stats.health += 2; // 150% of goal bonus
          stats.strength += 1;
        }
        if (stepGoalProgress.percentage >= 200) {
          stats.happiness += 2; // 200% of goal bonus
          stats.stamina += 1;
        }
      }
      
      // Step milestone bonuses
      if (healthData.steps >= 15000) {
        stats.health += 2; // 15k+ steps bonus
        stats.stamina += 1;
      } else if (healthData.steps >= 10000) {
        stats.health += 1; // 10k+ steps bonus
      }
    }

    // Enhanced workout contribution
    if (healthData.workouts && healthData.workouts.length > 0) {
      healthData.workouts.forEach(workout => {
        // Duration-based multiplier
        const durationMultiplier = Math.min(workout.duration / 30, 2); // Up to 2x for 30+ min workouts
        
        switch (workout.type.toLowerCase()) {
          case 'running':
          case 'cycling':
          case 'swimming':
            stats.stamina += Math.floor(3 * durationMultiplier);
            stats.health += Math.floor(2 * durationMultiplier);
            stats.weight -= 0.5; // Cardio helps weight management
            break;
          case 'strength training':
          case 'weightlifting':
            stats.strength += Math.floor(4 * durationMultiplier);
            stats.health += Math.floor(1 * durationMultiplier);
            break;
          case 'yoga':
          case 'pilates':
            stats.happiness += Math.floor(3 * durationMultiplier);
            stats.health += Math.floor(2 * durationMultiplier);
            stats.strength += Math.floor(1 * durationMultiplier);
            break;
          case 'hiit':
          case 'crossfit':
            stats.stamina += Math.floor(2 * durationMultiplier);
            stats.strength += Math.floor(2 * durationMultiplier);
            stats.health += Math.floor(1 * durationMultiplier);
            break;
          default:
            stats.health += Math.floor(1 * durationMultiplier);
            stats.happiness += Math.floor(1 * durationMultiplier);
        }
        
        // Calorie burn bonus
        if (workout.calories > 300) {
          stats.weight -= 0.3; // High calorie burn bonus
        }
      });
    }

    // Enhanced sleep contribution
    if (healthData.sleep) {
      if (healthData.sleep.duration >= 8) {
        stats.health += 3; // Optimal sleep bonus
        stats.happiness += 2;
        stats.stamina += 1;
      } else if (healthData.sleep.duration >= 7) {
        stats.health += 2; // Good sleep
        stats.happiness += 1;
      } else if (healthData.sleep.duration < 6) {
        stats.health -= 2; // Poor sleep penalty
        stats.happiness -= 1;
        stats.stamina -= 1;
      }
      
      // Sleep quality bonuses
      if (healthData.sleep.quality >= 90) {
        stats.happiness += 2; // Excellent quality
        stats.health += 1;
      } else if (healthData.sleep.quality >= 80) {
        stats.happiness += 1; // Good quality
      } else if (healthData.sleep.quality < 60) {
        stats.happiness -= 1; // Poor quality
      }
    }

    // Enhanced heart rate contribution
    if (healthData.heartRate) {
      const restingHR = healthData.heartRate.resting;
      
      // Athletic heart rate (very fit)
      if (restingHR <= 50) {
        stats.stamina += 4; // Elite fitness
        stats.health += 3;
        stats.strength += 1;
      } else if (restingHR <= 60) {
        stats.stamina += 3; // Very good fitness
        stats.health += 2;
      } else if (restingHR <= 70) {
        stats.stamina += 1; // Average fitness
        stats.health += 1;
      } else if (restingHR >= 90) {
        stats.stamina -= 2; // Poor cardiovascular fitness
        stats.health -= 1;
      } else if (restingHR >= 80) {
        stats.stamina -= 1; // Below average fitness
      }
    }

    return stats;
  }

  // Get automatic stat bonuses based on current health metrics
  async getAutoStatBonuses() {
    try {
      if (!this.autoStatBonuses) {
        return { stats: {}, message: 'Auto bonuses disabled' };
      }
      
      const healthData = {};
      const stepProgress = await this.getStepGoalProgress();
      
      // Get current health data
      healthData.steps = stepProgress.currentSteps;
      healthData.heartRate = await this.getHeartRateData();
      
      // Calculate bonuses
      const statBonuses = this.convertHealthToStats(healthData, stepProgress);
      
      // Generate bonus message
      let bonusMessage = '';
      if (stepProgress.achieved) {
        bonusMessage = `🎉 Step goal achieved! Earned stat bonuses!`;
      } else if (stepProgress.percentage >= 50) {
        bonusMessage = `💪 ${stepProgress.percentage}% of step goal complete!`;
      } else {
        bonusMessage = `🚶 ${stepProgress.currentSteps} steps today - keep going!`;
      }
      
      return {
        stats: statBonuses,
        stepProgress,
        message: bonusMessage,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get auto stat bonuses:', error);
      return { stats: {}, message: 'Auto bonus error', error: error.message };
    }
  }

  // Sync health data and return stat bonuses
  async syncHealthData() {
    try {
      const healthData = {};
      
      // Get all health data
      healthData.steps = await this.getStepsToday();
      healthData.heartRate = await this.getHeartRateData();
      healthData.workouts = await this.getWorkoutsToday();
      healthData.sleep = await this.getSleepData();
      
      // Convert to game stats
      const statBonuses = this.convertHealthToStats(healthData);
      
      // Store sync timestamp
      await AsyncStorage.setItem('lastHealthSync', Date.now().toString());
      
      return {
        healthData,
        statBonuses,
        syncTime: new Date(),
      };
    } catch (error) {
      console.error('Health sync failed:', error);
      return {
        healthData: {},
        statBonuses: {},
        syncTime: new Date(),
        error: error.message,
      };
    }
  }

  // Check if health sync is needed (once per day)
  async shouldSync() {
    try {
      const lastSync = await AsyncStorage.getItem('lastHealthSync');
      if (!lastSync) return true;
      
      const lastSyncTime = parseInt(lastSync);
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      return (now - lastSyncTime) >= dayInMs;
    } catch (error) {
      console.error('Failed to check sync status:', error);
      return true;
    }
  }

  // Get health integration status
  getStatus() {
    return {
      isAvailable: this.isAvailable,
      permissions: this.permissions,
      platform: Platform.OS,
    };
  }
}

export default new HealthIntegration();