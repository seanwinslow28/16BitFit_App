/**
 * Character Evolution Hook
 * Integrates evolution system with character context and provides easy access to evolution state
 */

import { useState, useEffect, useCallback } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import evolutionManager from '../services/CharacterEvolutionSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVITY_KEY = '@16bitfit_last_activity_date';

export const useCharacterEvolution = () => {
  const { 
    streak, 
    updateStreak, 
    addActivity,
    characterStats,
    totalWorkouts 
  } = useCharacter();
  
  const [currentEvolution, setCurrentEvolution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvolutionCeremony, setShowEvolutionCeremony] = useState(false);
  const [showTransformation, setShowTransformation] = useState(false);
  const [previousStage, setPreviousStage] = useState(0);
  const [showActivityFeedback, setShowActivityFeedback] = useState(false);
  const [lastActivityFeedback, setLastActivityFeedback] = useState(null);

  // Initialize evolution system
  useEffect(() => {
    initializeEvolution();
  }, []);

  const initializeEvolution = async () => {
    try {
      await evolutionManager.initialize();
      setCurrentEvolution(evolutionManager.getCurrentEvolution());
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing evolution:', error);
      setIsLoading(false);
    }
  };

  // Track workout completion
  const trackWorkout = useCallback(async (workoutType = 'strength', intensity = 'medium') => {
    try {
      const today = new Date();
      
      // Record workout in evolution manager
      const { totalWorkouts, currentStreak, workoutType: type } = evolutionManager.recordWorkout(workoutType, today);
      
      // Update character context
      updateStreak(currentStreak);
      if (addActivity) {
        addActivity({
          type: workoutType,
          intensity,
          date: today.toISOString(),
        });
      }
      
      // Check for evolution
      const evolutionResult = await checkAndTriggerEvolution();
      
      // Calculate impact based on workout type and intensity
      const impact = calculateWorkoutImpact(workoutType, intensity);
      
      // Show activity feedback
      const workoutsUntilEvolution = evolutionManager.getWorkoutsUntilNextEvolution();
      setLastActivityFeedback({
        activityType: workoutType,
        intensity,
        totalWorkouts,
        streakContinued: currentStreak > 1,
        workoutsUntilEvolution,
        impact,
        evolutionProgress: evolutionManager.getEvolutionProgress(),
      });
      setShowActivityFeedback(true);
      
      // Save evolution state
      await evolutionManager.save();
      
      return { 
        success: true,
        totalWorkouts,
        currentStreak,
        evolved: evolutionResult.evolved,
        workoutsUntilEvolution,
        evolutionProgress: evolutionManager.getEvolutionProgress(),
      };
    } catch (error) {
      console.error('Error tracking workout:', error);
      return { error };
    }
  }, [updateStreak, addActivity]);

  // Calculate workout impact based on type and intensity
  const calculateWorkoutImpact = (workoutType, intensity) => {
    const typeMultipliers = {
      strength: 1.2,
      cardio: 1.0,
      wellness: 0.8,
      nutrition: 0.6,
      steps: 0.5,
    };
    
    const intensityMultipliers = {
      low: 0.7,
      medium: 1.0,
      high: 1.3,
      extreme: 1.5,
    };
    
    const typeMultiplier = typeMultipliers[workoutType] || 1.0;
    const intensityMultiplier = intensityMultipliers[intensity] || 1.0;
    const totalImpact = typeMultiplier * intensityMultiplier;
    
    if (totalImpact >= 1.5) return 'extreme';
    if (totalImpact >= 1.2) return 'high';
    if (totalImpact >= 0.8) return 'medium';
    return 'low';
  };

  // Check and trigger evolution
  const checkAndTriggerEvolution = useCallback(async () => {
    const result = evolutionManager.checkEvolution();
    
    if (result.evolved) {
      setPreviousStage(result.previousStage);
      setCurrentEvolution(result.newStage);
      
      // Show transformation animation first
      setShowTransformation(true);
      
      // Then show ceremony after transformation
      setTimeout(() => {
        setShowTransformation(false);
        setShowEvolutionCeremony(true);
      }, 4000);
      
      await evolutionManager.save();
    }
    
    return result;
  }, []);

  // Get evolution-enhanced stats
  const getEvolutionStats = useCallback(() => {
    if (!currentEvolution) return characterStats;
    
    return evolutionManager.applyEvolutionBonuses({
      ...characterStats,
      coins: 0, // This would come from a coins system
    });
  }, [characterStats, currentEvolution]);

  // Get visual effects for current evolution
  const getVisualEffects = useCallback(() => {
    if (!currentEvolution) return null;
    return evolutionManager.getVisualEffects();
  }, [currentEvolution]);

  // Get progress to next evolution
  const getEvolutionProgress = useCallback(() => {
    return {
      current: currentEvolution,
      next: evolutionManager.getNextEvolution(),
      progress: evolutionManager.getEvolutionProgress(),
      workoutsUntilNext: evolutionManager.getWorkoutsUntilNextEvolution(),
      currentStreak: evolutionManager.currentStreak,
      totalWorkouts: evolutionManager.totalWorkouts,
      workoutsByType: evolutionManager.workoutsByType,
      analytics: evolutionManager.getEvolutionAnalytics(),
    };
  }, [currentEvolution]);

  // Handle evolution ceremony completion
  const handleEvolutionCeremonyComplete = useCallback(() => {
    setShowEvolutionCeremony(false);
  }, []);

  // Handle transformation completion
  const handleTransformationComplete = useCallback(() => {
    setShowTransformation(false);
  }, []);

  // Handle activity feedback completion
  const handleActivityFeedbackComplete = useCallback(() => {
    setShowActivityFeedback(false);
    setLastActivityFeedback(null);
  }, []);

  // Get archetype-specific evolution theme
  const getArchetypeTheme = useCallback((archetype) => {
    return evolutionManager.getArchetypeEvolutionTheme(archetype);
  }, []);

  // Get evolution motivation message
  const getMotivation = useCallback(() => {
    const stage = currentEvolution?.id || 0;
    return evolutionManager.getEvolutionMotivation(stage);
  }, [currentEvolution]);

  // Debug methods (only in dev)
  const debugSetEvolution = useCallback(async (stageId, workouts = null) => {
    if (__DEV__) {
      const result = await evolutionManager.debugSetEvolution(stageId, workouts);
      setCurrentEvolution(result);
      if (workouts !== null && updateStreak) {
        // Update context with new workout count
        updateStreak(evolutionManager.currentStreak);
      }
      return result;
    }
  }, [updateStreak]);

  const resetEvolution = useCallback(async () => {
    await evolutionManager.reset();
    setCurrentEvolution(evolutionManager.getCurrentEvolution());
    updateStreak(0);
  }, [updateStreak]);

  return {
    // State
    currentEvolution,
    isLoading,
    showEvolutionCeremony,
    showTransformation,
    showActivityFeedback,
    previousStage,
    lastActivityFeedback,
    
    // Methods
    trackWorkout,
    getEvolutionStats,
    getVisualEffects,
    getEvolutionProgress,
    getArchetypeTheme,
    getMotivation,
    
    // Handlers
    handleEvolutionCeremonyComplete,
    handleTransformationComplete,
    handleActivityFeedbackComplete,
    
    // Debug
    debugSetEvolution,
    resetEvolution,
  };
};

export default useCharacterEvolution;