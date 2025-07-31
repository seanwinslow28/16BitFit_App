/**
 * Archetype Character Display
 * Shows character with archetype-specific visuals and animations
 * Integrates with real-time character updates
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';
import { useCharacter } from '../contexts/CharacterContext';
import { useCharacterArchetype } from '../hooks/useCharacterArchetype';
import { SparkleEffect, LevelUpEffect, TapRingEffect } from './animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Archetype visual configurations
const ARCHETYPE_VISUALS = {
  strength: {
    backgroundColor: '#E53935',
    accentColor: '#FF6B6B',
    sprite: '💪',
    aura: {
      color: '#E53935',
      opacity: 0.3,
      pulseSpeed: 2000,
    },
    particles: {
      emoji: '🔥',
      count: 3,
      speed: 3000,
    },
  },
  speed: {
    backgroundColor: '#2C76C8',
    accentColor: '#5C94FC',
    sprite: '⚡',
    aura: {
      color: '#5C94FC',
      opacity: 0.3,
      pulseSpeed: 1000,
    },
    particles: {
      emoji: '💨',
      count: 5,
      speed: 1500,
    },
  },
  balanced: {
    backgroundColor: '#92CC41',
    accentColor: '#B8E986',
    sprite: '⚖️',
    aura: {
      color: '#92CC41',
      opacity: 0.3,
      pulseSpeed: 1500,
    },
    particles: {
      emoji: '✨',
      count: 4,
      speed: 2000,
    },
  },
};

const ArchetypeCharacterDisplay = ({ 
  size = 120, 
  showStats = true,
  showAura = true,
  onPress,
}) => {
  const { characterStats, characterArchetype, characterName } = useCharacter();
  const { archetype, animations } = useCharacterArchetype();
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const auraAnim = useRef(new Animated.Value(0.8)).current;
  const particleAnims = useRef(
    Array(5).fill(null).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Get visual config for current archetype
  const visualConfig = ARCHETYPE_VISUALS[archetype] || ARCHETYPE_VISUALS.balanced;

  // Idle animation
  useEffect(() => {
    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    idleAnimation.start();

    return () => idleAnimation.stop();
  }, []);

  // Aura pulse animation
  useEffect(() => {
    if (!showAura) return;

    const auraAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, {
          toValue: 1.2,
          duration: visualConfig.aura.pulseSpeed / 2,
          useNativeDriver: true,
        }),
        Animated.timing(auraAnim, {
          toValue: 0.8,
          duration: visualConfig.aura.pulseSpeed / 2,
          useNativeDriver: true,
        }),
      ])
    );
    auraAnimation.start();

    return () => auraAnimation.stop();
  }, [archetype, showAura]);

  // Particle animation
  useEffect(() => {
    if (!showAura) return;

    const particleAnimations = particleAnims.map((anim, index) => {
      const delay = index * (visualConfig.particles.speed / visualConfig.particles.count);
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: -size,
              duration: visualConfig.particles.speed,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: (Math.random() - 0.5) * size,
              duration: visualConfig.particles.speed,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(anim.y, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    particleAnimations.forEach(anim => anim.start());

    return () => particleAnimations.forEach(anim => anim.stop());
  }, [archetype, showAura, size]);

  // Handle character press
  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {/* Aura Effect */}
      {showAura && (
        <Animated.View
          style={[
            styles.aura,
            {
              width: size * 1.4,
              height: size * 1.4,
              backgroundColor: visualConfig.aura.color,
              opacity: visualConfig.aura.opacity,
              transform: [{ scale: auraAnim }],
            },
          ]}
        />
      )}

      {/* Character Container */}
      <Animated.View
        style={[
          styles.characterContainer,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable onPress={handlePress} style={styles.characterPressable}>
          <LinearGradient
            colors={[visualConfig.backgroundColor, visualConfig.accentColor]}
            style={[styles.characterGradient, { borderRadius: size / 2 }]}
          >
            <Text style={[styles.characterSprite, { fontSize: size * 0.6 }]}>
              {visualConfig.sprite}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Particles */}
      {showAura && particleAnims.slice(0, visualConfig.particles.count).map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: anim.opacity,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
              ],
            },
          ]}
        >
          <Text style={styles.particleEmoji}>
            {visualConfig.particles.emoji}
          </Text>
        </Animated.View>
      ))}

      {/* Character Name */}
      {characterName && (
        <View style={styles.nameContainer}>
          <Text style={styles.characterNameText}>
            {characterName.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      {showStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>LVL</Text>
            <Text style={styles.statValue}>{characterStats.level}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>HP</Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statFill,
                  { 
                    width: `${characterStats.health}%`,
                    backgroundColor: Colors.state.health,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    borderRadius: 999,
    top: '50%',
    left: '50%',
    marginLeft: -70,
    marginTop: -70,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  characterPressable: {
    width: '100%',
    height: '100%',
  },
  characterGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary.black,
    ...Effects.cardShadow,
  },
  characterSprite: {
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    marginLeft: -10,
  },
  particleEmoji: {
    fontSize: 20,
  },
  nameContainer: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: Colors.primary.black,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  characterNameText: {
    ...Typography.labelSmall,
    color: Colors.primary.logoYellow,
  },
  statsContainer: {
    position: 'absolute',
    top: -40,
    width: '100%',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.microCopy,
    color: Colors.white,
    marginRight: Spacing.xs,
    width: 30,
  },
  statValue: {
    ...Typography.microCopy,
    color: Colors.primary.logoYellow,
    fontWeight: 'bold',
  },
  statBar: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ArchetypeCharacterDisplay;