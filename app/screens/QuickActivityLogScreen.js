import React, { useState, useRef, useEffect } from 'react';  
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
import { SafeAreaView } from 'react-native-safe-area-context';  
import designTokens from '../constants/designTokens'; // Import our design system
import PixelButton from '../components/PixelButton';

// DATA and LOGIC (unchanged)  
const ACTIVITY_CATEGORIES = [  
  { id: 'gym', name: 'Gym/Strength', icon: '💪', color: '#FF6B6B', statBonus: { strength: 3, stamina: 1, health: 1 }},  
  { id: 'cardio', name: 'Running/Cardio', icon: '🏃', color: '#4ECDC4', statBonus: { strength: 0.5, stamina: 3, speed: 2 }},  
  { id: 'yoga', name: 'Yoga/Flexibility', icon: '🧘', color: '#95E1D3', statBonus: { health: 3, stamina: 1, speed: 0.5 }},  
  { id: 'sports', name: 'Sports/Active Play', icon: '⚽', color: '#F8B500', statBonus: { strength: 1, stamina: 2, speed: 2 }},  
  { id: 'walking', name: 'Walking/Light', icon: '🚶', color: '#A8E6CF', statBonus: { health: 2, stamina: 1, speed: 0.5 }},  
];  
const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];  
const INTENSITY_LEVELS = [  
  { level: 1, name: 'Light', emoji: '😌', multiplier: 0.5 },  
  { level: 2, name: 'Moderate', emoji: '😊', multiplier: 1 },  
  { level: 3, name: 'Intense', emoji: '😤', multiplier: 1.5 },  
  { level: 4, name: 'Beast Mode', emoji: '🔥', multiplier: 2 },  
];

const QuickActivityLogScreen = () => {  
  const navigation = useNavigation();  
  const { addActivity } = useCharacter();  
    
  const [selectedCategory, setSelectedCategory] = useState(null);  
  const [selectedDuration, setSelectedDuration] = useState(20);  
  const [selectedIntensity, setSelectedIntensity] = useState(2);  
  const [showSuccess, setShowSuccess] = useState(false);  
  const [previewStats, setPreviewStats] = useState(null);  
    
  const fadeAnim = useRef(new Animated.Value(0)).current;  
  const scaleAnim = useRef(new Animated.Value(0)).current;  
  const categoryAnims = useRef(ACTIVITY_CATEGORIES.map(() => new Animated.Value(0))).current;  
    
  // All logic hooks and functions (useEffect, calculateStatGains, handleLogActivity) remain unchanged.  
  // ...  
  useEffect(() => {  
    Animated.stagger(100,   
      categoryAnims.map((anim) =>   
        Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })  
      )  
    ).start();  
  }, []);

  useEffect(() => {  
    if (selectedCategory) {  
      const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);  
      const intensity = INTENSITY_LEVELS.find(i => i.level === selectedIntensity);  
      if (category && intensity) {  
        setPreviewStats(calculateStatGains(category, selectedDuration, intensity));  
      }  
    }  
  }, [selectedCategory, selectedDuration, selectedIntensity]);  
    
  const calculateStatGains = (category, duration, intensity) => {  
    const baseGains = {};  
    Object.entries(category.statBonus).forEach(([stat, value]) => {  
      const durationFactor = Math.sqrt(duration / 30);  
      baseGains[stat] = Math.round(value * durationFactor * intensity.multiplier * 2);  
    });  
    baseGains.experience = Math.round(duration * intensity.multiplier * 5);  
    return baseGains;  
  };  
    
    const handleCategorySelect = (categoryId) => {  
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);  
    setSelectedCategory(categoryId);  
    Animated.spring(fadeAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();  
  };

  const handleLogActivity = () => {  
      if (!selectedCategory) return;  
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);  
      const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);  
      addActivity({  
          category: selectedCategory,  
          name: category.name,  
          duration: selectedDuration,  
          intensity: selectedIntensity,  
          timestamp: new Date().toISOString(),  
      });  
      setShowSuccess(true);  
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();  
      setTimeout(() => navigation.goBack(), 2000);  
  };  
  // ...

  if (showSuccess) {  
    // This view is already well-styled.  
    return (  
      <View style={styles.container}>  
        <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}>  
          <Text style={styles.successIcon}>🎮</Text>  
          <Text style={styles.successText}>ACTIVITY LOGGED!</Text>  
        </Animated.View>  
      </View>  
    );  
  }  
    
  return (  
    <SafeAreaView style={styles.container}>  
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>  
        <View style={styles.header}>  
          <Text style={styles.title}>QUICK LOG</Text>  
          <Pressable onPress={() => navigation.navigate('WorkoutSelection')}>  
            <Text style={styles.detailedLinkText}>More Options →</Text>  
          </Pressable>  
        </View>  
          
        <View style={styles.section}>  
          <Text style={styles.sectionTitle}>1. What did you do?</Text>  
          <View style={styles.categoryGrid}>  
            {ACTIVITY_CATEGORIES.map((category, index) => (  
              <Animated.View key={category.id} style={{ transform: [{ scale: categoryAnims[index] }] }}>  
                <Pressable  
                  style={[ styles.categoryCard, { backgroundColor: category.color }, selectedCategory === category.id && styles.selectedCard ]}  
                  onPress={() => handleCategorySelect(category.id)}>  
                  <Text style={styles.categoryIcon}>{category.icon}</Text>  
                  <Text style={styles.categoryName}>{category.name}</Text>  
                </Pressable>  
              </Animated.View>  
            ))}  
          </View>  
        </View>  
          
        {selectedCategory && (  
          <Animated.View style={{ opacity: fadeAnim }}>  
            <View style={styles.section}>  
              <Text style={styles.sectionTitle}>2. How long?</Text>  
              <View style={styles.optionsGrid}>  
                {DURATION_OPTIONS.map((duration) => (  
                  <Pressable key={duration} style={[ styles.optionButton, selectedDuration === duration && styles.selectedOptionButton ]} onPress={() => setSelectedDuration(duration)}>  
                    <Text style={[ styles.optionButtonText, selectedDuration === duration && styles.selectedOptionText ]}>{duration} MIN</Text>  
                  </Pressable>  
                ))}  
              </View>  
            </View>  
              
            <View style={styles.section}>  
              <Text style={styles.sectionTitle}>3. How intense?</Text>  
              <View style={styles.optionsGrid}>  
                {INTENSITY_LEVELS.map((intensity) => (  
                  <Pressable key={intensity.level} style={[ styles.optionButton, selectedIntensity === intensity.level && styles.selectedOptionButton ]} onPress={() => setSelectedIntensity(intensity.level)}>  
                    <Text style={[ styles.optionButtonText, selectedIntensity === intensity.level && styles.selectedOptionText ]}>{intensity.name} {intensity.emoji}</Text>  
                  </Pressable>  
                ))}  
              </View>  
            </View>

            {previewStats &&  
              <View style={styles.previewPanel}>  
                  <Text style={styles.previewTitle}>STAT PREVIEW</Text>  
                  <View style={styles.statGrid}>  
                      {Object.entries(previewStats).map(([stat, value]) => (  
                          <View key={stat} style={styles.statItem}>  
                              <Text style={styles.statValue}>+{value}</Text>  
                              <Text style={styles.statLabel}>{stat.toUpperCase()}</Text>  
                          </View>  
                      ))}  
                  </View>  
              </View>  
            }  
              
            <PixelButton onPress={handleLogActivity}>
              LOG ACTIVITY
            </PixelButton>  
          </Animated.View>  
        )}  
      </ScrollView>  
    </SafeAreaView>  
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
  },  
  scrollContent: {  
    paddingBottom: spacing['3xl'],  
  },  
  header: {  
    padding: spacing.lg,  
    alignItems: 'center',  
  },  
  title: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xl.fontSize,  
    color: colors.theme.text,  
    marginBottom: spacing.sm,  
  },  
  detailedLinkText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.textLight,  
    textDecorationLine: 'underline',  
  },  
  section: {  
    marginBottom: spacing.xl,  
    paddingHorizontal: spacing.lg,  
  },  
  sectionTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.text,  
    marginBottom: spacing.md,  
  },  
  categoryGrid: {  
    gap: spacing.md,  
  },  
  categoryCard: {  
    padding: spacing.md,  
    borderRadius: radius.md,  
    borderWidth: 2,  
    borderColor: 'transparent',  
    alignItems: 'center',  
  },  
  selectedCard: {  
    borderColor: colors.theme.text,  
    transform: [{ scale: 1.05 }],  
  },  
  categoryIcon: {  
    fontSize: 32,  
    marginBottom: spacing.sm,  
  },  
  categoryName: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.button.black,  
  },  
  optionsGrid: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
    gap: spacing.sm,  
  },  
  optionButton: {  
    backgroundColor: colors.theme.surfaceDark,  
    padding: spacing.sm,  
    borderRadius: radius.sm,  
    borderWidth: 1,  
    borderColor: colors.theme.text,  
  },  
  selectedOptionButton: {  
    backgroundColor: colors.accent['steely-blue'],  
    borderColor: colors.shell.light,  
  },  
  optionButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
  },  
  selectedOptionText: {  
    color: colors.shell.light,  
  },  
  previewPanel: {  
      backgroundColor: colors.theme.text,  
      padding: spacing.md,  
      marginHorizontal: spacing.lg,  
      marginTop: spacing.xl,  
      borderRadius: radius.md,  
  },  
  previewTitle: {  
      fontFamily: typography.fonts.pixel,  
      fontSize: typography.styles.base.fontSize,  
      color: colors.accent['steely-blue'],  
      textAlign: 'center',  
      marginBottom: spacing.md,  
  },  
  statGrid: {  
    flexDirection: 'row',  
    justifyContent: 'space-around',  
  },  
  statItem: {  
    alignItems: 'center',  
  },  
  statValue: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.primary,  
  },  
  statLabel: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xs.fontSize,  
    color: colors.theme.primary,  
    marginTop: spacing.xs,  
  },  
  logButton: {  
    backgroundColor: colors.accent['steely-blue'],  
    paddingVertical: spacing.md,  
    margin: spacing.lg,  
    borderRadius: radius.md,  
    alignItems: 'center',  
  },  
  logButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.shell.light,  
  },  
  successContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  successIcon: {  
    fontSize: 80,  
  },  
  successText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xl.fontSize,  
    color: colors.theme.text,  
    textAlign: 'center',  
    marginTop: spacing.lg,  
  },  
});

export default QuickActivityLogScreen;