/**
 * Retry Modal Component
 * Shows retry options for failed network requests
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';
import SettingsManager from '../services/SettingsManager';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const RetryModal = ({
  visible,
  error,
  onRetry,
  onCancel,
  onGoOffline,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
}) => {
  const [countdown, setCountdown] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Error shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Play error sound
      if (SettingsManager.shouldPlaySound('ui')) {
        SoundFXManager.playSound('ui_error');
      }
      
      // Haptic feedback
      if (SettingsManager.shouldUseHaptics('button')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [visible]);

  useEffect(() => {
    // Auto-retry countdown
    if (visible && retryCount < maxRetries && !isRetrying) {
      let timer = 5;
      setCountdown(timer);
      
      const interval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);
        
        if (timer <= 0) {
          clearInterval(interval);
          onRetry();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [visible, retryCount, isRetrying]);

  const handleRetry = async () => {
    await SoundFXManager.playSound('ui_button_press');
    onRetry();
  };

  const handleCancel = async () => {
    await SoundFXManager.playSound('ui_menu_close');
    onCancel();
  };

  const handleGoOffline = async () => {
    await SoundFXManager.playSound('ui_toggle');
    onGoOffline();
  };

  const getErrorMessage = () => {
    if (error?.includes('timeout')) {
      return 'Request timed out. The server might be slow.';
    }
    if (error?.includes('network')) {
      return 'Network error. Check your connection.';
    }
    if (error?.includes('unauthorized')) {
      return 'Authentication failed. Please sign in again.';
    }
    return error || 'Something went wrong. Please try again.';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.title, pixelFont]}>CONNECTION ERROR</Text>
            </View>

            {/* Error Message */}
            <View style={styles.content}>
              <Text style={[styles.errorMessage, pixelFont]}>
                {getErrorMessage()}
              </Text>
              
              {retryCount > 0 && (
                <Text style={[styles.retryInfo, pixelFont]}>
                  Retry attempt {retryCount} of {maxRetries}
                </Text>
              )}
              
              {countdown !== null && !isRetrying && (
                <Text style={[styles.countdown, pixelFont]}>
                  Auto-retry in {countdown}s...
                </Text>
              )}
            </View>

            {/* Loading State */}
            {isRetrying && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, pixelFont]}>
                  RETRYING...
                </Text>
              </View>
            )}

            {/* Actions */}
            {!isRetrying && (
              <View style={styles.actions}>
                {retryCount < maxRetries && (
                  <TouchableOpacity
                    style={[styles.button, styles.retryButton]}
                    onPress={handleRetry}
                  >
                    <Text style={[styles.buttonText, pixelFont]}>
                      RETRY NOW
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.button, styles.offlineButton]}
                  onPress={handleGoOffline}
                >
                  <Text style={[styles.buttonText, pixelFont]}>
                    CONTINUE OFFLINE
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, pixelFont]}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tips */}
            <View style={styles.tips}>
              <Text style={[styles.tipTitle, pixelFont]}>TIPS:</Text>
              <Text style={[styles.tipText, pixelFont]}>
                • Check your internet connection
              </Text>
              <Text style={[styles.tipText, pixelFont]}>
                • Try moving to a better signal area
              </Text>
              <Text style={[styles.tipText, pixelFont]}>
                • Your progress is saved locally
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  gradient: {
    padding: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    color: COLORS.red,
    letterSpacing: 2,
  },

  content: {
    alignItems: 'center',
    marginBottom: 24,
  },

  errorMessage: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  retryInfo: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  countdown: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },

  loadingText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 12,
  },

  actions: {
    gap: 12,
    marginBottom: 20,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  offlineButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.yellow,
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.gray,
  },

  buttonText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  tips: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    padding: 12,
  },

  tipTitle: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 8,
  },

  tipText: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});

export default RetryModal;