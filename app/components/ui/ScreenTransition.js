/**
 * ScreenTransition Component
 * Implements "Fluid Retro" screen transitions with pixel dissolve and blur fade
 * Features motion blur and gentle bounce settling
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Animations, Colors } from '../../constants/DesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ScreenTransition = ({
  children,
  isVisible,
  direction = 'right', // 'right', 'left', 'up', 'down'
  onTransitionEnd,
  style,
}) => {
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const blurAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (isVisible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [isVisible]);

  const getTranslateValue = (entering) => {
    const distance = direction === 'left' || direction === 'right' ? SCREEN_WIDTH : SCREEN_HEIGHT;
    const multiplier = direction === 'left' || direction === 'up' ? -1 : 1;
    return entering ? 0 : distance * multiplier;
  };

  const animateIn = () => {
    // Set initial position
    translateAnim.setValue(getTranslateValue(false));
    
    Animated.parallel([
      // Slide in with bounce
      Animated.sequence([
        Animated.spring(translateAnim, {
          toValue: -Animations.screenTransition.bounceAmount * SCREEN_WIDTH,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animations.screenTransition.duration,
        useNativeDriver: true,
      }),
      // Scale up
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Blur fade
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: Animations.screenTransition.duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onTransitionEnd?.(true);
    });
  };

  const animateOut = () => {
    Animated.parallel([
      // Slide out
      Animated.timing(translateAnim, {
        toValue: getTranslateValue(false),
        duration: Animations.screenTransition.duration,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: Animations.screenTransition.duration,
        useNativeDriver: true,
      }),
      // Scale down
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: Animations.screenTransition.duration,
        useNativeDriver: true,
      }),
      // Blur increase
      Animated.timing(blurAnim, {
        toValue: 10,
        duration: Animations.screenTransition.duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onTransitionEnd?.(false);
    });
  };

  const getTransformStyle = () => {
    const transforms = [{ scale: scaleAnim }];
    
    if (direction === 'left' || direction === 'right') {
      transforms.push({ translateX: translateAnim });
    } else {
      transforms.push({ translateY: translateAnim });
    }
    
    return transforms;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: opacityAnim,
          transform: getTransformStyle(),
        },
      ]}
    >
      {/* Pixel dissolve effect overlay */}
      <Animated.View
        style={[
          styles.pixelOverlay,
          {
            opacity: blurAnim.interpolate({
              inputRange: [0, 10],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />
      
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.shell.lightGray,
  },
  pixelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.shell.buttonBlack,
    // In a real implementation, this would use a pixelated pattern image
    // or a custom shader for the dissolve effect
  },
});

export default ScreenTransition;