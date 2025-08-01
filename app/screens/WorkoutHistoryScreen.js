import React, { useState, useEffect } from 'react';  
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import { useCharacter } from '../contexts/CharacterContext';  
import designTokens from '../constants/designTokens'; // Import our design system

const WorkoutHistoryScreen = () => {  
  const navigation = useNavigation();  
  const { state } = useCharacter();  
  const [groupedActivities, setGroupedActivities] = useState([]);

  // All logic (useEffect, groupActivitiesByDate, etc.) remains unchanged.  
  // ...  
  useEffect(() => {  
    const grouped = groupActivitiesByDate(state.activities || []);  
    setGroupedActivities(grouped);  
  }, [state.activities]);

  const groupActivitiesByDate = (activities) => {  
    const groups = {};  
    activities.forEach((activity) => {  
      const date = new Date(activity.timestamp).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });  
      if (!groups[date]) { groups[date] = []; }  
      groups[date].push(activity);  
    });  
    return Object.entries(groups)  
      .map(([date, data]) => ({ title: date, data: data.sort((a, b) => b.timestamp - a.timestamp) }))  
      .sort((a, b) => new Date(b.title) - new Date(a.title));  
  };  
      
  const getCategoryColor = (category) => {  
    const colors = { strength: '#FF6B6B', cardio: '#4ECDC4', hiit: '#FFE66D', flexibility: '#95E1D3', sports: '#F8B500' };  
    return colors[category] || '#9BBD0F';  
  };  
      
  const getTotalStats = () => {  
    const activities = state.activities || [];  
    return {  
      total: activities.length,  
      thisWeek: activities.filter(a => { const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return new Date(a.timestamp) > weekAgo; }).length,  
      streak: state.currentStreak || 0,  
    };  
  };  
  // ...

  const renderActivity = ({ item }) => (  
    <View style={styles.activityCard}>  
        <View style={[styles.categoryTag, {backgroundColor: getCategoryColor(item.category)}]} />  
        <View style={styles.activityContent}>  
            <Text style={styles.activityName}>{item.name}</Text>  
            <Text style={styles.activityDetails}>  
                {item.type === 'reps' ? `${item.duration} reps` : `${item.duration} min`} | Intensity: {'⚡'.repeat(item.intensity)}  
            </Text>  
        </View>  
        <Text style={styles.activityTime}>  
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  
        </Text>  
    </View>  
  );

  const stats = getTotalStats();

  return (  
    <View style={styles.container}>  
      <View style={styles.header}>  
        <Text style={styles.title}>WORKOUT HISTORY</Text>  
      </View>

      <View style={styles.statsContainer}>  
        <View style={styles.statBox}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>TOTAL</Text></View>  
        <View style={styles.statBox}><Text style={styles.statValue}>{stats.thisWeek}</Text><Text style={styles.statLabel}>THIS WEEK</Text></View>  
        <View style={styles.statBox}><Text style={styles.statValue}>{stats.streak}</Text><Text style={styles.statLabel}>STREAK</Text></View>  
      </View>

      {groupedActivities.length > 0 ? (  
        <SectionList  
          sections={groupedActivities}  
          keyExtractor={(item, index) => `${item.id}-${index}`}  
          renderItem={renderActivity}  
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionTitle}>{title}</Text>}  
          style={styles.list}  
          stickySectionHeadersEnabled={false}  
        />  
      ) : (  
        <View style={styles.emptyState}>  
          <Text style={styles.emptyIcon}>📝</Text>  
          <Text style={styles.emptyText}>NO WORKOUTS YET</Text>  
        </View>  
      )}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>  
        <Text style={styles.backButtonText}>← BACK</Text>  
      </Pressable>  
    </View>  
  );  
};

// =================================================================================  
// STYLESHEET - Refined with Design Tokens  
// =================================================================================  
const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
    paddingTop: spacing['3xl'],  
  },  
  header: {  
    alignItems: 'center',  
    marginBottom: spacing.lg,  
  },  
  title: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xl.fontSize,  
    color: colors.theme.text,  
  },  
  statsContainer: {  
    flexDirection: 'row',  
    justifyContent: 'space-around',  
    paddingHorizontal: spacing.md,  
    marginBottom: spacing.lg,  
    gap: spacing.sm,  
  },  
  statBox: {  
    flex: 1,  
    backgroundColor: colors.theme.text,  
    padding: spacing.sm,  
    borderRadius: radius.sm,  
    alignItems: 'center',  
    borderWidth: 1,  
    borderColor: colors.theme.surfaceDark,  
  },  
  statValue: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles['2xl'].fontSize,  
    color: colors.theme.primary,  
  },  
  statLabel: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xs.fontSize,  
    color: colors.theme.textLight,  
    marginTop: spacing.xs,  
  },  
  list: {  
    flex: 1,  
    paddingHorizontal: spacing.lg,  
  },  
  sectionTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.text,  
    backgroundColor: colors.theme.surface,  
    padding: spacing.sm,  
    borderRadius: radius.sm,  
    marginBottom: spacing.sm,  
    textAlign: 'center',  
  },  
  activityCard: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: colors.theme.surfaceDark,  
    borderRadius: radius.sm,  
    marginBottom: spacing.sm,  
    overflow: 'hidden', // Ensures the tag stays within the card's rounded corner  
  },  
  categoryTag: {  
      width: 8,  
      height: '100%',  
  },  
  activityContent: {  
      flex: 1,  
      padding: spacing.md,  
  },  
  activityName: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
    marginBottom: spacing.xs,  
  },  
  activityDetails: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xs.fontSize,  
    color: colors.theme.textLight,  
  },  
  activityTime: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.xs.fontSize,  
    color: colors.theme.textLight,  
    paddingHorizontal: spacing.md,  
  },  
  emptyState: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  emptyIcon: {  
    fontSize: 60,  
    marginBottom: spacing.lg,  
  },  
  emptyText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.text,  
  },  
  backButton: {  
    position: 'absolute',  
    top: spacing.xl + (spacing.lg / 2),  
    left: spacing.lg,  
  },  
  backButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.text,  
  },  
});

export default WorkoutHistoryScreen;