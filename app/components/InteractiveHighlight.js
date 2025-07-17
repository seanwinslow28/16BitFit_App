/**
 * Interactive Highlight Component
 * Draws attention to UI elements during tutorials
 * Following MetaSystemsAgent patterns for visual guidance
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const COLORS = {
  primary: '#92CC41',
  highlight: 'rgba(146, 204, 65, 0.3)',
  pulse: 'rgba(146, 204, 65, 0.6)',
};

const InteractiveHighlight = ({
  targetRef,
  visible = false,
  type = 'pulse', // 'pulse', 'border', 'glow', 'ripple'
  color = COLORS.primary,
  onPress = () => {},
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnims = useRef([
    {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
    },
    {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
    },
    {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
    },
  ]).current;

  const [position, setPosition] = React.useState(null);

  useEffect(() => {
    if (visible && targetRef && targetRef.current) {
      // Measure target element
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
      
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [visible, targetRef, type]);

  const startAnimation = () => {
    // Fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    switch (type) {
      case 'pulse':
        startPulseAnimation();
        break;
      case 'border':
        startBorderAnimation();
        break;
      case 'glow':
        startGlowAnimation();
        break;
      case 'ripple':
        startRippleAnimation();
        break;
    }
  };

  const stopAnimation = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBorderAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 20,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startRippleAnimation = () => {
    const animateRipple = (ripple, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.timing(ripple.scale, {
              toValue: 2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(ripple.opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          {
            iterations: -1,
          }
        ).start();
      }, delay);
    };

    rippleAnims.forEach((ripple, index) => {
      ripple.scale.setValue(1);
      ripple.opacity.setValue(0.6);
      animateRipple(ripple, index * 666);
    });
  };

  if (!visible || !position) return null;

  const renderHighlight = () => {
    const baseStyle = {
      position: 'absolute',
      left: position.x - 10,
      top: position.y - 10,
      width: position.width + 20,
      height: position.height + 20,
    };

    switch (type) {
      case 'pulse':
        return (
          <Animated.View
            style={[
              baseStyle,
              styles.pulseHighlight,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                borderColor: color,
                backgroundColor: `${color}33`,
              },
            ]}
            pointerEvents="none"
          />
        );

      case 'border':
        return (
          <Animated.View
            style={[
              baseStyle,
              styles.borderHighlight,
              {
                opacity: opacityAnim,
                borderColor: color,
                borderWidth: borderAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 4],
                }),
              },
            ]}
            pointerEvents="none"
          />
        );

      case 'glow':
        return (
          <Animated.View
            style={[
              baseStyle,
              styles.glowHighlight,
              {
                opacity: opacityAnim,
                backgroundColor: `${color}22`,
                shadowColor: color,
                shadowRadius: glowAnim,
                shadowOpacity: 0.8,
              },
            ]}
            pointerEvents="none"
          />
        );

      case 'ripple':
        return (
          <>
            {rippleAnims.map((ripple, index) => (
              <Animated.View
                key={index}
                style={[
                  baseStyle,
                  styles.rippleHighlight,
                  {
                    opacity: Animated.multiply(opacityAnim, ripple.opacity),
                    transform: [{ scale: ripple.scale }],
                    borderColor: color,
                  },
                ]}
                pointerEvents="none"
              />
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    {renderHighlight()}
  </View>;
};

const styles = StyleSheet.create({
  pulseHighlight: {
    borderRadius: 12,
    borderWidth: 3,
  },

  borderHighlight: {
    borderRadius: 12,
    borderStyle: 'dashed',
  },

  glowHighlight: {
    borderRadius: 12,
    elevation: 10,
  },

  rippleHighlight: {
    borderRadius: 12,
    borderWidth: 2,
  },
});

// Hook for managing highlights
export const useHighlight = () => {
  const refs = useRef({});
  const [activeHighlight, setActiveHighlight] = React.useState(null);

  const registerRef = (id, ref) => {
    refs.current[id] = ref;
  };

  const highlight = (id, type = 'pulse', duration = 0) => {
    setActiveHighlight({ id, type });
    
    if (duration > 0) {
      setTimeout(() => {
        setActiveHighlight(null);
      }, duration);
    }
  };

  const clearHighlight = () => {
    setActiveHighlight(null);
  };

  return {
    refs: refs.current,
    activeHighlight,
    registerRef,
    highlight,
    clearHighlight,
  };
};

export default InteractiveHighlight;