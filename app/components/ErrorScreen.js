/**
 * Error Screen Component
 * GameBoy-style error display for handled errors
 * Following MetaSystemsAgent patterns for error recovery
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
};

// Common error types with user-friendly messages
const ERROR_MESSAGES = {
  network: {
    icon: '📡',
    title: 'CONNECTION ERROR',
    message: 'Unable to connect to the server',
    suggestion: 'Check your internet connection and try again',
  },
  auth: {
    icon: '🔐',
    title: 'AUTHENTICATION ERROR',
    message: 'Your session has expired',
    suggestion: 'Please sign in again to continue',
  },
  sync: {
    icon: '🔄',
    title: 'SYNC ERROR',
    message: 'Failed to sync your data',
    suggestion: 'Your progress is saved locally and will sync when connected',
  },
  health: {
    icon: '❤️',
    title: 'HEALTH DATA ERROR',
    message: 'Cannot access health data',
    suggestion: 'Check health permissions in your device settings',
  },
  permission: {
    icon: '🚫',
    title: 'PERMISSION DENIED',
    message: 'Missing required permissions',
    suggestion: 'Grant permissions in settings to continue',
  },
  unknown: {
    icon: '❓',
    title: 'UNEXPECTED ERROR',
    message: 'Something went wrong',
    suggestion: 'Please try again or restart the app',
  },
};

const ErrorScreen = ({
  type = 'unknown',
  customMessage = null,
  onRetry = null,
  onDismiss = null,
  showDismiss = true,
}) => {
  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Play error sound
    SoundFXManager.playError();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Icon pulse animation
    Animated.loop(
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
    ).start();
  }, []);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onDismiss) {
      onDismiss();
    }
  };

  const errorInfo = ERROR_MESSAGES[type] || ERROR_MESSAGES.unknown;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#000', '#1a1a1a', '#000']}
        style={styles.gradient}
      >
        {/* Error Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>{errorInfo.icon}</Text>
        </Animated.View>

        {/* Error Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.title, pixelFont]}>{errorInfo.title}</Text>
          <Text style={[styles.message, pixelFont]}>
            {customMessage || errorInfo.message}
          </Text>
          <Text style={[styles.suggestion, pixelFont]}>
            {errorInfo.suggestion}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={handleRetry}
            >
              <Text style={[styles.buttonText, pixelFont]}>TRY AGAIN</Text>
            </TouchableOpacity>
          )}

          {showDismiss && onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={handleDismiss}
            >
              <Text style={[styles.buttonText, pixelFont]}>GO BACK</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Code */}
        <Text style={[styles.errorCode, pixelFont]}>
          ERROR CODE: {type.toUpperCase()}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.red,
    borderWidth: 4,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  icon: {
    fontSize: 48,
  },

  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  title: {
    fontSize: 18,
    color: COLORS.red,
    letterSpacing: 2,
    marginBottom: 12,
  },

  message: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },

  suggestion: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 16,
  },

  buttonContainer: {
    gap: 12,
    width: '100%',
    paddingHorizontal: 40,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
  },

  retryButton: {
    backgroundColor: COLORS.yellow,
  },

  dismissButton: {
    backgroundColor: COLORS.gray,
  },

  buttonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  errorCode: {
    position: 'absolute',
    bottom: 40,
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
});

export default ErrorScreen;