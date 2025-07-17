/**
 * Validated Workout Form Component
 * GameBoy-style workout logging with validation
 * Following MetaSystemsAgent patterns for fitness tracking
 */

import React, { useState, useEffect } from 'react';
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
import ValidatedInput from './ValidatedInput';
import GameBoyButton from './GameBoyButton';
import ValidationService from '../services/ValidationService';
import SoundFXManager from '../services/SoundFXManager';
import { FadeIn, BounceIn, Shake } from './MicroAnimations';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const WORKOUT_TYPES = [
  { id: 'cardio', label: 'CARDIO', icon: '🏃', stats: 'Stamina +10, Health +5' },
  { id: 'strength', label: 'STRENGTH', icon: '🏋️', stats: 'Strength +10, Weight +5' },
  { id: 'yoga', label: 'YOGA', icon: '🧘', stats: 'Happiness +10, Health +5' },
  { id: 'sports', label: 'SPORTS', icon: '⚽', stats: 'All Stats +5' },
];

const INTENSITY_LEVELS = [
  { id: 'low', label: 'LOW', color: COLORS.primary, multiplier: 0.8 },
  { id: 'medium', label: 'MEDIUM', color: COLORS.yellow, multiplier: 1.0 },
  { id: 'high', label: 'HIGH', color: COLORS.red, multiplier: 1.3 },
];

const ValidatedWorkoutForm = ({ onSubmit, currentStats = {} }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState('medium');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Animation values
  const previewAnim = useState(new Animated.Value(0))[0];
  const typeSelectionAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (showPreview) {
      Animated.spring(previewAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [showPreview]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowPreview(true);
    SoundFXManager.playSound('ui_button_press');
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(typeSelectionAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(typeSelectionAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedType) {
      newErrors.type = 'Please select a workout type';
    }
    
    const workoutValidation = ValidationService.validateWorkout({
      type: selectedType,
      duration: parseInt(duration),
      intensity: selectedIntensity,
    });
    
    if (!workoutValidation.isValid) {
      newErrors.workout = workoutValidation.errors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateStatChanges = () => {
    if (!selectedType || !duration) return {};
    
    const baseMinutes = parseInt(duration) || 0;
    const intensityMultiplier = INTENSITY_LEVELS.find(
      level => level.id === selectedIntensity
    ).multiplier;
    
    const changes = {};
    
    switch (selectedType) {
      case 'cardio':
        changes.stamina = Math.round(10 * intensityMultiplier * (baseMinutes / 30));
        changes.health = Math.round(5 * intensityMultiplier * (baseMinutes / 30));
        break;
      case 'strength':
        changes.strength = Math.round(10 * intensityMultiplier * (baseMinutes / 30));
        changes.weight = Math.round(5 * intensityMultiplier * (baseMinutes / 30));
        break;
      case 'yoga':
        changes.happiness = Math.round(10 * intensityMultiplier * (baseMinutes / 30));
        changes.health = Math.round(5 * intensityMultiplier * (baseMinutes / 30));
        break;
      case 'sports':
        const allStatBonus = Math.round(5 * intensityMultiplier * (baseMinutes / 30));
        changes.health = allStatBonus;
        changes.strength = allStatBonus;
        changes.stamina = allStatBonus;
        changes.happiness = allStatBonus;
        break;
    }
    
    return changes;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      SoundFXManager.playSound('ui_error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const workoutData = {
        type: selectedType,
        duration: parseInt(duration),
        intensity: selectedIntensity,
        notes,
        statChanges: calculateStatChanges(),
        timestamp: new Date().toISOString(),
      };
      
      await onSubmit(workoutData);
      
      // Success feedback
      SoundFXManager.playSound('workout_complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset form
      setSelectedType(null);
      setDuration('');
      setNotes('');
      setShowPreview(false);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWorkoutTypes = () => (
    <View style={styles.typesContainer}>
      <Text style={[styles.sectionTitle, pixelFont]}>SELECT WORKOUT TYPE</Text>
      <View style={styles.typeGrid}>
        {WORKOUT_TYPES.map((type, index) => (
          <FadeIn key={type.id} delay={index * 100}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                selectedType === type.id && styles.typeCardSelected,
              ]}
              onPress={() => handleTypeSelect(type.id)}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: selectedType === type.id ? typeSelectionAnim : 1 }
                  ],
                }}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, pixelFont]}>{type.label}</Text>
                <Text style={[styles.typeStats, pixelFont]}>{type.stats}</Text>
              </Animated.View>
            </TouchableOpacity>
          </FadeIn>
        ))}
      </View>
    </View>
  );

  const renderIntensitySelector = () => (
    <View style={styles.intensityContainer}>
      <Text style={[styles.sectionTitle, pixelFont]}>INTENSITY LEVEL</Text>
      <View style={styles.intensityButtons}>
        {INTENSITY_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.intensityButton,
              selectedIntensity === level.id && {
                backgroundColor: level.color,
              },
            ]}
            onPress={() => {
              setSelectedIntensity(level.id);
              SoundFXManager.playSound('ui_toggle');
            }}
          >
            <Text
              style={[
                styles.intensityLabel,
                pixelFont,
                selectedIntensity === level.id && { color: COLORS.dark },
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatPreview = () => {
    const changes = calculateStatChanges();
    
    return (
      <Animated.View
        style={[
          styles.previewContainer,
          {
            opacity: previewAnim,
            transform: [
              {
                translateY: previewAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.previewTitle, pixelFont]}>STAT CHANGES</Text>
        <View style={styles.previewStats}>
          {Object.entries(changes).map(([stat, value]) => (
            <View key={stat} style={styles.previewStat}>
              <Text style={[styles.previewStatName, pixelFont]}>
                {stat.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.previewStatValue,
                  pixelFont,
                  { color: value > 0 ? COLORS.primary : COLORS.red },
                ]}
              >
                {value > 0 ? '+' : ''}{value}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderErrors = () => {
    const errorMessages = Object.values(errors);
    if (errorMessages.length === 0) return null;
    
    return (
      <Shake trigger={true} intensity={5} duration={300}>
        <View style={styles.errorContainer}>
          {errorMessages.map((error, index) => (
            <Text key={index} style={[styles.errorText, pixelFont]}>
              • {error}
            </Text>
          ))}
        </View>
      </Shake>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['rgba(13, 13, 13, 0.95)', 'rgba(13, 13, 13, 0.9)']}
        style={styles.gradient}
      >
        <BounceIn>
          <Text style={[styles.title, pixelFont]}>LOG WORKOUT</Text>
        </BounceIn>

        {renderWorkoutTypes()}

        {selectedType && (
          <FadeIn>
            {renderIntensitySelector()}
            
            <View style={styles.inputsContainer}>
              <ValidatedInput
                fieldName="workoutDuration"
                value={duration}
                onChangeText={setDuration}
                label="DURATION (MINUTES)"
                placeholder="30"
                keyboardType="numeric"
                required={true}
                validateOnBlur={true}
                onValidationChange={(isValid, errors) => {
                  if (!isValid) {
                    setErrors(prev => ({ ...prev, duration: errors[0] }));
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.duration;
                      return newErrors;
                    });
                  }
                }}
              />
              
              <ValidatedInput
                fieldName="notes"
                value={notes}
                onChangeText={setNotes}
                label="NOTES (OPTIONAL)"
                placeholder="Felt great today!"
                multiline={true}
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {duration && renderStatPreview()}
          </FadeIn>
        )}

        {renderErrors()}

        {selectedType && (
          <GameBoyButton
            onPress={handleSubmit}
            variant="primary"
            disabled={isSubmitting || !duration}
            style={styles.submitButton}
          >
            <Text style={[styles.submitButtonText, pixelFont]}>
              {isSubmitting ? 'LOGGING...' : 'COMPLETE WORKOUT'}
            </Text>
          </GameBoyButton>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    padding: 20,
    minHeight: '100%',
  },

  title: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 11,
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 12,
  },

  typesContainer: {
    marginBottom: 24,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  typeCard: {
    width: '47%',
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(102, 102, 102, 0.3)',
    padding: 16,
    alignItems: 'center',
  },

  typeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
  },

  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  typeLabel: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 4,
  },

  typeStats: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  intensityContainer: {
    marginBottom: 24,
  },

  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },

  intensityLabel: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 1,
  },

  inputsContainer: {
    marginBottom: 24,
  },

  previewContainer: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 24,
  },

  previewTitle: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  previewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },

  previewStat: {
    alignItems: 'center',
  },

  previewStatName: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  previewStatValue: {
    fontSize: 14,
    letterSpacing: 1,
  },

  errorContainer: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    fontSize: 10,
    color: COLORS.red,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  submitButton: {
    marginTop: 8,
  },

  submitButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },
});

export default ValidatedWorkoutForm;