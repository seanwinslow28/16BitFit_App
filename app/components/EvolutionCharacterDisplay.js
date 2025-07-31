/**
 * Evolution Character Display Component
 * Displays character with evolution-specific visual effects and animations
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/DesignSystem';
import evolutionManager from '../services/CharacterEvolutionSystem';
import spriteManager, { SpriteSheetConfig } from '../services/EvolutionSpriteManager';

const EvolutionCharacterDisplay = ({
  evolutionStage = 0,
  currentAnimation = 'idle',
  size = 200,
  showEffects = true,
  showEquipment = true,
  customization = {},
  onAnimationComplete = () => {},
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationTimer, setAnimationTimer] = useState(null);
  
  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const auraRotate = useRef(new Animated.Value(0)).current;
  const particleFloat = useRef(new Animated.Value(0)).current;
  const equipmentBounce = useRef(new Animated.Value(0)).current;

  // Get evolution data
  const evolution = evolutionManager.getCurrentEvolution();
  const visualEffects = evolutionManager.getVisualEffects();

  // Initialize animations based on evolution stage
  useEffect(() => {
    // Basic breathing animation (all stages)
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05 + (evolutionStage * 0.02),
          duration: 2000 - (evolutionStage * 200),
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000 - (evolutionStage * 200),
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation (stage 1+)
    if (evolutionStage >= 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10 - (evolutionStage * 2),
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Glow pulse (stage 2+)
    if (evolutionStage >= 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.5,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Aura rotation (stage 3+)
    if (evolutionStage >= 3) {
      Animated.loop(
        Animated.timing(auraRotate, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    // Particle effects (stage 4)
    if (evolutionStage >= 4) {
      Animated.loop(
        Animated.timing(particleFloat, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    return () => {
      // Cleanup animations
      breatheAnim.stopAnimation();
      floatAnim.stopAnimation();
      glowPulse.stopAnimation();
      auraRotate.stopAnimation();
      particleFloat.stopAnimation();
    };
  }, [evolutionStage]);

  // Handle sprite animation
  useEffect(() => {
    if (animationTimer) {
      clearInterval(animationTimer);
    }

    const animConfig = spriteManager.getAnimationConfig(evolutionStage, currentAnimation);
    if (!animConfig) return;

    let frameIndex = 0;
    const timer = setInterval(() => {
      setCurrentFrame(animConfig.frames[frameIndex]);
      
      frameIndex++;
      if (frameIndex >= animConfig.frames.length) {
        if (animConfig.loop) {
          frameIndex = 0;
        } else {
          clearInterval(timer);
          onAnimationComplete(currentAnimation);
        }
      }
    }, spriteManager.getFrameDuration(animConfig.frameRate));

    setAnimationTimer(timer);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentAnimation, evolutionStage]);

  // Render evolution-specific effects
  const renderEvolutionEffects = () => {
    const effects = [];

    // Stage 1+: Energy wisps
    if (evolutionStage >= 1 && showEffects) {
      effects.push(
        <Animated.View
          key="energy-wisps"
          style={[
            styles.energyWisps,
            {
              opacity: glowPulse.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        >
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.wisp,
                {
                  left: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.3}s`,
                },
              ]}
            />
          ))}
        </Animated.View>
      );
    }

    // Stage 2+: Power flames
    if (evolutionStage >= 2 && showEffects) {
      effects.push(
        <Animated.View
          key="power-flames"
          style={[
            styles.powerFlames,
            {
              opacity: glowPulse,
              transform: [
                {
                  scale: glowPulse.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              evolution.visualTheme.auraColor,
              'transparent',
            ]}
            style={styles.flameGradient}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
        </Animated.View>
      );
    }

    // Stage 3+: Golden aura
    if (evolutionStage >= 3 && showEffects) {
      effects.push(
        <Animated.View
          key="golden-aura"
          style={[
            styles.goldenAura,
            {
              transform: [
                {
                  rotate: auraRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../assets/effects/aura_ring.png')}
            style={[styles.auraImage, { tintColor: evolution.visualTheme.auraColor }]}
          />
        </Animated.View>
      );
    }

    // Stage 4: Cosmic particles
    if (evolutionStage >= 4 && showEffects) {
      effects.push(
        <View key="cosmic-particles" style={styles.cosmicParticles}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.cosmicParticle,
                {
                  top: particleFloat.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`${80 - i * 10}%`, `${-20 - i * 10}%`],
                  }),
                  left: `${10 + i * 10}%`,
                  opacity: particleFloat.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>
      );
    }

    return effects;
  };

  // Render equipment based on evolution
  const renderEquipment = () => {
    if (!showEquipment) return null;

    const equipment = evolution.equipment;
    const positions = spriteManager.getEquipmentPositions(evolutionStage);

    return (
      <View style={styles.equipmentContainer}>
        {equipment.belt && (
          <View style={[styles.equipment, { 
            bottom: positions.belt.y,
            transform: [{ scale: positions.belt.scale }],
          }]}>
            <Text style={styles.equipmentEmoji}>🥋</Text>
          </View>
        )}
        
        {equipment.accessories?.includes('champion_headband') && (
          <View style={[styles.equipment, {
            top: positions.headband.y,
            transform: [{ scale: positions.headband.scale }],
          }]}>
            <Text style={styles.equipmentEmoji}>🎯</Text>
          </View>
        )}

        {equipment.accessories?.includes('master_crown') && (
          <View style={[styles.equipment, {
            top: positions.crown.y,
            transform: [{ scale: positions.crown.scale }],
          }]}>
            <Text style={styles.equipmentEmoji}>👑</Text>
          </View>
        )}

        {equipment.accessories?.includes('cosmic_wings') && evolutionStage >= 4 && (
          <Animated.View style={[styles.equipment, {
            top: positions.wings.y,
            transform: [
              { scale: positions.wings.scale },
              {
                rotate: auraRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-5deg', '5deg'],
                }),
              },
            ],
          }]}>
            <Text style={styles.equipmentEmoji}>🦋</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const framePosition = spriteManager.getFramePosition(currentFrame);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: breatheAnim },
            { translateY: floatAnim },
          ],
        },
      ]}
    >
      {/* Background glow */}
      {evolutionStage >= 1 && (
        <Animated.View
          style={[
            styles.backgroundGlow,
            {
              backgroundColor: evolution.visualTheme.auraColor,
              opacity: glowPulse.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.1, 0.3],
              }),
              transform: [
                {
                  scale: glowPulse.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [1.2, 1.5],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* Evolution effects (behind character) */}
      {renderEvolutionEffects()}

      {/* Character sprite */}
      <View style={styles.characterSprite}>
        <View style={styles.spriteFrame}>
          {/* Sprite would be rendered here using framePosition */}
          <View style={[styles.spritePlaceholder, {
            backgroundColor: evolution.visualTheme.primary,
          }]}>
            <Text style={styles.characterEmoji}>
              {['🥋', '🥊', '💪', '🏆', '⚡'][evolutionStage]}
            </Text>
          </View>
        </View>
      </View>

      {/* Equipment overlay */}
      {renderEquipment()}

      {/* Evolution badge */}
      <View style={[styles.evolutionBadge, {
        backgroundColor: evolution.visualTheme.primary,
        borderColor: evolution.visualTheme.secondary,
      }]}>
        <Text style={styles.evolutionText}>
          {evolution.displayName}
        </Text>
      </View>

      {/* Power level indicator */}
      {evolutionStage >= 2 && (
        <View style={styles.powerLevel}>
          <Text style={styles.powerLevelText}>
            PWR {Math.round(evolution.powerMultiplier * 100)}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  backgroundGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 100,
  },

  characterSprite: {
    width: '60%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spriteFrame: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  spritePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterEmoji: {
    fontSize: 64,
  },

  equipmentContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  equipment: {
    position: 'absolute',
    alignSelf: 'center',
  },

  equipmentEmoji: {
    fontSize: 24,
  },

  energyWisps: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  wisp: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.logoYellow,
    opacity: 0.6,
  },

  powerFlames: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: '40%',
  },

  flameGradient: {
    width: '100%',
    height: '100%',
  },

  goldenAura: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  auraImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },

  cosmicParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  cosmicParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.logoYellow,
  },

  evolutionBadge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
  },

  evolutionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary.white,
    letterSpacing: 1,
  },

  powerLevel: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.primary.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  powerLevelText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.primary.white,
  },
});

export default EvolutionCharacterDisplay;