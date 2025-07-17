/**
 * Coach Tip Component
 * Contextual tips from Coach 8-Bit after onboarding
 * Following MetaSystemsAgent patterns for helpful guidance
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  white: '#FFFFFF',
};

const CoachTip = ({
  visible = false,
  tip = null,
  position = 'bottom', // 'top', 'bottom', 'center'
  onDismiss = () => {},
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && tip) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Play notification sound
        SoundFXManager.playSound('ui_notification', { volume: 0.3 });
        
        // Start bounce animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -5,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, tip]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible || !tip) return null;

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { top: 100 };
      case 'center':
        return { top: '40%' };
      case 'bottom':
      default:
        return { bottom: 100 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={styles.tipBox}
      >
        {/* Coach icon */}
        <View style={styles.coachIconContainer}>
          <Text style={styles.coachIcon}>{tip.coach.sprite}</Text>
        </View>
        
        {/* Tip content */}
        <View style={styles.tipContent}>
          <Text style={[styles.coachName, pixelFont]}>{tip.coach.name}</Text>
          <Text style={[styles.tipMessage, pixelFont]}>{tip.message}</Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
        >
          <Text style={[styles.closeButtonText, pixelFont]}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
  },

  tipBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  coachIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  coachIcon: {
    fontSize: 24,
  },

  tipContent: {
    flex: 1,
    marginRight: 8,
  },

  coachName: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    marginBottom: 2,
    opacity: 0.7,
  },

  tipMessage: {
    fontSize: 10,
    color: COLORS.dark,
    lineHeight: 14,
    letterSpacing: 0.3,
  },

  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: COLORS.dark,
    opacity: 0.6,
  },
});

export default CoachTip;