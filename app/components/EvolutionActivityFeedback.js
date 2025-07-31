/**
 * Evolution Activity Feedback Component
 * Shows visual feedback when fitness activities contribute to evolution progress
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';
import evolutionManager from '../services/CharacterEvolutionSystem';

const EvolutionActivityFeedback = ({
  visible = false,
  activityType = 'workout',
  intensity = 'medium',
  impact = 'medium',
  streakContinued = false,
  workoutsUntilEvolution = null,
  totalWorkouts = 0,
  evolutionProgress = 0,
  onComplete = () => {},
  fontFamily = 'monospace',
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const streakBounce = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showFeedback();
    }
  }, [visible]);

  const showFeedback = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    progressBarAnim.setValue(0);
    streakBounce.setValue(1);
    glowAnim.setValue(0);

    // Animation sequence
    Animated.sequence([
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // Progress bar fill
      Animated.timing(progressBarAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),

      // Streak bounce if applicable
      ...(streakContinued ? [
        Animated.sequence([
          Animated.timing(streakBounce, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(streakBounce, {
            toValue: 1,
            duration: 200,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
      ] : []),

      // Glow effect
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Hold
      Animated.delay(1500),

      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  };

  if (!visible) return null;

  const currentEvolution = evolutionManager.getCurrentEvolution();
  const nextEvolution = evolutionManager.getNextEvolution();
  const evolutionProgress = evolutionManager.getEvolutionProgress();
  const currentStreak = evolutionManager.currentStreak;

  const getActivityIcon = () => {
    const icons = {
      workout: '💪',
      cardio: '🏃',
      strength: '🏋️',
      wellness: '🧘',
      nutrition: '🍎',
      steps: '👟',
    };
    return icons[activityType] || '⚡';
  };

  const getImpactMultiplier = () => {
    const multipliers = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      extreme: 2,
    };
    return multipliers[impact] || 1;
  };

  const getImpactColor = () => {
    const colors = {
      low: Colors.primary.grey300,
      medium: Colors.primary.success,
      high: Colors.primary.logoYellow,
      extreme: Colors.primary.error,
    };
    return colors[impact] || Colors.primary.success;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Background with evolution theme */}
      <LinearGradient
        colors={[
          currentEvolution.visualTheme.primary + '20',
          currentEvolution.visualTheme.secondary + '10',
          'transparent',
        ]}
        style={styles.backgroundGradient}
      />

      {/* Activity impact indicator */}
      <View style={styles.impactContainer}>
        <Animated.View
          style={[
            styles.activityIcon,
            {
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.activityEmoji}>{getActivityIcon()}</Text>
        </Animated.View>
        
        <Text style={[styles.workoutCounter, { fontFamily }]}>
          WORKOUT #{totalWorkouts}
        </Text>
        
        <Text style={[styles.impactText, { fontFamily, color: getImpactColor() }]}>
          {intensity.toUpperCase()} INTENSITY • {impact.toUpperCase()} IMPACT!
        </Text>
        
        <Text style={[styles.multiplierText, { fontFamily }]}>
          +{getImpactMultiplier()}x Evolution Points
        </Text>
      </View>

      {/* Streak indicator */}
      {streakContinued && (
        <Animated.View
          style={[
            styles.streakContainer,
            {
              transform: [{ scale: streakBounce }],
            },
          ]}
        >
          <Text style={[styles.streakEmoji]}>🔥</Text>
          <Text style={[styles.streakText, { fontFamily }]}>
            {currentStreak} DAY STREAK!
          </Text>
        </Animated.View>
      )}

      {/* Evolution progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.currentStage, { fontFamily }]}>
            {currentEvolution.displayName}
          </Text>
          {nextEvolution && (
            <>
              <Text style={[styles.progressArrow]}>→</Text>
              <Text style={[styles.nextStage, { fontFamily }]}>
                {nextEvolution.displayName}
              </Text>
            </>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${evolutionProgress * 100}%`],
                }),
                backgroundColor: currentEvolution.visualTheme.primary,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressGlow,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.6],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>

        {/* Workouts until evolution */}
        {workoutsUntilEvolution !== null && workoutsUntilEvolution > 0 && (
          <Text style={[styles.daysRemaining, { fontFamily }]}>
            {workoutsUntilEvolution === 1
              ? '1 workout until evolution!'
              : `${workoutsUntilEvolution} workouts until evolution`}
          </Text>
        )}

        {/* Evolution ready indicator */}
        {workoutsUntilEvolution === 0 && (
          <Animated.Text
            style={[
              styles.evolutionReady,
              { 
                fontFamily,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1, 0.5],
                }),
              },
            ]}
          >
            EVOLUTION READY! 🌟
          </Animated.Text>
        )}
      </View>

      {/* Bonus rewards based on evolution stage */}
      <View style={styles.bonusContainer}>
        <Text style={[styles.bonusTitle, { fontFamily }]}>
          Evolution Bonuses:
        </Text>
        <View style={styles.bonusRow}>
          <Text style={[styles.bonusItem, { fontFamily }]}>
            EXP x{currentEvolution.bonuses.experienceMultiplier}
          </Text>
          <Text style={[styles.bonusItem, { fontFamily }]}>
            💰 x{currentEvolution.bonuses.coinMultiplier}
          </Text>
          <Text style={[styles.bonusItem, { fontFamily }]}>
            📊 x{currentEvolution.bonuses.statMultiplier}
          </Text>
        </View>
      </View>

      {/* Motivational message */}
      <Animated.Text
        style={[
          styles.motivationalText,
          { 
            fontFamily,
            opacity: glowAnim,
          },
        ]}
      >
        {getMotivationalMessage()}
      </Animated.Text>
    </Animated.View>
  );

  function getMotivationalMessage() {
    const messages = {
      0: [
        "Great start! Keep pushing!",
        "Every journey begins with a single step!",
        "Building healthy habits!",
      ],
      1: [
        "You're getting stronger!",
        "Consistency is key!",
        "Feel the power growing!",
      ],
      2: [
        "Champion mindset activated!",
        "Your dedication is inspiring!",
        "True strength emerges!",
      ],
      3: [
        "Master level performance!",
        "Excellence is your habit!",
        "Unstoppable force!",
      ],
      4: [
        "Legendary status maintained!",
        "You ARE fitness!",
        "Transcending limits!",
      ],
    };
    
    const stageMessages = messages[currentEvolution.id] || messages[0];
    return stageMessages[Math.floor(Math.random() * stageMessages.length)];
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '20%',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary.logoYellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },

  impactContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  activityIcon: {
    marginBottom: Spacing.sm,
  },

  activityEmoji: {
    fontSize: 48,
  },

  workoutCounter: {
    ...Typography.titleLarge,
    color: Colors.primary.logoYellow,
    fontSize: 20,
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  impactText: {
    ...Typography.titleMedium,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },

  multiplierText: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    fontSize: 12,
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.error + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },

  streakEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },

  streakText: {
    ...Typography.titleSmall,
    color: Colors.primary.error,
    fontSize: 14,
  },

  progressContainer: {
    marginBottom: Spacing.md,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  currentStage: {
    ...Typography.labelMedium,
    color: Colors.primary.grey300,
    fontSize: 12,
  },

  progressArrow: {
    marginHorizontal: Spacing.sm,
    color: Colors.primary.grey300,
    fontSize: 12,
  },

  nextStage: {
    ...Typography.labelMedium,
    color: Colors.primary.logoYellow,
    fontSize: 12,
  },

  progressBar: {
    height: 8,
    backgroundColor: Colors.primary.grey800,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
  },

  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: '100%',
    backgroundColor: Colors.primary.white,
  },

  daysRemaining: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    textAlign: 'center',
    fontSize: 10,
  },

  evolutionReady: {
    ...Typography.titleSmall,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    fontSize: 14,
  },

  bonusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },

  bonusTitle: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontSize: 10,
  },

  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  bonusItem: {
    ...Typography.labelSmall,
    color: Colors.primary.success,
    fontSize: 11,
  },

  motivationalText: {
    ...Typography.labelMedium,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
});

export default EvolutionActivityFeedback;