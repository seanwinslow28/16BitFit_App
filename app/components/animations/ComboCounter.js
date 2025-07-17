/**
 * Combo Counter Animation
 * Shows consecutive positive actions
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { pixelFont } from '../../hooks/useFonts';

export const ComboCounter = ({ combo, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce effect
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 2 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [combo]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <View style={styles.comboBox}>
        <Text style={[styles.comboText, pixelFont]}>COMBO</Text>
        <Text style={[styles.comboNumber, pixelFont]}>x{combo}</Text>
      </View>
      {combo >= 5 && <Text style={styles.fireEmoji}>🔥</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -50,
    alignItems: 'center',
    zIndex: 1000,
  },

  comboBox: {
    backgroundColor: '#F7D51D',
    borderWidth: 3,
    borderColor: '#0D0D0D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 8,
  },

  comboText: {
    fontSize: 10,
    color: '#0D0D0D',
    letterSpacing: 1,
  },

  comboNumber: {
    fontSize: 20,
    color: '#0D0D0D',
    letterSpacing: 2,
    marginTop: 2,
  },

  fireEmoji: {
    position: 'absolute',
    top: -15,
    right: -10,
    fontSize: 24,
  },
});