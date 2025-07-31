/**
 * Realtime Subscription Manager
 * Handles all real-time subscriptions for character updates, battles, and activities
 * Ensures the character feels alive with immediate stat updates from workouts
 */

import { supabase } from './supabaseClient';
import * as Haptics from 'expo-haptics';

class RealtimeSubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.callbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.characterCache = null;
  }

  /**
   * Initialize all real-time subscriptions
   */
  async initialize(userId) {
    console.log('🔴 Initializing real-time subscriptions for user:', userId);
    
    if (!userId) {
      console.error('RealtimeSubscriptionManager: No userId provided');
      return false;
    }

    try {
      // Subscribe to character updates
      await this.subscribeToCharacterUpdates(userId);
      
      // Subscribe to action logs for real-time activity tracking
      await this.subscribeToActionLogs(userId);
      
      // Subscribe to battle state changes
      await this.subscribeToBattleState(userId);
      
      // Subscribe to achievement unlocks
      await this.subscribeToAchievements(userId);
      
      // Subscribe to friend activities
      await this.subscribeToFriendActivities(userId);
      
      // Subscribe to guild chat
      await this.subscribeToGuildChat(userId);
      
      this.isConnected = true;
      console.log('✅ Real-time subscriptions initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize real-time subscriptions:', error);
      this.handleConnectionError();
      return false;
    }
  }

  /**
   * Subscribe to character stat updates
   */
  async subscribeToCharacterUpdates(userId) {
    const subscription = supabase
      .channel(`character:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🎮 Character update received:', payload);
          this.handleCharacterUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Character subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          this.executeCallbacks('character_connected', { userId });
        }
      });

    this.subscriptions.set('character', subscription);
  }

  /**
   * Subscribe to action logs for real-time activity tracking
   */
  async subscribeToActionLogs(userId) {
    const subscription = supabase
      .channel(`actions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_logs',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('💪 New action logged:', payload);
          this.handleActionLog(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('actions', subscription);
  }

  /**
   * Subscribe to battle state changes for multiplayer
   */
  async subscribeToBattleState(userId) {
    const subscription = supabase
      .channel(`battles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pvp_battles',
          filter: `or(player1_id.eq.${userId},player2_id.eq.${userId})`
        },
        (payload) => {
          console.log('⚔️ Battle update received:', payload);
          this.handleBattleUpdate(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('battles', subscription);
  }

  /**
   * Subscribe to achievement unlocks
   */
  async subscribeToAchievements(userId) {
    const subscription = supabase
      .channel(`achievements:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId},is_completed=eq.true`
        },
        (payload) => {
          console.log('🏆 Achievement unlocked:', payload);
          this.handleAchievementUnlock(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('achievements', subscription);
  }

  /**
   * Subscribe to friend activities
   */
  async subscribeToFriendActivities(userId) {
    // First get friend list
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (!friendships || friendships.length === 0) return;

    const friendIds = friendships.map(f => 
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );

    const subscription = supabase
      .channel('friend_activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_logs',
          filter: `user_id=in.(${friendIds.join(',')})`
        },
        (payload) => {
          console.log('👥 Friend activity:', payload);
          this.handleFriendActivity(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('friends', subscription);
  }

  /**
   * Subscribe to guild chat messages
   */
  async subscribeToGuildChat(userId) {
    // Get user's guild
    const { data: membership } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', userId)
      .single();

    if (!membership) return;

    const subscription = supabase
      .channel(`guild:${membership.guild_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_chat',
          filter: `guild_id=eq.${membership.guild_id}`
        },
        (payload) => {
          console.log('💬 Guild message:', payload);
          this.handleGuildMessage(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('guild', subscription);
  }

  /**
   * Handle character stat updates
   */
  handleCharacterUpdate(payload) {
    const { eventType, new: newData, old: oldData } = payload;
    
    // Trigger haptic feedback for stat changes
    if (eventType === 'UPDATE') {
      this.triggerStatChangeHaptics(oldData, newData);
    }
    
    // Cache the latest character data
    this.characterCache = newData;
    
    // Execute callbacks
    this.executeCallbacks('character_update', {
      eventType,
      character: newData,
      changes: this.calculateStatChanges(oldData, newData)
    });
  }

  /**
   * Handle new action logs
   */
  handleActionLog(payload) {
    const { new: action } = payload;
    
    // Trigger character progression calculation
    this.calculateCharacterProgression(action);
    
    // Execute callbacks
    this.executeCallbacks('action_logged', {
      action,
      timestamp: new Date(action.created_at)
    });
  }

  /**
   * Handle battle updates
   */
  handleBattleUpdate(payload) {
    const { eventType, new: battleData } = payload;
    
    // Trigger battle haptics
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Execute callbacks
    this.executeCallbacks('battle_update', {
      eventType,
      battle: battleData
    });
  }

  /**
   * Handle achievement unlocks
   */
  handleAchievementUnlock(payload) {
    const { new: achievement } = payload;
    
    // Trigger celebration haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Execute callbacks
    this.executeCallbacks('achievement_unlocked', {
      achievement,
      timestamp: new Date(achievement.completed_at)
    });
  }

  /**
   * Handle friend activities
   */
  handleFriendActivity(payload) {
    const { new: activity } = payload;
    
    // Execute callbacks
    this.executeCallbacks('friend_activity', {
      activity,
      timestamp: new Date(activity.created_at)
    });
  }

  /**
   * Handle guild messages
   */
  handleGuildMessage(payload) {
    const { new: message } = payload;
    
    // Execute callbacks
    this.executeCallbacks('guild_message', {
      message,
      timestamp: new Date(message.created_at)
    });
  }

  /**
   * Calculate stat changes between old and new data
   */
  calculateStatChanges(oldData, newData) {
    if (!oldData || !newData) return {};
    
    const changes = {};
    const stats = ['health', 'strength', 'stamina', 'happiness', 'weight', 'xp', 'level'];
    
    stats.forEach(stat => {
      if (oldData[stat] !== newData[stat]) {
        changes[stat] = {
          old: oldData[stat],
          new: newData[stat],
          delta: newData[stat] - oldData[stat]
        };
      }
    });
    
    return changes;
  }

  /**
   * Calculate character progression from action
   */
  async calculateCharacterProgression(action) {
    if (!this.characterCache) return;
    
    const progressionRules = {
      workout: {
        strength: 2,
        stamina: 3,
        health: 1,
        happiness: 2,
        xp: action.xp_gained || 25
      },
      meal: {
        health: action.action_data?.is_healthy ? 2 : -1,
        weight: action.action_data?.is_healthy ? -0.5 : 0.5,
        happiness: 1,
        xp: action.xp_gained || 10
      },
      battle: {
        strength: 1,
        stamina: -2,
        happiness: action.action_data?.result === 'win' ? 3 : -1,
        xp: action.xp_gained || 50
      }
    };
    
    const rules = progressionRules[action.action_type];
    if (!rules) return;
    
    // Apply stat changes
    const updates = {};
    Object.entries(rules).forEach(([stat, change]) => {
      if (stat === 'xp') {
        updates.xp = Math.min(this.characterCache.xp + change, 999999);
      } else if (this.characterCache[stat] !== undefined) {
        const newValue = this.characterCache[stat] + change;
        // Clamp values based on stat limits
        if (stat === 'weight') {
          updates[stat] = Math.max(30, Math.min(70, newValue));
        } else {
          updates[stat] = Math.max(0, Math.min(100, newValue));
        }
      }
    });
    
    // Check for level up
    if (updates.xp >= this.characterCache.xp_to_next) {
      updates.level = this.characterCache.level + 1;
      updates.xp = updates.xp - this.characterCache.xp_to_next;
      updates.xp_to_next = this.calculateXPToNext(updates.level);
    }
    
    // Update character in database
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('characters')
        .update({
          ...updates,
          last_update: new Date().toISOString()
        })
        .eq('user_id', action.user_id);
        
      if (error) {
        console.error('Failed to update character stats:', error);
      }
    }
  }

  /**
   * Calculate XP needed for next level
   */
  calculateXPToNext(level) {
    return 100 * Math.pow(1.5, level - 1);
  }

  /**
   * Trigger haptic feedback for stat changes
   */
  triggerStatChangeHaptics(oldData, newData) {
    if (!oldData || !newData) return;
    
    // Level up - strong celebration
    if (newData.level > oldData.level) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
      return;
    }
    
    // Stat improvements - light feedback
    const improved = ['health', 'strength', 'stamina', 'happiness'].some(
      stat => newData[stat] > oldData[stat]
    );
    
    if (improved) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  /**
   * Register callback for real-time events
   */
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Execute callbacks for an event
   */
  executeCallbacks(event, data) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error executing callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Handle connection errors with reconnection logic
   */
  async handleConnectionError() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.executeCallbacks('connection_failed', {
        attempts: this.reconnectAttempts
      });
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.reconnect();
        this.reconnectAttempts = 0;
        console.log('Reconnection successful');
        this.executeCallbacks('connection_restored', {});
      } catch (error) {
        this.handleConnectionError();
      }
    }, delay);
  }

  /**
   * Reconnect all subscriptions
   */
  async reconnect() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    // Cleanup existing subscriptions
    await this.cleanup();
    
    // Reinitialize
    await this.initialize(user.id);
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup() {
    console.log('🧹 Cleaning up real-time subscriptions');
    
    for (const [key, subscription] of this.subscriptions) {
      try {
        await supabase.removeChannel(subscription);
      } catch (error) {
        console.error(`Failed to remove ${key} subscription:`, error);
      }
    }
    
    this.subscriptions.clear();
    this.callbacks.clear();
    this.isConnected = false;
    this.characterCache = null;
  }
}

// Export singleton instance
export default new RealtimeSubscriptionManager();