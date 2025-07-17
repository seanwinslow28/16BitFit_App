/**
 * Settings Button Component
 * Quick access button for settings
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
import SettingsManager from '../services/SettingsManager';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
};

const SettingsButton = ({
  onPress = () => {},
  style,
  iconStyle,
  position = 'topRight', // topLeft, topRight, bottomLeft, bottomRight
  size = 'medium', // small, medium, large
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    // Animate button
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
    });

    // Play sound if enabled
    if (SettingsManager.shouldPlaySound('ui')) {
      await SoundFXManager.playSound('ui_menu_open');
    }

    // Haptic feedback if enabled
    if (SettingsManager.shouldUseHaptics('button')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const getPositionStyle = () => {
    const positions = {
      topLeft: { top: 20, left: 20 },
      topRight: { top: 20, right: 20 },
      bottomLeft: { bottom: 20, left: 20 },
      bottomRight: { bottom: 20, right: 20 },
    };
    return positions[position] || positions.topRight;
  };

  const getSizeStyle = () => {
    const sizes = {
      small: { width: 36, height: 36, fontSize: 16 },
      medium: { width: 44, height: 44, fontSize: 20 },
      large: { width: 52, height: 52, fontSize: 24 },
    };
    return sizes[size] || sizes.medium;
  };

  const sizeStyle = getSizeStyle();
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: sizeStyle.width,
            height: sizeStyle.height,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.icon, { fontSize: sizeStyle.fontSize }, iconStyle]}>
          ⚙️
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FloatingSettingsButton = ({ onNavigate }) => {
  return (
    <SettingsButton
      position="topRight"
      size="medium"
      onPress={() => onNavigate('settings')}
      style={styles.floatingButton}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
  },

  button: {
    backgroundColor: COLORS.dark,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },

  icon: {
    color: COLORS.primary,
  },

  floatingButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
});

export { SettingsButton, FloatingSettingsButton };
export default SettingsButton;