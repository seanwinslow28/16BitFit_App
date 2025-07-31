/**
 * Character Realtime Service
 * Manages real-time character state and provides helper functions
 * for character updates, stat calculations, and animations
 */

import { supabase } from './supabaseClient';
import RealtimeSubscriptionManager from './RealtimeSubscriptionManager';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CharacterRealtimeService {
  constructor() {
    this.character = null;
    this.listeners = new Map();
    this.statDecayInterval = null;
    this.animationQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Initialize character real-time service
   */
  async initialize(userId) {
    console.log('🎮 Initializing Character Realtime Service');
    
    try {
      // Load character data
      await this.loadCharacter(userId);
      
      // Set up real-time listeners
      this.setupRealtimeListeners();
      
      // Start stat decay timer
      this.startStatDecay();
      
      // Load cached updates if offline
      await this.processCachedUpdates();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize character service:', error);
      return false;
    }
  }

  /**
   * Load character data from database
   */
  async loadCharacter(userId) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Failed to load character:', error);
      // Try loading from cache
      const cached = await AsyncStorage.getItem(`character_${userId}`);
      if (cached) {
        this.character = JSON.parse(cached);
        return;
      }
      throw error;
    }
    
    this.character = data;
    // Cache character data
    await AsyncStorage.setItem(`character_${userId}`, JSON.stringify(data));
  }

  /**
   * Set up real-time listeners
   */
  setupRealtimeListeners() {
    // Listen for character updates
    RealtimeSubscriptionManager.on('character_update', (data) => {
      this.handleCharacterUpdate(data);
    });
    
    // Listen for action logs
    RealtimeSubscriptionManager.on('action_logged', (data) => {
      this.handleActionLogged(data);
    });
    
    // Listen for achievement unlocks
    RealtimeSubscriptionManager.on('achievement_unlocked', (data) => {
      this.handleAchievementUnlocked(data);
    });
  }

  /**
   * Handle character updates from real-time subscription
   */
  async handleCharacterUpdate(data) {
    const { character, changes } = data;
    
    // Update local character state
    this.character = character;
    
    // Cache updated character
    await AsyncStorage.setItem(
      `character_${character.user_id}`, 
      JSON.stringify(character)
    );
    
    // Queue animations for stat changes
    Object.entries(changes).forEach(([stat, change]) => {
      this.queueAnimation({
        type: 'stat_change',
        stat,
        oldValue: change.old,
        newValue: change.new,
        delta: change.delta
      });
    });
    
    // Notify listeners
    this.notifyListeners('character_updated', { character, changes });
  }

  /**
   * Handle new action logged
   */
  handleActionLogged(data) {
    const { action } = data;
    
    // Queue animation for action
    this.queueAnimation({
      type: 'action',
      action: action.action_type,
      xp: action.xp_gained
    });
    
    // Notify listeners
    this.notifyListeners('action_performed', { action });
  }

  /**
   * Handle achievement unlocked
   */
  handleAchievementUnlocked(data) {
    const { achievement } = data;
    
    // Queue celebration animation
    this.queueAnimation({
      type: 'achievement',
      achievement
    });
    
    // Notify listeners
    this.notifyListeners('achievement_unlocked', { achievement });
  }

  /**
   * Log a workout action
   */
  async logWorkout(workoutData) {
    try {
      const action = {
        user_id: this.character.user_id,
        action_type: 'workout',
        action_data: {
          type: workoutData.type,
          duration: workoutData.duration,
          intensity: workoutData.intensity,
          exercises: workoutData.exercises
        },
        xp_gained: this.calculateWorkoutXP(workoutData)
      };
      
      const { error } = await supabase
        .from('action_logs')
        .insert(action);
        
      if (error) throw error;
      
      // Trigger immediate stat update
      await this.updateCharacterStats({
        strength: this.calculateStatGain('strength', workoutData),
        stamina: this.calculateStatGain('stamina', workoutData),
        health: 1,
        happiness: 2
      });
      
      return true;
    } catch (error) {
      console.error('Failed to log workout:', error);
      // Cache for offline sync
      await this.cacheUpdate('workout', workoutData);
      return false;
    }
  }

  /**
   * Log a meal action
   */
  async logMeal(mealData) {
    try {
      const action = {
        user_id: this.character.user_id,
        action_type: 'meal',
        action_data: mealData,
        xp_gained: mealData.is_healthy ? 15 : 5
      };
      
      const { error } = await supabase
        .from('action_logs')
        .insert(action);
        
      if (error) throw error;
      
      // Also insert into food_entries table
      await supabase
        .from('food_entries')
        .insert({
          user_id: this.character.user_id,
          ...mealData
        });
      
      return true;
    } catch (error) {
      console.error('Failed to log meal:', error);
      await this.cacheUpdate('meal', mealData);
      return false;
    }
  }

  /**
   * Update character stats directly
   */
  async updateCharacterStats(updates) {
    try {
      // Apply stat limits
      const safeUpdates = {};
      Object.entries(updates).forEach(([stat, change]) => {
        const currentValue = this.character[stat] || 0;
        let newValue = currentValue + change;
        
        // Apply limits
        if (stat === 'weight') {
          newValue = Math.max(30, Math.min(70, newValue));
        } else if (['health', 'strength', 'stamina', 'happiness'].includes(stat)) {
          newValue = Math.max(0, Math.min(100, newValue));
        }
        
        if (newValue !== currentValue) {
          safeUpdates[stat] = newValue;
        }
      });
      
      if (Object.keys(safeUpdates).length === 0) return;
      
      // Update database
      const { error } = await supabase
        .from('characters')
        .update({
          ...safeUpdates,
          last_update: new Date().toISOString()
        })
        .eq('user_id', this.character.user_id);
        
      if (error) throw error;
      
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
    } catch (error) {
      console.error('Failed to update character stats:', error);
      await this.cacheUpdate('stats', updates);
    }
  }

  /**
   * Calculate workout XP based on type and intensity
   */
  calculateWorkoutXP(workoutData) {
    const baseXP = {
      strength: 30,
      cardio: 25,
      flexibility: 20,
      mixed: 35
    };
    
    const intensityMultiplier = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.5
    };
    
    const base = baseXP[workoutData.type] || 25;
    const multiplier = intensityMultiplier[workoutData.intensity] || 1.0;
    const durationBonus = Math.floor(workoutData.duration / 10) * 5;
    
    return Math.floor(base * multiplier + durationBonus);
  }

  /**
   * Calculate stat gain from workout
   */
  calculateStatGain(stat, workoutData) {
    const gains = {
      strength: {
        strength: 3,
        cardio: 1,
        flexibility: 0,
        mixed: 2
      },
      stamina: {
        strength: 1,
        cardio: 3,
        flexibility: 2,
        mixed: 2
      }
    };
    
    const intensityBonus = {
      easy: 0,
      medium: 1,
      hard: 2
    };
    
    const base = gains[stat]?.[workoutData.type] || 1;
    const bonus = intensityBonus[workoutData.intensity] || 0;
    
    return base + bonus;
  }

  /**
   * Start stat decay system
   */
  startStatDecay() {
    // Clear existing interval
    if (this.statDecayInterval) {
      clearInterval(this.statDecayInterval);
    }
    
    // Check every hour
    this.statDecayInterval = setInterval(async () => {
      await this.applyStatDecay();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Apply stat decay based on time since last activity
   */
  async applyStatDecay() {
    if (!this.character) return;
    
    const lastUpdate = new Date(this.character.last_update);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    // No decay for first 6 hours
    if (hoursSinceUpdate < 6) return;
    
    // Calculate decay
    const decayRate = Math.min(hoursSinceUpdate / 24, 3); // Max 3 points per day
    const decay = {
      health: -Math.floor(decayRate * 0.5),
      strength: -Math.floor(decayRate * 0.3),
      stamina: -Math.floor(decayRate * 0.4),
      happiness: -Math.floor(decayRate * 0.8)
    };
    
    await this.updateCharacterStats(decay);
    
    // Update last decay time
    await supabase
      .from('characters')
      .update({ last_decay: now.toISOString() })
      .eq('user_id', this.character.user_id);
  }

  /**
   * Queue animation for processing
   */
  queueAnimation(animation) {
    this.animationQueue.push(animation);
    if (!this.isProcessingQueue) {
      this.processAnimationQueue();
    }
  }

  /**
   * Process animation queue
   */
  async processAnimationQueue() {
    if (this.animationQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    
    this.isProcessingQueue = true;
    const animation = this.animationQueue.shift();
    
    // Notify listeners about animation
    this.notifyListeners('animation_start', animation);
    
    // Wait for animation to complete (adjust timing as needed)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Process next animation
    this.processAnimationQueue();
  }

  /**
   * Cache update for offline sync
   */
  async cacheUpdate(type, data) {
    try {
      const cacheKey = 'pending_character_updates';
      const existing = await AsyncStorage.getItem(cacheKey);
      const updates = existing ? JSON.parse(existing) : [];
      
      updates.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(updates));
    } catch (error) {
      console.error('Failed to cache update:', error);
    }
  }

  /**
   * Process cached updates when online
   */
  async processCachedUpdates() {
    try {
      const cacheKey = 'pending_character_updates';
      const cached = await AsyncStorage.getItem(cacheKey);
      if (!cached) return;
      
      const updates = JSON.parse(cached);
      console.log(`Processing ${updates.length} cached updates`);
      
      for (const update of updates) {
        switch (update.type) {
          case 'workout':
            await this.logWorkout(update.data);
            break;
          case 'meal':
            await this.logMeal(update.data);
            break;
          case 'stats':
            await this.updateCharacterStats(update.data);
            break;
        }
      }
      
      // Clear cache
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to process cached updates:', error);
    }
  }

  /**
   * Add listener for character events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify all listeners for an event
   */
  notifyListeners(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get current character state
   */
  getCharacter() {
    return this.character;
  }

  /**
   * Clean up service
   */
  cleanup() {
    if (this.statDecayInterval) {
      clearInterval(this.statDecayInterval);
      this.statDecayInterval = null;
    }
    this.listeners.clear();
    this.animationQueue = [];
    this.character = null;
  }
}

// Export singleton instance
export default new CharacterRealtimeService();