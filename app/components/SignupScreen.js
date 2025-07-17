/**
 * Signup Screen Component
 * GameBoy-style registration with validation
 * Following MetaSystemsAgent patterns for user onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';
import ValidatedForm from './ValidatedForm';
import GameBoyButton from './GameBoyButton';
import EnhancedScreenTransition from './EnhancedScreenTransition';
import AnimatedStatsDisplay from './AnimatedStatsDisplay';
import { FadeIn, BounceIn, Pulse } from './MicroAnimations';
import SoundFXManager from '../services/SoundFXManager';
import { VALIDATION_RULES } from '../services/ValidationService';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const SignupScreen = ({ onSignup, onLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountData, setAccountData] = useState({});
  const [characterData, setCharacterData] = useState({});
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  // Step 1: Account Creation
  const accountFields = [
    {
      name: 'email',
      label: 'EMAIL ADDRESS',
      placeholder: 'trainer@16bitfit.com',
      keyboardType: 'email-address',
      required: true,
      validateOnBlur: true,
      validationRules: VALIDATION_RULES.email,
    },
    {
      name: 'username',
      label: 'USERNAME',
      placeholder: 'FitWarrior123',
      required: true,
      validateOnBlur: true,
      validationRules: VALIDATION_RULES.username,
      maxLength: 20,
    },
    {
      name: 'password',
      label: 'PASSWORD',
      placeholder: '••••••••',
      secureTextEntry: !showPasswordToggle,
      required: true,
      validateOnBlur: true,
      validationRules: VALIDATION_RULES.password,
    },
    {
      name: 'confirmPassword',
      label: 'CONFIRM PASSWORD',
      placeholder: '••••••••',
      secureTextEntry: !showPasswordToggle,
      required: true,
      validateOnBlur: true,
      validationRules: {
        ...VALIDATION_RULES.password,
        messages: {
          ...VALIDATION_RULES.password.messages,
          match: 'Passwords do not match',
        },
      },
    },
  ];

  // Step 2: Character Creation
  const characterFields = [
    {
      name: 'characterName',
      label: 'CHARACTER NAME',
      placeholder: 'Mighty Max',
      required: true,
      validateOnBlur: true,
      validationRules: VALIDATION_RULES.characterName,
      maxLength: 15,
    },
    {
      name: 'fitnessGoal',
      label: 'FITNESS GOAL',
      placeholder: 'Get stronger and healthier',
      multiline: true,
      numberOfLines: 3,
      maxLength: 100,
      required: false,
    },
    {
      name: 'experienceLevel',
      label: 'EXPERIENCE LEVEL',
      placeholder: 'Beginner',
      required: true,
      validationRules: {
        options: ['Beginner', 'Intermediate', 'Advanced'],
        messages: {
          required: 'Please select your experience level',
          invalid: 'Invalid experience level',
        },
      },
    },
  ];

  const handleAccountSubmit = async (formData) => {
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    setAccountData(formData);
    setCurrentStep(2);
    await SoundFXManager.playSound('ui_success');
  };

  const handleCharacterSubmit = async (formData) => {
    setCharacterData(formData);
    
    // Combine all data and create account
    const fullData = {
      ...accountData,
      ...formData,
      initialStats: {
        health: 50,
        strength: 50,
        stamina: 50,
        happiness: 50,
        weight: 50,
      },
    };

    if (onSignup) {
      await onSignup(fullData);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
        <Text style={[styles.stepNumber, pixelFont]}>1</Text>
        <Text style={[styles.stepLabel, pixelFont]}>ACCOUNT</Text>
      </View>
      
      <View style={styles.stepConnector} />
      
      <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
        <Text style={[styles.stepNumber, pixelFont]}>2</Text>
        <Text style={[styles.stepLabel, pixelFont]}>CHARACTER</Text>
      </View>
    </View>
  );

  const renderPasswordToggle = () => (
    <TouchableOpacity
      style={styles.passwordToggle}
      onPress={() => {
        setShowPasswordToggle(!showPasswordToggle);
        SoundFXManager.playSound('ui_toggle');
      }}
    >
      <Text style={[styles.passwordToggleText, pixelFont]}>
        {showPasswordToggle ? 'HIDE' : 'SHOW'} PASSWORDS
      </Text>
    </TouchableOpacity>
  );

  const renderCharacterPreview = () => (
    <FadeIn>
      <View style={styles.characterPreview}>
        <Pulse duration={2000}>
          <Text style={styles.characterEmoji}>🥚</Text>
        </Pulse>
        <Text style={[styles.characterPreviewText, pixelFont]}>
          YOUR CHARACTER AWAITS
        </Text>
        <AnimatedStatsDisplay
          stats={{
            health: 50,
            strength: 50,
            stamina: 50,
            happiness: 50,
            weight: 50,
          }}
          style={styles.statsPreview}
        />
      </View>
    </FadeIn>
  );

  const renderHeader = () => (
    <FadeIn>
      <View style={styles.header}>
        <BounceIn>
          <Text style={styles.logo}>🎮</Text>
        </BounceIn>
        <Text style={[styles.title, pixelFont]}>CREATE ACCOUNT</Text>
        <Text style={[styles.subtitle, pixelFont]}>
          {currentStep === 1 ? 'SET UP YOUR PLAYER PROFILE' : 'CREATE YOUR CHARACTER'}
        </Text>
      </View>
    </FadeIn>
  );

  return (
    <EnhancedScreenTransition type="slideUp">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)']}
          style={styles.gradient}
        >
          {renderHeader()}
          {renderStepIndicator()}

          {currentStep === 1 ? (
            <>
              {renderPasswordToggle()}
              <ValidatedForm
                fields={accountFields}
                onSubmit={handleAccountSubmit}
                submitButtonText="NEXT STEP →"
                title="PLAYER INFORMATION"
                description="Choose a unique username and secure password"
                style={styles.form}
              />
            </>
          ) : (
            <>
              {renderCharacterPreview()}
              <ValidatedForm
                fields={characterFields}
                onSubmit={handleCharacterSubmit}
                submitButtonText="START ADVENTURE"
                title="CHARACTER DETAILS"
                description="Customize your character and set your goals"
                style={styles.form}
              />
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, pixelFont]}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => {
                SoundFXManager.playSound('ui_button_press');
                if (onLogin) onLogin();
              }}
              style={styles.loginButton}
            >
              <Text style={[styles.loginButtonText, pixelFont]}>
                LOGIN INSTEAD
              </Text>
            </TouchableOpacity>
          </View>

          {currentStep === 2 && (
            <GameBoyButton
              onPress={() => {
                setCurrentStep(1);
                SoundFXManager.playSound('ui_menu_close');
              }}
              variant="ghost"
              style={styles.backButton}
            >
              <Text style={[styles.backButtonText, pixelFont]}>
                ← BACK
              </Text>
            </GameBoyButton>
          )}
        </LinearGradient>
      </ScrollView>
    </EnhancedScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  contentContainer: {
    flexGrow: 1,
  },

  gradient: {
    flex: 1,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logo: {
    fontSize: 48,
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
  },

  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },

  step: {
    alignItems: 'center',
    opacity: 0.5,
  },

  stepActive: {
    opacity: 1,
  },

  stepNumber: {
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 4,
  },

  stepLabel: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 1,
  },

  stepConnector: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gray,
    marginHorizontal: 16,
  },

  passwordToggle: {
    alignSelf: 'center',
    marginBottom: 20,
    padding: 8,
  },

  passwordToggleText: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },

  characterPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },

  characterEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },

  characterPreviewText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 16,
  },

  statsPreview: {
    width: '80%',
    maxWidth: 300,
  },

  form: {
    marginBottom: 20,
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
  },

  footerText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  loginButton: {
    padding: 8,
  },

  loginButtonText: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },

  backButtonText: {
    fontSize: 11,
    color: COLORS.gray,
    letterSpacing: 1,
  },
});

export default SignupScreen;