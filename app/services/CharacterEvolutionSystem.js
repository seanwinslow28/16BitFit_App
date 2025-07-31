/**
 * Character Evolution System - 5-Stage Transformation
 * Manages character evolution based on workout streaks and fitness achievements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const EVOLUTION_STORAGE_KEY = '@16bitfit_evolution_state';

export const EvolutionStages = {
  ROOKIE: {
    id: 0,
    name: 'Rookie',
    displayName: 'ROOKIE',
    workoutsRequired: 0,
    description: 'Just starting your fitness journey',
    powerMultiplier: 1.0,
    unlockMessage: 'Welcome to 16BitFit! Your journey begins here.',
    visualTheme: {
      primary: '#92CC41',
      secondary: '#527B24',
      auraColor: null,
      particleEffect: null,
      glowIntensity: 0,
    },
    equipment: {
      outfit: 'simple_white_gi',
      belt: 'white_belt',
      accessories: [],
    },
    animations: {
      idle: { frameCount: 4, speed: 0.8 },
      attack: { frameCount: 3, speed: 1.0 },
      special: { frameCount: 0, speed: 0 }, // No special moves yet
    },
    bonuses: {
      statMultiplier: 1.0,
      experienceMultiplier: 1.0,
      coinMultiplier: 1.0,
    },
  },
  
  DEVELOPING: {
    id: 1,
    name: 'Developing',
    displayName: 'DEVELOPING',
    workoutsRequired: 10,
    description: 'Building strength and discipline',
    powerMultiplier: 1.3,
    unlockMessage: '10 Workouts Complete! You\'ve evolved to Developing stage!',
    visualTheme: {
      primary: '#3498db',
      secondary: '#2471a3',
      auraColor: '#3498db',
      particleEffect: 'energy_wisps',
      glowIntensity: 0.3,
    },
    equipment: {
      outfit: 'colored_gi',
      belt: 'blue_belt',
      accessories: ['training_gloves'],
    },
    animations: {
      idle: { frameCount: 6, speed: 1.0 },
      attack: { frameCount: 4, speed: 1.2 },
      special: { frameCount: 5, speed: 1.0 },
    },
    bonuses: {
      statMultiplier: 1.3,
      experienceMultiplier: 1.2,
      coinMultiplier: 1.25,
    },
  },
  
  ESTABLISHED: {
    id: 2,
    name: 'Established',
    displayName: 'ESTABLISHED',
    workoutsRequired: 30,
    description: 'Mastering the art of fitness',
    powerMultiplier: 1.6,
    unlockMessage: '30 Workouts Complete! You\'ve reached Established status!',
    visualTheme: {
      primary: '#9b59b6',
      secondary: '#7d3c98',
      auraColor: '#9b59b6',
      particleEffect: 'power_flames',
      glowIntensity: 0.5,
    },
    equipment: {
      outfit: 'professional_gear',
      belt: 'purple_belt',
      accessories: ['champion_headband', 'power_bracers'],
    },
    animations: {
      idle: { frameCount: 8, speed: 1.0 },
      attack: { frameCount: 5, speed: 1.5 },
      special: { frameCount: 8, speed: 1.2 },
    },
    bonuses: {
      statMultiplier: 1.6,
      experienceMultiplier: 1.4,
      coinMultiplier: 1.5,
    },
  },
  
  ADVANCED: {
    id: 3,
    name: 'Advanced',
    displayName: 'ADVANCED',
    workoutsRequired: 50,
    description: 'Elite fitness warrior',
    powerMultiplier: 1.9,
    unlockMessage: '50 Workouts Complete! You\'ve achieved Advanced status!',
    visualTheme: {
      primary: '#f39c12',
      secondary: '#ca7f0e',
      auraColor: '#ffd700',
      particleEffect: 'golden_energy',
      glowIntensity: 0.7,
    },
    equipment: {
      outfit: 'championship_gear',
      belt: 'golden_belt',
      accessories: ['master_crown', 'golden_gauntlets', 'energy_orbs'],
    },
    animations: {
      idle: { frameCount: 10, speed: 1.0 },
      attack: { frameCount: 6, speed: 1.8 },
      special: { frameCount: 12, speed: 1.5 },
    },
    bonuses: {
      statMultiplier: 1.9,
      experienceMultiplier: 1.6,
      coinMultiplier: 1.75,
    },
  },
  
  LEGEND: {
    id: 4,
    name: 'Legend',
    displayName: 'LEGEND',
    workoutsRequired: 75,
    description: 'Mythical fitness deity',
    powerMultiplier: 2.0,
    unlockMessage: '75 Workouts Complete! You\'ve become a LEGEND!',
    visualTheme: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      auraColor: '#ff0000',
      particleEffect: 'cosmic_energy',
      glowIntensity: 1.0,
    },
    equipment: {
      outfit: 'mythical_armor',
      belt: 'cosmic_belt',
      accessories: ['legendary_crown', 'cosmic_wings', 'power_stones', 'energy_shield'],
    },
    animations: {
      idle: { frameCount: 12, speed: 1.0 },
      attack: { frameCount: 8, speed: 2.0 },
      special: { frameCount: 16, speed: 1.8 },
    },
    bonuses: {
      statMultiplier: 2.0,
      experienceMultiplier: 2.0,
      coinMultiplier: 2.0,
    },
  },
};

class CharacterEvolutionManager {
  constructor() {
    this.currentEvolution = null;
    this.evolutionHistory = [];
    this.totalWorkouts = 0;
    this.workoutsByType = {
      strength: 0,
      cardio: 0,
      wellness: 0,
      nutrition: 0,
      steps: 0,
    };
    this.currentStreak = 0;
    this.lastActivityDate = null;
    this.powerLevel = 1.0;
  }

  async initialize() {
    try {
      const savedData = await AsyncStorage.getItem(EVOLUTION_STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.currentEvolution = data.currentEvolution || 0;
        this.evolutionHistory = data.evolutionHistory || [];
        this.totalWorkouts = data.totalWorkouts || 0;
        this.workoutsByType = data.workoutsByType || {
          strength: 0,
          cardio: 0,
          wellness: 0,
          nutrition: 0,
          steps: 0,
        };
        this.currentStreak = data.currentStreak || 0;
        this.lastActivityDate = data.lastActivityDate;
        this.powerLevel = data.powerLevel || 1.0;
      } else {
        this.currentEvolution = 0;
        this.evolutionHistory = [{
          stage: 0,
          achievedDate: new Date().toISOString(),
        }];
      }
    } catch (error) {
      console.error('Error loading evolution state:', error);
    }
  }

  async save() {
    try {
      const data = {
        currentEvolution: this.currentEvolution,
        evolutionHistory: this.evolutionHistory,
        totalWorkouts: this.totalWorkouts,
        workoutsByType: this.workoutsByType,
        currentStreak: this.currentStreak,
        lastActivityDate: this.lastActivityDate,
        powerLevel: this.powerLevel,
      };
      await AsyncStorage.setItem(EVOLUTION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving evolution state:', error);
    }
  }

  recordWorkout(workoutType = 'strength', date = new Date()) {
    // Update workout counts
    this.totalWorkouts += 1;
    if (this.workoutsByType[workoutType] !== undefined) {
      this.workoutsByType[workoutType] += 1;
    }

    // Update streak tracking
    const today = date.toDateString();
    const lastActive = this.lastActivityDate ? new Date(this.lastActivityDate).toDateString() : null;

    if (lastActive !== today) {
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (lastActive === yesterdayString) {
        this.currentStreak += 1;
      } else {
        this.currentStreak = 1;
      }
      this.lastActivityDate = date.toISOString();
    }

    return { 
      totalWorkouts: this.totalWorkouts,
      currentStreak: this.currentStreak,
      workoutType,
    };
  }

  checkEvolution() {
    const stages = Object.values(EvolutionStages);
    let newStage = null;

    // Find the highest stage the user qualifies for based on total workouts
    for (let i = stages.length - 1; i >= 0; i--) {
      if (this.totalWorkouts >= stages[i].workoutsRequired) {
        if (stages[i].id > this.currentEvolution) {
          newStage = stages[i];
        }
        break;
      }
    }

    if (newStage) {
      const previousStage = this.currentEvolution;
      this.currentEvolution = newStage.id;
      this.powerLevel = newStage.powerMultiplier;
      
      this.evolutionHistory.push({
        stage: newStage.id,
        achievedDate: new Date().toISOString(),
        totalWorkouts: this.totalWorkouts,
        streak: this.currentStreak,
      });
      
      this.save();
      return { evolved: true, newStage, previousStage };
    }

    return { evolved: false };
  }

  getCurrentEvolution() {
    const stages = Object.values(EvolutionStages);
    return stages.find(stage => stage.id === this.currentEvolution) || stages[0];
  }

  getNextEvolution() {
    const stages = Object.values(EvolutionStages);
    const nextStage = stages.find(stage => stage.id === this.currentEvolution + 1);
    return nextStage || null;
  }

  getWorkoutsUntilNextEvolution() {
    const nextStage = this.getNextEvolution();
    if (!nextStage) return null;
    return Math.max(0, nextStage.workoutsRequired - this.totalWorkouts);
  }

  getEvolutionProgress() {
    const current = this.getCurrentEvolution();
    const next = this.getNextEvolution();
    
    if (!next) return 1; // Max evolution reached

    const requiredWorkouts = next.workoutsRequired - current.workoutsRequired;
    const progressWorkouts = this.totalWorkouts - current.workoutsRequired;
    
    return Math.min(1, Math.max(0, progressWorkouts / requiredWorkouts));
  }

  // Get detailed evolution analytics
  getEvolutionAnalytics() {
    const current = this.getCurrentEvolution();
    const next = this.getNextEvolution();
    const workoutsToNext = this.getWorkoutsUntilNextEvolution();
    
    return {
      currentStage: current.displayName,
      currentStageId: current.id,
      totalWorkouts: this.totalWorkouts,
      workoutsByType: this.workoutsByType,
      currentStreak: this.currentStreak,
      powerLevel: this.powerLevel,
      nextStage: next ? next.displayName : 'MAX LEVEL',
      workoutsToNext,
      progressPercentage: Math.round(this.getEvolutionProgress() * 100),
      dominantWorkoutType: this.getDominantWorkoutType(),
      evolutionHistory: this.evolutionHistory,
    };
  }

  // Determine which workout type the user does most
  getDominantWorkoutType() {
    let maxType = 'strength';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(this.workoutsByType)) {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    }
    
    return maxType;
  }

  applyEvolutionBonuses(baseStats) {
    const evolution = this.getCurrentEvolution();
    const bonuses = evolution.bonuses;

    return {
      health: Math.round(baseStats.health * bonuses.statMultiplier),
      strength: Math.round(baseStats.strength * bonuses.statMultiplier),
      stamina: Math.round(baseStats.stamina * bonuses.statMultiplier),
      speed: Math.round(baseStats.speed * bonuses.statMultiplier),
      experience: Math.round(baseStats.experience * bonuses.experienceMultiplier),
      coins: Math.round(baseStats.coins * bonuses.coinMultiplier),
    };
  }

  getVisualEffects() {
    const evolution = this.getCurrentEvolution();
    return {
      theme: evolution.visualTheme,
      equipment: evolution.equipment,
      animations: evolution.animations,
      powerLevel: evolution.powerMultiplier,
    };
  }

  // Get archetype-specific evolution visuals
  getArchetypeEvolutionTheme(archetype) {
    const archetypeThemes = {
      balanced: {
        colorModifier: 0,
        effectsIntensity: 1.0,
        preferredEffects: ['balanced_aura', 'harmony_particles'],
      },
      powerhouse: {
        colorModifier: 0.1, // Shift towards red/orange
        effectsIntensity: 1.2,
        preferredEffects: ['power_surge', 'muscle_flex', 'strength_aura'],
      },
      speedster: {
        colorModifier: -0.1, // Shift towards blue/cyan
        effectsIntensity: 1.1,
        preferredEffects: ['speed_lines', 'lightning_trail', 'velocity_burst'],
      },
      tank: {
        colorModifier: 0.05, // Slight shift to earth tones
        effectsIntensity: 0.9,
        preferredEffects: ['shield_barrier', 'stone_skin', 'fortress_aura'],
      },
      strategist: {
        colorModifier: -0.05, // Shift towards purple
        effectsIntensity: 1.0,
        preferredEffects: ['mind_waves', 'tactical_grid', 'genius_glow'],
      },
    };
    
    return archetypeThemes[archetype] || archetypeThemes.balanced;
  }

  // Calculate evolution ceremony duration based on stage
  getCeremonyDuration(fromStage, toStage) {
    const stageDiff = toStage - fromStage;
    const baseDuration = 5000; // 5 seconds
    const additionalTime = stageDiff * 1000; // +1 second per stage jumped
    return baseDuration + additionalTime;
  }

  // Get motivational messages for each evolution stage
  getEvolutionMotivation(stage) {
    const motivations = {
      0: [
        "Your journey begins! Every legend starts somewhere.",
        "Welcome, warrior! Your potential is limitless.",
        "The first step is always the hardest. You've got this!",
      ],
      1: [
        "You're developing real strength! Keep pushing!",
        "10 workouts down! Your dedication is showing.",
        "From rookie to warrior - you're transforming!",
      ],
      2: [
        "Established and unstoppable! You're in the zone!",
        "30 workouts! You've built an unbreakable habit.",
        "Your power is growing exponentially!",
      ],
      3: [
        "Advanced warrior! Few reach this level of dedication.",
        "50 workouts! You're an inspiration to others.",
        "Master of your domain - true strength achieved!",
      ],
      4: [
        "LEGENDARY STATUS! You are fitness incarnate!",
        "75 workouts! You've transcended mortal limits!",
        "Welcome to the pantheon of fitness gods!",
      ],
    };
    
    const stageMessages = motivations[stage] || motivations[0];
    return stageMessages[Math.floor(Math.random() * stageMessages.length)];
  }

  // Debug method to manually set evolution (for testing)
  async debugSetEvolution(stageId, workouts = null) {
    if (__DEV__) {
      this.currentEvolution = stageId;
      if (workouts !== null) {
        this.totalWorkouts = workouts;
      }
      const evolution = this.getCurrentEvolution();
      this.powerLevel = evolution.powerMultiplier;
      await this.save();
      return evolution;
    }
  }

  async reset() {
    this.currentEvolution = 0;
    this.evolutionHistory = [{
      stage: 0,
      achievedDate: new Date().toISOString(),
    }];
    this.totalWorkouts = 0;
    this.workoutsByType = {
      strength: 0,
      cardio: 0,
      wellness: 0,
      nutrition: 0,
      steps: 0,
    };
    this.currentStreak = 0;
    this.lastActivityDate = null;
    this.powerLevel = 1.0;
    await this.save();
  }
}

// Singleton instance
const evolutionManager = new CharacterEvolutionManager();
export default evolutionManager;