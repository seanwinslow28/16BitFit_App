/**
 * Screen Entrance Animation Component
 * Provides smooth entrance animations for screens
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const ENTRANCE_TYPES = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SCALE_UP: 'scaleUp',
  GAME_BOY_WIPE: 'gameBoyWipe',
  STAGGER_IN: 'staggerIn',
};

const ScreenEntranceAnimation = ({
  children,
  type = ENTRANCE_TYPES.FADE_IN,
  duration = 300,
  delay = 0,
  staggerDelay = 50,
  onComplete = () => {},
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const startAnimation = () => {
      const animations = [];

      switch (type) {
        case ENTRANCE_TYPES.FADE_IN:
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          );
          break;

        case ENTRANCE_TYPES.SLIDE_UP:
          translateY.setValue(50);
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.SLIDE_DOWN:
          translateY.setValue(-50);
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.SLIDE_LEFT:
          translateX.setValue(100);
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.SLIDE_RIGHT:
          translateX.setValue(-100);
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.SCALE_UP:
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.GAME_BOY_WIPE:
          // GameBoy-style screen wipe effect
          scaleAnim.setValue(0);
          animations.push(
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 60,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ENTRANCE_TYPES.STAGGER_IN:
          // For staggered animations, handle in parent component
          animations.push(
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay: delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay: delay,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }

      // Start animations with delay
      setTimeout(() => {
        Animated.parallel(animations).start(({ finished }) => {
          if (finished) {
            onComplete();
          }
        });
      }, delay);
    };

    startAnimation();
  }, [type, duration, delay]);

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
    };

    const transforms = [];

    if (type === ENTRANCE_TYPES.SLIDE_UP || type === ENTRANCE_TYPES.SLIDE_DOWN || type === ENTRANCE_TYPES.STAGGER_IN) {
      transforms.push({ translateY });
    }

    if (type === ENTRANCE_TYPES.SLIDE_LEFT || type === ENTRANCE_TYPES.SLIDE_RIGHT) {
      transforms.push({ translateX });
    }

    if (type === ENTRANCE_TYPES.SCALE_UP || type === ENTRANCE_TYPES.GAME_BOY_WIPE) {
      transforms.push({ scale: scaleAnim });
    }

    if (transforms.length > 0) {
      baseStyle.transform = transforms;
    }

    return baseStyle;
  };

  return (
    <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

// Stagger container for multiple items
const StaggeredEntrance = ({ children, staggerDelay = 50, baseDelay = 0 }) => {
  return React.Children.map(children, (child, index) => (
    <ScreenEntranceAnimation
      type={ENTRANCE_TYPES.STAGGER_IN}
      delay={baseDelay + (index * staggerDelay)}
    >
      {child}
    </ScreenEntranceAnimation>
  ));
};

export { ScreenEntranceAnimation, StaggeredEntrance, ENTRANCE_TYPES };
export default ScreenEntranceAnimation;