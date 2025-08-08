import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCharacter } from '../contexts/CharacterContext';
import designTokens from '../constants/designTokens';
import * as Haptics from 'expo-haptics';

// =================================================================================
// SUB-COMPONENT: StatCard
// Renders a single statistic based on the new design.
// =================================================================================
const StatCard = ({ label, value, maxValue, color }) => {
  const fillWidth = (value / maxValue) * 100;

  return (
    <View style={styles.statCard}>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{`${value}/${maxValue}`}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${fillWidth}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// =================================================================================
// SUB-COMPONENT: PixelAvatar
// Renders a placeholder pixel art avatar like in the HTML prototype.
// =================================================================================
const PixelAvatar = () => (
  <View style={styles.avatarContainer}>
    {/* This is a simplified representation of the grid from the HTML */}
    <View style={styles.pixelAvatar}>
      {[...Array(144)].map((_, i) => {
        // Simple pattern for demonstration
        const isDark = [2, 3, 4, 5, 6, 7, 13, 22, 25, 30, 37, 40, 42, 43, 44, 45, 46, 52, 54, 57, 61, 64, 69, 76, 80, 81, 82, 83].includes(i % 90);
        const isMedium = [14, 15, 16, 17, 18, 19, 21, 26, 29, 31, 36, 38, 51, 55, 66, 68, 70, 75, 88, 92, 93, 94, 95].includes(i % 100);
        return (
          <View
            key={i}
            style={[
              styles.pixel,
              isDark && styles.pixelDark,
              isMedium && styles.pixelMedium,
            ]}
          />
        );
      })}
    </View>
  </View>
);

// =================================================================================
// MAIN COMPONENT: HomeScreenV2
// This is the new, revamped Home Screen.
// =================================================================================
const HomeScreenV2 = () => {
  const navigation = useNavigation();
  const { characterStats } = useCharacter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keep your existing analytics and fade-in logic
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  // We keep your existing navigation logic. The UI is new, the function is the same.
  const handleActionPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (action) {
      case 'battle':
        navigation.navigate('BattleTab');
        break;
      case 'train':
        navigation.navigate('QuickActivityLog');
        break;
      case 'feed':
        navigation.navigate('FoodSelection');
        break;
      case 'stats':
        navigation.navigate('Stats');
        break;
      case 'history':
        navigation.navigate('WorkoutHistory');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Screen Header from the prototype */}
        <View style={styles.screenHeader}>
          <Text style={styles.appTitle}>16BITFIT</Text>
          <Text style={styles.levelBadge}>LV.{characterStats?.level || 1}</Text>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Left Side: Avatar and Player Info */}
          <View style={styles.avatarSection}>
            <PixelAvatar />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{characterStats?.name || 'PLAYER1'}</Text>
              <Text style={styles.playerTitle}>FITNESS HERO</Text>
            </View>
            {/* Action Buttons can go here */}
            <View style={styles.actionButtonsContainer}>
              <Pressable style={styles.button} onPress={() => handleActionPress('train')}>
                <Text style={styles.buttonText}>💪 TRAIN</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => handleActionPress('battle')}>
                <Text style={styles.buttonText}>⚔️ BATTLE</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => handleActionPress('feed')}>
                <Text style={styles.buttonText}>🍎 FEED</Text>
              </Pressable>
            </View>
          </View>

          {/* Right Side: Stats */}
          <View style={styles.statsSection}>
            <StatCard
              label="HEALTH"
              value={characterStats?.health || 100}
              maxValue={100}
              color={'#4CAF50'} // Green
            />
            <StatCard
              label="STRENGTH"
              value={characterStats?.strength || 50}
              maxValue={100}
              color={'#FF6B6B'} // Red
            />
            <StatCard
              label="STAMINA"
              value={characterStats?.stamina || 50}
              maxValue={100}
              color={'#4ECDC4'} // Teal
            />
            <StatCard
              label="SPEED"
              value={characterStats?.speed || 50}
              maxValue={100}
              color={'#FFD700'} // Yellow
            />
          </View>
        </View>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <Pressable style={styles.secondaryButton} onPress={() => handleActionPress('stats')}>
            <Text style={styles.secondaryButtonText}>📊 STATS</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => handleActionPress('history')}>
            <Text style={styles.secondaryButtonText}>📝 HISTORY</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => handleActionPress('settings')}>
            <Text style={styles.secondaryButtonText}>⚙️ SETTINGS</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

// =================================================================================
// STYLESHEET
// All styles now reference our `designTokens.js` file.
// =================================================================================
const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme.background,
  },
  // Screen Header
  screenHeader: {
    backgroundColor: colors.theme.surfaceDark,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.theme.text,
  },
  appTitle: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.theme.primary,
    textShadowColor: colors.theme.text,
    textShadowOffset: { width: 1, height: 1 },
  },
  levelBadge: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.sm.fontSize,
    color: colors.theme.primary,
  },
  // Content Area
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  // Avatar Section
  avatarSection: {
    flex: 1,
    backgroundColor: colors.theme.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.theme.surfaceDark,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 84,
    height: 84,
    backgroundColor: colors.theme.surfaceDark,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.theme.text,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pixelAvatar: {
    width: 72,
    height: 72,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pixel: {
    width: 6,
    height: 6,
    backgroundColor: colors.screen.light,
  },
  pixelDark: { backgroundColor: colors.screen.darkest },
  pixelMedium: { backgroundColor: colors.screen.dark },
  playerInfo: {
    alignItems: 'center',
  },
  playerName: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.base.fontSize,
    color: colors.theme.text,
    marginBottom: spacing.xs,
  },
  playerTitle: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.sm.fontSize,
    color: colors.theme.textLight,
  },
  // Stats Section
  statsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.theme.surfaceDark,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.theme.text,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.primary,
    fontSize: typography.styles.sm.fontSize,
  },
  statValue: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.primary,
    fontSize: typography.styles.xs.fontSize,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.theme.text,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
  actionButtonsContainer: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.theme.surfaceDark,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.theme.text,
    marginBottom: spacing.sm,
  },
  buttonText: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.primary,
    textAlign: 'center',
    fontSize: typography.styles.base.fontSize,
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.theme.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.theme.text,
  },
  secondaryButtonText: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.text,
    textAlign: 'center',
    fontSize: typography.styles.xs.fontSize,
  },
});

export default HomeScreenV2;