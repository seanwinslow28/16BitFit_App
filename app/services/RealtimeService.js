/**
 * Realtime Service for 16BitFit
 * Handles all real-time subscriptions using standard Supabase Realtime
 */

import { supabase } from './supabaseClient';

class RealtimeService {
  constructor() {
    this.channels = new Map();
    this.callbacks = new Map();
  }

  /**
   * Subscribe to character updates
   */
  subscribeToCharacter(characterId, onUpdate) {
    const channelName = `character-${characterId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        (payload) => {
          console.log('Character update:', payload);
          onUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'character_stats',
          filter: `character_id=eq.${characterId}`
        },
        (payload) => {
          console.log('Character stats update:', payload);
          onUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'character_evolution',
          filter: `character_id=eq.${characterId}`
        },
        (payload) => {
          console.log('Character evolution update:', payload);
          onUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to battle updates
   */
  subscribeToBattles(userId, onBattleUpdate) {
    const channelName = `battles-${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battles',
          filter: `player_character_id=eq.${userId}`
        },
        (payload) => {
          console.log('New battle result:', payload);
          onBattleUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to matchmaking queue
   */
  subscribeToMatchmaking(onMatchUpdate) {
    const channelName = 'matchmaking-queue';
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchmaking_queue'
        },
        (payload) => {
          console.log('Matchmaking update:', payload);
          onMatchUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to guild chat
   */
  subscribeToGuildChat(guildId, onNewMessage) {
    const channelName = `guild-chat-${guildId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_chat',
          filter: `guild_id=eq.${guildId}`
        },
        (payload) => {
          console.log('New guild message:', payload);
          onNewMessage(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to activity updates for immediate stat feedback
   */
  subscribeToActivities(userId, onActivityLogged) {
    const channelName = `activities-${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New activity logged:', payload);
          onActivityLogged(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Broadcast game state (for PvP battles)
   */
  broadcastGameState(battleId, gameState) {
    const channel = supabase.channel(`battle-${battleId}`);
    
    channel.send({
      type: 'broadcast',
      event: 'game-state',
      payload: gameState
    });
  }

  /**
   * Subscribe to game state broadcasts
   */
  subscribeToGameState(battleId, onStateUpdate) {
    const channel = supabase
      .channel(`battle-${battleId}`)
      .on(
        'broadcast',
        { event: 'game-state' },
        (payload) => {
          console.log('Game state update:', payload);
          onStateUpdate(payload);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Use Presence for real-time player status
   */
  trackPresence(userId, status = 'online') {
    const channel = supabase.channel('online-users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Online users:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            status: status
          });
        }
      });

    return channel;
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export default new RealtimeService();