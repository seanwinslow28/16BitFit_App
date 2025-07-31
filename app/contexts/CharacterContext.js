import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial state
const initialState = {
  characterStats: {
    health: 100,
    strength: 50,
    stamina: 50,
    speed: 50,
    level: 1,
    experience: 0,
  },
  characterArchetype: null, // 'strength', 'speed', or 'balanced'
  characterName: null,
  activities: [],
  nutrition: [],
  lastSync: null,
  streak: 0,
  totalWorkouts: 0,
  achievements: [],
  createdAt: null,
};

// Action types
const ActionTypes = {
  UPDATE_STATS: 'UPDATE_STATS',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  ADD_NUTRITION: 'ADD_NUTRITION',
  LEVEL_UP: 'LEVEL_UP',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  LOAD_STATE: 'LOAD_STATE',
  RESET_CHARACTER: 'RESET_CHARACTER',
  UPDATE_STREAK: 'UPDATE_STREAK',
  SET_CHARACTER_ARCHETYPE: 'SET_CHARACTER_ARCHETYPE',
};

// Stat calculation formulas based on activities
const calculateStatsFromActivity = (activity) => {
  const statChanges = {
    health: 0,
    strength: 0,
    stamina: 0,
    speed: 0,
    experience: 0,
  };

  switch (activity.category) {
    case 'gym':
      statChanges.strength += activity.intensity * 3;
      statChanges.stamina += activity.intensity * 1;
      statChanges.health += activity.intensity * 1;
      statChanges.experience += activity.duration * 10;
      break;
    case 'cardio':
      statChanges.stamina += activity.intensity * 3;
      statChanges.speed += activity.intensity * 2;
      statChanges.strength += activity.intensity * 0.5;
      statChanges.experience += activity.duration * 10;
      break;
    case 'yoga':
      statChanges.health += activity.intensity * 3;
      statChanges.stamina += activity.intensity * 1;
      statChanges.speed += activity.intensity * 0.5;
      statChanges.experience += activity.duration * 8;
      break;
    case 'sports':
      statChanges.speed += activity.intensity * 2;
      statChanges.stamina += activity.intensity * 2;
      statChanges.strength += activity.intensity * 1;
      statChanges.experience += activity.duration * 11;
      break;
    case 'walking':
      statChanges.health += activity.intensity * 2;
      statChanges.stamina += activity.intensity * 1;
      statChanges.speed += activity.intensity * 0.5;
      statChanges.experience += activity.duration * 7;
      break;
    case 'strength':
      statChanges.strength += activity.intensity * 2.5;
      statChanges.health += activity.intensity * 1.2;
      statChanges.experience += activity.duration * 12;
      break;
    case 'wellness':
      statChanges.health += activity.intensity * 3;
      statChanges.stamina += activity.intensity * 1;
      statChanges.experience += activity.duration * 8;
      break;
    case 'custom':
      // Balanced distribution for custom activities
      statChanges.health += activity.intensity * 1.2;
      statChanges.strength += activity.intensity * 1.2;
      statChanges.stamina += activity.intensity * 1.2;
      statChanges.speed += activity.intensity * 1.2;
      statChanges.experience += activity.duration * 10;
      break;
  }

  return statChanges;
};

// Nutrition impact on stats
const calculateStatsFromNutrition = (nutrition) => {
  const statChanges = {
    health: 0,
    strength: 0,
    stamina: 0,
    speed: 0,
  };

  switch (nutrition.category) {
    case 'protein':
      statChanges.strength += 2;
      statChanges.health += 1;
      break;
    case 'carbs':
      statChanges.stamina += 2;
      statChanges.speed += 1;
      break;
    case 'vegetables':
      statChanges.health += 3;
      statChanges.stamina += 1;
      break;
    case 'junk':
      statChanges.health -= 2;
      statChanges.stamina -= 1;
      break;
  }

  return statChanges;
};

// Reducer
const characterReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_STATS: {
      const newStats = {
        ...state.characterStats,
        ...action.payload,
      };

      // Cap stats at 100
      Object.keys(newStats).forEach(key => {
        if (key !== 'level' && key !== 'experience' && newStats[key] > 100) {
          newStats[key] = 100;
        }
        if (newStats[key] < 0) {
          newStats[key] = 0;
        }
      });

      // Check for level up
      const experiencePerLevel = 1000;
      const newLevel = Math.floor(newStats.experience / experiencePerLevel) + 1;
      if (newLevel > state.characterStats.level) {
        return characterReducer(
          { ...state, characterStats: newStats },
          { type: ActionTypes.LEVEL_UP, payload: newLevel }
        );
      }

      return {
        ...state,
        characterStats: newStats,
      };
    }

    case ActionTypes.ADD_ACTIVITY: {
      const activity = action.payload;
      const statChanges = calculateStatsFromActivity(activity);
      
      const newStats = { ...state.characterStats };
      Object.keys(statChanges).forEach(key => {
        newStats[key] = Math.min(100, newStats[key] + statChanges[key]);
      });

      return {
        ...state,
        characterStats: newStats,
        activities: [...state.activities, activity],
        totalWorkouts: state.totalWorkouts + 1,
        lastSync: new Date().toISOString(),
      };
    }

    case ActionTypes.ADD_NUTRITION: {
      const nutrition = action.payload;
      const statChanges = calculateStatsFromNutrition(nutrition);
      
      const newStats = { ...state.characterStats };
      Object.keys(statChanges).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, newStats[key] + statChanges[key]));
      });

      return {
        ...state,
        characterStats: newStats,
        nutrition: [...state.nutrition, nutrition],
        lastSync: new Date().toISOString(),
      };
    }

    case ActionTypes.LEVEL_UP: {
      return {
        ...state,
        characterStats: {
          ...state.characterStats,
          level: action.payload,
          // Bonus stats on level up
          health: Math.min(100, state.characterStats.health + 5),
          strength: Math.min(100, state.characterStats.strength + 3),
          stamina: Math.min(100, state.characterStats.stamina + 3),
          speed: Math.min(100, state.characterStats.speed + 3),
        },
        achievements: [...state.achievements, `Reached Level ${action.payload}!`],
      };
    }

    case ActionTypes.ADD_ACHIEVEMENT: {
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };
    }

    case ActionTypes.UPDATE_STREAK: {
      return {
        ...state,
        streak: action.payload,
      };
    }

    case ActionTypes.LOAD_STATE: {
      return {
        ...state,
        ...action.payload,
      };
    }

    case ActionTypes.RESET_CHARACTER: {
      return initialState;
    }

    case ActionTypes.SET_CHARACTER_ARCHETYPE: {
      return {
        ...state,
        characterArchetype: action.payload.archetype,
        characterName: action.payload.name,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
    }

    default:
      return state;
  }
};

// Context
const CharacterContext = createContext();

// Storage key
const STORAGE_KEY = '@16bitfit_character_state';

// Provider component
export const CharacterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Load state from storage on mount
  useEffect(() => {
    loadCharacterState();
  }, []);

  // Save state to storage whenever it changes
  useEffect(() => {
    saveCharacterState(state);
  }, [state]);

  const loadCharacterState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        dispatch({ type: ActionTypes.LOAD_STATE, payload: JSON.parse(savedState) });
      }
    } catch (error) {
      console.error('Error loading character state:', error);
    }
  };

  const saveCharacterState = async (stateToSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving character state:', error);
    }
  };

  // Action creators
  const updateStats = useCallback((stats) => {
    dispatch({ type: ActionTypes.UPDATE_STATS, payload: stats });
  }, []);

  const addActivity = useCallback((activity) => {
    dispatch({ 
      type: ActionTypes.ADD_ACTIVITY, 
      payload: {
        ...activity,
        timestamp: new Date().toISOString(),
      }
    });
  }, []);

  const addNutrition = useCallback((nutrition) => {
    dispatch({ 
      type: ActionTypes.ADD_NUTRITION, 
      payload: {
        ...nutrition,
        timestamp: new Date().toISOString(),
      }
    });
  }, []);

  const addAchievement = useCallback((achievement) => {
    dispatch({ type: ActionTypes.ADD_ACHIEVEMENT, payload: achievement });
  }, []);

  const updateStreak = useCallback((streak) => {
    dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streak });
  }, []);

  const resetCharacter = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_CHARACTER });
  }, []);

  const setCharacterArchetype = useCallback((archetype, name) => {
    dispatch({ 
      type: ActionTypes.SET_CHARACTER_ARCHETYPE, 
      payload: { archetype, name, createdAt: new Date().toISOString() }
    });
  }, []);

  const createGuestCharacter = useCallback(async ({ archetype, name }) => {
    // Create a guest character with default stats
    const guestCharacter = {
      id: 'guest-' + Date.now(),
      archetype,
      name,
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    
    // Set initial stats based on archetype
    const archetypeStats = {
      power: { strength: 75, stamina: 50, health: 70, speed: 40 },
      speed: { strength: 40, stamina: 75, health: 60, speed: 80 },
      balance: { strength: 60, stamina: 60, health: 65, speed: 60 },
    };
    
    const stats = archetypeStats[archetype] || archetypeStats.balance;
    
    // Update state
    dispatch({ 
      type: ActionTypes.SET_CHARACTER_ARCHETYPE, 
      payload: { archetype, name, createdAt: guestCharacter.createdAt }
    });
    
    dispatch({ 
      type: ActionTypes.UPDATE_STATS, 
      payload: stats 
    });
    
    // Save guest state
    await saveCharacterState({ ...state, characterStats: stats });
    
    return guestCharacter;
  }, [state]);

  const value = {
    ...state,
    updateStats,
    addActivity,
    addNutrition,
    addAchievement,
    updateStreak,
    resetCharacter,
    setCharacterArchetype,
    createGuestCharacter,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Custom hook to use the character context
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};