/**
 * Evolution Progress Bar Component
 * Shows visual progression towards next evolution stage based on workout count
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';

const EvolutionProgressBar = ({
  currentStage,
  nextStage,
  progress = 0,
  totalWorkouts = 0,
  workoutsUntilNext = 0,
  showMilestones = true,
  compact = false,
  fontFamily = 'monospace',
}) => {
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar fill
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Pulse animation when close to evolution
    if (progress > 0.8) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [progress]);

  const getMilestoneMarkers = () => {
    if (!showMilestones || compact) return null;

    const milestones = [
      { workouts: 10, label: 'DEVELOPING', emoji: '💪' },
      { workouts: 30, label: 'ESTABLISHED', emoji: '🥊' },
      { workouts: 50, label: 'ADVANCED', emoji: '⚡' },
      { workouts: 75, label: 'LEGEND', emoji: '👑' },
    ];

    return milestones.map((milestone, index) => {
      const position = milestone.workouts / 75; // Max 75 workouts
      const isReached = totalWorkouts >= milestone.workouts;
      const isNext = milestone.workouts === (currentStage?.workoutsRequired || 0) + (workoutsUntilNext || 0);

      return (
        <View
          key={milestone.workouts}
          style={[
            styles.milestoneMarker,
            {
              left: `${position * 100}%`,
            },
          ]}
        >
          <View
            style={[
              styles.milestonePoint,
              isReached && styles.milestoneReached,
              isNext && styles.milestoneNext,
            ]}
          />
          {!compact && (
            <Text style={[styles.milestoneLabel, { fontFamily }]}>
              {milestone.emoji}
            </Text>
          )}
        </View>
      );
    });
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactProgressBar}>
          <Animated.View
            style={[
              styles.compactProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: currentStage?.visualTheme?.primary || Colors.primary.logoYellow,
              },
            ]}
          />
        </View>
        <Text style={[styles.compactText, { fontFamily }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stageInfo}>
          <Text style={[styles.currentStageLabel, { fontFamily }]}>
            {currentStage?.displayName || 'ROOKIE'}
          </Text>
          <Text style={[styles.workoutCount, { fontFamily }]}>
            {totalWorkouts} workouts
          </Text>
        </View>
        
        {nextStage && (
          <View style={styles.nextStageInfo}>
            <Text style={[styles.nextStageLabel, { fontFamily }]}>
              NEXT: {nextStage.displayName}
            </Text>
            <Text style={[styles.workoutsRemaining, { fontFamily }]}>
              {workoutsUntilNext} to go
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar container */}
      <View style={styles.progressContainer}>
        {/* Background */}
        <View style={styles.progressBackground} />

        {/* Milestone markers */}
        {getMilestoneMarkers()}

        {/* Progress fill */}
        <Animated.View
          style={[
            styles.progressFillContainer,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={[
              currentStage?.visualTheme?.secondary || Colors.primary.grey700,
              currentStage?.visualTheme?.primary || Colors.primary.logoYellow,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          >
            {/* Glow effect at the end */}
            <Animated.View
              style={[
                styles.progressGlow,
                {
                  opacity: glowAnim,
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>

        {/* Progress percentage */}
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { fontFamily }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      {/* Motivational text */}
      {progress > 0.9 && (
        <Animated.Text
          style={[
            styles.motivationalText,
            {
              fontFamily,
              opacity: glowAnim,
            },
          ]}
        >
          EVOLUTION IMMINENT! 🌟
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },

  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  stageInfo: {
    alignItems: 'flex-start',
  },

  currentStageLabel: {
    ...Typography.titleMedium,
    color: Colors.primary.white,
    fontSize: 14,
  },

  workoutCount: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    fontSize: 11,
  },

  nextStageInfo: {
    alignItems: 'flex-end',
  },

  nextStageLabel: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    fontSize: 14,
  },

  workoutsRemaining: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    fontSize: 11,
  },

  progressContainer: {
    height: 24,
    position: 'relative',
    marginBottom: Spacing.xs,
  },

  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary.grey800,
    borderRadius: 12,
  },

  progressFillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },

  progressGradient: {
    flex: 1,
    borderRadius: 12,
  },

  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 30,
    backgroundColor: Colors.primary.white,
  },

  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  percentageText: {
    ...Typography.titleSmall,
    color: Colors.primary.white,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  milestoneMarker: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 2,
    alignItems: 'center',
  },

  milestonePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.grey600,
    borderWidth: 2,
    borderColor: Colors.primary.grey800,
    marginTop: 6,
  },

  milestoneReached: {
    backgroundColor: Colors.primary.success,
    borderColor: Colors.primary.white,
  },

  milestoneNext: {
    backgroundColor: Colors.primary.logoYellow,
    borderColor: Colors.primary.white,
  },

  milestoneLabel: {
    position: 'absolute',
    top: -20,
    fontSize: 16,
  },

  motivationalText: {
    ...Typography.titleSmall,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.xs,
  },

  // Compact styles
  compactProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.primary.grey800,
    borderRadius: 4,
    overflow: 'hidden',
  },

  compactProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  compactText: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    fontSize: 10,
    minWidth: 35,
    textAlign: 'right',
  },
});

export default EvolutionProgressBar;