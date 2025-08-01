import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, Animated } from 'react-native';
import designTokens from '../constants/designTokens';

const PixelButton = ({ children, onPress, disabled, style, textStyle }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95, // Depress the button
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1, // "Pop" back out
      friction: 3,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  return (
    <Pressable
      onPress={onPress}
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
    borderWidth: 2,
    borderColor: colors.theme.text,
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