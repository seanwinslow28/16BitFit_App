/**
 * Animated Loading Screen Component
 * GameBoy-style loading animations for transitions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  gray: '#666',
  white: '#FFFFFF',
};

// Loading animations types
const LOADING_TYPES = {
  DOTS: 'dots',
  PROGRESS: 'progress',
  CHARACTER: 'character',
  BATTLE: 'battle',
};

const AnimatedLoadingScreen = ({
  type = LOADING_TYPES.DOTS,
  message = 'LOADING...',
  progress = null,
  onComplete = () => {},
  duration = 2000,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const characterBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Type-specific animations
    switch (type) {
      case LOADING_TYPES.DOTS:
        startDotsAnimation();
        break;
      case LOADING_TYPES.PROGRESS:
        startProgressAnimation();
        break;
      case LOADING_TYPES.CHARACTER:
        startCharacterAnimation();
        break;
      case LOADING_TYPES.BATTLE:
        startBattleAnimation();
        break;
    }

    // Auto-complete if duration is set
    if (duration && !progress) {
      setTimeout(() => {
        exitAnimation();
      }, duration);
    }
  }, []);

  useEffect(() => {
    // Handle progress-based completion
    if (progress !== null && progress >= 1) {
      exitAnimation();
    }
  }, [progress]);

  const startDotsAnimation = () => {
    // Staggered dots animation
    const animateDot = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1Anim, 0);
    animateDot(dot2Anim, 200);
    animateDot(dot3Anim, 400);
  };

  const startProgressAnimation = () => {
    Animated.timing(progressAnim, {
      toValue: progress || 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const startCharacterAnimation = () => {
    // Character bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(characterBounce, {
          toValue: -20,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(characterBounce, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBattleAnimation = () => {
    // Rotating battle icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const exitAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const renderLoadingContent = () => {
    switch (type) {
      case LOADING_TYPES.DOTS:
        return (
          <View style={styles.dotsContainer}>
            <Text style={[styles.loadingText, pixelFont]}>{message}</Text>
            <View style={styles.dots}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot1Anim,
                    transform: [{ scale: dot1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    })}],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot2Anim,
                    transform: [{ scale: dot2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    })}],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot3Anim,
                    transform: [{ scale: dot3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    })}],
                  },
                ]}
              />
            </View>
          </View>
        );

      case LOADING_TYPES.PROGRESS:
        return (
          <View style={styles.progressContainer}>
            <Text style={[styles.loadingText, pixelFont]}>{message}</Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, pixelFont]}>
              {Math.round((progress || 0) * 100)}%
            </Text>
          </View>
        );

      case LOADING_TYPES.CHARACTER:
        return (
          <View style={styles.characterContainer}>
            <Animated.Text
              style={[
                styles.characterIcon,
                {
                  transform: [{ translateY: characterBounce }],
                },
              ]}
            >
              🏃
            </Animated.Text>
            <Text style={[styles.loadingText, pixelFont]}>{message}</Text>
          </View>
        );

      case LOADING_TYPES.BATTLE:
        return (
          <View style={styles.battleContainer}>
            <Animated.Text
              style={[
                styles.battleIcon,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                },
              ]}
            >
              ⚔️
            </Animated.Text>
            <Text style={[styles.loadingText, pixelFont]}>{message}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="auto"
    >
      <LinearGradient
        colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {renderLoadingContent()}
        </View>
      </LinearGradient>
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
    zIndex: 9999,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },

  dotsContainer: {
    alignItems: 'center',
  },

  dots: {
    flexDirection: 'row',
    gap: 16,
  },

  dot: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  progressContainer: {
    alignItems: 'center',
    width: screenWidth * 0.8,
  },

  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 7,
  },

  progressText: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginTop: 12,
  },

  characterContainer: {
    alignItems: 'center',
  },

  characterIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  battleContainer: {
    alignItems: 'center',
  },

  battleIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
});

export { AnimatedLoadingScreen, LOADING_TYPES };
export default AnimatedLoadingScreen;