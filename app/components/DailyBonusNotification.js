/**
 * Daily Bonus Notification Component
 * Small, non-intrusive notification for daily rewards
 * Following MetaSystemsAgent patterns for better UX
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';
import DailyBonusModal from './DailyBonusModal';
import { Pulse, SlideIn } from './MicroAnimations';
import SoundFXManager from '../services/SoundFXManager';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const DailyBonusNotification = ({ 
  visible,
  onDismiss,
  onClaim,
  streak = 1,
  rewards = [],
  canClaim = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in notification
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 8 seconds if not interacted
      const timer = setTimeout(() => {
        if (!showModal) {
          handleDismiss();
        }
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, showModal]);

  const handlePress = () => {
    SoundFXManager.playSound('ui_button_press');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(true);
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handleModalClaim = () => {
    setShowModal(false);
    handleDismiss();
    if (onClaim) {
      onClaim();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    handleDismiss();
  };

  if (!visible && !showModal) return null;

  return (
    <>
      {/* Small notification bar */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.95}
          style={styles.touchable}
        >
          <LinearGradient
            colors={['rgba(247, 213, 29, 0.95)', 'rgba(146, 204, 65, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <Pulse duration={2000}>
                <Text style={styles.icon}>🎁</Text>
              </Pulse>
              
              <View style={styles.textContent}>
                <Text style={[styles.title, pixelFont]}>
                  DAILY BONUS READY!
                </Text>
                <Text style={[styles.subtitle, pixelFont]}>
                  Day {streak} • Tap to claim
                </Text>
              </View>

              <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Full modal when tapped */}
      {showModal && (
        <DailyBonusModal
          visible={showModal}
          onClose={handleModalClose}
          onClaim={handleModalClaim}
          streak={streak}
          rewards={rewards}
          canClaim={canClaim}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // Below status bar
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  touchable: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  icon: {
    fontSize: 24,
  },

  textContent: {
    flex: 1,
  },

  title: {
    fontSize: 11,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 9,
    color: 'rgba(13, 13, 13, 0.7)',
    letterSpacing: 0.5,
  },

  arrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowText: {
    fontSize: 20,
    color: COLORS.dark,
    fontWeight: 'bold',
  },

  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 13, 13, 0.2)',
    borderRadius: 12,
  },

  closeText: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: 'bold',
  },
});

export default DailyBonusNotification;