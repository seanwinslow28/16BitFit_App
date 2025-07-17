/**
 * Workout Database Component
 * Comprehensive exercise data with stat effects
 */

const WORKOUT_DATABASE = [
  // Cardio Workouts
  {
    id: 'running',
    name: 'Running',
    icon: '🏃',
    categories: ['cardio'],
    difficulty: 'medium',
    caloriesPerHour: 600,
    statEffects: {
      stamina: 8,
      health: 5,
      weight: -3,
      happiness: 3,
    },
    description: 'Classic cardio for endurance and weight loss',
    tags: ['running', 'outdoor', 'cardio', 'endurance'],
    equipment: [],
    isFavorite: true,
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: '🚴',
    categories: ['cardio'],
    difficulty: 'medium',
    caloriesPerHour: 500,
    statEffects: {
      stamina: 7,
      health: 4,
      weight: -2,
      happiness: 4,
    },
    description: 'Low-impact cardio that builds leg strength',
    tags: ['cycling', 'bike', 'cardio', 'outdoor'],
    equipment: ['bike'],
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: '🏊',
    categories: ['cardio'],
    difficulty: 'hard',
    caloriesPerHour: 700,
    statEffects: {
      stamina: 9,
      strength: 4,
      health: 6,
      weight: -3,
    },
    description: 'Full-body workout with zero impact',
    tags: ['swimming', 'pool', 'cardio', 'full-body'],
    equipment: ['pool'],
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    icon: '🪢',
    categories: ['cardio', 'hiit'],
    difficulty: 'medium',
    caloriesPerHour: 800,
    statEffects: {
      stamina: 7,
      focus: 5,
      weight: -4,
      happiness: 2,
    },
    description: 'High-intensity cardio for coordination',
    tags: ['jump rope', 'cardio', 'hiit', 'coordination'],
    equipment: ['jump rope'],
  },

  // Strength Workouts
  {
    id: 'weight_training',
    name: 'Weight Training',
    icon: '🏋️',
    categories: ['strength'],
    difficulty: 'medium',
    caloriesPerHour: 400,
    statEffects: {
      strength: 10,
      health: 3,
      happiness: 4,
      stamina: 2,
    },
    description: 'Build muscle and increase strength',
    tags: ['weights', 'strength', 'muscle', 'gym'],
    equipment: ['weights'],
    isFavorite: true,
  },
  {
    id: 'push_ups',
    name: 'Push-ups',
    icon: '💪',
    categories: ['strength'],
    difficulty: 'easy',
    caloriesPerHour: 350,
    statEffects: {
      strength: 6,
      stamina: 3,
      health: 2,
    },
    description: 'Classic bodyweight exercise for upper body',
    tags: ['push-ups', 'bodyweight', 'strength', 'home'],
    equipment: [],
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    icon: '🤸',
    categories: ['strength'],
    difficulty: 'hard',
    caloriesPerHour: 400,
    statEffects: {
      strength: 8,
      stamina: 4,
      focus: 3,
    },
    description: 'Advanced upper body and back exercise',
    tags: ['pull-ups', 'bodyweight', 'strength', 'back'],
    equipment: ['pull-up bar'],
  },
  {
    id: 'squats',
    name: 'Squats',
    icon: '🦵',
    categories: ['strength'],
    difficulty: 'easy',
    caloriesPerHour: 300,
    statEffects: {
      strength: 7,
      stamina: 3,
      health: 2,
    },
    description: 'Essential lower body exercise',
    tags: ['squats', 'legs', 'strength', 'bodyweight'],
    equipment: [],
  },

  // Flexibility Workouts
  {
    id: 'yoga',
    name: 'Yoga',
    icon: '🧘',
    categories: ['flexibility', 'recovery'],
    difficulty: 'easy',
    caloriesPerHour: 250,
    statEffects: {
      happiness: 8,
      focus: 7,
      health: 4,
      stamina: 2,
    },
    description: 'Improve flexibility and mental clarity',
    tags: ['yoga', 'flexibility', 'mindfulness', 'balance'],
    equipment: ['yoga mat'],
    isFavorite: true,
  },
  {
    id: 'stretching',
    name: 'Stretching',
    icon: '🤸‍♀️',
    categories: ['flexibility', 'recovery'],
    difficulty: 'easy',
    caloriesPerHour: 150,
    statEffects: {
      happiness: 4,
      health: 3,
      focus: 2,
    },
    description: 'Essential for recovery and flexibility',
    tags: ['stretching', 'flexibility', 'recovery', 'warmup'],
    equipment: [],
  },
  {
    id: 'pilates',
    name: 'Pilates',
    icon: '🎯',
    categories: ['flexibility', 'strength'],
    difficulty: 'medium',
    caloriesPerHour: 350,
    statEffects: {
      strength: 5,
      focus: 6,
      happiness: 5,
      health: 3,
    },
    description: 'Core strength and flexibility training',
    tags: ['pilates', 'core', 'flexibility', 'strength'],
    equipment: ['mat'],
  },

  // Sports
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    categories: ['sports', 'cardio'],
    difficulty: 'medium',
    caloriesPerHour: 600,
    statEffects: {
      stamina: 6,
      happiness: 7,
      focus: 4,
      strength: 3,
    },
    description: 'Team sport for cardio and coordination',
    tags: ['basketball', 'sports', 'team', 'cardio'],
    equipment: ['basketball'],
  },
  {
    id: 'soccer',
    name: 'Soccer',
    icon: '⚽',
    categories: ['sports', 'cardio'],
    difficulty: 'medium',
    caloriesPerHour: 700,
    statEffects: {
      stamina: 8,
      happiness: 6,
      weight: -3,
      focus: 3,
    },
    description: 'Great cardio with team dynamics',
    tags: ['soccer', 'football', 'sports', 'team'],
    equipment: ['soccer ball'],
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    categories: ['sports'],
    difficulty: 'medium',
    caloriesPerHour: 550,
    statEffects: {
      stamina: 5,
      focus: 7,
      happiness: 5,
      strength: 3,
    },
    description: 'Racquet sport for agility and strategy',
    tags: ['tennis', 'sports', 'racquet', 'agility'],
    equipment: ['tennis racquet'],
  },
  {
    id: 'martial_arts',
    name: 'Martial Arts',
    icon: '🥋',
    categories: ['sports', 'strength'],
    difficulty: 'hard',
    caloriesPerHour: 750,
    statEffects: {
      strength: 7,
      focus: 8,
      stamina: 6,
      happiness: 5,
    },
    description: 'Discipline, strength, and self-defense',
    tags: ['martial arts', 'karate', 'boxing', 'self-defense'],
    equipment: [],
  },

  // HIIT Workouts
  {
    id: 'hiit_circuit',
    name: 'HIIT Circuit',
    icon: '🔥',
    categories: ['hiit', 'cardio'],
    difficulty: 'hard',
    caloriesPerHour: 900,
    statEffects: {
      stamina: 8,
      strength: 5,
      weight: -5,
      focus: 4,
    },
    description: 'High-intensity intervals for maximum burn',
    tags: ['hiit', 'circuit', 'intense', 'fat-burn'],
    equipment: [],
    isFavorite: true,
  },
  {
    id: 'burpees',
    name: 'Burpees',
    icon: '💥',
    categories: ['hiit', 'strength'],
    difficulty: 'hard',
    caloriesPerHour: 800,
    statEffects: {
      stamina: 7,
      strength: 6,
      weight: -4,
      happiness: -1, // They're tough!
    },
    description: 'Full-body exercise that everyone loves to hate',
    tags: ['burpees', 'hiit', 'full-body', 'intense'],
    equipment: [],
  },
  {
    id: 'tabata',
    name: 'Tabata Training',
    icon: '⏱️',
    categories: ['hiit'],
    difficulty: 'hard',
    caloriesPerHour: 850,
    statEffects: {
      stamina: 9,
      weight: -4,
      focus: 5,
      strength: 4,
    },
    description: '4-minute ultra-high intensity intervals',
    tags: ['tabata', 'hiit', 'intervals', 'quick'],
    equipment: [],
  },

  // Recovery Workouts
  {
    id: 'walking',
    name: 'Walking',
    icon: '🚶',
    categories: ['recovery', 'cardio'],
    difficulty: 'easy',
    caloriesPerHour: 250,
    statEffects: {
      health: 4,
      happiness: 5,
      stamina: 2,
      weight: -1,
    },
    description: 'Low-impact activity for active recovery',
    tags: ['walking', 'recovery', 'low-impact', 'outdoor'],
    equipment: [],
  },
  {
    id: 'foam_rolling',
    name: 'Foam Rolling',
    icon: '🧻',
    categories: ['recovery'],
    difficulty: 'easy',
    caloriesPerHour: 100,
    statEffects: {
      health: 3,
      happiness: 2,
      focus: 2,
    },
    description: 'Muscle recovery and tension release',
    tags: ['foam rolling', 'recovery', 'massage', 'flexibility'],
    equipment: ['foam roller'],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: '🧘‍♂️',
    categories: ['recovery'],
    difficulty: 'easy',
    caloriesPerHour: 50,
    statEffects: {
      focus: 10,
      happiness: 8,
      health: 2,
    },
    description: 'Mental recovery and stress reduction',
    tags: ['meditation', 'mindfulness', 'mental', 'recovery'],
    equipment: [],
  },

  // Special/Fun Workouts
  {
    id: 'dancing',
    name: 'Dancing',
    icon: '💃',
    categories: ['cardio', 'sports'],
    difficulty: 'medium',
    caloriesPerHour: 450,
    statEffects: {
      happiness: 10,
      stamina: 5,
      focus: 4,
      weight: -2,
    },
    description: 'Fun way to burn calories and boost mood',
    tags: ['dancing', 'dance', 'fun', 'cardio'],
    equipment: [],
  },
  {
    id: 'hiking',
    name: 'Hiking',
    icon: '🥾',
    categories: ['cardio', 'recovery'],
    difficulty: 'medium',
    caloriesPerHour: 400,
    statEffects: {
      stamina: 6,
      happiness: 8,
      health: 5,
      weight: -2,
    },
    description: 'Explore nature while getting fit',
    tags: ['hiking', 'outdoor', 'nature', 'cardio'],
    equipment: ['hiking boots'],
  },
  {
    id: 'rock_climbing',
    name: 'Rock Climbing',
    icon: '🧗',
    categories: ['strength', 'sports'],
    difficulty: 'hard',
    caloriesPerHour: 650,
    statEffects: {
      strength: 8,
      focus: 9,
      stamina: 5,
      happiness: 6,
    },
    description: 'Full-body workout with mental challenge',
    tags: ['climbing', 'bouldering', 'strength', 'challenge'],
    equipment: ['climbing gear'],
  },
];

const WorkoutDatabase = {
  getAllWorkouts: () => WORKOUT_DATABASE,
  
  getWorkoutById: (id) => WORKOUT_DATABASE.find(workout => workout.id === id),
  
  getWorkoutsByCategory: (category) => 
    WORKOUT_DATABASE.filter(workout => workout.categories.includes(category)),
  
  getWorkoutsByDifficulty: (difficulty) =>
    WORKOUT_DATABASE.filter(workout => workout.difficulty === difficulty),
  
  getFavoriteWorkouts: () => WORKOUT_DATABASE.filter(workout => workout.isFavorite),
  
  searchWorkouts: (query) => {
    const lowerQuery = query.toLowerCase();
    return WORKOUT_DATABASE.filter(workout =>
      workout.name.toLowerCase().includes(lowerQuery) ||
      workout.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
  
  getSuggestedWorkouts: (playerStats) => {
    const suggestions = [];
    
    // Suggest based on weak stats
    if (playerStats.stamina < 50) {
      const cardioWorkout = WORKOUT_DATABASE.find(w => w.id === 'running');
      if (cardioWorkout) {
        suggestions.push({ ...cardioWorkout, reason: 'Build stamina' });
      }
    }
    
    if (playerStats.strength < 50) {
      const strengthWorkout = WORKOUT_DATABASE.find(w => w.id === 'weight_training');
      if (strengthWorkout) {
        suggestions.push({ ...strengthWorkout, reason: 'Increase strength' });
      }
    }
    
    if (playerStats.happiness < 50) {
      const happyWorkout = WORKOUT_DATABASE.find(w => w.id === 'dancing');
      if (happyWorkout) {
        suggestions.push({ ...happyWorkout, reason: 'Boost mood' });
      }
    }
    
    if (playerStats.focus < 50) {
      const focusWorkout = WORKOUT_DATABASE.find(w => w.id === 'yoga');
      if (focusWorkout) {
        suggestions.push({ ...focusWorkout, reason: 'Improve focus' });
      }
    }
    
    // Always suggest a recovery workout
    if (suggestions.length < 3) {
      const recoveryWorkout = WORKOUT_DATABASE.find(w => w.id === 'stretching');
      if (recoveryWorkout) {
        suggestions.push({ ...recoveryWorkout, reason: 'Recovery day' });
      }
    }
    
    return suggestions.slice(0, 4);
  },
  
  calculateWorkoutStats: (workout, duration, intensity) => {
    const intensityMultipliers = {
      light: 0.7,
      medium: 1.0,
      high: 1.3,
    };
    
    const multiplier = intensityMultipliers[intensity] || 1.0;
    const durationMultiplier = duration / 30; // Base is 30 minutes
    
    return {
      calories: Math.round(workout.caloriesPerHour * (duration / 60) * multiplier),
      statEffects: Object.entries(workout.statEffects).reduce((effects, [stat, value]) => {
        effects[stat] = Math.round(value * multiplier * durationMultiplier);
        return effects;
      }, {}),
      xp: Math.round(25 * multiplier * durationMultiplier),
    };
  },
  
  getWorkoutsByEquipment: (availableEquipment) => {
    return WORKOUT_DATABASE.filter(workout => 
      workout.equipment.every(item => availableEquipment.includes(item))
    );
  },
  
  getQuickWorkouts: (maxDuration = 15) => {
    // Return workouts suitable for quick sessions
    return WORKOUT_DATABASE.filter(workout => 
      ['hiit', 'strength'].some(cat => workout.categories.includes(cat)) &&
      workout.difficulty !== 'hard'
    );
  },
};

export default WorkoutDatabase;