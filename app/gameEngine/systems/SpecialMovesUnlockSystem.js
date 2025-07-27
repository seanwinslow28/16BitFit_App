// Special moves unlock system based on fitness milestones

export const SpecialMoves = {
  // Basic special moves
  LIGHTNING_STEP: {
    id: 'lightning_step',
    name: 'Lightning Step',
    description: 'Quick dash attack',
    unlockCondition: {
      type: 'cardio',
      requirement: 'Complete 5K run',
      check: (stats) => stats.totalDistance >= 5000, // meters
    },
    damage: 20,
    staminaCost: 15,
    animation: 'dash_attack',
  },
  
  POWER_SLAM: {
    id: 'power_slam',
    name: 'Power Slam',
    description: 'Devastating grapple move',
    unlockCondition: {
      type: 'strength',
      requirement: 'Bench press bodyweight',
      check: (stats) => stats.maxBenchPress >= stats.bodyweight,
    },
    damage: 30,
    staminaCost: 20,
    animation: 'grapple',
  },
  
  ZEN_FOCUS: {
    id: 'zen_focus',
    name: 'Zen Focus',
    description: 'Defensive stance with health regen',
    unlockCondition: {
      type: 'wellness',
      requirement: 'Complete yoga challenge',
      check: (stats) => stats.yogaSessions >= 10,
    },
    effect: 'heal',
    healAmount: 2, // per second
    staminaCost: 10,
    animation: 'meditate',
  },
  
  DETERMINATION: {
    id: 'determination',
    name: 'Determination',
    description: 'Comeback mechanic - damage boost when low health',
    unlockCondition: {
      type: 'consistency',
      requirement: '30-day streak',
      check: (stats) => stats.streak >= 30,
    },
    effect: 'damage_boost',
    multiplier: 1.5,
    trigger: 'health < 30%',
    animation: 'power_up',
  },
  
  AGILITY_BOOST: {
    id: 'agility_boost',
    name: 'Agility Boost',
    description: 'Temporary speed enhancement',
    unlockCondition: {
      type: 'weight_loss',
      requirement: 'Lose 10 pounds',
      check: (stats) => stats.weightLost >= 10,
    },
    effect: 'speed_boost',
    duration: 5, // seconds
    speedMultiplier: 2,
    staminaCost: 15,
    animation: 'speed_aura',
  },
  
  // Advanced special moves
  METEOR_STRIKE: {
    id: 'meteor_strike',
    name: 'Meteor Strike',
    description: 'Aerial slam attack',
    unlockCondition: {
      type: 'combined',
      requirement: 'STR + STA > 180',
      check: (stats) => stats.strength + stats.stamina > 180,
    },
    damage: 40,
    staminaCost: 30,
    animation: 'aerial_slam',
  },
  
  BERSERKER_RAGE: {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'Attack speed increase, defense decrease',
    unlockCondition: {
      type: 'battles',
      requirement: 'Win 50 battles',
      check: (stats) => stats.battlesWon >= 50,
    },
    effect: 'berserk',
    attackSpeedBoost: 1.5,
    defenseReduction: 0.5,
    duration: 10,
    staminaCost: 25,
    animation: 'rage_mode',
  },
};

// Character archetypes with unique moves
export const CharacterArchetypes = {
  BALANCED: {
    name: 'All-Rounder',
    description: 'Balanced stats and versatile moves',
    statRequirements: {
      strength: 40,
      stamina: 40,
      speed: 40,
    },
    signatureMoves: ['LIGHTNING_STEP', 'POWER_SLAM'],
  },
  
  POWERHOUSE: {
    name: 'Powerhouse',
    description: 'High damage, slow speed',
    statRequirements: {
      strength: 70,
      stamina: 50,
      speed: 30,
    },
    signatureMoves: ['POWER_SLAM', 'METEOR_STRIKE'],
  },
  
  SPEEDSTER: {
    name: 'Speedster',
    description: 'Fast attacks, lower damage',
    statRequirements: {
      strength: 30,
      stamina: 50,
      speed: 70,
    },
    signatureMoves: ['LIGHTNING_STEP', 'AGILITY_BOOST'],
  },
  
  TANK: {
    name: 'Tank',
    description: 'High defense, good stamina',
    statRequirements: {
      strength: 50,
      stamina: 70,
      speed: 30,
    },
    signatureMoves: ['ZEN_FOCUS', 'DETERMINATION'],
  },
};

// Check which moves are unlocked for a character
export const getUnlockedMoves = (characterStats, activityHistory) => {
  const unlockedMoves = [];
  
  // Calculate aggregate stats from activity history
  const aggregateStats = calculateAggregateStats(activityHistory);
  
  // Check each special move
  Object.values(SpecialMoves).forEach(move => {
    if (move.unlockCondition.check({ ...characterStats, ...aggregateStats })) {
      unlockedMoves.push(move);
    }
  });
  
  return unlockedMoves;
};

// Calculate stats from activity history
const calculateAggregateStats = (activities) => {
  return activities.reduce((stats, activity) => {
    switch (activity.category) {
      case 'cardio':
        stats.totalDistance += activity.distance || 0;
        break;
      case 'strength':
        if (activity.name.includes('bench')) {
          stats.maxBenchPress = Math.max(stats.maxBenchPress, activity.weight || 0);
        }
        break;
      case 'wellness':
        if (activity.name.toLowerCase().includes('yoga')) {
          stats.yogaSessions++;
        }
        break;
    }
    return stats;
  }, {
    totalDistance: 0,
    maxBenchPress: 0,
    yogaSessions: 0,
    bodyweight: 150, // Default, should come from user profile
    weightLost: 0,
    battlesWon: 0,
  });
};

// Get character archetype based on stats
export const getCharacterArchetype = (stats) => {
  let bestMatch = null;
  let bestScore = 0;
  
  Object.entries(CharacterArchetypes).forEach(([key, archetype]) => {
    const score = calculateArchetypeMatch(stats, archetype.statRequirements);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...archetype, id: key };
    }
  });
  
  return bestMatch;
};

// Calculate how well stats match an archetype
const calculateArchetypeMatch = (stats, requirements) => {
  const strengthDiff = Math.abs(stats.strength - requirements.strength);
  const staminaDiff = Math.abs(stats.stamina - requirements.stamina);
  const speedDiff = Math.abs(stats.speed - requirements.speed);
  
  // Lower difference = better match
  return 300 - (strengthDiff + staminaDiff + speedDiff);
};

export default {
  SpecialMoves,
  CharacterArchetypes,
  getUnlockedMoves,
  getCharacterArchetype,
};