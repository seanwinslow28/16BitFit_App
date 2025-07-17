/**
 * Daily Bonus Manager
 * Streak tracking and login rewards system
 * Following MetaSystemsAgent patterns for retention mechanics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundFXManager from './SoundFXManager';

// Storage keys
const STORAGE_KEYS = {
  LAST_LOGIN: '@16BitFit:lastLogin',
  STREAK_COUNT: '@16BitFit:streakCount',
  LONGEST_STREAK: '@16BitFit:longestStreak',
  TOTAL_LOGINS: '@16BitFit:totalLogins',
  CLAIMED_BONUSES: '@16BitFit:claimedBonuses',
  WEEKLY_PROGRESS: '@16BitFit:weeklyProgress',
};

// Daily bonus rewards (7-day cycle)
const DAILY_BONUSES = [
  {
    day: 1,
    rewards: {
      xp: 50,
      coins: 10,
      message: "Welcome back! Here's your daily bonus!",
    },
  },
  {
    day: 2,
    rewards: {
      xp: 75,
      coins: 15,
      message: "2 days strong! Keep it up!",
    },
  },
  {
    day: 3,
    rewards: {
      xp: 100,
      coins: 20,
      item: 'energy_drink',
      message: "3 day streak! Have an Energy Drink!",
    },
  },
  {
    day: 4,
    rewards: {
      xp: 125,
      coins: 25,
      message: "Halfway through the week!",
    },
  },
  {
    day: 5,
    rewards: {
      xp: 150,
      coins: 30,
      message: "5 days! You're on fire! 🔥",
    },
  },
  {
    day: 6,
    rewards: {
      xp: 175,
      coins: 35,
      item: 'protein_shake',
      message: "Almost a full week! Have a Protein Shake!",
    },
  },
  {
    day: 7,
    rewards: {
      xp: 250,
      coins: 50,
      item: 'golden_dumbbell',
      achievement: 'week_warrior',
      message: "🎉 FULL WEEK STREAK! Amazing dedication!",
    },
  },
];

// Milestone bonuses for long streaks
const STREAK_MILESTONES = [
  { streak: 14, bonus: { xp: 500, coins: 100, item: 'streak_badge_bronze' }, message: "2 WEEKS! Bronze Streak Badge earned!" },
  { streak: 30, bonus: { xp: 1000, coins: 250, item: 'streak_badge_silver' }, message: "30 DAYS! Silver Streak Badge earned!" },
  { streak: 60, bonus: { xp: 2000, coins: 500, item: 'streak_badge_gold' }, message: "60 DAYS! Gold Streak Badge earned!" },
  { streak: 100, bonus: { xp: 5000, coins: 1000, item: 'streak_badge_platinum' }, message: "100 DAYS! PLATINUM STREAK BADGE! You're a legend!" },
  { streak: 365, bonus: { xp: 10000, coins: 5000, item: 'streak_badge_diamond' }, message: "365 DAYS! DIAMOND STREAK! One full year!" },
];

class DailyBonusManager {
  constructor() {
    this.lastLogin = null;
    this.streakCount = 0;
    this.longestStreak = 0;
    this.totalLogins = 0;
    this.claimedToday = false;
    this.weeklyProgress = [];
  }

  /**
   * Initialize daily bonus system
   */
  async initialize() {
    try {
      // Load saved data
      const [lastLogin, streakCount, longestStreak, totalLogins, weeklyProgress] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LONGEST_STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.TOTAL_LOGINS),
        AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_PROGRESS),
      ]);

      this.lastLogin = lastLogin ? new Date(lastLogin) : null;
      this.streakCount = parseInt(streakCount || '0', 10);
      this.longestStreak = parseInt(longestStreak || '0', 10);
      this.totalLogins = parseInt(totalLogins || '0', 10);
      this.weeklyProgress = weeklyProgress ? JSON.parse(weeklyProgress) : [];

      console.log('DailyBonusManager initialized', {
        lastLogin: this.lastLogin,
        streakCount: this.streakCount,
        longestStreak: this.longestStreak,
        totalLogins: this.totalLogins,
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize DailyBonusManager:', error);
      return false;
    }
  }

  /**
   * Check if user can claim daily bonus
   */
  canClaimDailyBonus() {
    if (!this.lastLogin) return true;

    const now = new Date();
    const lastLoginDate = new Date(this.lastLogin);
    
    // Reset to start of day for comparison
    now.setHours(0, 0, 0, 0);
    lastLoginDate.setHours(0, 0, 0, 0);
    
    return now.getTime() > lastLoginDate.getTime();
  }

  /**
   * Calculate current streak status
   */
  getStreakStatus() {
    if (!this.lastLogin) {
      return { active: false, count: 0, broken: false };
    }

    const now = new Date();
    const lastLoginDate = new Date(this.lastLogin);
    
    // Calculate days difference
    const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day
      return { active: true, count: this.streakCount, broken: false };
    } else if (daysDiff === 1) {
      // Consecutive day
      return { active: true, count: this.streakCount, broken: false };
    } else {
      // Streak broken
      return { active: false, count: 0, broken: true, previousStreak: this.streakCount };
    }
  }

  /**
   * Claim daily bonus
   */
  async claimDailyBonus() {
    if (!this.canClaimDailyBonus()) {
      return {
        success: false,
        message: "You've already claimed today's bonus!",
      };
    }

    const now = new Date();
    const streakStatus = this.getStreakStatus();
    
    // Update streak
    if (streakStatus.broken) {
      this.streakCount = 1; // Reset streak
    } else {
      this.streakCount = streakStatus.count + 1;
    }
    
    // Update longest streak
    if (this.streakCount > this.longestStreak) {
      this.longestStreak = this.streakCount;
    }
    
    // Update total logins
    this.totalLogins += 1;
    
    // Get today's bonus (7-day cycle)
    const dayInCycle = ((this.streakCount - 1) % 7) + 1;
    const dailyBonus = DAILY_BONUSES[dayInCycle - 1];
    
    // Check for milestone bonuses
    const milestoneBonus = STREAK_MILESTONES.find(m => m.streak === this.streakCount);
    
    // Combine rewards
    const totalRewards = {
      ...dailyBonus.rewards,
      streak: this.streakCount,
      totalLogins: this.totalLogins,
    };
    
    if (milestoneBonus) {
      totalRewards.xp = (totalRewards.xp || 0) + milestoneBonus.bonus.xp;
      totalRewards.coins = (totalRewards.coins || 0) + milestoneBonus.bonus.coins;
      totalRewards.milestoneItem = milestoneBonus.bonus.item;
      totalRewards.milestoneMessage = milestoneBonus.message;
    }
    
    // Update weekly progress
    this.updateWeeklyProgress(now);
    
    // Save state
    await this.saveState(now);
    
    // Play sound effect
    if (milestoneBonus) {
      await SoundFXManager.playEvolution();
    } else if (dayInCycle === 7) {
      await SoundFXManager.playAchievementUnlock();
    } else {
      await SoundFXManager.playCoinCollect();
    }
    
    return {
      success: true,
      rewards: totalRewards,
      dayInCycle,
      streakBroken: streakStatus.broken,
      previousStreak: streakStatus.previousStreak,
    };
  }

  /**
   * Update weekly progress tracking
   */
  updateWeeklyProgress(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Initialize week if needed
    if (this.weeklyProgress.length !== 7) {
      this.weeklyProgress = Array(7).fill(false);
    }
    
    this.weeklyProgress[dayOfWeek] = true;
  }

  /**
   * Get weekly progress
   */
  getWeeklyProgress() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    return days.map((day, index) => ({
      day,
      claimed: this.weeklyProgress[index] || false,
      isToday: index === today,
    }));
  }

  /**
   * Get next milestone
   */
  getNextMilestone() {
    const nextMilestone = STREAK_MILESTONES.find(m => m.streak > this.streakCount);
    if (!nextMilestone) return null;
    
    return {
      ...nextMilestone,
      daysRemaining: nextMilestone.streak - this.streakCount,
    };
  }

  /**
   * Save state to storage
   */
  async saveState(loginDate) {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, loginDate.toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.STREAK_COUNT, this.streakCount.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LONGEST_STREAK, this.longestStreak.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.TOTAL_LOGINS, this.totalLogins.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_PROGRESS, JSON.stringify(this.weeklyProgress)),
      ]);
    } catch (error) {
      console.error('Failed to save daily bonus state:', error);
    }
  }

  /**
   * Get summary data
   */
  getSummary() {
    return {
      currentStreak: this.streakCount,
      longestStreak: this.longestStreak,
      totalLogins: this.totalLogins,
      canClaimToday: this.canClaimDailyBonus(),
      weeklyProgress: this.getWeeklyProgress(),
      nextMilestone: this.getNextMilestone(),
      dayInCycle: ((this.streakCount - 1) % 7) + 1,
    };
  }

  /**
   * Reset all data (for testing)
   */
  async reset() {
    this.lastLogin = null;
    this.streakCount = 0;
    this.longestStreak = 0;
    this.totalLogins = 0;
    this.weeklyProgress = [];
    
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN),
      AsyncStorage.removeItem(STORAGE_KEYS.STREAK_COUNT),
      AsyncStorage.removeItem(STORAGE_KEYS.LONGEST_STREAK),
      AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_LOGINS),
      AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_PROGRESS),
    ]);
  }
}

export default new DailyBonusManager();