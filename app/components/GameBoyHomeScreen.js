/**
 * GameBoy Home Screen Component
 * Authentic GameBoy-inspired UI following the web prototype design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePressStart2P, pixelFont } from '../hooks/useFonts';
import CircularCharacterArena from './CircularCharacterArena';
import GameBoyActionButton from './GameBoyActionButton';
import SoundFXManager from '../services/SoundFXManager';
import SettingsManager from '../services/SettingsManager';
import {
  LevelUpEffect,
  DamageEffect,
  SparkleEffect,
  ComboCounter,
  TapRingEffect,
} from './animations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive sizing helpers
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;
const isTablet = screenWidth >= 768;

// Dynamic sizing based on device
const getResponsiveSize = () => {
  if (isTablet) return { frame: 500, arena: 400, font: 1.2 };
  if (isLargeDevice) return { frame: 410, arena: 340, font: 1 };
  if (isMediumDevice) return { frame: 380, arena: 320, font: 0.95 };
  return { frame: 350, arena: 300, font: 0.9 }; // Small devices
};

const responsiveSizes = getResponsiveSize();

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Negative actions
  deviceFrame: '#333333',   // Device border
  screenTint: 'rgba(155, 188, 15, 0.25)', // Green screen overlay
};

export default function GameBoyHomeScreen({
  // Player data
  playerStats = {},
  avatarState = {},
  isBlinking = false,
  dailyActions = {},
  
  // Health integration
  stepProgress = null,
  healthStatus = {},
  
  // Action handlers
  onWorkout = () => {},
  onEatHealthy = () => {},
  onSkipWorkout = () => {},
  onCheatMeal = () => {},
  onCharacterTap = () => {},
  onNavigate = () => {},
  
  // Settings
  fontFamily = 'monospace',
}) {
  // Get the correct sprite based on avatar state
  const getCharacterSprite = () => {
    switch (avatarState.currentAnimation) {
      case 'flex':
        return require('../assets/Sprites/Flex_Pose.png');
      case 'eat':
        return require('../assets/Sprites/Over_Eating_Pose.png');
      case 'workout':
        return require('../assets/Sprites/Post_Workout_Pose.png');
      case 'sad':
        return require('../assets/Sprites/Sad_Pose.png');
      case 'thumbsUp':
        return require('../assets/Sprites/Thumbs_Up_Pose.png');
      default:
        return require('../assets/Sprites/Idle_Pose.png'); // Default idle pose
    }
  };
  // Load retro font
  const { fontsLoaded } = usePressStart2P();
  const insets = useSafeAreaInsets();

  // Animation states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [showTapRing, setShowTapRing] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  // Button press states for visual feedback
  const [pressedButton, setPressedButton] = useState(null);

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Float animation for character
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for power ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleWorkout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSparkle(true);
    setShowTapRing(true);
    setCombo(prev => prev + 1);
    setShowCombo(true);
    
    setTimeout(() => {
      setShowSparkle(false);
      setShowTapRing(false);
    }, 1000);
    
    setTimeout(() => {
      setShowCombo(false);
    }, 2000);

    onWorkout();
  };

  const handleEatHealthy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSparkle(true);
    setCombo(prev => prev + 1);
    setShowCombo(true);
    
    setTimeout(() => {
      setShowSparkle(false);
    }, 1000);
    
    setTimeout(() => {
      setShowCombo(false);
    }, 2000);

    onEatHealthy();
  };

  const handleSkipWorkout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowDamage(true);
    setCombo(0);
    setTimeout(() => setShowDamage(false), 400);
    onSkipWorkout();
  };

  const handleCheatMeal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowDamage(true);
    setCombo(0);
    setTimeout(() => setShowDamage(false), 400);
    onCheatMeal();
  };

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom,
        }
      ]}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Device Frame */}
      <View style={styles.deviceFrame}>
        {/* App Shell */}
        <View style={styles.appShell}>
          
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Text style={[styles.logoText, pixelFont]}>16BIT FIT</Text>
          </View>
          
          {/* Main Game Window */}
          <LinearGradient
            colors={[
              'rgba(155, 188, 15, 0.25)', 
              'rgba(155, 188, 15, 0.15)', 
              'rgba(155, 188, 15, 0.25)'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gameWindow}
          >
            {/* Character Arena */}
            <View style={styles.arenaWrapper}>
              <CircularCharacterArena
                level={playerStats.level || 1}
                progress={(playerStats.xp || 0) / 100}
                characterSprite={getCharacterSprite()}
                isBlinking={isBlinking}
                onCharacterTap={() => {
                  setShowTapRing(true);
                  onCharacterTap();
                  // Navigate to customization screen
                  onNavigate('customize');
                }}
                size={responsiveSizes.arena}
              />
              
              {/* Animation Effects Layer */}
              {showLevelUp && (
                <LevelUpEffect onComplete={() => setShowLevelUp(false)} />
              )}
              {showSparkle && (
                <SparkleEffect onComplete={() => setShowSparkle(false)} />
              )}
              {showTapRing && (
                <TapRingEffect onComplete={() => setShowTapRing(false)} />
              )}
              {showCombo && combo > 0 && (
                <ComboCounter 
                  combo={combo} 
                  onComplete={() => setShowCombo(false)} 
                />
              )}
            </View>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatIcon}>❤️</Text>
                <View style={styles.quickStatContent}>
                  <Text style={[styles.quickStatValue, playerStats.health < 30 && styles.lowHealth, pixelFont]}>
                    {Math.round(playerStats.health || 75)}%
                  </Text>
                  {playerStats.health < 30 && (
                    <Text style={[styles.criticalText, pixelFont]}>CRITICAL</Text>
                  )}
                </View>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatIcon}>⚡</Text>
                <Text style={[styles.quickStatValue, pixelFont]}>
                  {Math.round(playerStats.stamina || 70)}%
                </Text>
              </View>
            </View>
            {/* Damage Effect Overlay */}
            {showDamage && (
              <DamageEffect onComplete={() => setTimeout(() => setShowDamage(false), 0)} />
            )}
          </LinearGradient>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonContainer}>
            <View style={styles.actionButtonRow}>
              <GameBoyActionButton
                text="WORKOUT"
                onPress={handleWorkout}
                variant="primary"
              />
              
              <GameBoyActionButton
                text="EAT HEALTHY"
                onPress={handleEatHealthy}
                variant="primary"
              />
            </View>
            
            <View style={styles.actionButtonRow}>
              <GameBoyActionButton
                text="SKIP WORKOUT"
                onPress={handleSkipWorkout}
                variant="secondary"
                textStyle={styles.smallerText}
              />
              
              <GameBoyActionButton
                text="CHEAT MEAL"
                onPress={handleCheatMeal}
                variant="secondary"
                textStyle={styles.smallerText}
              />
            </View>
          </View>
          
          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonActive]}
              onPress={async () => {
                await SoundFXManager.playTabSwitch();
                onNavigate('home');
              }}
              onLongPress={() => {
                setShowLevelUp(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            >
              <Text style={styles.navButtonIcon}>🏠</Text>
              <Text style={[styles.navButtonText, styles.navButtonTextActive, pixelFont]}>
                HOME
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={async () => {
                await SoundFXManager.playTabSwitch();
                onNavigate('battle');
              }}
            >
              <Text style={styles.navButtonIcon}>⚔️</Text>
              <Text style={[styles.navButtonText, pixelFont]}>BATTLE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={async () => {
                await SoundFXManager.playTabSwitch();
                onNavigate('stats');
              }}
            >
              <Text style={styles.navButtonIcon}>📊</Text>
              <Text style={[styles.navButtonText, pixelFont]}>STATS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={async () => {
                await SoundFXManager.playTabSwitch();
                onNavigate('social');
              }}
            >
              <Text style={styles.navButtonIcon}>🌐</Text>
              <Text style={[styles.navButtonText, pixelFont]}>SOCIAL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={async () => {
                await SoundFXManager.playTabSwitch();
                onNavigate('settings');
              }}
            >
              <Text style={styles.navButtonIcon}>⚙️</Text>
              <Text style={[styles.navButtonText, pixelFont]}>SETTINGS</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </View>
      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  deviceFrame: {
    width: Math.min(screenWidth - 20, responsiveSizes.frame),
    height: Math.min(screenHeight - 100, responsiveSizes.frame * 2), // 2:1 aspect ratio
    backgroundColor: '#0a0a0a',
    borderRadius: isTablet ? 50 : 40,
    padding: isTablet ? 15 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 30,
  },
  
  appShell: {
    flex: 1,
    backgroundColor: '#050505',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.deviceFrame,
    overflow: 'hidden',
  },
  
  headerBar: {
    height: 56,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.deviceFrame,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  
  logoText: {
    fontSize: 22 * responsiveSizes.font,
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: '#5a7829',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  networkTestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  gameWindow: {
    flex: 1,
    margin: 12,
    marginBottom: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arenaWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  placeholderText: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },
  
  placeholderSubtext: {
    fontSize: 12,
    color: COLORS.yellow,
    marginTop: 10,
    letterSpacing: 2,
  },
  
  actionButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  
  actionButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  
  actionButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.dark,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    // 3D button effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 8,
    // Button press effect setup
    transform: [{ translateY: 0 }],
  },
  
  secondaryActionButton: {
    backgroundColor: COLORS.red,
  },
  
  actionButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },
  
  smallerText: {
    fontSize: 10,
  },
  
  bottomNav: {
    height: 70,
    backgroundColor: COLORS.dark,
    borderTopWidth: 3,
    borderTopColor: COLORS.deviceFrame,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8, // Add horizontal padding for 5 buttons
    paddingBottom: 10,
    paddingTop: 5,
  },
  
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12, // Reduced padding to fit 5 buttons
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 50, // Reduced minimum width for 5 buttons
  },
  
  navButtonActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.dark,
    // Add 3D effect to active button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  
  navButtonIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  
  navButtonText: {
    fontSize: 9, // Slightly smaller to fit 5 buttons
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },
  
  navButtonTextActive: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },

  quickStats: {
    marginTop: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  quickStatContent: {
    alignItems: 'center',
  },

  quickStatIcon: {
    fontSize: 18,
  },

  quickStatValue: {
    fontSize: 11,
    color: COLORS.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  lowHealth: {
    color: COLORS.red,
  },

  criticalText: {
    fontSize: 6,
    color: COLORS.red,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});