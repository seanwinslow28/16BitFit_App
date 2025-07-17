/**
 * Workout Logger Component
 * Activity tracking interface with visual feedback
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
import WorkoutDatabase from './WorkoutDatabase';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Cancel button
  blue: '#3498db',         // Info color
  orange: '#f39c12',       // Strength
};

const WorkoutLogger = ({
  selectedWorkout,
  duration,
  intensity,
  onLog,
  onCancel,
  style,
}) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
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

  const getIntensityColor = () => {
    switch (intensity) {
      case 'light': return COLORS.blue;
      case 'medium': return COLORS.primary;
      case 'high': return COLORS.red;
      default: return COLORS.primary;
    }
  };

  const getIntensityEmoji = () => {
    switch (intensity) {
      case 'light': return '😌';
      case 'medium': return '😤';
      case 'high': return '🔥';
      default: return '💪';
    }
  };

  // Calculate workout stats
  const workoutStats = WorkoutDatabase.calculateWorkoutStats(
    selectedWorkout,
    duration,
    intensity
  );

  const calculateTotalStats = () => {
    const stats = workoutStats.statEffects;
    const totalEffect = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const isPositive = totalEffect > 0;
    
    return {
      total: totalEffect,
      isPositive,
      color: isPositive ? COLORS.primary : COLORS.red,
      message: isPositive ? 'GREAT WORKOUT!' : 'RECOVERY SESSION',
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
          <Text style={styles.workoutEmoji}>{selectedWorkout.icon}</Text>
          <Text style={[styles.headerTitle, pixelFont]}>
            LOG WORKOUT
          </Text>
        </View>

        {/* Workout Preview */}
        <View style={styles.workoutPreview}>
          <Text style={[styles.workoutName, pixelFont]}>{selectedWorkout.name}</Text>
          
          <View style={styles.workoutDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, pixelFont]}>DURATION</Text>
              <Text style={[styles.detailValue, pixelFont]}>{duration} MIN</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, pixelFont]}>INTENSITY</Text>
              <View style={styles.intensityDisplay}>
                <Text style={styles.intensityEmoji}>{getIntensityEmoji()}</Text>
                <Text style={[
                  styles.detailValue, 
                  pixelFont,
                  { color: getIntensityColor() }
                ]}>
                  {intensity.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, pixelFont]}>CALORIES</Text>
              <Text style={[styles.detailValue, pixelFont, { color: COLORS.yellow }]}>
                {workoutStats.calories}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressLabel, pixelFont]}>WORKOUT IMPACT</Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getIntensityColor(),
                },
              ]}
            />
          </View>
        </View>

        {/* Stat Effects */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, pixelFont]}>CHARACTER EFFECTS</Text>
          <View style={styles.statsList}>
            {Object.entries(workoutStats.statEffects).map(([stat, value]) => {
              if (value === 0) return null;
              return (
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
              );
            })}
          </View>
          
          {/* Total Effect */}
          <View style={[styles.totalEffect, { borderColor: totalStats.color }]}>
            <Text style={[styles.totalMessage, pixelFont, { color: totalStats.color }]}>
              {totalStats.message}
            </Text>
            <Text style={[styles.totalValue, pixelFont, { color: totalStats.color }]}>
              +{workoutStats.xp} XP
            </Text>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationContainer}>
          <Text style={[styles.motivationText, pixelFont]}>
            {getMotivationalMessage(intensity, duration)}
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
              COMPLETE ✓
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

// Helper function for motivational messages
function getMotivationalMessage(intensity, duration) {
  if (intensity === 'high' && duration >= 45) {
    return "💪 BEAST MODE ACTIVATED! You're crushing it!";
  } else if (intensity === 'high') {
    return "🔥 HIGH INTENSITY! Your character is getting stronger!";
  } else if (duration >= 60) {
    return "⏱️ ENDURANCE CHAMPION! That's dedication!";
  } else if (intensity === 'light') {
    return "😌 Recovery is important too. Good choice!";
  } else {
    return "💯 Great workout! Keep up the consistency!";
  }
}

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

  workoutEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  workoutPreview: {
    padding: 20,
  },

  workoutName: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },

  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  detailItem: {
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  intensityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  intensityEmoji: {
    fontSize: 16,
  },

  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  progressLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  progressBar: {
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  statsContainer: {
    marginHorizontal: 20,
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

  motivationContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  motivationText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 16,
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

export default WorkoutLogger;