/**
 * Enhanced Screen Transition Component
 * Advanced transitions with GameBoy-style effects
 * Following MetaSystemsAgent patterns for smooth UX
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy colors
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  screenGreen: '#9BBD0F',
  pixelGrid: 'rgba(0, 0, 0, 0.1)',
};

// Enhanced transition types
export const TRANSITION_TYPES = {
  // Basic transitions
  FADE: 'fade',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  
  // Advanced transitions
  SCALE_FADE: 'scaleFade',
  ROTATE_SCALE: 'rotateScale',
  FLIP_HORIZONTAL: 'flipHorizontal',
  FLIP_VERTICAL: 'flipVertical',
  
  // GameBoy-specific transitions
  PIXEL_DISSOLVE: 'pixelDissolve',
  SCAN_LINES: 'scanLines',
  SCREEN_WIPE: 'screenWipe',
  POWER_OFF: 'powerOff',
  POWER_ON: 'powerOn',
  GLITCH: 'glitch',
  BATTLE_ZOOM: 'battleZoom',
};

const EnhancedScreenTransition = ({
  children,
  isTransitioning = false,
  transitionType = TRANSITION_TYPES.FADE,
  duration = 300,
  onTransitionComplete = () => {},
  style,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  
  // GameBoy-specific animations
  const pixelSize = useRef(new Animated.Value(1)).current;
  const scanLinePosition = useRef(new Animated.Value(0)).current;
  const wipePosition = useRef(new Animated.Value(0)).current;
  const powerAnim = useRef(new Animated.Value(1)).current;
  const glitchOffset = useRef(new Animated.Value(0)).current;
  
  // Pixel grid for dissolve effect
  const [pixelGrid, setPixelGrid] = useState([]);

  useEffect(() => {
    if (isTransitioning) {
      performTransition();
    } else {
      resetAnimations();
    }
  }, [isTransitioning, transitionType]);

  useEffect(() => {
    // Initialize pixel grid for dissolve effect
    if (transitionType === TRANSITION_TYPES.PIXEL_DISSOLVE) {
      const gridSize = 20;
      const pixels = [];
      for (let i = 0; i < gridSize * gridSize; i++) {
        pixels.push({
          id: i,
          delay: Math.random() * duration * 0.5,
          opacity: new Animated.Value(1),
        });
      }
      setPixelGrid(pixels);
    }
  }, [transitionType]);

  const performTransition = async () => {
    // Play transition sound based on type
    const soundMap = {
      [TRANSITION_TYPES.POWER_OFF]: 'ui_power_off',
      [TRANSITION_TYPES.POWER_ON]: 'ui_power_on',
      [TRANSITION_TYPES.GLITCH]: 'ui_glitch',
      [TRANSITION_TYPES.BATTLE_ZOOM]: 'battle_ready',
    };
    
    const sound = soundMap[transitionType] || 'ui_transition';
    await SoundFXManager.playSound(sound);

    // Perform exit animation
    await performExitAnimation();
    
    // Notify completion
    onTransitionComplete();
    
    // Reset for next transition
    setTimeout(() => {
      resetAnimations();
    }, 100);
  };

  const performExitAnimation = () => {
    return new Promise(resolve => {
      const animations = [];

      switch (transitionType) {
        case TRANSITION_TYPES.FADE:
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_LEFT:
          animations.push(
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: -screenWidth,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: duration * 0.8,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.SLIDE_RIGHT:
          animations.push(
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: screenWidth,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: duration * 0.8,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.SLIDE_UP:
          animations.push(
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: -screenHeight,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: duration * 0.8,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.SCALE_FADE:
          animations.push(
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.ROTATE_SCALE:
          animations.push(
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: duration * 0.8,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.FLIP_HORIZONTAL:
          animations.push(
            Animated.sequence([
              Animated.timing(flipAnim, {
                toValue: 90,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.PIXEL_DISSOLVE:
          // Animate each pixel individually
          pixelGrid.forEach(pixel => {
            animations.push(
              Animated.timing(pixel.opacity, {
                toValue: 0,
                duration: duration * 0.5,
                delay: pixel.delay,
                useNativeDriver: true,
              })
            );
          });
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration,
              delay: duration * 0.5,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SCAN_LINES:
          animations.push(
            Animated.parallel([
              Animated.loop(
                Animated.timing(scanLinePosition, {
                  toValue: screenHeight,
                  duration: 1000,
                  useNativeDriver: true,
                }),
                { iterations: Math.ceil(duration / 1000) }
              ),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.SCREEN_WIPE:
          animations.push(
            Animated.timing(wipePosition, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            })
          );
          break;

        case TRANSITION_TYPES.POWER_OFF:
          animations.push(
            Animated.parallel([
              Animated.timing(powerAnim, {
                toValue: 0,
                duration: duration * 0.7,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(duration * 0.6),
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: duration * 0.3,
                  useNativeDriver: true,
                }),
              ]),
            ])
          );
          break;

        case TRANSITION_TYPES.GLITCH:
          animations.push(
            Animated.parallel([
              Animated.loop(
                Animated.sequence([
                  Animated.timing(glitchOffset, {
                    toValue: 10,
                    duration: 50,
                    useNativeDriver: true,
                  }),
                  Animated.timing(glitchOffset, {
                    toValue: -10,
                    duration: 50,
                    useNativeDriver: true,
                  }),
                  Animated.timing(glitchOffset, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                  }),
                ]),
                { iterations: Math.floor(duration / 150) }
              ),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case TRANSITION_TYPES.BATTLE_ZOOM:
          animations.push(
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 3,
                duration,
                easing: Easing.in(Easing.exp),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(duration * 0.3),
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: duration * 0.3,
                  useNativeDriver: true,
                }),
              ]),
            ])
          );
          break;

        default:
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start(() => resolve());
      } else {
        resolve();
      }
    });
  };

  const resetAnimations = () => {
    fadeAnim.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    flipAnim.setValue(0);
    pixelSize.setValue(1);
    scanLinePosition.setValue(0);
    wipePosition.setValue(0);
    powerAnim.setValue(1);
    glitchOffset.setValue(0);
    
    pixelGrid.forEach(pixel => {
      pixel.opacity.setValue(1);
    });
  };

  const getTransform = () => {
    const transforms = [
      { translateX },
      { translateY },
      { scale: scaleAnim },
    ];

    if (transitionType === TRANSITION_TYPES.ROTATE_SCALE) {
      transforms.push({
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      });
    }

    if (transitionType === TRANSITION_TYPES.FLIP_HORIZONTAL) {
      transforms.push({
        rotateY: flipAnim.interpolate({
          inputRange: [0, 90],
          outputRange: ['0deg', '90deg'],
        }),
      });
    }

    if (transitionType === TRANSITION_TYPES.GLITCH) {
      transforms.push({ translateX: glitchOffset });
    }

    return transforms;
  };

  const renderSpecialEffects = () => {
    switch (transitionType) {
      case TRANSITION_TYPES.PIXEL_DISSOLVE:
        return (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {pixelGrid.map((pixel, index) => {
              const row = Math.floor(index / 20);
              const col = index % 20;
              return (
                <Animated.View
                  key={pixel.id}
                  style={[
                    styles.pixel,
                    {
                      left: `${col * 5}%`,
                      top: `${row * 5}%`,
                      opacity: pixel.opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        );

      case TRANSITION_TYPES.SCAN_LINES:
        return (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLinePosition }],
                },
              ]}
            />
          </View>
        );

      case TRANSITION_TYPES.SCREEN_WIPE:
        return (
          <Animated.View
            style={[
              styles.wipeOverlay,
              {
                width: wipePosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        );

      case TRANSITION_TYPES.POWER_OFF:
        return (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View
              style={[
                styles.powerOffLine,
                {
                  opacity: fadeAnim,
                  height: powerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, screenHeight],
                  }),
                },
              ]}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: getTransform(),
          },
        ]}
      >
        {children}
      </Animated.View>
      {renderSpecialEffects()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  pixel: {
    position: 'absolute',
    width: '5%',
    height: '5%',
    backgroundColor: COLORS.dark,
  },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },

  wipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.dark,
  },

  powerOffLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    backgroundColor: COLORS.screenGreen,
    transform: [{ translateY: -1 }],
  },
});

export default EnhancedScreenTransition;