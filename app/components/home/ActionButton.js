import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FluidRetroButton } from '../ui';
import { Colors, Typography, Spacing } from '../../constants/DesignSystem';

const ActionButton = React.memo(({ 
  icon, 
  label, 
  onPress, 
  color, 
  size = 'medium',
  variant = 'primary' 
}) => {
  return (
    <FluidRetroButton
      onPress={onPress}
      variant={variant}
      style={[
        styles.actionButton,
        size === 'large' && styles.largeButton,
        size === 'medium' && styles.mediumButton,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.buttonIcon, size === 'large' && styles.largeIcon]}>
          {icon}
        </Text>
        <Text style={[styles.buttonLabel, size === 'large' && styles.largeLabel]}>
          {label}
        </Text>
      </View>
    </FluidRetroButton>
  );
});

const styles = StyleSheet.create({
  actionButton: {
    // Base styles handled by FluidRetroButton
  },
  largeButton: {
    width: 140,
    height: 64,
  },
  mediumButton: {
    width: 120,
    height: 56,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  largeIcon: {
    fontSize: 32,
  },
  buttonLabel: {
    ...Typography.bodyText,
    fontFamily: 'PressStart2P',
    color: Colors.shell.lightGray,
    textAlign: 'center',
  },
  largeLabel: {
    fontSize: 14,
  },
});

export default ActionButton;