import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCharacter } from '../contexts/CharacterContext';

const WorkoutHistoryScreen = () => {
  const navigation = useNavigation();
  const { state } = useCharacter();
  const [groupedActivities, setGroupedActivities] = useState([]);

  useEffect(() => {
    // Group activities by date
    const grouped = groupActivitiesByDate(state.activities || []);
    setGroupedActivities(grouped);
  }, [state.activities]);

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    // Convert to sections array and sort by date
    return Object.entries(groups)
      .map(([date, data]) => ({
        title: date,
        data: data.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => new Date(b.title) - new Date(a.title));
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: '#FF6B6B',
      cardio: '#4ECDC4',
      hiit: '#FFE66D',
      flexibility: '#95E1D3',
      sports: '#F8B500',
    };
    return colors[category] || '#9BBD0F';
  };

  const renderActivity = ({ item }) => (
    <View style={[styles.activityCard, { borderLeftColor: getCategoryColor(item.category) }]}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityCategory}>{item.category.toUpperCase()}</Text>
        <Text style={styles.activityDuration}>
          {item.type === 'reps' ? `${item.duration} reps` : `${item.duration} min`}
        </Text>
        <Text style={styles.activityIntensity}>{'⚡'.repeat(item.intensity)}</Text>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const getTotalStats = () => {
    const activities = state.activities || [];
    return {
      total: activities.length,
      thisWeek: activities.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.timestamp) > weekAgo;
      }).length,
      streak: state.currentStreak || 0,
    };
  };

  const stats = getTotalStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WORKOUT HISTORY</Text>
        <Text style={styles.subtitle}>Your fitness journey</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>THIS WEEK</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
      </View>

      {groupedActivities.length > 0 ? (
        <SectionList
          sections={groupedActivities}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          renderItem={renderActivity}
          renderSectionHeader={renderSectionHeader}
          style={styles.list}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>NO WORKOUTS YET</Text>
          <Text style={styles.emptySubtext}>Start logging to see your history!</Text>
        </View>
      )}

      <Pressable
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
      >
        <Text style={styles.backButtonText}>← BACK</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#0F380F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    backgroundColor: '#9BBD0F',
    paddingVertical: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  activityCard: {
    backgroundColor: '#0F380F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityName: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
  },
  activityTime: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#556B2F',
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCategory: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#556B2F',
  },
  activityDuration: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
  },
  activityIntensity: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.6,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
});

export default WorkoutHistoryScreen;