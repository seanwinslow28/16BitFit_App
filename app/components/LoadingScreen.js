/**
 * Loading Screen Component
 * GameBoy-style loading states for async operations
 * Following MetaSystemsAgent patterns for feedback states
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  screenBg: '#9BBC0F',
};

const LoadingScreen = ({
  message = 'LOADING...',
  subMessage = null,
  showProgress = false,
  progress = 0,
  tip = null,
}) => {
  // Animation values
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Dot animation sequence
    const dotSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Spin animation
    const spinSequence = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    dotSequence.start();
    spinSequence.start();
    pulseSequence.start();

    return () => {
      dotSequence.stop();
      spinSequence.stop();
      pulseSequence.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.screenBg, COLORS.primary, COLORS.screenBg]}
        style={styles.gradient}
      >
        {/* Spinning loader */}
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              transform: [
                { rotate: spin },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View style={styles.spinner}>
            <View style={styles.spinnerDot} />
            <View style={styles.spinnerDot} />
            <View style={styles.spinnerDot} />
            <View style={styles.spinnerDot} />
          </View>
        </Animated.View>

        {/* Loading text */}
        <View style={styles.textContainer}>
          <View style={styles.messageRow}>
            <Text style={[styles.message]}>{message}</Text>
            <View style={styles.dotsContainer}>
              <Animated.Text
                style={[
                  styles.dot,
                  { opacity: dotAnim1 },
                ]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.dot,
                  { opacity: dotAnim2 },
                ]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.dot,
                  { opacity: dotAnim3 },
                ]}
              >
                .
              </Animated.Text>
            </View>
          </View>

          {subMessage && (
            <Text style={[styles.subMessage]}>{subMessage}</Text>
          )}

          {/* Progress bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progress, 100)}%` },
                  ]}
                />
              </View>
              <Text style={[styles.progressText]}>
                {Math.round(progress)}%
              </Text>
            </View>
          )}

          {/* Loading tip */}
          {tip && (
            <View style={styles.tipContainer}>
              <Text style={[styles.tipLabel]}>TIP:</Text>
              <Text style={[styles.tipText]}>{tip}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  spinnerContainer: {
    marginBottom: 40,
  },

  spinner: {
    width: 60,
    height: 60,
    position: 'relative',
  },

  spinnerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: COLORS.dark,
    borderRadius: 6,
  },

  textContainer: {
    alignItems: 'center',
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  message: {
    fontSize: 16,
    color: COLORS.dark,
    letterSpacing: 2,
    fontFamily: 'PressStart2P',
  },

  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 2,
  },

  dot: {
    fontSize: 16,
    color: COLORS.dark,
    letterSpacing: 2,
    fontFamily: 'PressStart2P',
  },

  subMessage: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
    marginTop: 8,
    opacity: 0.8,
    fontFamily: 'PressStart2P',
  },

  progressContainer: {
    marginTop: 30,
    width: 200,
    alignItems: 'center',
  },

  progressBar: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.yellow,
    borderRadius: 6,
  },

  progressText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
    fontFamily: 'PressStart2P',
  },

  tipContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    maxWidth: 300,
  },

  tipLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
  },

  tipText: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.8,
    fontFamily: 'PressStart2P',
  },
});

// Pre-configured loading messages for common operations
export const LoadingMessages = {
  SYNC_HEALTH: {
    message: 'SYNCING HEALTH DATA',
    subMessage: 'Connecting to health services...',
    tip: 'Your real-world steps power up your character!',
  },
  SAVE_PROGRESS: {
    message: 'SAVING PROGRESS',
    subMessage: 'Securing your achievements...',
    tip: 'Progress is saved automatically after each action.',
  },
  LOAD_BATTLE: {
    message: 'PREPARING BATTLE',
    subMessage: 'Loading boss arena...',
    tip: 'Boss difficulty scales with your level!',
  },
  SYNC_CLOUD: {
    message: 'CLOUD SYNC',
    subMessage: 'Backing up to the cloud...',
    tip: 'Sign in to save your progress across devices.',
  },
  LOAD_SOCIAL: {
    message: 'LOADING SOCIAL',
    subMessage: 'Fetching friend updates...',
    tip: 'Join a guild to unlock team challenges!',
  },
};

// Add spinner dot positions
const dotPositions = [
  { top: 0, left: '50%', marginLeft: -6 },
  { top: '50%', right: 0, marginTop: -6 },
  { bottom: 0, left: '50%', marginLeft: -6 },
  { top: '50%', left: 0, marginTop: -6 },
];

// Apply positions to spinner dots
Object.assign(styles, {
  spinnerDot: {
    ...styles.spinnerDot,
    ...dotPositions[0],
  },
});

export default LoadingScreen;