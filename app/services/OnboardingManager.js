/**
 * Onboarding Manager
 * First-time user experience with Coach tutorial
 * Following MetaSystemsAgent patterns for guided learning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundFXManager from './SoundFXManager';

// Onboarding storage keys
const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: '@16BitFit:hasCompletedOnboarding',
  ONBOARDING_PROGRESS: '@16BitFit:onboardingProgress',
  COACH_TIPS_SHOWN: '@16BitFit:coachTipsShown',
};

// Coach character data
const COACH = {
  name: 'Coach 8-Bit',
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

// Onboarding steps with coach dialogue
const ONBOARDING_STEPS = [
  {
    id: 'character_selection',
    title: 'Choose Your Fighter',
    coach: "First, let's choose your fighter type! Each archetype has unique strengths that match different fitness goals.",
    action: 'show_character_selection',
    component: 'CharacterSelectionScreen',
    nextButton: null, // Component handles its own navigation
    canSkip: false,
    timeEstimate: 15, // seconds
  },
  {
    id: 'welcome',
    title: 'Welcome to 16BitFit!',
    coach: "Excellent choice! I'm Coach 8-Bit, and I'll help you transform your fighter from a Newbie to a Champion!",
    action: null,
    nextButton: "Let's Go!",
    canSkip: false,
    timeEstimate: 10, // seconds
  },
  {
    id: 'character_intro',
    title: 'Meet Your Character',
    coach: "This is your avatar! Right now they're a Newbie, but with your help, they'll evolve into a Champion! Your real-world actions directly affect their growth.",
    action: 'show_character',
    highlight: 'character_arena',
    nextButton: 'Cool!',
    canSkip: false,
  },
  {
    id: 'stats_explanation',
    title: 'Understanding Your Stats',
    coach: "Your character has 5 main stats: Health ❤️, Strength 💪, Stamina ⚡, Happiness 😊, and Weight ⚖️. Keep them balanced for optimal evolution!",
    action: 'show_stats',
    highlight: 'stats_display',
    nextButton: 'Got it!',
    canSkip: false,
  },
  {
    id: 'workout_tutorial',
    title: 'Time to Train!',
    coach: "Let's try your first workout! Different exercises boost different stats. Cardio improves stamina, strength training builds... well, strength!",
    action: 'prompt_workout',
    highlight: 'workout_button',
    nextButton: 'Show Me',
    canSkip: false,
    interactive: true,
  },
  {
    id: 'nutrition_tutorial',
    title: 'Fuel Your Champion',
    coach: "Great job! Now let's talk nutrition. Healthy meals boost your stats, while junk food... not so much. But hey, we all need a cheat meal sometimes!",
    action: 'prompt_nutrition',
    highlight: 'nutrition_button',
    nextButton: 'Understood',
    canSkip: false,
    interactive: true,
  },
  {
    id: 'battle_intro',
    title: 'Boss Battles',
    coach: "Every 5 levels, you'll face a boss! Win to evolve your character and unlock new gear. Your combat power comes from your combined stats.",
    action: 'show_battle_preview',
    highlight: 'battle_button',
    nextButton: 'Exciting!',
    canSkip: true,
  },
  {
    id: 'daily_routine',
    title: 'Daily Habits',
    coach: "Success comes from consistency! Log workouts, eat well, and battle bosses regularly. Your character will decay slowly if neglected, so stay active!",
    action: null,
    nextButton: 'I Will!',
    canSkip: true,
  },
  {
    id: 'social_features',
    title: 'Join the Community',
    coach: "You're not alone! Add friends, join guilds, and compete in challenges. The social tab has leaderboards, events, and more!",
    action: 'show_social',
    highlight: 'social_tab',
    nextButton: 'Awesome!',
    canSkip: true,
  },
  {
    id: 'completion',
    title: "You're Ready!",
    coach: "That's it, champion! You now know everything to start your fitness adventure. Remember: consistency is key, and I'll be here to guide you!",
    action: 'complete_onboarding',
    confetti: true,
    nextButton: 'Start Journey',
    canSkip: false,
  },
];

// Coach tips for various screens
const COACH_TIPS = {
  home: {
    first_visit: "Welcome back! Tap any button to start improving your character.",
    streak_3: "3 day streak! You're building great habits!",
    streak_7: "A whole week! Your dedication is paying off!",
    level_5: "Level 5! Time for your first boss battle!",
    evolution: "Amazing! Your character evolved! Keep up the great work!",
  },
  workout: {
    first_workout: "Your first workout! Remember, any movement counts!",
    variety: "Mix up your workouts for balanced stat growth!",
    post_workout: "Great job! Your character is getting stronger!",
  },
  nutrition: {
    first_meal: "Food is fuel! Choose wisely to maximize your gains.",
    balanced: "A balanced diet leads to balanced stats!",
    cheat_meal: "Cheat meals are okay in moderation. Balance is key!",
  },
  battle: {
    first_battle: "Your first boss battle! Your total stats determine victory.",
    pre_battle: "Train hard before challenging bosses!",
    victory: "Victory! You've proven your strength!",
    defeat: "Don't give up! Train harder and try again!",
  },
  stats: {
    overview: "Track your progress here. Every workout counts!",
    achievements: "Achievements unlock rewards and show your dedication!",
    history: "Your journey visualized. Look how far you've come!",
  },
};

class OnboardingManager {
  constructor() {
    this.currentStep = 0;
    this.hasCompletedOnboarding = false;
    this.shownTips = new Set();
    this.onboardingCallbacks = {};
  }

  /**
   * Initialize onboarding system
   */
  async initialize() {
    try {
      // Check if onboarding has been completed
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      this.hasCompletedOnboarding = completed === 'true';

      // Load progress
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      if (progress) {
        this.currentStep = parseInt(progress, 10);
      }

      // Load shown tips
      const shownTips = await AsyncStorage.getItem(STORAGE_KEYS.COACH_TIPS_SHOWN);
      if (shownTips) {
        this.shownTips = new Set(JSON.parse(shownTips));
      }

      console.log('OnboardingManager initialized', {
        completed: this.hasCompletedOnboarding,
        currentStep: this.currentStep,
        shownTips: this.shownTips.size,
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize OnboardingManager:', error);
      return false;
    }
  }

  /**
   * Check if user needs onboarding
   */
  needsOnboarding() {
    return !this.hasCompletedOnboarding;
  }

  /**
   * Get current onboarding step
   */
  getCurrentStep() {
    if (this.currentStep >= ONBOARDING_STEPS.length) {
      return null;
    }
    return ONBOARDING_STEPS[this.currentStep];
  }

  /**
   * Progress to next onboarding step
   */
  async nextStep() {
    this.currentStep++;
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, this.currentStep.toString());

    const currentStep = this.getCurrentStep();
    if (currentStep) {
      // Play progression sound
      await SoundFXManager.playSuccess();
      
      // Execute step action if defined
      if (currentStep.action && this.onboardingCallbacks[currentStep.action]) {
        this.onboardingCallbacks[currentStep.action]();
      }

      // Check if this was the final step
      if (currentStep.action === 'complete_onboarding') {
        await this.completeOnboarding();
      }
    }

    return currentStep;
  }

  /**
   * Skip current step (if allowed)
   */
  async skipStep() {
    const currentStep = this.getCurrentStep();
    if (currentStep && currentStep.canSkip) {
      return await this.nextStep();
    }
    return currentStep;
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding() {
    this.hasCompletedOnboarding = true;
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, '0');
    
    // Play celebration sound
    await SoundFXManager.playAchievementUnlock();
    
    console.log('Onboarding completed!');
  }

  /**
   * Reset onboarding (for testing or new users)
   */
  async resetOnboarding() {
    this.hasCompletedOnboarding = false;
    this.currentStep = 0;
    this.shownTips.clear();
    
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.COACH_TIPS_SHOWN);
    
    console.log('Onboarding reset');
  }

  /**
   * Get coach tip for context
   */
  async getCoachTip(screen, context = 'default') {
    // Don't show tips during onboarding
    if (!this.hasCompletedOnboarding) {
      return null;
    }

    const tipKey = `${screen}_${context}`;
    
    // Check if we've already shown this tip
    if (this.shownTips.has(tipKey)) {
      return null;
    }

    // Get the tip
    const tips = COACH_TIPS[screen];
    if (!tips || !tips[context]) {
      return null;
    }

    // Mark as shown
    this.shownTips.add(tipKey);
    await AsyncStorage.setItem(
      STORAGE_KEYS.COACH_TIPS_SHOWN,
      JSON.stringify(Array.from(this.shownTips))
    );

    return {
      coach: COACH,
      message: tips[context],
      screen,
      context,
    };
  }

  /**
   * Register callback for onboarding actions
   */
  registerCallback(action, callback) {
    this.onboardingCallbacks[action] = callback;
  }

  /**
   * Get coach info
   */
  getCoach() {
    return COACH;
  }

  /**
   * Check if a specific tip has been shown
   */
  hasTipBeenShown(screen, context) {
    return this.shownTips.has(`${screen}_${context}`);
  }

  /**
   * Get onboarding progress percentage
   */
  getProgressPercentage() {
    return Math.round((this.currentStep / ONBOARDING_STEPS.length) * 100);
  }

  /**
   * Check if user is in interactive step
   */
  isInteractiveStep() {
    const currentStep = this.getCurrentStep();
    return currentStep && currentStep.interactive;
  }

  /**
   * Validate step completion
   */
  canProgressFromStep(stepId) {
    // Add validation logic for interactive steps
    const validations = {
      workout_tutorial: () => {
        // Check if user has completed at least one workout
        return true; // Implement actual check
      },
      nutrition_tutorial: () => {
        // Check if user has logged at least one meal
        return true; // Implement actual check
      },
    };

    return !validations[stepId] || validations[stepId]();
  }
}

export default new OnboardingManager();