/**
 * Navigation Animator Component
 * Wraps navigation actions with smooth animations
 * Following MetaSystemsAgent patterns for seamless UX
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import EnhancedScreenTransition, { TRANSITION_TYPES } from './EnhancedScreenTransition';
import SoundFXManager from '../services/SoundFXManager';
import SettingsManager from '../services/SettingsManager';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen-specific transition mappings
const SCREEN_TRANSITIONS = {
  // Home screen transitions
  home_to_workout: TRANSITION_TYPES.SLIDE_LEFT,
  home_to_feed: TRANSITION_TYPES.SLIDE_RIGHT,
  home_to_battle: TRANSITION_TYPES.BATTLE_ZOOM,
  home_to_stats: TRANSITION_TYPES.SLIDE_UP,
  home_to_social: TRANSITION_TYPES.SCALE_FADE,
  home_to_settings: TRANSITION_TYPES.FADE,
  
  // Battle screen transitions
  battle_to_home: TRANSITION_TYPES.SCALE_FADE,
  battle_victory: TRANSITION_TYPES.POWER_ON,
  battle_defeat: TRANSITION_TYPES.GLITCH,
  
  // Workout transitions
  workout_complete: TRANSITION_TYPES.PIXEL_DISSOLVE,
  workout_to_home: TRANSITION_TYPES.SLIDE_RIGHT,
  
  // Special transitions
  level_up: TRANSITION_TYPES.POWER_ON,
  evolution: TRANSITION_TYPES.SCREEN_WIPE,
  achievement: TRANSITION_TYPES.ROTATE_SCALE,
  error: TRANSITION_TYPES.GLITCH,
};

// Transition durations by type
const TRANSITION_DURATIONS = {
  [TRANSITION_TYPES.FADE]: 300,
  [TRANSITION_TYPES.SLIDE_LEFT]: 400,
  [TRANSITION_TYPES.SLIDE_RIGHT]: 400,
  [TRANSITION_TYPES.SLIDE_UP]: 350,
  [TRANSITION_TYPES.SLIDE_DOWN]: 350,
  [TRANSITION_TYPES.SCALE_FADE]: 400,
  [TRANSITION_TYPES.ROTATE_SCALE]: 600,
  [TRANSITION_TYPES.FLIP_HORIZONTAL]: 500,
  [TRANSITION_TYPES.FLIP_VERTICAL]: 500,
  [TRANSITION_TYPES.PIXEL_DISSOLVE]: 800,
  [TRANSITION_TYPES.SCAN_LINES]: 600,
  [TRANSITION_TYPES.SCREEN_WIPE]: 500,
  [TRANSITION_TYPES.POWER_OFF]: 400,
  [TRANSITION_TYPES.POWER_ON]: 600,
  [TRANSITION_TYPES.GLITCH]: 300,
  [TRANSITION_TYPES.BATTLE_ZOOM]: 800,
};

const NavigationAnimator = ({
  children,
  currentScreen,
  onNavigate,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(TRANSITION_TYPES.FADE);
  const [nextScreen, setNextScreen] = useState(null);
  const contentRef = useRef(null);

  const navigateWithAnimation = useCallback(async (
    targetScreen,
    options = {}
  ) => {
    // Check if animations are enabled in settings
    if (!SettingsManager.get('display.animations')) {
      onNavigate(targetScreen);
      return;
    }

    const {
      transition,
      duration,
      playSound = true,
      haptics = true,
    } = options;

    // Determine transition type
    const transitionKey = `${currentScreen}_to_${targetScreen}`;
    const selectedTransition = transition || 
                              SCREEN_TRANSITIONS[transitionKey] || 
                              TRANSITION_TYPES.FADE;
    
    const selectedDuration = duration || 
                            TRANSITION_DURATIONS[selectedTransition] || 
                            300;

    // Set up transition
    setTransitionType(selectedTransition);
    setNextScreen(targetScreen);
    setIsTransitioning(true);

    // Haptic feedback
    if (haptics && SettingsManager.shouldUseHaptics('button')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, selectedDuration));

    // Navigate to new screen
    onNavigate(targetScreen);
    
    // Reset transition state
    setIsTransitioning(false);
    setNextScreen(null);
  }, [currentScreen, onNavigate]);

  // Special animation triggers
  const triggerLevelUpAnimation = useCallback(async () => {
    setTransitionType(TRANSITION_TYPES.POWER_ON);
    setIsTransitioning(true);
    
    await SoundFXManager.playLevelUp();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATIONS[TRANSITION_TYPES.POWER_ON]);
  }, []);

  const triggerEvolutionAnimation = useCallback(async () => {
    setTransitionType(TRANSITION_TYPES.SCREEN_WIPE);
    setIsTransitioning(true);
    
    await SoundFXManager.playEvolution();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATIONS[TRANSITION_TYPES.SCREEN_WIPE]);
  }, []);

  const triggerErrorAnimation = useCallback(async () => {
    setTransitionType(TRANSITION_TYPES.GLITCH);
    setIsTransitioning(true);
    
    await SoundFXManager.playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATIONS[TRANSITION_TYPES.GLITCH]);
  }, []);

  // Expose navigation methods to children
  const navigationContext = {
    navigateWithAnimation,
    triggerLevelUpAnimation,
    triggerEvolutionAnimation,
    triggerErrorAnimation,
    isTransitioning,
    currentTransition: transitionType,
  };

  return (
    <View style={styles.container}>
      <EnhancedScreenTransition
        isTransitioning={isTransitioning}
        transitionType={transitionType}
        duration={TRANSITION_DURATIONS[transitionType]}
        onTransitionComplete={() => {
          // Additional cleanup if needed
        }}
      >
        <View ref={contentRef} style={styles.content}>
          {typeof children === 'function' 
            ? children(navigationContext)
            : children
          }
        </View>
      </EnhancedScreenTransition>
    </View>
  );
};

// Hook for easy access to navigation animator
export const useNavigationAnimator = () => {
  const [animator, setAnimator] = useState(null);

  return {
    setAnimator,
    navigate: animator?.navigateWithAnimation || (() => {}),
    triggerLevelUp: animator?.triggerLevelUpAnimation || (() => {}),
    triggerEvolution: animator?.triggerEvolutionAnimation || (() => {}),
    triggerError: animator?.triggerErrorAnimation || (() => {}),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});

export default NavigationAnimator;
export { SCREEN_TRANSITIONS, TRANSITION_DURATIONS };