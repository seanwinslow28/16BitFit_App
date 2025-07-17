/**
 * Workout Selection Screen - Exercise logging interface
 * GameBoy-styled fitness tracking with visual workout categories
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import WorkoutDatabase from '../components/WorkoutDatabase';
import WorkoutLogger from '../components/WorkoutLogger';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // High intensity
  blue: '#3498db',         // Recovery
  purple: '#9b59b6',       // Flexibility
  orange: '#f39c12',       // Strength
};

// Workout categories with colors
const WORKOUT_CATEGORIES = [
  { id: 'cardio', name: 'CARDIO', icon: '🏃', color: COLORS.red },
  { id: 'strength', name: 'STRENGTH', icon: '💪', color: COLORS.orange },
  { id: 'flexibility', name: 'FLEXIBILITY', icon: '🧘', color: COLORS.purple },
  { id: 'sports', name: 'SPORTS', icon: '⚽', color: COLORS.primary },
  { id: 'recovery', name: 'RECOVERY', icon: '😌', color: COLORS.blue },
  { id: 'hiit', name: 'HIIT', icon: '🔥', color: COLORS.yellow },
];

const WorkoutSelectionScreen = ({
  playerStats = {},
  dailyWorkouts = [],
  currentStreak = 0,
  onNavigate = () => {},
  onWorkoutLog = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedIntensity, setSelectedIntensity] = useState('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const streakScaleAnim = useRef(new Animated.Value(1)).current;

  // Get workout database
  const workoutDatabase = WorkoutDatabase.getAllWorkouts();
  const favoriteWorkouts = WorkoutDatabase.getFavoriteWorkouts();
  const suggestedWorkouts = WorkoutDatabase.getSuggestedWorkouts(playerStats);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate streak counter
    if (currentStreak > 0) {
      Animated.sequence([
        Animated.spring(streakScaleAnim, {
          toValue: 1.2,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(streakScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStreak]);

  const handleCategorySelect = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleWorkoutSelect = (workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedWorkout(workout);
  };

  const handleLogWorkout = () => {
    if (!selectedWorkout) {
      Alert.alert('Select Workout', 'Please select a workout to log');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Calculate actual stat effects based on duration and intensity
    const multiplier = getIntensityMultiplier();
    const durationMultiplier = selectedDuration / 30; // Base is 30 minutes
    
    const adjustedEffects = {};
    Object.entries(selectedWorkout.statEffects).forEach(([stat, value]) => {
      adjustedEffects[stat] = Math.round(value * multiplier * durationMultiplier);
    });

    // Log the workout
    onWorkoutLog({
      workout: selectedWorkout,
      duration: selectedDuration,
      intensity: selectedIntensity,
      timestamp: new Date(),
      caloriesBurned: Math.round(selectedWorkout.caloriesPerHour * (selectedDuration / 60) * multiplier),
      statEffects: adjustedEffects,
      xpEarned: Math.round(25 * multiplier * durationMultiplier),
    });

    // Reset selection
    setSelectedWorkout(null);
    
    // Show success feedback
    Alert.alert(
      'Workout Complete!',
      `Great job! You've completed ${selectedDuration} minutes of ${selectedWorkout.name}`,
      [{ text: 'OK', onPress: () => onNavigate('home') }]
    );
  };

  const getIntensityMultiplier = () => {
    switch (selectedIntensity) {
      case 'light': return 0.7;
      case 'medium': return 1.0;
      case 'high': return 1.3;
      default: return 1.0;
    }
  };

  const filterWorkouts = () => {
    let filtered = showFavorites ? favoriteWorkouts : workoutDatabase;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(workout => 
        workout.categories.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const renderStreakCounter = () => (
    <Animated.View 
      style={[
        styles.streakContainer,
        { transform: [{ scale: streakScaleAnim }] }
      ]}
    >
      <Text style={styles.streakIcon}>🔥</Text>
      <View style={styles.streakInfo}>
        <Text style={[styles.streakValue, pixelFont]}>{currentStreak}</Text>
        <Text style={[styles.streakLabel, pixelFont]}>DAY STREAK</Text>
      </View>
      {currentStreak >= 7 && (
        <View style={styles.streakBadge}>
          <Text style={[styles.streakBadgeText, pixelFont]}>WEEK!</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'all' && styles.categoryButtonActive
        ]}
        onPress={() => handleCategorySelect('all')}
      >
        <Text style={styles.categoryIcon}>🎯</Text>
        <Text style={[styles.categoryText, pixelFont]}>ALL</Text>
      </TouchableOpacity>

      {WORKOUT_CATEGORIES.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive,
            selectedCategory === category.id && { borderColor: category.color }
          ]}
          onPress={() => handleCategorySelect(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[styles.categoryText, pixelFont]}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.searchInput, pixelFont]}
        placeholder="Search workouts..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderWorkoutItem = (workout) => {
    const isSelected = selectedWorkout?.id === workout.id;
    const categoryColor = WORKOUT_CATEGORIES.find(c => 
      workout.categories.includes(c.id)
    )?.color || COLORS.primary;
    
    return (
      <TouchableOpacity
        key={workout.id}
        style={[
          styles.workoutItem,
          isSelected && styles.workoutItemSelected,
          { borderColor: isSelected ? categoryColor : COLORS.dark }
        ]}
        onPress={() => handleWorkoutSelect(workout)}
        activeOpacity={0.8}
      >
        <View style={styles.workoutItemHeader}>
          <Text style={styles.workoutIcon}>{workout.icon}</Text>
          <View style={styles.workoutInfo}>
            <Text style={[styles.workoutName, pixelFont]}>{workout.name}</Text>
            <View style={styles.workoutStats}>
              <Text style={[styles.workoutDifficulty, pixelFont]}>
                {workout.difficulty.toUpperCase()}
              </Text>
              <Text style={[styles.workoutCalories, pixelFont]}>
                {workout.caloriesPerHour} CAL/HR
              </Text>
            </View>
          </View>
          <View style={[
            styles.categoryIndicator,
            { backgroundColor: categoryColor }
          ]}>
            <Text style={[styles.categoryIndicatorText, pixelFont]}>
              {workout.categories[0].toUpperCase()}
            </Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.workoutDetails}>
            <Text style={[styles.detailsTitle, pixelFont]}>EFFECTS:</Text>
            <View style={styles.effectsList}>
              {Object.entries(workout.statEffects).map(([stat, value]) => (
                <Text
                  key={stat}
                  style={[
                    styles.effectItem,
                    pixelFont,
                    { color: value > 0 ? COLORS.primary : COLORS.red }
                  ]}
                >
                  {stat.toUpperCase()}: {value > 0 ? '+' : ''}{value}
                </Text>
              ))}
            </View>
            {workout.description && (
              <Text style={[styles.workoutDescription, pixelFont]}>
                {workout.description}
              </Text>
            )}
            
            {/* Duration and Intensity Selectors */}
            <View style={styles.workoutOptions}>
              <View style={styles.optionSection}>
                <Text style={[styles.optionLabel, pixelFont]}>DURATION:</Text>
                <View style={styles.durationButtons}>
                  {[15, 30, 45, 60].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationButton,
                        selectedDuration === duration && styles.durationButtonActive
                      ]}
                      onPress={() => setSelectedDuration(duration)}
                    >
                      <Text style={[
                        styles.durationText,
                        pixelFont,
                        selectedDuration === duration && styles.durationTextActive
                      ]}>
                        {duration}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.optionSection}>
                <Text style={[styles.optionLabel, pixelFont]}>INTENSITY:</Text>
                <View style={styles.intensityButtons}>
                  {['light', 'medium', 'high'].map(intensity => (
                    <TouchableOpacity
                      key={intensity}
                      style={[
                        styles.intensityButton,
                        selectedIntensity === intensity && styles.intensityButtonActive
                      ]}
                      onPress={() => setSelectedIntensity(intensity)}
                    >
                      <Text style={[
                        styles.intensityText,
                        pixelFont,
                        selectedIntensity === intensity && styles.intensityTextActive
                      ]}>
                        {intensity.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSuggestedWorkouts = () => (
    <View style={styles.suggestedSection}>
      <Text style={[styles.sectionTitle, pixelFont]}>SUGGESTED FOR YOU</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestedList}
      >
        {suggestedWorkouts.map(workout => (
          <TouchableOpacity
            key={workout.id}
            style={styles.suggestedCard}
            onPress={() => handleWorkoutSelect(workout)}
          >
            <Text style={styles.suggestedIcon}>{workout.icon}</Text>
            <Text style={[styles.suggestedName, pixelFont]}>{workout.name}</Text>
            <Text style={[styles.suggestedReason, pixelFont]}>
              {workout.reason || 'Recommended'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTodaysSummary = () => {
    const todaysWorkouts = dailyWorkouts.filter(workout => 
      new Date(workout.timestamp).toDateString() === new Date().toDateString()
    );
    
    const totalMinutes = todaysWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = todaysWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    return (
      <View style={styles.todaysSummary}>
        <Text style={[styles.summaryTitle, pixelFont]}>TODAY'S ACTIVITY</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont]}>{todaysWorkouts.length}</Text>
            <Text style={[styles.summaryLabel, pixelFont]}>WORKOUTS</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont]}>{totalMinutes}</Text>
            <Text style={[styles.summaryLabel, pixelFont]}>MINUTES</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont]}>{totalCalories}</Text>
            <Text style={[styles.summaryLabel, pixelFont]}>CALORIES</Text>
          </View>
        </View>
      </View>
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>TRAINING</Text>
        <TouchableOpacity 
          style={styles.favButton}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Text style={styles.favIcon}>{showFavorites ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Streak Counter */}
      {renderStreakCounter()}

      {/* Today's Summary */}
      {renderTodaysSummary()}

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Workout List */}
      <ScrollView
        style={styles.workoutList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.workoutListContent}
      >
        {/* Suggested Workouts */}
        {!showFavorites && !searchQuery && renderSuggestedWorkouts()}

        {/* All Workouts */}
        <Text style={[styles.sectionTitle, pixelFont]}>
          {showFavorites ? 'FAVORITE WORKOUTS' : 'ALL WORKOUTS'}
        </Text>
        {filterWorkouts().map(renderWorkoutItem)}
      </ScrollView>

      {/* Log Button */}
      {selectedWorkout && (
        <WorkoutLogger
          selectedWorkout={selectedWorkout}
          duration={selectedDuration}
          intensity={selectedIntensity}
          onLog={handleLogWorkout}
          onCancel={() => setSelectedWorkout(null)}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  favButton: {
    width: 80,
    alignItems: 'flex-end',
  },

  favIcon: {
    fontSize: 24,
    color: COLORS.yellow,
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 213, 29, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.yellow,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },

  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  streakInfo: {
    alignItems: 'center',
  },

  streakValue: {
    fontSize: 24,
    color: COLORS.yellow,
    letterSpacing: 1,
  },

  streakLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  streakBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  streakBadgeText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  todaysSummary: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },

  summaryTitle: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  clearIcon: {
    fontSize: 16,
    color: COLORS.red,
    padding: 5,
  },

  categoryScroll: {
    maxHeight: 80,
    marginBottom: 10,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    marginRight: 10,
  },

  categoryButtonActive: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  workoutList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  workoutListContent: {
    paddingBottom: 100,
  },

  sectionTitle: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginVertical: 12,
  },

  workoutItem: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },

  workoutItemSelected: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
  },

  workoutItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  workoutIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  workoutInfo: {
    flex: 1,
  },

  workoutName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  workoutStats: {
    flexDirection: 'row',
    gap: 12,
  },

  workoutDifficulty: {
    fontSize: 8,
    color: COLORS.yellow,
  },

  workoutCalories: {
    fontSize: 8,
    color: '#666',
  },

  categoryIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  categoryIndicatorText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  workoutDetails: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.3)',
  },

  detailsTitle: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  effectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },

  effectItem: {
    fontSize: 9,
    letterSpacing: 0.5,
  },

  workoutDescription: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 0.5,
    lineHeight: 14,
    marginBottom: 12,
  },

  workoutOptions: {
    gap: 12,
  },

  optionSection: {
    gap: 8,
  },

  optionLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  durationButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 6,
    alignItems: 'center',
  },

  durationButtonActive: {
    backgroundColor: COLORS.primary,
  },

  durationText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  durationTextActive: {
    color: COLORS.dark,
  },

  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  intensityButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 6,
    alignItems: 'center',
  },

  intensityButtonActive: {
    backgroundColor: COLORS.yellow,
  },

  intensityText: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  intensityTextActive: {
    color: COLORS.dark,
  },

  suggestedSection: {
    marginBottom: 20,
  },

  suggestedList: {
    gap: 12,
  },

  suggestedCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: 120,
  },

  suggestedIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  suggestedName: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },

  suggestedReason: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

export default WorkoutSelectionScreen;