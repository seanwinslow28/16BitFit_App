/**
 * Action Button Component - Figma Implementation
 * 140×56px buttons with shadows, press animations, and proper touch targets
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Effects, Dimensions as DS } from '../constants/DesignSystem';

const ActionButton = ({
  buttonType = 'workout',
  buttonText = 'BUTTON',
  iconSource = null,
  onPress = () => {},
  disabled = false,
  style = {},
  fontFamily = 'monospace',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const animatedValue = new Animated.Value(0);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    setIsPressed(false);
    
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  // Animated styles for press effect
  const animatedStyles = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
    shadowOffset: {
      width: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 2],
      }),
      height: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 2],
      }),
    },
  };

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyles, style]}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          disabled && styles.actionButtonDisabled,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={1}
      >
        {/* Icon */}
        {iconSource && (
          <View style={styles.iconContainer}>
            <Image
              source={iconSource}
              style={styles.actionButtonIcon}
              resizeMode="contain"
            />
          </View>
        )}
        
        {/* Button Text */}
        <Text
          style={[
            styles.actionButtonText,
            { fontFamily },
            disabled && styles.actionButtonTextDisabled,
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stat Bar Component with diagonal stripes
export const StatBar = ({
  current = 0,
  max = 100,
  statType = 'health',
  label = 'STAT',
  showPattern = true,
  fontFamily = 'monospace',
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  // Get stat configuration
  const getStatConfig = (type) => {
    const configs = {
      health: { color: Colors.state.health, label: 'HEALTH' },
      energy: { color: Colors.state.energy, label: 'ENERGY' },
      strength: { color: Colors.primary.logoYellow, label: 'STRENGTH' },
      happiness: { color: Colors.primary.success, label: 'HAPPINESS' },
    };
    return configs[type] || configs.health;
  };

  const config = getStatConfig(statType);

  return (
    <View style={styles.statBarContainer}>
      {/* Stat Label */}
      <Text style={[styles.statLabel, { fontFamily }]}>
        {label.toUpperCase()}
      </Text>

      {/* Progress Container */}
      <View style={styles.statBarBackground}>
        <View
          style={[
            styles.statBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: config.color,
            }
          ]}
        >
          {/* Diagonal Stripe Pattern */}
          {showPattern && (
            <View style={styles.diagonalStripes}>
              {[...Array(8)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stripe,
                    {
                      left: i * 8,
                      backgroundColor: Colors.primary.black,
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Stat Value */}
      <Text style={[styles.statValue, { fontFamily }]}>
        {Math.round(current)}/{max}
      </Text>
    </View>
  );
};

// Enhanced Navigation Button
export const NavButton = ({
  isActive = false,
  iconSource = null,
  label = 'NAV',
  onPress = () => {},
  fontFamily = 'monospace',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.navButton,
        isActive && styles.navButtonActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Nav Icon */}
      {iconSource && (
        <Image
          source={iconSource}
          style={styles.navButtonSprite}
          resizeMode="contain"
        />
      )}
      
      {/* Nav Label */}
      <Text
        style={[
          styles.navLabel,
          { fontFamily },
          isActive && styles.navLabelActive,
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ACTION BUTTON STYLES (Figma specifications)
  buttonContainer: {
    width: DS.actionButton.width,
    height: DS.actionButton.height,
    ...Effects.buttonShadowDefault,
  },

  actionButton: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary.success,
    borderWidth: 4,
    borderColor: Colors.primary.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },

  actionButtonDisabled: {
    backgroundColor: Colors.button.disabled,
    opacity: 0.6,
  },

  iconContainer: {
    width: DS.actionButton.iconSize,
    height: DS.actionButton.iconSize,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonIcon: {
    width: '100%',
    height: '100%',
  },

  actionButtonText: {
    ...Typography.buttonText,
    color: Colors.primary.black,
    textAlign: 'center',
  },

  actionButtonTextDisabled: {
    color: Colors.button.disabledText,
  },

  // STAT BAR STYLES (Figma specifications)
  statBarContainer: {
    width: DS.statBar.width,
    height: DS.statBar.height,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  statLabel: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    width: DS.statBar.labelWidth,
    textAlign: 'left',
  },

  statBarBackground: {
    width: DS.statBar.progressWidth,
    height: 24,
    backgroundColor: Colors.environment.groundDark,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    position: 'relative',
    overflow: 'hidden',
  },

  statBarFill: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  diagonalStripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },

  stripe: {
    width: 2,
    height: '100%',
    opacity: 0.3,
    transform: [{ skewX: '-45deg' }],
  },

  statValue: {
    ...Typography.microCopy,
    color: Colors.primary.black,
    width: DS.statBar.valueWidth,
    textAlign: 'right',
  },

  // NAVIGATION STYLES
  navButton: {
    width: DS.navigation.itemWidth,
    height: DS.navigation.itemHeight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },

  navButtonActive: {
    backgroundColor: Colors.primary.success,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary.black,
  },

  navButtonSprite: {
    width: 32,
    height: 32,
  },

  navLabel: {
    ...Typography.microCopy,
    color: Colors.primary.black,
    textAlign: 'center',
  },

  navLabelActive: {
    color: Colors.primary.black,
    fontWeight: 'bold',
  },
});

export default ActionButton;