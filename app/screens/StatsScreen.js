/**
 * Stats Screen - GameBoy Style Progress Tracking
 * Displays detailed character stats, progress charts, and achievements
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import StatDetailBar from '../components/StatDetailBar';
import SoundFXManager from '../services/SoundFXManager';
import ProgressChart from '../components/ProgressChart';
import AchievementBadges from '../components/AchievementBadges';
import StatHistory from '../components/StatHistory';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Negative stats
  screenBg: '#9BBC0F',     // Classic GameBoy screen
  screenDark: '#556B2F',   // Darker green
};

const StatsScreen = ({
  playerStats = {},
  statHistory = [],
  achievements = [],
  personalRecords = {},
  onNavigate = () => {},
}) => {
  const insets = useSafeAreaInsets();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, achievements
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, [activeTab]);

  const handleTabPress = async (tab) => {
    await SoundFXManager.playTabSwitch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    setActiveTab(tab);
  };

  // Calculate stat percentages and colors
  const getStatColor = (value) => {
    if (value >= 80) return COLORS.primary;
    if (value >= 50) return COLORS.yellow;
    return COLORS.red;
  };

  const renderOverviewTab = () => (
    <Animated.View 
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Character Summary */}
      <View style={styles.summaryCard}>
        <Text style={[styles.cardTitle, pixelFont]}>CHARACTER STATUS</Text>
        
        <View style={styles.levelInfo}>
          <Text style={[styles.levelLabel, pixelFont]}>LEVEL</Text>
          <Text style={[styles.levelValue, pixelFont]}>{playerStats.level || 1}</Text>
        </View>
        
        <View style={styles.xpBar}>
          <View 
            style={[
              styles.xpFill, 
              { width: `${(playerStats.xp || 0)}%` }
            ]} 
          />
          <Text style={[styles.xpText, pixelFont]}>
            {playerStats.xp || 0}/100 XP
          </Text>
        </View>
      </View>

      {/* Main Stats */}
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, pixelFont]}>VITAL STATS</Text>
        
        <StatDetailBar
          icon="❤️" 
          label="HEALTH" 
          value={playerStats.health || 75} 
          maxValue={100}
          color={getStatColor(playerStats.health || 75)}
          showDetails={activeTab === 'overview'}
          trend={null} // TODO: Calculate trend from history
          previousValue={null} // TODO: Get from history
        />
        <StatDetailBar
          icon="⚡" 
          label="STAMINA" 
          value={playerStats.stamina || 70} 
          maxValue={100}
          color={getStatColor(playerStats.stamina || 70)}
          showDetails={activeTab === 'overview'}
        />
        <StatDetailBar
          icon="💪" 
          label="STRENGTH" 
          value={playerStats.strength || 60} 
          maxValue={100}
          color={getStatColor(playerStats.strength || 60)}
          showDetails={activeTab === 'overview'}
        />
        <StatDetailBar
          icon="🎯" 
          label="FOCUS" 
          value={playerStats.focus || 65} 
          maxValue={100}
          color={getStatColor(playerStats.focus || 65)}
          showDetails={activeTab === 'overview'}
        />
        <StatDetailBar
          icon="⏱️" 
          label="ENDURANCE" 
          value={playerStats.endurance || 55} 
          maxValue={100}
          color={getStatColor(playerStats.endurance || 55)}
          showDetails={activeTab === 'overview'}
        />
      </View>

      {/* Personal Records */}
      <View style={styles.recordsContainer}>
        <Text style={[styles.sectionTitle, pixelFont]}>PERSONAL RECORDS</Text>
        
        <View style={styles.recordGrid}>
          <RecordCard 
            title="LONGEST STREAK" 
            value={personalRecords.longestStreak || 0}
            unit="DAYS"
          />
          <RecordCard 
            title="TOTAL WORKOUTS" 
            value={personalRecords.totalWorkouts || 0}
            unit="SESSIONS"
          />
          <RecordCard 
            title="CALORIES BURNED" 
            value={personalRecords.caloriesBurned || 0}
            unit="KCAL"
          />
          <RecordCard 
            title="BOSSES DEFEATED" 
            value={personalRecords.bossesDefeated || 0}
            unit="VICTORIES"
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderHistoryTab = () => (
    <Animated.View 
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity 
          style={[styles.timeRangeButton, styles.timeRangeActive]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.timeRangeText, pixelFont]}>WEEK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.timeRangeButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.timeRangeText, pixelFont]}>MONTH</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.timeRangeButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.timeRangeText, pixelFont]}>YEAR</Text>
        </TouchableOpacity>
      </View>

      {/* History Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Activity Timeline */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, pixelFont]}>ACTIVITY TIMELINE</Text>
          <StatHistory
            historyData={statHistory}
            onEntryPress={(entry) => console.log('History entry pressed:', entry)}
          />
        </View>
        
        {/* Progress Charts */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, pixelFont]}>PROGRESS CHARTS</Text>
          
          <ProgressChart
            stat="health"
            timeRange="week"
            data={statHistory.filter(h => h.stat === 'health')}
            onDataPointPress={(point) => console.log('Point pressed:', point)}
          />
          
          <ProgressChart
            stat="strength"
            timeRange="week"
            data={statHistory.filter(h => h.stat === 'strength')}
            onDataPointPress={(point) => console.log('Point pressed:', point)}
          />
          
          <ProgressChart
            stat="stamina"
            timeRange="week"
            data={statHistory.filter(h => h.stat === 'stamina')}
            onDataPointPress={(point) => console.log('Point pressed:', point)}
          />
          
          <ProgressChart
            stat="focus"
            timeRange="week"
            data={statHistory.filter(h => h.stat === 'focus')}
            onDataPointPress={(point) => console.log('Point pressed:', point)}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderAchievementsTab = () => (
    <Animated.View 
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <AchievementBadges
        achievements={achievements}
        onBadgePress={(achievement) => {
          console.log('Achievement pressed:', achievement);
          // Could show a detail modal or celebration animation
        }}
      />
    </Animated.View>
  );

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
          onPress={async () => {
            await SoundFXManager.playButtonPress();
            onNavigate('home');
          }}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>STATS</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={async () => {
            await SoundFXManager.playButtonPress();
            onNavigate('profile');
          }}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'overview' && styles.tabActive
          ]}
          onPress={() => handleTabPress('overview')}
        >
          <Text style={[
            styles.tabText, 
            pixelFont,
            activeTab === 'overview' && styles.tabTextActive
          ]}>
            OVERVIEW
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'history' && styles.tabActive
          ]}
          onPress={() => handleTabPress('history')}
        >
          <Text style={[
            styles.tabText, 
            pixelFont,
            activeTab === 'history' && styles.tabTextActive
          ]}>
            HISTORY
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'achievements' && styles.tabActive
          ]}
          onPress={() => handleTabPress('achievements')}
        >
          <Text style={[
            styles.tabText, 
            pixelFont,
            activeTab === 'achievements' && styles.tabTextActive
          ]}>
            AWARDS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        
        {/* View All Achievements Button */}
        {activeTab === 'achievements' && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => onNavigate('achievements')}
          >
            <Text style={[styles.viewAllButtonText, pixelFont]}>
              VIEW ALL ACHIEVEMENTS →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};


// Record Card Component
const RecordCard = ({ title, value, unit }) => (
  <View style={styles.recordCard}>
    <Text style={[styles.recordTitle, pixelFont]}>{title}</Text>
    <Text style={[styles.recordValue, pixelFont]}>{value}</Text>
    <Text style={[styles.recordUnit, pixelFont]}>{unit}</Text>
  </View>
);

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
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  profileButton: {
    width: 80,
    alignItems: 'flex-end',
  },

  profileIcon: {
    fontSize: 24,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.dark,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
  },

  tabActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  tabTextActive: {
    color: COLORS.dark,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  tabContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  summaryCard: {
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },

  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  levelLabel: {
    fontSize: 12,
    color: COLORS.yellow,
  },

  levelValue: {
    fontSize: 32,
    color: COLORS.yellow,
  },

  xpBar: {
    height: 16,
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  xpFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },

  xpText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 9,
    color: '#000',
  },

  statsContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    color: COLORS.yellow,
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },


  recordsContainer: {
    marginBottom: 20,
  },

  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  recordCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.dark,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },

  recordTitle: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
  },

  recordValue: {
    fontSize: 24,
    color: COLORS.yellow,
    marginBottom: 2,
  },

  recordUnit: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  comingSoon: {
    fontSize: 24,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 100,
  },

  comingSoonSub: {
    fontSize: 12,
    color: COLORS.yellow,
    textAlign: 'center',
    marginTop: 10,
  },

  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },

  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 6,
  },

  timeRangeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  timeRangeText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  historySection: {
    marginBottom: 32,
  },
  
  viewAllButton: {
    backgroundColor: COLORS.yellow,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
  },
  
  viewAllButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },
});

export default StatsScreen;