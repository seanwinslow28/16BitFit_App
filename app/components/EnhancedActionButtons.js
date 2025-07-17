/**
 * Enhanced Action Buttons Component - Two-row layout with haptic feedback
 * Primary actions (workout, eat healthy) and secondary actions (skip, cheat)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

const EnhancedActionButtons = ({
  onWorkout = () => {},
  onEatHealthy = () => {},
  onSkipWorkout = () => {},
  onCheatMeal = () => {},
  disabled = false,
  fontFamily = 'monospace',
}) => {
  const [pressedButton, setPressedButton] = useState(null);

  const handleButtonPress = async (action, buttonId) => {
    if (disabled) return;

    setPressedButton(buttonId);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      if (buttonId === 'workout' || buttonId === 'healthy') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }

    // Execute action
    action();

    // Reset pressed state
    setTimeout(() => setPressedButton(null), 150);
  };

  const getButtonStyle = (buttonType, buttonId) => {
    const isPressed = pressedButton === buttonId;
    const baseStyle = buttonType === 'primary' ? styles.primaryButton : styles.secondaryButton;
    
    return [
      styles.actionButton,
      baseStyle,
      isPressed && styles.buttonPressed,
      disabled && styles.buttonDisabled,
    ];
  };

  const getTextStyle = (buttonType, buttonId) => {
    const isPressed = pressedButton === buttonId;
    const baseTextStyle = buttonType === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;
    
    return [
      styles.actionButtonText,
      { fontFamily },
      baseTextStyle,
      isPressed && styles.buttonTextPressed,
    ];
  };

  return (
    <View style={styles.container}>
      {/* Primary Actions Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={getButtonStyle('primary', 'workout')}
          onPress={() => handleButtonPress(onWorkout, 'workout')}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={getTextStyle('primary', 'workout')}>
            💪 WORKOUT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle('primary', 'healthy')}
          onPress={() => handleButtonPress(onEatHealthy, 'healthy')}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={getTextStyle('primary', 'healthy')}>
            🥗 EAT HEALTHY
          </Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Actions Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={getButtonStyle('secondary', 'skip')}
          onPress={() => handleButtonPress(onSkipWorkout, 'skip')}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={[getTextStyle('secondary', 'skip'), styles.smallerText]}>
            😴 SKIP WORKOUT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle('secondary', 'cheat')}
          onPress={() => handleButtonPress(onCheatMeal, 'cheat')}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={[getTextStyle('secondary', 'cheat'), styles.smallerText]}>
            🍔 CHEAT MEAL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action hint text */}
      <View style={styles.hintContainer}>
        <Text style={[styles.hintText, { fontFamily }]}>
          Choose your action to affect your character's stats
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    height: 36,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
    ...Effects.pixelBorder,
  },

  primaryButton: {
    backgroundColor: Colors.primary.success,
    borderBottomWidth: 4,
  },

  secondaryButton: {
    backgroundColor: Colors.state.health,
    borderBottomWidth: 4,
  },

  buttonPressed: {
    transform: [{ translateY: 1 }],
    borderBottomWidth: 1,
    elevation: 3,
  },

  buttonDisabled: {
    backgroundColor: Colors.environment.nightPurple,
    opacity: 0.6,
  },

  actionButtonText: {
    ...Typography.titleMedium,
    fontSize: 10,
    color: Colors.primary.black,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  primaryButtonText: {
    fontWeight: 'bold',
  },

  secondaryButtonText: {
    color: Colors.primary.black,
  },

  buttonTextPressed: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },

  smallerText: {
    fontSize: 8,
  },

  hintContainer: {
    alignItems: 'center',
    marginTop: 4,
  },

  hintText: {
    ...Typography.microCopy,
    fontSize: 9,
    color: Colors.environment.groundDark,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EnhancedActionButtons;