/**
 * Onboarding Overlay Component
 * GameBoy-style tutorial overlay with Coach 8-Bit
 * Following MetaSystemsAgent patterns for guided UX
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import OnboardingManager from '../services/OnboardingManager';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const OnboardingOverlay = ({
  visible = false,
  onComplete = () => {},
  onStepChange = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const coachBounce = useRef(new Animated.Value(0)).current;
  
  // Highlight animation
  const highlightScale = useRef(new Animated.Value(0.8)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadCurrentStep();
      startAnimations();
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep && currentStep.highlight) {
      animateHighlight();
    }
  }, [currentStep]);

  const loadCurrentStep = async () => {
    const step = OnboardingManager.getCurrentStep();
    setCurrentStep(step);
    onStepChange(step);
    
    if (step && step.confetti) {
      setShowConfetti(true);
    }
  };

  const startAnimations = () => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Coach bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(coachBounce, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(coachBounce, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for interactive elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateHighlight = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(highlightScale, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(highlightScale, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(highlightOpacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(highlightOpacity, {
            toValue: 0.2,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  const handleNext = async () => {
    await SoundFXManager.playButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const nextStep = await OnboardingManager.nextStep();
    
    if (nextStep) {
      // Animate transition
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(nextStep);
        onStepChange(nextStep);
        slideAnim.setValue(100);
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Onboarding complete
      handleComplete();
    }
  };

  const handleSkip = async () => {
    if (currentStep && currentStep.canSkip) {
      await SoundFXManager.playButtonPress();
      const nextStep = await OnboardingManager.skipStep();
      setCurrentStep(nextStep);
      onStepChange(nextStep);
    }
  };

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  if (!visible || !currentStep) return null;

  const coach = OnboardingManager.getCoach();
  const progress = OnboardingManager.getProgressPercentage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim }
        ]}
      >
        {/* Dark overlay */}
        <View style={styles.overlay} />
        
        {/* Highlight area if specified */}
        {currentStep.highlight && (
          <Animated.View
            style={[
              styles.highlight,
              {
                opacity: highlightOpacity,
                transform: [{ scale: highlightScale }],
              },
            ]}
          />
        )}
        
        {/* Coach dialogue box */}
        <Animated.View
          style={[
            styles.dialogueContainer,
            {
              transform: [
                { translateY: slideAnim },
                { translateY: coachBounce },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, '#7fb435', COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dialogueBox}
          >
            {/* Coach header */}
            <View style={styles.coachHeader}>
              <Text style={styles.coachIcon}>{coach.sprite}</Text>
              <View style={styles.coachInfo}>
                <Text style={[styles.coachName, pixelFont]}>{coach.name}</Text>
                <Text style={[styles.stepTitle, pixelFont]}>{currentStep.title}</Text>
              </View>
            </View>
            
            {/* Coach message */}
            <Text style={[styles.coachMessage, pixelFont]}>
              {currentStep.coach}
            </Text>
            
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, pixelFont]}>
                {Math.floor(currentStep.id === 'completion' ? 100 : progress)}%
              </Text>
            </View>
            
            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {currentStep.canSkip && (
                <TouchableOpacity
                  style={[styles.button, styles.skipButton]}
                  onPress={handleSkip}
                >
                  <Text style={[styles.skipButtonText, pixelFont]}>Skip</Text>
                </TouchableOpacity>
              )}
              
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  flex: currentStep.canSkip ? 0 : 1,
                }}
              >
                <TouchableOpacity
                  style={[styles.button, styles.nextButton]}
                  onPress={handleNext}
                >
                  <Text style={[styles.nextButtonText, pixelFont]}>
                    {currentStep.nextButton}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Confetti effect for completion */}
        {showConfetti && <ConfettiAnimation />}
      </Animated.View>
    </Modal>
  );
};

// Simple confetti animation component
const ConfettiAnimation = () => {
  const particles = Array(20).fill(0).map((_, i) => {
    const animValue = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }, []);
    
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, screenHeight],
    });
    
    const translateX = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
    });
    
    const opacity = animValue.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [1, 1, 0],
    });
    
    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    return (
      <Animated.View
        key={i}
        style={[
          styles.confettiParticle,
          {
            left: Math.random() * screenWidth,
            backgroundColor: ['#F7D51D', '#92CC41', '#E53935', '#3498db'][i % 4],
            opacity,
            transform: [
              { translateY },
              { translateX },
              { rotate },
            ],
          },
        ]}
      />
    );
  });
  
  return <View style={styles.confettiContainer}>{particles}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  highlight: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(247, 213, 29, 0.2)',
  },

  dialogueContainer: {
    width: screenWidth - 40,
    maxWidth: 400,
    marginHorizontal: 20,
  },

  dialogueBox: {
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.dark,
    padding: 20,
    backgroundColor: COLORS.primary,
  },

  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.dark,
  },

  coachIcon: {
    fontSize: 40,
    marginRight: 12,
  },

  coachInfo: {
    flex: 1,
  },

  coachName: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 2,
  },

  stepTitle: {
    fontSize: 10,
    color: 'rgba(13, 13, 13, 0.7)',
    letterSpacing: 0.5,
  },

  coachMessage: {
    fontSize: 11,
    color: COLORS.dark,
    lineHeight: 18,
    marginBottom: 20,
    textAlign: 'left',
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },

  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(13, 13, 13, 0.2)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.yellow,
    borderRadius: 4,
  },

  progressText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
    minWidth: 35,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipButton: {
    backgroundColor: 'rgba(13, 13, 13, 0.2)',
    borderColor: 'rgba(13, 13, 13, 0.5)',
  },

  nextButton: {
    backgroundColor: COLORS.yellow,
    flex: 1,
  },

  skipButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
    opacity: 0.7,
  },

  nextButtonText: {
    fontSize: 11,
    color: COLORS.dark,
    letterSpacing: 1,
    fontWeight: 'bold',
  },

  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },

  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: -20,
  },
});

export default OnboardingOverlay;