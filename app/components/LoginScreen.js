/**
 * Login Screen Component
 * GameBoy-style login with validation
 * Following MetaSystemsAgent patterns for user authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';
import ValidatedForm from './ValidatedForm';
import GameBoyButton from './GameBoyButton';
import EnhancedScreenTransition from './EnhancedScreenTransition';
import { FadeIn, BounceIn } from './MicroAnimations';
import SoundFXManager from '../services/SoundFXManager';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const LoginScreen = ({ onLogin, onSignup, onForgotPassword }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  const loginFields = [
    {
      name: 'email',
      label: 'EMAIL',
      placeholder: 'trainer@16bitfit.com',
      keyboardType: 'email-address',
      required: true,
      validateOnBlur: true,
    },
    {
      name: 'password',
      label: 'PASSWORD',
      placeholder: '••••••••',
      secureTextEntry: !showPasswordToggle,
      required: true,
      validateOnBlur: true,
    },
  ];

  const handleLogin = async (formData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (formData.email === 'test@test.com' && formData.password === 'Test1234') {
        await SoundFXManager.playSound('achievement_unlock');
        if (onLogin) {
          onLogin({ email: formData.email, username: 'TestPlayer' });
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <FadeIn>
      <View style={styles.header}>
        <BounceIn>
          <Text style={styles.logo}>🎮</Text>
        </BounceIn>
        <Text style={[styles.title, pixelFont]}>16BITFIT</Text>
        <Text style={[styles.subtitle, pixelFont]}>LEVEL UP YOUR LIFE</Text>
      </View>
    </FadeIn>
  );

  const renderDemoAccount = () => (
    <View style={styles.demoContainer}>
      <Text style={[styles.demoTitle, pixelFont]}>DEMO ACCOUNT</Text>
      <View style={styles.demoCredentials}>
        <Text style={[styles.demoText, pixelFont]}>📧 test@test.com</Text>
        <Text style={[styles.demoText, pixelFont]}>🔑 Test1234</Text>
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
        {showPasswordToggle ? 'HIDE' : 'SHOW'} PASSWORD
      </Text>
    </TouchableOpacity>
  );

  const renderAlternativeActions = () => (
    <View style={styles.alternativeActions}>
      <TouchableOpacity
        onPress={() => {
          SoundFXManager.playSound('ui_button_press');
          if (onForgotPassword) onForgotPassword();
        }}
        style={styles.linkButton}
      >
        <Text style={[styles.linkText, pixelFont]}>FORGOT PASSWORD?</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={[styles.dividerText, pixelFont]}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <GameBoyButton
        onPress={() => {
          if (onSignup) onSignup();
        }}
        variant="secondary"
        style={styles.signupButton}
      >
        <Text style={[styles.signupButtonText, pixelFont]}>
          CREATE NEW ACCOUNT
        </Text>
      </GameBoyButton>
    </View>
  );

  return (
    <EnhancedScreenTransition type="powerOn">
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
          {renderDemoAccount()}
          {renderPasswordToggle()}

          <ValidatedForm
            fields={loginFields}
            onSubmit={handleLogin}
            submitButtonText={isLoading ? 'LOGGING IN...' : 'START GAME'}
            title="PLAYER LOGIN"
            description="Enter your credentials to continue your fitness journey"
            showProgress={false}
            style={styles.form}
          />

          {renderAlternativeActions()}

          {/* GameBoy style decoration */}
          <View style={styles.decoration}>
            <View style={styles.decorationDot} />
            <View style={styles.decorationDot} />
            <View style={styles.decorationDot} />
          </View>
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
    marginBottom: 30,
  },

  logo: {
    fontSize: 48,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 2,
  },

  demoContainer: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  demoTitle: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },

  demoCredentials: {
    alignItems: 'center',
  },

  demoText: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
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

  form: {
    marginBottom: 20,
  },

  alternativeActions: {
    marginTop: 20,
    paddingHorizontal: 40,
  },

  linkButton: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: 20,
  },

  linkText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
  },

  dividerText: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 1,
    marginHorizontal: 16,
  },

  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  signupButtonText: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  decoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },

  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
  },
});

export default LoginScreen;