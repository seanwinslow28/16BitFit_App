/**
 * Health Dashboard Component
 * Real-time display of health data and character stat impacts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HealthTrackingManager from '../services/HealthTrackingManager';

export default function HealthDashboard({ navigation }) {
  const [dailyStats, setDailyStats] = useState(null);
  const [characterImpact, setCharacterImpact] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadDashboardData();
    startPulseAnimation();
    
    // Subscribe to real-time updates
    const unsubscribe = HealthTrackingManager.subscribe('data_synced', handleDataSync);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, impact, achievs, recs] = await Promise.all([
        HealthTrackingManager.getDailyStats(),
        HealthTrackingManager.getCharacterImpact(),
        HealthTrackingManager.getAchievementProgress(),
        HealthTrackingManager.getActivityRecommendations()
      ]);
      
      setDailyStats(stats);
      setCharacterImpact(impact);
      setAchievements(achievs);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await HealthTrackingManager.syncAllData();
      await loadDashboardData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDataSync = (syncData) => {
    // Real-time update from sync
    loadDashboardData();
  };

  const renderActivityRing = () => {
    if (!dailyStats) return null;
    
    const stepPercentage = Math.min((dailyStats.activity.steps / 10000) * 100, 100);
    const workoutComplete = dailyStats.activity.workouts > 0;
    const nutritionScore = dailyStats.nutrition?.overallScore || 0;
    
    return (
      <View style={styles.activityRing}>
        <View style={styles.ringContainer}>
          <Animated.View style={[styles.centralStat, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.centralStatValue}>{dailyStats.activity.steps}</Text>
            <Text style={styles.centralStatLabel}>STEPS</Text>
          </Animated.View>
          
          <View style={styles.ringProgress}>
            <View style={styles.ringSegment}>
              <Text style={styles.ringLabel}>Move</Text>
              <View style={styles.ringBar}>
                <View 
                  style={[
                    styles.ringFill,
                    { width: `${stepPercentage}%`, backgroundColor: '#FF3B30' }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.ringSegment}>
              <Text style={styles.ringLabel}>Exercise</Text>
              <View style={styles.ringBar}>
                <View 
                  style={[
                    styles.ringFill,
                    { width: workoutComplete ? '100%' : '0%', backgroundColor: '#04DE71' }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.ringSegment}>
              <Text style={styles.ringLabel}>Nutrition</Text>
              <View style={styles.ringBar}>
                <View 
                  style={[
                    styles.ringFill,
                    { width: `${nutritionScore}%`, backgroundColor: '#00D4FF' }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStatImpacts = () => {
    if (!characterImpact) return null;
    
    const stats = characterImpact.finalStats;
    
    return (
      <View style={styles.statImpacts}>
        <Text style={styles.sectionTitle}>Today's Power Gains</Text>
        
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚔️</Text>
            <Text style={styles.statGain}>+{stats.attack || 0}</Text>
            <Text style={styles.statName}>ATK</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🛡️</Text>
            <Text style={styles.statGain}>+{stats.defense || 0}</Text>
            <Text style={styles.statName}>DEF</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statGain}>+{stats.stamina || 0}</Text>
            <Text style={styles.statName}>STA</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💨</Text>
            <Text style={styles.statGain}>+{stats.speed || 0}</Text>
            <Text style={styles.statName}>SPD</Text>
          </View>
        </View>
        
        {characterImpact.milestones && characterImpact.milestones.length > 0 && (
          <View style={styles.milestones}>
            {characterImpact.milestones.map((milestone, index) => (
              <View key={index} style={styles.milestone}>
                <Text style={styles.milestoneIcon}>🏆</Text>
                <Text style={styles.milestoneText}>{milestone.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) return null;
    
    return (
      <View style={styles.recommendations}>
        <Text style={styles.sectionTitle}>Recommended Activities</Text>
        
        {recommendations.map((rec, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recommendationCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('ManualActivity', { preselected: rec });
            }}
          >
            <View style={styles.recHeader}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              {rec.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>!</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.recDescription}>{rec.description}</Text>
            
            <View style={styles.recFooter}>
              <Text style={styles.recDuration}>⏱️ {rec.duration} min</Text>
              <Text style={styles.recImpact}>
                {typeof rec.impact === 'object' 
                  ? Object.entries(rec.impact).map(([stat, val]) => 
                      `+${val} ${stat.toUpperCase()}`
                    ).join(' ')
                  : rec.impact
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAchievements = () => {
    if (!achievements) return null;
    
    const dailyAchievs = Object.values(achievements.daily || {});
    const incompleteAchievs = dailyAchievs.filter(a => !a.completed);
    
    if (incompleteAchievs.length === 0) return null;
    
    return (
      <View style={styles.achievements}>
        <Text style={styles.sectionTitle}>Daily Achievements</Text>
        
        {incompleteAchievs.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={styles.achievementProgress}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementRatio}>
                  {achievement.current}/{achievement.target}
                </Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(achievement.current / achievement.target) * 100}%` }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.achievementReward}>
              <Text style={styles.rewardLabel}>Reward:</Text>
              <Text style={styles.rewardText}>
                {Object.entries(achievement.reward).map(([key, val]) => 
                  `+${val} ${key.toUpperCase()}`
                ).join(' ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('ManualActivity');
        }}
      >
        <LinearGradient
          colors={['#00D4FF', '#0099CC']}
          style={styles.actionGradient}
        >
          <Text style={styles.actionIcon}>💪</Text>
          <Text style={styles.actionText}>Log Activity</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('QuickNutrition');
        }}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.actionGradient}
        >
          <Text style={styles.actionIcon}>🍎</Text>
          <Text style={styles.actionText}>Log Meal</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Health Data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#00D4FF"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderActivityRing()}
      {renderStatImpacts()}
      {renderQuickActions()}
      {renderRecommendations()}
      {renderAchievements()}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last sync: {dailyStats?.timestamp 
            ? new Date(dailyStats.timestamp).toLocaleTimeString() 
            : 'Never'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
  },
  activityRing: {
    padding: 20,
    alignItems: 'center',
  },
  ringContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralStat: {
    position: 'absolute',
    alignItems: 'center',
  },
  centralStatValue: {
    fontSize: 36,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  centralStatLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginTop: 5,
  },
  ringProgress: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  ringSegment: {
    marginVertical: 10,
  },
  ringLabel: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    marginBottom: 5,
  },
  ringBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  ringFill: {
    height: '100%',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#00D4FF',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statImpacts: {
    marginTop: 30,
  },
  statGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statGain: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F0',
    marginBottom: 5,
  },
  statName: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#999',
  },
  milestones: {
    paddingHorizontal: 20,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  milestoneIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  milestoneText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  actionGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  recommendations: {
    marginTop: 20,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  priorityBadge: {
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  recDescription: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
    lineHeight: 16,
    marginBottom: 10,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recDuration: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
  },
  recImpact: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#0F0',
  },
  achievements: {
    marginTop: 20,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  achievementProgress: {
    marginBottom: 10,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFF',
  },
  achievementRatio: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#999',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 5,
  },
  achievementReward: {
    flexDirection: 'row',
  },
  rewardLabel: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
    marginRight: 10,
  },
  rewardText: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    fontFamily: 'PressStart2P',
    color: '#666',
  },
});