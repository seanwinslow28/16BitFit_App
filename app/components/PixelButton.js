import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import designTokens from '../constants/designTokens';

const PixelButton = ({ children, onPress, disabled, style, textStyle }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.timing(animatedValue, {
      toValue: 0.92, // Depress the button more noticeably
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.05, // Slight overshoot for "pop" effect
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1, // Settle back to normal
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePress = () => {
    if (!disabled && onPress) {
      // Stronger haptic feedback on successful press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.button, animatedStyle, style, disabled && styles.disabledButton]}>
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
};

const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent['steely-blue'],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.theme.text,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    // Shadow effect for depth
    shadowColor: colors.theme.text,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
  text: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.shell.light,
  },
  disabledButton: {
    backgroundColor: colors.theme.surfaceDark,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.theme.textLight,
  }
});

export default PixelButton;