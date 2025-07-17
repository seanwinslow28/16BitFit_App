/**
 * Sparkle Effect Animation
 * Positive feedback sparkles
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export const SparkleEffect = ({ onComplete }) => {
  const sparkles = useRef([...Array(5)].map(() => ({
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0.5),
  }))).current;

  useEffect(() => {
    const animations = sparkles.map((sparkle, index) => {
      const angle = (index * 72) * Math.PI / 180; // 72 degrees apart
      const distance = 100;

      return Animated.parallel([
        Animated.timing(sparkle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(sparkle.scale, {
            toValue: 1.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.scale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  return (
    <View style={styles.container}>
      {sparkles.map((sparkle, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.sparkle,
            {
              transform: [
                { translateX: sparkle.translateX },
                { translateY: sparkle.translateY },
                { scale: sparkle.scale },
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    zIndex: 1000,
  },

  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
});