/**
 * Health Permissions Flow Component
 * Guides users through health tracking permissions setup
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HealthTrackingManager from '../services/HealthTrackingManager';

const PERMISSION_STEPS = [
  {
    id: 'intro',
    title: 'Power Up Your Character',
    description: 'Connect your real-world fitness to level up your character automatically!',
    icon: '🎮',
    benefits: [
      'Auto-track workouts for instant stat boosts',
      'Steps convert to XP automatically',
      'Sleep quality affects recovery multipliers',
      'Nutrition tracking for strategic advantages'
    ]
  },
  {
    id: 'health',
    title: 'Connect Health Data',
    description: Platform.OS === 'ios' 
      ? 'Allow 16BitFit to read from Apple Health'
      : 'Allow 16BitFit to connect to Google Fit',
    icon: '❤️',
    permissions: ['steps', 'workouts', 'heartRate', 'sleep']
  },
  {
    id: 'notifications',
    title: 'Enable Notifications',
    description: 'Get reminders for daily goals and evolution ceremonies',
    icon: '🔔',
    optional: true
  },
  {
    id: 'complete',
    title: 'Ready to Battle!',
    description: 'Your fitness journey begins now!',
    icon: '⚔️'
  }
];

export default function HealthPermissionsFlow({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    animateIn();
  }, [currentStep]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleHealthPermissions = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Initialize health services
      const initialized = await HealthTrackingManager.initialize();
      
      if (initialized) {
        // Request permissions
        const healthPerms = await HealthTrackingManager.requestAllPermissions();
        setPermissions(healthPerms);
        
        // Move to next step
        handleNext();
      } else {
        // Handle permission denial
        handleSkip();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      handleSkip();
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPermissions = async () => {
    // TODO: Implement notification permissions
    handleNext();
  };

  const handleNext = () => {
    if (currentStep < PERMISSION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSetup();
    }
  };

  const handleSkip = () => {
    if (PERMISSION_STEPS[currentStep].optional || currentStep === 0) {
      handleNext();
    } else {
      // Skip entire setup
      if (onSkip) {
        onSkip();
      } else {
        completeSetup();
      }
    }
  };

  const completeSetup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onComplete) {
      onComplete(permissions);
    }
  };

  const renderStepContent = () => {
    const step = PERMISSION_STEPS[currentStep];

    switch (step.id) {
      case 'intro':
        return renderIntroStep(step);
      case 'health':
        return renderHealthStep(step);
      case 'notifications':
        return renderNotificationStep(step);
      case 'complete':
        return renderCompleteStep(step);
      default:
        return null;
    }
  };

  const renderIntroStep = (step) => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Text style={styles.stepIcon}>{step.icon}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
      
      <View style={styles.benefitsList}>
        {step.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleNext}
      >
        <LinearGradient
          colors={['#00D4FF', '#0099CC']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Maybe Later</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHealthStep = (step) => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Text style={styles.stepIcon}>{step.icon}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
      
      <View style={styles.permissionsList}>
        <Text style={styles.permissionsTitle}>We'll track:</Text>
        {step.permissions.map((perm, index) => (
          <View key={index} style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>
              {perm === 'steps' && '👟'}
              {perm === 'workouts' && '💪'}
              {perm === 'heartRate' && '💓'}
              {perm === 'sleep' && '😴'}
            </Text>
            <Text style={styles.permissionText}>{perm}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.privacyNote}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          Your health data stays private and is only used to power up your character
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleHealthPermissions}
        disabled={loading}
      >
        <LinearGradient
          colors={['#00D4FF', '#0099CC']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connecting...' : 'Connect Health Data'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip for Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderNotificationStep = (step) => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Text style={styles.stepIcon}>{step.icon}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
      
      <View style={styles.notificationTypes}>
        <View style={styles.notificationType}>
          <Text style={styles.notificationIcon}>🎯</Text>
          <Text style={styles.notificationTitle}>Daily Goals</Text>
          <Text style={styles.notificationDesc}>Reminders to hit your targets</Text>
        </View>
        
        <View style={styles.notificationType}>
          <Text style={styles.notificationIcon}>⚡</Text>
          <Text style={styles.notificationTitle}>Evolution Ready</Text>
          <Text style={styles.notificationDesc}>When you're ready to evolve</Text>
        </View>
        
        <View style={styles.notificationType}>
          <Text style={styles.notificationIcon}>🏆</Text>
          <Text style={styles.notificationTitle}>Achievements</Text>
          <Text style={styles.notificationDesc}>Celebrate your victories</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleNotificationPermissions}
      >
        <LinearGradient
          colors={['#00D4FF', '#0099CC']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Enable Notifications</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Not Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCompleteStep = (step) => (
    <Animated.View style={[
      styles.stepContent,
      styles.completeContent,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Text style={styles.stepIcon}>{step.icon}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
      
      <View style={styles.setupSummary}>
        <Text style={styles.summaryTitle}>Setup Complete!</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>✓</Text>
          <Text style={styles.summaryText}>Health tracking active</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>✓</Text>
          <Text style={styles.summaryText}>Character ready for battle</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>✓</Text>
          <Text style={styles.summaryText}>Evolution system unlocked</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={completeSetup}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Start Fighting!</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.gradient}
      >
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / PERMISSION_STEPS.length) * 100}%` }
            ]}
          />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 60,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeContent: {
    justifyContent: 'space-around',
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#00D4FF',
    marginRight: 10,
  },
  benefitText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#CCC',
    flex: 1,
    lineHeight: 16,
  },
  permissionsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  permissionsTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    marginBottom: 15,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  permissionText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#CCC',
    textTransform: 'capitalize',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  privacyText: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    flex: 1,
    lineHeight: 14,
  },
  notificationTypes: {
    width: '100%',
    marginBottom: 40,
  },
  notificationType: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    marginBottom: 5,
  },
  notificationDesc: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
    textAlign: 'center',
  },
  setupSummary: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 40,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 10,
  },
  summaryText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#CCC',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 15,
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#666',
  },
});