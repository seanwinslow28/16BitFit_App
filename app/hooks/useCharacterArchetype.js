/**
 * useCharacterArchetype Hook
 * Manages character archetype selection and stat modifiers
 * Integrates with real-time character system
 */

import { useEffect, useMemo } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import CharacterRealtimeService from '../services/CharacterRealtimeService';

// Archetype stat modifiers
const ARCHETYPE_MODIFIERS = {
  strength: {
    strengthMultiplier: 1.5,
    speedMultiplier: 0.8,
    staminaMultiplier: 0.9,
    healthMultiplier: 1.2,
    experienceGainMultiplier: 1.1,
  },
  speed: {
    strengthMultiplier: 0.8,
    speedMultiplier: 1.5,
    staminaMultiplier: 1.3,
    healthMultiplier: 0.9,
    experienceGainMultiplier: 1.0,
  },
  balanced: {
    strengthMultiplier: 1.0,
    speedMultiplier: 1.0,
    staminaMultiplier: 1.0,
    healthMultiplier: 1.0,
    experienceGainMultiplier: 1.15,
  },
};

// Archetype-specific animations
const ARCHETYPE_ANIMATIONS = {
  strength: {
    idle: 'strength_idle',
    workout: 'strength_workout',
    victory: 'strength_victory',
    evolve: 'strength_evolve',
  },
  speed: {
    idle: 'speed_idle',
    workout: 'speed_workout',
    victory: 'speed_victory',
    evolve: 'speed_evolve',
  },
  balanced: {
    idle: 'balanced_idle',
    workout: 'balanced_workout',
    victory: 'balanced_victory',
    evolve: 'balanced_evolve',
  },
};

export const useCharacterArchetype = () => {
  const { characterArchetype, characterStats } = useCharacter();

  // Get current archetype modifiers
  const modifiers = useMemo(() => {
    if (!characterArchetype) return ARCHETYPE_MODIFIERS.balanced;
    return ARCHETYPE_MODIFIERS[characterArchetype];
  }, [characterArchetype]);

  // Get archetype-specific animations
  const animations = useMemo(() => {
    if (!characterArchetype) return ARCHETYPE_ANIMATIONS.balanced;
    return ARCHETYPE_ANIMATIONS[characterArchetype];
  }, [characterArchetype]);

  // Apply archetype modifiers to stat gains
  const applyArchetypeModifiers = (statGains) => {
    if (!modifiers) return statGains;

    return {
      strength: Math.round(statGains.strength * modifiers.strengthMultiplier),
      speed: Math.round(statGains.speed * modifiers.speedMultiplier),
      stamina: Math.round(statGains.stamina * modifiers.staminaMultiplier),
      health: Math.round(statGains.health * modifiers.healthMultiplier),
      experience: Math.round(statGains.experience * modifiers.experienceGainMultiplier),
    };
  };

  // Get archetype-specific workout recommendations
  const getWorkoutRecommendations = () => {
    switch (characterArchetype) {
      case 'strength':
        return [
          { type: 'strength', name: 'Weight Training', efficiency: 'HIGH' },
          { type: 'strength', name: 'Push-ups', efficiency: 'HIGH' },
          { type: 'cardio', name: 'HIIT', efficiency: 'MEDIUM' },
        ];
      case 'speed':
        return [
          { type: 'cardio', name: 'Running', efficiency: 'HIGH' },
          { type: 'cardio', name: 'Cycling', efficiency: 'HIGH' },
          { type: 'sports', name: 'Basketball', efficiency: 'MEDIUM' },
        ];
      case 'balanced':
        return [
          { type: 'strength', name: 'Circuit Training', efficiency: 'HIGH' },
          { type: 'cardio', name: 'Swimming', efficiency: 'HIGH' },
          { type: 'wellness', name: 'Yoga', efficiency: 'HIGH' },
        ];
      default:
        return [];
    }
  };

  // Get archetype-specific nutrition recommendations
  const getNutritionRecommendations = () => {
    switch (characterArchetype) {
      case 'strength':
        return {
          protein: { target: 'HIGH', percentage: 40 },
          carbs: { target: 'MEDIUM', percentage: 35 },
          fats: { target: 'MEDIUM', percentage: 25 },
        };
      case 'speed':
        return {
          protein: { target: 'MEDIUM', percentage: 25 },
          carbs: { target: 'HIGH', percentage: 50 },
          fats: { target: 'LOW', percentage: 25 },
        };
      case 'balanced':
        return {
          protein: { target: 'MEDIUM', percentage: 30 },
          carbs: { target: 'MEDIUM', percentage: 40 },
          fats: { target: 'MEDIUM', percentage: 30 },
        };
      default:
        return null;
    }
  };

  // Sync archetype with real-time service
  useEffect(() => {
    if (characterArchetype && CharacterRealtimeService.character) {
      CharacterRealtimeService.updateCharacterArchetype(characterArchetype);
    }
  }, [characterArchetype]);

  return {
    archetype: characterArchetype,
    modifiers,
    animations,
    applyArchetypeModifiers,
    getWorkoutRecommendations,
    getNutritionRecommendations,
    isStrengthFocused: characterArchetype === 'strength',
    isSpeedFocused: characterArchetype === 'speed',
    isBalanced: characterArchetype === 'balanced',
  };
};

export default useCharacterArchetype;