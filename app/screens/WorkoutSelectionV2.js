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
import designTokens from '../constants/designTokens'; // Import our design system
import PixelButton from '../components/PixelButton';

// DATA and LOGIC (unchanged)  
const WORKOUT_CATEGORIES = {  
  strength: { name: 'Strength', color: '#FF6B6B', icon: '💪' },  
  cardio: { name: 'Cardio', color: '#4ECDC4', icon: '🏃' },  
  hiit: { name: 'HIIT', color: '#FFE66D', icon: '⚡' },  
  flexibility: { name: 'Flexibility', color: '#95E1D3', icon: '🧘' },  
  sports: { name: 'Sports', color: '#F8B500', icon: '⚽' },  
};

const QUICK_WORKOUTS = [  
  { id: 'pushups', name: 'Push-ups', category: 'strength', icon: '💪', defaultReps: 10 },  
  { id: 'squats', name: 'Squats', category: 'strength', icon: '🦵', defaultReps: 15 },  
  { id: 'running', name: 'Running', category: 'cardio', icon: '🏃', defaultDuration: 20 },  
  { id: 'burpees', name: 'Burpees', category: 'hiit', icon: '🔥', defaultReps: 10 },  
  { id: 'plank', name: 'Plank', category: 'flexibility', icon: '🧘', defaultDuration: 30 },  
  { id: 'basketball', name: 'Basketball', category: 'sports', icon: '🏀', defaultDuration: 30 },  
];

const WorkoutSelectionV2 = () => {  
  const navigation = useNavigation();  
  const { addActivity } = useCharacter();  
    
  const [selectedWorkout, setSelectedWorkout] = useState(null);  
  const [reps, setReps] = useState('');  
  const [duration, setDuration] = useState('');  
  const [showSuccess, setShowSuccess] = useState(false);  
  const [selectedCategory, setSelectedCategory] = useState('all');  
    
  const successAnim = useRef(new Animated.Value(0)).current;  
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // All event handlers and logic functions (handleQuickSelect, handleLogWorkout, etc.) remain unchanged.  
  // ...  
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
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),  
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),  
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),  
    ]).start();  
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

  const handleLogWorkout = () => {  
    if (!selectedWorkout) return;  
      
    const value = parseInt(reps || duration || '0');  
    if (value <= 0) return;  
      
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);  
      
    const intensity = calculateIntensity(selectedWorkout.category, value);  
      
    addActivity({  
      name: selectedWorkout.name,  
      category: selectedWorkout.category,  
      intensity,  
      duration: value,  
      type: reps ? 'reps' : 'duration',  
    }); //   
      
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
    
  const getFilteredWorkouts = () => {  
    if (selectedCategory === 'all') return QUICK_WORKOUTS;  
    return QUICK_WORKOUTS.filter(w => w.category === selectedCategory);  
  };  
  // ...

  if (showSuccess) {  
    // This success view is already well-styled, no changes needed  
    return (  
      <View style={styles.container}>  
        <Animated.View style={[ styles.successContainer, { transform: [{ scale: successAnim }] } ]}>  
          <Text style={styles.successIcon}>💪</Text>  
          <Text style={styles.successText}>WORKOUT COMPLETE!</Text>  
        </Animated.View>  
      </View>  
    );  
  }

  return (  
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>  
       <View style={styles.header}>  
        <Text style={styles.title}>SELECT WORKOUT</Text>  
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContainer}>  
        <Pressable  
          onPress={() => setSelectedCategory('all')}  
          style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategoryButton ]}>  
          <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.selectedCategoryText ]}>ALL</Text>  
        </Pressable>  
        {Object.entries(WORKOUT_CATEGORIES).map(([key, category]) => (  
          <Pressable  
            key={key}  
            onPress={() => setSelectedCategory(key)}  
            style={[styles.categoryButton, selectedCategory === key && styles.selectedCategoryButton, {backgroundColor: category.color} ]}>  
            <Text style={styles.categoryIcon}>{category.icon}</Text>  
            <Text style={styles.categoryButtonText}>{category.name.toUpperCase()}</Text>  
          </Pressable>  
        ))}  
      </ScrollView>  
        
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>  
        <View style={styles.workoutGrid}>  
          {getFilteredWorkouts().map((workout) => (  
            <Pressable  
              key={workout.id}  
              onPress={() => handleQuickSelect(workout)}  
              style={({ pressed }) => [ styles.workoutCard, selectedWorkout?.id === workout.id && styles.selectedCard, pressed && styles.pressedCard ]}>  
              <Animated.View style={{ transform: [{ translateX: selectedWorkout?.id === workout.id ? shakeAnim : 0 }] }}>  
                <Text style={styles.workoutIcon}>{workout.icon}</Text>  
                <Text style={styles.workoutName}>{workout.name}</Text>  
              </Animated.View>  
            </Pressable>  
          ))}  
        </View>  
          
        {selectedWorkout && (  
          <View style={styles.inputSection}>  
            <Text style={styles.inputLabel}>  
              {selectedWorkout.defaultReps ? 'ENTER REPS:' : 'ENTER MINUTES:'}  
            </Text>  
            <TextInput  
              style={styles.input}  
              value={selectedWorkout.defaultReps ? reps : duration}  
              onChangeText={selectedWorkout.defaultReps ? setReps : setDuration}  
              keyboardType="numeric"  
              placeholder={selectedWorkout.defaultReps ? '10' : '20'}  
              placeholderTextColor={designTokens.colors.theme.textLight}  
              maxLength={3}/>  
              
            <PixelButton 
              onPress={handleLogWorkout}
              disabled={!selectedWorkout || (!reps && !duration)}>
              LOG WORKOUT
            </PixelButton>  
          </View>  
        )}  
      </ScrollView>  
        
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>  
        <Text style={styles.backButtonText}>← BACK</Text>  
      </Pressable>  
    </KeyboardAvoidingView>  
  );  
};

// =================================================================================  
// STYLESHEET - Refined with Design Tokens  
// =================================================================================  
const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
    paddingTop: spacing.xl,  
  },  
  header: {  
    alignItems: 'center',  
    marginBottom: spacing.lg,  
    paddingHorizontal: spacing.lg,  
  },  
  title: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xl.fontSize,  
    color: colors.theme.text,  
  },  
  categoryScroll: {  
    maxHeight: 60,  
    marginBottom: spacing.md,  
    flexGrow: 0,  
  },  
  categoryContainer: {  
    paddingHorizontal: spacing.lg,  
    gap: spacing.sm,  
  },  
  categoryButton: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: colors.theme.surface,  
    paddingHorizontal: spacing.md,  
    paddingVertical: spacing.sm,  
    borderRadius: radius.md,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
  },  
  selectedCategoryButton: {  
    backgroundColor: colors.accent['steely-blue'],  
  },  
  categoryIcon: {  
      fontSize: 16,  
      marginRight: spacing.sm,  
  },  
  categoryButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.text,  
  },  
  selectedCategoryText: {  
    color: colors.shell.light,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  workoutGrid: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
    justifyContent: 'space-between',  
    paddingHorizontal: spacing.lg,  
  },  
  workoutCard: {  
    width: '48%',  
    backgroundColor: colors.theme.surfaceDark,  
    borderRadius: radius.md,  
    padding: spacing.md,  
    alignItems: 'center',  
    marginBottom: spacing.md,  
    borderWidth: 2,  
    borderColor: 'transparent',  
  },  
  selectedCard: {  
    borderColor: colors.accent['steely-blue'], // Using accent color for selection  
    backgroundColor: colors.theme.text,  
  },  
  pressedCard: {  
    transform: [{ scale: 0.95 }],  
  },  
  workoutIcon: {  
    fontSize: 40,  
    marginBottom: spacing.sm,  
  },  
  workoutName: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.primary,  
    textAlign: 'center',  
  },  
  inputSection: {  
    backgroundColor: colors.theme.text,  
    borderRadius: radius.md,  
    padding: spacing.lg,  
    marginHorizontal: spacing.lg,  
    marginBottom: spacing.xl,  
    alignItems: 'center',  
  },  
  inputLabel: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.primary,  
    marginBottom: spacing.md,  
  },  
  input: {  
    backgroundColor: colors.theme.surfaceDark,  
    color: colors.theme.primary,  
    fontSize: typography.styles['2xl'].fontSize,  
    fontFamily: typography.fonts.pixel,  
    textAlign: 'center',  
    paddingVertical: spacing.sm,  
    paddingHorizontal: spacing.md,  
    borderRadius: radius.sm,  
    width: 150,  
    marginBottom: spacing.lg,  
  },  
  logButton: {  
    backgroundColor: colors.accent['steely-blue'],  
    paddingVertical: spacing.md,  
    paddingHorizontal: spacing.xl,  
    borderRadius: radius.md,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
  },  
  logButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.shell.light,  
  },  
  backButton: {  
    position: 'absolute',  
    top: spacing.xl,  
    left: spacing.lg,  
  },  
  backButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.text,  
  },  
  successContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  successIcon: {  
    fontSize: 80,  
    marginBottom: spacing.lg,  
  },  
  successText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xl.fontSize,  
    color: colors.theme.text,  
    textAlign: 'center',  
  },  
});

export default WorkoutSelectionV2;