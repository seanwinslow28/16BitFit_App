import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCharacter } from '../contexts/CharacterContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharacterPowerUpPreview from '../components/CharacterPowerUpPreview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Main activity categories for MVP
const ACTIVITY_CATEGORIES = [
  {
    id: 'gym',
    name: 'Gym/Strength',
    icon: '💪',
    color: '#FF6B6B',
    description: 'Weight training, resistance exercises',
    statBonus: { strength: 3, stamina: 1, health: 1 },
  },
  {
    id: 'cardio',
    name: 'Running/Cardio',
    icon: '🏃',
    color: '#4ECDC4',
    description: 'Running, cycling, swimming',
    statBonus: { strength: 0.5, stamina: 3, speed: 2 },
  },
  {
    id: 'yoga',
    name: 'Yoga/Flexibility',
    icon: '🧘',
    color: '#95E1D3',
    description: 'Yoga, stretching, pilates',
    statBonus: { health: 3, stamina: 1, speed: 0.5 },
  },
  {
    id: 'sports',
    name: 'Sports/Active Play',
    icon: '⚽',
    color: '#F8B500',
    description: 'Team sports, martial arts, dancing',
    statBonus: { strength: 1, stamina: 2, speed: 2 },
  },
  {
    id: 'walking',
    name: 'Walking/Light',
    icon: '🚶',
    color: '#A8E6CF',
    description: 'Walking, light activities',
    statBonus: { health: 2, stamina: 1, speed: 0.5 },
  },
];

// Duration options in minutes
const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

// Intensity levels
const INTENSITY_LEVELS = [
  { level: 1, name: 'Light', emoji: '😌', multiplier: 0.5 },
  { level: 2, name: 'Moderate', emoji: '😊', multiplier: 1 },
  { level: 3, name: 'Intense', emoji: '😤', multiplier: 1.5 },
  { level: 4, name: 'Beast Mode', emoji: '🔥', multiplier: 2 },
];

const QuickActivityLogScreen = () => {
  const navigation = useNavigation();
  const { addActivity, characterStats } = useCharacter();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(20);
  const [selectedIntensity, setSelectedIntensity] = useState(2);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewStats, setPreviewStats] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const categoryAnims = useRef(
    ACTIVITY_CATEGORIES.map(() => new Animated.Value(0))
  ).current;
  
  // Animate categories on mount
  useEffect(() => {
    Animated.stagger(100, 
      categoryAnims.map((anim) => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  
  // Update preview stats when selections change
  useEffect(() => {
    if (selectedCategory) {
      const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
      const intensity = INTENSITY_LEVELS.find(i => i.level === selectedIntensity);
      
      if (category && intensity) {
        const statGains = calculateStatGains(category, selectedDuration, intensity);
        setPreviewStats(statGains);
        
        // Haptic feedback for stat changes
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Pulse animation for preview
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [selectedCategory, selectedDuration, selectedIntensity]);
  
  const calculateStatGains = (category, duration, intensity) => {
    const baseGains = {};
    Object.entries(category.statBonus).forEach(([stat, value]) => {
      // Calculate gains: base value * duration factor * intensity multiplier
      const durationFactor = Math.sqrt(duration / 30); // Square root for diminishing returns
      baseGains[stat] = Math.round(value * durationFactor * intensity.multiplier * 2);
    });
    
    // Add experience based on duration and intensity
    baseGains.experience = Math.round(duration * intensity.multiplier * 5);
    
    return baseGains;
  };
  
  const handleCategorySelect = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    
    // Animate selection
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };
  
  const handleDurationSelect = (duration) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  };
  
  const handleIntensitySelect = (level) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIntensity(level);
  };
  
  const handleLogActivity = () => {
    if (!selectedCategory) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
    const intensity = INTENSITY_LEVELS.find(i => i.level === selectedIntensity);
    
    // Log activity
    addActivity({
      category: selectedCategory,
      name: category.name,
      duration: selectedDuration,
      intensity: selectedIntensity,
      timestamp: new Date().toISOString(),
    });
    
    // Show success animation
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate back after showing success
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };
  
  const renderStatPreview = () => {
    if (!previewStats) return null;
    
    return (
      <View style={styles.previewContainer}>
        <CharacterPowerUpPreview 
          stats={previewStats}
          isVisible={!!selectedCategory}
          intensity={selectedIntensity}
        />
        <Animated.View 
          style={[
            styles.statPreview,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <Text style={styles.previewTitle}>Your Power-Up:</Text>
          <View style={styles.statGrid}>
            {Object.entries(previewStats).map(([stat, value]) => (
              <View key={stat} style={styles.statItem}>
                <Text style={styles.statValue}>+{value}</Text>
                <Text style={styles.statLabel}>{stat.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };
  
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.successContainer,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) }
              ],
            }
          ]}
        >
          <Text style={styles.successIcon}>🎮</Text>
          <Text style={styles.successText}>ACTIVITY LOGGED!</Text>
          <Text style={styles.successSubtext}>Your character is growing stronger!</Text>
          <View style={styles.finalStats}>
            {Object.entries(previewStats).map(([stat, value]) => (
              <Text key={stat} style={styles.finalStatText}>
                +{value} {stat.toUpperCase()}
              </Text>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>QUICK LOG</Text>
          <Text style={styles.subtitle}>Log your activity in 30 seconds!</Text>
          <Pressable 
            style={styles.detailedLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('WorkoutSelection');
            }}
          >
            <Text style={styles.detailedLinkText}>Want more options? →</Text>
          </Pressable>
        </View>
        
        {/* Activity Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What did you do?</Text>
          <View style={styles.categoryGrid}>
            {ACTIVITY_CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.id}
                style={{
                  transform: [
                    { scale: categoryAnims[index] },
                    { translateY: categoryAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })}
                  ],
                }}
              >
                <Pressable
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.color },
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
        
        {selectedCategory && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })}
              ],
            }}
          >
            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How long?</Text>
              <View style={styles.durationGrid}>
                {DURATION_OPTIONS.map((duration) => (
                  <Pressable
                    key={duration}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration && styles.selectedDuration,
                    ]}
                    onPress={() => handleDurationSelect(duration)}
                  >
                    <Text style={[
                      styles.durationText,
                      selectedDuration === duration && styles.selectedDurationText,
                    ]}>
                      {duration}
                    </Text>
                    <Text style={[
                      styles.durationLabel,
                      selectedDuration === duration && styles.selectedDurationText,
                    ]}>
                      MIN
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Intensity Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How intense?</Text>
              <View style={styles.intensityGrid}>
                {INTENSITY_LEVELS.map((intensity) => (
                  <Pressable
                    key={intensity.level}
                    style={[
                      styles.intensityButton,
                      selectedIntensity === intensity.level && styles.selectedIntensity,
                    ]}
                    onPress={() => handleIntensitySelect(intensity.level)}
                  >
                    <Text style={styles.intensityEmoji}>{intensity.emoji}</Text>
                    <Text style={[
                      styles.intensityText,
                      selectedIntensity === intensity.level && styles.selectedIntensityText,
                    ]}>
                      {intensity.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Stat Preview */}
            {renderStatPreview()}
            
            {/* Log Button */}
            <Pressable
              style={styles.logButton}
              onPress={handleLogActivity}
            >
              <Text style={styles.logButtonText}>LOG ACTIVITY 🎮</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.8,
  },
  detailedLink: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  detailedLinkText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 15,
  },
  categoryGrid: {
    gap: 15,
  },
  categoryCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#0F380F',
    transform: [{ scale: 0.98 }],
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    opacity: 0.9,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationButton: {
    backgroundColor: '#0F380F',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDuration: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 0.95 }],
  },
  durationText: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
  },
  durationLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginTop: 5,
  },
  selectedDurationText: {
    color: '#0F380F',
  },
  intensityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: '#0F380F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedIntensity: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 0.95 }],
  },
  intensityEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  intensityText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
  },
  selectedIntensityText: {
    color: '#0F380F',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statPreview: {
    backgroundColor: '#0F380F',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    width: '90%',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
  },
  statLabel: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginTop: 5,
  },
  logButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.8,
    marginBottom: 30,
    textAlign: 'center',
  },
  finalStats: {
    gap: 10,
  },
  finalStatText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    textAlign: 'center',
  },
});

export default QuickActivityLogScreen;