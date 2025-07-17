/**
 * Cloud Sync Manager
 * Advanced cloud synchronization with Supabase following MetaSystemsAgent patterns
 * Handles auth, real-time sync, offline fallback, and profile management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import SupabaseService from './SupabaseService';
import NetworkManager, { QUEUEABLE_TYPES } from './NetworkManager';

class CloudSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.networkListener = null;
    this.authStateListener = null;
    this.offlineMode = false;
    this.syncCallbacks = new Map();
  }

  /**
   * Initialize cloud sync system
   */
  async initialize() {
    try {
      // Initialize NetworkManager first
      await NetworkManager.initialize();
      
      // Initialize Supabase
      const initialized = await SupabaseService.initialize();
      if (!initialized) {
        console.warn('CloudSync: Supabase initialization failed, running in offline mode');
        this.offlineMode = true;
      }

      // Load last sync time
      const lastSync = await AsyncStorage.getItem('lastCloudSyncTime');
      if (lastSync) {
        this.lastSyncTime = new Date(lastSync);
      }

      // Set up network monitoring using NetworkManager
      NetworkManager.addListener('cloud-sync', (state) => {
        this.offlineMode = !state.isConnected;
        if (state.isConnected && state.wasConnected === false) {
          console.log('CloudSync: Network reconnected, syncing...');
          this.performSync();
        }
      });

      // Set up periodic sync (every 5 minutes)
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, 5 * 60 * 1000);

      // Initial sync
      await this.performSync();

      return true;
    } catch (error) {
      console.error('CloudSyncManager initialization failed:', error);
      this.offlineMode = true;
      return false;
    }
  }

  /**
   * Handle network connectivity changes
   */
  async handleNetworkChange(state) {
    const wasOffline = this.offlineMode;
    this.offlineMode = !state.isConnected;

    if (wasOffline && state.isConnected) {
      console.log('CloudSync: Network reconnected, syncing...');
      await this.performSync();
    }
  }

  /**
   * Sign up new user with email/password
   */
  async signUp(email, password, username) {
    try {
      if (this.offlineMode) {
        throw new Error('Cannot sign up in offline mode');
      }

      const { data, error } = await SupabaseService.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            created_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, username);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { user: null, error: error.message };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email, password) {
    try {
      if (this.offlineMode) {
        throw new Error('Cannot sign in in offline mode');
      }

      const { data, error } = await SupabaseService.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Sync data after sign in
      if (data.user) {
        await this.performSync();
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { user: null, error: error.message };
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      // Save any pending data before sign out
      await this.performSync();

      const { error } = await SupabaseService.supabase.auth.signOut();
      if (error) throw error;

      // Clear local cache
      await this.clearLocalCache();

      return { error: null };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId, username) {
    try {
      const profile = {
        id: userId,
        username,
        display_name: username,
        avatar_url: null,
        bio: 'New fitness warrior!',
        created_at: new Date().toISOString(),
        stats: {
          total_workouts: 0,
          total_battles: 0,
          best_streak: 0,
          achievements_earned: 0,
        },
        preferences: {
          notifications: true,
          public_profile: true,
          show_online_status: true,
        },
      };

      const { data, error } = await SupabaseService.supabase
        .from('profiles')
        .insert(profile);

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Profile creation failed:', error);
      return { profile: null, error: error.message };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await SupabaseService.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return { profile: null, error: error.message };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      const user = SupabaseService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const { data, error } = await SupabaseService.supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { profile: null, error: error.message };
    }
  }

  /**
   * Save game data with offline support
   */
  async saveGameData(gameData) {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        ...gameData,
        last_updated: timestamp,
        sync_version: Date.now(),
      };

      // Always save locally first
      await AsyncStorage.setItem('gameData', JSON.stringify(dataWithTimestamp));

      // Add to sync queue
      this.addToSyncQueue('gameData', dataWithTimestamp);

      // Try immediate sync if online
      if (!this.offlineMode) {
        await this.performSync();
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Game data save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load game data with cloud fallback
   */
  async loadGameData() {
    try {
      // Try cloud first if online
      if (!this.offlineMode) {
        const cloudData = await this.loadFromCloud('gameData');
        if (cloudData) {
          // Update local cache
          await AsyncStorage.setItem('gameData', JSON.stringify(cloudData));
          return { data: cloudData, error: null };
        }
      }

      // Fallback to local
      const localData = await AsyncStorage.getItem('gameData');
      if (localData) {
        return { data: JSON.parse(localData), error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Game data load failed:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Save customization data
   */
  async saveCustomizationData(customData) {
    try {
      const user = SupabaseService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const dataToSave = {
        user_id: user.id,
        unlocked_items: customData.unlockedItems || [],
        equipped_items: customData.equippedItems || {},
        favorite_items: customData.favoriteItems || [],
        color_schemes: customData.colorSchemes || {},
        updated_at: new Date().toISOString(),
      };

      // Save locally
      await AsyncStorage.setItem('customizationData', JSON.stringify(dataToSave));

      // Add to sync queue
      this.addToSyncQueue('customization', dataToSave);

      // Sync if online
      if (!this.offlineMode) {
        await this.performSync();
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Customization save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save achievement progress
   */
  async saveAchievementProgress(achievements) {
    try {
      const user = SupabaseService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const dataToSave = {
        user_id: user.id,
        achievements: achievements,
        updated_at: new Date().toISOString(),
      };

      // Save locally
      await AsyncStorage.setItem('achievementData', JSON.stringify(dataToSave));

      // Add to sync queue
      this.addToSyncQueue('achievements', dataToSave);

      // Sync if online
      if (!this.offlineMode) {
        await this.performSync();
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Achievement save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save social data (friends, guilds, etc.)
   */
  async saveSocialData(socialData) {
    try {
      const user = SupabaseService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const dataToSave = {
        user_id: user.id,
        friends: socialData.friends || [],
        guild_id: socialData.guildId || null,
        pending_requests: socialData.pendingRequests || [],
        blocked_users: socialData.blockedUsers || [],
        updated_at: new Date().toISOString(),
      };

      // Save locally
      await AsyncStorage.setItem('socialData', JSON.stringify(dataToSave));

      // Add to sync queue
      this.addToSyncQueue('social', dataToSave);

      // Sync if online
      if (!this.offlineMode) {
        await this.performSync();
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Social data save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add data to sync queue
   */
  addToSyncQueue(type, data) {
    // Remove any existing entries of the same type
    this.syncQueue = this.syncQueue.filter(item => item.type !== type);
    
    // Add new entry
    this.syncQueue.push({
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    });

    // Save queue to storage
    AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  /**
   * Perform data synchronization
   */
  async performSync() {
    if (this.isSyncing || this.offlineMode) return;

    this.isSyncing = true;
    const syncResults = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Load sync queue from storage
      const queueData = await AsyncStorage.getItem('syncQueue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }

      // Process each item in queue
      for (const item of this.syncQueue) {
        try {
          await this.syncItem(item);
          syncResults.success++;
        } catch (error) {
          syncResults.failed++;
          syncResults.errors.push({ type: item.type, error: error.message });
          
          // Increment retry count
          item.retries++;
          
          // Remove from queue if too many retries
          if (item.retries > 3) {
            this.syncQueue = this.syncQueue.filter(i => i !== item);
          }
        }
      }

      // Update last sync time
      this.lastSyncTime = new Date();
      await AsyncStorage.setItem('lastCloudSyncTime', this.lastSyncTime.toISOString());

      // Save updated queue
      await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));

      // Notify listeners
      this.notifySyncComplete(syncResults);

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }

    return syncResults;
  }

  /**
   * Sync individual item
   */
  async syncItem(item) {
    const user = SupabaseService.getCurrentUser();
    if (!user || user.isAnonymous) return;

    switch (item.type) {
      case 'gameData':
        await SupabaseService.saveCharacterData(item.data);
        break;
      
      case 'customization':
        await SupabaseService.supabase
          .from('customization_data')
          .upsert(item.data, { onConflict: 'user_id' });
        break;
      
      case 'achievements':
        await SupabaseService.supabase
          .from('achievement_progress')
          .upsert(item.data, { onConflict: 'user_id' });
        break;
      
      case 'social':
        await SupabaseService.supabase
          .from('social_data')
          .upsert(item.data, { onConflict: 'user_id' });
        break;
      
      default:
        console.warn('Unknown sync type:', item.type);
    }

    // Remove from queue after successful sync
    this.syncQueue = this.syncQueue.filter(i => i !== item);
  }

  /**
   * Load data from cloud
   */
  async loadFromCloud(dataType) {
    const user = SupabaseService.getCurrentUser();
    if (!user || user.isAnonymous) return null;

    try {
      let result;
      
      switch (dataType) {
        case 'gameData':
          result = await SupabaseService.loadCharacterData();
          break;
        
        case 'customization':
          const { data: customData } = await SupabaseService.supabase
            .from('customization_data')
            .select('*')
            .eq('user_id', user.id)
            .single();
          result = { data: customData };
          break;
        
        case 'achievements':
          const { data: achievementData } = await SupabaseService.supabase
            .from('achievement_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();
          result = { data: achievementData };
          break;
        
        case 'social':
          const { data: socialData } = await SupabaseService.supabase
            .from('social_data')
            .select('*')
            .eq('user_id', user.id)
            .single();
          result = { data: socialData };
          break;
        
        default:
          return null;
      }

      return result?.data || null;
    } catch (error) {
      console.error(`Failed to load ${dataType} from cloud:`, error);
      return null;
    }
  }

  /**
   * Clear local cache
   */
  async clearLocalCache() {
    const keysToRemove = [
      'gameData',
      'customizationData',
      'achievementData',
      'socialData',
      'syncQueue',
      'lastCloudSyncTime',
    ];

    try {
      await AsyncStorage.multiRemove(keysToRemove);
      this.syncQueue = [];
      this.lastSyncTime = null;
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Register sync callback
   */
  onSyncComplete(callback) {
    const id = Date.now().toString();
    this.syncCallbacks.set(id, callback);
    return () => this.syncCallbacks.delete(id);
  }

  /**
   * Notify sync complete
   */
  notifySyncComplete(results) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: !this.offlineMode,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingItems: this.syncQueue.length,
      user: SupabaseService.getCurrentUser(),
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    NetworkManager.removeListener('cloud-sync');
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncCallbacks.clear();
  }
}

export default new CloudSyncManager();