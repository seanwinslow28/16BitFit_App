/**
 * Meal Logger Component
 * Quick meal entry with visual effects and confirmation
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Cancel button
  blue: '#3498db',         // Info color
};

const MealLogger = ({
  selectedFood,
  mealTime,
  onLog,
  onCancel,
  style,
}) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLog = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Exit animation before logging
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onLog();
    });
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Exit animation before canceling
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCancel();
    });
  };

  const getMealTimeEmoji = () => {
    switch (mealTime) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snacks': return '🍿';
      default: return '🍽️';
    }
  };

  const calculateTotalStats = () => {
    if (!selectedFood) return null;
    
    const stats = selectedFood.statEffects;
    const totalEffect = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const isPositive = totalEffect > 0;
    
    return {
      total: totalEffect,
      isPositive,
      color: isPositive ? COLORS.primary : COLORS.red,
      message: isPositive ? 'GOOD CHOICE!' : 'TREAT YOURSELF!',
    };
  };

  const totalStats = calculateTotalStats();

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleCancel}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Logger Modal */}
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mealTimeEmoji}>{getMealTimeEmoji()}</Text>
          <Text style={[styles.headerTitle, pixelFont]}>
            LOG {mealTime.toUpperCase()}
          </Text>
        </View>

        {/* Food Preview */}
        <View style={styles.foodPreview}>
          <Text style={styles.foodIcon}>{selectedFood.icon}</Text>
          <View style={styles.foodDetails}>
            <Text style={[styles.foodName, pixelFont]}>{selectedFood.name}</Text>
            <View style={styles.nutritionRow}>
              <Text style={[styles.nutritionItem, pixelFont]}>
                {selectedFood.calories} CAL
              </Text>
              {selectedFood.protein > 0 && (
                <Text style={[styles.nutritionItem, pixelFont]}>
                  {selectedFood.protein}g PROTEIN
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Stat Effects */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, pixelFont]}>CHARACTER EFFECTS</Text>
          <View style={styles.statsList}>
            {Object.entries(selectedFood.statEffects).map(([stat, value]) => (
              <View key={stat} style={styles.statItem}>
                <Text style={[styles.statName, pixelFont]}>
                  {stat.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    pixelFont,
                    { color: value > 0 ? COLORS.primary : COLORS.red }
                  ]}
                >
                  {value > 0 ? '+' : ''}{value}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Total Effect */}
          <View style={[styles.totalEffect, { borderColor: totalStats.color }]}>
            <Text style={[styles.totalMessage, pixelFont, { color: totalStats.color }]}>
              {totalStats.message}
            </Text>
            <Text style={[styles.totalValue, pixelFont, { color: totalStats.color }]}>
              TOTAL: {totalStats.total > 0 ? '+' : ''}{totalStats.total}
            </Text>
          </View>
        </View>

        {/* Health Badge */}
        <View style={[
          styles.healthBadge,
          { backgroundColor: selectedFood.isHealthy ? COLORS.primary : COLORS.red }
        ]}>
          <Text style={[styles.healthBadgeText, pixelFont]}>
            {selectedFood.isHealthy ? '✓ HEALTHY CHOICE' : '⚠ JUNK FOOD'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, pixelFont]}>CANCEL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.logButton]}
            onPress={handleLog}
          >
            <Text style={[styles.buttonText, styles.logButtonText, pixelFont]}>
              LOG MEAL
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderBottomWidth: 0,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
  },

  mealTimeEmoji: {
    fontSize: 24,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  foodPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  foodIcon: {
    fontSize: 48,
    marginRight: 16,
  },

  foodDetails: {
    flex: 1,
  },

  foodName: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  nutritionRow: {
    flexDirection: 'row',
    gap: 16,
  },

  nutritionItem: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  statsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },

  statsTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  statsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    marginBottom: 8,
  },

  statName: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 12,
    letterSpacing: 1,
  },

  totalEffect: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  totalMessage: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },

  totalValue: {
    fontSize: 14,
    letterSpacing: 1,
  },

  healthBadge: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },

  healthBadgeText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.red,
  },

  logButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  buttonText: {
    fontSize: 14,
    color: COLORS.red,
    letterSpacing: 1,
  },

  logButtonText: {
    color: COLORS.dark,
  },
});

export default MealLogger;