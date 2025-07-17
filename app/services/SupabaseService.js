/**
 * Supabase Service
 * Handles all backend operations with Supabase
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using environment variables for Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

class SupabaseService {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    this.isInitialized = false;
    this.currentUser = null;
  }

  // Initialize the service
  async initialize() {
    try {
      // Check if we have a valid session
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        this.currentUser = session.user;
        this.isInitialized = true;
      } else {
        // If no session, check for existing anonymous user or create one
        const existingUserId = await AsyncStorage.getItem('anonymousUserId');
        if (existingUserId) {
          this.currentUser = { id: existingUserId, isAnonymous: true };
          this.isInitialized = true;
        } else {
          // Create anonymous user automatically
          const result = await this.createAnonymousUser();
          if (result.user) {
            console.log('Created anonymous user for offline usage');
          }
        }
      }
      
      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          this.currentUser = session?.user || null;
          this.isInitialized = true;
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.isInitialized = false;
        }
      });
      
      return true;
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      // Even if Supabase fails, create anonymous user for offline mode
      try {
        const result = await this.createAnonymousUser();
        if (result.user) {
          console.log('Fallback: Created anonymous user for offline usage');
          return true;
        }
      } catch (fallbackError) {
        console.error('Fallback anonymous user creation failed:', fallbackError);
      }
      return false;
    }
  }

  // Create anonymous user (for offline usage)
  async createAnonymousUser() {
    try {
      const userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store anonymous user locally
      await AsyncStorage.setItem('anonymousUserId', userId);
      
      this.currentUser = { id: userId, isAnonymous: true };
      this.isInitialized = true;
      
      return { user: this.currentUser, error: null };
    } catch (error) {
      console.error('Anonymous user creation failed:', error);
      return { user: null, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Database operations for character data
  async saveCharacterData(characterData) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const dataToSave = {
        user_id: this.currentUser.id,
        health: characterData.health,
        strength: characterData.strength,
        stamina: characterData.stamina,
        happiness: characterData.happiness,
        weight: characterData.weight,
        evolution_stage: characterData.evolutionStage,
        level: characterData.level,
        xp: characterData.xp,
        streak: characterData.streak,
        last_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // For anonymous users, save locally
      if (this.currentUser.isAnonymous) {
        await AsyncStorage.setItem('characterData', JSON.stringify(dataToSave));
        return { data: dataToSave, error: null };
      }

      // For authenticated users, save to Supabase
      const { data, error } = await this.supabase
        .from('characters')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Character data save failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Load character data
  async loadCharacterData() {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // For anonymous users, load from local storage
      if (this.currentUser.isAnonymous) {
        const storedData = await AsyncStorage.getItem('characterData');
        if (storedData) {
          return { data: JSON.parse(storedData), error: null };
        }
        return { data: null, error: null };
      }

      // For authenticated users, load from Supabase
      const { data, error } = await this.supabase
        .from('characters')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Character data load failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Log user actions
  async logAction(actionType, actionData) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const actionLog = {
        user_id: this.currentUser.id,
        action_type: actionType,
        action_data: actionData,
        created_at: new Date().toISOString(),
      };

      // For anonymous users, store locally
      if (this.currentUser.isAnonymous) {
        const existingLogs = await AsyncStorage.getItem('actionLogs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.push(actionLog);
        
        // Keep only last 100 actions for anonymous users
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        
        await AsyncStorage.setItem('actionLogs', JSON.stringify(logs));
        return { data: actionLog, error: null };
      }

      // For authenticated users, log to Supabase
      const { data, error } = await this.supabase
        .from('action_logs')
        .insert(actionLog);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Action logging failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Get user's action history
  async getActionHistory(limit = 50) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // For anonymous users, get from local storage
      if (this.currentUser.isAnonymous) {
        const storedLogs = await AsyncStorage.getItem('actionLogs');
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        return { data: logs.slice(-limit), error: null };
      }

      // For authenticated users, get from Supabase
      const { data, error } = await this.supabase
        .from('action_logs')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Action history retrieval failed:', error);
      return { data: [], error: error.message };
    }
  }

  // Save battle results
  async saveBattleResult(battleData) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const battleResult = {
        user_id: this.currentUser.id,
        boss_name: battleData.bossName,
        boss_level: battleData.bossLevel,
        player_level: battleData.playerLevel,
        result: battleData.result,
        rewards: battleData.rewards,
        game_score: battleData.gameScore,
        combat_power: battleData.combatPower,
        created_at: new Date().toISOString(),
      };

      // For anonymous users, store locally
      if (this.currentUser.isAnonymous) {
        const existingBattles = await AsyncStorage.getItem('battleResults');
        const battles = existingBattles ? JSON.parse(existingBattles) : [];
        battles.push(battleResult);
        
        // Keep only last 50 battles for anonymous users
        if (battles.length > 50) {
          battles.splice(0, battles.length - 50);
        }
        
        await AsyncStorage.setItem('battleResults', JSON.stringify(battles));
        return { data: battleResult, error: null };
      }

      // For authenticated users, save to Supabase
      const { data, error } = await this.supabase
        .from('boss_battles')
        .insert(battleResult);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Battle result save failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Get battle statistics
  async getBattleStats() {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // For anonymous users, get from local storage
      if (this.currentUser.isAnonymous) {
        const storedBattles = await AsyncStorage.getItem('battleResults');
        const battles = storedBattles ? JSON.parse(storedBattles) : [];
        
        const stats = {
          total_battles: battles.length,
          wins: battles.filter(b => b.result === 'win').length,
          losses: battles.filter(b => b.result === 'lose').length,
          win_rate: battles.length > 0 ? battles.filter(b => b.result === 'win').length / battles.length : 0,
        };
        
        return { data: stats, error: null };
      }

      // For authenticated users, get from Supabase
      const { data, error } = await this.supabase
        .from('boss_battles')
        .select('result')
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      const stats = {
        total_battles: data.length,
        wins: data.filter(b => b.result === 'win').length,
        losses: data.filter(b => b.result === 'lose').length,
        win_rate: data.length > 0 ? data.filter(b => b.result === 'win').length / data.length : 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Battle stats retrieval failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Update daily streaks
  async updateDailyStreak() {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const today = new Date().toISOString().split('T')[0];
      const streakData = {
        user_id: this.currentUser.id,
        streak_date: today,
        created_at: new Date().toISOString(),
      };

      // For anonymous users, store locally
      if (this.currentUser.isAnonymous) {
        const existingStreaks = await AsyncStorage.getItem('dailyStreaks');
        const streaks = existingStreaks ? JSON.parse(existingStreaks) : [];
        
        // Check if today is already recorded
        const todayExists = streaks.find(s => s.streak_date === today);
        if (!todayExists) {
          streaks.push(streakData);
          await AsyncStorage.setItem('dailyStreaks', JSON.stringify(streaks));
        }
        
        return { data: streakData, error: null };
      }

      // For authenticated users, save to Supabase
      const { data, error } = await this.supabase
        .from('daily_streaks')
        .upsert(streakData, { onConflict: 'user_id,streak_date' });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Daily streak update failed:', error);
      return { data: null, error: error.message };
    }
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasUser: !!this.currentUser,
      isAnonymous: this.currentUser?.isAnonymous || false,
      userId: this.currentUser?.id || null,
    };
  }
}

export default new SupabaseService();