/**
 * GameBoy Action Button Component
 * Retro-style button with press animation and haptic feedback
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

const GameBoyActionButton = ({
  text,
  onPress,
  variant = 'primary', // 'primary' or 'secondary'
  style,
  textStyle,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 3,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = async () => {
    if (!disabled) {
      // Play sound effect based on variant
      if (variant === 'secondary') {
        await SoundFXManager.playSound('ui_error');
      } else {
        await SoundFXManager.playButtonPress();
      }
      
      await Haptics.impactAsync(
        variant === 'secondary' 
          ? Haptics.ImpactFeedbackStyle.Heavy 
          : Haptics.ImpactFeedbackStyle.Medium
      );
      onPress();
    }
  };

  const buttonColors = {
    primary: {
      background: '#92CC41',
      shadow: '#5a7829',
      text: '#0D0D0D',
    },
    secondary: {
      background: '#E53935',
      shadow: '#8b0000',
      text: '#0D0D0D',
    },
  };

  const colors = buttonColors[variant];

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.shadow,
          },
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text 
          style={[
            styles.buttonText, 
            pixelFont,
            { color: colors.text },
            textStyle,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
  },

  button: {
    height: 48,
    backgroundColor: '#92CC41',
    borderWidth: 3,
    borderColor: '#0D0D0D',
    borderBottomWidth: 6,
    borderBottomColor: '#5a7829',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 11,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default GameBoyActionButton;