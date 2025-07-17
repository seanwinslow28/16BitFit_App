/**
 * Step Goal Tracker Component - Health Kit Integration
 * Shows daily step progress, goals, and automatic stat bonuses
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

const StepGoalTracker = ({
  stepProgress = null,
  onStepGoalChange = () => {},
  onToggleAutoBonuses = () => {},
  autoBonusesEnabled = true,
  fontFamily = 'monospace',
}) => {
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [tempGoal, setTempGoal] = useState(10000);
  
  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (stepProgress) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: stepProgress.percentage / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Pulse animation for goal achievement
      if (stepProgress.achieved) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [stepProgress]);

  const handleGoalSave = () => {
    onStepGoalChange(tempGoal);
    setShowGoalEditor(false);
  };

  if (!stepProgress) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { fontFamily }]}>
          Loading step data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily }]}>
          🚶 DAILY STEPS
        </Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            setTempGoal(stepProgress.goalSteps);
            setShowGoalEditor(!showGoalEditor);
          }}
        >
          <Text style={[styles.settingsText, { fontFamily }]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Circle or Bar */}
      <Animated.View style={[styles.progressContainer, { transform: [{ scale: pulseAnim }] }]}>
        {/* Steps Counter */}
        <View style={styles.stepsDisplay}>
          <Text style={[styles.currentSteps, { fontFamily }]}>
            {stepProgress.currentSteps.toLocaleString()}
          </Text>
          <Text style={[styles.goalSteps, { fontFamily }]}>
            / {stepProgress.goalSteps.toLocaleString()}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: stepProgress.achieved 
                    ? Colors.primary.success 
                    : stepProgress.percentage >= 80 
                      ? Colors.primary.logoYellow 
                      : Colors.state.energy,
                },
              ]}
            />
          </View>
          
          {/* Percentage Text */}
          <Text style={[styles.percentageText, { fontFamily }]}>
            {stepProgress.percentage}%
          </Text>
        </View>

        {/* Achievement Status */}
        <View style={styles.statusContainer}>
          {stepProgress.achieved ? (
            <View style={styles.achievedContainer}>
              <Text style={[styles.achievedText, { fontFamily }]}>
                🎉 GOAL ACHIEVED! 🎉
              </Text>
              <Text style={[styles.bonusText, { fontFamily }]}>
                Stat bonuses earned!
              </Text>
            </View>
          ) : (
            <View style={styles.remainingContainer}>
              <Text style={[styles.remainingText, { fontFamily }]}>
                {stepProgress.remaining.toLocaleString()} steps to go
              </Text>
              <Text style={[styles.motivationText, { fontFamily }]}>
                {stepProgress.progressMessage}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Goal Editor */}
      {showGoalEditor && (
        <View style={styles.goalEditor}>
          <Text style={[styles.editorTitle, { fontFamily }]}>
            Set Daily Step Goal
          </Text>
          
          <View style={styles.goalButtons}>
            {[5000, 8000, 10000, 12000, 15000, 20000].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalButton,
                  tempGoal === goal && styles.goalButtonSelected,
                ]}
                onPress={() => setTempGoal(goal)}
              >
                <Text style={[
                  styles.goalButtonText, 
                  { fontFamily },
                  tempGoal === goal && styles.goalButtonTextSelected,
                ]}>
                  {goal.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.editorActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowGoalEditor(false)}
            >
              <Text style={[styles.cancelButtonText, { fontFamily }]}>
                CANCEL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleGoalSave}
            >
              <Text style={[styles.saveButtonText, { fontFamily }]}>
                SAVE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Auto Bonuses Toggle */}
      <View style={styles.settingsPanel}>
        <TouchableOpacity 
          style={styles.toggleContainer}
          onPress={onToggleAutoBonuses}
        >
          <Text style={[styles.toggleLabel, { fontFamily }]}>
            Auto Stat Bonuses
          </Text>
          <View style={[
            styles.toggleSwitch, 
            autoBonusesEnabled && styles.toggleSwitchActive
          ]}>
            <Text style={[styles.toggleText, { fontFamily }]}>
              {autoBonusesEnabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.toggleDescription, { fontFamily }]}>
          Automatically earn stat bonuses from real step data
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.environment.groundDark,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 8,
    padding: Spacing.lg,
    margin: Spacing.md,
    ...Effects.cardShadow,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    fontSize: 16,
  },

  settingsButton: {
    padding: Spacing.xs,
  },

  settingsText: {
    fontSize: 16,
  },

  progressContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  stepsDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },

  currentSteps: {
    ...Typography.titleLarge,
    color: Colors.primary.success,
    fontSize: 28,
  },

  goalSteps: {
    ...Typography.titleMedium,
    color: Colors.primary.black,
    fontSize: 16,
    marginLeft: Spacing.xs,
  },

  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.environment.nightPurple,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary.black,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },

  percentageText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    marginTop: Spacing.xs,
    fontSize: 12,
  },

  statusContainer: {
    alignItems: 'center',
    minHeight: 50,
  },

  achievedContainer: {
    alignItems: 'center',
  },

  achievedText: {
    ...Typography.titleMedium,
    color: Colors.primary.success,
    textAlign: 'center',
    fontSize: 14,
  },

  bonusText: {
    ...Typography.labelSmall,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    fontSize: 11,
    marginTop: Spacing.xs,
  },

  remainingContainer: {
    alignItems: 'center',
  },

  remainingText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    textAlign: 'center',
    fontSize: 12,
  },

  motivationText: {
    ...Typography.microCopy,
    color: Colors.state.energy,
    textAlign: 'center',
    fontSize: 10,
    marginTop: Spacing.xs,
  },

  loadingText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    textAlign: 'center',
  },

  goalEditor: {
    backgroundColor: Colors.primary.black,
    borderWidth: 2,
    borderColor: Colors.primary.logoYellow,
    borderRadius: 8,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  editorTitle: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 14,
  },

  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  goalButton: {
    backgroundColor: Colors.environment.groundDark,
    borderWidth: 1,
    borderColor: Colors.primary.black,
    borderRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  goalButtonSelected: {
    backgroundColor: Colors.primary.success,
    borderColor: Colors.primary.logoYellow,
  },

  goalButtonText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 11,
  },

  goalButtonTextSelected: {
    color: Colors.primary.black,
    fontWeight: 'bold',
  },

  editorActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  cancelButton: {
    backgroundColor: Colors.state.health,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  saveButton: {
    backgroundColor: Colors.primary.success,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  cancelButtonText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 11,
  },

  saveButtonText: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 11,
    fontWeight: 'bold',
  },

  settingsPanel: {
    backgroundColor: Colors.environment.nightPurple,
    borderWidth: 1,
    borderColor: Colors.primary.black,
    borderRadius: 4,
    padding: Spacing.md,
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  toggleLabel: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 12,
  },

  toggleSwitch: {
    backgroundColor: Colors.state.health,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 50,
  },

  toggleSwitchActive: {
    backgroundColor: Colors.primary.success,
  },

  toggleText: {
    ...Typography.microCopy,
    color: Colors.primary.black,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },

  toggleDescription: {
    ...Typography.microCopy,
    color: Colors.environment.groundDark,
    fontSize: 9,
    textAlign: 'center',
  },
});

export default StepGoalTracker;