/**
 * Animation Effects Components - Visual feedback for user interactions
 * Level up, sparkles, damage, combo counters, and tap rings
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography } from '../constants/DesignSystem';

// Level Up Effect
export const LevelUpEffect = ({ fontFamily = 'monospace' }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 2,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.levelUpContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.levelUpText, { fontFamily }]}>LEVEL UP!</Text>
      <Text style={styles.levelUpBurst}>✨</Text>
    </Animated.View>
  );
};

// Sparkle Effect
export const SparkleEffect = () => {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    translateY: useRef(new Animated.Value(20)).current,
    opacity: useRef(new Animated.Value(1)).current,
    scale: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    sparkles.forEach((sparkle, index) => {
      const delay = index * 100; // Stagger animations
      
      Animated.parallel([
        Animated.timing(sparkle.translateY, {
          toValue: -60,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle.opacity, {
          toValue: 0,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(sparkle.scale, {
            toValue: 1.5,
            duration: 200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.scale, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(sparkle.rotate, {
          toValue: 1,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {sparkles.map((sparkle, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.sparkle,
            {
              left: `${15 + (index * 15)}%`,
              transform: [
                { translateY: sparkle.translateY },
                { scale: sparkle.scale },
                {
                  rotate: sparkle.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: sparkle.opacity,
            },
          ]}
        >
          ✨
        </Animated.Text>
      ))}
    </View>
  );
};

// Damage Effect
export const DamageEffect = ({ fontFamily = 'monospace' }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.damageContainer,
        {
          transform: [
            { translateX: shakeAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.damageText, { fontFamily }]}>OUCH!</Text>
      <Text style={styles.damageIcon}>💥</Text>
    </Animated.View>
  );
};

// Combo Counter
export const ComboCounter = ({ combo = 0, fontFamily = 'monospace' }) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto fade out after 2 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1700);

    return () => clearTimeout(timer);
  }, [combo]);

  return (
    <Animated.View
      style={[
        styles.comboContainer,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.comboText, { fontFamily }]}>
        {combo}x COMBO!
      </Text>
      <Text style={styles.comboIcon}>🔥</Text>
    </Animated.View>
  );
};

// Tap Ring Effect
export const TapRingEffect = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 3,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.tapRing,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  // Level Up Effect
  levelUpContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpText: {
    ...Typography.titleLarge,
    fontSize: 20,
    color: Colors.primary.logoYellow,
    textShadowColor: Colors.primary.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  levelUpBurst: {
    position: 'absolute',
    fontSize: 80,
    zIndex: -1,
  },

  // Sparkle Effect
  sparkle: {
    position: 'absolute',
    bottom: 100,
    fontSize: 24,
    zIndex: 10,
  },

  // Damage Effect
  damageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  damageText: {
    ...Typography.titleMedium,
    fontSize: 18,
    color: Colors.state.health,
    textShadowColor: Colors.primary.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 1,
  },
  damageIcon: {
    position: 'absolute',
    fontSize: 60,
    zIndex: -1,
  },

  // Combo Counter
  comboContainer: {
    position: 'absolute',
    top: -80,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: Colors.primary.logoYellow,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  comboText: {
    ...Typography.titleMedium,
    fontSize: 14,
    color: Colors.primary.logoYellow,
    letterSpacing: 1,
  },
  comboIcon: {
    position: 'absolute',
    right: -10,
    top: -5,
    fontSize: 20,
  },

  // Tap Ring Effect
  tapRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Colors.primary.logoYellow,
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default {
  LevelUpEffect,
  SparkleEffect,
  DamageEffect,
  ComboCounter,
  TapRingEffect,
};