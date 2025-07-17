/**
 * Tutorial Replay Button Component
 * Allows users to replay the onboarding tutorial
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { pixelFont } from '../hooks/useFonts';
import EnhancedOnboardingManager from '../services/EnhancedOnboardingManager';
import SoundFXManager from '../services/SoundFXManager';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
};

const TutorialReplayButton = ({ 
  onStartReplay = () => {},
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReplayPress = async () => {
    await SoundFXManager.playButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const canReplay = await EnhancedOnboardingManager.canReplayTutorial();
    
    if (!canReplay) {
      Alert.alert(
        'Tutorial Limit Reached',
        'You\'ve reached the maximum number of tutorial replays. Check the help section for more guidance!',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Replay Tutorial?',
      'This will restart the onboarding tutorial from the beginning. Your progress and data will not be affected.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Replay',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await EnhancedOnboardingManager.replayTutorial();
              if (success) {
                await SoundFXManager.playSuccess();
                onStartReplay();
              }
            } catch (error) {
              console.error('Failed to replay tutorial:', error);
              Alert.alert('Error', 'Failed to start tutorial. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleReplayPress}
      disabled={isLoading}
    >
      <Text style={[styles.icon, pixelFont]}>🎮</Text>
      <Text style={[styles.text, pixelFont]}>
        {isLoading ? 'LOADING...' : 'REPLAY TUTORIAL'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },

  icon: {
    fontSize: 16,
  },

  text: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default TutorialReplayButton;