/**
 * Achievements Screen
 * Display all achievements with progress and categories
 * Following MetaSystemsAgent patterns for achievement showcase
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import AchievementManager from '../services/AchievementManager';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  gray: '#666',
  earned: '#FFD700',
};

const CATEGORY_ICONS = {
  fitness: '💪',
  nutrition: '🥗',
  battle: '⚔️',
  social: '🤝',
  streak: '🔥',
  collection: '🎁',
  special: '⭐',
};

const AchievementsScreen = ({
  onNavigate = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [progress, setProgress] = useState({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAchievements();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate progress bar
    const currentProgress = progress.achievements?.percentage || 0;
    Animated.timing(progressAnim, {
      toValue: currentProgress / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const loadAchievements = () => {
    const allAchievements = AchievementManager.getAllAchievements();
    const allMilestones = AchievementManager.getAllMilestones();
    const currentProgress = AchievementManager.getProgress();
    
    setAchievements(allAchievements);
    setMilestones(allMilestones);
    setProgress(currentProgress);
  };

  const handleCategoryChange = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(a => a.category === selectedCategory);
  };

  const renderProgressOverview = () => (
    <View style={styles.progressCard}>
      <Text style={[styles.progressTitle, pixelFont]}>ACHIEVEMENT PROGRESS</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={[styles.statValue, pixelFont]}>
            {progress.achievements?.earned || 0}/{progress.achievements?.total || 0}
          </Text>
          <Text style={[styles.statLabel, pixelFont]}>EARNED</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💫</Text>
          <Text style={[styles.statValue, pixelFont]}>
            {progress.milestones?.earned || 0}/{progress.milestones?.total || 0}
          </Text>
          <Text style={[styles.statLabel, pixelFont]}>MILESTONES</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={[styles.statValue, pixelFont]}>{progress.totalPoints || 0}</Text>
          <Text style={[styles.statLabel, pixelFont]}>POINTS</Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, pixelFont]}>
          {Math.round(progress.achievements?.percentage || 0)}% COMPLETE
        </Text>
      </View>
    </View>
  );

  const renderAchievement = (achievement) => {
    const isEarned = achievement.earned;
    const progressData = achievement.progress;
    
    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          isEarned && styles.achievementEarned,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        disabled={!isEarned}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.iconContainer, isEarned && styles.iconEarned]}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, pixelFont, isEarned && styles.textEarned]}>
              {achievement.name}
            </Text>
            <Text style={[styles.achievementDescription, pixelFont]}>
              {achievement.description}
            </Text>
            
            {!isEarned && progressData && (
              <View style={styles.miniProgressContainer}>
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      { width: `${progressData.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.miniProgressText, pixelFont]}>
                  {progressData.current}/{progressData.target}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.achievementReward}>
            <Text style={[styles.pointsText, pixelFont]}>{achievement.points}pts</Text>
            {isEarned && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
        
        {achievement.reward && (
          <View style={styles.rewardRow}>
            {achievement.reward.xp && (
              <Text style={[styles.rewardText, pixelFont]}>+{achievement.reward.xp} XP</Text>
            )}
            {achievement.reward.coins && (
              <Text style={[styles.rewardText, pixelFont]}>+{achievement.reward.coins} 🪙</Text>
            )}
            {achievement.reward.item && (
              <Text style={[styles.rewardText, pixelFont]}>🎁 {achievement.reward.item}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMilestones = () => (
    <View style={styles.milestonesSection}>
      <Text style={[styles.sectionTitle, pixelFont]}>MILESTONES</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.milestonesScroll}
      >
        {milestones.map(milestone => (
          <View
            key={milestone.id}
            style={[
              styles.milestoneCard,
              milestone.earned && styles.milestoneEarned,
            ]}
          >
            <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
            <Text style={[styles.milestoneName, pixelFont]}>{milestone.name}</Text>
            <Text style={[styles.milestoneDescription, pixelFont]}>
              {milestone.description}
            </Text>
            {milestone.earned && <Text style={styles.milestoneCheck}>✓</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const categories = ['all', ...Object.keys(CATEGORY_ICONS)];

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
          onPress={() => onNavigate('stats')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>ACHIEVEMENTS</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Progress Overview */}
          {renderProgressOverview()}
          
          {/* Milestones */}
          {renderMilestones()}
          
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.categoryTabActive,
                ]}
                onPress={() => handleCategoryChange(category)}
              >
                {category !== 'all' && (
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category]}</Text>
                )}
                <Text style={[styles.categoryText, pixelFont]}>
                  {category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Achievements List */}
          <View style={styles.achievementsList}>
            {getFilteredAchievements().map(achievement => renderAchievement(achievement))}
          </View>
          
          <View style={styles.footer} />
        </Animated.View>
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

  content: {
    flex: 1,
  },

  progressCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },

  progressTitle: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  statItem: {
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 18,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  progressBarContainer: {
    alignItems: 'center',
  },

  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },

  progressText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  milestonesSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 12,
  },

  milestonesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },

  milestoneCard: {
    width: 120,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },

  milestoneEarned: {
    borderColor: COLORS.earned,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },

  milestoneIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  milestoneName: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },

  milestoneDescription: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  milestoneCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: COLORS.earned,
  },

  categoryScroll: {
    marginBottom: 16,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    marginRight: 10,
  },

  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  achievementsList: {
    paddingHorizontal: 20,
  },

  achievementCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    marginBottom: 12,
    opacity: 0.7,
  },

  achievementEarned: {
    borderColor: COLORS.earned,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    opacity: 1,
  },

  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconEarned: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },

  achievementIcon: {
    fontSize: 24,
  },

  achievementInfo: {
    flex: 1,
  },

  achievementName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  textEarned: {
    color: COLORS.earned,
  },

  achievementDescription: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  miniProgressContainer: {
    marginTop: 4,
  },

  miniProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  miniProgressText: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  achievementReward: {
    alignItems: 'center',
  },

  pointsText: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  checkmark: {
    fontSize: 20,
    color: COLORS.earned,
  },

  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  rewardText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  footer: {
    height: 100,
  },
});

export default AchievementsScreen;