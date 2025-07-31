/**
 * Archetype Evolution Display Component
 * Shows character evolution with archetype-specific visual themes
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';
import evolutionManager from '../services/CharacterEvolutionSystem';
import spriteManager from '../services/EvolutionSpriteManager';

const { width: screenWidth } = Dimensions.get('window');

const ArchetypeEvolutionDisplay = ({
  archetype = 'balanced',
  evolutionStage = 0,
  size = 200,
  showStats = true,
  showEffects = true,
  animate = true,
  fontFamily = 'monospace',
}) => {
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const auraScale = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Get evolution and archetype data
  const evolution = Object.values(evolutionManager.EvolutionStages)[evolutionStage];
  const archetypeTheme = evolutionManager.getArchetypeEvolutionTheme(archetype);
  const effects = spriteManager.getEvolutionEffects(evolutionStage);

  useEffect(() => {
    if (!animate) return;

    // Floating animation for advanced stages
    if (evolutionStage >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Aura expansion
    if (evolution?.visualTheme.auraColor) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(auraScale, {
            toValue: 1.2,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(auraScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Particle animation
    if (effects.length > 0) {
      Animated.loop(
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [evolutionStage, animate]);

  const getArchetypeColors = () => {
    const baseColors = [
      evolution?.visualTheme.primary || Colors.primary.logoYellow,
      evolution?.visualTheme.secondary || Colors.primary.grey700,
    ];

    // Apply archetype color modifier
    if (archetypeTheme.colorModifier !== 0) {
      // This is a simplified color shift - in production you'd use proper color manipulation
      return baseColors.map(color => {
        if (archetypeTheme.colorModifier > 0) {
          // Shift towards warm colors (red/orange)
          return color;
        } else {
          // Shift towards cool colors (blue/purple)
          return color;
        }
      });
    }

    return baseColors;
  };

  const getArchetypeIcon = () => {
    const icons = {
      balanced: '⚖️',
      powerhouse: '💪',
      speedster: '⚡',
      tank: '🛡️',
      strategist: '🧠',
    };
    return icons[archetype] || '⚖️';
  };

  const getArchetypeTitle = () => {
    const titles = {
      balanced: 'Balanced Fighter',
      powerhouse: 'Power Warrior',
      speedster: 'Speed Demon',
      tank: 'Iron Guardian',
      strategist: 'Tactical Master',
    };
    return titles[archetype] || 'Fighter';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Aura effect */}
      {evolution?.visualTheme.auraColor && showEffects && (
        <Animated.View
          style={[
            styles.aura,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.3, 0.6],
              }),
              transform: [{ scale: auraScale }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              evolution.visualTheme.auraColor + '00',
              evolution.visualTheme.auraColor + '60',
              evolution.visualTheme.auraColor + '00',
            ]}
            style={styles.auraGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      )}

      {/* Character container */}
      <Animated.View
        style={[
          styles.characterContainer,
          {
            transform: [
              { translateY: floatAnim },
              {
                scale: glowAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.95, 1.05],
                }),
              },
            ],
          },
        ]}
      >
        {/* Character sprite placeholder */}
        <LinearGradient
          colors={getArchetypeColors()}
          style={styles.characterSprite}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.characterIcon}>{getArchetypeIcon()}</Text>
        </LinearGradient>

        {/* Equipment overlay */}
        {evolution?.equipment && showEffects && (
          <View style={styles.equipmentContainer}>
            {evolution.equipment.belt && (
              <View style={[styles.equipment, styles.belt]}>
                <Text style={styles.equipmentText}>🥋</Text>
              </View>
            )}
            {evolution.equipment.accessories?.includes('champion_headband') && (
              <View style={[styles.equipment, styles.headband]}>
                <Text style={styles.equipmentText}>🎯</Text>
              </View>
            )}
            {evolution.equipment.accessories?.includes('cosmic_wings') && (
              <View style={[styles.equipment, styles.wings]}>
                <Text style={styles.equipmentText}>🦋</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      {/* Particle effects */}
      {showEffects && effects.length > 0 && (
        <View style={styles.particleContainer}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: evolution?.visualTheme.primary || Colors.primary.logoYellow,
                  opacity: particleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -size * 0.8],
                      }),
                    },
                    {
                      translateX: Math.sin(i * 60 * Math.PI / 180) * 30,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Stats display */}
      {showStats && (
        <View style={styles.statsContainer}>
          <Text style={[styles.archetypeTitle, { fontFamily }]}>
            {getArchetypeTitle()}
          </Text>
          <Text style={[styles.evolutionStage, { fontFamily }]}>
            {evolution?.displayName || 'ROOKIE'}
          </Text>
          <View style={styles.powerBar}>
            <View
              style={[
                styles.powerFill,
                {
                  width: `${(evolution?.powerMultiplier || 1) * 50}%`,
                  backgroundColor: evolution?.visualTheme.primary || Colors.primary.logoYellow,
                },
              ]}
            />
          </View>
          <Text style={[styles.powerText, { fontFamily }]}>
            Power x{evolution?.powerMultiplier || 1.0}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  aura: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 100,
  },

  auraGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },

  characterContainer: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  characterSprite: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  characterIcon: {
    fontSize: 48,
  },

  equipmentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  equipment: {
    position: 'absolute',
  },

  equipmentText: {
    fontSize: 24,
  },

  belt: {
    bottom: '20%',
    left: '50%',
    marginLeft: -12,
  },

  headband: {
    top: '10%',
    left: '50%',
    marginLeft: -12,
  },

  wings: {
    top: '30%',
    left: '50%',
    marginLeft: -12,
    transform: [{ scale: 1.5 }],
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
    bottom: '40%',
    left: '50%',
    marginLeft: -4,
  },

  statsContainer: {
    position: 'absolute',
    bottom: -20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    minWidth: 150,
  },

  archetypeTitle: {
    ...Typography.labelSmall,
    color: Colors.primary.grey300,
    fontSize: 10,
    marginBottom: 2,
  },

  evolutionStage: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },

  powerBar: {
    width: 100,
    height: 4,
    backgroundColor: Colors.primary.grey800,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },

  powerFill: {
    height: '100%',
    borderRadius: 2,
  },

  powerText: {
    ...Typography.labelSmall,
    color: Colors.primary.white,
    fontSize: 10,
  },
});

export default ArchetypeEvolutionDisplay;