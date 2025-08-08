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
import designTokens from '../constants/designTokens'; // Import our design system
import StatGainAnimation from '../components/animations/StatGainAnimation';

// DATA and LOGIC (unchanged)  
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
  const { addNutrition, characterStats } = useCharacter();  
    
  const [selectedFood, setSelectedFood] = useState(null);  
  const [showSuccess, setShowSuccess] = useState(false);
  const [statGains, setStatGains] = useState(null);  
    
  const successAnim = useRef(new Animated.Value(0)).current;  
  const eatAnim = useRef(new Animated.Value(1)).current;

  // All event handlers and logic functions (handleFoodSelect, calculateStatGains, etc.) remain unchanged.  
  // ...  
  const handleFoodSelect = (food) => {  
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);  
    setSelectedFood(food);  
      
    Animated.sequence([  
      Animated.timing(eatAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),  
      Animated.timing(eatAnim, { toValue: 0, duration: 300, useNativeDriver: true }),  
    ]).start(() => {  
      handleEatFood(food);  
    });  
  };

  const calculateStatGains = (food) => {  
    const gains = { health: 0, strength: 0, stamina: 0 };  
    if (food.category === 'healthy') gains.health = 5;  
    else if (food.category === 'treat') gains.health = -2;  
    else gains.health = 2;  
    if (food.protein) gains.strength = Math.floor(food.protein / 10);  
    if (food.carbs) gains.stamina = Math.floor(food.carbs / 10);  
    if (food.category === 'hydration') { gains.stamina = 5; gains.health = 3; }  
    return gains;  
  };

  const handleEatFood = async (food) => {  
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const gains = calculateStatGains(food);
    
    addNutrition({  
      name: food.name, category: food.category, calories: food.calories, protein: food.protein || 0,  
    });  
    
    // Show the stat gain animation instead of simple success
    setStatGains(gains);
  };
  
  const handleAnimationComplete = () => {
    navigation.goBack();
  };  
  // ...

  if (showSuccess) {  
    // This view is already well-styled and consistent.  
    return (  
      <View style={styles.container}>  
        <Animated.View style={[ styles.successContainer, { transform: [{ scale: successAnim }], opacity: successAnim } ]}>  
          <Text style={styles.successIcon}>{selectedFood?.icon}</Text>  
          <Text style={styles.successText}>YUM! STATS UPDATED!</Text>  
        </Animated.View>  
      </View>  
    );  
  }

  return (  
    <View style={styles.container}>  
      <View style={styles.header}>  
        <Text style={styles.title}>FEED YOUR FIGHTER</Text>  
      </View>  
        
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>  
        <View style={styles.foodGrid}>  
          {QUICK_FOODS.map((food) => (  
            <Pressable key={food.id} onPress={() => handleFoodSelect(food)} style={({ pressed }) => [ styles.foodCard, pressed && styles.pressedCard ]}>  
              <Animated.View style={{ transform: [{ scale: selectedFood?.id === food.id ? eatAnim : 1 }] }}>  
                <Text style={styles.foodIcon}>{food.icon}</Text>  
                <Text style={styles.foodName}>{food.name}</Text>  
                <Text style={styles.foodCalories}>{food.calories} cal</Text>  
              </Animated.View>  
            </Pressable>  
          ))}  
        </View>  
          
        <View style={styles.tipsPanel}>  
          <Text style={styles.tipTitle}>NUTRITION TIPS:</Text>  
          <Text style={styles.tipText}>🥗 Healthy foods boost HP</Text>  
          <Text style={styles.tipText}>🍗 Protein increases STR</Text>  
          <Text style={styles.tipText}>🍌 Carbs improve STA</Text>  
          <Text style={styles.tipText}>💧 Stay hydrated!</Text>  
        </View>  
      </ScrollView>  
        
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>  
        <Text style={styles.backButtonText}>← BACK</Text>  
      </Pressable>
      
      {/* Stat Gain Animation Overlay */}
      {statGains && (
        <StatGainAnimation
          initialStats={characterStats}
          gains={statGains}
          onComplete={handleAnimationComplete}
        />
      )}
    </View>  
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
    paddingTop: spacing['3xl'], // Using a larger spacing for the top padding  
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
  scrollView: {  
    flex: 1,  
    paddingHorizontal: spacing.lg,  
  },  
  foodGrid: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
    justifyContent: 'space-between',  
    marginBottom: spacing.lg,  
  },  
  foodCard: {  
    width: '48%',  
    backgroundColor: colors.theme.surfaceDark, // Using a standard surface color  
    borderRadius: radius.md,  
    padding: spacing.md,  
    alignItems: 'center',  
    marginBottom: spacing.md,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
  },  
  pressedCard: {  
    transform: [{ scale: 0.95 }],  
  },  
  foodIcon: {  
    fontSize: 40,  
    marginBottom: spacing.sm,  
  },  
  foodName: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
    textAlign: 'center',  
    marginBottom: spacing.xs,  
  },  
  foodCalories: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xs.fontSize,  
    color: colors.theme.textLight,  
  },  
  tipsPanel: {  
    backgroundColor: colors.theme.text, // Styled as a standard panel  
    borderRadius: radius.md,  
    padding: spacing.md,  
    marginBottom: spacing.xl,  
    borderWidth: 2,  
    borderColor: colors.theme.surfaceDark,  
  },  
  tipTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.accent['steely-blue'],  
    marginBottom: spacing.sm,  
  },  
  tipText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
    marginVertical: spacing.xs,  
    lineHeight: 14,  
  },  
  backButton: {  
    position: 'absolute',  
    top: spacing.xl + (spacing.lg / 2),  
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
    paddingHorizontal: spacing.lg,  
  },  
});

export default FoodSelectionScreenV2;