/**
 * Food Selection Screen - Meal logging interface
 * GameBoy-styled nutrition tracking with visual food items
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
import FoodDatabase from '../components/FoodDatabase';
import MealLogger from '../components/MealLogger';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Unhealthy food
  blue: '#3498db',         // Special items
  gray: '#666666',         // Disabled items
};

// Food categories
const FOOD_CATEGORIES = [
  { id: 'breakfast', name: 'BREAKFAST', icon: '🌅' },
  { id: 'lunch', name: 'LUNCH', icon: '☀️' },
  { id: 'dinner', name: 'DINNER', icon: '🌙' },
  { id: 'snacks', name: 'SNACKS', icon: '🍿' },
  { id: 'drinks', name: 'DRINKS', icon: '🥤' },
  { id: 'healthy', name: 'HEALTHY', icon: '🥗' },
  { id: 'junk', name: 'JUNK FOOD', icon: '🍔' },
];

const FoodSelectionScreen = ({
  playerStats = {},
  dailyMeals = [],
  onNavigate = () => {},
  onMealLog = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [mealTime, setMealTime] = useState(getMealTimeOfDay());
  const [showRecentMeals, setShowRecentMeals] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get food database
  const foodDatabase = FoodDatabase.getAllFoods();
  const recentMeals = FoodDatabase.getRecentMeals(dailyMeals);

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
  }, []);

  // Helper function to determine meal time
  function getMealTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snacks';
  }

  const handleCategorySelect = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleFoodSelect = (food) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFood(food);
  };

  const handleLogMeal = () => {
    if (!selectedFood) {
      Alert.alert('Select Food', 'Please select a food item to log');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Log the meal
    onMealLog({
      food: selectedFood,
      mealTime,
      timestamp: new Date(),
      calories: selectedFood.calories,
      isHealthy: selectedFood.isHealthy,
      statEffects: selectedFood.statEffects,
    });

    // Reset selection
    setSelectedFood(null);
    
    // Show success feedback
    Alert.alert(
      'Meal Logged!',
      `${selectedFood.name} has been added to your ${mealTime}`,
      [{ text: 'OK', onPress: () => onNavigate('home') }]
    );
  };

  const filterFoods = () => {
    let filtered = foodDatabase;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => 
        food.categories.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

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
        <Text style={styles.categoryIcon}>🍽️</Text>
        <Text style={[styles.categoryText, pixelFont]}>ALL</Text>
      </TouchableOpacity>

      {FOOD_CATEGORIES.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive
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
        placeholder="Search foods..."
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

  const renderFoodItem = (food) => {
    const isSelected = selectedFood?.id === food.id;
    const healthColor = food.isHealthy ? COLORS.primary : COLORS.red;
    
    return (
      <TouchableOpacity
        key={food.id}
        style={[
          styles.foodItem,
          isSelected && styles.foodItemSelected,
          { borderColor: isSelected ? healthColor : COLORS.dark }
        ]}
        onPress={() => handleFoodSelect(food)}
        activeOpacity={0.8}
      >
        <View style={styles.foodItemHeader}>
          <Text style={styles.foodIcon}>{food.icon}</Text>
          <View style={styles.foodInfo}>
            <Text style={[styles.foodName, pixelFont]}>{food.name}</Text>
            <View style={styles.foodStats}>
              <Text style={[styles.foodCalories, pixelFont]}>
                {food.calories} CAL
              </Text>
              {food.protein > 0 && (
                <Text style={[styles.foodMacro, pixelFont]}>
                  P:{food.protein}g
                </Text>
              )}
            </View>
          </View>
          <View style={[
            styles.healthIndicator,
            { backgroundColor: healthColor }
          ]}>
            <Text style={[styles.healthText, pixelFont]}>
              {food.isHealthy ? 'HEALTHY' : 'JUNK'}
            </Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.foodDetails}>
            <Text style={[styles.detailsTitle, pixelFont]}>EFFECTS:</Text>
            <View style={styles.effectsList}>
              {Object.entries(food.statEffects).map(([stat, value]) => (
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
            {food.description && (
              <Text style={[styles.foodDescription, pixelFont]}>
                {food.description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentMeals = () => (
    <View style={styles.recentSection}>
      <TouchableOpacity
        style={styles.recentHeader}
        onPress={() => setShowRecentMeals(!showRecentMeals)}
      >
        <Text style={[styles.sectionTitle, pixelFont]}>RECENT MEALS</Text>
        <Text style={styles.expandIcon}>
          {showRecentMeals ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {showRecentMeals && (
        <View style={styles.recentList}>
          {recentMeals.length > 0 ? (
            recentMeals.map(meal => renderFoodItem(meal))
          ) : (
            <Text style={[styles.emptyText, pixelFont]}>
              No recent meals logged
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderMealTimeSelector = () => (
    <View style={styles.mealTimeContainer}>
      <Text style={[styles.mealTimeLabel, pixelFont]}>MEAL TIME:</Text>
      <View style={styles.mealTimeButtons}>
        {['breakfast', 'lunch', 'dinner', 'snacks'].map(time => (
          <TouchableOpacity
            key={time}
            style={[
              styles.mealTimeButton,
              mealTime === time && styles.mealTimeButtonActive
            ]}
            onPress={() => setMealTime(time)}
          >
            <Text style={[
              styles.mealTimeText,
              pixelFont,
              mealTime === time && styles.mealTimeTextActive
            ]}>
              {time.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNutritionSummary = () => {
    const todaysMeals = dailyMeals.filter(meal => 
      new Date(meal.timestamp).toDateString() === new Date().toDateString()
    );
    
    const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const healthyCount = todaysMeals.filter(meal => meal.isHealthy).length;
    const junkCount = todaysMeals.length - healthyCount;

    return (
      <View style={styles.nutritionSummary}>
        <Text style={[styles.summaryTitle, pixelFont]}>TODAY'S NUTRITION</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont]}>{totalCalories}</Text>
            <Text style={[styles.summaryLabel, pixelFont]}>CALORIES</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont, { color: COLORS.primary }]}>
              {healthyCount}
            </Text>
            <Text style={[styles.summaryLabel, pixelFont]}>HEALTHY</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, pixelFont, { color: COLORS.red }]}>
              {junkCount}
            </Text>
            <Text style={[styles.summaryLabel, pixelFont]}>JUNK</Text>
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
        <Text style={[styles.headerTitle, pixelFont]}>FOOD LOG</Text>
        <View style={styles.backButton} />
      </View>

      {/* Nutrition Summary */}
      {renderNutritionSummary()}

      {/* Meal Time Selector */}
      {renderMealTimeSelector()}

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Food List */}
      <ScrollView
        style={styles.foodList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.foodListContent}
      >
        {/* Recent Meals Section */}
        {renderRecentMeals()}

        {/* All Foods */}
        <Text style={[styles.sectionTitle, pixelFont]}>ALL FOODS</Text>
        {filterFoods().map(renderFoodItem)}
      </ScrollView>

      {/* Log Button */}
      {selectedFood && (
        <MealLogger
          selectedFood={selectedFood}
          mealTime={mealTime}
          onLog={handleLogMeal}
          onCancel={() => setSelectedFood(null)}
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

  nutritionSummary: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
    margin: 20,
    marginBottom: 10,
  },

  summaryTitle: {
    fontSize: 12,
    color: COLORS.yellow,
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

  mealTimeContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  mealTimeLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  mealTimeButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  mealTimeButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 6,
    alignItems: 'center',
  },

  mealTimeButtonActive: {
    backgroundColor: COLORS.primary,
  },

  mealTimeText: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  mealTimeTextActive: {
    color: COLORS.dark,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
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

  foodList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  foodListContent: {
    paddingBottom: 100,
  },

  sectionTitle: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginVertical: 12,
  },

  foodItem: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },

  foodItemSelected: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
  },

  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  foodIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  foodInfo: {
    flex: 1,
  },

  foodName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  foodStats: {
    flexDirection: 'row',
    gap: 12,
  },

  foodCalories: {
    fontSize: 10,
    color: COLORS.yellow,
  },

  foodMacro: {
    fontSize: 8,
    color: '#666',
  },

  healthIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  healthText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  foodDetails: {
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

  foodDescription: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  recentSection: {
    marginBottom: 20,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },

  expandIcon: {
    fontSize: 12,
    color: COLORS.primary,
  },

  recentList: {
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default FoodSelectionScreen;