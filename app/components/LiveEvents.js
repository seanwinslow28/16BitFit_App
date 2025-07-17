/**
 * Live Events Component
 * Time-limited community events
 * Following MetaSystemsAgent patterns for engagement mechanics
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
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  orange: '#e67e22',
  gray: '#666',
  white: '#FFFFFF',
};

// Event types
const EVENT_TYPES = {
  CHALLENGE: { icon: '🏆', color: COLORS.yellow },
  MARATHON: { icon: '🏃', color: COLORS.blue },
  TOURNAMENT: { icon: '⚔️', color: COLORS.red },
  SEASONAL: { icon: '🎃', color: COLORS.orange },
  COMMUNITY: { icon: '🤝', color: COLORS.purple },
};

// Mock active events
const MOCK_EVENTS = [
  {
    id: 'e1',
    type: 'CHALLENGE',
    title: 'SUMMER SHRED',
    description: 'Complete 20 workouts this month to earn exclusive rewards!',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    progress: 12,
    goal: 20,
    rewards: [
      { type: 'item', name: 'Beach Body Badge', icon: '🏖️' },
      { type: 'xp', amount: 500 },
      { type: 'coins', amount: 100 },
    ],
    participants: 1234,
    leaderboard: [
      { rank: 1, username: 'FitChamp', progress: 20, avatar: '👑' },
      { rank: 2, username: 'GymHero', progress: 18, avatar: '🦸' },
      { rank: 3, username: 'IronWill', progress: 17, avatar: '💪' },
    ],
  },
  {
    id: 'e2',
    type: 'MARATHON',
    title: 'STEP MARATHON',
    description: 'Walk 100,000 steps collectively with the community!',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-22'),
    progress: 67532,
    goal: 100000,
    rewards: [
      { type: 'item', name: 'Marathon Runner', icon: '🏃‍♂️' },
      { type: 'xp', amount: 300 },
    ],
    participants: 567,
    isGlobal: true,
  },
  {
    id: 'e3',
    type: 'TOURNAMENT',
    title: 'BATTLE ROYALE',
    description: 'Compete in battles to climb the tournament ladder!',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-27'),
    progress: 5,
    goal: 10,
    rewards: [
      { type: 'item', name: 'Champion Crown', icon: '👑' },
      { type: 'xp', amount: 1000 },
      { type: 'coins', amount: 500 },
    ],
    participants: 892,
    bracket: true,
  },
];

// Mock upcoming events
const UPCOMING_EVENTS = [
  {
    id: 'u1',
    type: 'SEASONAL',
    title: 'VALENTINE\'S CHALLENGE',
    description: 'Partner workouts and heart-themed rewards!',
    startDate: new Date('2024-02-14'),
    icon: '❤️',
  },
  {
    id: 'u2',
    type: 'COMMUNITY',
    title: 'GUILD WARS',
    description: 'Guild vs Guild competition for ultimate glory!',
    startDate: new Date('2024-02-01'),
    icon: '⚔️',
  },
];

const LiveEvents = ({
  currentUser = { username: 'Player', level: 10 },
  onNavigate = () => {},
}) => {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userRank, setUserRank] = useState(42);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

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

    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Countdown urgency animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) return 'ENDED';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h remaining`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  const handleJoinEvent = async (event) => {
    await SoundFXManager.playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Mock joining event
    setEvents(events.map(e => 
      e.id === event.id 
        ? { ...e, joined: true, progress: 0 }
        : e
    ));
  };

  const handleEventAction = async (event) => {
    await SoundFXManager.playButtonPress();
    
    // Mock progress update
    setEvents(events.map(e => 
      e.id === event.id 
        ? { ...e, progress: Math.min(e.progress + 1, e.goal) }
        : e
    ));
  };

  const renderEventCard = (event, isUpcoming = false) => {
    const eventType = EVENT_TYPES[event.type];
    const timeRemaining = !isUpcoming ? getTimeRemaining(event.endDate) : null;
    const progressPercentage = (event.progress / event.goal) * 100;
    const isUrgent = timeRemaining && timeRemaining.includes('h');
    
    return (
      <TouchableOpacity
        key={event.id}
        style={[
          styles.eventCard,
          isUpcoming && styles.upcomingCard,
        ]}
        onPress={() => !isUpcoming && setSelectedEvent(event)}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventTypeContainer}>
            <Text style={styles.eventIcon}>{eventType.icon}</Text>
            {!isUpcoming && (
              <Animated.View
                style={[
                  styles.liveIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            )}
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, pixelFont]}>{event.title}</Text>
            <Text style={[styles.eventType, pixelFont, { color: eventType.color }]}>
              {event.type} EVENT
            </Text>
          </View>
          
          {!isUpcoming && (
            <Animated.View
              style={{
                transform: [{ scale: isUrgent ? countdownAnim : 1 }],
              }}
            >
              <Text style={[
                styles.timeRemaining, 
                pixelFont,
                isUrgent && styles.urgentTime,
              ]}>
                {timeRemaining}
              </Text>
            </Animated.View>
          )}
        </View>
        
        {/* Event Description */}
        <Text style={[styles.eventDescription, pixelFont]}>
          {event.description}
        </Text>
        
        {!isUpcoming && (
          <>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: progressPercentage === 100 ? COLORS.primary : COLORS.yellow,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, pixelFont]}>
                {event.progress}/{event.goal} {event.isGlobal ? 'GLOBAL' : ''}
              </Text>
            </View>
            
            {/* Event Stats */}
            <View style={styles.eventStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={[styles.statText, pixelFont]}>
                  {event.participants} JOINED
                </Text>
              </View>
              
              {event.rewards && (
                <View style={styles.rewardPreview}>
                  {event.rewards.slice(0, 3).map((reward, index) => (
                    <Text key={index} style={styles.rewardIcon}>
                      {reward.icon || (reward.type === 'xp' ? '⭐' : '🪙')}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            
            {/* Action Button */}
            {!event.joined ? (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinEvent(event)}
              >
                <Text style={[styles.joinButtonText, pixelFont]}>JOIN EVENT</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.joinButton, styles.actionButton]}
                onPress={() => handleEventAction(event)}
              >
                <Text style={[styles.joinButtonText, pixelFont]}>
                  {event.type === 'TOURNAMENT' ? 'BATTLE' : 'LOG ACTIVITY'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {isUpcoming && (
          <View style={styles.upcomingInfo}>
            <Text style={[styles.upcomingDate, pixelFont]}>
              STARTS {event.startDate.toLocaleDateString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    const eventType = EVENT_TYPES[selectedEvent.type];
    
    return (
      <ScrollView style={styles.detailsContainer}>
        {/* Event Banner */}
        <View style={[styles.eventBanner, { backgroundColor: eventType.color }]}>
          <Text style={styles.bannerIcon}>{eventType.icon}</Text>
          <Text style={[styles.bannerTitle, pixelFont]}>{selectedEvent.title}</Text>
        </View>
        
        {/* Leaderboard */}
        {selectedEvent.leaderboard && (
          <View style={styles.leaderboardSection}>
            <Text style={[styles.sectionTitle, pixelFont]}>TOP PLAYERS</Text>
            {selectedEvent.leaderboard.map((player) => (
              <View key={player.rank} style={styles.leaderboardItem}>
                <Text style={[styles.rank, pixelFont]}>#{player.rank}</Text>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <Text style={[styles.playerName, pixelFont]}>{player.username}</Text>
                <Text style={[styles.playerProgress, pixelFont]}>
                  {player.progress}/{selectedEvent.goal}
                </Text>
              </View>
            ))}
            
            {userRank > 3 && (
              <View style={[styles.leaderboardItem, styles.userRank]}>
                <Text style={[styles.rank, pixelFont]}>#{userRank}</Text>
                <Text style={styles.playerAvatar}>🎮</Text>
                <Text style={[styles.playerName, pixelFont]}>{currentUser.username}</Text>
                <Text style={[styles.playerProgress, pixelFont]}>
                  {selectedEvent.progress}/{selectedEvent.goal}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={[styles.sectionTitle, pixelFont]}>REWARDS</Text>
          {selectedEvent.rewards.map((reward, index) => (
            <View key={index} style={styles.rewardItem}>
              <Text style={styles.rewardItemIcon}>
                {reward.icon || (reward.type === 'xp' ? '⭐' : reward.type === 'coins' ? '🪙' : '🎁')}
              </Text>
              <Text style={[styles.rewardName, pixelFont]}>
                {reward.name || `${reward.amount} ${reward.type.toUpperCase()}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>LIVE EVENTS</Text>
        <Animated.View
          style={[
            styles.liveHeaderIndicator,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={[styles.liveText, pixelFont]}>LIVE</Text>
        </Animated.View>
      </LinearGradient>

      {/* Content */}
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
          {/* Active Events */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, pixelFont]}>ACTIVE EVENTS</Text>
            {events.map(event => renderEventCard(event))}
          </View>
          
          {/* Upcoming Events */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, pixelFont]}>COMING SOON</Text>
            {UPCOMING_EVENTS.map(event => renderEventCard(event, true))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Event Details Modal */}
      {selectedEvent && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedEvent(null)}
        >
          <View style={styles.modalContent}>
            {renderEventDetails()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={[styles.closeButtonText, pixelFont]}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  liveHeaderIndicator: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  liveText: {
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 1,
  },

  content: {
    flex: 1,
  },

  section: {
    padding: 16,
  },

  sectionHeader: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 16,
  },

  eventCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 12,
  },

  upcomingCard: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },

  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  eventTypeContainer: {
    position: 'relative',
    marginRight: 12,
  },

  eventIcon: {
    fontSize: 32,
  },

  liveIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: COLORS.red,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },

  eventType: {
    fontSize: 9,
    letterSpacing: 0.5,
  },

  timeRemaining: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  urgentTime: {
    color: COLORS.red,
  },

  eventDescription: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    lineHeight: 16,
    marginBottom: 12,
    opacity: 0.9,
  },

  progressContainer: {
    marginBottom: 12,
  },

  progressBar: {
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    marginBottom: 4,
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
  },

  progressText: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
    textAlign: 'right',
  },

  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statIcon: {
    fontSize: 16,
  },

  statText: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  rewardPreview: {
    flexDirection: 'row',
    gap: 4,
  },

  rewardIcon: {
    fontSize: 16,
  },

  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 10,
    alignItems: 'center',
  },

  actionButton: {
    backgroundColor: COLORS.yellow,
  },

  joinButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  upcomingInfo: {
    marginTop: 8,
  },

  upcomingDate: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: screenWidth - 40,
    maxHeight: '80%',
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },

  detailsContainer: {
    maxHeight: '90%',
  },

  eventBanner: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  bannerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  bannerTitle: {
    fontSize: 18,
    color: COLORS.dark,
    letterSpacing: 2,
  },

  leaderboardSection: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 12,
  },

  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  userRank: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop: 8,
  },

  rank: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    width: 40,
  },

  playerAvatar: {
    fontSize: 20,
    marginRight: 8,
  },

  playerName: {
    flex: 1,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  playerProgress: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  rewardsSection: {
    padding: 16,
  },

  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(247, 213, 29, 0.1)',
    borderRadius: 8,
    padding: 12,
  },

  rewardItemIcon: {
    fontSize: 24,
  },

  rewardName: {
    fontSize: 11,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  closeButton: {
    backgroundColor: COLORS.gray,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 1,
  },
});

export default LiveEvents;