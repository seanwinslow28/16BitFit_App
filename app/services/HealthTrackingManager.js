/**
 * Health Tracking Manager
 * Orchestrates all health and fitness tracking services
 * Provides unified API for the app
 */

import EnhancedHealthService from './EnhancedHealthService';
import NutritionService from './NutritionService';
import CharacterEvolutionSystem from './CharacterEvolutionSystem';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class HealthTrackingManager {
  constructor() {
    this.initialized = false;
    this.services = {
      health: EnhancedHealthService,
      nutrition: NutritionService
    };
    
    // Real-time tracking state
    this.isTracking = false;
    this.updateInterval = null;
    this.subscribers = new Map();
    
    // Cached data for performance
    this.cache = {
      dailyStats: null,
      characterImpact: null,
      lastUpdate: null
    };
  }

  /**
   * Initialize all health tracking services
   */
  async initialize() {
    try {
      console.log('Initializing Health Tracking Manager...');
      
      // Initialize individual services
      const healthInit = await this.services.health.initialize();
      const nutritionInit = await this.services.nutrition.initialize();
      
      if (!healthInit || !nutritionInit) {
        console.warn('Some services failed to initialize');
      }
      
      // Request permissions
      await this.requestAllPermissions();
      
      // Load cached data
      await this.loadCache();
      
      // Set up real-time tracking
      this.setupRealtimeTracking();
      
      this.initialized = true;
      console.log('Health Tracking Manager initialized');
      
      // Perform initial sync
      await this.syncAllData();
      
      return true;
    } catch (error) {
      console.error('Health Tracking Manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Request all necessary permissions
   */
  async requestAllPermissions() {
    try {
      const healthPermissions = await this.services.health.requestPermissions();
      
      return {
        health: healthPermissions,
        notifications: true // TODO: Request notification permissions
      };
    } catch (error) {
      console.error('Permission request failed:', error);
      return null;
    }
  }

  /**
   * Get comprehensive daily statistics
   */
  async getDailyStats() {
    try {
      // Check cache first
      if (this.cache.dailyStats && this.isCacheValid()) {
        return this.cache.dailyStats;
      }
      
      // Gather data from all services
      const [stepData, workouts, heartRate, sleep, nutritionProgress] = await Promise.all([
        this.services.health.getStepsToday(),
        this.services.health.getWorkouts(this.getStartOfDay(), new Date()),
        this.services.health.getHeartRateData(this.getStartOfDay(), new Date()),
        this.services.health.getSleepData(),
        this.services.nutrition.getDailyProgress()
      ]);
      
      // Calculate total stats
      const dailyStats = {
        activity: {
          steps: stepData.steps,
          workouts: workouts.length,
          activeMinutes: workouts.reduce((total, w) => total + w.duration, 0),
          caloriesBurned: workouts.reduce((total, w) => total + (w.calories || 0), 0)
        },
        vitals: {
          restingHeartRate: heartRate?.resting || null,
          averageHeartRate: heartRate?.average || null,
          sleepHours: sleep?.totalHours || 0,
          sleepQuality: sleep?.quality || 0
        },
        nutrition: nutritionProgress,
        timestamp: new Date()
      };
      
      // Cache the results
      this.cache.dailyStats = dailyStats;
      this.cache.lastUpdate = new Date();
      
      return dailyStats;
    } catch (error) {
      console.error('Failed to get daily stats:', error);
      return null;
    }
  }

  /**
   * Get real-time character stat impacts
   */
  async getCharacterImpact() {
    try {
      const dailyStats = await this.getDailyStats();
      
      // Get stat impacts from health data
      const healthImpacts = this.services.health.calculateTotalStatImpacts({
        steps: { steps: dailyStats.activity.steps },
        workouts: await this.services.health.getWorkouts(this.getStartOfDay(), new Date()),
        heartRate: dailyStats.vitals.restingHeartRate ? { resting: dailyStats.vitals.restingHeartRate } : null,
        sleep: dailyStats.vitals.sleepHours ? { totalHours: dailyStats.vitals.sleepHours } : null
      });
      
      // Get nutrition impacts
      const lastMeal = dailyStats.nutrition.meals?.[dailyStats.nutrition.meals.length - 1];
      const nutritionImpacts = lastMeal ? 
        this.services.nutrition.calculateNutritionStatImpact(lastMeal.nutrition) : 
        { attack: 0, defense: 0, stamina: 0, speed: 0, xp: 0 };
      
      // Combine impacts
      const totalImpacts = {
        attack: healthImpacts.attack + nutritionImpacts.attack,
        defense: healthImpacts.defense + nutritionImpacts.defense,
        stamina: healthImpacts.stamina + nutritionImpacts.stamina,
        speed: healthImpacts.speed + nutritionImpacts.speed,
        xp: healthImpacts.xp + nutritionImpacts.xp,
        multipliers: {
          ...healthImpacts.multipliers,
          ...nutritionImpacts.multipliers
        }
      };
      
      // Apply multipliers
      const finalStats = this.applyMultipliers(totalImpacts);
      
      // Check for milestones
      const milestones = await this.checkMilestones(dailyStats, finalStats);
      
      return {
        baseImpacts: totalImpacts,
        finalStats,
        milestones,
        nextEvolution: await this.getNextEvolutionProgress()
      };
    } catch (error) {
      console.error('Failed to get character impact:', error);
      return null;
    }
  }

  /**
   * Log activity with immediate feedback
   */
  async logActivity(activity) {
    try {
      // Validate activity
      if (!activity.type || !activity.duration) {
        throw new Error('Invalid activity data');
      }
      
      // Get stat preview
      const statPreview = this.services.health.getActivityStatPreview(
        activity.type,
        activity.duration,
        activity.intensity || 'medium'
      );
      
      // Log the activity
      const result = await this.services.health.logManualActivity(activity);
      
      // Show immediate feedback
      const feedback = {
        activity: result,
        statGains: statPreview,
        message: this.getActivityFeedbackMessage(activity.type, statPreview),
        evolutionProgress: await this.checkEvolutionProgress(statPreview)
      };
      
      // Notify subscribers
      this.notifySubscribers('activity_logged', feedback);
      
      // Trigger sync
      await this.syncAllData();
      
      return feedback;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Quick nutrition logging with smart suggestions
   */
  async quickLogNutrition(type) {
    try {
      const result = await this.services.nutrition.quickLogMeal(type);
      
      // Get updated progress
      const progress = await this.getDailyStats();
      
      // Generate feedback
      const feedback = {
        meal: result.meal,
        statImpact: result.statImpact,
        dailyProgress: result.dailyProgress,
        tips: this.services.nutrition.getNutritionTips(),
        nextMealSuggestion: this.services.nutrition.getMealSuggestions()[0]
      };
      
      // Notify subscribers
      this.notifySubscribers('nutrition_logged', feedback);
      
      return feedback;
    } catch (error) {
      console.error('Failed to quick log nutrition:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    this.subscribers.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get activity recommendations based on current stats
   */
  async getActivityRecommendations() {
    try {
      const dailyStats = await this.getDailyStats();
      const characterImpact = await this.getCharacterImpact();
      const recommendations = [];
      
      // Step-based recommendations
      if (dailyStats.activity.steps < 5000) {
        recommendations.push({
          type: 'walking',
          title: 'Take a Walk',
          description: '5,000 steps to unlock stamina boost',
          duration: 30,
          impact: { stamina: 10, xp: 500 },
          priority: 'high'
        });
      }
      
      // Stat-based recommendations
      const lowestStat = this.findLowestStat(characterImpact.finalStats);
      if (lowestStat === 'attack') {
        recommendations.push({
          type: 'strength_training',
          title: 'Strength Training',
          description: 'Boost your attack power with weights',
          duration: 45,
          impact: { attack: 15, defense: 5 },
          priority: 'medium'
        });
      } else if (lowestStat === 'stamina') {
        recommendations.push({
          type: 'running',
          title: 'Cardio Session',
          description: 'Improve stamina with a run',
          duration: 30,
          impact: { stamina: 20, speed: 10 },
          priority: 'medium'
        });
      }
      
      // Time-based recommendations
      const hour = new Date().getHours();
      if (hour >= 6 && hour <= 9 && dailyStats.activity.workouts.length === 0) {
        recommendations.push({
          type: 'morning_routine',
          title: 'Morning Workout',
          description: 'Start your day with energy',
          duration: 20,
          impact: { all: '10% bonus' },
          priority: 'high'
        });
      }
      
      return recommendations.sort((a, b) => 
        a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
      );
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress() {
    try {
      const achievements = {
        daily: {
          steps: {
            name: '10K Steps',
            current: 0,
            target: 10000,
            completed: false,
            reward: { xp: 1000, stamina: 5 }
          },
          workouts: {
            name: 'Daily Workout',
            current: 0,
            target: 1,
            completed: false,
            reward: { xp: 500, attack: 3 }
          },
          nutrition: {
            name: 'Perfect Nutrition',
            current: 0,
            target: 90, // percentage
            completed: false,
            reward: { xp: 750, all: '5% bonus' }
          }
        },
        weekly: {
          consistency: {
            name: '7-Day Streak',
            current: 0,
            target: 7,
            completed: false,
            reward: { evolution_points: 1 }
          },
          variety: {
            name: 'Try 3 Activities',
            current: 0,
            target: 3,
            completed: false,
            reward: { xp: 2000 }
          }
        },
        lifetime: {
          evolution: {
            name: 'Final Form',
            current: 1,
            target: 5,
            completed: false,
            reward: { title: 'Fitness Master' }
          }
        }
      };
      
      // Update progress from actual data
      const dailyStats = await this.getDailyStats();
      achievements.daily.steps.current = dailyStats.activity.steps;
      achievements.daily.steps.completed = dailyStats.activity.steps >= 10000;
      achievements.daily.workouts.current = dailyStats.activity.workouts;
      achievements.daily.workouts.completed = dailyStats.activity.workouts >= 1;
      achievements.daily.nutrition.current = dailyStats.nutrition.overallScore;
      achievements.daily.nutrition.completed = dailyStats.nutrition.overallScore >= 90;
      
      return achievements;
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return null;
    }
  }

  /**
   * Sync all data to backend
   */
  async syncAllData() {
    try {
      const syncResult = await this.services.health.syncAllHealthData();
      
      // Update cache
      this.cache.lastUpdate = new Date();
      
      // Notify subscribers
      this.notifySubscribers('data_synced', syncResult);
      
      return syncResult;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Helper methods

  setupRealtimeTracking() {
    // Update every 5 minutes when app is active
    this.updateInterval = setInterval(() => {
      if (this.isTracking) {
        this.syncAllData().catch(console.error);
      }
    }, 5 * 60 * 1000);
  }

  startTracking() {
    this.isTracking = true;
  }

  stopTracking() {
    this.isTracking = false;
  }

  async loadCache() {
    try {
      const cached = await AsyncStorage.getItem('healthTrackingCache');
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  async saveCache() {
    try {
      await AsyncStorage.setItem('healthTrackingCache', JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  isCacheValid() {
    if (!this.cache.lastUpdate) return false;
    
    const cacheAge = Date.now() - new Date(this.cache.lastUpdate).getTime();
    return cacheAge < 5 * 60 * 1000; // 5 minutes
  }

  getStartOfDay() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  applyMultipliers(impacts) {
    const final = { ...impacts };
    
    if (impacts.multipliers.all) {
      ['attack', 'defense', 'stamina', 'speed'].forEach(stat => {
        final[stat] = Math.round(final[stat] * impacts.multipliers.all);
      });
    }
    
    Object.entries(impacts.multipliers).forEach(([stat, multiplier]) => {
      if (stat !== 'all' && final[stat] !== undefined) {
        final[stat] = Math.round(final[stat] * multiplier);
      }
    });
    
    return final;
  }

  async checkMilestones(dailyStats, statImpacts) {
    const milestones = [];
    
    // Step milestones
    if (dailyStats.activity.steps === 10000) {
      milestones.push({
        type: 'steps',
        name: '10K Steps!',
        reward: { stamina: 10, xp: 1000 }
      });
    } else if (dailyStats.activity.steps === 5000) {
      milestones.push({
        type: 'steps',
        name: '5K Steps!',
        reward: { stamina: 5, xp: 500 }
      });
    }
    
    // Workout milestones
    if (dailyStats.activity.workouts === 1) {
      milestones.push({
        type: 'workout',
        name: 'First Workout!',
        reward: { attack: 5, xp: 750 }
      });
    }
    
    return milestones;
  }

  async getNextEvolutionProgress() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData) return null;
      
      const { data: character } = await supabase
        .from('characters')
        .select('evolution_stage, experience')
        .eq('user_id', userData.user.id)
        .single();
        
      if (!character) return null;
      
      const evolutionThresholds = {
        2: 1000,
        3: 2500,
        4: 5000,
        5: 10000
      };
      
      const nextStage = character.evolution_stage + 1;
      if (nextStage > 5) return { complete: true };
      
      const threshold = evolutionThresholds[nextStage];
      const progress = (character.experience / threshold) * 100;
      
      return {
        currentStage: character.evolution_stage,
        nextStage,
        experience: character.experience,
        required: threshold,
        progress: Math.round(progress)
      };
    } catch (error) {
      console.error('Failed to get evolution progress:', error);
      return null;
    }
  }

  async checkEvolutionProgress(statGains) {
    const progress = await this.getNextEvolutionProgress();
    if (!progress || progress.complete) return null;
    
    const newExperience = progress.experience + (statGains.xp || 0);
    const newProgress = (newExperience / progress.required) * 100;
    
    return {
      ...progress,
      experienceGained: statGains.xp || 0,
      newExperience,
      newProgress: Math.round(newProgress),
      willEvolve: newExperience >= progress.required
    };
  }

  getActivityFeedbackMessage(activityType, statGains) {
    const messages = {
      running: `Great run! +${statGains.stamina} Stamina, +${statGains.speed} Speed`,
      strength_training: `Powerful workout! +${statGains.attack} Attack, +${statGains.defense} Defense`,
      yoga: `Flexibility improved! +${statGains.defense} Defense, +${statGains.speed} Speed`,
      walking: `Every step counts! +${statGains.stamina} Stamina, +${statGains.xp} XP`
    };
    
    return messages[activityType] || `Activity complete! +${statGains.xp} XP`;
  }

  findLowestStat(stats) {
    const combatStats = {
      attack: stats.attack || 0,
      defense: stats.defense || 0,
      stamina: stats.stamina || 0,
      speed: stats.speed || 0
    };
    
    return Object.entries(combatStats)
      .sort(([, a], [, b]) => a - b)[0][0];
  }

  notifySubscribers(event, data) {
    const callbacks = this.subscribers.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Subscriber error for ${event}:`, error);
      }
    });
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.services.health.cleanup();
    this.subscribers.clear();
    this.isTracking = false;
  }
}

export default new HealthTrackingManager();