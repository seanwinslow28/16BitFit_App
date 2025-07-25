/**
 * Leaderboard Screen
 * Displays global, weekly, and boss-specific leaderboards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import LeaderboardService from '../services/LeaderboardService';
import { supabase } from '../services/supabaseClient';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  gray: '#666666',
  lightGray: '#999999',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const TABS = [
  { id: 'global', label: 'GLOBAL' },
  { id: 'weekly', label: 'WEEKLY' },
  { id: 'monthly', label: 'MONTHLY' },
  { id: 'bosses', label: 'BOSSES' },
];

const BOSSES = [
  { id: 'sloth_demon', name: 'SLOTH DEMON', icon: '😴' },
  { id: 'junk_food_monster', name: 'JUNK FOOD', icon: '🍔' },
  { id: 'procrastination_phantom', name: 'PROCRASTINATOR', icon: '⏰' },
  { id: 'stress_titan', name: 'STRESS TITAN', icon: '😰' },
];

const LeaderboardScreen = ({ onNavigate = () => {} }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('global');
  const [selectedBoss, setSelectedBoss] = useState(BOSSES[0].id);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    loadUserRank();
  }, [activeTab, selectedBoss]);

  const loadLeaderboard = async () => {
    setLoading(true);
    let result;

    switch (activeTab) {
      case 'weekly':
        result = await LeaderboardService.getWeeklyLeaderboard();
        break;
      case 'monthly':
        result = await LeaderboardService.getMonthlyLeaderboard();
        break;
      case 'bosses':
        result = await LeaderboardService.getBossLeaderboard(selectedBoss);
        break;
      default:
        result = await LeaderboardService.getGlobalLeaderboard();
    }

    if (result.success) {
      setLeaderboard(result.leaderboard);
    }
    setLoading(false);
  };

  const loadUserRank = async () => {
    // Get current user's rank
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const rank = await LeaderboardService.getUserRank(user.id);
      setUserRank(rank);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    await loadUserRank();
    setRefreshing(false);
  };

  const handleTabPress = (tabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  };

  const handleBossSelect = (bossId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBoss(bossId);
  };

  const formatScore = (score) => {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return COLORS.gold;
      case 2: return COLORS.silver;
      case 3: return COLORS.bronze;
      default: return COLORS.primary;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const renderLeaderboardItem = useCallback(({ item, index }) => {
    const rank = index + 1;
    const isCurrentUser = item.user_id === userRank?.user_id;

    return (
      <View 
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rankText,
            pixelFont,
            { color: getRankColor(rank) }
          ]}>
            {rank}
          </Text>
          {getRankIcon(rank) && (
            <Text style={styles.rankIcon}>{getRankIcon(rank)}</Text>
          )}
        </View>

        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, pixelFont]}>
            {item.username}
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, pixelFont]}>
              Combo: {item.combo_max}
            </Text>
            <Text style={[styles.statText, pixelFont]}>
              Time: {formatDuration(item.battle_duration)}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, pixelFont]}>
            {formatScore(item.score)}
          </Text>
          {item.perfect_victory && (
            <Text style={styles.perfectIcon}>⭐</Text>
          )}
        </View>
      </View>
    );
  }, [userRank]);

  const renderBossSelector = () => {
    if (activeTab !== 'bosses') return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.bossSelector}
        contentContainerStyle={styles.bossSelectorContent}
      >
        {BOSSES.map((boss) => (
          <TouchableOpacity
            key={boss.id}
            style={[
              styles.bossButton,
              selectedBoss === boss.id && styles.selectedBossButton
            ]}
            onPress={() => handleBossSelect(boss.id)}
          >
            <Text style={styles.bossIcon}>{boss.icon}</Text>
            <Text style={[
              styles.bossName,
              pixelFont,
              selectedBoss === boss.id && styles.selectedBossName
            ]}>
              {boss.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderUserRankCard = () => {
    if (!userRank) return null;

    return (
      <View style={styles.userRankCard}>
        <Text style={[styles.userRankTitle, pixelFont]}>YOUR BEST</Text>
        <View style={styles.userRankContent}>
          <View style={styles.userRankLeft}>
            <Text style={[styles.userRankNumber, pixelFont]}>
              #{userRank.global_rank}
            </Text>
            <Text style={[styles.userRankLabel, pixelFont]}>GLOBAL RANK</Text>
          </View>
          <View style={styles.userRankRight}>
            <Text style={[styles.userScoreNumber, pixelFont]}>
              {formatScore(userRank.score)}
            </Text>
            <Text style={[styles.userRankLabel, pixelFont]}>HIGH SCORE</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>LEADERBOARDS</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[
              styles.tabText,
              pixelFont,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Boss Selector */}
      {renderBossSelector()}

      {/* User Rank Card */}
      {renderUserRankCard()}

      {/* Optimized Leaderboard */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, pixelFont]}>
            NO SCORES YET
          </Text>
          <Text style={[styles.emptySubtext, pixelFont]}>
            Be the first to set a high score!
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.leaderboardContainer}
          contentContainerStyle={styles.leaderboardContent}
          data={leaderboard}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaderboardItem}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          getItemLayout={(data, index) => ({
            length: 85, // Approximate height of each item
            offset: 85 * index,
            index,
          })}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeTab: {
    borderBottomColor: COLORS.yellow,
  },

  tabText: {
    fontSize: 12,
    color: COLORS.gray,
  },

  activeTabText: {
    color: COLORS.yellow,
  },

  bossSelector: {
    maxHeight: 80,
    marginTop: 10,
  },

  bossSelectorContent: {
    paddingHorizontal: 20,
    gap: 10,
  },

  bossButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    marginRight: 10,
  },

  selectedBossButton: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(247, 213, 29, 0.2)',
  },

  bossIcon: {
    fontSize: 24,
  },

  bossName: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
  },

  selectedBossName: {
    color: COLORS.yellow,
  },

  userRankCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  userRankTitle: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },

  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  userRankLeft: {
    alignItems: 'center',
  },

  userRankRight: {
    alignItems: 'center',
  },

  userRankNumber: {
    fontSize: 24,
    color: COLORS.yellow,
  },

  userScoreNumber: {
    fontSize: 24,
    color: COLORS.yellow,
  },

  userRankLabel: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 4,
  },

  leaderboardContainer: {
    flex: 1,
    marginTop: 20,
  },

  leaderboardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(146, 204, 65, 0.2)',
  },

  currentUserItem: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderColor: COLORS.primary,
  },

  rankContainer: {
    width: 50,
    alignItems: 'center',
  },

  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  rankIcon: {
    fontSize: 16,
    marginTop: 2,
  },

  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },

  playerName: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },

  statText: {
    fontSize: 10,
    color: COLORS.lightGray,
  },

  scoreContainer: {
    alignItems: 'center',
  },

  scoreText: {
    fontSize: 18,
    color: COLORS.yellow,
  },

  perfectIcon: {
    fontSize: 12,
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyText: {
    fontSize: 20,
    color: COLORS.gray,
  },

  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 10,
  },
});

export default LeaderboardScreen;