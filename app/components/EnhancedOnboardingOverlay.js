/**
 * Enhanced Onboarding Overlay Component
 * GameBoy-style tutorial with improved highlights and coach dialogue
 * Following MetaSystemsAgent patterns for superior UX guidance
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import OnboardingManager from '../services/OnboardingManager';
import SoundFXManager from '../services/SoundFXManager';
import { showSuccess } from './ToastNotification';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.85)',
  highlight: 'rgba(146, 204, 65, 0.3)',
};

// Coach personality traits
const COACH_MOODS = {
  excited: '🤩',
  happy: '😊',
  thinking: '🤔',
  proud: '😎',
  encouraging: '💪',
  celebrating: '🎉',
};

const EnhancedOnboardingOverlay = ({
  visible = false,
  onComplete = () => {},
  onStepChange = () => {},
  targetRefs = {}, // References to elements that need highlighting
}) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coachMood, setCoachMood] = useState('happy');
  const [highlightPosition, setHighlightPosition] = useState(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const coachBounce = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  
  // Highlight animations
  const highlightScale = useRef(new Animated.Value(0)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.8)).current;

  // Confetti animations
  const confettiAnims = useRef(
    Array(20).fill(null).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      loadCurrentStep();
      startAnimations();
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep) {
      // Update coach mood based on step
      setCoachMood(currentStep.mood || 'happy');
      
      // Calculate highlight position if needed
      if (currentStep.highlight && targetRefs[currentStep.highlight]) {
        targetRefs[currentStep.highlight].measure((x, y, width, height, pageX, pageY) => {
          setHighlightPosition({
            x: pageX,
            y: pageY,
            width,
            height,
          });
        });
      }
      
      // Start typewriter effect
      typewriterEffect(currentStep.dialogue);
      
      // Animate highlight
      if (currentStep.highlight) {
        animateHighlight();
      }
    }
  }, [currentStep]);

  const typewriterEffect = (text) => {
    setIsTyping(true);
    setTypewriterText('');
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypewriterText(prev => prev + text[index]);
        index++;
        
        // Play typing sound occasionally
        if (index % 3 === 0) {
          SoundFXManager.playSound('ui_button_press', { volume: 0.2 });
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
    
    return () => clearInterval(interval);
  };

  const loadCurrentStep = async () => {
    const step = OnboardingManager.getCurrentStep();
    setCurrentStep(step);
    onStepChange(step);
    
    if (step && step.confetti) {
      triggerConfetti();
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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(coachBounce, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Arrow pointing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateHighlight = () => {
    // Scale in animation
    Animated.spring(highlightScale, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Fade in
    Animated.timing(highlightOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Ripple effect
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rippleScale, {
            toValue: 1.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    
    confettiAnims.forEach((anim, index) => {
      const startX = Math.random() * screenWidth;
      const endX = startX + (Math.random() - 0.5) * 200;
      const startY = -50;
      const endY = screenHeight + 50;
      const duration = 2000 + Math.random() * 1000;
      
      anim.x.setValue(startX);
      anim.y.setValue(startY);
      anim.rotate.setValue(0);
      anim.opacity.setValue(1);
      
      Animated.parallel([
        Animated.timing(anim.x, {
          toValue: endX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim.y, {
          toValue: endY,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    });
    
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleNext = async () => {
    if (isTyping) {
      // Skip typewriter effect
      setTypewriterText(currentStep.dialogue);
      setIsTyping(false);
      return;
    }
    
    await SoundFXManager.playButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const nextStep = await OnboardingManager.nextStep();
    
    if (nextStep) {
      // Animate transition
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(highlightScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(nextStep);
        onStepChange(nextStep);
        slideAnim.setValue(100);
        highlightScale.setValue(0);
        
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
    await SoundFXManager.playButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Show confirmation
    showSuccess('Tutorial skipped. You can replay it anytime in settings!');
    handleComplete();
  };

  const handleComplete = () => {
    // Celebration animation
    triggerConfetti();
    setCoachMood('celebrating');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 500,
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
        {/* Dark overlay with cutout for highlight */}
        <View style={styles.overlay}>
          {highlightPosition && (
            <>
              {/* Top overlay */}
              <View style={[styles.overlaySection, { height: highlightPosition.y - 10 }]} />
              
              {/* Left overlay */}
              <View style={[
                styles.overlaySection, 
                { 
                  top: highlightPosition.y - 10,
                  width: highlightPosition.x - 10,
                  height: highlightPosition.height + 20,
                }
              ]} />
              
              {/* Right overlay */}
              <View style={[
                styles.overlaySection, 
                { 
                  top: highlightPosition.y - 10,
                  left: highlightPosition.x + highlightPosition.width + 10,
                  right: 0,
                  height: highlightPosition.height + 20,
                }
              ]} />
              
              {/* Bottom overlay */}
              <View style={[
                styles.overlaySection, 
                { 
                  top: highlightPosition.y + highlightPosition.height + 10,
                  bottom: 0,
                }
              ]} />
            </>
          )}
        </View>
        
        {/* Highlight area with animations */}
        {highlightPosition && (
          <View
            style={[
              styles.highlightContainer,
              {
                left: highlightPosition.x - 10,
                top: highlightPosition.y - 10,
                width: highlightPosition.width + 20,
                height: highlightPosition.height + 20,
              },
            ]}
            pointerEvents="none"
          >
            {/* Main highlight */}
            <Animated.View
              style={[
                styles.highlight,
                {
                  opacity: highlightOpacity,
                  transform: [{ scale: highlightScale }],
                },
              ]}
            />
            
            {/* Ripple effect */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
            />
            
            {/* Pointing arrow */}
            {currentStep.arrow && (
              <Animated.View
                style={[
                  styles.arrow,
                  currentStep.arrow === 'top' && styles.arrowTop,
                  currentStep.arrow === 'bottom' && styles.arrowBottom,
                  currentStep.arrow === 'left' && styles.arrowLeft,
                  currentStep.arrow === 'right' && styles.arrowRight,
                  {
                    transform: [
                      { 
                        translateY: currentStep.arrow === 'top' || currentStep.arrow === 'bottom' 
                          ? arrowAnim 
                          : 0 
                      },
                      { 
                        translateX: currentStep.arrow === 'left' || currentStep.arrow === 'right' 
                          ? arrowAnim 
                          : 0 
                      },
                    ],
                  },
                ]}
              >
                <Text style={[styles.arrowText, pixelFont]}>
                  {currentStep.arrow === 'top' ? '↓' : 
                   currentStep.arrow === 'bottom' ? '↑' :
                   currentStep.arrow === 'left' ? '→' : '←'}
                </Text>
              </Animated.View>
            )}
          </View>
        )}
        
        {/* Coach dialogue box */}
        <Animated.View
          style={[
            styles.dialogueBox,
            {
              transform: [
                { translateY: slideAnim },
                { translateY: coachBounce },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)']}
            style={styles.dialogueGradient}
          >
            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
            
            {/* Coach header */}
            <View style={styles.coachHeader}>
              <View style={styles.coachAvatar}>
                <Text style={styles.coachEmoji}>{COACH_MOODS[coachMood]}</Text>
              </View>
              <View style={styles.coachInfo}>
                <Text style={[styles.coachName, pixelFont]}>{coach.name}</Text>
                <Text style={[styles.coachTitle, pixelFont]}>{coach.title}</Text>
              </View>
              {currentStep.canSkip && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={[styles.skipText, pixelFont]}>SKIP</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Dialogue content */}
            <ScrollView 
              style={styles.dialogueContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.dialogueText, pixelFont]}>
                {typewriterText}
                {isTyping && <Text style={styles.cursor}>_</Text>}
              </Text>
              
              {/* Action hints */}
              {currentStep.action && !isTyping && (
                <View style={styles.actionHint}>
                  <Text style={[styles.actionIcon, pixelFont]}>👆</Text>
                  <Text style={[styles.actionText, pixelFont]}>
                    {currentStep.action}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            {/* Navigation buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNext}
              >
                <Text style={[styles.buttonText, pixelFont]}>
                  {isTyping ? 'SKIP' : currentStep.buttonText || 'NEXT'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Confetti overlay */}
        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {confettiAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    backgroundColor: index % 3 === 0 ? COLORS.primary : 
                                   index % 3 === 1 ? COLORS.yellow : COLORS.red,
                    transform: [
                      { translateX: anim.x },
                      { translateY: anim.y },
                      { rotate: anim.rotate.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        })
                      },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  overlaySection: {
    position: 'absolute',
    backgroundColor: COLORS.overlay,
  },

  highlightContainer: {
    position: 'absolute',
  },

  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.highlight,
  },

  ripple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  arrow: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  arrowTop: {
    top: -40,
    alignSelf: 'center',
  },

  arrowBottom: {
    bottom: -40,
    alignSelf: 'center',
  },

  arrowLeft: {
    left: -50,
    top: '50%',
    marginTop: -20,
  },

  arrowRight: {
    right: -50,
    top: '50%',
    marginTop: -20,
  },

  arrowText: {
    fontSize: 16,
    color: COLORS.dark,
  },

  dialogueBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    maxHeight: 300,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  dialogueGradient: {
    padding: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  coachEmoji: {
    fontSize: 24,
  },

  coachInfo: {
    flex: 1,
    marginLeft: 12,
  },

  coachName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  coachTitle: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.red,
  },

  skipText: {
    fontSize: 10,
    color: COLORS.red,
    letterSpacing: 1,
  },

  dialogueContent: {
    maxHeight: 120,
    marginBottom: 16,
  },

  dialogueText: {
    fontSize: 12,
    color: COLORS.white,
    lineHeight: 20,
    letterSpacing: 0.5,
  },

  cursor: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  actionText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    flex: 1,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 3,
  },

  nextButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  buttonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default EnhancedOnboardingOverlay;