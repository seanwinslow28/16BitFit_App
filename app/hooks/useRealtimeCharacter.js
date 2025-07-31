/**
 * useRealtimeCharacter Hook
 * React hook for accessing real-time character updates and actions
 */

import { useState, useEffect, useCallback } from 'react';
import CharacterRealtimeService from '../services/CharacterRealtimeService';
import RealtimeSubscriptionManager from '../services/RealtimeSubscriptionManager';
import * as Haptics from 'expo-haptics';

export function useRealtimeCharacter(userId) {
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    let unsubscribers = [];

    const initializeRealtime = async () => {
      try {
        setIsLoading(true);

        // Initialize realtime subscription manager
        const connected = await RealtimeSubscriptionManager.initialize(userId);
        setIsConnected(connected);

        // Initialize character service
        await CharacterRealtimeService.initialize(userId);
        
        // Get initial character state
        const initialCharacter = CharacterRealtimeService.getCharacter();
        setCharacter(initialCharacter);

        // Subscribe to character updates
        const unsubCharacter = CharacterRealtimeService.on('character_updated', ({ character, changes }) => {
          setCharacter(character);
          setLastUpdate({
            timestamp: new Date(),
            changes
          });
        });
        unsubscribers.push(unsubCharacter);

        // Subscribe to animations
        const unsubAnimation = CharacterRealtimeService.on('animation_start', (animation) => {
          setAnimations(prev => [...prev, animation]);
          
          // Remove animation after it completes
          setTimeout(() => {
            setAnimations(prev => prev.filter(a => a !== animation));
          }, 2000);
        });
        unsubscribers.push(unsubAnimation);

        // Subscribe to connection status
        const unsubConnection = RealtimeSubscriptionManager.on('connection_failed', () => {
          setIsConnected(false);
        });
        unsubscribers.push(unsubConnection);

        const unsubReconnect = RealtimeSubscriptionManager.on('connection_restored', () => {
          setIsConnected(true);
        });
        unsubscribers.push(unsubReconnect);

      } catch (error) {
        console.error('Failed to initialize realtime character:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRealtime();

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      CharacterRealtimeService.cleanup();
      RealtimeSubscriptionManager.cleanup();
    };
  }, [userId]);

  // Log workout action
  const logWorkout = useCallback(async (workoutData) => {
    try {
      const success = await CharacterRealtimeService.logWorkout(workoutData);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return success;
    } catch (error) {
      console.error('Failed to log workout:', error);
      return false;
    }
  }, []);

  // Log meal action
  const logMeal = useCallback(async (mealData) => {
    try {
      const success = await CharacterRealtimeService.logMeal(mealData);
      if (success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return success;
    } catch (error) {
      console.error('Failed to log meal:', error);
      return false;
    }
  }, []);

  // Update character stats directly
  const updateStats = useCallback(async (statUpdates) => {
    try {
      await CharacterRealtimeService.updateCharacterStats(statUpdates);
      return true;
    } catch (error) {
      console.error('Failed to update stats:', error);
      return false;
    }
  }, []);

  // Get character progress to next level
  const getLevelProgress = useCallback(() => {
    if (!character) return 0;
    return (character.xp / character.xp_to_next) * 100;
  }, [character]);

  // Get character health status
  const getHealthStatus = useCallback(() => {
    if (!character) return 'unknown';
    
    if (character.health >= 80) return 'excellent';
    if (character.health >= 60) return 'good';
    if (character.health >= 40) return 'fair';
    if (character.health >= 20) return 'poor';
    return 'critical';
  }, [character]);

  // Get character mood based on happiness
  const getMood = useCallback(() => {
    if (!character) return 'neutral';
    
    if (character.happiness >= 80) return 'ecstatic';
    if (character.happiness >= 60) return 'happy';
    if (character.happiness >= 40) return 'content';
    if (character.happiness >= 20) return 'sad';
    return 'depressed';
  }, [character]);

  // Get evolution stage name
  const getEvolutionName = useCallback(() => {
    if (!character) return 'Unknown';
    
    const stages = ['Newbie', 'Trainee', 'Fighter', 'Champion'];
    return stages[character.evolution_stage] || 'Unknown';
  }, [character]);

  return {
    character,
    isLoading,
    isConnected,
    lastUpdate,
    animations,
    
    // Actions
    logWorkout,
    logMeal,
    updateStats,
    
    // Computed properties
    levelProgress: getLevelProgress(),
    healthStatus: getHealthStatus(),
    mood: getMood(),
    evolutionName: getEvolutionName(),
    
    // Helper functions
    getLevelProgress,
    getHealthStatus,
    getMood,
    getEvolutionName
  };
}