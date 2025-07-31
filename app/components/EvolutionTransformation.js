/**
 * Evolution Transformation Component
 * Handles the visual transformation animation between evolution stages
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';
import { EvolutionStages } from '../services/CharacterEvolutionSystem';
import spriteManager from '../services/EvolutionSpriteManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EvolutionTransformation = ({
  visible = false,
  fromStage = 0,
  toStage = 1,
  onComplete = () => {},
  fontFamily = 'monospace',
}) => {
  // Core animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;
  
  // Energy effects
  const energyPulse = useRef(new Animated.Value(0)).current;
  const lightBeamAnim = useRef(new Animated.Value(0)).current;
  const shockwaveAnim = useRef(new Animated.Value(0)).current;
  
  // Character transformation
  const characterOpacity = useRef(new Animated.Value(1)).current;
  const characterScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      runTransformationSequence();
    }
  }, [visible, fromStage, toStage]);

  const runTransformationSequence = () => {
    const fromEvolution = EvolutionStages[Object.keys(EvolutionStages)[fromStage]];
    const toEvolution = EvolutionStages[Object.keys(EvolutionStages)[toStage]];

    // Reset all animations
    resetAnimations();

    // Transformation sequence
    Animated.sequence([
      // Phase 1: Build up energy (1s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(energyPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]),

      // Phase 2: Light explosion (0.5s)
      Animated.parallel([
        Animated.timing(lightBeamAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(characterOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      // Phase 3: Transformation (1s)
      Animated.parallel([
        Animated.timing(morphAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Reveal new form (0.8s)
      Animated.parallel([
        Animated.timing(characterOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(characterScale, {
          toValue: 1.2,
          duration: 400,
          easing: Easing.back(2),
          useNativeDriver: true,
        }),
        Animated.timing(shockwaveAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // Phase 5: Settle (0.5s)
      Animated.parallel([
        Animated.timing(characterScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Hold for 1 second then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 1000);
    });
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    rotateAnim.setValue(0);
    glowAnim.setValue(0);
    particleAnim.setValue(0);
    morphAnim.setValue(0);
    energyPulse.setValue(0);
    lightBeamAnim.setValue(0);
    shockwaveAnim.setValue(0);
    characterOpacity.setValue(1);
    characterScale.setValue(1);
  };

  if (!visible) return null;

  const fromEvolution = EvolutionStages[Object.keys(EvolutionStages)[fromStage]];
  const toEvolution = EvolutionStages[Object.keys(EvolutionStages)[toStage]];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Background blur */}
      <BlurView intensity={80} style={styles.blurBackground} />

      {/* Energy field */}
      <Animated.View
        style={[
          styles.energyField,
          {
            opacity: energyPulse,
            transform: [
              {
                scale: energyPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.5],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            toEvolution.visualTheme.primary,
            toEvolution.visualTheme.secondary,
            'transparent',
          ]}
          style={styles.energyGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Light beams */}
      <Animated.View
        style={[
          styles.lightBeamContainer,
          {
            opacity: lightBeamAnim,
            transform: [
              {
                scale: lightBeamAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 3],
                }),
              },
            ],
          },
        ]}
      >
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.lightBeam,
              {
                transform: [
                  { rotate: `${i * 45}deg` },
                ],
                backgroundColor: toEvolution.visualTheme.primary,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Character transformation */}
      <Animated.View
        style={[
          styles.characterContainer,
          {
            opacity: characterOpacity,
            transform: [
              { scale: characterScale },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Character sprite would go here */}
        <View style={[styles.characterPlaceholder, {
          backgroundColor: morphAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [fromEvolution.visualTheme.primary, toEvolution.visualTheme.primary],
          }),
        }]}>
          <Text style={styles.evolutionIcon}>
            {morphAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ['👤', '⚡', '👑'],
            })}
          </Text>
        </View>
      </Animated.View>

      {/* Particle effects */}
      <Animated.View
        style={[
          styles.particleContainer,
          {
            opacity: particleAnim,
          },
        ]}
      >
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * screenWidth,
                top: Math.random() * screenHeight,
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100 - Math.random() * 200],
                    }),
                  },
                  {
                    scale: particleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.5, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Shockwave */}
      <Animated.View
        style={[
          styles.shockwave,
          {
            opacity: shockwaveAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.5, 0],
            }),
            transform: [
              {
                scale: shockwaveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 3],
                }),
              },
            ],
            borderColor: toEvolution.visualTheme.primary,
          },
        ]}
      />

      {/* Evolution text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: morphAnim,
            transform: [
              {
                translateY: morphAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.evolutionTitle, { fontFamily }]}>
          EVOLUTION!
        </Text>
        <Text style={[styles.stageName, { fontFamily, color: toEvolution.visualTheme.primary }]}>
          {toEvolution.displayName}
        </Text>
        <Text style={[styles.stageDescription, { fontFamily }]}>
          {toEvolution.description}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  energyField: {
    position: 'absolute',
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: screenWidth * 0.4,
  },

  energyGradient: {
    width: '100%',
    height: '100%',
    borderRadius: screenWidth * 0.4,
  },

  lightBeamContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lightBeam: {
    position: 'absolute',
    width: 4,
    height: 300,
    opacity: 0.8,
  },

  characterContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  evolutionIcon: {
    fontSize: 48,
  },

  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.logoYellow,
  },

  shockwave: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
  },

  textContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  evolutionTitle: {
    ...Typography.titleLarge,
    fontSize: 32,
    color: Colors.primary.logoYellow,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: Spacing.sm,
  },

  stageName: {
    ...Typography.titleMedium,
    fontSize: 24,
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  stageDescription: {
    ...Typography.labelMedium,
    color: Colors.primary.white,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default EvolutionTransformation;