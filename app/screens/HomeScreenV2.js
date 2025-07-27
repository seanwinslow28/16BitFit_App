import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSupabase } from '../services/SupabaseService';
import { useCharacter } from '../contexts/CharacterContext';
import PostHogService from '../services/PostHogService';

// Import refactored components
import { 
  CharacterDisplay, 
  StatsDisplay, 
  ActionButton, 
  CharacterMessage,
  GameBoyFrame 
} from '../components/home';

// Removed dimensions - now handled by GameBoyFrame component

const HomeScreenV2 = () => {
  const navigation = useNavigation();
  const { user } = useSupabase();
  const { characterStats } = useCharacter();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    // Track screen view
    PostHogService.trackScreen('Home', {
      user_id: user?.id,
      character_level: characterStats?.level,
      character_experience: characterStats?.experience,
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, user?.id, characterStats?.level, characterStats?.experience]);

  const handleActionPress = useCallback((action) => {
    // Track user action
    PostHogService.trackEvent('home_action_pressed', {
      action: action,
      user_id: user?.id,
      character_level: characterStats?.level,
      timestamp: new Date().toISOString(),
    });

    switch (action) {
      case 'battle':
        navigation.navigate('BattleTab');
        break;
      case 'train':
        navigation.navigate('WorkoutSelection');
        break;
      case 'feed':
        navigation.navigate('FoodSelection');
        break;
      case 'stats':
        navigation.navigate('Main', { screen: 'StatsTab' });
        break;
      case 'history':
        navigation.navigate('WorkoutHistory');
        break;
      default:
        break;
    }
  }, [navigation, user?.id, characterStats?.level]);

  const toggleAdvanced = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAdvanced(prev => !prev);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <GameBoyFrame>
        {/* Character display area */}
        <View style={styles.characterArea}>
          <CharacterDisplay characterStats={characterStats} />
          <StatsDisplay characterStats={characterStats} />
          <CharacterMessage characterStats={characterStats} />
        </View>
        
        {/* Primary action buttons */}
        <View style={styles.primaryActions}>
          <ActionButton
            icon="⚔️"
            label="BATTLE"
            onPress={() => handleActionPress('battle')}
            color="#FF6B6B"
            size="large"
          />
          <ActionButton
            icon="💪"
            label="TRAIN"
            onPress={() => handleActionPress('train')}
            color="#4ECDC4"
            size="large"
          />
        </View>
        
        {/* Progressive disclosure - show more options */}
        {!showAdvanced && (
          <Pressable
            style={styles.showMoreButton}
            onPress={toggleAdvanced}
          >
            <Text style={styles.showMoreText}>▼ MORE ▼</Text>
          </Pressable>
        )}
        
        {/* Advanced options */}
        {showAdvanced && (
          <Animated.View style={styles.advancedActions}>
            <ActionButton
              icon="🍎"
              label="FEED"
              onPress={() => handleActionPress('feed')}
              color="#95E1D3"
              size="medium"
            />
            <ActionButton
              icon="📊"
              label="STATS"
              onPress={() => handleActionPress('stats')}
              color="#F3A952"
              size="medium"
            />
            <ActionButton
              icon="📝"
              label="HISTORY"
              onPress={() => handleActionPress('history')}
              color="#FFE66D"
              size="medium"
            />
          </Animated.View>
        )}
      </GameBoyFrame>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B956D', // GameBoy green background
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  showMoreText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  advancedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default HomeScreenV2;