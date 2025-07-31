import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCharacter } from '../contexts/CharacterContext';
import { useSupabase } from '../services/SupabaseService';
import PostHogService from '../services/PostHogService';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

// Import our new components
import { StatCard, PixelAvatar, ScreenHeader } from '../components/home';

const HomeScreenV2 = () => {
  const navigation = useNavigation();
  const { user } = useSupabase();
  const { characterStats } = useCharacter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Track screen view
    PostHogService.trackScreen('Home', {
      user_id: user?.id,
      character_level: characterStats?.level,
      character_experience: characterStats?.experience,
    });

    // Fade in animation - already optimized with useNativeDriver
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, user?.id, characterStats?.level, characterStats?.experience]);
    
  const handleActionPress = (action) => {
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
        navigation.navigate('QuickActivityLog');
        break;
      case 'stats':
        navigation.navigate('StatsTab');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Screen Header */}
        <ScreenHeader 
          title="16BITFIT" 
          rightElement={
            <Text style={styles.levelBadge}>LV.{characterStats?.level || 1}</Text>
          }
        />

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Left Side: Avatar and Player Info */}
          <View style={styles.avatarSection}>
            <PixelAvatar evolutionStage={characterStats?.evolutionStage || 1} />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{characterStats?.name || 'PLAYER1'}</Text>
              <Text style={styles.playerTitle}>FITNESS HERO</Text>
            </View>
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Pressable 
                style={styles.button} 
                onPress={() => handleActionPress('train')}
              >
                <Text style={styles.buttonText}>TRAIN</Text>
              </Pressable>
              <Pressable 
                style={styles.button} 
                onPress={() => handleActionPress('battle')}
              >
                <Text style={styles.buttonText}>BATTLE</Text>
              </Pressable>
              <Pressable 
                style={styles.button} 
                onPress={() => handleActionPress('stats')}
              >
                <Text style={styles.buttonText}>STATS</Text>
              </Pressable>
            </View>
          </View>

          {/* Right Side: Stats */}
          <View style={styles.statsSection}>
            <StatCard
              label="HEALTH"
              value={characterStats?.health || 100}
              maxValue={100}
              color='#4CAF50' // Green
            />
            <StatCard
              label="STRENGTH"
              value={characterStats?.strength || 50}
              maxValue={100}
              color='#FF6B6B' // Red
            />
            <StatCard
              label="STAMINA"
              value={characterStats?.stamina || 50}
              maxValue={100}
              color='#4ECDC4' // Teal
            />
            <StatCard
              label="SPEED"
              value={characterStats?.speed || 50}
              maxValue={100}
              color='#FFD700' // Yellow
            />
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screen.lightestGreen,
  },
  levelBadge: {
    ...Typography.subLabel,
    color: Colors.screen.lightestGreen,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  avatarSection: {
    flex: 1,
    backgroundColor: Colors.screen.lightGreen,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.screen.darkGreen,
    alignItems: 'center',
    ...Effects.panelShadow,
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  playerName: {
    ...Typography.bodyText,
    color: Colors.screen.darkestGreen,
    marginBottom: Spacing.xs,
  },
  playerTitle: {
    ...Typography.subLabel,
    color: Colors.screen.darkGreen,
  },
  statsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  actionButtonsContainer: {
    marginTop: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    backgroundColor: Colors.screen.darkGreen,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.screen.darkestGreen,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Effects.buttonShadowDefault,
  },
  buttonText: {
    ...Typography.bodyText,
    color: Colors.screen.lightestGreen,
    textAlign: 'center',
  },
});

export default HomeScreenV2;