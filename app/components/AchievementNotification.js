/**
 * Achievement Notification Component
 * Displays achievement unlocks with GameBoy-style animations
 * Following MetaSystemsAgent patterns for visual feedback
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
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  white: '#FFFFFF',
};

const AchievementNotification = ({ 
  visible, 
  achievement, 
  onComplete = () => {} 
}) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Sparkle animations
  const sparkleAnims = useRef(
    Array(8).fill(0).map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible && achievement) {
      // Start entrance animation
      Animated.parallel([
        // Slide in from top
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(async () => {
        // Play achievement unlock sound
        if (achievement.points >= 100) {
          await SoundFXManager.playEvolution();
        } else {
          await SoundFXManager.playAchievementUnlock();
        }
      });

      // Trophy rotation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 0.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -0.05,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate sparkles
      sparkleAnims.forEach((sparkle, index) => {
        const angle = (index / sparkleAnims.length) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            // Scale up
            Animated.spring(sparkle.scale, {
              toValue: 1 + Math.random() * 0.5,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
            // Fade in
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            // Move outward
            Animated.timing(sparkle.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          // Fade out
          Animated.timing(sparkle.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  if (!visible || !achievement) return null;

  const isSpecial = achievement.points >= 100;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={isSpecial ? ['#FFD700', '#FFA500', '#FFD700'] : [COLORS.primary, COLORS.yellow, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background pattern */}
        <View style={styles.patternOverlay} />
        
        {/* Main content */}
        <View style={styles.content}>
          {/* Trophy icon with rotation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { 
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowAnim,
                },
              ]}
            />
            <Text style={styles.icon}>{achievement.icon || '🏆'}</Text>
          </Animated.View>
          
          {/* Achievement info */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, pixelFont]}>ACHIEVEMENT UNLOCKED!</Text>
            <Text style={[styles.achievementName, pixelFont]}>{achievement.name}</Text>
            <Text style={[styles.description, pixelFont]}>{achievement.description}</Text>
            
            {/* Rewards */}
            {achievement.reward && (
              <View style={styles.rewardContainer}>
                {achievement.reward.xp && (
                  <Text style={[styles.reward, pixelFont]}>+{achievement.reward.xp} XP</Text>
                )}
                {achievement.reward.coins && (
                  <Text style={[styles.reward, pixelFont]}>+{achievement.reward.coins} 🪙</Text>
                )}
                {achievement.reward.item && (
                  <Text style={[styles.reward, pixelFont]}>🎁 {achievement.reward.item}</Text>
                )}
              </View>
            )}
          </View>
        </View>
        
        {/* Sparkles */}
        {sparkleAnims.map((sparkle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                opacity: sparkle.opacity,
                transform: [
                  { translateX: sparkle.translateX },
                  { translateY: sparkle.translateY },
                  { scale: sparkle.scale },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleIcon}>✨</Text>
          </Animated.View>
        ))}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999,
  },

  gradient: {
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.dark,
    padding: 20,
    overflow: 'hidden',
  },

  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: COLORS.dark,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },

  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.yellow,
    opacity: 0.3,
  },

  icon: {
    fontSize: 48,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 4,
  },

  achievementName: {
    fontSize: 16,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 4,
  },

  description: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.8)',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  reward: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  sparkle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },

  sparkleIcon: {
    fontSize: 20,
  },
});

export default AchievementNotification;