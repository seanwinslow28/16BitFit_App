/**
 * Guest Mode Onboarding Screen
 * 60-second onboarding flow for immediate engagement
 * No registration required - get to first battle quickly
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useCharacter } from '../../contexts/CharacterContext';
import EvolutionCharacterDisplay from '../../components/EvolutionCharacterDisplay';
import OnboardingManager from '../../services/OnboardingManager';
import SoundFXManager from '../../services/SoundFXManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simplified archetypes for 60-second flow
const QUICK_ARCHETYPES = [
  {
    id: 'power',
    name: 'POWER',
    icon: '💪',
    color: '#FF6B6B',
    description: 'Build strength',
    stats: { strength: 3, stamina: 1, health: 2 },
  },
  {
    id: 'speed',
    name: 'SPEED',
    icon: '⚡',
    color: '#4ECDC4',
    description: 'Run faster',
    stats: { strength: 1, stamina: 3, speed: 3 },
  },
  {
    id: 'balance',
    name: 'BALANCE',
    icon: '⚖️',
    color: '#95E1D3',
    description: 'All-around',
    stats: { strength: 2, stamina: 2, health: 2 },
  },
];

// Quick activity options
const QUICK_ACTIVITIES = [
  { id: 'gym', name: 'Gym', icon: '🏋️', time: '30 min' },
  { id: 'run', name: 'Run', icon: '🏃', time: '20 min' },
  { id: 'walk', name: 'Walk', icon: '🚶', time: '15 min' },
];

const GuestOnboardingScreen = () => {
  const navigation = useNavigation();
  const { 
    createGuestCharacter, 
    characterStats, 
    addActivity,
    setCharacterArchetype,
  } = useCharacter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Track time for 60-second goal
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Animate step transitions
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / 4,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);
  
  // Handle archetype selection
  const handleArchetypeSelect = (archetype) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArchetype(archetype);
    SoundFXManager.playSuccess();
    
    // Auto-progress after selection
    setTimeout(() => {
      progressToNextStep();
    }, 500);
  };
  
  // Handle activity selection
  const handleActivitySelect = (activity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedActivity(activity);
    SoundFXManager.playSuccess();
    
    // Auto-progress after selection
    setTimeout(() => {
      progressToNextStep();
    }, 500);
  };
  
  // Progress to next step
  const progressToNextStep = () => {
    if (currentStep < 3) {
      // Fade out current step
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
      });
    }
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    if (!selectedArchetype || !selectedActivity) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowCelebration(true);
    
    // Create guest character
    await createGuestCharacter({
      archetype: selectedArchetype.id,
      name: `${selectedArchetype.name} Fighter`,
    });
    
    // Set archetype
    setCharacterArchetype(selectedArchetype.id, selectedArchetype.name);
    
    // Log first activity
    addActivity({
      category: selectedActivity.id,
      name: selectedActivity.name,
      duration: parseInt(selectedActivity.time),
      intensity: 2,
      timestamp: new Date().toISOString(),
    });
    
    // Mark onboarding complete
    await OnboardingManager.completeOnboarding();
    
    // Play celebration
    SoundFXManager.playAchievementUnlock();
    
    // Navigate to home after celebration
    setTimeout(() => {
      navigation.replace('HomeScreenV2');
    }, 2000);
  };
  
  // Skip to main app
  const skipOnboarding = () => {
    navigation.replace('HomeScreenV2');
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderArchetypeSelection();
      case 2:
        return renderQuickActivity();
      case 3:
        return renderBattlePreview();
      default:
        return null;
    }
  };
  
  // Welcome step
  const renderWelcome = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.logo}>16BitFit</Text>
      <Text style={styles.title}>TRANSFORM FITNESS{'\n'}INTO VICTORIES</Text>
      <Text style={styles.subtitle}>
        Log workouts → Power up character → Win battles
      </Text>
      
      <View style={styles.emojiContainer}>
        <Text style={styles.bigEmoji}>🎮</Text>
        <Text style={styles.plusSign}>+</Text>
        <Text style={styles.bigEmoji}>💪</Text>
      </View>
      
      <Pressable
        style={styles.primaryButton}
        onPress={progressToNextStep}
      >
        <Text style={styles.primaryButtonText}>START (15 sec)</Text>
      </Pressable>
      
      <Pressable
        style={styles.skipButton}
        onPress={skipOnboarding}
      >
        <Text style={styles.skipText}>Skip for now →</Text>
      </Pressable>
    </Animated.View>
  );
  
  // Archetype selection step
  const renderArchetypeSelection = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Pick Your Style</Text>
      <Text style={styles.stepSubtitle}>Tap to choose (10 sec)</Text>
      
      <View style={styles.archetypeGrid}>
        {QUICK_ARCHETYPES.map((archetype) => (
          <Pressable
            key={archetype.id}
            style={[
              styles.archetypeCard,
              { backgroundColor: archetype.color },
              selectedArchetype?.id === archetype.id && styles.selectedCard,
            ]}
            onPress={() => handleArchetypeSelect(archetype)}
          >
            <Text style={styles.archetypeIcon}>{archetype.icon}</Text>
            <Text style={styles.archetypeName}>{archetype.name}</Text>
            <Text style={styles.archetypeDesc}>{archetype.description}</Text>
          </Pressable>
        ))}
      </View>
      
      {selectedArchetype && (
        <View style={styles.selectionConfirm}>
          <Text style={styles.selectionText}>
            Great choice! {selectedArchetype.name} Fighter selected
          </Text>
        </View>
      )}
    </Animated.View>
  );
  
  // Quick activity step
  const renderQuickActivity = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Log Your First Activity</Text>
      <Text style={styles.stepSubtitle}>What did you do today? (10 sec)</Text>
      
      <View style={styles.activityGrid}>
        {QUICK_ACTIVITIES.map((activity) => (
          <Pressable
            key={activity.id}
            style={[
              styles.activityCard,
              selectedActivity?.id === activity.id && styles.selectedActivity,
            ]}
            onPress={() => handleActivitySelect(activity)}
          >
            <Text style={styles.activityIcon}>{activity.icon}</Text>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </Pressable>
        ))}
      </View>
      
      {selectedActivity && (
        <View style={styles.powerUpPreview}>
          <Text style={styles.powerUpText}>
            +5 STRENGTH{'\n'}+3 STAMINA{'\n'}+10 EXP
          </Text>
        </View>
      )}
    </Animated.View>
  );
  
  // Battle preview step
  const renderBattlePreview = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Ready for Battle!</Text>
      <Text style={styles.stepSubtitle}>Your character is powered up</Text>
      
      <View style={styles.characterPreview}>
        {selectedArchetype && (
          <EvolutionCharacterDisplay
            evolutionStage={0}
            archetype={selectedArchetype.id}
            animationType="idle"
            size={150}
          />
        )}
      </View>
      
      <View style={styles.statsPreview}>
        <Text style={styles.statsText}>
          Level 1 {selectedArchetype?.name} Fighter{'\n'}
          Ready for first battle!
        </Text>
      </View>
      
      <Pressable
        style={[styles.primaryButton, styles.battleButton]}
        onPress={completeOnboarding}
      >
        <Text style={styles.primaryButtonText}>ENTER BATTLE! 🎮</Text>
      </Pressable>
      
      {timeElapsed < 60 && (
        <Text style={styles.timeBonus}>
          ⚡ Speed Bonus: {60 - timeElapsed}s under 60s!
        </Text>
      )}
    </Animated.View>
  );
  
  // Celebration screen
  if (showCelebration) {
    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.celebrationContainer,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }
              ],
            }
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎮</Text>
          <Text style={styles.celebrationText}>READY TO BATTLE!</Text>
          <Text style={styles.celebrationSubtext}>
            Completed in {timeElapsed} seconds!
          </Text>
        </Animated.View>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timeElapsed}s</Text>
      </View>
      
      {/* Current Step */}
      {renderStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F380F',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(155, 189, 15, 0.2)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  timerContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  timerText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  bigEmoji: {
    fontSize: 64,
  },
  plusSign: {
    fontSize: 32,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    opacity: 0.6,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginBottom: 30,
    textAlign: 'center',
  },
  archetypeGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  archetypeCard: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FFD700',
    transform: [{ scale: 0.95 }],
  },
  archetypeIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  archetypeName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    marginBottom: 5,
  },
  archetypeDesc: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  selectionConfirm: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  selectionText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    textAlign: 'center',
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#1F4F1F',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedActivity: {
    borderColor: '#FFD700',
    backgroundColor: '#2F6F2F',
  },
  activityIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  activityName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    opacity: 0.6,
  },
  powerUpPreview: {
    backgroundColor: 'rgba(155, 189, 15, 0.2)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  powerUpText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    lineHeight: 20,
  },
  characterPreview: {
    marginBottom: 30,
  },
  statsPreview: {
    marginBottom: 30,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    lineHeight: 20,
  },
  battleButton: {
    backgroundColor: '#FF6B6B',
  },
  timeBonus: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginTop: 20,
    textAlign: 'center',
  },
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  celebrationText: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  celebrationSubtext: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
  },
});

export default GuestOnboardingScreen;