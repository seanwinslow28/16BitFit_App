import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCharacter } from '../contexts/CharacterContext';

const WORKOUT_CATEGORIES = {
  strength: {
    name: 'Strength',
    color: '#FF6B6B',
    icon: '💪',
  },
  cardio: {
    name: 'Cardio',
    color: '#4ECDC4',
    icon: '🏃',
  },
  hiit: {
    name: 'HIIT',
    color: '#FFE66D',
    icon: '⚡',
  },
  flexibility: {
    name: 'Flexibility',
    color: '#95E1D3',
    icon: '🧘',
  },
  sports: {
    name: 'Sports',
    color: '#F8B500',
    icon: '⚽',
  },
};

const QUICK_WORKOUTS = [
  // Strength Training
  { id: 'pushups', name: 'Push-ups', category: 'strength', icon: '💪', defaultReps: 10 },
  { id: 'squats', name: 'Squats', category: 'strength', icon: '🦵', defaultReps: 15 },
  { id: 'lunges', name: 'Lunges', category: 'strength', icon: '🚶', defaultReps: 10 },
  { id: 'pullups', name: 'Pull-ups', category: 'strength', icon: '🏋️', defaultReps: 5 },
  { id: 'deadlifts', name: 'Deadlifts', category: 'strength', icon: '🏋️', defaultReps: 8 },
  { id: 'benchpress', name: 'Bench Press', category: 'strength', icon: '💪', defaultReps: 8 },
  
  // Cardio
  { id: 'running', name: 'Running', category: 'cardio', icon: '🏃', defaultDuration: 20 },
  { id: 'cycling', name: 'Cycling', category: 'cardio', icon: '🚴', defaultDuration: 30 },
  { id: 'swimming', name: 'Swimming', category: 'cardio', icon: '🏊', defaultDuration: 30 },
  { id: 'rowing', name: 'Rowing', category: 'cardio', icon: '🚣', defaultDuration: 20 },
  { id: 'elliptical', name: 'Elliptical', category: 'cardio', icon: '🏃', defaultDuration: 25 },
  { id: 'stairclimber', name: 'Stair Climber', category: 'cardio', icon: '🪜', defaultDuration: 15 },
  
  // HIIT
  { id: 'burpees', name: 'Burpees', category: 'hiit', icon: '🔥', defaultReps: 10 },
  { id: 'jumping_jacks', name: 'Jumping Jacks', category: 'hiit', icon: '⭐', defaultReps: 20 },
  { id: 'mountain_climbers', name: 'Mountain Climbers', category: 'hiit', icon: '⛰️', defaultReps: 20 },
  { id: 'box_jumps', name: 'Box Jumps', category: 'hiit', icon: '📦', defaultReps: 10 },
  { id: 'battle_ropes', name: 'Battle Ropes', category: 'hiit', icon: '🪢', defaultDuration: 30 },
  { id: 'sprint_intervals', name: 'Sprint Intervals', category: 'hiit', icon: '💨', defaultDuration: 15 },
  
  // Flexibility
  { id: 'plank', name: 'Plank', category: 'flexibility', icon: '🧘', defaultDuration: 30 },
  { id: 'yoga', name: 'Yoga', category: 'flexibility', icon: '🕉️', defaultDuration: 30 },
  { id: 'stretching', name: 'Stretching', category: 'flexibility', icon: '🤸', defaultDuration: 15 },
  { id: 'pilates', name: 'Pilates', category: 'flexibility', icon: '🧘‍♀️', defaultDuration: 30 },
  { id: 'foam_rolling', name: 'Foam Rolling', category: 'flexibility', icon: '🎯', defaultDuration: 10 },
  
  // Sports
  { id: 'basketball', name: 'Basketball', category: 'sports', icon: '🏀', defaultDuration: 30 },
  { id: 'soccer', name: 'Soccer', category: 'sports', icon: '⚽', defaultDuration: 45 },
  { id: 'tennis', name: 'Tennis', category: 'sports', icon: '🎾', defaultDuration: 45 },
  { id: 'martial_arts', name: 'Martial Arts', category: 'sports', icon: '🥋', defaultDuration: 30 },
  { id: 'boxing', name: 'Boxing', category: 'sports', icon: '🥊', defaultDuration: 20 },
  { id: 'dancing', name: 'Dancing', category: 'sports', icon: '💃', defaultDuration: 30 },
];

const QUICK_LOG_PRESETS = [
  { id: 'quick_5', name: '5 MIN POWER', workouts: [
    { workoutId: 'burpees', reps: 10 },
    { workoutId: 'jumping_jacks', reps: 20 },
    { workoutId: 'mountain_climbers', reps: 15 },
  ]},
  { id: 'morning_routine', name: 'MORNING BOOST', workouts: [
    { workoutId: 'pushups', reps: 10 },
    { workoutId: 'squats', reps: 15 },
    { workoutId: 'plank', duration: 30 },
  ]},
  { id: 'cardio_blast', name: 'CARDIO BLAST', workouts: [
    { workoutId: 'running', duration: 20 },
  ]},
  { id: 'strength_circuit', name: 'STRENGTH CIRCUIT', workouts: [
    { workoutId: 'pushups', reps: 12 },
    { workoutId: 'squats', reps: 15 },
    { workoutId: 'lunges', reps: 10 },
    { workoutId: 'plank', duration: 45 },
  ]},
];

const WorkoutSelectionV2 = () => {
  const navigation = useNavigation();
  const { addActivity } = useCharacter();
  
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPresets, setShowPresets] = useState(false);
  
  const successAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const categoryScrollRef = useRef(null);

  const handleQuickSelect = (workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWorkout(workout);
    
    // Set default values
    if (workout.defaultReps) {
      setReps(workout.defaultReps.toString());
    } else if (workout.defaultDuration) {
      setDuration(workout.defaultDuration.toString());
    }
    
    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePresetSelect = (preset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Log all workouts in the preset
    preset.workouts.forEach((workoutData) => {
      const workout = QUICK_WORKOUTS.find(w => w.id === workoutData.workoutId);
      if (!workout) return;
      
      const value = workoutData.reps || workoutData.duration;
      const intensity = calculateIntensity(workout.category, value);
      
      addActivity({
        name: workout.name,
        category: workout.category,
        intensity,
        duration: value,
        type: workoutData.reps ? 'reps' : 'duration',
      });
    });
    
    // Show success
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const calculateIntensity = (category, value) => {
    const intensityMap = {
      strength: Math.min(5, Math.floor(value / 10)),
      cardio: Math.min(5, Math.floor(value / 10)),
      hiit: Math.min(5, Math.floor(value / 5)), // HIIT is more intense
      flexibility: Math.min(5, Math.floor(value / 15)),
      sports: Math.min(5, Math.floor(value / 15)),
    };
    
    return intensityMap[category] || 3;
  };

  const calculateStatGains = (workout, value) => {
    const categoryGains = {
      strength: { strength: 8, stamina: 3, health: 4 },
      cardio: { strength: 2, stamina: 8, health: 5 },
      hiit: { strength: 5, stamina: 7, health: 6 },
      flexibility: { strength: 3, stamina: 4, health: 7 },
      sports: { strength: 4, stamina: 6, health: 5 },
    };
    
    const baseGains = categoryGains[workout.category] || { strength: 3, stamina: 3, health: 3 };
    
    // Scale gains based on effort
    const multiplier = Math.min(value / 10, 3); // Cap at 3x
    
    return {
      strength: Math.floor(baseGains.strength * multiplier),
      stamina: Math.floor(baseGains.stamina * multiplier),
      health: Math.floor(baseGains.health * multiplier),
    };
  };

  const getFilteredWorkouts = () => {
    if (selectedCategory === 'all') return QUICK_WORKOUTS;
    return QUICK_WORKOUTS.filter(w => w.category === selectedCategory);
  };

  const handleLogWorkout = () => {
    if (!selectedWorkout) return;
    
    const value = parseInt(reps || duration || '0');
    if (value <= 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Calculate intensity based on workout type and value
    const intensity = calculateIntensity(selectedWorkout.category, value);
    
    // Log activity using CharacterContext
    addActivity({
      name: selectedWorkout.name,
      category: selectedWorkout.category,
      intensity,
      duration: value,
      type: reps ? 'reps' : 'duration',
    });
    
    // Show success animation
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Navigate back after delay
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.successContainer,
            {
              transform: [
                { scale: successAnim },
                { rotate: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }
              ],
            }
          ]}
        >
          <Text style={styles.successIcon}>💪</Text>
          <Text style={styles.successText}>WORKOUT COMPLETE!</Text>
          <View style={styles.gainsList}>
            <Text style={styles.gainText}>+{calculateStatGains(selectedWorkout, parseInt(reps || duration)).strength} STR</Text>
            <Text style={styles.gainText}>+{calculateStatGains(selectedWorkout, parseInt(reps || duration)).stamina} STA</Text>
            <Text style={styles.gainText}>+{calculateStatGains(selectedWorkout, parseInt(reps || duration)).health} HP</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>QUICK WORKOUT</Text>
        <Text style={styles.subtitle}>Choose an exercise to power up!</Text>
      </View>
      
      {/* Category Filter */}
      <ScrollView 
        ref={categoryScrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <Pressable
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.selectedCategoryButton,
          ]}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === 'all' && styles.selectedCategoryText,
          ]}>ALL</Text>
        </Pressable>
        
        {Object.entries(WORKOUT_CATEGORIES).map(([key, category]) => (
          <Pressable
            key={key}
            onPress={() => setSelectedCategory(key)}
            style={[
              styles.categoryButton,
              selectedCategory === key && styles.selectedCategoryButton,
              { borderColor: category.color },
            ]}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === key && styles.selectedCategoryText,
            ]}>{category.name.toUpperCase()}</Text>
          </Pressable>
        ))}
      </ScrollView>
      
      {/* Quick Presets Toggle */}
      <Pressable
        style={styles.presetsToggle}
        onPress={() => setShowPresets(!showPresets)}
      >
        <Text style={styles.presetsToggleText}>
          {showPresets ? '▼ HIDE PRESETS' : '▶ SHOW PRESETS'}
        </Text>
      </Pressable>
      
      {/* Presets Section */}
      {showPresets && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.presetsScroll}
          contentContainerStyle={styles.presetsContainer}
        >
          {QUICK_LOG_PRESETS.map((preset) => (
            <Pressable
              key={preset.id}
              style={styles.presetCard}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.presetDescription}>
                {preset.workouts.length} exercises
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.workoutGrid}>
          {getFilteredWorkouts().map((workout) => (
            <Pressable
              key={workout.id}
              onPress={() => handleQuickSelect(workout)}
              style={({ pressed }) => [
                styles.workoutCard,
                selectedWorkout?.id === workout.id && styles.selectedCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateX: selectedWorkout?.id === workout.id ? shakeAnim : 0 }
                  ]
                }}
              >
                <Text style={styles.workoutIcon}>{workout.icon}</Text>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutCategory}>{workout.category.toUpperCase()}</Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
        
        {selectedWorkout && (
          <Animated.View 
            style={[
              styles.inputSection,
              {
                opacity: selectedWorkout ? 1 : 0,
                transform: [
                  { translateY: selectedWorkout ? 0 : 20 }
                ]
              }
            ]}
          >
            <Text style={styles.inputLabel}>
              {selectedWorkout.defaultReps ? 'REPS:' : 'MINUTES:'}
            </Text>
            <TextInput
              style={styles.input}
              value={selectedWorkout.defaultReps ? reps : duration}
              onChangeText={selectedWorkout.defaultReps ? setReps : setDuration}
              keyboardType="numeric"
              placeholder={selectedWorkout.defaultReps ? '10' : '20'}
              placeholderTextColor="#666"
              maxLength={3}
            />
            
            <Pressable
              style={styles.logButton}
              onPress={handleLogWorkout}
              disabled={!selectedWorkout || (!reps && !duration)}
            >
              <Text style={styles.logButtonText}>LOG WORKOUT</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
      
      <Pressable
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
      >
        <Text style={styles.backButtonText}>← BACK</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  workoutCard: {
    width: '48%',
    backgroundColor: '#0F380F',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FFD700',
    backgroundColor: '#1F481F',
  },
  pressedCard: {
    transform: [{ scale: 0.95 }],
  },
  workoutIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    marginBottom: 5,
  },
  workoutCategory: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#556B2F',
  },
  inputSection: {
    backgroundColor: '#0F380F',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1F481F',
    color: '#9BBD0F',
    fontSize: 24,
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 150,
    marginBottom: 20,
  },
  logButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0F380F',
  },
  logButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 20,
  },
  gainsList: {
    alignItems: 'center',
  },
  gainText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginVertical: 5,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F380F',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#556B2F',
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#FFD700',
    borderColor: '#0F380F',
  },
  categoryButtonText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginLeft: 5,
  },
  selectedCategoryText: {
    color: '#0F380F',
  },
  categoryIcon: {
    fontSize: 16,
  },
  presetsToggle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  presetsToggleText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  presetsScroll: {
    maxHeight: 80,
    marginBottom: 15,
  },
  presetsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  presetCard: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    borderWidth: 3,
    borderColor: '#0F380F',
    minWidth: 120,
  },
  presetName: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 5,
  },
  presetDescription: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.7,
  },
});

export default WorkoutSelectionV2;