/**
 * Character Selection Screen
 * First step of 60-second onboarding - Choose your fighter archetype
 * Mobile-first design with intuitive selection and immediate feedback
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Vibration,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Effects, Animations } from '../constants/DesignSystem';
import { useCharacter } from '../contexts/CharacterContext';
import { SparkleEffect, TapRingEffect } from '../components/animations';
import SoundFXManager from '../services/SoundFXManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Character archetype definitions
const CHARACTER_ARCHETYPES = [
  {
    id: 'strength',
    name: 'STRENGTH FIGHTER',
    subtitle: 'POWER FOCUSED',
    description: 'Build muscle\nLift heavy\nGain strength',
    emoji: '💪',
    baseStats: {
      health: 80,
      strength: 90,
      stamina: 60,
      speed: 50,
    },
    colors: {
      primary: '#E53935',
      secondary: '#FF6B6B',
      gradient: ['#E53935', '#C62828'],
    },
    traits: ['HIGH POWER', 'MODERATE SPEED', 'MUSCLE GROWTH'],
    sprite: {
      idle: '🏋️',
      selected: '💪',
    },
  },
  {
    id: 'speed',
    name: 'SPEED FIGHTER',
    subtitle: 'CARDIO FOCUSED',
    description: 'Run faster\nEndurance boost\nStay agile',
    emoji: '⚡',
    baseStats: {
      health: 70,
      strength: 50,
      stamina: 90,
      speed: 80,
    },
    colors: {
      primary: '#2C76C8',
      secondary: '#5C94FC',
      gradient: ['#2C76C8', '#1565C0'],
    },
    traits: ['HIGH SPEED', 'GREAT STAMINA', 'QUICK RECOVERY'],
    sprite: {
      idle: '🏃',
      selected: '⚡',
    },
  },
  {
    id: 'balanced',
    name: 'BALANCED FIGHTER',
    subtitle: 'ALL-AROUND',
    description: 'Well-rounded\nAdaptable\nSteady growth',
    emoji: '⚖️',
    baseStats: {
      health: 75,
      strength: 70,
      stamina: 75,
      speed: 70,
    },
    colors: {
      primary: '#92CC41',
      secondary: '#B8E986',
      gradient: ['#92CC41', '#689F38'],
    },
    traits: ['BALANCED STATS', 'VERSATILE', 'STEADY PROGRESS'],
    sprite: {
      idle: '🤸',
      selected: '⚖️',
    },
  },
];

const CharacterSelectionScreen = ({ navigation, onComplete }) => {
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { updateStats, addAchievement, setCharacterArchetype } = useCharacter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(
    CHARACTER_ARCHETYPES.map(() => new Animated.Value(1))
  ).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;
  const confirmButtonAnim = useRef(new Animated.Value(0)).current;

  // Screen entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle character selection
  const handleSelectArchetype = (archetype, index) => {
    if (selectedArchetype?.id === archetype.id) {
      // Deselect
      setSelectedArchetype(null);
      setIsConfirming(false);
      Animated.parallel([
        Animated.timing(selectionAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(confirmButtonAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Select new archetype
      setSelectedArchetype(archetype);
      setIsConfirming(false);
      
      // Play selection sound and haptic
      SoundFXManager.play('select');
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 10]);
      }

      // Animate selection
      Animated.sequence([
        Animated.timing(scaleAnims[index], {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Show selection state
      Animated.parallel([
        Animated.spring(selectionAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(confirmButtonAnim, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Confirm selection and proceed
  const handleConfirmSelection = () => {
    if (!selectedArchetype) return;

    setIsConfirming(true);
    SoundFXManager.play('powerUp');
    
    // Apply base stats for selected archetype
    updateStats(selectedArchetype.baseStats);
    setCharacterArchetype(selectedArchetype.id, selectedArchetype.name);
    addAchievement(`Chose ${selectedArchetype.name}!`);

    // Store selection for future reference
    const characterData = {
      archetype: selectedArchetype.id,
      name: selectedArchetype.name,
      startDate: new Date().toISOString(),
    };

    // Animate out and proceed
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onComplete) {
        onComplete(characterData);
      } else if (navigation) {
        navigation.replace('Onboarding', { 
          characterData,
          step: 'arena_selection' 
        });
      }
    });
  };

  // Render individual character card
  const renderCharacterCard = (archetype, index) => {
    const isSelected = selectedArchetype?.id === archetype.id;
    const animatedScale = scaleAnims[index];

    return (
      <Animated.View
        key={archetype.id}
        style={[
          styles.characterCard,
          {
            transform: [
              { scale: animatedScale },
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          onPress={() => handleSelectArchetype(archetype, index)}
          style={({ pressed }) => [
            styles.cardPressable,
            pressed && styles.cardPressed,
          ]}
        >
          <LinearGradient
            colors={isSelected ? archetype.colors.gradient : ['#1a1a1a', '#2a2a2a']}
            style={[
              styles.cardGradient,
              isSelected && styles.cardSelected,
            ]}
          >
            {/* Character Sprite */}
            <View style={styles.spriteContainer}>
              <Text style={styles.spriteEmoji}>
                {isSelected ? archetype.sprite.selected : archetype.sprite.idle}
              </Text>
              {isSelected && (
                <SparkleEffect
                  color={archetype.colors.primary}
                  size={80}
                  duration={1000}
                />
              )}
            </View>

            {/* Character Info */}
            <Text style={[styles.characterName, isSelected && styles.textSelected]}>
              {archetype.name}
            </Text>
            <Text style={[styles.characterSubtitle, isSelected && styles.textSelected]}>
              {archetype.subtitle}
            </Text>

            {/* Stats Preview */}
            <View style={styles.statsPreview}>
              {Object.entries(archetype.baseStats).map(([stat, value]) => (
                <View key={stat} style={styles.statBar}>
                  <View 
                    style={[
                      styles.statFill,
                      { 
                        width: `${value}%`,
                        backgroundColor: isSelected 
                          ? archetype.colors.secondary 
                          : Colors.button.disabled,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Traits */}
            <View style={styles.traitsContainer}>
              {archetype.traits.map((trait, i) => (
                <Text 
                  key={i} 
                  style={[
                    styles.traitText,
                    isSelected && styles.traitTextSelected,
                  ]}
                >
                  {trait}
                </Text>
              ))}
            </View>

            {isSelected && (
              <Animated.View
                style={[
                  styles.selectionIndicator,
                  {
                    opacity: selectionAnim,
                    transform: [
                      {
                        scale: selectionAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.selectionText}>SELECTED</Text>
              </Animated.View>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.environment.nightPurple, Colors.primary.black]}
        style={styles.backgroundGradient}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CHOOSE YOUR FIGHTER</Text>
          <Text style={styles.subtitle}>Select your training style</Text>
        </View>

        {/* Character Cards */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          snapToInterval={SCREEN_WIDTH * 0.8 + Spacing.md}
          decelerationRate="fast"
        >
          {CHARACTER_ARCHETYPES.map((archetype, index) => 
            renderCharacterCard(archetype, index)
          )}
        </ScrollView>

        {/* Confirm Button */}
        {selectedArchetype && (
          <Animated.View
            style={[
              styles.confirmButtonContainer,
              {
                opacity: confirmButtonAnim,
                transform: [
                  {
                    translateY: confirmButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={handleConfirmSelection}
              disabled={isConfirming}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.confirmButtonPressed,
              ]}
            >
              <LinearGradient
                colors={selectedArchetype.colors.gradient}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>
                  {isConfirming ? 'STARTING...' : 'START JOURNEY'}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Timer indicator */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Step 1 of 4 • 15 seconds</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.black,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.pageMargins,
  },
  title: {
    ...Typography.titleExtraLarge,
    color: Colors.primary.logoYellow,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.titleMedium,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.8)) / 2,
    alignItems: 'center',
  },
  characterCard: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.55,
    marginHorizontal: Spacing.sm,
  },
  cardPressable: {
    flex: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.primary.black,
    ...Effects.cardShadow,
  },
  cardSelected: {
    borderColor: Colors.primary.logoYellow,
    borderWidth: 3,
  },
  spriteContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  spriteEmoji: {
    fontSize: 64,
  },
  characterName: {
    ...Typography.titleMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  characterSubtitle: {
    ...Typography.labelSmall,
    color: Colors.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  textSelected: {
    color: Colors.white,
    opacity: 1,
  },
  statsPreview: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  statBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  traitsContainer: {
    alignItems: 'center',
  },
  traitText: {
    ...Typography.microCopy,
    color: Colors.white,
    opacity: 0.6,
    marginBottom: Spacing.xs,
  },
  traitTextSelected: {
    opacity: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary.logoYellow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  selectionText: {
    ...Typography.microCopy,
    color: Colors.primary.black,
    fontWeight: 'bold',
  },
  confirmButtonContainer: {
    paddingHorizontal: Spacing.pageMargins,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  confirmButton: {
    height: 64,
  },
  confirmButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  confirmButtonGradient: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Effects.buttonShadowDefault,
  },
  confirmButtonText: {
    ...Typography.buttonText,
    color: Colors.white,
    fontSize: 16,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  timerText: {
    ...Typography.microCopy,
    color: Colors.white,
    opacity: 0.5,
  },
});

export default CharacterSelectionScreen;