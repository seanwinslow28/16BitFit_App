/**
 * Screen Transition Manager
 * Handles smooth transitions between screens with loading animations
 */

import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated } from 'react-native';
import AnimatedLoadingScreen, { LOADING_TYPES } from '../components/AnimatedLoadingScreen';
import SoundFXManager from './SoundFXManager';

// Transition types
const TRANSITION_TYPES = {
  FADE: 'fade',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SLIDE_UP: 'slideUp',
  SCALE: 'scale',
  GAME_BOY: 'gameboy', // Special GameBoy-style transition
};

// Create context
const TransitionContext = createContext();

// Provider component
export const ScreenTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState({
    type: LOADING_TYPES.DOTS,
    message: 'LOADING...',
    duration: 800,
  });
  
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  const startTransition = async (
    targetScreen,
    options = {}
  ) => {
    const {
      type = TRANSITION_TYPES.FADE,
      duration = 300,
      loadingType = LOADING_TYPES.DOTS,
      loadingMessage = 'LOADING...',
      loadingDuration = 800,
      playSound = true,
    } = options;

    if (isTransitioning) return;

    setIsTransitioning(true);
    setLoadingConfig({
      type: loadingType,
      message: loadingMessage,
      duration: loadingDuration,
    });

    // Play transition sound
    if (playSound) {
      await SoundFXManager.playSound('ui_transition');
    }

    // Start exit animation
    await performExitAnimation(type, duration);

    // Wait for loading screen
    await new Promise(resolve => setTimeout(resolve, loadingDuration));

    // Navigate to target screen
    if (typeof targetScreen === 'function') {
      targetScreen();
    }

    // Start entrance animation
    await performEntranceAnimation(type, duration);

    setIsTransitioning(false);
  };

  const performExitAnimation = (type, duration) => {
    return new Promise(resolve => {
      const animations = [];

      switch (type) {
        case TRANSITION_TYPES.FADE:
          animations.push(
            Animated.timing(screenOpacity, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_LEFT:
          animations.push(
            Animated.timing(screenTranslateX, {
              toValue: -300,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_RIGHT:
          animations.push(
            Animated.timing(screenTranslateX, {
              toValue: 300,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_UP:
          animations.push(
            Animated.timing(screenTranslateY, {
              toValue: -300,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SCALE:
          animations.push(
            Animated.timing(screenScale, {
              toValue: 0.8,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(screenOpacity, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.GAME_BOY:
          // GameBoy-style screen wipe
          animations.push(
            Animated.sequence([
              Animated.timing(screenScale, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(screenScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }

      Animated.parallel(animations).start(resolve);
    });
  };

  const performEntranceAnimation = (type, duration) => {
    // Reset values based on type
    switch (type) {
      case TRANSITION_TYPES.FADE:
        screenOpacity.setValue(0);
        break;
      case TRANSITION_TYPES.SLIDE_LEFT:
        screenTranslateX.setValue(300);
        break;
      case TRANSITION_TYPES.SLIDE_RIGHT:
        screenTranslateX.setValue(-300);
        break;
      case TRANSITION_TYPES.SLIDE_UP:
        screenTranslateY.setValue(300);
        break;
      case TRANSITION_TYPES.SCALE:
      case TRANSITION_TYPES.GAME_BOY:
        screenScale.setValue(0);
        screenOpacity.setValue(0);
        break;
    }

    return new Promise(resolve => {
      const animations = [];

      switch (type) {
        case TRANSITION_TYPES.FADE:
          animations.push(
            Animated.timing(screenOpacity, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_LEFT:
        case TRANSITION_TYPES.SLIDE_RIGHT:
          animations.push(
            Animated.timing(screenTranslateX, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SLIDE_UP:
          animations.push(
            Animated.timing(screenTranslateY, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.SCALE:
          animations.push(
            Animated.spring(screenScale, {
              toValue: 1,
              friction: 4,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(screenOpacity, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case TRANSITION_TYPES.GAME_BOY:
          animations.push(
            Animated.sequence([
              Animated.timing(screenScale, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.spring(screenScale, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(screenOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            })
          );
          break;
      }

      Animated.parallel(animations).start(resolve);
    });
  };

  const contextValue = {
    isTransitioning,
    startTransition,
    screenOpacity,
    screenTranslateX,
    screenTranslateY,
    screenScale,
  };

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
      {isTransitioning && (
        <AnimatedLoadingScreen
          type={loadingConfig.type}
          message={loadingConfig.message}
          duration={loadingConfig.duration}
        />
      )}
    </TransitionContext.Provider>
  );
};

// Hook to use transitions
export const useScreenTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useScreenTransition must be used within ScreenTransitionProvider');
  }
  return context;
};

// HOC to wrap screens with transition animations
export const withScreenTransition = (ScreenComponent) => {
  return (props) => {
    const { screenOpacity, screenTranslateX, screenTranslateY, screenScale } = useScreenTransition();

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: screenOpacity,
          transform: [
            { translateX: screenTranslateX },
            { translateY: screenTranslateY },
            { scale: screenScale },
          ],
        }}
      >
        <ScreenComponent {...props} />
      </Animated.View>
    );
  };
};

export { TRANSITION_TYPES };
export default {
  ScreenTransitionProvider,
  useScreenTransition,
  withScreenTransition,
  TRANSITION_TYPES,
};