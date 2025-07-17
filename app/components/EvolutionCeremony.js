/**
 * Evolution Ceremony Component - Celebration for character evolution
 * Shows animated evolution sequence with visual transformations and rewards
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

const EvolutionCeremony = ({
  visible = false,
  newEvolutionStage = 0,
  previousStage = 0,
  onComplete = () => {},
  fontFamily = 'monospace',
}) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible && newEvolutionStage > previousStage) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      sparkleAnim.setValue(0);
      glowAnim.setValue(0);
      textSlideAnim.setValue(50);

      // Evolution ceremony sequence
      Animated.sequence([
        // Phase 1: Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        
        // Phase 2: Character transformation
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
        
        // Phase 3: Sparkle effects
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        
        // Phase 4: Text reveal
        Animated.parallel([
          Animated.timing(textSlideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto-complete after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 5000);
    }
  }, [visible, newEvolutionStage, previousStage]);

  if (!visible) return null;

  const getEvolutionInfo = (stage) => {
    const evolutionData = {
      0: { 
        name: 'NEWBIE', 
        title: 'The Beginning',
        emoji: '🌱',
        color: Colors.environment.groundDark,
        description: 'Every fitness journey starts with a single step!'
      },
      1: { 
        name: 'TRAINEE', 
        title: 'Building Habits',
        emoji: '🏃',
        color: Colors.state.energy,
        description: 'You\'re developing consistent healthy habits!'
      },
      2: { 
        name: 'FIGHTER', 
        title: 'Strong & Dedicated',
        emoji: '💪',
        color: Colors.primary.logoYellow,
        description: 'Your dedication is paying off with real strength!'
      },
      3: { 
        name: 'CHAMPION', 
        title: 'Peak Performance',
        emoji: '👑',
        color: Colors.primary.success,
        description: 'You\'ve achieved the pinnacle of fitness mastery!'
      },
    };
    return evolutionData[stage] || evolutionData[0];
  };

  const newEvolution = getEvolutionInfo(newEvolutionStage);
  const previousEvolution = getEvolutionInfo(previousStage);

  return (
    <Animated.View
      style={[
        styles.ceremonyContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Background glow effect */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            backgroundColor: newEvolution.color,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            transform: [{
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              })
            }],
          },
        ]}
      />

      {/* Sparkle effects */}
      <Animated.View
        style={[
          styles.sparkleContainer,
          {
            opacity: sparkleAnim,
            transform: [{
              rotate: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }]
          },
        ]}
      >
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.sparkle,
              {
                top: 100 + Math.sin(i * 30 * Math.PI / 180) * 80,
                left: 150 + Math.cos(i * 30 * Math.PI / 180) * 80,
                animationDelay: `${i * 100}ms`,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Character evolution display */}
      <View style={styles.evolutionDisplay}>
        {/* Previous stage */}
        <View style={styles.stageContainer}>
          <Text style={[styles.stageEmoji, { opacity: 0.5 }]}>
            {previousEvolution.emoji}
          </Text>
          <Text style={[styles.stageName, { fontFamily, opacity: 0.5 }]}>
            {previousEvolution.name}
          </Text>
        </View>

        {/* Evolution arrow */}
        <Animated.Text
          style={[
            styles.evolutionArrow,
            {
              transform: [{
                scale: scaleAnim.interpolate({
                  inputRange: [0.5, 1, 1.2],
                  outputRange: [0.5, 1.5, 1],
                })
              }]
            }
          ]}
        >
          ➜
        </Animated.Text>

        {/* New stage */}
        <View style={styles.stageContainer}>
          <Animated.Text
            style={[
              styles.stageEmoji,
              styles.newStageEmoji,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {newEvolution.emoji}
          </Animated.Text>
          <Text style={[styles.stageName, styles.newStageName, { fontFamily, color: newEvolution.color }]}>
            {newEvolution.name}
          </Text>
        </View>
      </View>

      {/* Evolution announcement */}
      <Animated.View
        style={[
          styles.announcementContainer,
          {
            transform: [{ translateY: textSlideAnim }],
          }
        ]}
      >
        <Text style={[styles.evolutionTitle, { fontFamily }]}>
          EVOLUTION COMPLETE!
        </Text>
        <Text style={[styles.evolutionSubtitle, { fontFamily, color: newEvolution.color }]}>
          {newEvolution.title}
        </Text>
        <Text style={[styles.evolutionDescription, { fontFamily }]}>
          {newEvolution.description}
        </Text>

        {/* New abilities unlocked */}
        <View style={styles.rewardsContainer}>
          <Text style={[styles.rewardsTitle, { fontFamily }]}>
            🎁 NEW ABILITIES UNLOCKED 🎁
          </Text>
          <Text style={[styles.rewardText, { fontFamily }]}>
            • Enhanced stat bonuses from workouts
          </Text>
          <Text style={[styles.rewardText, { fontFamily }]}>
            • Stronger battle performance
          </Text>
          <Text style={[styles.rewardText, { fontFamily }]}>
            • New character expressions
          </Text>
          {newEvolutionStage >= 2 && (
            <Text style={[styles.rewardText, { fontFamily }]}>
              • Access to legendary bosses
            </Text>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ceremonyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  glowBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },

  sparkleContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
  },

  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: Colors.primary.logoYellow,
    borderRadius: 4,
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },

  evolutionDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl * 2,
  },

  stageContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },

  stageEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },

  newStageEmoji: {
    textShadowColor: Colors.primary.logoYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  stageName: {
    ...Typography.titleMedium,
    fontSize: 16,
    textAlign: 'center',
  },

  newStageName: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  evolutionArrow: {
    fontSize: 48,
    color: Colors.primary.logoYellow,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  announcementContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  evolutionTitle: {
    ...Typography.titleLarge,
    fontSize: 24,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  evolutionSubtitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  evolutionDescription: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    fontSize: 12,
  },

  rewardsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: Colors.primary.logoYellow,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  rewardsTitle: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 14,
  },

  rewardText: {
    ...Typography.labelSmall,
    color: Colors.primary.success,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontSize: 11,
  },
});

export default EvolutionCeremony;