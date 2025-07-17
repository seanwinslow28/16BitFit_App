/**
 * Level Up Effect Animation
 * Displays when character levels up
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { pixelFont } from '../../hooks/useFonts';

export const LevelUpEffect = ({ onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { rotate: spin }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.text, pixelFont]}>LEVEL UP!</Text>
      <View style={styles.burstContainer}>
        <Text style={styles.burst}>✨</Text>
        <Text style={[styles.burst, styles.burst2]}>⭐</Text>
        <Text style={[styles.burst, styles.burst3]}>✨</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  text: {
    fontSize: 24,
    color: '#F7D51D',
    textShadowColor: '#0D0D0D',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },

  burstContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  burst: {
    position: 'absolute',
    fontSize: 40,
  },

  burst2: {
    transform: [{ translateX: 50 }, { translateY: -50 }],
  },

  burst3: {
    transform: [{ translateX: -50 }, { translateY: 50 }],
  },
});