/**
 * Social Screen - Main hub for all social features
 * GameBoy-styled social interaction center
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Notifications
  blue: '#3498db',         // Friend color
  purple: '#9b59b6',       // Guild color
  orange: '#f39c12',       // Challenge color
};

// Social feature cards
const SOCIAL_FEATURES = [
  {
    id: 'friends',
    title: 'FRIENDS',
    icon: '👥',
    color: COLORS.blue,
    description: 'Connect & compete',
    badge: 0, // Friend requests
  },
  {
    id: 'leaderboards',
    title: 'RANKINGS',
    icon: '🏆',
    color: COLORS.yellow,
    description: 'Global leaderboards',
  },
  {
    id: 'challenges',
    title: 'CHALLENGES',
    icon: '🎯',
    color: COLORS.orange,
    description: 'Daily & weekly goals',
    badge: 2, // Active challenges
  },
  {
    id: 'guilds',
    title: 'GUILDS',
    icon: '⚔️',
    color: COLORS.purple,
    description: 'Join a fitness team',
  },
  {
    id: 'feed',
    title: 'FEED',
    icon: '📰',
    color: COLORS.primary,
    description: 'Community updates',
    badge: 5, // New posts
  },
  {
    id: 'trading',
    title: 'TRADING',
    icon: '🤝',
    color: COLORS.blue,
    description: 'Trade items',
  },
  {
    id: 'mentorship',
    title: 'MENTORS',
    icon: '🧙',
    color: COLORS.purple,
    description: 'Learn from the best',
  },
  {
    id: 'events',
    title: 'EVENTS',
    icon: '🎉',
    color: COLORS.red,
    description: 'Limited time events',
    badge: 1, // Active event
  },
  {
    id: 'pvp',
    title: 'PVP BATTLE',
    icon: '⚡',
    color: COLORS.orange,
    description: 'Real-time battles',
  },
];

const SocialScreen = ({
  playerStats = {},
  friends = [],
  guild = null,
  notifications = {},
  onNavigate = () => {},
  onFeatureSelect = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(
    SOCIAL_FEATURES.reduce((acc, feature) => {
      acc[feature.id] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

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
  }, []);

  const handleFeaturePress = (feature) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the pressed card
    Animated.sequence([
      Animated.spring(scaleAnims[feature.id], {
        toValue: 0.95,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[feature.id], {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedFeature(feature);
    
    // Navigate to specific feature screen
    setTimeout(() => {
      onFeatureSelect(feature.id);
    }, 200);
  };

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatIcon}>👥</Text>
        <Text style={[styles.quickStatValue, pixelFont]}>{friends.length}</Text>
        <Text style={[styles.quickStatLabel, pixelFont]}>FRIENDS</Text>
      </View>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatIcon}>🏅</Text>
        <Text style={[styles.quickStatValue, pixelFont]}>{playerStats.rank || 'N/A'}</Text>
        <Text style={[styles.quickStatLabel, pixelFont]}>RANK</Text>
      </View>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatIcon}>⚔️</Text>
        <Text style={[styles.quickStatValue, pixelFont]}>{guild ? '✓' : '✗'}</Text>
        <Text style={[styles.quickStatLabel, pixelFont]}>GUILD</Text>
      </View>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatIcon}>🔥</Text>
        <Text style={[styles.quickStatValue, pixelFont]}>{playerStats.socialStreak || 0}</Text>
        <Text style={[styles.quickStatLabel, pixelFont]}>STREAK</Text>
      </View>
    </View>
  );

  const renderFeatureCard = (feature) => {
    const notificationCount = notifications[feature.id] || feature.badge || 0;
    
    return (
      <Animated.View
        key={feature.id}
        style={{
          transform: [{ scale: scaleAnims[feature.id] }],
        }}
      >
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: feature.color }]}
          onPress={() => handleFeaturePress(feature)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[`${feature.color}20`, `${feature.color}10`, 'transparent']}
            style={styles.cardGradient}
          />
          
          <View style={styles.cardContent}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, pixelFont]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, pixelFont]}>
                {feature.description}
              </Text>
            </View>
            
            {notificationCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: COLORS.red }]}>
                <Text style={[styles.badgeText, pixelFont]}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardArrow}>
            <Text style={[styles.arrowText, { color: feature.color }]}>›</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderActiveEvent = () => (
    <View style={styles.activeEventBanner}>
      <LinearGradient
        colors={[COLORS.red, COLORS.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.eventGradient}
      >
        <Text style={styles.eventIcon}>🎉</Text>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, pixelFont]}>SUMMER CHALLENGE</Text>
          <Text style={[styles.eventTime, pixelFont]}>2 DAYS LEFT</Text>
        </View>
        <TouchableOpacity 
          style={styles.eventButton}
          onPress={() => handleFeaturePress({ id: 'events' })}
        >
          <Text style={[styles.eventButtonText, pixelFont]}>JOIN</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
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
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>SOCIAL</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          {(notifications.total || 0) > 0 && (
            <View style={styles.headerBadge}>
              <Text style={[styles.headerBadgeText, pixelFont]}>
                {notifications.total}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
          {/* Active Event Banner */}
          {renderActiveEvent()}

          {/* Quick Stats */}
          {renderQuickStats()}

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            {SOCIAL_FEATURES.map(feature => renderFeatureCard(feature))}
          </View>

          {/* Social Tips */}
          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, pixelFont]}>💡 SOCIAL TIPS</Text>
            <Text style={[styles.tipText, pixelFont]}>
              • Add friends to compete on leaderboards
            </Text>
            <Text style={[styles.tipText, pixelFont]}>
              • Join a guild for team challenges
            </Text>
            <Text style={[styles.tipText, pixelFont]}>
              • Complete daily challenges for rewards
            </Text>
          </View>
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
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    fontSize: 24,
  },

  headerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  headerBadgeText: {
    fontSize: 8,
    color: '#fff',
  },

  content: {
    flex: 1,
  },

  activeEventBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  eventGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  eventIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
  },

  eventTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  eventButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  eventButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
  },

  quickStatItem: {
    alignItems: 'center',
  },

  quickStatIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  quickStatValue: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },

  quickStatLabel: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.5,
  },

  featureGrid: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },

  featureCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },

  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  featureIcon: {
    fontSize: 36,
    marginRight: 16,
  },

  featureInfo: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
  },

  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 40,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  badgeText: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },

  cardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },

  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
  },

  tipsTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  tipText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingLeft: 8,
  },
});

export default SocialScreen;