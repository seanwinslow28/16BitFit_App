/**
 * 16BitFit - Gamified Fitness & Nutrition Tracking App
 * GameBoy-Style Shell with Avatar Evolution System
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PhaserGame from './PhaserGame';
import HealthIntegration from './services/HealthIntegration';
import SupabaseService from './services/SupabaseService';
import AudioService from './services/AudioService';
import SoundFXManager from './services/SoundFXManager';
import EnhancedOnboardingManager from './services/EnhancedOnboardingManager';
import OnboardingOverlay from './components/OnboardingOverlay';
import EnhancedOnboardingOverlay from './components/EnhancedOnboardingOverlay';
import { useHighlight } from './components/InteractiveHighlight';
import { usePressStart2P } from './hooks/useFonts';
// import CoachTip from './components/CoachTip'; // Removed coach tips
import DailyBonusManager from './services/DailyBonusManager';
import DailyBonusNotification from './components/DailyBonusNotification';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import FigmaTestButton from './components/FigmaTestButton';
import CursorTestSquare from './components/CursorTestSquare';
import CharacterArena from './components/CharacterArena';
import ActionButton, { StatBar, NavButton } from './components/ActionButton';
import WorkoutFeedback from './components/WorkoutFeedback';
import NutritionFeedback from './components/NutritionFeedback';
import BattleFeedback from './components/BattleFeedback';
import EvolutionCeremony from './components/EvolutionCeremony';
import StepGoalTracker from './components/StepGoalTracker';
import EnhancedHomeScreen from './components/EnhancedHomeScreen';
import GameBoyHomeScreen from './components/GameBoyHomeScreen';
import GameBoyStatsScreen from './screens/StatsScreen';
import GameBoyBattleScreen from './screens/BattleScreen';
import CharacterCustomizationScreen from './screens/CharacterCustomizationScreen';
import SocialScreen from './screens/SocialScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import FriendSystem from './components/FriendSystem';
import Leaderboards from './components/Leaderboards';
import GuildSystem from './components/GuildSystem';
import ProfileScreen from './screens/ProfileScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomizationDatabase from './components/CustomizationDatabase';
import UnlockSystem from './components/UnlockSystem';
import RewardSystem from './components/RewardSystem';
import CloudSyncManager from './services/CloudSyncManager';
import AchievementManager from './services/AchievementManager';
// import AchievementNotification from './components/AchievementNotification'; // Removed achievement popups
import SettingsManager from './services/SettingsManager';
import { Colors } from './constants/DesignSystem';
import { useFontLoader } from './constants/Fonts';
import createStyles from './styles/AppStyles';
import { preloadCommonAssets } from './services/ImageCache';
import performanceMonitor from './services/PerformanceMonitor';
import { ScreenTransitionProvider, useScreenTransition, TRANSITION_TYPES } from './services/ScreenTransitionManager';
import ScreenEntranceAnimation, { ENTRANCE_TYPES } from './components/ScreenEntranceAnimation';
import AnimatedLoadingScreen, { LOADING_TYPES } from './components/AnimatedLoadingScreen';
import NavigationAnimator from './components/NavigationAnimator';
import EnhancedScreenTransition, { TRANSITION_TYPES as ENHANCED_TRANSITIONS } from './components/EnhancedScreenTransition';
import { FadeIn, BounceIn, SlideIn, AnimatedNumber } from './components/MicroAnimations';
import NetworkManager from './services/NetworkManager';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import ToastNotification, { showError, showSuccess, showWarning, showToast } from './components/ToastNotification';
import RetryModal from './components/RetryModal';
import NotificationQueue from './services/NotificationQueue';

const {width, height} = Dimensions.get('window');

const AppContent = () => {
  // Font loading and styles creation
  const { fontsLoaded, onLayoutRootView } = useFontLoader();
  const styles = createStyles(fontsLoaded);
  
  // Tutorial highlight system
  const { refs: highlightRefs, registerRef } = useHighlight();
  
  // Initialize notification queue
  useEffect(() => {
    NotificationQueue.initialize();
    
    // Notification callbacks disabled - no popups
    // NotificationQueue.registerCallback('coachTip', (notification, duration) => {
    //   setCoachTip(notification.data);
    //   setTimeout(() => setCoachTip(null), duration);
    // });
    // 
    // NotificationQueue.registerCallback('achievement', (notification, duration) => {
    //   setAchievementNotification({
    //     visible: true,
    //     achievement: notification.data,
    //   });
    //   setTimeout(() => setAchievementNotification({ visible: false, achievement: null }), duration);
    // });
    
    NotificationQueue.registerCallback('dailyBonus', (notification, duration) => {
      setDailyBonusNotification(notification.data);
      setTimeout(() => setDailyBonusNotification(null), duration);
    });
    
    // Toast notifications disabled - no popups
    // NotificationQueue.registerCallback('toast', (notification, duration) => {
    //   showToast(notification.message, notification.subtype, duration);
    // });
  }, []);
  
  // Game State
  const [currentScreen, setCurrentScreen] = useState('home');
  const [useEnhancedUI, setUseEnhancedUI] = useState(true); // Toggle for new UI
  const [useGameBoyUI, setUseGameBoyUI] = useState(true); // Toggle for GameBoy UI - ENABLED FOR TESTING
  const [playerStats, setPlayerStats] = useState({
    // Core stats (0-100) as per documentation
    health: 75,      // Overall wellness
    strength: 60,    // Physical power
    stamina: 70,     // Energy/endurance
    happiness: 80,   // Mental wellbeing
    weight: 55,      // Body composition (50 is ideal, 30-70 range)
    
    // Evolution system (0-3: Newbie → Trainee → Fighter → Champion)
    evolutionStage: 1,
    
    // Supporting stats
    level: 5,
    xp: 180,
    xpToNext: 300,
    streak: 7,
    
    // Timestamps for decay system
    lastUpdate: Date.now(),
    lastDecay: Date.now(),
  });

  const [avatarState, setAvatarState] = useState({
    // Current animation state
    currentAnimation: 'idle',
    
    // Visual state based on stats (healthy/sick/chubby)
    visualState: 'healthy',
    
    // Mood indicators
    mood: 'content',
    
    // Equipment unlocked through progression
    gear: ['headband', 'gloves'],
    
    // Available animations based on evolution stage
    unlockedAnimations: ['idle', 'flex', 'eat', 'workout'],
  });

  const [dailyActions, setDailyActions] = useState({
    workoutLogged: false,
    mealLogged: false,
    restLogged: false,
  });

  const [bossAvailable, setBossAvailable] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  
  // Character customization state
  const [characterAppearance, setCharacterAppearance] = useState({
    body: 'body_default',
    hair: 'hair_default',
    outfit: 'outfit_default',
    accessories: 'gear_none',
    effects: 'effect_none',
  });
  const [unlockedCustomItems, setUnlockedCustomItems] = useState([
    'body_default', 'hair_default', 'outfit_default', 'gear_none', 'effect_none'
  ]);
  const [equippedCustomizations, setEquippedCustomizations] = useState({
    body: 'body_default',
    hair: 'hair_default',
    outfit: 'outfit_default',
    accessories: 'gear_none',
    effects: 'effect_none',
  });
  
  // Achievement tracking
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  
  // Achievement notification state
  const [achievementNotification, setAchievementNotification] = useState({
    visible: false,
    achievement: null,
  });
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [coachTip, setCoachTip] = useState(null);
  
  // Daily bonus state
  const [dailyBonusNotification, setDailyBonusNotification] = useState(null);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  
  // Animation states
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('INITIALIZING...');
  const [error, setError] = useState(null);
  
  // Network state
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryError, setRetryError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Screen transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTransitionType, setCurrentTransitionType] = useState(ENHANCED_TRANSITIONS.FADE);
  
  // Navigation helper with enhanced transitions
  const navigateToScreen = async (targetScreen, options = {}) => {
    if (isTransitioning || targetScreen === currentScreen) return;
    
    const {
      transitionType,
      loadingMessage = 'LOADING...',
      playSound = true,
      duration = 400,
    } = options;
    
    // Determine transition type based on navigation
    const transition = transitionType || (() => {
      // Special transitions
      if (targetScreen === 'battle' && currentScreen === 'home') {
        return ENHANCED_TRANSITIONS.BATTLE_ZOOM;
      }
      if (targetScreen === 'home' && currentScreen === 'battle') {
        return ENHANCED_TRANSITIONS.SCALE_FADE;
      }
      if (targetScreen === 'stats') {
        return ENHANCED_TRANSITIONS.SLIDE_UP;
      }
      // Default transitions
      const screenOrder = ['home', 'workout', 'feed', 'battle', 'stats'];
      const currentIndex = screenOrder.indexOf(currentScreen);
      const targetIndex = screenOrder.indexOf(targetScreen);
      
      if (targetIndex > currentIndex) {
        return ENHANCED_TRANSITIONS.SLIDE_LEFT;
      } else if (targetIndex < currentIndex) {
        return ENHANCED_TRANSITIONS.SLIDE_RIGHT;
      }
      return ENHANCED_TRANSITIONS.FADE;
    })();
    
    setIsTransitioning(true);
    setCurrentTransitionType(transition);
    
    // Play transition sound
    if (playSound) {
      await SoundFXManager.playSound('ui_transition');
    }
    
    // Transition duration based on type
    const transitionDuration = duration || {
      [ENHANCED_TRANSITIONS.BATTLE_ZOOM]: 800,
      [ENHANCED_TRANSITIONS.PIXEL_DISSOLVE]: 600,
      [ENHANCED_TRANSITIONS.SCREEN_WIPE]: 500,
      [ENHANCED_TRANSITIONS.POWER_OFF]: 400,
      [ENHANCED_TRANSITIONS.POWER_ON]: 600,
    }[transition] || 300;
    
    // Perform transition
    setTimeout(() => {
      setCurrentScreen(targetScreen);
      setIsTransitioning(false);
    }, transitionDuration);
  };
  
  // Health integration state
  const [healthStatus, setHealthStatus] = useState({
    isAvailable: false,
    permissions: {},
    lastSync: null,
  });
  const [healthData, setHealthData] = useState({
    steps: 0,
    workouts: [],
    heartRate: null,
    sleep: null,
  });
  
  // Force update for audio settings
  const [, forceUpdate] = useState({});
  
  // Check for level up
  const checkLevelUp = async () => {
    const xpNeeded = playerStats.xpToNext || 300;
    if (playerStats.xp >= xpNeeded) {
      const newLevel = playerStats.level + 1;
      
      // Level up!
      setPlayerStats(prev => ({
        ...prev,
        level: newLevel,
        xp: prev.xp - xpNeeded,
        xpToNext: xpNeeded + 100, // Increase XP requirement
      }));
      
      // Play level up sound
      await SoundFXManager.playLevelUp();
      
      // Check for boss availability
      if (newLevel % 5 === 0) {
        setBossAvailable(true);
        // Coach tips removed
      }
      
      // Achievement popups removed - Level up is shown in the UI
      
      // Trigger special level up transition
      setCurrentTransitionType(ENHANCED_TRANSITIONS.POWER_ON);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  // Character System Helper Functions
  const getEvolutionStage = (stats) => {
    const avgStat = (stats.health + stats.strength + stats.stamina + stats.happiness) / 4;
    const weightPenalty = Math.abs(stats.weight - 50) * 2; // Penalty for being far from ideal weight
    const effectiveScore = Math.max(0, avgStat - weightPenalty);
    
    if (effectiveScore >= 80) return 3; // Champion
    if (effectiveScore >= 60) return 2; // Fighter
    if (effectiveScore >= 40) return 1; // Trainee
    return 0; // Newbie
  };

  const getEvolutionName = (stage) => {
    const names = ['Newbie', 'Trainee', 'Fighter', 'Champion'];
    return names[stage] || 'Newbie';
  };

  const getVisualState = (stats) => {
    // Determine visual state based on stats
    if (stats.health < 30 || stats.happiness < 30) return 'sick';
    if (stats.weight > 60) return 'chubby';
    if (stats.health > 70 && stats.happiness > 70) return 'healthy';
    return 'normal';
  };

  const getMoodFromStats = (stats) => {
    if (stats.happiness >= 80) return 'very_happy';
    if (stats.happiness >= 60) return 'happy';
    if (stats.happiness >= 40) return 'content';
    if (stats.happiness >= 20) return 'sad';
    return 'very_sad';
  };

  // Get unlocked animations based on evolution stage
  const getUnlockedAnimations = (evolutionStage) => {
    const baseAnimations = ['idle', 'eating'];
    
    switch (evolutionStage) {
      case 0: // Newbie
        return [...baseAnimations, 'sad'];
      case 1: // Trainee
        return [...baseAnimations, 'sad', 'thumbsUp', 'postWorkout'];
      case 2: // Fighter
        return [...baseAnimations, 'sad', 'thumbsUp', 'postWorkout', 'flex'];
      case 3: // Champion
        return [...baseAnimations, 'sad', 'thumbsUp', 'postWorkout', 'flex'];
      default:
        return baseAnimations;
    }
  };

  // Get unlocked gear based on evolution stage
  const getUnlockedGear = (evolutionStage, currentGear = []) => {
    const gearByStage = {
      0: [], // Newbie - no gear
      1: ['headband'], // Trainee - basic headband
      2: ['headband', 'gloves'], // Fighter - headband + gloves
      3: ['headband', 'gloves', 'belt', 'shoes'], // Champion - full gear set
    };
    
    const availableGear = gearByStage[evolutionStage] || [];
    
    // Only add new gear, don't remove existing gear
    const newGear = [...new Set([...currentGear, ...availableGear])];
    return newGear;
  };

  // Enhanced evolution tracking with ceremony triggers
  useEffect(() => {
    const newEvolutionStage = getEvolutionStage(playerStats);
    const newVisualState = getVisualState(playerStats);
    const newMood = getMoodFromStats(playerStats);
    
    // Check for evolution advancement
    if (newEvolutionStage > playerStats.evolutionStage) {
      // Trigger evolution ceremony
      setEvolutionCeremony({
        showCeremony: false, // Ceremony disabled - no popups
        newEvolutionStage: newEvolutionStage,
        previousStage: playerStats.evolutionStage,
      });
      
      // Play evolution sound
      AudioService.playStatChange(true);
      AudioService.playWorkoutComplete();
    }
    
    setPlayerStats(prev => ({
      ...prev,
      evolutionStage: newEvolutionStage
    }));
    
    setAvatarState(prev => ({
      ...prev,
      visualState: newVisualState,
      mood: newMood,
      // Unlock new animations based on evolution stage
      unlockedAnimations: getUnlockedAnimations(newEvolutionStage),
      // Unlock new gear based on evolution stage
      gear: getUnlockedGear(newEvolutionStage, prev.gear),
    }));
  }, [playerStats.health, playerStats.strength, playerStats.stamina, playerStats.happiness, playerStats.weight]);

  // Animation System with improved transitions
  const triggerAnimation = (animationType, duration = 2000) => {
    setAvatarState(prev => ({
      ...prev,
      currentAnimation: animationType
    }));
    
    // Return to idle after animation duration with smooth transition
    setTimeout(() => {
      setAvatarState(prev => ({
        ...prev,
        currentAnimation: 'idle'
      }));
    }, duration);
  };

  // Initialize services on app start
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      setLoadingMessage('INITIALIZING...');
      
      // Global timeout to prevent app from hanging indefinitely
      const globalTimeout = setTimeout(() => {
        console.error('App initialization timeout - forcing completion');
        setError({ type: 'timeout', message: 'Initialization took too long' });
        setIsLoading(false);
      }, 15000); // 15 second global timeout
      
      try {
        // Start performance monitoring in development
        if (__DEV__) {
          performanceMonitor.startMonitoring();
        }
        
        // Preload common image assets
        setLoadingMessage('Loading assets...');
        await preloadCommonAssets();
        
        // Initialize settings manager with timeout
        setLoadingMessage('Loading settings...');
        try {
          await Promise.race([
            SettingsManager.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Settings timeout')), 5000)
            )
          ]);
          console.log('Settings manager initialized');
        } catch (error) {
          console.warn('Settings manager failed, using defaults:', error);
        }
        
        // Initialize network manager with timeout
        setLoadingMessage('Checking network...');
        try {
          await Promise.race([
            NetworkManager.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Network timeout')), 3000)
            )
          ]);
          console.log('Network manager initialized');
        } catch (error) {
          console.warn('Network manager failed, using defaults:', error);
        }
        
        // Initialize sound system with timeout
        setLoadingMessage('Setting up audio...');
        try {
          await Promise.race([
            SoundFXManager.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Audio timeout')), 5000)
            )
          ]);
          console.log('Sound system initialized');
        } catch (error) {
          console.warn('Sound system failed, continuing without audio:', error);
        }
        
        // Initialize enhanced onboarding with timeout
        setLoadingMessage('Preparing onboarding...');
        try {
          await Promise.race([
            EnhancedOnboardingManager.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Onboarding timeout')), 3000)
            )
          ]);
          if (EnhancedOnboardingManager.needsOnboarding()) {
            setShowOnboarding(true);
          }
          console.log('Onboarding manager initialized');
        } catch (error) {
          console.warn('Onboarding manager failed, skipping onboarding:', error);
        }
        
        // Initialize daily bonus with timeout
        setLoadingMessage('Loading daily bonuses...');
        try {
          await Promise.race([
            DailyBonusManager.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Daily bonus timeout')), 3000)
            )
          ]);
          console.log('Daily bonus manager initialized');
        } catch (error) {
          console.warn('Daily bonus manager failed, using defaults:', error);
        }
        // Daily bonus disabled - no popups
        // if (DailyBonusManager.canClaimDailyBonus() && !EnhancedOnboardingManager.needsOnboarding()) {
        //   // Show daily bonus after a short delay
        //   setTimeout(() => setShowDailyBonus(true), 1000);
        // }
        
        // Initialize health integration with timeout
        setLoadingMessage('Initializing health integration...');
        try {
          await Promise.race([
            HealthIntegration.initialize(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Health integration timeout')), 5000)
            )
          ]);
          console.log('Health integration initialized');
          
          // Request permissions with timeout
          await Promise.race([
            HealthIntegration.requestPermissions(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Health permissions timeout')), 3000)
            )
          ]);
          
          // Get initial step progress with timeout
          const progress = await Promise.race([
            HealthIntegration.getStepGoalProgress(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Step progress timeout')), 2000)
            )
          ]);
          setStepProgress(progress);
          
        } catch (error) {
          console.warn('Health integration failed, continuing with defaults:', error);
          // Set default progress if health integration fails
          setStepProgress({ current: 0, goal: 10000, percentage: 0 });
        }
        
        // All done!
        clearTimeout(globalTimeout);
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        clearTimeout(globalTimeout);
        setError({ type: 'unknown', message: error.message });
        setIsLoading(false);
      }
    };

    initializeApp();
    
    // Register onboarding callbacks
    EnhancedOnboardingManager.registerCallback('show_character', () => {
      setCurrentScreen('home');
    });
    
    EnhancedOnboardingManager.registerCallback('show_stats', () => {
      // Could highlight stats display
    });
    
    EnhancedOnboardingManager.registerCallback('prompt_workout', () => {
      // Highlight workout button
    });
    
    EnhancedOnboardingManager.registerCallback('prompt_nutrition', () => {
      // Highlight nutrition button
    });
    
    EnhancedOnboardingManager.registerCallback('show_battle_preview', () => {
      // Could show battle screen briefly
    });
    
    EnhancedOnboardingManager.registerCallback('show_social', () => {
      setCurrentScreen('social');
    });
    
    EnhancedOnboardingManager.registerCallback('complete_onboarding', async () => {
      setShowOnboarding(false);
      // Check for daily bonus after onboarding
      // Daily bonus disabled - no popups
      // if (DailyBonusManager.canClaimDailyBonus()) {
      //   setTimeout(() => setShowDailyBonus(true), 500);
      // } else {
      //   // Coach tips removed
      // }
    });
  }, []);

  // Auto health bonus system - checks every 30 minutes
  useEffect(() => {
    if (!healthAutoBonuses) return;

    const checkHealthBonuses = async () => {
      try {
        const autoBonuses = await HealthIntegration.getAutoStatBonuses();
        const progress = await HealthIntegration.getStepGoalProgress();
        
        setStepProgress(progress);
        
        // Apply automatic stat bonuses from step progress
        if (autoBonuses.stats && Object.keys(autoBonuses.stats).length > 0) {
          const hasSignificantBonus = Object.values(autoBonuses.stats).some(val => Math.abs(val) >= 1);
          
          if (hasSignificantBonus) {
            setPlayerStats(prev => ({
              ...prev,
              health: Math.min(Math.max(prev.health + (autoBonuses.stats.health || 0), 0), 100),
              strength: Math.min(Math.max(prev.strength + (autoBonuses.stats.strength || 0), 0), 100),
              stamina: Math.min(Math.max(prev.stamina + (autoBonuses.stats.stamina || 0), 0), 100),
              happiness: Math.min(Math.max(prev.happiness + (autoBonuses.stats.happiness || 0), 0), 100),
              weight: Math.min(Math.max(prev.weight + (autoBonuses.stats.weight || 0), 30), 70),
              lastUpdate: Date.now(),
            }));
            
            // Show step achievement animation
            if (progress.achieved && lastHealthUpdate !== progress.date) {
              triggerAnimation('thumbsUp', 2000);
              AudioService.playStatChange(true);
              setLastHealthUpdate(progress.date);
            }
          }
        }
      } catch (error) {
        console.error('Auto health bonus check failed:', error);
      }
    };

    // Initial check
    checkHealthBonuses();
    
    // Set up interval for regular checks (every 30 minutes)
    const healthInterval = setInterval(checkHealthBonuses, 30 * 60 * 1000);
    
    return () => clearInterval(healthInterval);
  }, [healthAutoBonuses, lastHealthUpdate]);

  // Health integration handlers
  const handleStepGoalChange = async (newGoal) => {
    try {
      await HealthIntegration.setDailyStepGoal(newGoal);
      const progress = await HealthIntegration.getStepGoalProgress();
      setStepProgress(progress);
    } catch (error) {
      console.error('Failed to update step goal:', error);
    }
  };

  const handleToggleAutoBonuses = () => {
    setHealthAutoBonuses(!healthAutoBonuses);
    // Save preference to AsyncStorage
    HealthIntegration.autoStatBonuses = !healthAutoBonuses;
  };

  // Performance optimization: Memoize heavy calculations
  const memoizedEvolutionName = React.useMemo(() => {
    return getEvolutionName(playerStats.evolutionStage);
  }, [playerStats.evolutionStage]);

  const memoizedVisualState = React.useMemo(() => {
    return getVisualState(playerStats);
  }, [playerStats.health, playerStats.happiness, playerStats.weight]);

  // Daily Decay System - runs every 24 hours
  const applyDailyDecay = () => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const timeSinceLastDecay = now - playerStats.lastDecay;
    
    if (timeSinceLastDecay >= dayInMs) {
      const daysPassed = Math.floor(timeSinceLastDecay / dayInMs);
      
      setPlayerStats(prev => ({
        ...prev,
        // Apply documented daily decay rates
        health: Math.max(prev.health - (1 * daysPassed), 0),
        strength: Math.max(prev.strength - (1 * daysPassed), 0),
        stamina: Math.max(prev.stamina - (2 * daysPassed), 0),
        happiness: Math.max(prev.happiness - (2 * daysPassed), 0),
        weight: Math.min(prev.weight + (1 * daysPassed), 70),
        lastDecay: now,
      }));
      
      // Trigger sad animation if stats are getting low
      if (playerStats.happiness < 30 || playerStats.health < 30) {
        triggerAnimation('sad', 1500);
      }
    }
  };

  // Health Integration Functions
  const initializeHealthIntegration = async () => {
    try {
      const initialized = await HealthIntegration.initialize();
      if (initialized) {
        const status = HealthIntegration.getStatus();
        setHealthStatus(status);
        
        // Request permissions if not already granted
        if (!status.permissions.steps) {
          const permissions = await HealthIntegration.requestPermissions();
          setHealthStatus(prev => ({ ...prev, permissions }));
        }
      }
    } catch (error) {
      console.error('Health integration initialization failed:', error);
    }
  };

  const syncHealthData = async () => {
    try {
      const shouldSync = await HealthIntegration.shouldSync();
      if (!shouldSync) return;
      
      const syncResult = await HealthIntegration.syncHealthData();
      if (syncResult.error) {
        console.error('Health sync error:', syncResult.error);
        return;
      }
      
      setHealthData(syncResult.healthData);
      setHealthStatus(prev => ({ ...prev, lastSync: syncResult.syncTime }));
      
      // Apply stat bonuses from health data
      if (syncResult.statBonuses) {
        setPlayerStats(prev => ({
          ...prev,
          health: Math.min(prev.health + (syncResult.statBonuses.health || 0), 100),
          strength: Math.min(prev.strength + (syncResult.statBonuses.strength || 0), 100),
          stamina: Math.min(prev.stamina + (syncResult.statBonuses.stamina || 0), 100),
          happiness: Math.min(prev.happiness + (syncResult.statBonuses.happiness || 0), 100),
          lastUpdate: Date.now(),
        }));
        
        // Audio feedback
        AudioService.playHealthSync();
        AudioService.playStatChange(true);
        
        // Alert notifications disabled - no popups
        // Alert.alert(
        //   'Health Data Synced! 🏃‍♂️',
        //   `Your health activities have boosted your character stats!\\n\\n${
        //     Object.entries(syncResult.statBonuses)
        //       .filter(([_, value]) => value > 0)
        //       .map(([stat, value]) => `${stat}: +${value}`)
        //       .join('\\n')
        //   }`,
        //   [{ text: 'Awesome!', onPress: () => triggerAnimation('flex', 3000) }]
        // );
      }
    } catch (error) {
      console.error('Health sync failed:', error);
    }
  };

  const showHealthPermissions = () => {
    // Alert notifications disabled - no popups
    // Alert.alert(
    //   'Health Integration',
    //   'Connect your Apple Health or Google Fit data to automatically boost your character stats based on real-world activities!',
    //   [
    //     { text: 'Maybe Later', style: 'cancel' },
    //     { text: 'Connect', onPress: () => HealthIntegration.requestPermissions() },
    //   ]
    // );
    // For now, just request permissions directly
    HealthIntegration.requestPermissions();
  };

  // Backend Integration Functions
  const initializeBackend = async () => {
    try {
      const initialized = await SupabaseService.initialize();
      if (initialized) {
        console.log('Backend initialized successfully');
        loadCharacterData();
      } else {
        // Create anonymous user for offline usage
        const { user } = await SupabaseService.createAnonymousUser();
        console.log('Anonymous user created:', user?.id);
      }
    } catch (error) {
      console.error('Backend initialization failed:', error);
    }
  };

  const saveCharacterData = async () => {
    try {
      const result = await CloudSyncManager.saveGameData(playerStats);
      if (result.success) {
        console.log('Character data saved successfully');
      } else {
        console.error('Character save failed:', result.error);
        if (NetworkManager.isOnline()) {
          showError('Failed to save character data.');
        } else {
          showWarning('Character data saved locally. Will sync when online.');
        }
      }
    } catch (error) {
      console.error('Character save error:', error);
      showError('Failed to save character data. Please check your connection.');
    }
  };

  const loadCharacterData = async () => {
    try {
      const { data, error } = await SupabaseService.loadCharacterData();
      if (error) {
        console.error('Character load failed:', error);
        return;
      }
      
      if (data) {
        // Update player stats with loaded data
        setPlayerStats(prev => ({
          ...prev,
          health: data.health || prev.health,
          strength: data.strength || prev.strength,
          stamina: data.stamina || prev.stamina,
          happiness: data.happiness || prev.happiness,
          weight: data.weight || prev.weight,
          evolutionStage: data.evolution_stage || prev.evolutionStage,
          level: data.level || prev.level,
          xp: data.xp || prev.xp,
          streak: data.streak || prev.streak,
          lastUpdate: data.last_update ? new Date(data.last_update).getTime() : prev.lastUpdate,
        }));
        
        console.log('Character data loaded successfully');
      }
    } catch (error) {
      console.error('Character load error:', error);
    }
  };

  const logUserAction = async (actionType, actionData) => {
    try {
      await SupabaseService.logAction(actionType, actionData);
    } catch (error) {
      console.error('Action logging failed:', error);
    }
  };

  // Initialize all services on app start
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize audio system first
      await AudioService.initialize();
      
      // Start background music
      await AudioService.playBackgroundMusic('background_music');
      
      // Initialize cloud sync
      const cloudInitialized = await CloudSyncManager.initialize();
      console.log('Cloud sync initialized:', cloudInitialized);
      
      // Load saved game data
      if (cloudInitialized) {
        const { data: savedData } = await CloudSyncManager.loadGameData();
        if (savedData) {
          // Restore player stats
          setPlayerStats(prev => ({
            ...prev,
            ...savedData,
          }));
        }
      }
      
      // Initialize achievement system
      await AchievementManager.initialize();
      
      // Achievement notifications disabled - no popups
      // AchievementManager.onNotification((notification) => {
      //   if (notification.type === 'achievement') {
      //     setAchievementNotification({
      //       visible: true,
      //       achievement: notification.achievement,
      //     });
      //   }
      // });
      
      // Initialize other services
      initializeBackend();
      initializeHealthIntegration();
    };
    
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      CloudSyncManager.cleanup();
      AudioService.cleanup();
    };
  }, []);

  // Auto-save game data when player stats change
  useEffect(() => {
    const saveGameData = async () => {
      try {
        await CloudSyncManager.saveGameData({
          ...playerStats,
          avatarState,
          dailyActions,
          earnedAchievements,
          unlockedItems: unlockedCustomItems,
          equippedCustomizations,
        });
      } catch (error) {
        console.error('Failed to save game data:', error);
      }
    };
    
    // Debounce save to avoid too many writes
    const timeoutId = setTimeout(saveGameData, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [playerStats, avatarState.gear, earnedAchievements.length]);
  
  // Check achievements when stats change
  useEffect(() => {
    const checkAchievements = async () => {
      const stats = {
        ...playerStats,
        totalWorkouts,
        currentStreak,
        battlesWon: bossesDefeated,
        totalXP: playerStats.xp + (playerStats.level - 1) * 100,
        itemsUnlocked: unlockedCustomItems.length,
        lastWorkoutTime: dailyActions.workoutLogged ? new Date() : null,
      };
      
      const result = await AchievementManager.checkAchievements(stats);
      
      if (result.newAchievements.length > 0) {
        // Update earned achievements
        setEarnedAchievements(prev => [
          ...prev,
          ...result.newAchievements.map(a => a.id),
        ]);
        
        // Apply rewards
        if (result.totalRewards.xp > 0) {
          setPlayerStats(prev => ({
            ...prev,
            xp: prev.xp + result.totalRewards.xp,
          }));
        }
      }
    };
    
    // Check after a short delay to batch updates
    const timeoutId = setTimeout(checkAchievements, 500);
    return () => clearTimeout(timeoutId);
  }, [
    playerStats.level,
    totalWorkouts,
    currentStreak,
    bossesDefeated,
    dailyActions.workoutLogged,
    dailyActions.mealLogged,
  ]);

  // Check for health sync every hour
  useEffect(() => {
    const healthSyncInterval = setInterval(syncHealthData, 60 * 60 * 1000); // Every hour
    
    // Also sync immediately on mount
    syncHealthData();
    
    return () => clearInterval(healthSyncInterval);
  }, []);

  // Auto-save character data when stats change
  useEffect(() => {
    if (playerStats.lastUpdate) {
      saveCharacterData();
    }
  }, [playerStats.health, playerStats.strength, playerStats.stamina, playerStats.happiness, playerStats.weight, playerStats.level, playerStats.xp]);

  // Check for decay every minute (in production, this could be less frequent)
  useEffect(() => {
    const decayInterval = setInterval(applyDailyDecay, 60000); // Check every minute
    
    // Also check immediately on mount
    applyDailyDecay();
    
    return () => clearInterval(decayInterval);
  }, [playerStats.lastDecay]);

  // Check for boss availability based on level milestones
  useEffect(() => {
    setBossAvailable(playerStats.level % 5 === 0 && playerStats.level > 0);
  }, [playerStats.level]);

  // Check for new customization unlocks when level changes
  useEffect(() => {
    if (playerStats.level > 1) {
      const newUnlocks = UnlockSystem.checkLevelUnlocks(
        playerStats.level, 
        playerStats.level - 1, 
        unlockedCustomItems
      );
      
      if (newUnlocks.length > 0) {
        // Add new unlocks to the list
        const newUnlockedItems = [...unlockedCustomItems];
        newUnlocks.forEach(item => {
          if (!newUnlockedItems.includes(item.id)) {
            newUnlockedItems.push(item.id);
          }
        });
        setUnlockedCustomItems(newUnlockedItems);
        
        // Alert notifications disabled - no popups
        // Alert.alert(
        //   '🎉 New Customization Unlocked!',
        //   newUnlocks.map(item => `${item.icon} ${item.name}`).join('\n'),
        //   [{ text: 'Awesome!' }]
        // );
      }
    }
  }, [playerStats.level]);

  // GameBoy Shell Components
  const GameBoyShell = ({children}) => (
    <View style={styles.gameBoyShell}>
      {/* Screen Area */}
      <View style={styles.screenArea}>
        <View style={styles.screenFrame}>
          <View style={styles.screen}>
            {children}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsArea}>
        <View style={styles.leftControls}>
          <View style={styles.dPad}>
            <TouchableOpacity style={[styles.dPadButton, styles.dPadUp]} />
            <View style={styles.dPadMiddle}>
              <TouchableOpacity style={[styles.dPadButton, styles.dPadLeft]} />
              <TouchableOpacity style={[styles.dPadButton, styles.dPadRight]} />
            </View>
            <TouchableOpacity style={[styles.dPadButton, styles.dPadDown]} />
          </View>
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity style={[styles.actionButton, styles.buttonA]}>
            <Text style={styles.buttonLabel}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.buttonB]}>
            <Text style={styles.buttonLabel}>B</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>SELECT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.selectButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Avatar Sprite Component - displays character based on current state
  const AvatarSprite = ({ isFullSize = false }) => {
    const evolutionName = getEvolutionName(playerStats.evolutionStage);
    
    // Get appropriate sprite based on current animation and visual state
    const getSpriteSource = () => {
      // For now, use the idle pose - later we'll add state-specific sprites
      switch (avatarState.currentAnimation) {
        case 'flex':
          return require('./assets/Sprites/Flex_Pose.png');
        case 'eat':
          return require('./assets/Sprites/Over_Eating_Pose.png');
        case 'workout':
          return require('./assets/Sprites/Post_Workout_Pose.png');
        case 'sad':
          return require('./assets/Sprites/Sad_Pose.png');
        case 'thumbs_up':
          return require('./assets/Sprites/Thumbs_Up_Pose.png');
        default:
          return require('./assets/Sprites/Idle_Pose.png');
      }
    };

    return (
      <View style={styles.avatarSpriteContainer}>
        <View style={isFullSize ? styles.fullSizeSpriteContainer : styles.spriteFrameContainer}>
          <Image 
            source={getSpriteSource()}
            style={isFullSize ? styles.fullSizeAvatarSprite : styles.avatarSprite}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.evolutionBadge}>{evolutionName}</Text>
        <Text style={styles.visualStateBadge}>{avatarState.visualState}</Text>
      </View>
    );
  };

  // Avatar Component
  const Avatar = ({ isFullSize = false }) => {
    const getAvatarMessage = () => {
      // More nuanced messages based on multiple stats
      if (playerStats.happiness >= 80 && playerStats.health >= 80) {
        return "I'm feeling fantastic! Ready for anything!";
      }
      if (playerStats.happiness < 30) {
        return "I'm feeling really down... maybe some exercise would help?";
      }
      if (playerStats.health < 30) {
        return "I'm not feeling well... I need healthier food.";
      }
      if (playerStats.weight > 60) {
        return "I've been eating too much junk food lately...";
      }
      if (playerStats.stamina < 30) {
        return "I'm so tired... maybe I should work out more?";
      }
      if (playerStats.health >= 70 && playerStats.happiness >= 70) {
        return "I'm feeling great! What's our next adventure?";
      }
      return "I'm doing okay, but I could be better!";
    };

    return (
      <View style={isFullSize ? styles.fullSizeAvatarContainer : styles.avatarContainer}>
        <AvatarSprite isFullSize={isFullSize} />
        <Text style={styles.avatarName}>{getEvolutionName(playerStats.evolutionStage)} Level {playerStats.level}</Text>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{getAvatarMessage()}</Text>
        </View>
        <View style={styles.avatarGear}>
          {avatarState.gear.map((item, index) => (
            <Text key={index} style={styles.gearItem}>{item === 'headband' ? '🎽' : '🥊'}</Text>
          ))}
        </View>
      </View>
    );
  };

  // Navigation Component
  const BottomNav = () => (
    <View style={styles.navigation}>
      {[
        {key: 'home', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Home_Sprite.png'), label: 'Home'},
        {key: 'avatar', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Avatar_Sprite.png'), label: 'Avatar'},
        {key: 'workout', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png'), label: 'Train'},
        {key: 'nutrition', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png'), label: 'Feed'},
        {key: 'battle', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Battle_Sprite.png'), label: 'Battle'},
        {key: 'stats', sprite: require('./assets/Sprites/Home_Screen_Button_Sprites/Stats_Sprite.png'), label: 'Stats'},
      ].map(({key, sprite, label}) => (
        <NavButton
          key={key}
          isActive={currentScreen === key}
          iconSource={sprite}
          label={label}
          onPress={() => {
            AudioService.playButtonPress();
            setCurrentScreen(key);
          }}
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
      ))}
    </View>
  );

  // Legacy StatBar component removed - using new enhanced StatBar from ActionButton.js

  // Enhanced Workout System with Visual Feedback
  const [workoutFeedback, setWorkoutFeedback] = useState({
    showFeedback: false,
    statChanges: {},
    workoutType: '',
    xpGained: 0,
  });

  // Enhanced Nutrition System with Visual Feedback
  const [nutritionFeedback, setNutritionFeedback] = useState({
    showFeedback: false,
    statChanges: {},
    mealType: '',
    xpGained: 0,
  });

  // Enhanced Battle System with Visual Feedback
  const [battleFeedback, setBattleFeedback] = useState({
    showFeedback: false,
    battleResult: null,
    boss: null,
    rewards: {},
    playerCombatPower: 0,
    bossRequiredPower: 0,
    gameScore: 0,
  });

  // Enhanced Evolution System with Ceremony
  const [evolutionCeremony, setEvolutionCeremony] = useState({
    showCeremony: false,
    newEvolutionStage: 0,
    previousStage: 0,
  });

  // Enhanced Health Integration with Step Goals
  const [stepProgress, setStepProgress] = useState(null);
  const [healthAutoBonuses, setHealthAutoBonuses] = useState(true);
  const [lastHealthUpdate, setLastHealthUpdate] = useState(null);

  const logWorkout = async (type) => {
    // Enhanced stat calculations based on level and evolution
    const levelMultiplier = 1 + (playerStats.evolutionStage * 0.1); // +10% per evolution stage
    const baseXP = 25;
    let xpBonus = Math.floor(baseXP * levelMultiplier);
    
    let statChanges = {};
    let animationType = 'workout';
    
    // Update workout tracking
    setTotalWorkouts(prev => prev + 1);
    setCurrentStreak(prev => prev + 1);
    
    // Create updated stats for achievement checking
    const updatedStats = {
      ...playerStats,
      totalWorkouts: totalWorkouts + 1,
      currentStreak: currentStreak + 1,
      bossesDefeated,
    };
    
    switch(type) {
      case 'cardio':
        statChanges = {
          stamina: Math.min(playerStats.stamina + Math.floor(5 * levelMultiplier), 100),
          weight: Math.max(playerStats.weight - Math.floor(3 * levelMultiplier), 30),
          happiness: Math.min(playerStats.happiness + Math.floor(2 * levelMultiplier), 100),
          health: Math.min(playerStats.health + Math.floor(1 * levelMultiplier), 100),
        };
        animationType = 'postWorkout';
        break;
      case 'strength':
        statChanges = {
          strength: Math.min(playerStats.strength + Math.floor(6 * levelMultiplier), 100),
          weight: Math.max(playerStats.weight - Math.floor(2 * levelMultiplier), 30),
          happiness: Math.min(playerStats.happiness + Math.floor(2 * levelMultiplier), 100),
          health: Math.min(playerStats.health + Math.floor(1 * levelMultiplier), 100),
        };
        animationType = 'flex';
        break;
      case 'yoga':
        statChanges = {
          happiness: Math.min(playerStats.happiness + Math.floor(4 * levelMultiplier), 100),
          stamina: Math.min(playerStats.stamina + Math.floor(3 * levelMultiplier), 100),
          health: Math.min(playerStats.health + Math.floor(2 * levelMultiplier), 100),
          strength: Math.min(playerStats.strength + Math.floor(1 * levelMultiplier), 100),
        };
        animationType = 'thumbsUp';
        break;
      case 'sports':
        statChanges = {
          strength: Math.min(playerStats.strength + Math.floor(2 * levelMultiplier), 100),
          stamina: Math.min(playerStats.stamina + Math.floor(2 * levelMultiplier), 100),
          happiness: Math.min(playerStats.happiness + Math.floor(2 * levelMultiplier), 100),
          health: Math.min(playerStats.health + Math.floor(2 * levelMultiplier), 100),
        };
        animationType = 'flex';
        break;
      default:
        statChanges = {
          strength: Math.min(playerStats.strength + Math.floor(2 * levelMultiplier), 100),
          stamina: Math.min(playerStats.stamina + Math.floor(2 * levelMultiplier), 100),
          happiness: Math.min(playerStats.happiness + Math.floor(1 * levelMultiplier), 100),
        };
    }
    
    // Show visual feedback
    setWorkoutFeedback({
      showFeedback: false, // Feedback disabled - no popups
      statChanges,
      workoutType: type,
      xpGained: xpBonus,
    });
    
    // Update player stats
    setPlayerStats(prev => ({
      ...prev,
      ...statChanges,
      xp: prev.xp + xpBonus,
      lastUpdate: Date.now(),
    }));
    
    // Check for level up
    setTimeout(() => checkLevelUp(), 500);
    
    setDailyActions(prev => ({...prev, workoutLogged: true}));
    // Use level-up blink for positive actions
    triggerAnimation(animationType, 3000, true);
    
    // Check for achievements
    const achievementResult = RewardSystem.checkAchievements(updatedStats, earnedAchievements);
    if (achievementResult.newAchievements.length > 0) {
      // Add new achievements
      setEarnedAchievements(prev => [
        ...prev,
        ...achievementResult.newAchievements.map(a => a.id)
      ]);
      
      // Apply rewards
      if (achievementResult.rewards.xp > 0) {
        setPlayerStats(prev => ({
          ...prev,
          xp: prev.xp + achievementResult.rewards.xp,
        }));
      }
      
      if (achievementResult.rewards.unlocks.length > 0) {
        setUnlockedCustomItems(prev => [
          ...prev,
          ...achievementResult.rewards.unlocks
        ]);
      }
      
      // Show notification
      const message = RewardSystem.generateRewardNotification(achievementResult.rewards);
      // Alert notifications disabled - no popups
      // Alert.alert(
      //   '🏆 Achievement Unlocked!',
      //   achievementResult.newAchievements.map(a => `${a.icon} ${a.name}`).join('\n') + '\n\n' + message,
      //   [{ text: 'Awesome!' }]
      // );
    }
    
    // Audio feedback
    AudioService.playWorkoutComplete();
    AudioService.playStatChange(true);
    
    // Save progress to cloud (with network handling)
    try {
      await saveCharacterData();
    } catch (error) {
      console.error('Failed to save workout progress:', error);
    }
    
    // Coach tips disabled - no popups
    // if (totalWorkouts === 0) {
    //   const tip = await EnhancedOnboardingManager.getCoachTip('workout', 'first_workout');
    //   if (tip) NotificationQueue.enqueueCoachTip(tip);
    // } else if (totalWorkouts % 5 === 0) {
    //   const tip = await EnhancedOnboardingManager.getCoachTip('workout', 'variety');
    //   if (tip) NotificationQueue.enqueueCoachTip(tip);
    // }
    
    // Auto-hide feedback after 3 seconds
    setTimeout(() => {
      setWorkoutFeedback(prev => ({ ...prev, showFeedback: false }));
    }, 3000);
    
    // Log the action
    logUserAction('workout', {
      type,
      statChanges,
      xpGained: xpBonus,
      timestamp: Date.now(),
    });
  };

  const logMeal = (type) => {
    // Enhanced stat calculations based on level and evolution
    const levelMultiplier = 1 + (playerStats.evolutionStage * 0.1); // +10% per evolution stage
    const baseXP = 15;
    
    let statChanges = {};
    let animationType = 'eating';
    let xpGain = baseXP;
    
    switch(type) {
      case 'healthy':
        statChanges = {
          health: Math.min(playerStats.health + Math.floor(6 * levelMultiplier), 100),
          weight: Math.max(playerStats.weight - Math.floor(2 * levelMultiplier), 30),
          happiness: Math.min(playerStats.happiness + Math.floor(3 * levelMultiplier), 100),
          stamina: Math.min(playerStats.stamina + Math.floor(1 * levelMultiplier), 100),
        };
        animationType = 'thumbsUp';
        xpGain = Math.floor(25 * levelMultiplier);
        break;
      case 'protein':
        statChanges = {
          strength: Math.min(playerStats.strength + Math.floor(6 * levelMultiplier), 100),
          health: Math.min(playerStats.health + Math.floor(3 * levelMultiplier), 100),
          weight: Math.max(playerStats.weight - Math.floor(1 * levelMultiplier), 30),
          stamina: Math.min(playerStats.stamina + Math.floor(2 * levelMultiplier), 100),
        };
        animationType = 'flex';
        xpGain = Math.floor(22 * levelMultiplier);
        break;
      case 'junk':
        // Junk food has negative multiplier - worse effects at higher levels
        statChanges = {
          health: Math.max(playerStats.health - Math.floor(4 * levelMultiplier), 0),
          weight: Math.min(playerStats.weight + Math.floor(6 * levelMultiplier), 70),
          happiness: Math.max(playerStats.happiness - Math.floor(3 * levelMultiplier), 0),
          stamina: Math.max(playerStats.stamina - Math.floor(1 * levelMultiplier), 0),
        };
        animationType = 'eat'; // Use eating pose for cheat meals
        xpGain = Math.floor(8); // Minimal XP regardless of level
        break;
      case 'hydration':
        statChanges = {
          health: Math.min(playerStats.health + Math.floor(3 * levelMultiplier), 100),
          stamina: Math.min(playerStats.stamina + Math.floor(4 * levelMultiplier), 100),
          happiness: Math.min(playerStats.happiness + Math.floor(2 * levelMultiplier), 100),
        };
        animationType = 'thumbsUp';
        xpGain = Math.floor(15 * levelMultiplier);
        break;
      default:
        statChanges = {
          health: Math.min(playerStats.health + Math.floor(3 * levelMultiplier), 100),
          happiness: Math.min(playerStats.happiness + Math.floor(1 * levelMultiplier), 100),
        };
        xpGain = Math.floor(baseXP * levelMultiplier);
    }
    
    // Show visual feedback
    setNutritionFeedback({
      showFeedback: false, // Feedback disabled - no popups
      statChanges,
      mealType: type,
      xpGained: xpGain,
    });
    
    // Update player stats
    setPlayerStats(prev => ({
      ...prev,
      ...statChanges,
      xp: prev.xp + xpGain,
      lastUpdate: Date.now(),
    }));
    
    setDailyActions(prev => ({...prev, mealLogged: true}));
    // Use longer duration and damage blink for negative actions
    const isNegative = type === 'junk';
    triggerAnimation(animationType, isNegative ? 5000 : 2500, isNegative);
    
    // Audio feedback
    AudioService.playMealLogged(type === 'healthy' || type === 'protein' || type === 'hydration');
    if (type === 'junk') {
      AudioService.playStatChange(false);
    } else {
      AudioService.playStatChange(true);
    }
    
    // Auto-hide feedback after 3 seconds
    setTimeout(() => {
      setNutritionFeedback(prev => ({ ...prev, showFeedback: false }));
    }, 3000);
    
    // Log the action
    logUserAction('meal', {
      type,
      statChanges,
      xpGain,
      timestamp: Date.now(),
    });
  };

  const skipWorkout = () => {
    // Negative effects from skipping workout
    const levelMultiplier = 1 + (playerStats.evolutionStage * 0.1);
    
    const statChanges = {
      strength: Math.max(playerStats.strength - Math.floor(3 * levelMultiplier), 0),
      stamina: Math.max(playerStats.stamina - Math.floor(4 * levelMultiplier), 0),
      health: Math.max(playerStats.health - Math.floor(2 * levelMultiplier), 0),
      happiness: Math.max(playerStats.happiness - Math.floor(5 * levelMultiplier), 0),
    };
    
    // Update player stats
    setPlayerStats(prev => ({
      ...prev,
      ...statChanges,
      xp: prev.xp + 5, // Minimal XP for skipping
      lastUpdate: Date.now(),
    }));
    
    // Trigger sad animation
    triggerAnimation('sad', 3000);
    
    // Audio feedback
    AudioService.playStatChange(false);
    
    // Log the action
    logUserAction('workout_skipped', {
      statChanges,
      timestamp: Date.now(),
    });
  };

  const startBossBattle = () => {
    setInBattle(true);
    setCurrentScreen('battle');
  };

  // Screen Components
  const HomeScreen = () => (
    <View style={styles.screenContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>🎮 16BIT FIT 🎮</Text>
        <TouchableOpacity style={styles.settingsIcon}>
          <Text style={{color: Colors.primary.black, fontSize: 16}}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Character Arena Section */}
      <View style={styles.characterArenaSection}>
        <CharacterArena
          characterState={avatarState.currentAnimation}
          showEffects={playerStats.level % 5 === 0 && playerStats.level > 0}
          backgroundType="outdoor"
        />
      </View>

      {/* Step Goal Tracker Section */}
      <StepGoalTracker
        stepProgress={stepProgress}
        onStepGoalChange={handleStepGoalChange}
        onToggleAutoBonuses={handleToggleAutoBonuses}
        autoBonusesEnabled={healthAutoBonuses}
        fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
      />

      {/* Quick Actions Section */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionHeader}>⚡ QUICK ACTIONS ⚡</Text>
        <View style={styles.buttonGrid}>
          <View style={styles.buttonRow}>
            <ActionButton
              buttonType="workout"
              buttonText="WORKOUT"
              iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png')}
              onPress={() => {
                AudioService.playButtonPress();
                setCurrentScreen('workout');
              }}
              fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
            />
            
            <ActionButton
              buttonType="food"
              buttonText="FOOD"
              iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png')}
              onPress={() => {
                AudioService.playButtonPress();
                setCurrentScreen('nutrition');
              }}
              fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <ActionButton
              buttonType="battle"
              buttonText="BATTLE"
              iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Battle_Sprite.png')}
              onPress={() => {
                AudioService.playButtonPress();
                setCurrentScreen('battle');
              }}
              disabled={!bossAvailable}
              fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
            />
            
            <ActionButton
              buttonType="stats"
              buttonText="STATS"
              iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Stats_Sprite.png')}
              onPress={() => {
                AudioService.playButtonPress();
                setCurrentScreen('stats');
              }}
              fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const WorkoutScreen = () => (
    <View style={styles.screenContent}>
      <ScrollView>
        <Text style={styles.screenTitle}>💪 Training Ground</Text>
        
        {/* Mini Character Arena */}
        <View style={[styles.characterArenaSection, { height: 160 }]}>
          <CharacterArena
            characterState={avatarState.currentAnimation}
            showEffects={true}
            backgroundType="dojo"
            style={{ transform: [{ scale: 0.67 }] }}
          />
        </View>
        
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeader}>🏋️ CHOOSE WORKOUT 🏋️</Text>
          <View style={styles.buttonGrid}>
            <View style={styles.buttonRow}>
              <ActionButton
                buttonType="workout"
                buttonText="CARDIO"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logWorkout('cardio');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
              <ActionButton
                buttonType="workout"
                buttonText="STRENGTH"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logWorkout('strength');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
            </View>
            <View style={styles.buttonRow}>
              <ActionButton
                buttonType="workout"
                buttonText="YOGA"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logWorkout('yoga');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
              <ActionButton
                buttonType="workout"
                buttonText="SPORTS"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Train_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logWorkout('sports');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Workout Feedback Overlay */}
      <WorkoutFeedback
        visible={workoutFeedback.showFeedback}
        statChanges={workoutFeedback.statChanges}
        workoutType={workoutFeedback.workoutType}
        xpGained={workoutFeedback.xpGained}
        onComplete={() => setWorkoutFeedback(prev => ({ ...prev, showFeedback: false }))}
        fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
      />
    </View>
  );

  const NutritionScreen = () => (
    <View style={styles.screenContent}>
      <ScrollView>
        <Text style={styles.screenTitle}>🍎 Nutrition Log</Text>
        
        {/* Mini Character Arena */}
        <View style={[styles.characterArenaSection, { height: 160 }]}>
          <CharacterArena
            characterState={avatarState.currentAnimation}
            showEffects={true}
            backgroundType="outdoor"
            style={{ transform: [{ scale: 0.67 }] }}
          />
        </View>
        
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeader}>🥗 LOG NUTRITION 🥗</Text>
          <View style={styles.buttonGrid}>
            <View style={styles.buttonRow}>
              <ActionButton
                buttonType="food"
                buttonText="HEALTHY"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logMeal('healthy');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
              <ActionButton
                buttonType="food"
                buttonText="PROTEIN"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logMeal('protein');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
            </View>
            <View style={styles.buttonRow}>
              <ActionButton
                buttonType="food"
                buttonText="JUNK"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logMeal('junk');
                }}
                style={{ backgroundColor: Colors.state.health }} // Red for junk food
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
              <ActionButton
                buttonType="food"
                buttonText="WATER"
                iconSource={require('./assets/Sprites/Home_Screen_Button_Sprites/Feed_Sprite.png')}
                onPress={() => {
                  AudioService.playButtonPress();
                  logMeal('hydration');
                }}
                fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Nutrition Feedback Overlay */}
      <NutritionFeedback
        visible={nutritionFeedback.showFeedback}
        statChanges={nutritionFeedback.statChanges}
        mealType={nutritionFeedback.mealType}
        xpGained={nutritionFeedback.xpGained}
        onComplete={() => setNutritionFeedback(prev => ({ ...prev, showFeedback: false }))}
        fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
      />
    </View>
  );

  const BattleScreen = () => {
    const [battlePhase, setBattlePhase] = useState('prep');
    const [battleResult, setBattleResult] = useState(null);
    const [currentBoss, setCurrentBoss] = useState(null);

    // Enhanced Boss System with Level-Scaled Encounters
    const getBossForLevel = (level) => {
      const evolution = playerStats.evolutionStage;
      const statMultiplier = 1 + (evolution * 0.2); // 20% increase per evolution
      
      const baseBosses = [
        {
          name: 'Junk Food Demon',
          sprite: '🍕',
          level: Math.max(1, level - 2),
          description: 'A creature born from processed foods and sugar cravings',
          weakness: 'health',
          requiredStats: { 
            health: Math.floor(40 * statMultiplier), 
            strength: Math.floor(25 * statMultiplier) 
          },
          rewards: { 
            xp: Math.floor(100 * statMultiplier), 
            health: Math.floor(6 * statMultiplier), 
            happiness: Math.floor(8 * statMultiplier) 
          },
          battleType: 'health_focused',
          difficulty: 'Easy'
        },
        {
          name: 'Couch Potato Monster',
          sprite: '📺',
          level: Math.max(1, level - 1),
          description: 'A sedentary beast that drains your motivation to move',
          weakness: 'stamina',
          requiredStats: { 
            stamina: Math.floor(50 * statMultiplier), 
            strength: Math.floor(35 * statMultiplier) 
          },
          rewards: { 
            xp: Math.floor(120 * statMultiplier), 
            stamina: Math.floor(10 * statMultiplier), 
            strength: Math.floor(5 * statMultiplier) 
          },
          battleType: 'stamina_focused',
          difficulty: 'Medium'
        },
        {
          name: 'Stress Wraith',
          sprite: '😰',
          level: level,
          description: 'A dark entity that feeds on anxiety and mental fatigue',
          weakness: 'happiness',
          requiredStats: { 
            happiness: Math.floor(60 * statMultiplier), 
            health: Math.floor(45 * statMultiplier) 
          },
          rewards: { 
            xp: Math.floor(140 * statMultiplier), 
            happiness: Math.floor(12 * statMultiplier), 
            health: Math.floor(4 * statMultiplier) 
          },
          battleType: 'happiness_focused',
          difficulty: 'Hard'
        },
        {
          name: 'Weakness Titan',
          sprite: '💀',
          level: level + 1,
          description: 'The ultimate trial of physical and mental fortitude',
          weakness: 'strength',
          requiredStats: { 
            strength: Math.floor(70 * statMultiplier), 
            stamina: Math.floor(55 * statMultiplier), 
            health: Math.floor(55 * statMultiplier) 
          },
          rewards: { 
            xp: Math.floor(200 * statMultiplier), 
            strength: Math.floor(12 * statMultiplier), 
            evolutionBonus: evolution < 3 ? 1 : 0 
          },
          battleType: 'strength_focused',
          difficulty: 'Boss'
        }
      ];
      
      // Special evolution-based bosses for higher levels
      if (level >= 15 && evolution >= 2) {
        baseBosses.push({
          name: 'Shadow of Former Self',
          sprite: '👤',
          level: level + 2,
          description: 'Your own limitations manifest as a formidable opponent',
          weakness: 'balanced',
          requiredStats: { 
            health: Math.floor(80 * statMultiplier),
            strength: Math.floor(80 * statMultiplier),
            stamina: Math.floor(80 * statMultiplier),
            happiness: Math.floor(80 * statMultiplier)
          },
          rewards: { 
            xp: Math.floor(300 * statMultiplier), 
            health: Math.floor(8 * statMultiplier),
            strength: Math.floor(8 * statMultiplier),
            stamina: Math.floor(8 * statMultiplier),
            happiness: Math.floor(8 * statMultiplier),
            evolutionBonus: evolution < 3 ? 1 : 0
          },
          battleType: 'balanced_focused',
          difficulty: 'Legendary'
        });
      }
      
      // Smart boss selection based on player's current state
      const avgStat = (playerStats.health + playerStats.strength + playerStats.stamina + playerStats.happiness) / 4;
      const weakestStat = Math.min(playerStats.health, playerStats.strength, playerStats.stamina, playerStats.happiness);
      const statDifference = avgStat - weakestStat;
      
      // If player has major stat imbalances, target weakest stat
      if (statDifference > 15) {
        if (weakestStat === playerStats.health) return baseBosses[0];
        if (weakestStat === playerStats.stamina) return baseBosses[1];
        if (weakestStat === playerStats.happiness) return baseBosses[2];
        return baseBosses[3];
      }
      
      // For balanced players, provide progressive challenges
      if (level >= 15 && baseBosses.length > 4) return baseBosses[4]; // Shadow boss
      if (level >= 10) return baseBosses[3]; // Weakness Titan
      if (level >= 5) return baseBosses[2]; // Stress Wraith
      if (level >= 3) return baseBosses[1]; // Couch Potato
      return baseBosses[0]; // Junk Food Demon
    };

    const executeBattle = () => {
      const boss = getBossForLevel(playerStats.level);
      setCurrentBoss(boss);
      setBattlePhase('fighting');
      
      // Audio feedback
      AudioService.playBattleStart();
    };

    const handleGameComplete = (gameResult) => {
      if (!currentBoss) return;
      
      // Enhanced battle logic based on boss type and player stats
      const playerCombatPower = calculateCombatPower(currentBoss.battleType);
      const gameBonus = gameResult.score * 2; // Game performance is important
      const totalPower = playerCombatPower + gameBonus;
      
      // Enhanced boss difficulty scaling
      const bossRequiredPower = currentBoss.level * 60 + 
        Object.values(currentBoss.requiredStats).reduce((a, b) => a + b, 0) +
        (playerStats.evolutionStage * 25); // Harder battles for evolved players
      
      const won = totalPower >= bossRequiredPower;
      const battleResult = won ? 'win' : 'lose';
      
      // Show visual feedback immediately
      setBattleFeedback({
        showFeedback: false, // Feedback disabled - no popups
        battleResult,
        boss: currentBoss,
        rewards: won ? currentBoss.rewards : { happiness: -5, stamina: -3 },
        playerCombatPower,
        bossRequiredPower,
        gameScore: gameResult.score,
      });
      
      setBattleResult(battleResult);
      setBattlePhase('result');
      
      if (won) {
        applyBattleRewards(currentBoss);
        triggerAnimation('flex', 4000);
      } else {
        applyBattleConsequences();
        triggerAnimation('sad', 3000);
      }
      
      // Audio feedback
      AudioService.playBattleEnd(won);
      
      // Auto-hide battle feedback after 4 seconds
      setTimeout(() => {
        setBattleFeedback(prev => ({ ...prev, showFeedback: false }));
      }, 4000);
      
      // Log battle result
      SupabaseService.saveBattleResult({
        bossName: currentBoss.name,
        bossLevel: currentBoss.level,
        playerLevel: playerStats.level,
        result: battleResult,
        rewards: won ? currentBoss.rewards : {},
        gameScore: gameResult.score,
        combatPower: totalPower,
        bossRequiredPower,
      });
    };

    const calculateCombatPower = (battleType) => {
      const { health, strength, stamina, happiness } = playerStats;
      const evolutionMultiplier = 1 + (playerStats.evolutionStage * 0.15); // 15% bonus per evolution
      
      let basePower;
      switch(battleType) {
        case 'health_focused':
          basePower = health * 2.5 + strength * 1.2;
          break;
        case 'stamina_focused':
          basePower = stamina * 2.5 + strength * 1.2;
          break;
        case 'happiness_focused':
          basePower = happiness * 2.5 + health * 1.2;
          break;
        case 'strength_focused':
          basePower = strength * 2.5 + stamina * 1.2;
          break;
        case 'balanced_focused':
          // For the Shadow boss, all stats matter equally
          basePower = (health + strength + stamina + happiness) * 1.5;
          break;
        default:
          basePower = health + strength + stamina + happiness;
      }
      
      return Math.floor(basePower * evolutionMultiplier);
    };

    const applyBattleRewards = (boss) => {
      setPlayerStats(prev => {
        // Calculate potential evolution bonus - give significant stat boost to help evolution
        const evolutionBonus = boss.rewards.evolutionBonus || 0;
        const isLegendaryBoss = boss.difficulty === 'Legendary';
        
        let bonusStats = {
          health: evolutionBonus * 15, // Major boost if evolution bonus
          strength: evolutionBonus * 15,
          stamina: evolutionBonus * 15,
          happiness: evolutionBonus * 15,
        };
        
        // Extra bonus for legendary bosses
        if (isLegendaryBoss) {
          bonusStats = {
            health: bonusStats.health + 10,
            strength: bonusStats.strength + 10,
            stamina: bonusStats.stamina + 10,
            happiness: bonusStats.happiness + 10,
          };
        }
        
        return {
          ...prev,
          xp: prev.xp + boss.rewards.xp,
          level: prev.level + (evolutionBonus > 0 ? 1 : 0),
          health: Math.min(prev.health + (boss.rewards.health || 0) + bonusStats.health, 100),
          strength: Math.min(prev.strength + (boss.rewards.strength || 0) + bonusStats.strength, 100),
          stamina: Math.min(prev.stamina + (boss.rewards.stamina || 0) + bonusStats.stamina, 100),
          happiness: Math.min(prev.happiness + (boss.rewards.happiness || 0) + bonusStats.happiness, 100),
          lastUpdate: Date.now(),
        };
      });
    };

    const applyBattleConsequences = () => {
      // Small stat penalty for losing
      setPlayerStats(prev => ({
        ...prev,
        happiness: Math.max(prev.happiness - 5, 0),
        stamina: Math.max(prev.stamina - 3, 0),
        lastUpdate: Date.now(),
      }));
    };

    const renderBattleContent = () => {
      if (battlePhase === 'prep') {
        const boss = getBossForLevel(playerStats.level);
        return (
          <>
            <Text style={styles.screenTitle}>⚔️ Boss Battle</Text>
            <View style={styles.bossCard}>
              <Text style={styles.bossSprite}>{boss.sprite}</Text>
              <Text style={styles.bossName}>{boss.name}</Text>
              <Text style={styles.bossLevel}>Level {boss.level} • {boss.difficulty}</Text>
              <Text style={styles.bossDescription}>{boss.description}</Text>
              <Text style={styles.bossWeakness}>Weakness: {boss.weakness}</Text>
            </View>
            
            <View style={styles.battleStats}>
              <Text style={styles.battleStatsTitle}>Your Combat Power:</Text>
              <Text style={styles.combatPower}>
                {calculateCombatPower(boss.battleType)}
              </Text>
              <Text style={styles.battleStatsSubtitle}>
                vs Boss Power: {boss.level * 60 + Object.values(boss.requiredStats).reduce((a, b) => a + b, 0)}
              </Text>
            </View>
            
            <View style={styles.requiredStats}>
              <Text style={styles.sectionTitle}>Required Stats:</Text>
              {Object.entries(boss.requiredStats).map(([stat, value]) => (
                <Text key={stat} style={[styles.statRequirement, {
                  color: playerStats[stat] >= value ? Colors.primary.success : Colors.state.health
                }]}>
                  {stat.toUpperCase()}: {playerStats[stat]}/{value}
                </Text>
              ))}
            </View>
            
            <TouchableOpacity style={styles.battleButton} onPress={executeBattle}>
              <Text style={styles.battleButtonText}>⚔️ START BATTLE!</Text>
            </TouchableOpacity>
          </>
        );
      }
      
      if (battlePhase === 'fighting') {
        return (
          <>
            <Text style={styles.battleAnimation}>⚔️ BATTLE IN PROGRESS! ⚔️</Text>
            <Text style={styles.battleText}>Control your fighter! Use arrow keys to move and jump!</Text>
            <View style={styles.gameArea}>
              <PhaserGame 
                gameType="battle" 
                playerStats={playerStats} 
                onGameComplete={handleGameComplete}
              />
            </View>
          </>
        );
      }

      // Result phase
      return (
        <>
          <Text style={styles.screenTitle}>
            {battleResult === 'win' ? '🏆 VICTORY!' : '💀 DEFEAT!'}
          </Text>
          
          {currentBoss && (
            <View style={styles.bossCard}>
              <Text style={styles.bossSprite}>{currentBoss.sprite}</Text>
              <Text style={styles.bossName}>{currentBoss.name}</Text>
              <Text style={styles.bossLevel}>
                {battleResult === 'win' ? 'DEFEATED!' : 'VICTORIOUS!'}
              </Text>
            </View>
          )}
          
          <Text style={styles.battleResultText}>
            {battleResult === 'win' 
              ? `Congratulations! You defeated ${currentBoss?.name || 'the boss'}!`
              : `${currentBoss?.name || 'The boss'} was too strong this time. Train harder!`}
          </Text>
          
          {battleResult === 'win' && currentBoss && (
            <View style={styles.rewardsPanel}>
              <Text style={styles.sectionTitle}>🎁 Rewards Earned:</Text>
              <Text style={styles.rewardText}>+{currentBoss.rewards.xp} XP</Text>
              {currentBoss.rewards.health && (
                <Text style={styles.rewardText}>+{currentBoss.rewards.health} Health</Text>
              )}
              {currentBoss.rewards.strength && (
                <Text style={styles.rewardText}>+{currentBoss.rewards.strength} Strength</Text>
              )}
              {currentBoss.rewards.stamina && (
              <Text style={styles.rewardText}>+{currentBoss.rewards.stamina} Stamina</Text>
            )}
            {currentBoss.rewards.happiness && (
              <Text style={styles.rewardText}>+{currentBoss.rewards.happiness} Happiness</Text>
            )}
            {currentBoss.rewards.evolutionBonus && (
              <Text style={styles.rewardText}>🌟 Evolution Bonus!</Text>
            )}
          </View>
        )}
        
        {battleResult === 'lose' && (
          <View style={styles.consequencesPanel}>
            <Text style={styles.sectionTitle}>💔 Consequences:</Text>
            <Text style={styles.consequenceText}>-5 Happiness</Text>
            <Text style={styles.consequenceText}>-3 Stamina</Text>
            <Text style={styles.motivationText}>
              Don't give up! Focus on improving your {currentBoss?.weakness || 'stats'} and try again!
            </Text>
          </View>
        )}
        
          <TouchableOpacity 
            style={styles.battleButton} 
            onPress={() => {
              setCurrentScreen('home');
              setInBattle(false);
              setBattlePhase('prep');
              setBattleResult(null);
              setCurrentBoss(null);
            }}
          >
            <Text style={styles.battleButtonText}>Return Home</Text>
          </TouchableOpacity>
        </>
      );
    };

    return (
      <View style={styles.screenContent}>
        <ScrollView>
          {renderBattleContent()}
        </ScrollView>

        {/* Battle Feedback Overlay */}
        <BattleFeedback
          visible={battleFeedback.showFeedback}
          battleResult={battleFeedback.battleResult}
          boss={battleFeedback.boss}
          rewards={battleFeedback.rewards}
          playerCombatPower={battleFeedback.playerCombatPower}
          bossRequiredPower={battleFeedback.bossRequiredPower}
          gameScore={battleFeedback.gameScore}
          onComplete={() => setBattleFeedback(prev => ({ ...prev, showFeedback: false }))}
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
      </View>
    );
  };

  const StatsScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>📊 Character Stats</Text>
      
      {/* Mini Character Display */}
      <View style={[styles.characterArenaSection, { height: 160 }]}>
        <CharacterArena
          characterState={avatarState.currentAnimation}
          showEffects={false}
          backgroundType="gym"
          style={{ transform: [{ scale: 0.67 }] }} // Smaller for stats screen
        />
      </View>
      
      <View style={styles.statsPanel}>
        <StatBar 
          current={Math.round(playerStats.health)} 
          max={100} 
          statType="health" 
          label="HEALTH"
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
        <StatBar 
          current={Math.round(playerStats.strength)} 
          max={100} 
          statType="strength" 
          label="STRENGTH"
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
        <StatBar 
          current={Math.round(playerStats.stamina)} 
          max={100} 
          statType="energy" 
          label="ENERGY"
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
        <StatBar 
          current={Math.round(playerStats.happiness)} 
          max={100} 
          statType="happiness" 
          label="HAPPINESS"
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
      </View>

      <View style={styles.weightPanel}>
        <Text style={styles.sectionTitle}>⚖️ Weight Status</Text>
        <View style={styles.weightContainer}>
          <Text style={styles.weightText}>Current: {Math.round(playerStats.weight)}</Text>
          <Text style={styles.weightText}>Ideal: 50</Text>
          <Text style={[styles.weightStatus, {
            color: Math.abs(playerStats.weight - 50) < 10 ? '#10b981' : '#f59e0b'
          }]}>
            {Math.abs(playerStats.weight - 50) < 5 ? 'Perfect!' : 
             Math.abs(playerStats.weight - 50) < 10 ? 'Good' : 'Needs Work'}
          </Text>
        </View>
      </View>

      <View style={styles.achievementPanel}>
        <Text style={styles.sectionTitle}>🏆 Evolution Stage</Text>
        <Text style={styles.evolutionStage}>{getEvolutionName(playerStats.evolutionStage)} ({playerStats.evolutionStage}/3)</Text>
        <Text style={styles.streakText}>🔥 {playerStats.streak} Day Streak</Text>
        <Text style={styles.moodText}>Mood: {avatarState.mood}</Text>
      </View>

      <View style={styles.healthDataPanel}>
        <Text style={styles.sectionTitle}>📱 Health Data</Text>
        {healthStatus.isAvailable ? (
          <>
            <Text style={styles.healthDataText}>🚶 Steps: {healthData.steps}</Text>
            <Text style={styles.healthDataText}>💪 Workouts: {healthData.workouts.length}</Text>
            {healthData.heartRate && (
              <Text style={styles.healthDataText}>❤️ Heart Rate: {healthData.heartRate.resting} bpm</Text>
            )}
            {healthData.sleep && (
              <Text style={styles.healthDataText}>😴 Sleep: {healthData.sleep.duration.toFixed(1)}h</Text>
            )}
            {healthStatus.lastSync && (
              <Text style={styles.healthSyncText}>
                Last sync: {healthStatus.lastSync.toLocaleTimeString()}
              </Text>
            )}
            <TouchableOpacity style={styles.syncButton} onPress={syncHealthData}>
              <Text style={styles.syncButtonText}>🔄 Sync Health Data</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.connectButton} onPress={showHealthPermissions}>
            <Text style={styles.connectButtonText}>📱 Connect Health App</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.audioSettingsPanel}>
        <Text style={styles.sectionTitle}>🔊 Audio Settings</Text>
        <View style={styles.audioToggleContainer}>
          <Text style={styles.audioToggleLabel}>Sound Effects</Text>
          <TouchableOpacity
            style={[styles.audioToggle, AudioService.getSettings().sfxEnabled && styles.audioToggleActive]}
            onPress={() => {
              const settings = AudioService.getSettings();
              AudioService.updateSettings({ sfxEnabled: !settings.sfxEnabled });
              forceUpdate({}); // Force re-render
            }}
          >
            <Text style={styles.audioToggleText}>
              {AudioService.getSettings().sfxEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.audioToggleContainer}>
          <Text style={styles.audioToggleLabel}>Background Music</Text>
          <TouchableOpacity
            style={[styles.audioToggle, AudioService.getSettings().musicEnabled && styles.audioToggleActive]}
            onPress={() => {
              const settings = AudioService.getSettings();
              AudioService.updateSettings({ musicEnabled: !settings.musicEnabled });
              if (settings.musicEnabled) {
                AudioService.stopBackgroundMusic();
              } else {
                AudioService.playBackgroundMusic('background_music');
              }
              forceUpdate({}); // Force re-render
            }}
          >
            <Text style={styles.audioToggleText}>
              {AudioService.getSettings().musicEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const AvatarScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>👤 Your Fighter</Text>
      
      {/* Character Arena Display */}
      <View style={styles.characterArenaSection}>
        <CharacterArena
          characterState={avatarState.currentAnimation}
          showEffects={true}
          backgroundType="dojo"
        />
      </View>
      
      <Avatar isFullSize={false} />
      
      <View style={styles.evolutionInfo}>
        <Text style={styles.sectionTitle}>Evolution Progress</Text>
        <Text style={styles.evolutionDescription}>
          {playerStats.evolutionStage === 0 && "Newbie - Just starting your fitness journey!"}
          {playerStats.evolutionStage === 1 && "Trainee - Building healthy habits!"}
          {playerStats.evolutionStage === 2 && "Fighter - Strong and dedicated!"}
          {playerStats.evolutionStage === 3 && "Champion - Peak performance achieved!"}
        </Text>
      </View>

      {/* Figma Integration Test */}
      <View style={styles.developmentSection}>
        <Text style={styles.sectionTitle}>🎨 Design Integration</Text>
        <FigmaTestButton />
        
        <View style={styles.testSquareContainer}>
          <Text style={styles.testSquareLabel}>Blue Square Test (simulating Figma design):</Text>
          <CursorTestSquare />
        </View>
      </View>
    </ScrollView>
  );

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home': 
        return useGameBoyUI ? (
          <GameBoyHomeScreen
            playerStats={playerStats}
            avatarState={avatarState}
            isBlinking={isBlinking}
            dailyActions={dailyActions}
            stepProgress={stepProgress}
            healthStatus={healthStatus}
            onWorkout={() => logWorkout('cardio')}
            onEatHealthy={() => logMeal('healthy')}
            onSkipWorkout={() => skipWorkout()}
            onCheatMeal={() => logMeal('junk')}
            onCharacterTap={() => {
              AudioService.playButtonPress();
              // Could trigger level up animation or other effects
            }}
            onNavigate={(screen) => navigateToScreen(screen)}
            fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
          />
        ) : useEnhancedUI ? (
          <EnhancedHomeScreen
            playerStats={playerStats}
            avatarState={avatarState}
            dailyActions={dailyActions}
            stepProgress={stepProgress}
            healthStatus={healthStatus}
            onWorkout={() => logWorkout('cardio')}
            onEatHealthy={() => logMeal('healthy')}
            onSkipWorkout={() => skipWorkout()}
            onCheatMeal={() => logMeal('junk')}
            onCharacterTap={() => {
              AudioService.playButtonPress();
              // Could trigger level up animation or other effects
            }}
            onStepGoalChange={handleStepGoalChange}
            onToggleAutoBonuses={handleToggleAutoBonuses}
            showAnimations={{
              levelUp: evolutionCeremony.showCeremony,
              damage: false,
              sparkle: false,
              tapRing: false,
              combo: 0,
            }}
            autoBonusesEnabled={healthAutoBonuses}
            fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
          />
        ) : (
          <HomeScreen />
        );
      case 'avatar': return <AvatarScreen />;
      case 'workout': return <WorkoutScreen />;
      case 'nutrition': return <NutritionScreen />;
      case 'battle': return useGameBoyUI ? (
        <GameBoyBattleScreen
          playerStats={playerStats}
          onNavigate={navigateToScreen}
          onBattleComplete={(result) => {
            if (result.victory) {
              // Apply rewards
              setPlayerStats(prev => ({
                ...prev,
                xp: prev.xp + result.xpEarned,
                ...result.statBoosts,
                bossesDefeated: (prev.bossesDefeated || 0) + 1,
              }));
            } else {
              // Apply penalties
              setPlayerStats(prev => ({
                ...prev,
                ...result.statPenalty,
              }));
            }
          }}
        />
      ) : (
        <BattleScreen />
      );
      case 'stats': return useGameBoyUI ? (
        <GameBoyStatsScreen
          playerStats={playerStats}
          statHistory={[]} // TODO: Implement stat history tracking
          achievements={earnedAchievements}
          personalRecords={{
            longestStreak: currentStreak,
            totalWorkouts: totalWorkouts,
            caloriesBurned: 0, // TODO: Track calories
            bossesDefeated: bossesDefeated,
          }}
          onNavigate={navigateToScreen}
        />
      ) : (
        <StatsScreen />
      );
      case 'customize': return useGameBoyUI ? (
        <CharacterCustomizationScreen
          playerStats={playerStats}
          currentAppearance={characterAppearance}
          unlockedItems={unlockedCustomItems}
          onNavigate={navigateToScreen}
          onSaveCustomization={(newAppearance) => {
            setCharacterAppearance(newAppearance);
            // Could also save to backend here
          }}
        />
      ) : (
        <StatsScreen /> // Fallback for non-GameBoy UI
      );
      case 'social': return useGameBoyUI ? (
        <SocialScreen
          playerStats={playerStats}
          friends={[]} // TODO: Implement friend system
          guild={null} // TODO: Implement guild system
          notifications={{ total: 8 }} // Mock notifications
          onNavigate={navigateToScreen}
          onFeatureSelect={(featureId) => {
            // Handle feature selection
            console.log('Selected social feature:', featureId);
            setCurrentScreen(featureId); // Navigate to specific feature
          }}
        />
      ) : (
        <StatsScreen /> // Fallback for non-GameBoy UI
      );
      case 'friends': return (
        <FriendSystem
          currentUser={{ username: 'YOU', friendCode: 'NINJA-1234' }}
          friends={[]}
          pendingRequests={[]}
          onAddFriend={(username) => console.log('Add friend:', username)}
          onAcceptRequest={(id) => console.log('Accept request:', id)}
          onDeclineRequest={(id) => console.log('Decline request:', id)}
          onSendMessage={(friendId, message) => console.log('Send message:', friendId, message)}
          onViewProfile={(friend) => console.log('View profile:', friend)}
          onRemoveFriend={(id) => console.log('Remove friend:', id)}
          onNavigate={navigateToScreen}
        />
      );
      case 'leaderboards': return (
        <Leaderboards
          currentUser={{ username: 'YOU', rank: 42, level: playerStats.level }}
          friends={[]}
          onViewProfile={(user) => console.log('View profile:', user)}
          onNavigate={navigateToScreen}
        />
      );
      case 'challenges': return (
        <ChallengesScreen
          playerStats={playerStats}
          onNavigate={navigateToScreen}
          onStartChallenge={(challenge) => console.log('Start challenge:', challenge)}
          onClaimReward={(challenge) => {
            console.log('Claim reward:', challenge);
            // Add XP and coins
            setPlayerStats(prev => ({
              ...prev,
              xp: prev.xp + challenge.reward.xp,
            }));
            AudioService.playCollectCoin();
          }}
        />
      );
      case 'profile': return (
        <ProfileScreen
          playerStats={playerStats}
          customizationData={{
            appearance: avatarState.appearance || {},
            unlockedItems: unlockedCustomItems,
            equippedItems: equippedCustomizations,
          }}
          achievements={earnedAchievements}
          onNavigate={navigateToScreen}
          onUpdateProfile={(data) => console.log('Update profile:', data)}
          onSignOut={() => {
            // Clear local data on sign out
            setPlayerStats({
              health: 75,
              strength: 60,
              stamina: 70,
              happiness: 80,
              weight: 55,
              evolutionStage: 1,
              level: 5,
              xp: 180,
              xpToNext: 300,
              streak: 7,
              lastUpdate: Date.now(),
              lastDecay: Date.now(),
            });
            setCurrentScreen('home');
          }}
        />
      );
      case 'guilds': return (
        <GuildSystem
          currentUser={{ id: 'user_1', username: 'YOU', role: 'member' }}
          guild={null} // Start with no guild to show creation/join options
          onNavigate={navigateToScreen}
          onCreateGuild={(guildData) => console.log('Create guild:', guildData)}
          onJoinGuild={(code) => console.log('Join guild:', code)}
          onLeaveGuild={() => console.log('Leave guild')}
          onSendMessage={(message) => console.log('Guild message:', message)}
          onKickMember={(memberId) => console.log('Kick member:', memberId)}
          onPromoteMember={(memberId) => console.log('Promote member:', memberId)}
        />
      );
      case 'achievements': return (
        <AchievementsScreen
          onNavigate={navigateToScreen}
        />
      );
      case 'settings': return (
        <SettingsScreen
          onNavigate={navigateToScreen}
        />
      );
      default: return useEnhancedUI ? (
        <EnhancedHomeScreen
          playerStats={playerStats}
          avatarState={avatarState}
          dailyActions={dailyActions}
          stepProgress={stepProgress}
          healthStatus={healthStatus}
          onWorkout={() => logWorkout('cardio')}
          onEatHealthy={() => logMeal('healthy')}
          onSkipWorkout={() => logMeal('junk')}
          onCheatMeal={() => logMeal('junk')}
          onCharacterTap={() => AudioService.playButtonPress()}
          onStepGoalChange={handleStepGoalChange}
          onToggleAutoBonuses={handleToggleAutoBonuses}
          showAnimations={{}}
          autoBonusesEnabled={healthAutoBonuses}
          fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
        />
      ) : (
        <HomeScreen />
      );
    }
  };

  // Show loading screen while initializing
  if (!fontsLoaded || isLoading) {
    return (
      <LoadingScreen
        message={loadingMessage}
        subMessage="Preparing your fitness journey..."
        tip="Did you know? Consistency beats perfection!"
      />
    );
  }
  
  // Show error screen if initialization failed
  if (error) {
    return (
      <ErrorScreen
        type={error.type}
        customMessage={error.message}
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          // Re-run initialization instead of trying to reload window
          initializeApp();
        }}
        showDismiss={false}
      />
    );
  }

  // When using GameBoy UI, render it directly without the old shell
  if (useGameBoyUI) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{flex: 1, backgroundColor: '#000000'}} onLayout={onLayoutRootView}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <ScreenEntranceAnimation type={ENTRANCE_TYPES.GAME_BOY_WIPE}>
            {renderCurrentScreen()}
          </ScreenEntranceAnimation>
          
          {/* Screen transition overlay */}
          {isTransitioning && (
            <AnimatedLoadingScreen
              type={LOADING_TYPES.DOTS}
              message="LOADING..."
              duration={300}
            />
          )}
          
          {/* Evolution Ceremony Overlay - appears over all screens */}
          <EvolutionCeremony
            visible={evolutionCeremony.showCeremony}
            newEvolutionStage={evolutionCeremony.newEvolutionStage}
            previousStage={evolutionCeremony.previousStage}
            onComplete={() => setEvolutionCeremony(prev => ({ ...prev, showCeremony: false }))}
            fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
          />
          
          {/* Achievement Notification Overlay - DISABLED */}
          {/* <AchievementNotification
            visible={achievementNotification.visible}
            achievement={achievementNotification.achievement}
            onComplete={() => setAchievementNotification({ visible: false, achievement: null })}
          /> */}
          
          {/* Enhanced Onboarding Overlay - DISABLED */}
          {/* <EnhancedOnboardingOverlay
            visible={showOnboarding}
            onComplete={() => setShowOnboarding(false)}
            targetRefs={highlightRefs}
            onStepChange={(step) => {
              // Could trigger specific UI highlights based on step
              console.log('Onboarding step:', step);
            }}
          /> */}
          
          {/* Coach Tips - DISABLED */}
          {/* <CoachTip
            visible={!!coachTip}
            tip={coachTip}
            position="bottom"
            onDismiss={() => setCoachTip(null)}
          /> */}
          
          {/* Network Status Indicator */}
          <NetworkStatusIndicator
            position="top"
            showDetails={true}
            onPress={() => {
              // Navigate to settings or show network details
              navigateToScreen('settings');
            }}
          />
          
          {/* Toast Notifications - DISABLED */}
          {/* <ToastNotification /> */}
          
          {/* Retry Modal for Network Errors */}
          <RetryModal
            visible={showRetryModal}
            error={retryError}
            onRetry={async () => {
              setIsRetrying(true);
              setRetryCount(prev => prev + 1);
              try {
                // Retry the failed operation
                await NetworkManager.processOfflineQueue();
                setShowRetryModal(false);
                setRetryError(null);
                setRetryCount(0);
                showSuccess('Successfully synced data!');
              } catch (error) {
                setRetryError(error.message);
                showError('Retry failed. Please check your connection.');
              } finally {
                setIsRetrying(false);
              }
            }}
            onCancel={() => {
              setShowRetryModal(false);
              setRetryError(null);
              setRetryCount(0);
            }}
            onGoOffline={() => {
              setShowRetryModal(false);
              showWarning('Continuing in offline mode. Data will sync when reconnected.');
            }}
            retryCount={retryCount}
            maxRetries={3}
            isRetrying={isRetrying}
          />
          
          {/* Daily Bonus Notification - DISABLED */}
          {/* <DailyBonusNotification
            visible={!!dailyBonusNotification}
            onDismiss={() => setDailyBonusNotification(null)}
            onClaim={async () => {
              const rewards = await DailyBonusManager.claimDailyBonus();
              
              // Apply rewards
              setPlayerStats(prev => ({
                ...prev,
                xp: prev.xp + (rewards.xp || 0),
              }));
              
              // Check for level up
              setTimeout(() => checkLevelUp(), 500);
              
              // Show coach tip for streaks
              // const summary = DailyBonusManager.getSummary();
              // Coach tips disabled - no popups
              // if (summary.currentStreak === 3) {
              //   const tip = await EnhancedOnboardingManager.getCoachTip('home', 'streak_3');
              //   if (tip) NotificationQueue.enqueueCoachTip(tip);
              // } else if (summary.currentStreak === 7) {
              //   const tip = await EnhancedOnboardingManager.getCoachTip('home', 'streak_7');
              //   if (tip) NotificationQueue.enqueueCoachTip(tip);
              // }
            }}
          /> */}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Otherwise use the old UI structure
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary.black} />
        <GameBoyShell>
          <EnhancedScreenTransition
            isTransitioning={isTransitioning}
            transitionType={currentTransitionType}
            duration={300}
            onTransitionComplete={() => {
              // Additional cleanup if needed
            }}
          >
            <ScreenEntranceAnimation type={ENTRANCE_TYPES.GAME_BOY_WIPE}>
              {renderCurrentScreen()}
            </ScreenEntranceAnimation>
          </EnhancedScreenTransition>
          <BottomNav />
          
          {/* Screen transition overlay */}
          {isTransitioning && (
            <AnimatedLoadingScreen
              type={LOADING_TYPES.DOTS}
              message="LOADING..."
              duration={300}
            />
          )}
          
          {/* Evolution Ceremony Overlay - appears over all screens */}
          <EvolutionCeremony
            visible={evolutionCeremony.showCeremony}
            newEvolutionStage={evolutionCeremony.newEvolutionStage}
            previousStage={evolutionCeremony.previousStage}
            onComplete={() => setEvolutionCeremony(prev => ({ ...prev, showCeremony: false }))}
            fontFamily={fontsLoaded ? 'PressStart2P_400Regular' : 'monospace'}
          />
          
          {/* Achievement Notification Overlay - DISABLED */}
          {/* <AchievementNotification
            visible={achievementNotification.visible}
            achievement={achievementNotification.achievement}
            onComplete={() => setAchievementNotification({ visible: false, achievement: null })}
          /> */}
          
          {/* Enhanced Onboarding Overlay - DISABLED */}
          {/* <EnhancedOnboardingOverlay
            visible={showOnboarding}
            onComplete={() => setShowOnboarding(false)}
            targetRefs={highlightRefs}
            onStepChange={(step) => {
              // Could trigger specific UI highlights based on step
              console.log('Onboarding step:', step);
            }}
          /> */}
          
          {/* Coach Tips - DISABLED */}
          {/* <CoachTip
            visible={!!coachTip}
            tip={coachTip}
            position="bottom"
            onDismiss={() => setCoachTip(null)}
          /> */}
          
          {/* Network Status Indicator */}
          <NetworkStatusIndicator
            position="top"
            showDetails={true}
            onPress={() => {
              // Navigate to settings or show network details
              navigateToScreen('settings');
            }}
          />
          
          {/* Toast Notifications - DISABLED */}
          {/* <ToastNotification /> */}
          
          {/* Retry Modal for Network Errors */}
          <RetryModal
            visible={showRetryModal}
            error={retryError}
            onRetry={async () => {
              setIsRetrying(true);
              setRetryCount(prev => prev + 1);
              try {
                // Retry the failed operation
                await NetworkManager.processOfflineQueue();
                setShowRetryModal(false);
                setRetryError(null);
                setRetryCount(0);
                showSuccess('Successfully synced data!');
              } catch (error) {
                setRetryError(error.message);
                showError('Retry failed. Please check your connection.');
              } finally {
                setIsRetrying(false);
              }
            }}
            onCancel={() => {
              setShowRetryModal(false);
              setRetryError(null);
              setRetryCount(0);
            }}
            onGoOffline={() => {
              setShowRetryModal(false);
              showWarning('Continuing in offline mode. Data will sync when reconnected.');
            }}
            retryCount={retryCount}
            maxRetries={3}
            isRetrying={isRetrying}
          />
          
          {/* Daily Bonus Notification - DISABLED */}
          {/* <DailyBonusNotification
            visible={!!dailyBonusNotification}
            onDismiss={() => setDailyBonusNotification(null)}
            onClaim={async () => {
              const rewards = await DailyBonusManager.claimDailyBonus();
              
              // Apply rewards
              setPlayerStats(prev => ({
                ...prev,
                xp: prev.xp + (rewards.xp || 0),
              }));
              
              // Check for level up
              setTimeout(() => checkLevelUp(), 500);
              
              // Show coach tip for streaks
              // const summary = DailyBonusManager.getSummary();
              // Coach tips disabled - no popups
              // if (summary.currentStreak === 3) {
              //   const tip = await EnhancedOnboardingManager.getCoachTip('home', 'streak_3');
              //   if (tip) NotificationQueue.enqueueCoachTip(tip);
              // } else if (summary.currentStreak === 7) {
              //   const tip = await EnhancedOnboardingManager.getCoachTip('home', 'streak_7');
              //   if (tip) NotificationQueue.enqueueCoachTip(tip);
              // }
            }}
          /> */}
        </GameBoyShell>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Old styles removed - using new design system from AppStyles.js

// Wrap the app with error boundary
const App = () => {
  const { fontsLoaded } = usePressStart2P();

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading 16BitFit...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
      onReset={() => {
        // Could reload the app or navigate to home
        console.log('App reset requested');
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#9bb33a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
