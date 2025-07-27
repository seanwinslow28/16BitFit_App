import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCharacter } from '../contexts/CharacterContext';

const QUICK_FOODS = [
  { id: 'protein_shake', name: 'Protein Shake', category: 'protein', icon: '🥤', calories: 150, protein: 30 },
  { id: 'chicken_breast', name: 'Chicken Breast', category: 'protein', icon: '🍗', calories: 165, protein: 31 },
  { id: 'salad', name: 'Salad', category: 'healthy', icon: '🥗', calories: 100, carbs: 20 },
  { id: 'banana', name: 'Banana', category: 'energy', icon: '🍌', calories: 105, carbs: 27 },
  { id: 'pizza', name: 'Pizza Slice', category: 'treat', icon: '🍕', calories: 285, carbs: 36 },
  { id: 'water', name: 'Water', category: 'hydration', icon: '💧', calories: 0, hydration: 100 },
];

const FoodSelectionScreenV2 = () => {
  const navigation = useNavigation();
  const { addNutrition } = useCharacter();
  
  const [selectedFood, setSelectedFood] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const successAnim = useRef(new Animated.Value(0)).current;
  const eatAnim = useRef(new Animated.Value(1)).current;

  const handleFoodSelect = (food) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFood(food);
    
    // Eating animation
    Animated.sequence([
      Animated.timing(eatAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(eatAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleEatFood(food);
    });
  };

  const calculateStatGains = (food) => {
    const gains = {
      health: 0,
      strength: 0,
      stamina: 0,
    };
    
    // Health gains based on category
    if (food.category === 'healthy') {
      gains.health = 5;
    } else if (food.category === 'treat') {
      gains.health = -2; // Junk food penalty
    } else {
      gains.health = 2;
    }
    
    // Strength from protein
    if (food.protein) {
      gains.strength = Math.floor(food.protein / 10);
    }
    
    // Stamina from carbs
    if (food.carbs) {
      gains.stamina = Math.floor(food.carbs / 10);
    }
    
    // Hydration boost
    if (food.category === 'hydration') {
      gains.stamina = 5;
      gains.health = 3;
    }
    
    return gains;
  };

  const handleEatFood = async (food) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Calculate stat gains
    const gains = calculateStatGains(food);
    
    // Log nutrition using CharacterContext
    addNutrition({
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein: food.protein || 0,
    });
    
    // Show success
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Navigate back
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
              transform: [{ scale: successAnim }],
              opacity: successAnim,
            }
          ]}
        >
          <Text style={styles.successIcon}>{selectedFood?.icon}</Text>
          <Text style={styles.successText}>YUM! STATS UPDATED!</Text>
          <View style={styles.gainsList}>
            {calculateStatGains(selectedFood).health !== 0 && (
              <Text style={[
                styles.gainText,
                calculateStatGains(selectedFood).health < 0 && styles.negativeGain
              ]}>
                {calculateStatGains(selectedFood).health > 0 ? '+' : ''}{calculateStatGains(selectedFood).health} HP
              </Text>
            )}
            {calculateStatGains(selectedFood).strength > 0 && (
              <Text style={styles.gainText}>+{calculateStatGains(selectedFood).strength} STR</Text>
            )}
            {calculateStatGains(selectedFood).stamina > 0 && (
              <Text style={styles.gainText}>+{calculateStatGains(selectedFood).stamina} STA</Text>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FEED YOUR FIGHTER</Text>
        <Text style={styles.subtitle}>Choose food to gain stats!</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.foodGrid}>
          {QUICK_FOODS.map((food) => (
            <Pressable
              key={food.id}
              onPress={() => handleFoodSelect(food)}
              style={({ pressed }) => [
                styles.foodCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: selectedFood?.id === food.id ? eatAnim : 1 }
                  ]
                }}
              >
                <Text style={styles.foodIcon}>{food.icon}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodCalories}>{food.calories} cal</Text>
                <View style={styles.foodStats}>
                  {food.protein && (
                    <Text style={styles.foodStat}>P: {food.protein}g</Text>
                  )}
                  {food.carbs && (
                    <Text style={styles.foodStat}>C: {food.carbs}g</Text>
                  )}
                </View>
              </Animated.View>
            </Pressable>
          ))}
        </View>
        
        <View style={styles.tips}>
          <Text style={styles.tipTitle}>NUTRITION TIPS:</Text>
          <Text style={styles.tipText}>🥗 Healthy foods boost HP</Text>
          <Text style={styles.tipText}>🍗 Protein increases STR</Text>
          <Text style={styles.tipText}>🍌 Carbs improve STA</Text>
          <Text style={styles.tipText}>💧 Stay hydrated!</Text>
        </View>
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
    </View>
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
    marginBottom: 20,
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
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#0F380F',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  pressedCard: {
    transform: [{ scale: 0.95 }],
  },
  foodIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    marginBottom: 5,
  },
  foodCalories: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#556B2F',
    marginBottom: 5,
  },
  foodStats: {
    flexDirection: 'row',
    gap: 10,
  },
  foodStat: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
  },
  tips: {
    backgroundColor: '#0F380F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginVertical: 3,
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
    fontSize: 18,
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
    color: '#4CAF50',
    marginVertical: 5,
  },
  negativeGain: {
    color: '#F44336',
  },
});

export default FoodSelectionScreenV2;