/**
 * Nutrition Feedback Component - Visual stat change display
 * Shows animated stat increases/decreases and XP gains after meals
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

const NutritionFeedback = ({
  visible = false,
  statChanges = {},
  mealType = '',
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
      ]).start();

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

  // Get meal type display info
  const getMealInfo = (type) => {
    const mealTypes = {
      healthy: { 
        name: 'HEALTHY MEAL', 
        color: Colors.state.health, 
        emoji: '🥗',
        message: 'Great choice!'
      },
      protein: { 
        name: 'PROTEIN POWER', 
        color: Colors.primary.logoYellow, 
        emoji: '🍗',
        message: 'Muscle fuel!'
      },
      junk: { 
        name: 'JUNK FOOD', 
        color: Colors.state.damage || '#FF6B6B', 
        emoji: '🍔',
        message: 'Not ideal...'
      },
      hydration: { 
        name: 'HYDRATION', 
        color: Colors.environment.skyBlue, 
        emoji: '💧',
        message: 'Stay hydrated!'
      },
    };
    return mealTypes[type] || { 
      name: 'MEAL', 
      color: Colors.primary.success, 
      emoji: '🍽️',
      message: 'Consumed!'
    };
  };

  const mealInfo = getMealInfo(mealType);
  const isHealthyChoice = mealType !== 'junk';

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
        isHealthyChoice ? styles.healthyBorder : styles.unhealthyBorder,
      ]}
    >
      {/* Meal Type Header */}
      <View style={[styles.mealHeader, { backgroundColor: mealInfo.color }]}>
        <Text style={[styles.mealEmoji]}>{mealInfo.emoji}</Text>
        <View style={styles.mealTitleContainer}>
          <Text style={[styles.mealTitle, { fontFamily }]}>
            {mealInfo.name}
          </Text>
          <Text style={[styles.mealMessage, { fontFamily }]}>
            {mealInfo.message}
          </Text>
        </View>
      </View>

      {/* Stat Changes */}
      <View style={styles.statsContainer}>
        {significantChanges.map(([statName, change], index) => (
          <NutritionStatRow
            key={statName}
            statName={statName}
            change={change}
            fontFamily={fontFamily}
            delay={index * 100}
          />
        ))}

        {/* XP Gain */}
        {xpGained > 0 && (
          <View style={[styles.xpRow, isHealthyChoice ? styles.highlightedGood : styles.highlightedPoor]}>
            <Text style={[styles.xpLabel, { fontFamily }]}>XP GAINED</Text>
            <Text style={[styles.xpValue, { fontFamily, color: isHealthyChoice ? Colors.primary.logoYellow : Colors.environment.groundDark }]}>
              +{xpGained}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Individual stat change row with animation
const NutritionStatRow = ({ statName, change, fontFamily, delay = 0 }) => {
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

  // Special handling for weight (positive change is actually negative for fitness)
  const isGoodChange = statName === 'weight' ? change < 0 : change > 0;

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
          isGoodChange ? styles.positiveChange : styles.negativeChange,
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
    borderRadius: 8,
    zIndex: 1000,
    ...Effects.cardShadow,
  },

  healthyBorder: {
    borderColor: Colors.state.health,
  },

  unhealthyBorder: {
    borderColor: '#FF6B6B',
  },

  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  mealEmoji: {
    fontSize: 32,
  },

  mealTitleContainer: {
    flex: 1,
  },

  mealTitle: {
    ...Typography.titleMedium,
    color: Colors.primary.black,
    textAlign: 'left',
  },

  mealMessage: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 10,
    marginTop: 2,
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
    color: '#FF6B6B',
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

  highlightedGood: {
    backgroundColor: Colors.environment.groundDark,
  },

  highlightedPoor: {
    backgroundColor: '#2A1A1A',
  },

  xpLabel: {
    ...Typography.labelSmall,
    color: Colors.primary.logoYellow,
    fontWeight: 'bold',
  },

  xpValue: {
    ...Typography.titleMedium,
    fontSize: 18,
  },
});

export default NutritionFeedback;