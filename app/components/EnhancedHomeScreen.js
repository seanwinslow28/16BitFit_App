/**
 * Enhanced Home Screen Component - New GameBoy-inspired UI
 * Integrates with existing character systems while providing enhanced visuals
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Animated } from 'react-native';
import GameHeader from './GameHeader';
import EnhancedCharacterArena from './EnhancedCharacterArena';
import EnhancedActionButtons from './EnhancedActionButtons';
import QuickStats from './QuickStats';
import StepGoalTracker from './StepGoalTracker';
import { Colors } from '../constants/DesignSystem';

const EnhancedHomeScreen = ({
  // Player data
  playerStats = {},
  avatarState = {},
  dailyActions = {},
  
  // Health integration
  stepProgress = null,
  healthStatus = {},
  
  // Action handlers
  onWorkout = () => {},
  onEatHealthy = () => {},
  onSkipWorkout = () => {},
  onCheatMeal = () => {},
  onCharacterTap = () => {},
  onStepGoalChange = () => {},
  onToggleAutoBonuses = () => {},
  
  // Animation effects
  showAnimations = {},
  
  // Settings
  autoBonusesEnabled = true,
  fontFamily = 'monospace',
}) => {
  // Local animation state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [showTapRing, setShowTapRing] = useState(false);
  const [combo, setCombo] = useState(0);

  // Button animation refs
  const workoutButtonScale = useRef(new Animated.Value(1)).current;
  const eatButtonScale = useRef(new Animated.Value(1)).current;
  const skipButtonScale = useRef(new Animated.Value(1)).current;
  const cheatButtonScale = useRef(new Animated.Value(1)).current;
  const characterPulse = useRef(new Animated.Value(1)).current;

  // Handle external animation triggers
  useEffect(() => {
    if (showAnimations.levelUp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 1000);
    }
    if (showAnimations.damage) {
      setShowDamage(true);
      setTimeout(() => setShowDamage(false), 400);
    }
    if (showAnimations.sparkle) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
    }
    if (showAnimations.tapRing) {
      setShowTapRing(true);
      setTimeout(() => setShowTapRing(false), 600);
    }
    if (showAnimations.combo !== undefined) {
      setCombo(showAnimations.combo);
    }
  }, [showAnimations]);

  // Button animation helper
  const animateButton = (animatedValue, onComplete = () => {}) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  };

  // Character pulse animation
  const pulseCharacter = () => {
    Animated.sequence([
      Animated.timing(characterPulse, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(characterPulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Enhanced action handlers with visual feedback
  const handleWorkout = () => {
    animateButton(workoutButtonScale, () => {
      setShowSparkle(true);
      setShowTapRing(true);
      setCombo(prev => prev + 1);
      pulseCharacter();
      
      setTimeout(() => {
        setShowSparkle(false);
        setShowTapRing(false);
      }, 1000);
      
      onWorkout();
    });
  };

  const handleEatHealthy = () => {
    animateButton(eatButtonScale, () => {
      setShowSparkle(true);
      setCombo(prev => prev + 1);
      pulseCharacter();
      
      setTimeout(() => setShowSparkle(false), 1000);
      
      onEatHealthy();
    });
  };

  const handleSkipWorkout = () => {
    animateButton(skipButtonScale, () => {
      setShowDamage(true);
      setCombo(0);
      
      setTimeout(() => setShowDamage(false), 400);
      
      onSkipWorkout();
    });
  };

  const handleCheatMeal = () => {
    animateButton(cheatButtonScale, () => {
      setShowDamage(true);
      setCombo(0);
      
      setTimeout(() => setShowDamage(false), 400);
      
      onCheatMeal();
    });
  };

  const handleCharacterTap = () => {
    pulseCharacter();
    setShowTapRing(true);
    setTimeout(() => setShowTapRing(false), 600);
    
    onCharacterTap();
  };

  // Helper function for evolution names
  const getEvolutionName = (stage) => {
    const names = ['NEWBIE', 'TRAINEE', 'FIGHTER', 'CHAMPION'];
    return names[stage] || 'NEWBIE';
  };

  // Helper function for character sprite based on evolution stage
  const getCharacterSprite = (stage, mood = 'idle') => {
    const sprites = {
      0: require('../assets/Sprites/Idle_Pose.png'), // NEWBIE
      1: require('../assets/Sprites/Flex_Pose.png'), // TRAINEE
      2: require('../assets/Sprites/Thumbs_Up_Pose.png'), // FIGHTER
      3: require('../assets/Sprites/Post_Workout_Pose.png'), // CHAMPION
    };
    
    // Use mood-based sprites if available, fallback to evolution stage
    if (mood === 'tired') return require('../assets/Sprites/Sad_Pose.png');
    if (mood === 'sad') return require('../assets/Sprites/Sad_Pose.png');
    if (mood === 'flex') return require('../assets/Sprites/Flex_Pose.png');
    if (mood === 'point') return require('../assets/Sprites/Thumbs_Up_Pose.png');
    if (mood === 'drink') return require('../assets/Sprites/Over_Eating_Pose.png');
    
    return sprites[stage] || sprites[0];
  };

  // Determine if actions should be disabled
  const actionsDisabled = false; // Could be based on state like in battle, etc.

  // Error boundary fallback - Test only basic components
  try {
    return (
      <View style={styles.container}>
        {/* Simple Header - Test this first */}
        <View style={styles.simpleHeader}>
          <Text style={styles.headerText}>16BIT FIT</Text>
        </View>
        
        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Character Display with Sprite */}
          <View style={styles.simpleCharacterArea}>
            <TouchableOpacity 
              onPress={handleCharacterTap}
              style={styles.characterSpriteContainer}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: characterPulse }] }}>
                <Image 
                  source={getCharacterSprite(playerStats.evolutionStage || 0, avatarState.mood)}
                  style={styles.characterSprite}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.levelText}>Level {playerStats.level || 1}</Text>
            <Text style={styles.evolutionText}>
              {getEvolutionName(playerStats.evolutionStage || 0)}
            </Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>❤️ {Math.round(playerStats.health || 100)}%</Text>
              <Text style={styles.statText}>⚡ {Math.round(playerStats.stamina || 100)}%</Text>
            </View>
          </View>

          {/* Compact Step Goal Tracker */}
          {stepProgress && (
            <View style={styles.compactStepTracker}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>🚶 STEPS</Text>
                <Text style={styles.stepCount}>
                  {stepProgress.currentSteps.toLocaleString()} / {stepProgress.goalSteps.toLocaleString()}
                </Text>
              </View>
              <View style={styles.compactProgressBar}>
                <View 
                  style={[
                    styles.compactProgressFill, 
                    { 
                      width: `${Math.min(stepProgress.percentage, 100)}%`,
                      backgroundColor: stepProgress.achieved 
                        ? Colors.primary.success 
                        : Colors.state.energy,
                    }
                  ]} 
                />
              </View>
              {stepProgress.achieved && (
                <Text style={styles.achievedLabel}>🎉 GOAL ACHIEVED!</Text>
              )}
            </View>
          )}

          {/* Animated Action Buttons with Touch Handlers */}
          <View style={styles.simpleButtonArea}>
            <View style={styles.buttonRow}>
              <Animated.View style={{ transform: [{ scale: workoutButtonScale }], flex: 1 }}>
                <TouchableOpacity 
                  style={styles.simpleButton}
                  onPress={handleWorkout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>💪 WORKOUT</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: eatButtonScale }], flex: 1 }}>
                <TouchableOpacity 
                  style={styles.simpleButton}
                  onPress={handleEatHealthy}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>🥗 EAT HEALTHY</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <View style={styles.buttonRow}>
              <Animated.View style={{ transform: [{ scale: skipButtonScale }], flex: 1 }}>
                <TouchableOpacity 
                  style={[styles.simpleButton, styles.secondaryButton]}
                  onPress={handleSkipWorkout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>😴 SKIP</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: cheatButtonScale }], flex: 1 }}>
                <TouchableOpacity 
                  style={[styles.simpleButton, styles.secondaryButton]}
                  onPress={handleCheatMeal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>🍔 CHEAT</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    );
  } catch (error) {
    console.error('EnhancedHomeScreen Error:', error);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Enhanced UI Error - Check Console
        </Text>
        <Text style={styles.errorDetails}>
          {error.toString()}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.black,
  },

  simpleHeader: {
    backgroundColor: Colors.primary.logoYellow,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary.black,
  },

  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.black,
    textAlign: 'center',
  },

  mainContent: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 8,
  },

  simpleCharacterArea: {
    backgroundColor: Colors.environment.groundDark,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    borderRadius: 8,
    margin: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },

  characterSpriteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.primary.logoYellow,
  },

  characterSprite: {
    width: 40,
    height: 40,
  },

  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: Colors.primary.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  evolutionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.success,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.black,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary.black,
  },

  compactStepTracker: {
    backgroundColor: Colors.environment.nightPurple,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary.logoYellow,
  },

  stepCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary.black,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  compactProgressBar: {
    height: 8,
    backgroundColor: Colors.primary.black,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary.black,
  },

  compactProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  achievedLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary.success,
    textAlign: 'center',
    marginTop: 6,
  },

  simpleButtonArea: {
    marginTop: 16,
    gap: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  simpleButton: {
    flex: 1,
    backgroundColor: Colors.primary.success,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },

  secondaryButton: {
    backgroundColor: Colors.state.health,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary.black,
    textAlign: 'center',
  },

  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },

  errorDetails: {
    color: 'orange',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    padding: 20,
  },
});

export default EnhancedHomeScreen;