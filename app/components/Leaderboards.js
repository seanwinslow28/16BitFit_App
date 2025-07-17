/**
 * Leaderboards Component
 * Global and friend rankings for various categories
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import CharacterPreview from './CharacterPreview';

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

// Leaderboard categories
const CATEGORIES = [
  { id: 'level', name: 'LEVEL', icon: '⭐' },
  { id: 'streak', name: 'STREAK', icon: '🔥' },
  { id: 'battles', name: 'BATTLES', icon: '⚔️' },
  { id: 'strength', name: 'STRENGTH', icon: '💪' },
  { id: 'monthly', name: 'MONTHLY', icon: '📅' },
];

// Mock leaderboard data
const generateMockLeaderboard = (category, count = 100) => {
  const names = ['NINJA', 'WARRIOR', 'HERO', 'CHAMPION', 'FIGHTER', 'ATHLETE', 'MASTER', 'LEGEND'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const name = `${names[Math.floor(Math.random() * names.length)]}${Math.floor(Math.random() * 999)}`;
    let value;
    
    switch (category) {
      case 'level':
        value = Math.max(1, 50 - i * 0.5 + Math.random() * 10);
        break;
      case 'streak':
        value = Math.max(0, 100 - i * 2 + Math.random() * 20);
        break;
      case 'battles':
        value = Math.max(0, 200 - i * 3 + Math.random() * 30);
        break;
      case 'strength':
        value = Math.max(0, 100 - i * 0.8 + Math.random() * 10);
        break;
      case 'monthly':
        value = Math.max(0, 5000 - i * 50 + Math.random() * 100);
        break;
      default:
        value = Math.max(0, 100 - i);
    }
    
    data.push({
      rank: i + 1,
      username: name,
      value: Math.floor(value),
      level: Math.floor(Math.random() * 40) + 1,
      evolutionStage: Math.floor(Math.random() * 4),
      isCurrentUser: false,
      isFriend: Math.random() > 0.8,
      appearance: {
        body: 'body_default',
        hair: 'hair_default',
        outfit: 'outfit_default',
        accessories: 'gear_none',
        effects: 'effect_none',
      },
    });
  }
  
  return data;
};

const Leaderboards = ({
  currentUser = { username: 'YOU', rank: 42, level: 15 },
  friends = [],
  onViewProfile = () => {},
  onNavigate = () => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState('level');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(
    Array(10).fill(0).map(() => new Animated.Value(50))
  ).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, showFriendsOnly]);

  const loadLeaderboard = () => {
    // Simulate loading
    const mockData = generateMockLeaderboard(selectedCategory);
    
    // Insert current user at their rank
    if (currentUser.rank <= mockData.length) {
      mockData[currentUser.rank - 1] = {
        ...mockData[currentUser.rank - 1],
        username: currentUser.username,
        isCurrentUser: true,
      };
    }
    
    setLeaderboardData(mockData);
    setUserRank(mockData.find(entry => entry.isCurrentUser));
    
    // Animate entries
    animateEntries();
  };

  const animateEntries = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      ...slideAnims.map((anim, index) => 
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const handleCategoryChange = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnims.forEach(anim => anim.setValue(50));
    
    setSelectedCategory(category);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadLeaderboard();
      setRefreshing(false);
    }, 1000);
  };

  const getRankColor = (rank) => {
    if (rank === 1) return COLORS.gold;
    if (rank === 2) return COLORS.silver;
    if (rank === 3) return COLORS.bronze;
    return COLORS.primary;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getValueDisplay = (category, value) => {
    switch (category) {
      case 'level':
        return `LV.${value}`;
      case 'streak':
        return `${value} DAYS`;
      case 'battles':
        return `${value} WINS`;
      case 'strength':
        return `${value} STR`;
      case 'monthly':
        return `${value} XP`;
      default:
        return value;
    }
  };

  const renderLeaderboardEntry = (entry, index) => {
    const isTop3 = entry.rank <= 3;
    const slideAnim = slideAnims[Math.min(index, slideAnims.length - 1)];
    
    return (
      <Animated.View
        key={`${entry.rank}-${entry.username}`}
        style={[
          styles.leaderboardEntry,
          entry.isCurrentUser && styles.currentUserEntry,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.entryContent}
          onPress={() => onViewProfile(entry)}
          disabled={entry.isCurrentUser}
        >
          {/* Rank */}
          <View style={[styles.rankContainer, isTop3 && styles.topRankContainer]}>
            {isTop3 && getRankIcon(entry.rank) ? (
              <Text style={styles.rankIcon}>{getRankIcon(entry.rank)}</Text>
            ) : (
              <Text style={[styles.rankText, pixelFont, { color: getRankColor(entry.rank) }]}>
                #{entry.rank}
              </Text>
            )}
          </View>
          
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <CharacterPreview
              appearance={entry.appearance}
              evolutionStage={entry.evolutionStage}
              size={40}
              animated={false}
              showEffects={false}
            />
          </View>
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userHeader}>
              <Text style={[styles.username, pixelFont]}>
                {entry.username}
              </Text>
              {entry.isFriend && (
                <Text style={styles.friendBadge}>👥</Text>
              )}
            </View>
            <Text style={[styles.userLevel, pixelFont]}>
              Level {entry.level}
            </Text>
          </View>
          
          {/* Value */}
          <View style={styles.valueContainer}>
            <Text style={[styles.valueText, pixelFont]}>
              {getValueDisplay(selectedCategory, entry.value)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderUserRankCard = () => {
    if (!userRank) return null;
    
    return (
      <Animated.View style={[styles.userRankCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.yellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userRankGradient}
        >
          <Text style={[styles.userRankTitle, pixelFont]}>YOUR RANK</Text>
          <View style={styles.userRankInfo}>
            <Text style={[styles.userRankNumber, pixelFont]}>#{userRank.rank}</Text>
            <Text style={[styles.userRankValue, pixelFont]}>
              {getValueDisplay(selectedCategory, userRank.value)}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const visibleData = showFriendsOnly 
    ? leaderboardData.filter(entry => entry.isFriend || entry.isCurrentUser)
    : leaderboardData.slice(0, 50); // Show top 50 for performance

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>RANKINGS</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive
            ]}
            onPress={() => handleCategoryChange(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[styles.categoryText, pixelFont]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !showFriendsOnly && styles.filterButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFriendsOnly(false);
          }}
        >
          <Text style={[styles.filterText, pixelFont]}>GLOBAL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, showFriendsOnly && styles.filterButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFriendsOnly(true);
          }}
        >
          <Text style={[styles.filterText, pixelFont]}>FRIENDS</Text>
        </TouchableOpacity>
      </View>
      
      {/* User Rank Card */}
      {renderUserRankCard()}
      
      {/* Leaderboard List */}
      <ScrollView
        style={styles.leaderboardList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Top 3 Podium */}
        {!showFriendsOnly && (
          <View style={styles.podiumContainer}>
            {[2, 1, 3].map(rank => {
              const entry = leaderboardData.find(e => e.rank === rank);
              if (!entry) return null;
              
              return (
                <View 
                  key={rank}
                  style={[
                    styles.podiumSpot,
                    rank === 1 && styles.firstPlace,
                  ]}
                >
                  <Text style={styles.podiumIcon}>{getRankIcon(rank)}</Text>
                  <CharacterPreview
                    appearance={entry.appearance}
                    evolutionStage={entry.evolutionStage}
                    size={rank === 1 ? 80 : 60}
                    animated={false}
                    showEffects={false}
                  />
                  <Text style={[styles.podiumName, pixelFont]}>
                    {entry.username}
                  </Text>
                  <Text style={[styles.podiumValue, pixelFont]}>
                    {getValueDisplay(selectedCategory, entry.value)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Leaderboard Entries */}
        <View style={styles.entriesContainer}>
          {visibleData.slice(showFriendsOnly ? 0 : 3).map((entry, index) => 
            renderLeaderboardEntry(entry, index)
          )}
        </View>
        
        {/* Load More */}
        {!showFriendsOnly && visibleData.length >= 50 && (
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={[styles.loadMoreText, pixelFont]}>
              SHOWING TOP 50
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  headerSpace: {
    width: 80,
  },

  categoryScroll: {
    maxHeight: 80,
    marginVertical: 10,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryTab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    marginRight: 10,
  },

  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    padding: 4,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  userRankGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userRankTitle: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  userRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  userRankNumber: {
    fontSize: 20,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  userRankValue: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  leaderboardList: {
    flex: 1,
  },

  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 10,
  },

  podiumSpot: {
    alignItems: 'center',
    flex: 1,
  },

  firstPlace: {
    marginBottom: 20,
  },

  podiumIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  podiumName: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },

  podiumValue: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.3,
    marginTop: 4,
  },

  entriesContainer: {
    paddingHorizontal: 20,
  },

  leaderboardEntry: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    marginBottom: 8,
    overflow: 'hidden',
  },

  currentUserEntry: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
  },

  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  rankContainer: {
    width: 50,
    alignItems: 'center',
  },

  topRankContainer: {
    width: 50,
  },

  rankIcon: {
    fontSize: 24,
  },

  rankText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },

  avatarContainer: {
    marginHorizontal: 12,
  },

  userInfo: {
    flex: 1,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  username: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  friendBadge: {
    fontSize: 12,
  },

  userLevel: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  valueContainer: {
    alignItems: 'flex-end',
  },

  valueText: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },

  loadMoreText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },
});

export default Leaderboards;