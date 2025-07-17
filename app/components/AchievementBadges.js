/**
 * Achievement Badges Component
 * GameBoy-style achievement display with unlock animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Negative stats
  blue: '#3498db',         // Secondary accent
  purple: '#9b59b6',       // Epic achievement
  gray: '#444444',         // Locked achievement
};

// Achievement categories
const ACHIEVEMENT_CATEGORIES = {
  FITNESS: '💪',
  NUTRITION: '🥗',
  CONSISTENCY: '🔥',
  BATTLE: '⚔️',
  SOCIAL: '👥',
  SPECIAL: '⭐',
};

const AchievementBadges = ({
  achievements = [],
  onBadgePress,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  
  // Mock achievements for demonstration
  const mockAchievements = [
    // Fitness Achievements
    {
      id: 'first_workout',
      name: 'FIRST STEPS',
      description: 'Complete your first workout',
      category: 'FITNESS',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 7),
      rarity: 'common',
      icon: '🎯',
      progress: 1,
      total: 1,
    },
    {
      id: 'workout_week',
      name: 'WEEKLY WARRIOR',
      description: 'Work out 5 times in one week',
      category: 'FITNESS',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 3),
      rarity: 'uncommon',
      icon: '📅',
      progress: 5,
      total: 5,
    },
    {
      id: 'strength_master',
      name: 'STRENGTH MASTER',
      description: 'Reach 100 strength',
      category: 'FITNESS',
      unlocked: false,
      rarity: 'rare',
      icon: '💪',
      progress: 75,
      total: 100,
    },
    {
      id: 'cardio_king',
      name: 'CARDIO KING',
      description: 'Complete 50 cardio sessions',
      category: 'FITNESS',
      unlocked: false,
      rarity: 'uncommon',
      icon: '🏃',
      progress: 23,
      total: 50,
    },
    
    // Nutrition Achievements
    {
      id: 'healthy_start',
      name: 'HEALTHY START',
      description: 'Log your first healthy meal',
      category: 'NUTRITION',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 10),
      rarity: 'common',
      icon: '🥗',
      progress: 1,
      total: 1,
    },
    {
      id: 'balanced_week',
      name: 'BALANCED WEEK',
      description: 'Maintain healthy eating for 7 days',
      category: 'NUTRITION',
      unlocked: false,
      rarity: 'uncommon',
      icon: '⚖️',
      progress: 4,
      total: 7,
    },
    
    // Consistency Achievements
    {
      id: 'streak_7',
      name: '7 DAY STREAK',
      description: 'Maintain a 7-day activity streak',
      category: 'CONSISTENCY',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 1),
      rarity: 'uncommon',
      icon: '🔥',
      progress: 7,
      total: 7,
    },
    {
      id: 'streak_30',
      name: 'MONTHLY STREAK',
      description: 'Maintain a 30-day activity streak',
      category: 'CONSISTENCY',
      unlocked: false,
      rarity: 'rare',
      icon: '🏆',
      progress: 7,
      total: 30,
    },
    
    // Battle Achievements
    {
      id: 'first_victory',
      name: 'FIRST VICTORY',
      description: 'Win your first battle',
      category: 'BATTLE',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 5),
      rarity: 'common',
      icon: '⚔️',
      progress: 1,
      total: 1,
    },
    {
      id: 'boss_slayer',
      name: 'BOSS SLAYER',
      description: 'Defeat 10 bosses',
      category: 'BATTLE',
      unlocked: false,
      rarity: 'rare',
      icon: '👹',
      progress: 3,
      total: 10,
    },
    
    // Special Achievements
    {
      id: 'early_bird',
      name: 'EARLY BIRD',
      description: 'Complete a workout before 6 AM',
      category: 'SPECIAL',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 2),
      rarity: 'uncommon',
      icon: '🌅',
      progress: 1,
      total: 1,
    },
    {
      id: 'perfect_month',
      name: 'PERFECT MONTH',
      description: 'Complete all daily goals for 30 days',
      category: 'SPECIAL',
      unlocked: false,
      rarity: 'legendary',
      icon: '💎',
      progress: 12,
      total: 30,
    },
  ];
  
  const displayAchievements = achievements.length > 0 ? achievements : mockAchievements;
  
  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'ALL' 
    ? displayAchievements 
    : displayAchievements.filter(a => a.category === selectedCategory);
  
  // Sort achievements: unlocked first, then by date/progress
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (a.unlocked && b.unlocked) {
      return b.unlockedDate - a.unlockedDate;
    }
    return (b.progress / b.total) - (a.progress / a.total);
  });

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory]);

  const handleBadgePress = (achievement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBadgePress) {
      onBadgePress(achievement);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return COLORS.primary;
      case 'uncommon': return COLORS.blue;
      case 'rare': return COLORS.yellow;
      case 'epic': return COLORS.purple;
      case 'legendary': return COLORS.red;
      default: return COLORS.primary;
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'ALL' && styles.categoryButtonActive
        ]}
        onPress={() => {
          setSelectedCategory('ALL');
          fadeAnim.setValue(0);
        }}
      >
        <Text style={[styles.categoryButtonText, pixelFont]}>ALL</Text>
      </TouchableOpacity>
      
      {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, icon]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.categoryButton,
            selectedCategory === key && styles.categoryButtonActive
          ]}
          onPress={() => {
            setSelectedCategory(key);
            fadeAnim.setValue(0);
          }}
        >
          <Text style={styles.categoryIcon}>{icon}</Text>
          <Text style={[styles.categoryButtonText, pixelFont]}>
            {key}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAchievementBadge = (achievement) => {
    const isUnlocked = achievement.unlocked;
    const progress = (achievement.progress / achievement.total) * 100;
    const rarityColor = getRarityColor(achievement.rarity);
    
    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.badge,
          !isUnlocked && styles.badgeLocked,
          { borderColor: isUnlocked ? rarityColor : COLORS.gray }
        ]}
        onPress={() => handleBadgePress(achievement)}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={[
          styles.badgeIcon,
          { backgroundColor: isUnlocked ? rarityColor : COLORS.gray }
        ]}>
          <Text style={styles.badgeIconText}>
            {isUnlocked ? achievement.icon : '🔒'}
          </Text>
        </View>
        
        {/* Badge Info */}
        <View style={styles.badgeInfo}>
          <Text style={[
            styles.badgeName, 
            pixelFont,
            !isUnlocked && styles.lockedText
          ]}>
            {achievement.name}
          </Text>
          
          <Text style={[
            styles.badgeDescription,
            pixelFont,
            !isUnlocked && styles.lockedText
          ]}>
            {achievement.description}
          </Text>
          
          {/* Progress Bar */}
          {!isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, pixelFont]}>
                {achievement.progress}/{achievement.total}
              </Text>
            </View>
          )}
          
          {/* Unlock Date */}
          {isUnlocked && (
            <Text style={[styles.unlockedDate, pixelFont]}>
              {achievement.unlockedDate.toLocaleDateString()}
            </Text>
          )}
        </View>
        
        {/* Rarity Indicator */}
        <View style={[
          styles.rarityIndicator,
          { backgroundColor: isUnlocked ? rarityColor : COLORS.gray }
        ]}>
          <Text style={[styles.rarityText, pixelFont]}>
            {achievement.rarity.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      {/* Summary Stats */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, pixelFont]}>
            {displayAchievements.filter(a => a.unlocked).length}
          </Text>
          <Text style={[styles.summaryLabel, pixelFont]}>UNLOCKED</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, pixelFont]}>
            {displayAchievements.length}
          </Text>
          <Text style={[styles.summaryLabel, pixelFont]}>TOTAL</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, pixelFont]}>
            {Math.round(
              (displayAchievements.filter(a => a.unlocked).length / 
               displayAchievements.length) * 100
            )}%
          </Text>
          <Text style={[styles.summaryLabel, pixelFont]}>COMPLETE</Text>
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Achievement List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementList}
      >
        {sortedAchievements.map(renderAchievementBadge)}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 24,
    color: COLORS.yellow,
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  categoryFilter: {
    maxHeight: 50,
    marginBottom: 16,
  },

  categoryFilterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 6,
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },

  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  categoryButtonText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  achievementList: {
    paddingBottom: 20,
    gap: 12,
  },

  badge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  badgeLocked: {
    opacity: 0.7,
  },

  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  badgeIconText: {
    fontSize: 24,
  },

  badgeInfo: {
    flex: 1,
  },

  badgeName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  badgeDescription: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  lockedText: {
    color: '#666',
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.dark,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },

  progressText: {
    fontSize: 8,
    color: COLORS.primary,
  },

  unlockedDate: {
    fontSize: 8,
    color: COLORS.yellow,
  },

  rarityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  rarityText: {
    fontSize: 6,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
});

export default AchievementBadges;