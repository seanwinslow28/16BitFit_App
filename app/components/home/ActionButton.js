import React, { useRef, useCallback } from 'react';
import { Pressable, Animated, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const ActionButton = React.memo(({ 
  icon, 
  label, 
  onPress, 
  color, 
  size = 'medium' 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);
  
  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.actionButton,
          size === 'large' && styles.largeButton,
          size === 'medium' && styles.mediumButton,
          { backgroundColor: color, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={[styles.buttonIcon, size === 'large' && styles.largeIcon]}>
          {icon}
        </Text>
        <Text style={[styles.buttonLabel, size === 'large' && styles.largeLabel]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10,
    borderWidth: 3,
    borderColor: '#0F380F',
  },
  largeButton: {
    width: 120,
    height: 80,
  },
  mediumButton: {
    width: 100,
    height: 60,
  },
  buttonIcon: {
    fontSize: 24,
  },
  largeIcon: {
    fontSize: 32,
  },
  buttonLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginTop: 5,
  },
  largeLabel: {
    fontSize: 12,
  },
});

export default ActionButton;