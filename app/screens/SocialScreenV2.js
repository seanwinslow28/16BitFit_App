import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import designTokens from '../constants/designTokens';

// =================================================================================
// MOCK DATA: Replace this with an API call to your backend/Supabase.
// =================================================================================
const MOCK_LEADERBOARD_DATA = [
  { id: '1', rank: 1, name: 'PixelWarrior', level: 99 },
  { id: '2', rank: 2, name: 'MegaStreaker', level: 95 },
  { id: '3', rank: 3, name: 'FitMasterX', level: 92 },
  { id: '4', rank: 4, name: 'CardioKing', level: 88 },
  { id: '5', rank: 5, name: 'You', level: 85, isCurrentUser: true }, // Highlighted user
  { id: '6', rank: 6, name: 'GymGuru', level: 81 },
  { id: '7', rank: 7, name: 'RookieRyu', level: 76 },
  { id: '8', rank: 8, name: 'IronHeart', level: 75 },
  { id: '9', rank: 9, name: 'FlexMaverick', level: 71 },
  { id: '10', rank: 10, name: 'EnduroKid', level: 68 },
];

// =================================================================================
// SUB-COMPONENT: PlayerRow
// Renders a single row in our leaderboard.
// =================================================================================
const PlayerRow = ({ item }) => (
  <View style={[styles.playerRow, item.isCurrentUser && styles.userRow]}>
    <Text style={[styles.playerText, styles.rankText]}>{item.rank}</Text>
    <Text style={[styles.playerText, styles.nameText]}>{item.name}</Text>
    <Text style={[styles.playerText, styles.levelText]}>LV. {item.level}</Text>
  </View>
);

// =================================================================================
// MAIN COMPONENT: SocialScreenV2
// =================================================================================
const SocialScreenV2 = () => {
  const [activeTab, setActiveTab] = useState('Leaderboard');

  const renderContent = () => {
    if (activeTab === 'Leaderboard') {
      return (
        <FlatList
          data={MOCK_LEADERBOARD_DATA}
          renderItem={({ item }) => <PlayerRow item={item} />}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.headerText}>RANK</Text>
              <Text style={[styles.headerText, {flex: 1, textAlign: 'left', marginLeft: 20}]}>PLAYER</Text>
              <Text style={styles.headerText}>LEVEL</Text>
            </View>
          )}
        />
      );
    }
    // Placeholder for the Friends tab content
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Friends list coming soon!</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.appTitle}>SOCIAL</Text>
      </View>
      
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Leaderboard')}>
          <Text style={[styles.tabText, activeTab === 'Leaderboard' && styles.activeTabText]}>LEADERBOARD</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Friends')}>
          <Text style={[styles.tabText, activeTab === 'Friends' && styles.activeTabText]}>FRIENDS</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Content Area */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

// =================================================================================
// STYLESHEET
// =================================================================================
const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme.background,
  },
  screenHeader: {
    backgroundColor: colors.theme.surfaceDark,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.theme.text,
  },
  appTitle: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.theme.primary,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.theme.surfaceDark,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.theme.text,
  },
  tabText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.sm.fontSize,
    color: colors.theme.textLight,
  },
  activeTabText: {
    color: colors.theme.primary,
    textShadowColor: colors.theme.primary,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 4,
  },
  // Content
  contentContainer: {
    flex: 1,
    padding: spacing.md,
  },
  // Leaderboard List
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderColor: colors.theme.text,
    marginBottom: spacing.xs,
  },
  headerText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.sm.fontSize,
    color: colors.theme.text,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.theme.surfaceDark,
  },
  userRow: {
    backgroundColor: colors.theme.surface,
    borderWidth: 2,
    borderColor: colors.accent['steely-blue'],
    borderRadius: radius.sm,
  },
  playerText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.base.fontSize,
    color: colors.theme.text,
  },
  rankText: {
    width: 40,
    textAlign: 'center',
  },
  nameText: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  levelText: {
    width: 60,
    textAlign: 'right',
  },
  // Placeholder
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.base.fontSize,
    color: colors.theme.textLight,
  },
});

export default SocialScreenV2;