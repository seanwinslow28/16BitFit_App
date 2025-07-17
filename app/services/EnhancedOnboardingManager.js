/**
 * Enhanced Onboarding Manager
 * Improved first-time user experience with dynamic coach guidance
 * Following MetaSystemsAgent patterns for superior UX
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundFXManager from './SoundFXManager';

// Onboarding storage keys
const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: '@16BitFit:hasCompletedOnboarding',
  ONBOARDING_PROGRESS: '@16BitFit:onboardingProgress',
  COACH_TIPS_SHOWN: '@16BitFit:coachTipsShown',
  TUTORIAL_REPLAYS: '@16BitFit:tutorialReplays',
  LAST_TIP_SHOWN: '@16BitFit:lastTipShown',
  SESSION_TIP_COUNT: '@16BitFit:sessionTipCount',
};

// Enhanced Coach character
const COACH = {
  name: 'Coach 8-Bit',
  title: 'Fitness Sensei',
  icon: '🎮',
  sprite: '👨‍🏫',
  personality: 'encouraging',
  catchphrases: [
    "Let's power up together!",
    "Every champion starts as a newbie!",
    "Your journey to fitness starts now!",
    "Time to level up your health!",
    "Press START to begin your adventure!",
  ],
};

// Enhanced onboarding steps with rich interactions
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to 16BitFit!',
    dialogue: "Hey there, future champion! I'm Coach 8-Bit, your personal fitness companion. Together, we'll turn your health journey into an epic adventure! 🎮💪",
    action: null,
    buttonText: "Let's Go!",
    canSkip: false,
    mood: 'excited',
    confetti: true,
  },
  {
    id: 'character_intro',
    title: 'Meet Your Character',
    dialogue: "This is your avatar! Right now they're a Newbie, but with your help, they'll evolve into a Champion! Watch how your real-world actions directly affect their growth. Try tapping on them!",
    action: 'Tap on your character to see them react',
    highlight: 'character_arena',
    arrow: 'top',
    buttonText: 'Cool!',
    canSkip: false,
    mood: 'happy',
  },
  {
    id: 'stats_explanation',
    title: 'Your Vital Stats',
    dialogue: "Your character has 5 crucial stats:\n\n❤️ HEALTH - Overall wellness\n💪 STRENGTH - Physical power\n⚡ STAMINA - Energy levels\n😊 HAPPINESS - Mental health\n⚖️ WEIGHT - Body balance\n\nKeep them all high for maximum power!",
    action: 'Check out your current stats below',
    highlight: 'stats_display',
    arrow: 'bottom',
    buttonText: 'Got it!',
    canSkip: false,
    mood: 'thinking',
  },
  {
    id: 'workout_tutorial',
    title: 'Time to Train!',
    dialogue: "Let's power up with your first workout! Different exercises boost different stats:\n\n🏃 CARDIO → Stamina + Health\n🏋️ STRENGTH → Strength + Weight\n🧘 YOGA → Happiness + Health\n⚽ SPORTS → All stats!\n\nTry logging a workout now!",
    action: 'Tap the Workout button to train',
    highlight: 'workout_button',
    arrow: 'right',
    buttonText: 'After Workout',
    canSkip: false,
    mood: 'encouraging',
    interactive: true,
  },
  {
    id: 'nutrition_tutorial',
    title: 'Fuel Your Champion',
    dialogue: "Awesome workout! Now let's talk fuel. Your character needs good nutrition to grow strong:\n\n🥗 HEALTHY MEALS boost all stats\n🍕 JUNK FOOD has consequences...\n\nBut hey, we all need balance! A cheat meal won't ruin your progress.",
    action: 'Try logging a healthy meal',
    highlight: 'nutrition_button',
    arrow: 'left',
    buttonText: 'Understood',
    canSkip: false,
    mood: 'happy',
    interactive: true,
  },
  {
    id: 'evolution_system',
    title: 'Evolution Awaits!',
    dialogue: "Your character evolves through 4 stages:\n\n🥚 NEWBIE → Starting out\n🏃 TRAINEE → Getting stronger\n💪 FIGHTER → Battle ready\n👑 CHAMPION → Ultimate form!\n\nEvolution depends on keeping ALL stats balanced and high!",
    action: null,
    buttonText: 'Amazing!',
    canSkip: false,
    mood: 'proud',
  },
  {
    id: 'battle_intro',
    title: 'Epic Boss Battles',
    dialogue: "Every 5 levels, face a mighty boss! Win battles to:\n\n⭐ Gain massive XP\n🎁 Unlock new gear\n📈 Boost evolution\n🏆 Earn achievements\n\nYour combat power = combined stats. Train hard to win!",
    action: 'Boss battles unlock at level 5, 10, 15...',
    highlight: 'battle_tab',
    arrow: 'bottom',
    buttonText: 'Bring it on!',
    canSkip: true,
    mood: 'excited',
  },
  {
    id: 'daily_routine',
    title: 'Daily Success Tips',
    dialogue: "🌟 PRO TIPS for rapid growth:\n\n📅 Log activities daily for streaks\n⏰ Morning workouts = bonus XP\n🍎 Balance meals throughout the day\n😴 Rest is important too!\n💪 Consistency > Perfection\n\n⚠️ Warning: Stats decay if neglected!",
    action: null,
    buttonText: 'I Will!',
    canSkip: true,
    mood: 'encouraging',
  },
  {
    id: 'social_features',
    title: 'Join the Community',
    dialogue: "You're not alone in this journey! Connect with others:\n\n👥 Add friends & share progress\n⚔️ Join guilds for team battles\n🏆 Compete in global leaderboards\n🎯 Weekly challenges & events\n💬 Share tips & motivation\n\nThe Social tab has it all!",
    action: 'Explore social features anytime',
    highlight: 'social_tab',
    arrow: 'bottom',
    buttonText: 'Awesome!',
    canSkip: true,
    mood: 'happy',
  },
  {
    id: 'advanced_features',
    title: 'Advanced Features',
    dialogue: "As you progress, unlock:\n\n🎨 Character customization\n🛡️ Epic gear & equipment\n🏅 Achievement collection\n📊 Detailed stats tracking\n⚙️ Settings & preferences\n\nExplore the app to discover everything!",
    action: null,
    buttonText: 'Can\'t wait!',
    canSkip: true,
    mood: 'proud',
  },
  {
    id: 'final_message',
    title: 'Your Journey Begins!',
    dialogue: "That's all for now, champion! Remember:\n\n✨ Every small action counts\n🎮 Make fitness fun\n💪 Progress, not perfection\n🏆 You've got this!\n\nI'll pop in with tips as you explore. Now go forth and LEVEL UP YOUR LIFE!",
    action: null,
    buttonText: 'Start Adventure!',
    canSkip: false,
    mood: 'celebrating',
    confetti: true,
  },
];

// Context-sensitive coach tips
const COACH_TIPS = {
  home: {
    first_login: {
      trigger: 'first_login',
      message: "Welcome back, champion! Your character missed you. Let's start with a quick workout to wake them up!",
      mood: 'happy',
    },
    level_5: {
      trigger: 'level_5_reached',
      message: "LEVEL 5! Boss battle unlocked! 🎉 Head to the Battle screen when you're ready to face your first challenge!",
      mood: 'excited',
    },
    streak_3: {
      trigger: 'streak_3_days',
      message: "3-day streak! You're building great habits! Keep it up for special rewards at 7 days!",
      mood: 'proud',
    },
    streak_7: {
      trigger: 'streak_7_days',
      message: "INCREDIBLE! 7-day streak achieved! 🏆 You've unlocked the 'Consistent Champion' achievement!",
      mood: 'celebrating',
    },
    morning: {
      trigger: 'morning_login',
      message: "Good morning! Starting your day with exercise gives bonus XP! Your character is ready to train!",
      mood: 'encouraging',
    },
    evening: {
      trigger: 'evening_login',
      message: "Evening warrior! Don't forget to log your day's activities before bed. Every action counts!",
      mood: 'happy',
    },
  },
  workout: {
    first_workout: {
      trigger: 'first_workout_complete',
      message: "AMAZING first workout! Your character is already stronger! Try different workout types to boost different stats.",
      mood: 'proud',
    },
    variety: {
      trigger: 'workout_variety',
      message: "Pro tip: Mix up your workouts! Cardio, strength, yoga, and sports each provide unique benefits!",
      mood: 'thinking',
    },
    milestone_10: {
      trigger: '10_workouts_complete',
      message: "10 workouts completed! You're officially a fitness warrior! Your dedication is inspiring!",
      mood: 'celebrating',
    },
  },
  battle: {
    first_victory: {
      trigger: 'first_boss_defeated',
      message: "VICTORY! You've proven yourself in battle! Each boss gets tougher, so keep training hard!",
      mood: 'celebrating',
    },
    defeat: {
      trigger: 'boss_defeat',
      message: "Don't give up! Boost your stats through workouts and nutrition, then try again! Every champion faces setbacks!",
      mood: 'encouraging',
    },
    close_battle: {
      trigger: 'close_battle',
      message: "So close! Your stats are almost there. One more workout should give you the edge you need!",
      mood: 'thinking',
    },
  },
  evolution: {
    first_evolution: {
      trigger: 'evolved_to_trainee',
      message: "EVOLUTION! Your Newbie has become a Trainee! Keep balanced stats to reach Fighter status!",
      mood: 'celebrating',
    },
    near_evolution: {
      trigger: 'near_evolution',
      message: "You're so close to evolving! Focus on your lowest stat to trigger the transformation!",
      mood: 'excited',
    },
  },
  stats: {
    stat_imbalance: {
      trigger: 'stat_imbalance',
      message: "I notice some stats are falling behind. Remember: balanced stats = faster evolution!",
      mood: 'thinking',
    },
    all_stats_high: {
      trigger: 'all_stats_above_80',
      message: "WOW! All stats above 80! You're in peak condition! Time to challenge a boss!",
      mood: 'proud',
    },
  },
};

class EnhancedOnboardingManager {
  constructor() {
    this.hasCompletedOnboarding = false;
    this.currentStepIndex = 0;
    this.shownTips = new Set();
    this.isInitialized = false;
    this.callbacks = new Map();
    this.lastTipShownTime = 0;
    this.sessionTipCount = 0;
    this.tipCooldown = 30000; // 30 seconds between tips
    this.maxTipsPerSession = 3; // Max 3 tips per session
  }

  async initialize() {
    try {
      // Load onboarding status
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      this.hasCompletedOnboarding = completed === 'true';
      
      // Load progress
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      if (progress) {
        this.currentStepIndex = parseInt(progress, 10);
      }
      
      // Load shown tips
      const shownTipsData = await AsyncStorage.getItem(STORAGE_KEYS.COACH_TIPS_SHOWN);
      if (shownTipsData) {
        this.shownTips = new Set(JSON.parse(shownTipsData));
      }
      
      // Load last tip time
      const lastTipTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIP_SHOWN);
      if (lastTipTime) {
        this.lastTipShownTime = parseInt(lastTipTime, 10);
      }
      
      // Reset session count on new session (after 1 hour)
      const sessionAge = Date.now() - this.lastTipShownTime;
      if (sessionAge > 3600000) { // 1 hour
        this.sessionTipCount = 0;
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_TIP_COUNT, '0');
      } else {
        const sessionCount = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TIP_COUNT);
        this.sessionTipCount = sessionCount ? parseInt(sessionCount, 10) : 0;
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize OnboardingManager:', error);
      return false;
    }
  }

  needsOnboarding() {
    return !this.hasCompletedOnboarding && this.isInitialized;
  }

  registerCallback(eventType, callback) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    this.callbacks.get(eventType).push(callback);
  }

  triggerCallback(eventType, ...args) {
    if (this.callbacks.has(eventType)) {
      this.callbacks.get(eventType).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in onboarding callback for ${eventType}:`, error);
        }
      });
    }
  }

  getCurrentStep() {
    if (this.currentStepIndex >= ONBOARDING_STEPS.length) {
      return null;
    }
    return ONBOARDING_STEPS[this.currentStepIndex];
  }

  async nextStep() {
    this.currentStepIndex++;
    await this.saveProgress();
    
    if (this.currentStepIndex >= ONBOARDING_STEPS.length) {
      await this.completeOnboarding();
      return null;
    }
    
    // Play transition sound
    await SoundFXManager.playSound('ui_tab_switch');
    
    return this.getCurrentStep();
  }

  async skipStep() {
    const currentStep = this.getCurrentStep();
    if (currentStep && currentStep.canSkip) {
      return this.nextStep();
    }
    return currentStep;
  }

  async skipAll() {
    await this.completeOnboarding();
  }

  async completeOnboarding() {
    this.hasCompletedOnboarding = true;
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    await SoundFXManager.playSound('achievement_unlock');
  }

  async saveProgress() {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      this.currentStepIndex.toString()
    );
  }

  getProgressPercentage() {
    return Math.round((this.currentStepIndex / ONBOARDING_STEPS.length) * 100);
  }

  getCoach() {
    return COACH;
  }

  async getCoachTip(context, trigger) {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastTipShownTime < this.tipCooldown) {
      return null; // Still in cooldown
    }
    
    // Check session limit
    if (this.sessionTipCount >= this.maxTipsPerSession) {
      return null; // Session limit reached
    }
    
    const contextTips = COACH_TIPS[context];
    if (!contextTips) return null;
    
    const tip = contextTips[trigger];
    if (!tip) return null;
    
    // Check if already shown
    const tipId = `${context}_${trigger}`;
    if (this.shownTips.has(tipId)) {
      return null;
    }
    
    // Mark as shown
    this.shownTips.add(tipId);
    this.lastTipShownTime = now;
    this.sessionTipCount++;
    
    await this.saveShownTips();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIP_SHOWN, now.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_TIP_COUNT, this.sessionTipCount.toString());
    
    return {
      ...tip,
      coach: COACH,
      id: tipId,
      duration: 3000, // Reduced from 5000ms
    };
  }

  async saveShownTips() {
    const tipsArray = Array.from(this.shownTips);
    await AsyncStorage.setItem(
      STORAGE_KEYS.COACH_TIPS_SHOWN,
      JSON.stringify(tipsArray)
    );
  }

  async resetTips() {
    this.shownTips.clear();
    await AsyncStorage.removeItem(STORAGE_KEYS.COACH_TIPS_SHOWN);
  }

  async resetOnboarding() {
    this.hasCompletedOnboarding = false;
    this.currentStepIndex = 0;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
      STORAGE_KEYS.ONBOARDING_PROGRESS,
    ]);
  }

  // Get tips for specific situations
  async getTipsForContext(context, playerStats = {}) {
    const tips = [];
    
    // Return early if we've hit session limit or still in cooldown
    if (this.sessionTipCount >= this.maxTipsPerSession) {
      return tips;
    }
    
    const now = Date.now();
    if (now - this.lastTipShownTime < this.tipCooldown) {
      return tips;
    }
    
    // Check various triggers based on context and stats
    // Only check ONE tip per context to avoid multiple tips at once
    switch (context) {
      case 'home':
        // Priority order: level milestone > streak > time of day
        if (playerStats.level && playerStats.level % 5 === 0) {
          const tip = await this.getCoachTip('home', `level_${playerStats.level}`);
          if (tip) {
            tips.push(tip);
            break; // Only one tip at a time
          }
        }
        
        // Check streak achievements
        if (playerStats.streak === 3) {
          const tip = await this.getCoachTip('home', 'streak_3');
          if (tip) {
            tips.push(tip);
            break;
          }
        }
        
        if (playerStats.streak === 7) {
          const tip = await this.getCoachTip('home', 'streak_7');
          if (tip) {
            tips.push(tip);
            break;
          }
        }
        break;
        
      case 'workout':
        if (playerStats.totalWorkouts === 1) {
          const tip = await this.getCoachTip('workout', 'first_workout');
          if (tip) tips.push(tip);
        }
        break;
        
      case 'stats':
        // Check for stat imbalance
        if (playerStats.health && playerStats.strength && playerStats.stamina) {
          const stats = [playerStats.health, playerStats.strength, playerStats.stamina, playerStats.happiness];
          const maxStat = Math.max(...stats);
          const minStat = Math.min(...stats);
          
          if (maxStat - minStat > 30) {
            const tip = await this.getCoachTip('stats', 'stat_imbalance');
            if (tip) tips.push(tip);
          }
        }
        break;
    }
    
    return tips.slice(0, 1); // Only return max 1 tip at a time
  }

  // Check if tutorial can be replayed
  async canReplayTutorial() {
    const replays = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_REPLAYS);
    const replayCount = replays ? parseInt(replays, 10) : 0;
    return replayCount < 3; // Allow up to 3 replays
  }

  async replayTutorial() {
    if (await this.canReplayTutorial()) {
      // Track replay count
      const replays = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_REPLAYS);
      const replayCount = replays ? parseInt(replays, 10) : 0;
      await AsyncStorage.setItem(STORAGE_KEYS.TUTORIAL_REPLAYS, (replayCount + 1).toString());
      
      // Reset onboarding
      await this.resetOnboarding();
      return true;
    }
    return false;
  }
}

export default new EnhancedOnboardingManager();