/**
 * Character Arena Component - Enhanced Animation System
 * 400×240px arena with gradient backgrounds, scanline effects, and animated character display
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, DesignUtils } from '../constants/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

const CharacterArena = ({
  characterState = 'idle',
  showEffects = false,
  backgroundType = 'outdoor',
  style = {},
  animationDuration = 800,
}) => {
  // Get responsive arena size
  const arenaSize = DesignUtils.getCharacterArenaSize(screenWidth);
  
  // Animation state management
  const [currentSprite, setCurrentSprite] = useState(characterState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animated values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Character state transition animation
  useEffect(() => {
    if (characterState !== currentSprite) {
      setIsTransitioning(true);
      
      // Fade out current sprite
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration / 3,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        // Change sprite
        setCurrentSprite(characterState);
        
        // Fade in new sprite with entrance animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          getEntranceAnimation(characterState)
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    }
  }, [characterState]);
  
  // Idle animation loop
  useEffect(() => {
    if (!isTransitioning && characterState === 'idle') {
      const idlePulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
      
      Animated.loop(idlePulse).start();
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isTransitioning, characterState]);
  
  // Get entrance animation based on character state
  const getEntranceAnimation = (state) => {
    switch (state) {
      case 'flex':
        return Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]);
      case 'postWorkout':
        return Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        });
      case 'thumbsUp':
        return Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        });
      case 'sad':
        return Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        });
      default:
        return Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        });
    }
  };
  
  // Get sprite source based on character state
  const getSpriteSource = (state) => {
    switch (state) {
      case 'flex':
        return require('../assets/Sprites/Flex_Pose.png');
      case 'eating':
        return require('../assets/Sprites/Over_Eating_Pose.png');
      case 'postWorkout':
        return require('../assets/Sprites/Post_Workout_Pose.png');
      case 'sad':
        return require('../assets/Sprites/Sad_Pose.png');
      case 'thumbsUp':
        return require('../assets/Sprites/Thumbs_Up_Pose.png');
      case 'idle':
      default:
        return require('../assets/Sprites/Idle_Pose.png');
    }
  };

  // Get background gradients based on type
  const getBackgroundGradients = (type) => {
    switch (type) {
      case 'dojo':
        return {
          sky: [Colors.environment.dojoBrown, Colors.environment.groundDark],
          ground: [Colors.environment.groundDark, Colors.primary.black],
        };
      case 'gym':
        return {
          sky: [Colors.state.energy, Colors.state.health],
          ground: [Colors.environment.groundDark, Colors.primary.black],
        };
      case 'night':
        return {
          sky: [Colors.environment.nightPurple, Colors.primary.black],
          ground: [Colors.environment.groundDark, Colors.primary.black],
        };
      case 'outdoor':
      default:
        return {
          sky: [Colors.environment.skyBlue, Colors.environment.skyLight],
          ground: [Colors.environment.dojoBrown, Colors.environment.groundDark],
        };
    }
  };

  const backgrounds = getBackgroundGradients(backgroundType);
  const skyHeight = arenaSize.height * 0.6; // 60% for sky
  const groundHeight = arenaSize.height * 0.4; // 40% for ground

  return (
    <View style={[styles.characterArena, { 
      width: arenaSize.width, 
      height: arenaSize.height 
    }, style]}>
      {/* Sky Background Gradient */}
      <LinearGradient
        colors={backgrounds.sky}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.backgroundSky, { height: skyHeight }]}
      />

      {/* Ground Background Gradient */}
      <LinearGradient
        colors={backgrounds.ground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.backgroundGround, { height: groundHeight }]}
      />

      {/* Scanline Overlay */}
      <View style={styles.scanlineOverlay}>
        <ScanlinePattern />
      </View>

      {/* Character Container */}
      <View style={styles.characterContainer}>
        <Animated.View
          style={[
            styles.animatedCharacter,
            {
              opacity: fadeAnim,
              transform: [
                { scale: pulseAnim },
                { scale: scaleAnim },
                { 
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  })
                },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg'],
                  })
                }
              ],
            }
          ]}
        >
          <Image
            source={getSpriteSource(currentSprite)}
            style={styles.characterSprite}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Effects Container */}
      {showEffects && (
        <View style={styles.effectsContainer}>
          <EffectsLayer characterState={characterState} />
        </View>
      )}
    </View>
  );
};

// Scanline Pattern Component for retro CRT effect
const ScanlinePattern = () => {
  const lines = [];
  const lineCount = 120; // Every 2px for 240px height
  
  for (let i = 0; i < lineCount; i++) {
    lines.push(
      <View
        key={i}
        style={[
          styles.scanline,
          { top: i * 2 } // 2px spacing between lines
        ]}
      />
    );
  }
  
  return <View style={styles.scanlineContainer}>{lines}</View>;
};

// Effects Layer for particles, flashes, etc.
const EffectsLayer = ({ characterState }) => {
  const getEffects = () => {
    switch (characterState) {
      case 'flex':
        return <LevelUpEffect />;
      case 'postWorkout':
        return <SweatParticles />;
      case 'thumbsUp':
        return <SparkleEffect />;
      case 'sad':
        return <DamageEffect />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.effectsLayer}>
      {getEffects()}
    </View>
  );
};

// Individual Effect Components
const LevelUpEffect = () => (
  <View style={[styles.effect, styles.levelUpFlash]}>
    <View style={styles.glowEffect} />
  </View>
);

const SweatParticles = () => (
  <View style={styles.effect}>
    {[...Array(6)].map((_, i) => (
      <View
        key={i}
        style={[
          styles.sweatDrop,
          {
            left: 30 + (i * 15),
            top: 20 + (i * 10),
            animationDelay: `${i * 200}ms`,
          }
        ]}
      />
    ))}
  </View>
);

const SparkleEffect = () => (
  <View style={styles.effect}>
    {[...Array(8)].map((_, i) => (
      <View
        key={i}
        style={[
          styles.sparkle,
          {
            left: 20 + (i * 12),
            top: 15 + ((i % 3) * 25),
            animationDelay: `${i * 150}ms`,
          }
        ]}
      />
    ))}
  </View>
);

const DamageEffect = () => (
  <View style={[styles.effect, styles.damageFlash]} />
);

const styles = StyleSheet.create({
  // Main Arena Container
  characterArena: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary.black,
  },

  // Background Layers
  backgroundSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  backgroundGround: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Scanline Overlay
  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  scanlineContainer: {
    flex: 1,
    position: 'relative',
  },

  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.primary.black,
    opacity: 0.15,
  },

  // Character Container (128×128px centered)
  characterContainer: {
    position: 'absolute',
    width: 128,
    height: 128,
    top: '50%',
    left: '50%',
    marginTop: -64, // Half of height
    marginLeft: -64, // Half of width
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },

  animatedCharacter: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  characterSprite: {
    width: '80%',
    height: '80%',
    // Pixelated rendering would be handled by CSS in web version
  },

  // Effects Container
  effectsContainer: {
    position: 'absolute',
    width: 128,
    height: 128,
    top: '50%',
    left: '50%',
    marginTop: -64,
    marginLeft: -64,
    zIndex: 15,
  },

  effectsLayer: {
    flex: 1,
    position: 'relative',
  },

  // Effect Styles
  effect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  levelUpFlash: {
    backgroundColor: Colors.primary.logoYellow,
    opacity: 0.7,
    borderRadius: 64,
  },

  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    backgroundColor: Colors.primary.logoYellow,
    opacity: 0.3,
    borderRadius: 76,
  },

  sweatDrop: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: Colors.environment.skyBlue,
    borderRadius: 4,
    opacity: 0.8,
  },

  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: Colors.primary.logoYellow,
    borderRadius: 2,
    opacity: 0.9,
  },

  damageFlash: {
    backgroundColor: Colors.state.health,
    opacity: 0.5,
  },
});

export default CharacterArena;