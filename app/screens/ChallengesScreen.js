/**
 * Challenges Screen - Daily and weekly fitness challenges
 * GameBoy-styled challenge tracking and competitions
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  orange: '#f39c12',
  green: '#27ae60',
};

// Challenge types
const CHALLENGE_TYPES = {
  daily: {
    icon: '☀️',
    color: COLORS.yellow,
    refreshTime: '24h',
  },
  weekly: {
    icon: '📅',
    color: COLORS.blue,
    refreshTime: '7d',
  },
  special: {
    icon: '⭐',
    color: COLORS.purple,
    refreshTime: 'Limited',
  },
};

// Mock challenges data
const DAILY_CHALLENGES = [
  {
    id: 'd1',
    title: '10K STEPS',
    description: 'Walk 10,000 steps today',
    type: 'daily',
    category: 'cardio',
    target: 10000,
    current: 6500,
    reward: { xp: 50, coins: 10 },
    icon: '🚶',
  },
  {
    id: 'd2',
    title: 'WATER WARRIOR',
    description: 'Drink 8 glasses of water',
    type: 'daily',
    category: 'health',
    target: 8,
    current: 5,
    reward: { xp: 30, coins: 5 },
    icon: '💧',
  },
  {
    id: 'd3',
    title: 'STRENGTH STREAK',
    description: 'Complete 50 push-ups',
    type: 'daily',
    category: 'strength',
    target: 50,
    current: 30,
    reward: { xp: 40, coins: 8 },
    icon: '💪',
  },
];

const WEEKLY_CHALLENGES = [
  {
    id: 'w1',
    title: 'WORKOUT WARRIOR',
    description: 'Complete 5 workouts this week',
    type: 'weekly',
    category: 'general',
    target: 5,
    current: 3,
    reward: { xp: 200, coins: 50, item: 'Warrior Headband' },
    icon: '🏋️',
  },
  {
    id: 'w2',
    title: 'CARDIO CHAMPION',
    description: 'Run 25km total this week',
    type: 'weekly',
    category: 'cardio',
    target: 25,
    current: 12.5,
    reward: { xp: 250, coins: 60 },
    icon: '🏃',
  },
  {
    id: 'w3',
    title: 'HEALTHY HABITS',
    description: 'Log 21 healthy meals',
    type: 'weekly',
    category: 'nutrition',
    target: 21,
    current: 14,
    reward: { xp: 150, coins: 40 },
    icon: '🥗',
  },
];

const SPECIAL_CHALLENGES = [
  {
    id: 's1',
    title: 'SUMMER SHRED',
    description: 'Complete all daily challenges for 7 days',
    type: 'special',
    category: 'event',
    target: 7,
    current: 4,
    reward: { xp: 500, coins: 100, item: 'Summer Champion Belt' },
    icon: '☀️',
    daysLeft: 3,
  },
];

const ChallengesScreen = ({
  playerStats = {},
  onNavigate = () => {},
  onStartChallenge = () => {},
  onClaimReward = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('daily');
  const [challenges, setChallenges] = useState({
    daily: DAILY_CHALLENGES,
    weekly: WEEKLY_CHALLENGES,
    special: SPECIAL_CHALLENGES,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(
    [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES, ...SPECIAL_CHALLENGES].reduce((acc, challenge) => {
      acc[challenge.id] = new Animated.Value(30);
      return acc;
    }, {})
  ).current;
  const progressAnims = useRef(
    [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES, ...SPECIAL_CHALLENGES].reduce((acc, challenge) => {
      acc[challenge.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    animateEntrance();
  }, []);

  useEffect(() => {
    animateChallenges();
  }, [activeTab]);

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateChallenges = () => {
    const currentChallenges = challenges[activeTab];
    
    // Reset animations
    currentChallenges.forEach(challenge => {
      slideAnims[challenge.id].setValue(30);
      progressAnims[challenge.id].setValue(0);
    });
    
    // Animate each challenge
    const animations = currentChallenges.map((challenge, index) => 
      Animated.parallel([
        Animated.timing(slideAnims[challenge.id], {
          toValue: 0,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnims[challenge.id], {
          toValue: challenge.current / challenge.target,
          duration: 600,
          delay: index * 100 + 300,
          useNativeDriver: false,
        }),
      ])
    );
    
    Animated.parallel(animations).start();
  };

  const handleTabChange = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate refreshing challenges
      setRefreshing(false);
      animateChallenges();
    }, 1000);
  };

  const handleChallengeAction = (challenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (challenge.current >= challenge.target) {
      // Claim reward
      Alert.alert(
        'Claim Reward! 🎉',
        `You'll receive:\n• ${challenge.reward.xp} XP\n• ${challenge.reward.coins} Coins${challenge.reward.item ? `\n• ${challenge.reward.item}` : ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Claim', 
            onPress: () => {
              onClaimReward(challenge);
              // Update challenge status
              setChallenges(prev => ({
                ...prev,
                [activeTab]: prev[activeTab].map(c => 
                  c.id === challenge.id ? { ...c, claimed: true } : c
                ),
              }));
            }
          },
        ]
      );
    } else {
      // Start/view challenge
      onStartChallenge(challenge);
    }
  };

  const renderProgressBar = (challenge) => {
    const progress = challenge.current / challenge.target;
    const isComplete = progress >= 1;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnims[challenge.id].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: isComplete ? COLORS.green : COLORS.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, pixelFont]}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>
    );
  };

  const renderChallenge = (challenge) => {
    const isComplete = challenge.current >= challenge.target;
    const isClaimed = challenge.claimed;
    
    return (
      <Animated.View
        key={challenge.id}
        style={[
          styles.challengeCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnims[challenge.id] }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.challengeContent,
            isComplete && !isClaimed && styles.completedChallenge,
            isClaimed && styles.claimedChallenge,
          ]}
          onPress={() => handleChallengeAction(challenge)}
          disabled={isClaimed}
        >
          {/* Challenge Header */}
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
            <View style={styles.challengeInfo}>
              <Text style={[styles.challengeTitle, pixelFont]}>{challenge.title}</Text>
              <Text style={[styles.challengeDescription, pixelFont]}>
                {challenge.description}
              </Text>
            </View>
            {challenge.daysLeft && (
              <View style={styles.timeLimit}>
                <Text style={[styles.timeLimitText, pixelFont]}>
                  {challenge.daysLeft}d
                </Text>
              </View>
            )}
          </View>
          
          {/* Progress */}
          {!isClaimed && renderProgressBar(challenge)}
          
          {/* Rewards */}
          <View style={styles.rewardContainer}>
            <View style={styles.rewardItems}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={[styles.rewardText, pixelFont]}>{challenge.reward.xp}</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <Text style={[styles.rewardText, pixelFont]}>{challenge.reward.coins}</Text>
              </View>
              {challenge.reward.item && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🎁</Text>
                </View>
              )}
            </View>
            
            {isComplete && !isClaimed && (
              <View style={styles.claimButton}>
                <Text style={[styles.claimText, pixelFont]}>CLAIM</Text>
              </View>
            )}
            {isClaimed && (
              <Text style={[styles.claimedText, pixelFont]}>✓ CLAIMED</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewIcon}>🏆</Text>
        <Text style={[styles.overviewValue, pixelFont]}>
          {challenges.daily.filter(c => c.current >= c.target).length +
           challenges.weekly.filter(c => c.current >= c.target).length}/
          {challenges.daily.length + challenges.weekly.length}
        </Text>
        <Text style={[styles.overviewLabel, pixelFont]}>COMPLETED</Text>
      </View>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewIcon}>🔥</Text>
        <Text style={[styles.overviewValue, pixelFont]}>{playerStats.challengeStreak || 0}</Text>
        <Text style={[styles.overviewLabel, pixelFont]}>DAY STREAK</Text>
      </View>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewIcon}>⭐</Text>
        <Text style={[styles.overviewValue, pixelFont]}>{playerStats.totalChallenges || 0}</Text>
        <Text style={[styles.overviewLabel, pixelFont]}>ALL TIME</Text>
      </View>
    </View>
  );

  const currentChallenges = challenges[activeTab];

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom,
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>CHALLENGES</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Overview */}
      {renderOverview()}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {Object.entries(CHALLENGE_TYPES).map(([key, type]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeTab === key && styles.tabActive,
              { borderColor: activeTab === key ? type.color : COLORS.dark }
            ]}
            onPress={() => handleTabChange(key)}
          >
            <Text style={styles.tabIcon}>{type.icon}</Text>
            <Text style={[styles.tabText, pixelFont, { color: activeTab === key ? type.color : COLORS.primary }]}>
              {key.toUpperCase()}
            </Text>
            <Text style={[styles.tabTime, pixelFont]}>
              {type.refreshTime}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenges List */}
      <ScrollView
        style={styles.challengesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {currentChallenges.length > 0 ? (
          currentChallenges.map(challenge => renderChallenge(challenge))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, pixelFont]}>
              No {activeTab} challenges available
            </Text>
            <Text style={[styles.emptySubtext, pixelFont]}>
              Check back soon!
            </Text>
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
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

  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  overviewCard: {
    alignItems: 'center',
  },

  overviewIcon: {
    fontSize: 28,
    marginBottom: 4,
  },

  overviewValue: {
    fontSize: 18,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 2,
  },

  overviewLabel: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  tabActive: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  tabText: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  tabTime: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.3,
  },

  challengesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  challengeCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },

  challengeContent: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 12,
    padding: 16,
  },

  completedChallenge: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },

  claimedChallenge: {
    opacity: 0.6,
  },

  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  challengeInfo: {
    flex: 1,
  },

  challengeTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  challengeDescription: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
  },

  timeLimit: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  timeLimitText: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },

  progressContainer: {
    marginBottom: 12,
  },

  progressBar: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  progressText: {
    position: 'absolute',
    right: 8,
    top: 3,
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rewardItems: {
    flexDirection: 'row',
    gap: 16,
  },

  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  rewardIcon: {
    fontSize: 16,
  },

  rewardText: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  claimButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  claimText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  claimedText: {
    fontSize: 10,
    color: COLORS.green,
    letterSpacing: 0.5,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
  },

  footer: {
    height: 100,
  },
});

export default ChallengesScreen;