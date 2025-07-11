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
  Animated,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import PhaserGame from './PhaserGame';
import HealthIntegration from './services/HealthIntegration';
import SupabaseService from './services/SupabaseService';
import AudioService from './services/AudioService';

const {width, height} = Dimensions.get('window');

const App = () => {
  // Game State
  const [currentScreen, setCurrentScreen] = useState('home');
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

  // Update avatar state when player stats change
  useEffect(() => {
    const newEvolutionStage = getEvolutionStage(playerStats);
    const newVisualState = getVisualState(playerStats);
    const newMood = getMoodFromStats(playerStats);
    
    setPlayerStats(prev => ({
      ...prev,
      evolutionStage: newEvolutionStage
    }));
    
    setAvatarState(prev => ({
      ...prev,
      visualState: newVisualState,
      mood: newMood
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
        
        // Show sync notification
        Alert.alert(
          'Health Data Synced! 🏃‍♂️',
          `Your health activities have boosted your character stats!\\n\\n${
            Object.entries(syncResult.statBonuses)
              .filter(([_, value]) => value > 0)
              .map(([stat, value]) => `${stat}: +${value}`)
              .join('\\n')
          }`,
          [{ text: 'Awesome!', onPress: () => triggerAnimation('flex', 3000) }]
        );
      }
    } catch (error) {
      console.error('Health sync failed:', error);
    }
  };

  const showHealthPermissions = () => {
    Alert.alert(
      'Health Integration',
      'Connect your Apple Health or Google Fit data to automatically boost your character stats based on real-world activities!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Connect', onPress: () => HealthIntegration.requestPermissions() },
      ]
    );
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
      const { data, error } = await SupabaseService.saveCharacterData(playerStats);
      if (error) {
        console.error('Character save failed:', error);
      } else {
        console.log('Character data saved successfully');
      }
    } catch (error) {
      console.error('Character save error:', error);
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
      
      // Initialize other services
      initializeBackend();
      initializeHealthIntegration();
    };
    
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      AudioService.cleanup();
    };
  }, []);

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
        <TouchableOpacity
          key={key}
          style={[styles.navButton, currentScreen === key && styles.navButtonActive]}
          onPress={() => {
            AudioService.playButtonPress();
            setCurrentScreen(key);
          }}
        >
          <Image 
            source={sprite}
            style={styles.navButtonSprite}
            resizeMode="contain"
          />
          <Text style={styles.navLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Enhanced Stats Component with animations
  const StatBar = ({current, max, color, label}) => {
    const percentage = Math.min((current / max) * 100, 100);
    const animatedWidth = React.useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, [percentage]);
    
    return (
      <View style={styles.statBarContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statBarBackground}>
          <Animated.View 
            style={[
              styles.statBarFill, 
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: color
              }
            ]} 
          />
        </View>
        <Text style={styles.statText}>{Math.round(current)}/{max}</Text>
      </View>
    );
  };

  // Action Handlers - Implementing documented action effects
  const logWorkout = (type) => {
    let statChanges = {};
    let animationType = 'workout';
    
    switch(type) {
      case 'cardio':
        statChanges = {
          stamina: Math.min(playerStats.stamina + 5, 100),
          weight: Math.max(playerStats.weight - 3, 30),
          happiness: Math.min(playerStats.happiness + 2, 100),
        };
        break;
      case 'strength':
        statChanges = {
          strength: Math.min(playerStats.strength + 5, 100),
          weight: Math.max(playerStats.weight - 2, 30),
          happiness: Math.min(playerStats.happiness + 2, 100),
        };
        animationType = 'flex';
        break;
      case 'yoga':
        statChanges = {
          happiness: Math.min(playerStats.happiness + 3, 100),
          stamina: Math.min(playerStats.stamina + 2, 100),
          health: Math.min(playerStats.health + 1, 100),
        };
        break;
      case 'sports':
        statChanges = {
          strength: Math.min(playerStats.strength + 1, 100),
          stamina: Math.min(playerStats.stamina + 1, 100),
          happiness: Math.min(playerStats.happiness + 1, 100),
          health: Math.min(playerStats.health + 1, 100),
        };
        break;
      default:
        statChanges = {
          strength: Math.min(playerStats.strength + 2, 100),
          stamina: Math.min(playerStats.stamina + 2, 100),
          happiness: Math.min(playerStats.happiness + 1, 100),
        };
    }
    
    setPlayerStats(prev => ({
      ...prev,
      ...statChanges,
      xp: prev.xp + 25,
      lastUpdate: Date.now(),
    }));
    
    setDailyActions(prev => ({...prev, workoutLogged: true}));
    triggerAnimation(animationType, 3000);
    
    // Audio feedback
    AudioService.playWorkoutComplete();
    AudioService.playStatChange(true);
    
    // Log the action
    logUserAction('workout', {
      type,
      statChanges,
      timestamp: Date.now(),
    });
  };

  const logMeal = (type) => {
    let statChanges = {};
    let animationType = 'eat';
    let xpGain = 15;
    
    switch(type) {
      case 'healthy':
        statChanges = {
          health: Math.min(playerStats.health + 5, 100),
          weight: Math.max(playerStats.weight - 2, 30),
          happiness: Math.min(playerStats.happiness + 2, 100),
        };
        animationType = 'thumbs_up';
        xpGain = 20;
        break;
      case 'protein':
        statChanges = {
          strength: Math.min(playerStats.strength + 5, 100),
          health: Math.min(playerStats.health + 2, 100),
          weight: Math.max(playerStats.weight - 1, 30),
        };
        animationType = 'flex';
        xpGain = 18;
        break;
      case 'junk':
        statChanges = {
          health: Math.max(playerStats.health - 3, 0),
          weight: Math.min(playerStats.weight + 5, 70),
          happiness: Math.max(playerStats.happiness - 2, 0),
        };
        animationType = 'sad';
        xpGain = 5;
        break;
      case 'hydration':
        statChanges = {
          health: Math.min(playerStats.health + 2, 100),
          stamina: Math.min(playerStats.stamina + 2, 100),
          happiness: Math.min(playerStats.happiness + 1, 100),
        };
        animationType = 'thumbs_up';
        xpGain = 10;
        break;
      default:
        statChanges = {
          health: Math.min(playerStats.health + 3, 100),
          happiness: Math.min(playerStats.happiness + 1, 100),
        };
    }
    
    setPlayerStats(prev => ({
      ...prev,
      ...statChanges,
      xp: prev.xp + xpGain,
      lastUpdate: Date.now(),
    }));
    
    setDailyActions(prev => ({...prev, mealLogged: true}));
    triggerAnimation(animationType, 2500);
    
    // Audio feedback
    AudioService.playMealLogged(type === 'healthy' || type === 'protein' || type === 'hydration');
    if (type === 'junk') {
      AudioService.playStatChange(false);
    } else {
      AudioService.playStatChange(true);
    }
    
    // Log the action
    logUserAction('meal', {
      type,
      statChanges,
      xpGain,
      timestamp: Date.now(),
    });
  };

  const startBossBattle = () => {
    setInBattle(true);
    setCurrentScreen('battle');
  };

  // Screen Components
  const HomeScreen = () => (
    <View style={styles.homeScreenContainer}>
      <ImageBackground 
        source={require('./assets/Backgrounds/Main_Background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.centeredAvatarContainer}>
          <View style={styles.centeredAvatarSprite}>
            <Image 
              source={require('./assets/Sprites/Idle_Pose.png')}
              style={styles.fullBodySprite}
              resizeMode="contain"
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const WorkoutScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>💪 Training Ground</Text>
      
      <View style={styles.actionGrid}>
        {[
          {type: 'cardio', name: '🏃 Cardio', desc: '+5 Stamina, -3 Weight, +2 Happiness'},
          {type: 'strength', name: '🏋️ Strength', desc: '+5 Strength, -2 Weight, +2 Happiness'},
          {type: 'yoga', name: '🧘 Yoga', desc: '+3 Happiness, +2 Stamina, +1 Health'},
          {type: 'sports', name: '⚽ Sports', desc: '+1 All Stats'},
        ].map(workout => (
          <TouchableOpacity 
            key={workout.type}
            style={styles.actionCard}
            onPress={() => {
              AudioService.playButtonPress();
              logWorkout(workout.type);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>{workout.name}</Text>
            <Text style={styles.actionDesc}>{workout.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const NutritionScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>🍎 Nutrition Log</Text>
      
      <View style={styles.actionGrid}>
        {[
          {type: 'healthy', name: '🥗 Healthy Meal', desc: '+5 Health, -2 Weight, +2 Happiness'},
          {type: 'protein', name: '🍗 Protein', desc: '+5 Strength, +2 Health, -1 Weight'},
          {type: 'junk', name: '🍕 Junk Food', desc: '-3 Health, +5 Weight, -2 Happiness'},
          {type: 'hydration', name: '💧 Water', desc: '+2 Health, +2 Stamina, +1 Happiness'},
        ].map(meal => (
          <TouchableOpacity 
            key={meal.type}
            style={[styles.actionCard, meal.type === 'junk' && styles.negativeAction]}
            onPress={() => {
              AudioService.playButtonPress();
              logMeal(meal.type);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>{meal.name}</Text>
            <Text style={styles.actionDesc}>{meal.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const BattleScreen = () => {
    const [battlePhase, setBattlePhase] = useState('prep');
    const [battleResult, setBattleResult] = useState(null);
    const [currentBoss, setCurrentBoss] = useState(null);

    // Boss types with different mechanics and requirements
    const getBossForLevel = (level) => {
      const bosses = [
        {
          name: 'Junk Food Demon',
          sprite: '🍕',
          level: Math.max(1, level - 2),
          description: 'A creature born from processed foods and sugar',
          weakness: 'health',
          requiredStats: { health: 50, strength: 30 },
          rewards: { xp: 100, health: 5, happiness: 10 },
          battleType: 'health_focused'
        },
        {
          name: 'Couch Potato Monster',
          sprite: '📺',
          level: Math.max(1, level - 1),
          description: 'A lazy beast that feeds on inactivity',
          weakness: 'stamina',
          requiredStats: { stamina: 60, strength: 40 },
          rewards: { xp: 120, stamina: 8, strength: 5 },
          battleType: 'stamina_focused'
        },
        {
          name: 'Stress Wraith',
          sprite: '😰',
          level: level,
          description: 'A dark entity that thrives on anxiety and burnout',
          weakness: 'happiness',
          requiredStats: { happiness: 70, health: 50 },
          rewards: { xp: 150, happiness: 10, health: 3 },
          battleType: 'happiness_focused'
        },
        {
          name: 'Weakness Titan',
          sprite: '💀',
          level: level + 1,
          description: 'The ultimate test of physical prowess',
          weakness: 'strength',
          requiredStats: { strength: 80, stamina: 60, health: 60 },
          rewards: { xp: 200, strength: 10, evolutionBonus: true },
          battleType: 'strength_focused'
        }
      ];
      
      // Select boss based on player's weakest stat
      const weakestStat = Math.min(
        playerStats.health,
        playerStats.strength,
        playerStats.stamina,
        playerStats.happiness
      );
      
      if (weakestStat === playerStats.health) return bosses[0];
      if (weakestStat === playerStats.stamina) return bosses[1];
      if (weakestStat === playerStats.happiness) return bosses[2];
      return bosses[3];
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
      
      // Boss difficulty scales with level
      const bossRequiredPower = currentBoss.level * 50 + 
        Object.values(currentBoss.requiredStats).reduce((a, b) => a + b, 0);
      
      const won = totalPower >= bossRequiredPower;
      setBattleResult(won ? 'win' : 'lose');
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
      
      // Log battle result
      SupabaseService.saveBattleResult({
        bossName: currentBoss.name,
        bossLevel: currentBoss.level,
        playerLevel: playerStats.level,
        result: won ? 'win' : 'lose',
        rewards: won ? currentBoss.rewards : {},
        gameScore: gameResult.score,
        combatPower: totalPower,
      });
    };

    const calculateCombatPower = (battleType) => {
      switch(battleType) {
        case 'health_focused':
          return playerStats.health * 2 + playerStats.strength;
        case 'stamina_focused':
          return playerStats.stamina * 2 + playerStats.strength;
        case 'happiness_focused':
          return playerStats.happiness * 2 + playerStats.health;
        case 'strength_focused':
          return playerStats.strength * 2 + playerStats.stamina;
        default:
          return playerStats.health + playerStats.strength + playerStats.stamina + playerStats.happiness;
      }
    };

    const applyBattleRewards = (boss) => {
      setPlayerStats(prev => ({
        ...prev,
        xp: prev.xp + boss.rewards.xp,
        level: boss.rewards.evolutionBonus ? prev.level + 1 : prev.level,
        health: Math.min(prev.health + (boss.rewards.health || 0), 100),
        strength: Math.min(prev.strength + (boss.rewards.strength || 0), 100),
        stamina: Math.min(prev.stamina + (boss.rewards.stamina || 0), 100),
        happiness: Math.min(prev.happiness + (boss.rewards.happiness || 0), 100),
        lastUpdate: Date.now(),
      }));
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

    if (battlePhase === 'prep') {
      return (
        <View style={styles.screenContent}>
          <Text style={styles.screenTitle}>⚔️ Boss Battle</Text>
          <View style={styles.bossCard}>
            <Text style={styles.bossSprite}>{getBossForLevel(playerStats.level).sprite}</Text>
            <Text style={styles.bossName}>{getBossForLevel(playerStats.level).name}</Text>
            <Text style={styles.bossLevel}>Level {getBossForLevel(playerStats.level).level}</Text>
            <Text style={styles.bossDescription}>{getBossForLevel(playerStats.level).description}</Text>
            <Text style={styles.bossWeakness}>Weakness: {getBossForLevel(playerStats.level).weakness}</Text>
          </View>
          
          <View style={styles.battleStats}>
            <Text style={styles.battleStatsTitle}>Your Combat Power:</Text>
            <Text style={styles.combatPower}>
              {calculateCombatPower(getBossForLevel(playerStats.level).battleType)}
            </Text>
            <Text style={styles.battleStatsSubtitle}>vs Boss Power: {getBossForLevel(playerStats.level).level * 50}</Text>
          </View>
          
          <View style={styles.requiredStats}>
            <Text style={styles.sectionTitle}>Required Stats:</Text>
            {Object.entries(getBossForLevel(playerStats.level).requiredStats).map(([stat, value]) => (
              <Text key={stat} style={[styles.statRequirement, {
                color: playerStats[stat] >= value ? '#10b981' : '#ef4444'
              }]}>
                {stat}: {playerStats[stat]}/{value}
              </Text>
            ))}
          </View>
          
          <TouchableOpacity style={styles.battleButton} onPress={executeBattle}>
            <Text style={styles.battleButtonText}>⚔️ START BATTLE!</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (battlePhase === 'fighting') {
      return (
        <View style={styles.screenContent}>
          <Text style={styles.battleAnimation}>⚔️ BATTLE IN PROGRESS! ⚔️</Text>
          <Text style={styles.battleText}>Control your fighter! Use arrow keys to move and jump!</Text>
          <View style={styles.gameArea}>
            <PhaserGame 
              gameType="battle" 
              playerStats={playerStats} 
              onGameComplete={handleGameComplete}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.screenContent}>
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
      </View>
    );
  };

  const StatsScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>📊 Character Stats</Text>
      
      <View style={styles.statsPanel}>
        <StatBar current={Math.round(playerStats.health)} max={100} color="#45B7D1" label="❤️ Health" />
        <StatBar current={Math.round(playerStats.strength)} max={100} color="#FF6B6B" label="💪 Strength" />
        <StatBar current={Math.round(playerStats.stamina)} max={100} color="#4ECDC4" label="🏃 Stamina" />
        <StatBar current={Math.round(playerStats.happiness)} max={100} color="#9D4EDD" label="😊 Happiness" />
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
        <Text style={styles.evolutionText}>{getEvolutionName(playerStats.evolutionStage)} ({playerStats.evolutionStage}/3)</Text>
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
      <Avatar isFullSize={true} />
      
      <View style={styles.evolutionInfo}>
        <Text style={styles.sectionTitle}>Evolution Progress</Text>
        <Text style={styles.evolutionDescription}>
          {playerStats.evolutionStage === 0 && "Newbie - Just starting your fitness journey!"}
          {playerStats.evolutionStage === 1 && "Trainee - Building healthy habits!"}
          {playerStats.evolutionStage === 2 && "Fighter - Strong and dedicated!"}
          {playerStats.evolutionStage === 3 && "Champion - Peak performance achieved!"}
        </Text>
      </View>
    </ScrollView>
  );

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'avatar': return <AvatarScreen />;
      case 'workout': return <WorkoutScreen />;
      case 'nutrition': return <NutritionScreen />;
      case 'battle': return <BattleScreen />;
      case 'stats': return <StatsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <GameBoyShell>
        {renderCurrentScreen()}
        <BottomNav />
      </GameBoyShell>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  
  // GameBoy Shell Styles
  gameBoyShell: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 0,
    margin: 0,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerGrill: {
    flexDirection: 'row',
    gap: 3,
  },
  speakerHole: {
    width: 4,
    height: 4,
    backgroundColor: '#1d4ed8',
    borderRadius: 2,
  },
  screenArea: {
    backgroundColor: '#2d1b69',
    borderRadius: 0,
    padding: 0,
    marginBottom: 10,
    position: 'relative',
    flex: 1,
  },
  gameBoyLabel: {
    color: '#c084fc',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  screenFrame: {
    backgroundColor: '#1e1b4b',
    borderRadius: 0,
    padding: 0,
    flex: 1,
    minHeight: height * 0.60,
  },
  screen: {
    backgroundColor: '#0f172a',
    borderRadius: 0,
    flex: 1,
    position: 'relative',
  },
  powerLED: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  controlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 5,
    marginTop: 5,
    backgroundColor: '#2563eb',
  },
  leftControls: {
    alignItems: 'center',
  },
  dPad: {
    width: 120,
    height: 120,
    alignItems: 'center',
  },
  dPadButton: {
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  dPadUp: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dPadDown: {
    width: 40,
    height: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dPadMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dPadLeft: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dPadRight: {
    width: 40,
    height: 40,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1d4ed8',
    borderWidth: 3,
    borderColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 5,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
  },
  selectButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  startButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Screen Content Styles
  screenContent: {
    flex: 1,
    padding: 10,
  },
  homeScreenContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screenContentWithBackground: {
    flex: 1,
    padding: 10,
  },
  centeredAvatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  centeredAvatarSprite: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullBodySprite: {
    width: 200,
    height: 300,
  },
  screenTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'monospace',
  },

  // Avatar Styles
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  fullSizeAvatarContainer: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 30,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#475569',
  },
  avatarSpriteContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  spriteFrameContainer: {
    width: 60,
    height: 60,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    marginBottom: 5,
  },
  fullSizeSpriteContainer: {
    width: 120,
    height: 120,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#374151',
    marginBottom: 10,
  },
  avatarSprite: {
    width: 60,
    height: 60,
  },
  fullSizeAvatarSprite: {
    width: 120,
    height: 120,
  },
  evolutionBadge: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  avatarName: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  speechBubble: {
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  speechText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  avatarGear: {
    flexDirection: 'row',
    gap: 5,
  },
  gearItem: {
    fontSize: 20,
  },

  // Navigation Styles
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 2,
    borderTopColor: '#475569',
    paddingVertical: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    backgroundColor: '#374151',
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
  },
  navButtonSprite: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },

  // Stats Styles
  quickStats: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  statsPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    width: 80,
    fontWeight: 'bold',
  },
  statBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: '#374151',
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  statText: {
    color: '#9ca3af',
    fontSize: 10,
    width: 40,
    textAlign: 'right',
  },

  // Daily Progress Styles
  dailyProgress: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressItems: {
    gap: 5,
  },
  progressItem: {
    color: '#9ca3af',
    fontSize: 12,
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 5,
  },
  completed: {
    color: '#10b981',
    backgroundColor: '#064e3b',
  },

  // Boss Alert Styles
  bossAlert: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  bossAlertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bossAlertSubtext: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 5,
  },

  // Action Grid Styles
  actionGrid: {
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  negativeAction: {
    borderColor: '#dc2626',
    backgroundColor: '#7f1d1d',
  },
  actionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },

  // Battle Styles
  bossCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  bossSprite: {
    fontSize: 80,
    marginBottom: 10,
  },
  bossName: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bossLevel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  battleStats: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  battleStatsTitle: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 10,
  },
  combatPower: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  battleButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  battleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  battleAnimation: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
  battleText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  gameArea: {
    flex: 1,
    marginTop: 15,
    backgroundColor: '#9BBD3F',
    borderRadius: 8,
    padding: 5,
  },
  battleResultText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  // Evolution Styles
  achievementPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#475569',
  },
  evolutionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  streakText: {
    color: '#10b981',
    fontSize: 14,
  },
  evolutionInfo: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  evolutionDescription: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  // New character system styles
  visualStateBadge: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: 'bold',
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
  },
  
  weightPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  
  weightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  weightText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  
  weightStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  moodText: {
    color: '#fbbf24',
    fontSize: 12,
    marginTop: 5,
  },

  // Enhanced battle system styles
  bossDescription: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  bossWeakness: {
    color: '#f59e0b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  
  battleStatsSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  
  requiredStats: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  
  statRequirement: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  
  rewardsPanel: {
    backgroundColor: '#064e3b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  
  rewardText: {
    color: '#10b981',
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  
  consequencesPanel: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  
  consequenceText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  
  motivationText: {
    color: '#fbbf24',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Health integration styles
  healthDataPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  
  healthDataText: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 5,
  },
  
  healthSyncText: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  
  syncButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  connectButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Audio settings styles
  audioSettingsPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  
  audioToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  audioToggleLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  
  audioToggle: {
    backgroundColor: '#374151',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  
  audioToggleActive: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  
  audioToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

});

export default App;
