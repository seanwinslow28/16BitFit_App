import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';
import { ScreenHeader } from '../components/home';

// Mock leaderboard data - replace with API call to Supabase
const MOCK_LEADERBOARD_DATA = [
  { id: '1', rank: 1, name: 'PixelWarrior', level: 99 },
  { id: '2', rank: 2, name: 'MegaStreaker', level: 95 },
  { id: '3', rank: 3, name: 'FitMasterX', level: 92 },
  { id: '4', rank: 4, name: 'CardioKing', level: 88 },
  { id: '5', rank: 5, name: 'You', level: 85, isCurrentUser: true },
  { id: '6', rank: 6, name: 'GymGuru', level: 81 },
  { id: '7', rank: 7, name: 'RookieRyu', level: 76 },
  { id: '8', rank: 8, name: 'IronHeart', level: 75 },
  { id: '9', rank: 9, name: 'FlexMaverick', level: 71 },
  { id: '10', rank: 10, name: 'EnduroKid', level: 68 },
];

// PlayerRow Component
const PlayerRow = ({ item }) => (
  <View style={[styles.playerRow, item.isCurrentUser && styles.userRow]}>
    <Text style={[styles.playerText, styles.rankText]}>{item.rank}</Text>
    <Text style={[styles.playerText, styles.nameText]}>{item.name}</Text>
    <Text style={[styles.playerText, styles.levelText]}>LV. {item.level}</Text>
  </View>
);

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
      <ScreenHeader title="SOCIAL" />
        
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screen.lightestGreen,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.screen.darkGreen,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.screen.darkestGreen,
  },
  tabText: {
    ...Typography.subLabel,
    color: Colors.screen.lightGreen,
  },
  activeTabText: {
    color: Colors.screen.lightestGreen,
    textShadowColor: Colors.screen.lightestGreen,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 4,
  },
  // Content
  contentContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  // Leaderboard List
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderColor: Colors.screen.darkestGreen,
    marginBottom: Spacing.xs,
  },
  headerText: {
    ...Typography.subLabel,
    color: Colors.screen.darkestGreen,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.screen.darkGreen,
  },
  userRow: {
    backgroundColor: Colors.screen.lightGreen,
    borderWidth: 2,
    borderColor: Colors.shell.accentBlue,
    borderRadius: 4,
  },
  playerText: {
    ...Typography.bodyText,
    color: Colors.screen.darkestGreen,
  },
  rankText: {
    width: 40,
    textAlign: 'center',
  },
  nameText: {
    flex: 1,
    marginLeft: Spacing.lg,
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
    ...Typography.bodyText,
    color: Colors.screen.darkGreen,
  },
});

export default SocialScreenV2;