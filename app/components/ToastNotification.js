/**
 * Toast Notification Component
 * GameBoy-style toast messages for network and system events
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

// Toast types with their styling
const TOAST_TYPES = {
  success: {
    backgroundColor: COLORS.primary,
    icon: '✓',
    sound: 'ui_success',
  },
  error: {
    backgroundColor: COLORS.red,
    icon: '✕',
    sound: 'ui_error',
  },
  warning: {
    backgroundColor: COLORS.yellow,
    icon: '!',
    sound: 'ui_notification',
  },
  info: {
    backgroundColor: COLORS.gray,
    icon: 'i',
    sound: 'ui_notification',
  },
};

// Toast manager singleton
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = new Set();
    this.toastId = 0;
  }

  show(message, type = 'info', duration = 3000, options = {}) {
    const id = ++this.toastId;
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
      ...options,
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  dismissAll() {
    this.toasts = [];
    this.notifyListeners();
  }

  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

const toastManager = new ToastManager();

// Individual toast component
const Toast = ({ toast, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Play sound
    const toastType = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
    SoundFXManager.playSound(toastType.sound);

    // Haptic feedback
    if (toast.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (toast.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleDismiss = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const toastType = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: toastType.backgroundColor,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={handleDismiss}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, pixelFont]}>{toastType.icon}</Text>
        </View>
        <Text style={[styles.message, pixelFont]}>{toast.message}</Text>
        {toast.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toast.action.onPress}
          >
            <Text style={[styles.actionText, pixelFont]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast container component
const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Subscribe to toast updates
    const unsubscribe = toastManager.addListener(setToasts);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[
            styles.toastWrapper,
            { top: 50 + index * 70 }, // Stack toasts
          ]}
        >
          <Toast
            toast={toast}
            onDismiss={(id) => toastManager.dismiss(id)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },

  toastWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },

  toast: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 16,
    color: COLORS.primary,
  },

  message: {
    flex: 1,
    fontSize: 11,
    color: COLORS.dark,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  actionButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.dark,
    borderRadius: 4,
  },

  actionText: {
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
});

// Export the component and manager
export default ToastNotification;
export { toastManager };

// Helper functions for common toasts
export const showToast = (message, type = 'info', duration = 3000, options = {}) => {
  return toastManager.show(message, type, duration, options);
};

export const showSuccess = (message, duration = 3000, options = {}) => {
  return toastManager.show(message, 'success', duration, options);
};

export const showError = (message, duration = 4000, options = {}) => {
  return toastManager.show(message, 'error', duration, options);
};

export const showWarning = (message, duration = 3500, options = {}) => {
  return toastManager.show(message, 'warning', duration, options);
};

export const showNetworkError = (message = 'No internet connection', options = {}) => {
  return toastManager.show(message, 'error', 5000, {
    action: {
      label: 'RETRY',
      onPress: async () => {
        // Trigger retry logic
        const NetworkManager = require('../services/NetworkManager').default;
        await NetworkManager.processOfflineQueue();
      },
    },
    ...options,
  });
};