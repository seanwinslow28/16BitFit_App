/**
 * Workout Feedback Component - Visual stat change display
 * Shows animated stat increases and XP gains after workouts
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';
import SoundFXManager from '../services/SoundFXManager';

const WorkoutFeedback = ({
  visible = false,
  statChanges = {},
  workoutType = '',
  xpGained = 0,
  onComplete = () => {},
  fontFamily = 'monospace',
}) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
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
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start(async () => {
        // Play workout complete sound
        await SoundFXManager.playWorkoutComplete();
      });

      // Auto-exit after 2.5 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -30,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
      }, 2500);
    }
  }, [visible]);

  if (!visible) return null;

  // Get workout type display info
  const getWorkoutInfo = (type) => {
    const workoutTypes = {
      cardio: { name: 'CARDIO BLAST', color: Colors.state.energy, emoji: '🏃' },
      strength: { name: 'STRENGTH TRAINING', color: Colors.primary.logoYellow, emoji: '💪' },
      yoga: { name: 'YOGA FLOW', color: Colors.state.health, emoji: '🧘' },
      sports: { name: 'SPORTS TRAINING', color: Colors.primary.success, emoji: '⚽' },
    };
    return workoutTypes[type] || { name: 'WORKOUT', color: Colors.primary.success, emoji: '💪' };
  };

  const workoutInfo = getWorkoutInfo(workoutType);

  // Filter out stats that didn't change
  const significantChanges = Object.entries(statChanges).filter(([key, value]) => {
    if (typeof value === 'number') {
      return Math.abs(value) > 0;
    }
    return false;
  });

  return (
    <Animated.View
      style={[
        styles.feedbackContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Workout Type Header */}
      <View style={[styles.workoutHeader, { backgroundColor: workoutInfo.color }]}>
        <Text style={[styles.workoutEmoji]}>{workoutInfo.emoji}</Text>
        <Text style={[styles.workoutTitle, { fontFamily }]}>
          {workoutInfo.name}
        </Text>
        <Text style={[styles.completedText, { fontFamily }]}>COMPLETED!</Text>
      </View>

      {/* Stat Changes */}
      <View style={styles.statsContainer}>
        {significantChanges.map(([statName, change], index) => (
          <StatChangeRow
            key={statName}
            statName={statName}
            change={change}
            fontFamily={fontFamily}
            delay={index * 100}
          />
        ))}

        {/* XP Gain */}
        {xpGained > 0 && (
          <View style={[styles.xpRow, styles.highlighted]}>
            <Text style={[styles.xpLabel, { fontFamily }]}>XP GAINED</Text>
            <Text style={[styles.xpValue, { fontFamily }]}>+{xpGained}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Individual stat change row with animation
const StatChangeRow = ({ statName, change, fontFamily, delay = 0 }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const getStatInfo = (stat) => {
    const statConfig = {
      health: { label: 'HEALTH', color: Colors.state.health, icon: '❤️' },
      strength: { label: 'STRENGTH', color: Colors.primary.logoYellow, icon: '💪' },
      stamina: { label: 'STAMINA', color: Colors.state.energy, icon: '⚡' },
      happiness: { label: 'HAPPINESS', color: Colors.primary.success, icon: '😊' },
      weight: { label: 'WEIGHT', color: Colors.state.energy, icon: '⚖️' },
    };
    return statConfig[stat] || { label: stat.toUpperCase(), color: Colors.primary.black, icon: '📊' };
  };

  const statInfo = getStatInfo(statName);
  const isPositive = change > 0;
  const displayChange = Math.abs(change);

  return (
    <Animated.View
      style={[
        styles.statRow,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Text style={styles.statIcon}>{statInfo.icon}</Text>
      <Text style={[styles.statLabel, { fontFamily, color: statInfo.color }]}>
        {statInfo.label}
      </Text>
      <Text
        style={[
          styles.statChange,
          { fontFamily },
          isPositive ? styles.positiveChange : styles.negativeChange,
        ]}
      >
        {isPositive ? '+' : ''}{displayChange}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    backgroundColor: Colors.primary.black,
    borderWidth: 4,
    borderColor: Colors.primary.logoYellow,
    borderRadius: 8,
    zIndex: 1000,
    ...Effects.cardShadow,
  },

  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },

  workoutEmoji: {
    fontSize: 24,
  },

  workoutTitle: {
    ...Typography.titleMedium,
    color: Colors.primary.black,
    textAlign: 'center',
    flex: 1,
  },

  completedText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 10,
  },

  statsContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  statIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },

  statLabel: {
    ...Typography.labelSmall,
    flex: 1,
    fontSize: 12,
  },

  statChange: {
    ...Typography.labelSmall,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },

  positiveChange: {
    color: Colors.primary.success,
  },

  negativeChange: {
    color: Colors.state.health,
  },

  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.primary.logoYellow,
  },

  highlighted: {
    backgroundColor: Colors.environment.groundDark,
  },

  xpLabel: {
    ...Typography.labelSmall,
    color: Colors.primary.logoYellow,
    fontWeight: 'bold',
  },

  xpValue: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    fontSize: 18,
  },
});

export default WorkoutFeedback;