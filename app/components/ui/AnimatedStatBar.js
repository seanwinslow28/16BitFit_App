/**
 * AnimatedStatBar Component
 * Implements the Style Guide stat bar with animated fill and particle effects
 * Features 300-400ms animation with pixelated energy particles
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StyleGuideComponents } from '../../constants/StyleGuideComponents';
import { Animations, Colors, Spacing } from '../../constants/DesignSystem';

const PARTICLE_COUNT = 5;

const AnimatedStatBar = ({
  label,
  value,
  maxValue = 100,
  color,
  showParticles = true,
  onAnimationComplete,
  style,
}) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);

  useEffect(() => {
    if (value > 0) {
      animateFill();
    }
  }, [value]);

  const animateFill = () => {
    setIsAnimating(true);

    // Create particles if enabled
    if (showParticles) {
      createParticles();
    }

    // Animate the fill bar
    Animated.sequence([
      Animated.timing(fillAnim, {
        toValue: percentage,
        duration: Animations.statBarFill.duration,
        useNativeDriver: false,
      }),
      // Flash effect at completion
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: Animations.statBarFill.flashDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: Animations.statBarFill.flashDuration / 2,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
    });
  };

  const createParticles = () => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }));

    setParticles(newParticles);

    // Animate particles flowing to the bar
    newParticles.forEach((particle, index) => {
      const delay = index * 50;
      const endX = 50 + (index * 30);
      const curveY = -20 - (Math.random() * 20);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.x, {
            toValue: endX,
            duration: Animations.statBarFill.particleDuration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particle.y, {
            toValue: curveY,
            duration: Animations.statBarFill.particleDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: 0,
            duration: Animations.statBarFill.particleDuration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay + Animations.statBarFill.particleDuration - 200),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, Animations.statBarFill.particleDuration + 200);
  };

  const interpolatedWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, StyleGuideComponents.StatBar.label]}>
        {label}
      </Text>
      
      <View style={[styles.barContainer, StyleGuideComponents.StatBar.container]}>
        <Animated.View 
          style={[
            styles.fill,
            StyleGuideComponents.StatBar.fill,
            { 
              width: interpolatedWidth,
              backgroundColor: color || StyleGuideComponents.StatBar.fill.backgroundColor,
            },
          ]} 
        />
        
        {/* Flash overlay */}
        <Animated.View 
          style={[
            styles.flashOverlay,
            { opacity: flashOpacity },
          ]} 
        />

        {/* Pixelated particles */}
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                backgroundColor: color || Colors.shell.accentBlue,
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                ],
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.value, StyleGuideComponents.StatBar.value]}>
        {Math.round(value)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    minWidth: 80,
  },
  barContainer: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    position: 'relative',
  },
  fill: {
    // Styles come from StyleGuideComponents
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    left: -20,
    top: '50%',
    marginTop: -2,
  },
  value: {
    minWidth: 40,
  },
});

export default AnimatedStatBar;