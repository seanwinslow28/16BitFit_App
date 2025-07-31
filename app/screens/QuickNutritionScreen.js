/**
 * Quick Nutrition Logging Screen
 * Fast meal and nutrition tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NutritionService from '../services/NutritionService';
import HealthTrackingManager from '../services/HealthTrackingManager';

const QUICK_MEALS = [
  {
    id: 'healthy_breakfast',
    name: 'Healthy Breakfast',
    icon: '🥞',
    color: '#F39C12',
    description: 'Oatmeal, yogurt, berries',
    macros: 'P: 18g • C: 22g • F: 1.4g'
  },
  {
    id: 'protein_shake',
    name: 'Protein Shake',
    icon: '🥤',
    color: '#E74C3C',
    description: 'Post-workout recovery',
    macros: 'P: 27g • C: 29g • F: 3.8g'
  },
  {
    id: 'balanced_lunch',
    name: 'Balanced Lunch',
    icon: '🍱',
    color: '#2ECC71',
    description: 'Chicken, rice, veggies',
    macros: 'P: 35g • C: 32g • F: 5g'
  }
];

export default function QuickNutritionScreen({ navigation }) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadNutritionData();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 8
    }).start();
  };

  const loadNutritionData = async () => {
    try {
      const progress = NutritionService.getDailyProgress();
      const nutritionTips = NutritionService.getNutritionTips();
      
      setDailyProgress(progress);
      setTips(nutritionTips);
      setWaterIntake(progress.water.current);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    }
  };

  const handleQuickMeal = async (mealId) => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await HealthTrackingManager.quickLogNutrition(mealId);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Update local state
      setDailyProgress(result.dailyProgress);
      setTips(result.tips);
      
      // Show success feedback
      Alert.alert(
        'Meal Logged!',
        `${result.statImpact.xp} XP earned! ${result.tips[0]?.message || ''}`,
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'View Stats', 
            onPress: () => navigation.navigate('HealthDashboard') 
          }
        ]
      );
    } catch (error) {
      console.error('Failed to log meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWaterLog = async (amount) => {
    try {
      const newAmount = waterIntake + amount;
      setWaterIntake(newAmount);
      
      const result = await NutritionService.logWater(amount);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (result.percentage >= 100 && result.percentage - (amount / result.goal * 100) < 100) {
        // Just hit water goal!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('💧 Hydration Goal Achieved!', 'All stats boosted by 10%!');
      }
    } catch (error) {
      console.error('Failed to log water:', error);
    }
  };

  const renderQuickMeals = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Log Meals</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealsScroll}
      >
        {QUICK_MEALS.map((meal, index) => (
          <Animated.View
            key={meal.id}
            style={{
              transform: [{
                scale: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }],
              opacity: slideAnim
            }}
          >
            <TouchableOpacity
              style={[styles.mealCard, { borderColor: meal.color }]}
              onPress={() => handleQuickMeal(meal.id)}
              disabled={loading}
            >
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDescription}>{meal.description}</Text>
              <Text style={styles.mealMacros}>{meal.macros}</Text>
              
              <View style={[styles.mealTag, { backgroundColor: meal.color }]}>
                <Text style={styles.mealTagText}>Quick Log</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderWaterTracking = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Hydration</Text>
      
      <View style={styles.waterContainer}>
        <View style={styles.waterDisplay}>
          <Text style={styles.waterIcon}>💧</Text>
          <Text style={styles.waterAmount}>{waterIntake}ml</Text>
          <Text style={styles.waterGoal}>/ {dailyProgress?.water.goal || 2000}ml</Text>
        </View>
        
        <View style={styles.waterProgress}>
          <View 
            style={[
              styles.waterProgressFill,
              { width: `${dailyProgress?.water.percentage || 0}%` }
            ]}
          />
        </View>
        
        <View style={styles.waterButtons}>
          <TouchableOpacity
            style={styles.waterButton}
            onPress={() => handleWaterLog(250)}
          >
            <Text style={styles.waterButtonText}>+250ml</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.waterButton}
            onPress={() => handleWaterLog(500)}
          >
            <Text style={styles.waterButtonText}>+500ml</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.waterButton}
            onPress={() => handleWaterLog(1000)}
          >
            <Text style={styles.waterButtonText}>+1L</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDailyProgress = () => {
    if (!dailyProgress) return null;
    
    const macros = ['calories', 'protein', 'carbs', 'fat'];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Progress</Text>
        
        <View style={styles.progressGrid}>
          {macros.map(macro => (
            <View key={macro} style={styles.progressItem}>
              <Text style={styles.progressLabel}>{macro.toUpperCase()}</Text>
              <Text style={styles.progressValue}>
                {dailyProgress[macro].current}
              </Text>
              <Text style={styles.progressGoal}>
                /{dailyProgress[macro].goal}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(dailyProgress[macro].percentage, 100)}%`,
                      backgroundColor: dailyProgress[macro].percentage > 110 ? '#FF3B30' : '#00D4FF'
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Nutrition Score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(dailyProgress.overallScore) }]}>
            {dailyProgress.overallScore}%
          </Text>
          <Text style={styles.scoreGrade}>Grade: {dailyProgress.grade}</Text>
        </View>
      </View>
    );
  };

  const renderTips = () => {
    if (tips.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition Tips</Text>
        
        {tips.map((tip, index) => (
          <View 
            key={index} 
            style={[
              styles.tipCard,
              tip.priority === 'high' && styles.tipCardHighPriority
            ]}
          >
            <Text style={styles.tipMessage}>{tip.message}</Text>
            <Text style={styles.tipImpact}>{tip.impact}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#00D4FF';
    if (score >= 50) return '#F39C12';
    return '#E74C3C';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Quick Nutrition</Text>
          </View>
          
          {renderQuickMeals()}
          {renderWaterTracking()}
          {renderDailyProgress()}
          {renderTips()}
          
          <TouchableOpacity
            style={styles.detailedButton}
            onPress={() => navigation.navigate('DetailedNutrition')}
          >
            <Text style={styles.detailedButtonText}>
              Detailed Food Search →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    color: '#00D4FF',
    fontSize: 16,
    fontFamily: 'PressStart2P',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  mealsScroll: {
    paddingHorizontal: 20,
  },
  mealCard: {
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 2,
    padding: 20,
    marginRight: 15,
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  mealDescription: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  mealMacros: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
    marginBottom: 15,
  },
  mealTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  mealTagText: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  waterContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
  },
  waterDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waterIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  waterAmount: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
  },
  waterGoal: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#666',
    marginTop: 5,
  },
  waterProgress: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  waterButtonText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  progressItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 5,
  },
  progressValue: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  progressGoal: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'PressStart2P',
    marginBottom: 5,
  },
  scoreGrade: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#666',
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tipCardHighPriority: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  tipMessage: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    lineHeight: 16,
    marginBottom: 5,
  },
  tipImpact: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
  },
  detailedButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  detailedButtonText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
  },
});