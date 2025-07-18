/**
 * Circular Character Arena Component
 * GameBoy-style circular arena with character, power ring, and effects
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PowerRing from './PowerRing';
import { pixelFont } from '../hooks/useFonts';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  glowGreen: 'rgba(155, 188, 15, 0.4)',
};

const CircularCharacterArena = ({
  characterSprite,
  characterName = 'NINJA WARRIOR',
  level = 1,
  progress = 0.75,
  onCharacterTap = () => {},
  showEffects = true,
  size = 360,
  isBlinking = false,
}) => {
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Character floating animation
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

    // Pulse animation for glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow intensity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Blinking animation effect
  useEffect(() => {
    if (isBlinking) {
      // Create rapid blinking effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 } // Blink 3 times
      ).start();
    } else {
      // Reset to fully visible
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isBlinking]);

  // Helper function to get character sprite
  const getCharacterSprite = () => {
    if (characterSprite) return characterSprite;
    
    // Default sprites based on level/evolution
    const defaultSprites = {
      1: require('../assets/Sprites/Idle_Pose.png'),
      2: require('../assets/Sprites/Flex_Pose.png'),
      3: require('../assets/Sprites/Thumbs_Up_Pose.png'),
      4: require('../assets/Sprites/Post_Workout_Pose.png'),
    };
    
    const spriteIndex = Math.min(Math.ceil(level / 5), 4);
    return defaultSprites[spriteIndex] || defaultSprites[1];
  };

  return (
    <View style={[styles.arenaContainer, { width: size, height: size }]}>
      {/* Main arena circle */}
      <View style={[styles.arena, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Inner gradient overlay */}
        <LinearGradient
          colors={[COLORS.glowGreen, 'rgba(155, 188, 15, 0.1)', 'transparent']}
          style={[styles.innerGradient, { borderRadius: size / 2 }]}
        />

        {/* Power Ring */}
        <PowerRing 
          size={size}
          progress={progress}
          strokeWidth={6}
        />

        {/* Character Container */}
        <TouchableOpacity 
          onPress={onCharacterTap}
          style={styles.characterContainer}
          activeOpacity={0.9}
        >
          <Animated.View 
            style={[
              styles.characterWrapper,
              { transform: [{ translateY: floatAnim }] }
            ]}
          >
            {/* Character Sprite */}
            <Animated.Image 
              source={characterSprite || getCharacterSprite()}
              style={[
                styles.characterSprite,
                {
                  opacity: isBlinking ? blinkAnim : 1,
                }
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, pixelFont]}>LV.{level}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  arenaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },

  outerGlow: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },

  arena: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 12,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 20,
  },

  innerGradient: {
    position: 'absolute',
    width: '85%',
    height: '85%',
  },

  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterSprite: {
    width: 220,
    height: 220,
  },

  levelBadge: {
    position: 'absolute',
    bottom: -24,
    right: -24,
    backgroundColor: COLORS.yellow,
    borderWidth: 6,
    borderColor: COLORS.dark,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 15,
  },

  levelText: {
    fontSize: 16,
    color: COLORS.dark,
    letterSpacing: 2,
  },

  nameBadge: {
    marginTop: 28,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 5,
    borderColor: COLORS.dark,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },

  nameText: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  statusEffects: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  statusEffect: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  statusIcon: {
    fontSize: 20,
  },
});

export default CircularCharacterArena;