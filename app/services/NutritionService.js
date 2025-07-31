/**
 * Nutrition Tracking Service
 * Handles food logging, macro tracking, and nutrition-based stat calculations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

// Nutrition to stat mappings
const NUTRITION_STAT_IMPACTS = {
  protein: {
    primary: 'attack',
    secondary: 'defense',
    ratio: 0.02 // 2 attack points per 100g protein
  },
  carbs: {
    primary: 'stamina',
    secondary: 'speed',
    ratio: 0.01 // 1 stamina point per 100g carbs
  },
  fat: {
    primary: 'defense',
    secondary: 'stamina',
    ratio: 0.015 // 1.5 defense points per 100g fat
  },
  water: {
    primary: 'all',
    ratio: 0.001 // Multiplier bonus for hydration
  },
  calories: {
    xp: 0.1 // 0.1 XP per calorie (balanced diet)
  }
};

// Meal timing impacts
const MEAL_TIMING_BONUSES = {
  pre_workout: {
    stamina: 1.2,
    speed: 1.1
  },
  post_workout: {
    attack: 1.3,
    defense: 1.2
  },
  breakfast: {
    all: 1.05 // 5% bonus for starting day right
  }
};

class NutritionService {
  constructor() {
    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbs: 225,
      fat: 65,
      water: 2000 // ml
    };
    
    this.currentDay = null;
    this.todayNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      meals: []
    };
    
    this.foodDatabase = null;
    this.customFoods = [];
  }

  /**
   * Initialize nutrition service
   */
  async initialize() {
    try {
      console.log('Initializing Nutrition Service...');
      
      // Load user goals
      await this.loadUserGoals();
      
      // Load today's nutrition data
      await this.loadTodayNutrition();
      
      // Load custom foods
      await this.loadCustomFoods();
      
      console.log('Nutrition Service initialized');
      return true;
    } catch (error) {
      console.error('Nutrition Service initialization failed:', error);
      return false;
    }
  }

  /**
   * Set daily nutrition goals
   */
  async setDailyGoals(goals) {
    try {
      this.dailyGoals = {
        ...this.dailyGoals,
        ...goals
      };
      
      await AsyncStorage.setItem('nutritionGoals', JSON.stringify(this.dailyGoals));
      
      // Sync to database
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userData.user.id,
            nutrition_goals: this.dailyGoals
          });
      }
      
      return this.dailyGoals;
    } catch (error) {
      console.error('Failed to set nutrition goals:', error);
      throw error;
    }
  }

  /**
   * Quick food search (local database + API fallback)
   */
  async searchFood(query, limit = 10) {
    try {
      const results = [];
      
      // Search custom foods first
      const customMatches = this.customFoods.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...customMatches.slice(0, 5));
      
      // Search common foods database
      const commonMatches = await this.searchCommonFoods(query);
      results.push(...commonMatches.slice(0, limit - results.length));
      
      // If not enough results, use API
      if (results.length < limit) {
        const apiResults = await this.searchFoodAPI(query, limit - results.length);
        results.push(...apiResults);
      }
      
      return results;
    } catch (error) {
      console.error('Food search failed:', error);
      return [];
    }
  }

  /**
   * Log a meal
   */
  async logMeal(meal) {
    try {
      const mealData = {
        id: `meal_${Date.now()}`,
        timestamp: new Date(),
        name: meal.name,
        foods: meal.foods,
        type: meal.type || this.getMealType(), // breakfast, lunch, dinner, snack
        nutrition: this.calculateMealNutrition(meal.foods),
        timing: meal.timing || null // pre_workout, post_workout, etc.
      };
      
      // Update today's totals
      this.updateTodayNutrition(mealData.nutrition);
      this.todayNutrition.meals.push(mealData);
      
      // Save locally
      await this.saveTodayNutrition();
      
      // Calculate stat impact
      const statImpact = this.calculateNutritionStatImpact(
        mealData.nutrition,
        mealData.timing
      );
      
      // Sync to database
      await this.syncMealToDatabase(mealData, statImpact);
      
      return {
        meal: mealData,
        statImpact,
        dailyProgress: this.getDailyProgress()
      };
    } catch (error) {
      console.error('Failed to log meal:', error);
      throw error;
    }
  }

  /**
   * Quick log common meals
   */
  async quickLogMeal(mealType) {
    const quickMeals = {
      healthy_breakfast: {
        name: 'Healthy Breakfast',
        foods: [
          { name: 'Oatmeal', amount: 100, unit: 'g', calories: 71, protein: 2.5, carbs: 12, fat: 1.4 },
          { name: 'Greek Yogurt', amount: 150, unit: 'g', calories: 90, protein: 15, carbs: 5, fat: 0 },
          { name: 'Berries', amount: 50, unit: 'g', calories: 20, protein: 0.5, carbs: 5, fat: 0 }
        ]
      },
      protein_shake: {
        name: 'Protein Shake',
        foods: [
          { name: 'Whey Protein', amount: 30, unit: 'g', calories: 120, protein: 25, carbs: 3, fat: 1 },
          { name: 'Banana', amount: 100, unit: 'g', calories: 89, protein: 1, carbs: 23, fat: 0.3 },
          { name: 'Almond Milk', amount: 250, unit: 'ml', calories: 40, protein: 1, carbs: 3, fat: 2.5 }
        ],
        timing: 'post_workout'
      },
      balanced_lunch: {
        name: 'Balanced Lunch',
        foods: [
          { name: 'Grilled Chicken', amount: 150, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: 'Brown Rice', amount: 100, unit: 'g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9 },
          { name: 'Mixed Vegetables', amount: 150, unit: 'g', calories: 40, protein: 2, carbs: 8, fat: 0.5 }
        ]
      }
    };
    
    const meal = quickMeals[mealType];
    if (!meal) {
      throw new Error('Unknown quick meal type');
    }
    
    return await this.logMeal(meal);
  }

  /**
   * Log water intake
   */
  async logWater(amount, unit = 'ml') {
    try {
      const mlAmount = unit === 'oz' ? amount * 29.5735 : amount;
      
      this.todayNutrition.water += mlAmount;
      await this.saveTodayNutrition();
      
      // Calculate hydration bonus
      const hydrationLevel = this.todayNutrition.water / this.dailyGoals.water;
      const statBonus = hydrationLevel >= 1 ? { multiplier: 1.1 } : { multiplier: 1 + (hydrationLevel * 0.1) };
      
      return {
        totalWater: this.todayNutrition.water,
        goal: this.dailyGoals.water,
        percentage: Math.round((this.todayNutrition.water / this.dailyGoals.water) * 100),
        statBonus
      };
    } catch (error) {
      console.error('Failed to log water:', error);
      throw error;
    }
  }

  /**
   * Calculate nutrition-based stat impacts
   */
  calculateNutritionStatImpact(nutrition, timing = null) {
    const impacts = {
      attack: 0,
      defense: 0,
      stamina: 0,
      speed: 0,
      xp: 0,
      multipliers: {}
    };
    
    // Protein impact
    if (nutrition.protein > 0) {
      impacts.attack += Math.round(nutrition.protein * NUTRITION_STAT_IMPACTS.protein.ratio);
      impacts.defense += Math.round(nutrition.protein * NUTRITION_STAT_IMPACTS.protein.ratio * 0.5);
    }
    
    // Carbs impact
    if (nutrition.carbs > 0) {
      impacts.stamina += Math.round(nutrition.carbs * NUTRITION_STAT_IMPACTS.carbs.ratio);
      impacts.speed += Math.round(nutrition.carbs * NUTRITION_STAT_IMPACTS.carbs.ratio * 0.5);
    }
    
    // Fat impact
    if (nutrition.fat > 0) {
      impacts.defense += Math.round(nutrition.fat * NUTRITION_STAT_IMPACTS.fat.ratio);
      impacts.stamina += Math.round(nutrition.fat * NUTRITION_STAT_IMPACTS.fat.ratio * 0.3);
    }
    
    // Calorie XP
    if (nutrition.calories > 0) {
      // Bonus XP for balanced meals
      const isBalanced = nutrition.protein > 10 && nutrition.carbs > 20 && nutrition.fat > 5;
      const xpMultiplier = isBalanced ? 1.5 : 1;
      impacts.xp = Math.round(nutrition.calories * NUTRITION_STAT_IMPACTS.calories.xp * xpMultiplier);
    }
    
    // Apply timing bonuses
    if (timing && MEAL_TIMING_BONUSES[timing]) {
      const timingBonus = MEAL_TIMING_BONUSES[timing];
      
      if (timingBonus.all) {
        impacts.multipliers.all = timingBonus.all;
      } else {
        Object.entries(timingBonus).forEach(([stat, multiplier]) => {
          impacts.multipliers[stat] = multiplier;
        });
      }
    }
    
    // Daily goal achievements
    const progressBonuses = this.calculateProgressBonuses();
    Object.entries(progressBonuses).forEach(([stat, bonus]) => {
      impacts.multipliers[stat] = (impacts.multipliers[stat] || 1) * bonus;
    });
    
    return impacts;
  }

  /**
   * Get daily nutrition progress
   */
  getDailyProgress() {
    const progress = {
      calories: {
        current: this.todayNutrition.calories,
        goal: this.dailyGoals.calories,
        percentage: Math.round((this.todayNutrition.calories / this.dailyGoals.calories) * 100)
      },
      protein: {
        current: this.todayNutrition.protein,
        goal: this.dailyGoals.protein,
        percentage: Math.round((this.todayNutrition.protein / this.dailyGoals.protein) * 100)
      },
      carbs: {
        current: this.todayNutrition.carbs,
        goal: this.dailyGoals.carbs,
        percentage: Math.round((this.todayNutrition.carbs / this.dailyGoals.carbs) * 100)
      },
      fat: {
        current: this.todayNutrition.fat,
        goal: this.dailyGoals.fat,
        percentage: Math.round((this.todayNutrition.fat / this.dailyGoals.fat) * 100)
      },
      water: {
        current: this.todayNutrition.water,
        goal: this.dailyGoals.water,
        percentage: Math.round((this.todayNutrition.water / this.dailyGoals.water) * 100)
      }
    };
    
    // Calculate overall score
    const scores = Object.values(progress).map(p => {
      // Optimal is 90-110% of goal
      if (p.percentage >= 90 && p.percentage <= 110) return 100;
      if (p.percentage < 90) return p.percentage;
      // Over 110% starts decreasing score
      return Math.max(0, 200 - p.percentage);
    });
    
    progress.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    progress.grade = this.getProgressGrade(progress.overallScore);
    
    return progress;
  }

  /**
   * Get nutrition tips based on current progress
   */
  getNutritionTips() {
    const progress = this.getDailyProgress();
    const tips = [];
    
    if (progress.protein.percentage < 80) {
      tips.push({
        type: 'protein',
        message: 'Add more protein for muscle growth! Try chicken, fish, or beans.',
        impact: '+Attack Power'
      });
    }
    
    if (progress.water.percentage < 50) {
      tips.push({
        type: 'water',
        priority: 'high',
        message: 'Stay hydrated! Your performance multiplier is reduced.',
        impact: 'All Stats Boost'
      });
    }
    
    if (progress.overallScore > 85) {
      tips.push({
        type: 'achievement',
        message: 'Great nutrition today! Keep it up for maximum gains!',
        impact: '+10% XP Bonus'
      });
    }
    
    return tips;
  }

  /**
   * Create custom food entry
   */
  async createCustomFood(food) {
    try {
      const customFood = {
        id: `custom_${Date.now()}`,
        name: food.name,
        brand: food.brand || 'Custom',
        serving_size: food.serving_size,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        created_at: new Date()
      };
      
      this.customFoods.push(customFood);
      await this.saveCustomFoods();
      
      // Sync to database
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData) {
        await supabase
          .from('custom_foods')
          .insert({
            user_id: userData.user.id,
            ...customFood
          });
      }
      
      return customFood;
    } catch (error) {
      console.error('Failed to create custom food:', error);
      throw error;
    }
  }

  /**
   * Get meal suggestions based on goals and time
   */
  getMealSuggestions() {
    const hour = new Date().getHours();
    const progress = this.getDailyProgress();
    const suggestions = [];
    
    // Time-based suggestions
    if (hour >= 6 && hour < 10) {
      suggestions.push({
        type: 'breakfast',
        name: 'Power Breakfast',
        description: 'High protein start to fuel your day',
        quickLog: 'healthy_breakfast',
        statBoost: '+5% All Day Bonus'
      });
    } else if (hour >= 11 && hour < 14) {
      suggestions.push({
        type: 'lunch',
        name: 'Balanced Lunch',
        description: 'Perfect macro balance for sustained energy',
        quickLog: 'balanced_lunch',
        statBoost: '+Stamina +Defense'
      });
    }
    
    // Goal-based suggestions
    if (progress.protein.percentage < 50) {
      suggestions.push({
        type: 'snack',
        name: 'Protein Boost',
        description: 'Quick protein to hit your goals',
        quickLog: 'protein_shake',
        statBoost: '+Attack Power'
      });
    }
    
    return suggestions;
  }

  // Helper methods

  async loadUserGoals() {
    try {
      const saved = await AsyncStorage.getItem('nutritionGoals');
      if (saved) {
        this.dailyGoals = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load nutrition goals:', error);
    }
  }

  async loadTodayNutrition() {
    try {
      const today = new Date().toDateString();
      
      if (this.currentDay !== today) {
        // New day, reset nutrition
        this.currentDay = today;
        this.todayNutrition = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0,
          meals: []
        };
      } else {
        // Load existing data
        const saved = await AsyncStorage.getItem(`nutrition_${today}`);
        if (saved) {
          this.todayNutrition = JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error('Failed to load today nutrition:', error);
    }
  }

  async saveTodayNutrition() {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(
        `nutrition_${today}`,
        JSON.stringify(this.todayNutrition)
      );
    } catch (error) {
      console.error('Failed to save today nutrition:', error);
    }
  }

  async loadCustomFoods() {
    try {
      const saved = await AsyncStorage.getItem('customFoods');
      if (saved) {
        this.customFoods = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load custom foods:', error);
    }
  }

  async saveCustomFoods() {
    try {
      await AsyncStorage.setItem('customFoods', JSON.stringify(this.customFoods));
    } catch (error) {
      console.error('Failed to save custom foods:', error);
    }
  }

  calculateMealNutrition(foods) {
    return foods.reduce((total, food) => ({
      calories: total.calories + (food.calories || 0),
      protein: total.protein + (food.protein || 0),
      carbs: total.carbs + (food.carbs || 0),
      fat: total.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  updateTodayNutrition(nutrition) {
    this.todayNutrition.calories += nutrition.calories;
    this.todayNutrition.protein += nutrition.protein;
    this.todayNutrition.carbs += nutrition.carbs;
    this.todayNutrition.fat += nutrition.fat;
  }

  getMealType() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'breakfast';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 17 && hour < 20) return 'dinner';
    return 'snack';
  }

  calculateProgressBonuses() {
    const progress = this.getDailyProgress();
    const bonuses = {};
    
    // Perfect nutrition bonus
    if (progress.overallScore >= 90) {
      bonuses.all = 1.1; // 10% bonus to all stats
    }
    
    // Hydration bonus
    if (progress.water.percentage >= 100) {
      bonuses.stamina = 1.15; // 15% stamina bonus
    }
    
    return bonuses;
  }

  getProgressGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  async searchCommonFoods(query) {
    // This would be replaced with a real food database
    const commonFoods = [
      { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving_size: 100, unit: 'g' },
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving_size: 100, unit: 'g' },
      { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, serving_size: 100, unit: 'g' },
      { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving_size: 100, unit: 'g' },
      { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, serving_size: 100, unit: 'g' }
    ];
    
    return commonFoods.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchFoodAPI(query, limit) {
    // TODO: Implement real API integration (Spoonacular, USDA, etc.)
    // For now, return empty array
    return [];
  }

  async syncMealToDatabase(meal, statImpact) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userData.user.id,
          meal_data: meal,
          stat_impact: statImpact,
          logged_at: meal.timestamp
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to sync meal to database:', error);
    }
  }
}

export default new NutritionService();