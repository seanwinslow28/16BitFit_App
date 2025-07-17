/**
 * Reward System Component
 * Manages achievements, milestones, and rewards
 */

import UnlockSystem from './UnlockSystem';
import CustomizationDatabase from './CustomizationDatabase';

// Achievement definitions
const ACHIEVEMENTS = {
  // Workout achievements
  first_workout: {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    xpReward: 50,
    unlocks: ['outfit_tank'],
    condition: (stats) => stats.totalWorkouts >= 1,
  },
  workout_warrior: {
    id: 'workout_warrior',
    name: 'Workout Warrior',
    description: 'Complete 50 workouts',
    icon: '💪',
    xpReward: 200,
    unlocks: ['gear_gloves'],
    condition: (stats) => stats.totalWorkouts >= 50,
  },
  century_club: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: '💯',
    xpReward: 500,
    unlocks: ['outfit_armor', 'effect_steam'],
    condition: (stats) => stats.totalWorkouts >= 100,
  },

  // Streak achievements
  week_warrior: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 100,
    unlocks: ['effect_sparkles'],
    condition: (stats) => stats.currentStreak >= 7,
  },
  month_master: {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '📅',
    xpReward: 300,
    unlocks: ['hair_fire', 'effect_fire'],
    condition: (stats) => stats.currentStreak >= 30,
  },
  streak_legend: {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    xpReward: 1000,
    unlocks: ['gear_wings'],
    condition: (stats) => stats.currentStreak >= 100,
  },

  // Boss achievements
  first_victory: {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Defeat your first boss',
    icon: '🏆',
    xpReward: 150,
    unlocks: ['outfit_gi'],
    condition: (stats) => stats.bossesDefeated >= 1,
  },
  boss_slayer: {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat 10 bosses',
    icon: '⚔️',
    xpReward: 400,
    unlocks: ['gear_cape'],
    condition: (stats) => stats.bossesDefeated >= 10,
  },

  // Stat achievements
  strength_training: {
    id: 'strength_training',
    name: 'Strength Training',
    description: 'Reach 50 strength',
    icon: '💪',
    xpReward: 100,
    unlocks: ['gear_gloves'],
    condition: (stats) => stats.strength >= 50,
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 75 stamina',
    icon: '⚡',
    xpReward: 150,
    unlocks: ['effect_lightning'],
    condition: (stats) => stats.stamina >= 75,
  },
  zen_master: {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Reach 80 focus',
    icon: '🧘',
    xpReward: 200,
    unlocks: ['body_monk'],
    condition: (stats) => stats.focus >= 80,
  },

  // Special achievements
  diversity_champion: {
    id: 'diversity_champion',
    name: 'Diversity Champion',
    description: 'Try all workout types',
    icon: '🌈',
    xpReward: 250,
    unlocks: ['hair_rainbow', 'effect_rainbow'],
    condition: (stats) => stats.workoutTypesTried?.length >= 4,
  },
  tech_savvy: {
    id: 'tech_savvy',
    name: 'Tech Savvy',
    description: 'Connect health tracking',
    icon: '📱',
    xpReward: 100,
    unlocks: ['body_robot'],
    condition: (stats) => stats.healthConnected === true,
  },
  hero_status: {
    id: 'hero_status',
    name: 'Hero Status',
    description: 'Help 5 friends start their fitness journey',
    icon: '🦸',
    xpReward: 300,
    unlocks: ['gear_cape'],
    condition: (stats) => stats.friendsHelped >= 5,
  },
  gym_royalty: {
    id: 'gym_royalty',
    name: 'Gym Royalty',
    description: 'Reach level 25',
    icon: '👑',
    xpReward: 500,
    unlocks: ['gear_crown'],
    condition: (stats) => stats.level >= 25,
  },
  all_workout_types: {
    id: 'all_workout_types',
    name: 'Versatile Athlete',
    description: 'Complete workouts in all categories',
    icon: '🎯',
    xpReward: 300,
    unlocks: ['effect_rainbow'],
    condition: (stats) => {
      const types = ['cardio', 'strength', 'flexibility', 'sports', 'hiit', 'recovery'];
      return types.every(type => stats.workoutsByType?.[type] > 0);
    },
  },
};

// Milestone rewards
const MILESTONES = {
  level_5: {
    level: 5,
    rewards: {
      xp: 100,
      unlocks: ['body_ninja', 'hair_long'],
    },
  },
  level_10: {
    level: 10,
    rewards: {
      xp: 200,
      unlocks: ['body_knight', 'outfit_armor'],
    },
  },
  level_15: {
    level: 15,
    rewards: {
      xp: 300,
      unlocks: ['body_monk', 'outfit_ninja'],
    },
  },
  level_20: {
    level: 20,
    rewards: {
      xp: 400,
      unlocks: ['body_robot', 'outfit_tech'],
    },
  },
  level_25: {
    level: 25,
    rewards: {
      xp: 500,
      unlocks: ['hair_fire', 'gear_crown'],
    },
  },
  level_30: {
    level: 30,
    rewards: {
      xp: 750,
      unlocks: ['body_dragon'],
    },
  },
  level_40: {
    level: 40,
    rewards: {
      xp: 1000,
      unlocks: ['outfit_golden'],
    },
  },
  level_50: {
    level: 50,
    rewards: {
      xp: 2000,
      unlocks: ['effect_galaxy', 'gear_aura'],
    },
  },
};

const RewardSystem = {
  // Check for new achievements
  checkAchievements: (playerStats, previousAchievements = []) => {
    const newAchievements = [];
    const allRewards = {
      xp: 0,
      unlocks: [],
    };

    Object.entries(ACHIEVEMENTS).forEach(([achievementId, achievement]) => {
      // Skip if already earned
      if (previousAchievements.includes(achievementId)) return;

      // Check if condition is met
      if (achievement.condition(playerStats)) {
        newAchievements.push(achievement);
        allRewards.xp += achievement.xpReward;
        allRewards.unlocks.push(...achievement.unlocks);
      }
    });

    return {
      newAchievements,
      rewards: allRewards,
    };
  },

  // Check for milestone rewards
  checkMilestones: (currentLevel, previousLevel) => {
    const earnedMilestones = [];
    const allRewards = {
      xp: 0,
      unlocks: [],
    };

    Object.entries(MILESTONES).forEach(([milestoneId, milestone]) => {
      if (currentLevel >= milestone.level && previousLevel < milestone.level) {
        earnedMilestones.push({
          id: milestoneId,
          level: milestone.level,
          ...milestone.rewards,
        });
        allRewards.xp += milestone.rewards.xp;
        allRewards.unlocks.push(...milestone.rewards.unlocks);
      }
    });

    return {
      earnedMilestones,
      rewards: allRewards,
    };
  },

  // Generate reward notification
  generateRewardNotification: (rewards) => {
    const messages = [];
    
    if (rewards.xp > 0) {
      messages.push(`+${rewards.xp} XP`);
    }

    if (rewards.unlocks.length > 0) {
      const unlockedItems = rewards.unlocks.map(itemId => {
        const item = CustomizationDatabase.getItemById(itemId);
        return item ? `${item.icon} ${item.name}` : itemId;
      });
      messages.push(`Unlocked: ${unlockedItems.join(', ')}`);
    }

    return messages.join('\n');
  },

  // Get achievement progress
  getAchievementProgress: (achievementId, playerStats) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return null;

    // Calculate progress based on achievement type
    let current = 0;
    let target = 0;

    // Parse achievement conditions to determine progress
    if (achievementId.includes('workout')) {
      current = playerStats.totalWorkouts || 0;
      if (achievementId === 'first_workout') target = 1;
      else if (achievementId === 'workout_warrior') target = 50;
      else if (achievementId === 'century_club') target = 100;
    } else if (achievementId.includes('streak')) {
      current = playerStats.currentStreak || 0;
      if (achievementId === 'week_warrior') target = 7;
      else if (achievementId === 'month_master') target = 30;
      else if (achievementId === 'streak_legend') target = 100;
    } else if (achievementId.includes('boss')) {
      current = playerStats.bossesDefeated || 0;
      if (achievementId === 'first_victory') target = 1;
      else if (achievementId === 'boss_slayer') target = 10;
    }

    return {
      current,
      target,
      percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0,
      isComplete: achievement.condition(playerStats),
    };
  },

  // Get all achievements with progress
  getAllAchievementsWithProgress: (playerStats, earnedAchievements = []) => {
    return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
      const progress = RewardSystem.getAchievementProgress(id, playerStats);
      const isEarned = earnedAchievements.includes(id);

      return {
        ...achievement,
        progress,
        isEarned,
      };
    });
  },

  // Calculate total rewards earned
  calculateTotalRewards: (earnedAchievements = [], currentLevel = 1) => {
    let totalXP = 0;
    let totalUnlocks = [];

    // Sum achievement rewards
    earnedAchievements.forEach(achievementId => {
      const achievement = ACHIEVEMENTS[achievementId];
      if (achievement) {
        totalXP += achievement.xpReward;
        totalUnlocks.push(...achievement.unlocks);
      }
    });

    // Sum milestone rewards
    Object.entries(MILESTONES).forEach(([_, milestone]) => {
      if (currentLevel >= milestone.level) {
        totalXP += milestone.rewards.xp;
        totalUnlocks.push(...milestone.rewards.unlocks);
      }
    });

    // Remove duplicates from unlocks
    totalUnlocks = [...new Set(totalUnlocks)];

    return {
      totalXP,
      totalUnlocks,
      achievementCount: earnedAchievements.length,
      totalAchievements: Object.keys(ACHIEVEMENTS).length,
    };
  },

  // Get next achievable rewards
  getNextRewards: (playerStats, earnedAchievements = []) => {
    const upcoming = [];

    // Check achievements close to completion
    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
      if (earnedAchievements.includes(id)) return;

      const progress = RewardSystem.getAchievementProgress(id, playerStats);
      if (progress && progress.percentage >= 50) {
        upcoming.push({
          type: 'achievement',
          ...achievement,
          progress,
        });
      }
    });

    // Check next milestone
    const nextMilestone = Object.values(MILESTONES).find(
      milestone => milestone.level > playerStats.level
    );
    if (nextMilestone) {
      upcoming.push({
        type: 'milestone',
        name: `Level ${nextMilestone.level}`,
        description: `Reach level ${nextMilestone.level}`,
        icon: '⭐',
        ...nextMilestone.rewards,
        progress: {
          current: playerStats.level,
          target: nextMilestone.level,
          percentage: (playerStats.level / nextMilestone.level) * 100,
        },
      });
    }

    // Sort by closest to completion
    upcoming.sort((a, b) => b.progress.percentage - a.progress.percentage);

    return upcoming.slice(0, 5); // Top 5 upcoming rewards
  },
};

export default RewardSystem;