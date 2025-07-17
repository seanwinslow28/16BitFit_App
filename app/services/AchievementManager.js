/**
 * Achievement Manager
 * Comprehensive achievement system with milestone tracking and notifications
 * Following MetaSystemsAgent patterns for rewards and progression
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import CloudSyncManager from './CloudSyncManager';
import AudioService from './AudioService';

// Achievement categories
const ACHIEVEMENT_CATEGORIES = {
  FITNESS: 'fitness',
  NUTRITION: 'nutrition',
  BATTLE: 'battle',
  SOCIAL: 'social',
  STREAK: 'streak',
  COLLECTION: 'collection',
  SPECIAL: 'special',
};

// Achievement definitions
const ACHIEVEMENTS = {
  // Fitness Achievements
  first_workout: {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    category: ACHIEVEMENT_CATEGORIES.FITNESS,
    icon: '🏃',
    points: 10,
    requirement: { type: 'workout_count', value: 1 },
    reward: { xp: 50, coins: 10 },
  },
  workout_warrior: {
    id: 'workout_warrior',
    name: 'Workout Warrior',
    description: 'Complete 50 workouts',
    category: ACHIEVEMENT_CATEGORIES.FITNESS,
    icon: '💪',
    points: 50,
    requirement: { type: 'workout_count', value: 50 },
    reward: { xp: 500, coins: 100, item: 'warrior_headband' },
  },
  cardio_champion: {
    id: 'cardio_champion',
    name: 'Cardio Champion',
    description: 'Complete 25 cardio workouts',
    category: ACHIEVEMENT_CATEGORIES.FITNESS,
    icon: '🏃‍♂️',
    points: 30,
    requirement: { type: 'cardio_count', value: 25 },
    reward: { xp: 300, coins: 50 },
  },
  strength_master: {
    id: 'strength_master',
    name: 'Strength Master',
    description: 'Complete 25 strength workouts',
    category: ACHIEVEMENT_CATEGORIES.FITNESS,
    icon: '🏋️',
    points: 30,
    requirement: { type: 'strength_count', value: 25 },
    reward: { xp: 300, coins: 50 },
  },
  
  // Nutrition Achievements
  healthy_eater: {
    id: 'healthy_eater',
    name: 'Healthy Eater',
    description: 'Log 10 healthy meals',
    category: ACHIEVEMENT_CATEGORIES.NUTRITION,
    icon: '🥗',
    points: 20,
    requirement: { type: 'healthy_meals', value: 10 },
    reward: { xp: 200, coins: 30 },
  },
  nutrition_expert: {
    id: 'nutrition_expert',
    name: 'Nutrition Expert',
    description: 'Maintain perfect nutrition for 7 days',
    category: ACHIEVEMENT_CATEGORIES.NUTRITION,
    icon: '🥑',
    points: 40,
    requirement: { type: 'perfect_nutrition_days', value: 7 },
    reward: { xp: 400, coins: 80 },
  },
  
  // Battle Achievements
  first_victory: {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first boss battle',
    category: ACHIEVEMENT_CATEGORIES.BATTLE,
    icon: '⚔️',
    points: 15,
    requirement: { type: 'battles_won', value: 1 },
    reward: { xp: 150, coins: 25 },
  },
  battle_master: {
    id: 'battle_master',
    name: 'Battle Master',
    description: 'Win 25 boss battles',
    category: ACHIEVEMENT_CATEGORIES.BATTLE,
    icon: '🗡️',
    points: 60,
    requirement: { type: 'battles_won', value: 25 },
    reward: { xp: 600, coins: 120, item: 'champion_belt' },
  },
  flawless_fighter: {
    id: 'flawless_fighter',
    name: 'Flawless Fighter',
    description: 'Win a battle without taking damage',
    category: ACHIEVEMENT_CATEGORIES.BATTLE,
    icon: '🛡️',
    points: 40,
    requirement: { type: 'flawless_victories', value: 1 },
    reward: { xp: 400, coins: 80 },
  },
  
  // Streak Achievements
  week_warrior: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🔥',
    points: 25,
    requirement: { type: 'streak_days', value: 7 },
    reward: { xp: 250, coins: 50 },
  },
  month_master: {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🌟',
    points: 100,
    requirement: { type: 'streak_days', value: 30 },
    reward: { xp: 1000, coins: 200, item: 'golden_trophy' },
  },
  streak_legend: {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '💎',
    points: 250,
    requirement: { type: 'streak_days', value: 100 },
    reward: { xp: 2500, coins: 500, item: 'legendary_crown' },
  },
  
  // Social Achievements
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Add 10 friends',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    icon: '🦋',
    points: 20,
    requirement: { type: 'friend_count', value: 10 },
    reward: { xp: 200, coins: 40 },
  },
  guild_member: {
    id: 'guild_member',
    name: 'Guild Member',
    description: 'Join a guild',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    icon: '🏛️',
    points: 15,
    requirement: { type: 'guild_joined', value: true },
    reward: { xp: 150, coins: 30 },
  },
  motivator: {
    id: 'motivator',
    name: 'Motivator',
    description: 'Send 50 motivational messages',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    icon: '💬',
    points: 30,
    requirement: { type: 'messages_sent', value: 50 },
    reward: { xp: 300, coins: 60 },
  },
  
  // Collection Achievements
  fashion_forward: {
    id: 'fashion_forward',
    name: 'Fashion Forward',
    description: 'Unlock 10 customization items',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    icon: '👔',
    points: 25,
    requirement: { type: 'items_unlocked', value: 10 },
    reward: { xp: 250, coins: 50 },
  },
  collector: {
    id: 'collector',
    name: 'Collector',
    description: 'Unlock 50 customization items',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    icon: '🎁',
    points: 75,
    requirement: { type: 'items_unlocked', value: 50 },
    reward: { xp: 750, coins: 150, item: 'collector_badge' },
  },
  
  // Special Achievements
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a workout before 7 AM',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🌅',
    points: 20,
    requirement: { type: 'special', value: 'early_workout' },
    reward: { xp: 200, coins: 40 },
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🦉',
    points: 20,
    requirement: { type: 'special', value: 'late_workout' },
    reward: { xp: 200, coins: 40 },
  },
  evolution_master: {
    id: 'evolution_master',
    name: 'Evolution Master',
    description: 'Reach Champion evolution stage',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '👑',
    points: 200,
    requirement: { type: 'evolution_stage', value: 3 },
    reward: { xp: 2000, coins: 400, item: 'champion_armor' },
  },
};

// Milestone definitions
const MILESTONES = {
  level_10: {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '🎯',
    requirement: { type: 'level', value: 10 },
    reward: { xp: 500, coins: 100, item: 'milestone_badge_10' },
  },
  level_25: {
    id: 'level_25',
    name: 'Level 25',
    description: 'Reach level 25',
    icon: '🏆',
    requirement: { type: 'level', value: 25 },
    reward: { xp: 1000, coins: 250, item: 'milestone_badge_25' },
  },
  level_50: {
    id: 'level_50',
    name: 'Level 50',
    description: 'Reach level 50',
    icon: '💫',
    requirement: { type: 'level', value: 50 },
    reward: { xp: 2500, coins: 500, item: 'milestone_badge_50' },
  },
  xp_1000: {
    id: 'xp_1000',
    name: 'XP Milestone',
    description: 'Earn 1,000 total XP',
    icon: '⭐',
    requirement: { type: 'total_xp', value: 1000 },
    reward: { xp: 100, coins: 50 },
  },
  xp_10000: {
    id: 'xp_10000',
    name: 'XP Master',
    description: 'Earn 10,000 total XP',
    icon: '🌟',
    requirement: { type: 'total_xp', value: 10000 },
    reward: { xp: 500, coins: 200 },
  },
};

class AchievementManager {
  constructor() {
    this.earnedAchievements = new Set();
    this.earnedMilestones = new Set();
    this.achievementProgress = {};
    this.notificationCallbacks = new Set();
    this.isInitialized = false;
  }

  /**
   * Initialize achievement system
   */
  async initialize() {
    try {
      // Load earned achievements from storage
      const savedAchievements = await AsyncStorage.getItem('earnedAchievements');
      if (savedAchievements) {
        this.earnedAchievements = new Set(JSON.parse(savedAchievements));
      }

      const savedMilestones = await AsyncStorage.getItem('earnedMilestones');
      if (savedMilestones) {
        this.earnedMilestones = new Set(JSON.parse(savedMilestones));
      }

      const savedProgress = await AsyncStorage.getItem('achievementProgress');
      if (savedProgress) {
        this.achievementProgress = JSON.parse(savedProgress);
      }

      // Configure notifications
      await this.configureNotifications();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AchievementManager:', error);
      return false;
    }
  }

  /**
   * Configure notification settings
   */
  async configureNotifications() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  /**
   * Check achievements based on current stats
   */
  async checkAchievements(stats) {
    const newAchievements = [];
    const newMilestones = [];

    // Check each achievement
    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (!this.earnedAchievements.has(id)) {
        if (this.checkRequirement(achievement.requirement, stats)) {
          newAchievements.push(achievement);
          this.earnedAchievements.add(id);
        }
      }
    }

    // Check milestones
    for (const [id, milestone] of Object.entries(MILESTONES)) {
      if (!this.earnedMilestones.has(id)) {
        if (this.checkRequirement(milestone.requirement, stats)) {
          newMilestones.push(milestone);
          this.earnedMilestones.add(id);
        }
      }
    }

    // Save progress if there are new achievements
    if (newAchievements.length > 0 || newMilestones.length > 0) {
      await this.saveProgress();
      
      // Trigger notifications for each new achievement
      for (const achievement of newAchievements) {
        await this.triggerAchievementNotification(achievement);
      }
      
      for (const milestone of newMilestones) {
        await this.triggerMilestoneNotification(milestone);
      }
    }

    return {
      newAchievements,
      newMilestones,
      totalRewards: this.calculateTotalRewards([...newAchievements, ...newMilestones]),
    };
  }

  /**
   * Check if a requirement is met
   */
  checkRequirement(requirement, stats) {
    switch (requirement.type) {
      case 'workout_count':
        return (stats.totalWorkouts || 0) >= requirement.value;
      
      case 'cardio_count':
        return (stats.cardioWorkouts || 0) >= requirement.value;
      
      case 'strength_count':
        return (stats.strengthWorkouts || 0) >= requirement.value;
      
      case 'healthy_meals':
        return (stats.healthyMeals || 0) >= requirement.value;
      
      case 'perfect_nutrition_days':
        return (stats.perfectNutritionDays || 0) >= requirement.value;
      
      case 'battles_won':
        return (stats.battlesWon || 0) >= requirement.value;
      
      case 'flawless_victories':
        return (stats.flawlessVictories || 0) >= requirement.value;
      
      case 'streak_days':
        return (stats.currentStreak || 0) >= requirement.value;
      
      case 'friend_count':
        return (stats.friendCount || 0) >= requirement.value;
      
      case 'guild_joined':
        return stats.guildId !== null && stats.guildId !== undefined;
      
      case 'messages_sent':
        return (stats.messagesSent || 0) >= requirement.value;
      
      case 'items_unlocked':
        return (stats.itemsUnlocked || 0) >= requirement.value;
      
      case 'evolution_stage':
        return (stats.evolutionStage || 0) >= requirement.value;
      
      case 'level':
        return (stats.level || 1) >= requirement.value;
      
      case 'total_xp':
        return (stats.totalXP || 0) >= requirement.value;
      
      case 'special':
        return this.checkSpecialRequirement(requirement.value, stats);
      
      default:
        return false;
    }
  }

  /**
   * Check special requirements
   */
  checkSpecialRequirement(specialType, stats) {
    const now = new Date();
    const hour = now.getHours();
    
    switch (specialType) {
      case 'early_workout':
        return stats.lastWorkoutTime && new Date(stats.lastWorkoutTime).getHours() < 7;
      
      case 'late_workout':
        return stats.lastWorkoutTime && new Date(stats.lastWorkoutTime).getHours() >= 22;
      
      default:
        return false;
    }
  }

  /**
   * Calculate total rewards from achievements
   */
  calculateTotalRewards(achievements) {
    const totalRewards = {
      xp: 0,
      coins: 0,
      items: [],
    };

    for (const achievement of achievements) {
      if (achievement.reward) {
        totalRewards.xp += achievement.reward.xp || 0;
        totalRewards.coins += achievement.reward.coins || 0;
        if (achievement.reward.item) {
          totalRewards.items.push(achievement.reward.item);
        }
      }
    }

    return totalRewards;
  }

  /**
   * Trigger achievement notification
   */
  async triggerAchievementNotification(achievement) {
    // Play achievement sound
    AudioService.playAchievementUnlock();
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Create notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Achievement Unlocked!',
        body: `${achievement.name}: ${achievement.description}`,
        data: { type: 'achievement', achievementId: achievement.id },
      },
      trigger: null, // Show immediately
    });

    // Notify callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'achievement',
          achievement,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Achievement callback error:', error);
      }
    });
  }

  /**
   * Trigger milestone notification
   */
  async triggerMilestoneNotification(milestone) {
    // Play milestone sound
    AudioService.playLevelUp();
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Create notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💫 Milestone Reached!',
        body: `${milestone.name}: ${milestone.description}`,
        data: { type: 'milestone', milestoneId: milestone.id },
      },
      trigger: null, // Show immediately
    });

    // Notify callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback({
          type: 'milestone',
          milestone,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Milestone callback error:', error);
      }
    });
  }

  /**
   * Get achievement progress
   */
  getProgress() {
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;
    const earnedCount = this.earnedAchievements.size;
    const totalMilestones = Object.keys(MILESTONES).length;
    const earnedMilestoneCount = this.earnedMilestones.size;

    return {
      achievements: {
        earned: earnedCount,
        total: totalAchievements,
        percentage: (earnedCount / totalAchievements) * 100,
      },
      milestones: {
        earned: earnedMilestoneCount,
        total: totalMilestones,
        percentage: (earnedMilestoneCount / totalMilestones) * 100,
      },
      totalPoints: this.calculateTotalPoints(),
    };
  }

  /**
   * Calculate total achievement points
   */
  calculateTotalPoints() {
    let points = 0;
    
    this.earnedAchievements.forEach(id => {
      const achievement = ACHIEVEMENTS[id];
      if (achievement) {
        points += achievement.points || 0;
      }
    });

    return points;
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    const achievements = [];
    
    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (achievement.category === category) {
        achievements.push({
          ...achievement,
          earned: this.earnedAchievements.has(id),
          progress: this.getAchievementProgress(achievement),
        });
      }
    }

    return achievements;
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(achievement) {
    const progress = this.achievementProgress[achievement.id] || 0;
    const target = achievement.requirement.value;
    
    if (typeof target === 'number') {
      return {
        current: progress,
        target: target,
        percentage: Math.min((progress / target) * 100, 100),
      };
    }
    
    return {
      current: progress ? 1 : 0,
      target: 1,
      percentage: progress ? 100 : 0,
    };
  }

  /**
   * Update achievement progress
   */
  async updateProgress(type, value) {
    // Map progress types to achievement requirement types
    const progressKey = `${type}_progress`;
    this.achievementProgress[progressKey] = (this.achievementProgress[progressKey] || 0) + value;
    
    await this.saveProgress();
  }

  /**
   * Save progress to storage
   */
  async saveProgress() {
    try {
      await AsyncStorage.setItem(
        'earnedAchievements',
        JSON.stringify(Array.from(this.earnedAchievements))
      );
      
      await AsyncStorage.setItem(
        'earnedMilestones',
        JSON.stringify(Array.from(this.earnedMilestones))
      );
      
      await AsyncStorage.setItem(
        'achievementProgress',
        JSON.stringify(this.achievementProgress)
      );

      // Sync to cloud
      await CloudSyncManager.saveAchievementProgress({
        earnedAchievements: Array.from(this.earnedAchievements),
        earnedMilestones: Array.from(this.earnedMilestones),
        progress: this.achievementProgress,
      });
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  /**
   * Register notification callback
   */
  onNotification(callback) {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      earned: this.earnedAchievements.has(achievement.id),
      progress: this.getAchievementProgress(achievement),
    }));
  }

  /**
   * Get all milestones
   */
  getAllMilestones() {
    return Object.values(MILESTONES).map(milestone => ({
      ...milestone,
      earned: this.earnedMilestones.has(milestone.id),
    }));
  }

  /**
   * Reset all achievements (for testing)
   */
  async resetAchievements() {
    this.earnedAchievements.clear();
    this.earnedMilestones.clear();
    this.achievementProgress = {};
    await this.saveProgress();
  }
}

export default new AchievementManager();