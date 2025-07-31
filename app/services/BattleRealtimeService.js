/**
 * Battle Realtime Service
 * Manages real-time battle state synchronization for multiplayer battles
 * Handles battle matchmaking, state sync, and move execution
 */

import { supabase } from './supabaseClient';
import RealtimeSubscriptionManager from './RealtimeSubscriptionManager';
import * as Haptics from 'expo-haptics';

class BattleRealtimeService {
  constructor() {
    this.currentBattle = null;
    this.battleSubscription = null;
    this.moveQueue = [];
    this.listeners = new Map();
    this.battleState = 'idle'; // idle, searching, ready, fighting, finished
    this.opponentPresence = null;
  }

  /**
   * Initialize battle service
   */
  async initialize(userId) {
    this.userId = userId;
    
    // Set up real-time listeners
    this.setupRealtimeListeners();
    
    return true;
  }

  /**
   * Set up real-time listeners
   */
  setupRealtimeListeners() {
    // Listen for battle updates
    RealtimeSubscriptionManager.on('battle_update', (data) => {
      this.handleBattleUpdate(data);
    });
  }

  /**
   * Start matchmaking for PvP battle
   */
  async startMatchmaking(userStats) {
    try {
      this.battleState = 'searching';
      this.notifyListeners('matchmaking_started', {});
      
      // Update user status to searching
      await supabase
        .from('user_profiles')
        .update({ status: 'searching_battle' })
        .eq('id', this.userId);
      
      // Create matchmaking entry
      const { data: matchmaking, error } = await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: this.userId,
          rating: userStats.rating || 1000,
          character_level: userStats.level,
          searching_since: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Subscribe to matchmaking updates
      await this.subscribeToMatchmaking(matchmaking.id);
      
      // Start timeout for matchmaking
      setTimeout(() => {
        if (this.battleState === 'searching') {
          this.cancelMatchmaking();
        }
      }, 30000); // 30 second timeout
      
      return true;
    } catch (error) {
      console.error('Failed to start matchmaking:', error);
      this.battleState = 'idle';
      return false;
    }
  }

  /**
   * Subscribe to matchmaking updates
   */
  async subscribeToMatchmaking(matchmakingId) {
    const subscription = supabase
      .channel(`matchmaking:${matchmakingId}`)
      .on('presence', { event: 'sync' }, () => {
        this.handleMatchmakingSync();
      })
      .on('broadcast', { event: 'match_found' }, (payload) => {
        this.handleMatchFound(payload);
      })
      .subscribe();
      
    this.battleSubscription = subscription;
  }

  /**
   * Handle match found
   */
  async handleMatchFound(payload) {
    const { battleId, opponentId } = payload;
    
    console.log('⚔️ Match found! Battle ID:', battleId);
    this.battleState = 'ready';
    
    // Clean up matchmaking
    await this.cleanupMatchmaking();
    
    // Join battle
    await this.joinBattle(battleId, opponentId);
    
    // Notify listeners
    this.notifyListeners('match_found', { battleId, opponentId });
  }

  /**
   * Join an existing battle
   */
  async joinBattle(battleId, opponentId) {
    try {
      // Load battle data
      const { data: battle, error } = await supabase
        .from('pvp_battles')
        .select('*')
        .eq('id', battleId)
        .single();
        
      if (error) throw error;
      
      this.currentBattle = battle;
      this.battleState = 'fighting';
      
      // Subscribe to battle channel for real-time updates
      await this.subscribeToBattleChannel(battleId);
      
      // Subscribe to opponent presence
      await this.subscribeToOpponentPresence(opponentId);
      
      // Update user status
      await supabase
        .from('user_profiles')
        .update({ status: 'in_battle' })
        .eq('id', this.userId);
        
      return true;
    } catch (error) {
      console.error('Failed to join battle:', error);
      this.battleState = 'idle';
      return false;
    }
  }

  /**
   * Subscribe to battle channel for real-time sync
   */
  async subscribeToBattleChannel(battleId) {
    const channel = supabase.channel(`battle:${battleId}`)
      // Track player presence
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        this.handlePresenceSync(state);
      })
      // Handle battle moves
      .on('broadcast', { event: 'move' }, (payload) => {
        this.handleOpponentMove(payload);
      })
      // Handle battle state changes
      .on('broadcast', { event: 'state_change' }, (payload) => {
        this.handleBattleStateChange(payload);
      })
      // Handle battle end
      .on('broadcast', { event: 'battle_end' }, (payload) => {
        this.handleBattleEnd(payload);
      });
      
    // Track our presence
    await channel.track({
      user_id: this.userId,
      online_at: new Date().toISOString(),
      character_health: this.currentBattle.player1_id === this.userId 
        ? this.currentBattle.player1_health 
        : this.currentBattle.player2_health
    });
    
    await channel.subscribe();
    this.battleSubscription = channel;
  }

  /**
   * Subscribe to opponent presence for connection status
   */
  async subscribeToOpponentPresence(opponentId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', opponentId)
      .single();
      
    this.opponentPresence = data?.status || 'offline';
  }

  /**
   * Execute a battle move
   */
  async executeMove(moveType, moveData) {
    if (this.battleState !== 'fighting') {
      console.warn('Cannot execute move - not in fighting state');
      return false;
    }
    
    try {
      // Add move to queue
      const move = {
        id: `${this.userId}_${Date.now()}`,
        user_id: this.userId,
        type: moveType,
        data: moveData,
        timestamp: new Date().toISOString()
      };
      
      this.moveQueue.push(move);
      
      // Broadcast move to opponent
      await this.battleSubscription.send({
        type: 'broadcast',
        event: 'move',
        payload: move
      });
      
      // Apply move locally for immediate feedback
      this.applyMove(move, true);
      
      // Trigger haptic feedback
      this.triggerMoveFeedback(moveType);
      
      return true;
    } catch (error) {
      console.error('Failed to execute move:', error);
      return false;
    }
  }

  /**
   * Handle opponent move
   */
  handleOpponentMove(payload) {
    const move = payload.payload;
    
    // Add to move queue
    this.moveQueue.push(move);
    
    // Apply move
    this.applyMove(move, false);
    
    // Notify listeners
    this.notifyListeners('opponent_move', move);
  }

  /**
   * Apply move to battle state
   */
  applyMove(move, isOwnMove) {
    if (!this.currentBattle) return;
    
    const damage = this.calculateDamage(move);
    const isPlayer1 = this.userId === this.currentBattle.player1_id;
    
    // Update health based on who made the move
    if (isOwnMove) {
      // We're attacking, damage opponent
      if (isPlayer1) {
        this.currentBattle.player2_health -= damage;
      } else {
        this.currentBattle.player1_health -= damage;
      }
    } else {
      // Opponent attacking, damage us
      if (isPlayer1) {
        this.currentBattle.player1_health -= damage;
      } else {
        this.currentBattle.player2_health -= damage;
      }
    }
    
    // Clamp health values
    this.currentBattle.player1_health = Math.max(0, this.currentBattle.player1_health);
    this.currentBattle.player2_health = Math.max(0, this.currentBattle.player2_health);
    
    // Check for battle end
    if (this.currentBattle.player1_health <= 0 || this.currentBattle.player2_health <= 0) {
      this.endBattle();
    }
    
    // Notify listeners
    this.notifyListeners('battle_state_updated', {
      battle: this.currentBattle,
      lastMove: move,
      damage
    });
  }

  /**
   * Calculate damage for a move
   */
  calculateDamage(move) {
    const baseDamage = {
      light_attack: 5,
      heavy_attack: 10,
      special_attack: 15,
      defend: 0
    };
    
    const base = baseDamage[move.type] || 5;
    const variance = Math.random() * 4 - 2; // ±2 damage variance
    
    return Math.max(1, Math.floor(base + variance));
  }

  /**
   * Trigger haptic feedback for moves
   */
  triggerMoveFeedback(moveType) {
    switch (moveType) {
      case 'light_attack':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'heavy_attack':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'special_attack':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'defend':
        Haptics.selectionAsync();
        break;
    }
  }

  /**
   * End the current battle
   */
  async endBattle() {
    if (this.battleState === 'finished') return;
    
    this.battleState = 'finished';
    
    const isPlayer1 = this.userId === this.currentBattle.player1_id;
    const won = isPlayer1 
      ? this.currentBattle.player1_health > 0 
      : this.currentBattle.player2_health > 0;
    
    // Calculate rewards
    const rewards = {
      xp: won ? 100 : 25,
      coins: won ? 50 : 10,
      rating_change: won ? 25 : -15
    };
    
    // Update battle record
    await supabase
      .from('pvp_battles')
      .update({
        winner_id: won ? this.userId : (isPlayer1 ? this.currentBattle.player2_id : this.currentBattle.player1_id),
        battle_data: {
          moves: this.moveQueue,
          duration: Date.now() - new Date(this.currentBattle.created_at).getTime()
        },
        rating_change_p1: isPlayer1 ? rewards.rating_change : -rewards.rating_change,
        rating_change_p2: isPlayer1 ? -rewards.rating_change : rewards.rating_change
      })
      .eq('id', this.currentBattle.id);
    
    // Update user status
    await supabase
      .from('user_profiles')
      .update({ status: 'online' })
      .eq('id', this.userId);
    
    // Broadcast battle end
    await this.battleSubscription.send({
      type: 'broadcast',
      event: 'battle_end',
      payload: { winner_id: won ? this.userId : null }
    });
    
    // Notify listeners
    this.notifyListeners('battle_ended', {
      won,
      rewards,
      battle: this.currentBattle
    });
    
    // Cleanup
    this.cleanup();
  }

  /**
   * Handle battle end from opponent
   */
  handleBattleEnd(payload) {
    this.battleState = 'finished';
    this.notifyListeners('battle_ended', payload.payload);
    this.cleanup();
  }

  /**
   * Handle presence sync
   */
  handlePresenceSync(state) {
    const opponents = Object.values(state).filter(p => p[0].user_id !== this.userId);
    
    if (opponents.length > 0) {
      this.opponentPresence = 'online';
      this.notifyListeners('opponent_connected', { connected: true });
    } else {
      this.opponentPresence = 'offline';
      this.notifyListeners('opponent_connected', { connected: false });
      
      // Start disconnect timer
      setTimeout(() => {
        if (this.opponentPresence === 'offline' && this.battleState === 'fighting') {
          this.handleOpponentDisconnect();
        }
      }, 10000); // 10 second grace period
    }
  }

  /**
   * Handle opponent disconnect
   */
  async handleOpponentDisconnect() {
    console.log('Opponent disconnected from battle');
    
    // Auto-win for remaining player
    if (this.battleState === 'fighting') {
      const isPlayer1 = this.userId === this.currentBattle.player1_id;
      if (isPlayer1) {
        this.currentBattle.player2_health = 0;
      } else {
        this.currentBattle.player1_health = 0;
      }
      await this.endBattle();
    }
  }

  /**
   * Cancel matchmaking
   */
  async cancelMatchmaking() {
    try {
      // Remove from matchmaking queue
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', this.userId);
      
      // Update status
      await supabase
        .from('user_profiles')
        .update({ status: 'online' })
        .eq('id', this.userId);
      
      this.battleState = 'idle';
      this.notifyListeners('matchmaking_cancelled', {});
      
      // Cleanup
      await this.cleanupMatchmaking();
    } catch (error) {
      console.error('Failed to cancel matchmaking:', error);
    }
  }

  /**
   * Clean up matchmaking subscription
   */
  async cleanupMatchmaking() {
    if (this.battleSubscription) {
      await supabase.removeChannel(this.battleSubscription);
      this.battleSubscription = null;
    }
  }

  /**
   * Add listener for battle events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in battle listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get current battle state
   */
  getBattleState() {
    return {
      state: this.battleState,
      battle: this.currentBattle,
      moveQueue: this.moveQueue,
      opponentConnected: this.opponentPresence === 'online'
    };
  }

  /**
   * Clean up service
   */
  async cleanup() {
    if (this.battleSubscription) {
      await supabase.removeChannel(this.battleSubscription);
      this.battleSubscription = null;
    }
    
    this.currentBattle = null;
    this.moveQueue = [];
    this.battleState = 'idle';
    this.opponentPresence = null;
  }
}

// Export singleton instance
export default new BattleRealtimeService();