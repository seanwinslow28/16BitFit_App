/**
 * Enhanced Character Arena Component - New Homepage Design
 * Larger character display with glow effects, power ring, and floating animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';
import PowerRing from './PowerRing';
import { LevelUpEffect, SparkleEffect, DamageEffect, ComboCounter, TapRingEffect } from './AnimationEffects';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedCharacterArena = ({
  characterState = 'idle',
  evolutionStage = 1,
  level = 1,
  xp = 0,
  xpToNext = 100,
  health = 100,
  stamina = 100,
  showEffects = {},
  onCharacterTap = () => {},
  fontFamily = 'monospace',
  style = {},
}) => {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animated values for character
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;
  const spriteScaleAnim = useRef(new Animated.Value(1)).current;
  const spriteRotateAnim = useRef(new Animated.Value(0)).current;

  // Continuous floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Glow pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Character state change animation
  useEffect(() => {
    if (characterState !== 'idle') {
      setIsAnimating(true);
      
      // Character reaction animation
      const stateAnimation = getStateAnimation(characterState);
      
      Animated.sequence([
        stateAnimation,
        // Return to idle
        Animated.parallel([
          Animated.timing(spriteScaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(spriteRotateAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setIsAnimating(false);
      });
    }
  }, [characterState]);

  const getStateAnimation = (state) => {
    switch (state) {
      case 'flex':
      case 'postWorkout':
        return Animated.parallel([
          Animated.timing(spriteScaleAnim, {
            toValue: 1.15,
            duration: 400,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);
      
      case 'eating':
        return Animated.sequence([
          Animated.timing(spriteScaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(spriteRotateAnim, {
            toValue: 0.1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);
      
      case 'sad':
      case 'overEating':
        return Animated.parallel([
          Animated.timing(spriteScaleAnim, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(spriteRotateAnim, {
            toValue: -0.1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);
      
      default:
        return Animated.timing(spriteScaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        });
    }
  };

  const getSpriteImage = () => {
    const spriteMap = {
      idle: require('../assets/Sprites/Idle_Pose.png'),
      flex: require('../assets/Sprites/Flex_Pose.png'),
      postWorkout: require('../assets/Sprites/Post_Workout_Pose.png'),
      eating: require('../assets/Sprites/Thumbs_Up_Pose.png'),
      overEating: require('../assets/Sprites/Over_Eating_Pose.png'),
      sad: require('../assets/Sprites/Sad_Pose.png'),
      thumbsUp: require('../assets/Sprites/Thumbs_Up_Pose.png'),
    };
    
    return spriteMap[characterState] || spriteMap.idle;
  };

  const getEvolutionStageColor = () => {
    const colors = [
      Colors.environment.groundDark, // Newbie
      Colors.state.energy,           // Trainee
      Colors.primary.logoYellow,     // Fighter
      Colors.primary.success,        // Champion
    ];
    return colors[evolutionStage] || colors[0];
  };

  const getEvolutionStageName = () => {
    const names = ['NEWBIE', 'TRAINEE', 'FIGHTER', 'CHAMPION'];
    return names[evolutionStage] || 'NEWBIE';
  };

  const xpProgress = xpToNext > 0 ? xp / xpToNext : 0;

  const handleCharacterTap = () => {
    onCharacterTap();
    
    // Quick bounce animation on tap
    Animated.sequence([
      Animated.timing(spriteScaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(spriteScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={[
        'rgba(155, 188, 15, 0.25)',
        'rgba(155, 188, 15, 0.15)',
        'rgba(155, 188, 15, 0.25)'
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {/* Scanline overlay effect */}
      <View style={styles.scanlineOverlay} />
      
      {/* Character display area */}
      <View style={styles.characterDisplay}>
        {/* Avatar glow effect */}
        <Animated.View 
          style={[
            styles.avatarGlow,
            {
              transform: [{ scale: glowAnim }],
              backgroundColor: `${getEvolutionStageColor()}40`,
            }
          ]}
        />

        {/* Power Ring */}
        <PowerRing 
          progress={xpProgress}
          size={240}
          strokeWidth={4}
          animate={true}
          glowIntensity={0.6}
        />

        {/* Character sprite container */}
        <TouchableOpacity
          style={styles.spriteContainer}
          onPress={handleCharacterTap}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.characterSprite,
              {
                transform: [
                  { translateY: floatAnim },
                  { scale: Animated.multiply(pulseAnim, spriteScaleAnim) },
                  { 
                    rotate: spriteRotateAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-5deg', '5deg'],
                    })
                  },
                ],
              },
            ]}
          >
            {/* Inner glow effect */}
            <LinearGradient
              colors={[
                `${getEvolutionStageColor()}60`,
                `${getEvolutionStageColor()}20`,
                'transparent'
              ]}
              style={styles.innerGlow}
            />
            
            {/* Character sprite */}
            <Image
              source={getSpriteImage()}
              style={styles.sprite}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Level badge */}
        <TouchableOpacity 
          style={[styles.levelBadge, { borderColor: getEvolutionStageColor() }]}
          onPress={() => onCharacterTap()}
        >
          <Text style={[styles.levelText, { fontFamily }]}>
            LV.{level}
          </Text>
        </TouchableOpacity>

        {/* Character name and evolution stage */}
        <View style={styles.characterInfo}>
          <Text style={[styles.evolutionText, { fontFamily, color: getEvolutionStageColor() }]}>
            {getEvolutionStageName()}
          </Text>
        </View>

        {/* Status effects display */}
        <View style={styles.statusEffects}>
          {health < 30 && (
            <View style={styles.statusEffect}>
              <Text style={styles.statusIcon}>⚠️</Text>
            </View>
          )}
          {stamina < 30 && (
            <View style={styles.statusEffect}>
              <Text style={styles.statusIcon}>😴</Text>
            </View>
          )}
          {evolutionStage >= 2 && (
            <View style={styles.statusEffect}>
              <Text style={styles.statusIcon}>⚔️</Text>
            </View>
          )}
        </View>

        {/* Animation effects */}
        {showEffects.levelUp && <LevelUpEffect fontFamily={fontFamily} />}
        {showEffects.damage && <DamageEffect fontFamily={fontFamily} />}
        {showEffects.sparkle && <SparkleEffect />}
        {showEffects.tapRing && <TapRingEffect />}
        {showEffects.combo && showEffects.comboCount > 0 && (
          <ComboCounter combo={showEffects.comboCount} fontFamily={fontFamily} />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    margin: 8,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    borderRadius: 8,
    overflow: 'hidden',
  },

  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    backgroundColor: 'transparent',
    // Note: In a real implementation, you could add repeating line patterns here
  },

  characterDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  avatarGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },

  spriteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterSprite: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 4,
    borderColor: Colors.primary.black,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  innerGlow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 16,
  },

  sprite: {
    width: 120,
    height: 120,
    zIndex: 3,
  },

  levelBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.primary.logoYellow,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
  },

  levelText: {
    ...Typography.titleMedium,
    fontSize: 10,
    color: Colors.primary.black,
    letterSpacing: 1,
  },

  characterInfo: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  evolutionText: {
    ...Typography.titleMedium,
    fontSize: 9,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  statusEffects: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
  },

  statusEffect: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1,
    borderColor: Colors.primary.black,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  statusIcon: {
    fontSize: 12,
  },
});

export default EnhancedCharacterArena;