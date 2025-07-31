/**
 * FluidRetroButton Component
 * Implements the "Fluid Retro" motion philosophy from 16BitFit Style Guide
 * Features physics-based animations with subtle depression and bounce effects
 */

import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  Animated,
  View,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { StyleGuideComponents } from '../../constants/StyleGuideComponents';
import { Animations } from '../../constants/DesignSystem';

export const FluidRetroButton = ({
  onPress,
  onPressIn,
  onPressOut,
  title,
  variant = 'primary', // 'primary' | 'secondary'
  disabled = false,
  style,
  textStyle,
  icon,
  hapticFeedback = true,
  children,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Get style configuration based on variant
  const buttonConfig = variant === 'primary' 
    ? StyleGuideComponents.PrimaryCTAButton 
    : StyleGuideComponents.SecondaryButton;

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    // Haptic feedback on press
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate button depression with physics-based feel
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: Animations.buttonPress.scale,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateXAnim, {
        toValue: 2,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 2,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPressIn?.();
  }, [disabled, hapticFeedback, scaleAnim, translateXAnim, translateYAnim, onPressIn]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    // Animate button release with subtle overshoot
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: Animations.buttonPress.overshoot,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(translateXAnim, {
        toValue: 0,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPressOut?.();
  }, [disabled, scaleAnim, translateXAnim, translateYAnim, onPressOut]);

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateX: translateXAnim },
      { translateY: translateYAnim },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          buttonConfig.container,
          disabled && buttonConfig.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <View style={styles.contentContainer}>
          {icon && <View style={styles.icon}>{icon}</View>}
          {children || (
            <Text 
              style={[
                styles.text,
                buttonConfig.text,
                disabled && buttonConfig.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    // Shadow will be handled by button config
  },
  pressed: {
    // Visual feedback handled by animation
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    // Icon styles will be applied by parent
  },
  text: {
    // Text styles come from button config
  },
});

export default FluidRetroButton;