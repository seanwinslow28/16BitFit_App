/**
 * Manual Activity Logging Screen
 * Allows users to log activities not captured automatically
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
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HealthTrackingManager from '../services/HealthTrackingManager';

const ACTIVITY_TYPES = [
  { id: 'strength_training', name: 'Strength Training', icon: '💪', color: '#FF6B6B' },
  { id: 'running', name: 'Running', icon: '🏃', color: '#4ECDC4' },
  { id: 'cycling', name: 'Cycling', icon: '🚴', color: '#45B7D1' },
  { id: 'swimming', name: 'Swimming', icon: '🏊', color: '#3498DB' },
  { id: 'yoga', name: 'Yoga', icon: '🧘', color: '#9B59B6' },
  { id: 'hiit', name: 'HIIT', icon: '🔥', color: '#E74C3C' },
  { id: 'walking', name: 'Walking', icon: '🚶', color: '#2ECC71' },
  { id: 'martial_arts', name: 'Martial Arts', icon: '🥋', color: '#F39C12' },
  { id: 'other', name: 'Other', icon: '➕', color: '#95A5A6' }
];

const INTENSITY_LEVELS = [
  { id: 'low', name: 'Low', multiplier: 0.7, color: '#2ECC71' },
  { id: 'medium', name: 'Medium', multiplier: 1.0, color: '#F39C12' },
  { id: 'high', name: 'High', multiplier: 1.3, color: '#E74C3C' },
  { id: 'extreme', name: 'Extreme', multiplier: 1.6, color: '#8B0000' }
];

export default function ManualActivityScreen({ navigation }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('medium');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statPreview, setStatPreview] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    if (selectedActivity && duration) {
      updateStatPreview();
    }
  }, [selectedActivity, duration, intensity]);

  const updateStatPreview = async () => {
    try {
      const preview = HealthTrackingManager.services.health.getActivityStatPreview(
        selectedActivity,
        parseInt(duration) || 0,
        intensity
      );
      setStatPreview(preview);
    } catch (error) {
      console.error('Failed to get stat preview:', error);
    }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIntensitySelect = (level) => {
    setIntensity(level.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogActivity = async () => {
    if (!selectedActivity || !duration || parseInt(duration) <= 0) {
      Alert.alert('Missing Information', 'Please select an activity and enter duration');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const activityData = {
        type: selectedActivity,
        duration: parseInt(duration),
        intensity,
        calories: parseInt(calories) || null,
        notes,
        timestamp: new Date()
      };

      const result = await HealthTrackingManager.logActivity(activityData);

      // Show success animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Activity Logged!',
        result.message,
        [
          {
            text: 'Log Another',
            onPress: () => resetForm()
          },
          {
            text: 'View Progress',
            onPress: () => navigation.navigate('Progress'),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
      Alert.alert('Error', 'Failed to log activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedActivity(null);
    setDuration('30');
    setIntensity('medium');
    setCalories('');
    setNotes('');
    setStatPreview(null);
  };

  const renderActivityTypes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity Type</Text>
      <View style={styles.activityGrid}>
        {ACTIVITY_TYPES.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              selectedActivity === activity.id && styles.activityCardSelected,
              { borderColor: activity.color }
            ]}
            onPress={() => handleActivitySelect(activity)}
          >
            <Text style={styles.activityIcon}>{activity.icon}</Text>
            <Text style={[
              styles.activityName,
              selectedActivity === activity.id && styles.activityNameSelected
            ]}>
              {activity.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDurationInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Duration (minutes)</Text>
      <View style={styles.durationContainer}>
        <TouchableOpacity
          style={styles.durationButton}
          onPress={() => setDuration(Math.max(5, parseInt(duration) - 5).toString())}
        >
          <Text style={styles.durationButtonText}>-5</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.durationInput}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          maxLength={3}
        />
        
        <TouchableOpacity
          style={styles.durationButton}
          onPress={() => setDuration((parseInt(duration) + 5).toString())}
        >
          <Text style={styles.durationButtonText}>+5</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIntensitySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Intensity</Text>
      <View style={styles.intensityContainer}>
        {INTENSITY_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.intensityButton,
              intensity === level.id && styles.intensityButtonSelected,
              { borderColor: level.color }
            ]}
            onPress={() => handleIntensitySelect(level)}
          >
            <Text style={[
              styles.intensityText,
              intensity === level.id && styles.intensityTextSelected
            ]}>
              {level.name}
            </Text>
            <Text style={styles.intensityMultiplier}>
              {level.multiplier}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatPreview = () => {
    if (!statPreview) return null;

    return (
      <Animated.View style={[styles.statPreview, { opacity: fadeAnim }]}>
        <Text style={styles.statPreviewTitle}>Estimated Stat Gains</Text>
        <View style={styles.statGrid}>
          {Object.entries(statPreview).map(([stat, value]) => (
            <View key={stat} style={styles.statItem}>
              <Text style={styles.statValue}>+{value}</Text>
              <Text style={styles.statName}>{stat.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderOptionalFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Optional Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Calories Burned</Text>
        <TextInput
          style={styles.textInput}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="Leave blank to auto-calculate"
          placeholderTextColor="#666"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="How did it feel? Any PRs?"
          placeholderTextColor="#666"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Log Activity</Text>
          </View>

          {renderActivityTypes()}
          
          {selectedActivity && (
            <>
              {renderDurationInput()}
              {renderIntensitySelector()}
              {renderStatPreview()}
              {renderOptionalFields()}
              
              <TouchableOpacity
                style={[styles.logButton, loading && styles.logButtonDisabled]}
                onPress={handleLogActivity}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#00D4FF', '#0099CC']}
                  style={styles.logButtonGradient}
                >
                  <Text style={styles.logButtonText}>
                    {loading ? 'Logging...' : 'Log Activity'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
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
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFF',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    marginBottom: 15,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityCardSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: '#00D4FF',
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  activityName: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    textAlign: 'center',
  },
  activityNameSelected: {
    color: '#FFF',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 18,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
  },
  durationInput: {
    width: 100,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  intensityButtonSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  intensityText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 5,
  },
  intensityTextSelected: {
    color: '#FFF',
  },
  intensityMultiplier: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
  },
  statPreview: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statPreviewTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    textAlign: 'center',
    marginBottom: 15,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#0F0',
    marginBottom: 5,
  },
  statName: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#999',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  logButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonGradient: {
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
});