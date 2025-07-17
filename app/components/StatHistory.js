/**
 * Stat History Component
 * Detailed historical data view with GameBoy styling
 */

import React, { useState, useRef, useEffect } from 'react';
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
};

const StatHistory = ({
  historyData = [],
  onEntryPress,
  filterOptions = ['ALL', 'WORKOUTS', 'MEALS', 'BATTLES', 'MILESTONES'],
  style,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Mock history data for demonstration
  const mockHistory = generateMockHistory();
  const displayData = historyData.length > 0 ? historyData : mockHistory;
  
  // Filter data based on selected filter
  const filteredData = selectedFilter === 'ALL' 
    ? displayData 
    : displayData.filter(entry => entry.type === selectedFilter);
  
  // Group data by date
  const groupedData = groupDataByDate(filteredData);

  useEffect(() => {
    // Animate on filter change
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedFilter]);

  const handleEntryPress = (entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedEntry(expandedEntry === entry.id ? null : entry.id);
    if (onEntryPress) {
      onEntryPress(entry);
    }
  };

  const getEntryIcon = (type) => {
    switch (type) {
      case 'WORKOUTS': return '💪';
      case 'MEALS': return '🥗';
      case 'BATTLES': return '⚔️';
      case 'MILESTONES': return '🏆';
      default: return '📝';
    }
  };

  const getEntryColor = (impact) => {
    if (impact > 0) return COLORS.primary;
    if (impact < 0) return COLORS.red;
    return COLORS.yellow;
  };

  const renderFilterBar = () => (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterBar}
      contentContainerStyle={styles.filterContent}
    >
      {filterOptions.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text style={[
            styles.filterText, 
            pixelFont,
            selectedFilter === filter && styles.filterTextActive
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHistoryEntry = (entry) => {
    const isExpanded = expandedEntry === entry.id;
    const entryColor = getEntryColor(entry.impact);
    
    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.entryContainer}
        onPress={() => handleEntryPress(entry)}
        activeOpacity={0.8}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryLeft}>
            <Text style={styles.entryIcon}>{getEntryIcon(entry.type)}</Text>
            <View style={styles.entryInfo}>
              <Text style={[styles.entryTitle, pixelFont, { color: entryColor }]}>
                {entry.title}
              </Text>
              <Text style={[styles.entryTime, pixelFont]}>
                {entry.time}
              </Text>
            </View>
          </View>
          
          <View style={styles.entryRight}>
            {entry.impact !== 0 && (
              <Text style={[styles.entryImpact, pixelFont, { color: entryColor }]}>
                {entry.impact > 0 ? '+' : ''}{entry.impact}
              </Text>
            )}
            <Text style={[styles.expandIcon, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
              ▼
            </Text>
          </View>
        </View>
        
        {isExpanded && (
          <Animated.View style={[styles.entryDetails, { opacity: fadeAnim }]}>
            <Text style={[styles.detailText, pixelFont]}>
              {entry.description}
            </Text>
            
            {entry.stats && (
              <View style={styles.statChanges}>
                {Object.entries(entry.stats).map(([stat, change]) => (
                  <View key={stat} style={styles.statChange}>
                    <Text style={[styles.statName, pixelFont]}>
                      {stat.toUpperCase()}:
                    </Text>
                    <Text style={[
                      styles.statValue, 
                      pixelFont,
                      { color: change > 0 ? COLORS.primary : COLORS.red }
                    ]}>
                      {change > 0 ? '+' : ''}{change}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {entry.rewards && (
              <View style={styles.rewards}>
                <Text style={[styles.rewardLabel, pixelFont]}>REWARDS:</Text>
                <Text style={[styles.rewardText, pixelFont]}>
                  {entry.rewards.join(', ')}
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDateSection = (date, entries) => (
    <View key={date} style={styles.dateSection}>
      <View style={styles.dateHeader}>
        <View style={styles.dateLine} />
        <Text style={[styles.dateText, pixelFont]}>{date}</Text>
        <View style={styles.dateLine} />
      </View>
      
      {entries.map(renderHistoryEntry)}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderFilterBar()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.historyContent}
      >
        {Object.entries(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([date, entries]) => 
            renderDateSection(date, entries)
          )
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { fontSize: 48 }]}>📭</Text>
            <Text style={[styles.emptyText, pixelFont]}>NO HISTORY YET</Text>
            <Text style={[styles.emptySubtext, pixelFont]}>
              Start tracking your progress!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Helper functions
function generateMockHistory() {
  const history = [];
  const now = new Date();
  
  // Generate entries for the past 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Morning workout
    if (Math.random() > 0.3) {
      history.push({
        id: `workout-${day}-morning`,
        type: 'WORKOUTS',
        title: 'Morning Cardio',
        description: '30 minutes of high-intensity interval training. Burned 250 calories!',
        time: '07:30 AM',
        date: date.toISOString(),
        impact: 15,
        stats: {
          stamina: 10,
          health: 5,
        },
        rewards: ['50 XP', '+1 Streak'],
      });
    }
    
    // Meals
    if (Math.random() > 0.2) {
      const isHealthy = Math.random() > 0.3;
      history.push({
        id: `meal-${day}-lunch`,
        type: 'MEALS',
        title: isHealthy ? 'Healthy Lunch' : 'Cheat Meal',
        description: isHealthy 
          ? 'Grilled chicken salad with quinoa'
          : 'Pizza and fries - sometimes you need a break!',
        time: '12:30 PM',
        date: date.toISOString(),
        impact: isHealthy ? 10 : -5,
        stats: {
          health: isHealthy ? 5 : -3,
          happiness: isHealthy ? 3 : 5,
        },
      });
    }
    
    // Evening workout
    if (Math.random() > 0.5) {
      history.push({
        id: `workout-${day}-evening`,
        type: 'WORKOUTS',
        title: 'Strength Training',
        description: 'Upper body focus - chest, shoulders, and arms',
        time: '06:00 PM',
        date: date.toISOString(),
        impact: 20,
        stats: {
          strength: 15,
          stamina: 5,
        },
        rewards: ['75 XP', 'Muscle Badge'],
      });
    }
    
    // Battle
    if (day % 3 === 0 && day !== 0) {
      history.push({
        id: `battle-${day}`,
        type: 'BATTLES',
        title: 'Boss Battle Victory',
        description: 'Defeated the Level 5 Boss with a perfect combo!',
        time: '08:00 PM',
        date: date.toISOString(),
        impact: 50,
        stats: {
          focus: 10,
          happiness: 10,
        },
        rewards: ['200 XP', 'Boss Slayer Badge', 'Power-up'],
      });
    }
    
    // Milestone
    if (day === 3) {
      history.push({
        id: `milestone-${day}`,
        type: 'MILESTONES',
        title: 'Level Up!',
        description: 'Reached Level 6 - Your character evolved!',
        time: '09:00 PM',
        date: date.toISOString(),
        impact: 100,
        stats: {
          health: 10,
          strength: 10,
          stamina: 10,
          focus: 10,
        },
        rewards: ['Character Evolution', 'New Abilities', '500 XP'],
      });
    }
  }
  
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function groupDataByDate(data) {
  const grouped = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  data.forEach(entry => {
    const entryDate = new Date(entry.date);
    let dateKey;
    
    if (entryDate.toDateString() === today.toDateString()) {
      dateKey = 'TODAY';
    } else if (entryDate.toDateString() === yesterday.toDateString()) {
      dateKey = 'YESTERDAY';
    } else {
      dateKey = entryDate.toLocaleDateString('en', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }).toUpperCase();
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(entry);
  });
  
  return grouped;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  filterBar: {
    maxHeight: 50,
    marginBottom: 16,
  },

  filterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(155, 188, 15, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
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

  filterTextActive: {
    color: COLORS.dark,
  },

  historyContent: {
    paddingBottom: 20,
  },

  dateSection: {
    marginBottom: 24,
  },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dateLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  dateText: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginHorizontal: 16,
  },

  entryContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },

  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },

  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  entryIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  entryInfo: {
    flex: 1,
  },

  entryTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  entryTime: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 0.5,
  },

  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  entryImpact: {
    fontSize: 14,
    letterSpacing: 1,
  },

  expandIcon: {
    fontSize: 8,
    color: COLORS.primary,
  },

  entryDetails: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.3)',
  },

  detailText: {
    fontSize: 10,
    color: '#ccc',
    letterSpacing: 0.5,
    lineHeight: 16,
    marginBottom: 12,
  },

  statChanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },

  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statName: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 10,
    letterSpacing: 0.5,
  },

  rewards: {
    backgroundColor: 'rgba(247, 213, 29, 0.1)',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },

  rewardLabel: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  rewardText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },

  emptyIcon: {
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
  },
});

export default StatHistory;