/**
 * Mentorship System Component
 * Higher level players help newbies
 * Following MetaSystemsAgent patterns for knowledge sharing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  FlatList,
  Dimensions,
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
  gray: '#666',
  white: '#FFFFFF',
};

// Mentor roles
const MENTOR_ROLES = {
  BEGINNER: { min: 1, max: 10, title: 'Apprentice', color: COLORS.gray },
  INTERMEDIATE: { min: 11, max: 25, title: 'Guide', color: COLORS.blue },
  ADVANCED: { min: 26, max: 50, title: 'Master', color: COLORS.purple },
  EXPERT: { min: 51, max: 100, title: 'Sensei', color: COLORS.yellow },
};

// Mock mentors
const MOCK_MENTORS = [
  {
    id: 'm1',
    username: 'FitMaster',
    level: 45,
    avatar: '🧘',
    role: 'Master',
    specialty: 'Strength Training',
    rating: 4.8,
    studentsHelped: 127,
    bio: 'Helping beginners build strength and confidence!',
    availability: 'online',
  },
  {
    id: 'm2',
    username: 'CardioQueen',
    level: 38,
    avatar: '👸',
    role: 'Master',
    specialty: 'Cardio & Endurance',
    rating: 4.9,
    studentsHelped: 89,
    bio: 'Marathon runner sharing tips for better stamina.',
    availability: 'online',
  },
  {
    id: 'm3',
    username: 'YogaSensei',
    level: 62,
    avatar: '🧘‍♀️',
    role: 'Sensei',
    specialty: 'Flexibility & Balance',
    rating: 5.0,
    studentsHelped: 234,
    bio: 'Find your inner peace through movement.',
    availability: 'busy',
  },
];

// Mock tips/lessons
const MOCK_TIPS = [
  {
    id: 't1',
    category: 'Beginner',
    title: 'Starting Your Fitness Journey',
    icon: '🌱',
    tips: [
      'Start with 10-15 minute workouts',
      'Focus on form over speed',
      'Track your progress daily',
      'Celebrate small victories',
    ],
  },
  {
    id: 't2',
    category: 'Nutrition',
    title: 'Eating for Energy',
    icon: '🥗',
    tips: [
      'Eat protein with every meal',
      'Stay hydrated throughout the day',
      'Plan meals in advance',
      'Allow yourself treats in moderation',
    ],
  },
  {
    id: 't3',
    category: 'Motivation',
    title: 'Staying Consistent',
    icon: '💪',
    tips: [
      'Set realistic goals',
      'Find a workout buddy',
      'Create a routine',
      'Remember why you started',
    ],
  },
];

const MentorshipSystem = ({
  currentUser = { username: 'Player', level: 5 },
  onNavigate = () => {},
}) => {
  const [selectedTab, setSelectedTab] = useState('find'); // find, my-mentor, tips
  const [mentors, setMentors] = useState(MOCK_MENTORS);
  const [myMentor, setMyMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Pulse animation for online indicators
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
  }, []);

  const getMentorRole = (level) => {
    for (const [key, role] of Object.entries(MENTOR_ROLES)) {
      if (level >= role.min && level <= role.max) {
        return role;
      }
    }
    return MENTOR_ROLES.BEGINNER;
  };

  const handleTabChange = async (tab) => {
    await SoundFXManager.playTabSwitch();
    setSelectedTab(tab);
  };

  const handleRequestMentor = async (mentor) => {
    await SoundFXManager.playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setMyMentor(mentor);
    setSelectedTab('my-mentor');
    
    // Add welcome message
    setMessages([
      {
        id: 'm1',
        sender: mentor.username,
        text: `Welcome! I'm excited to help you on your fitness journey. What are your main goals?`,
        timestamp: Date.now(),
        isMe: false,
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await SoundFXManager.playButtonPress();
    
    const message = {
      id: `msg_${Date.now()}`,
      sender: currentUser.username,
      text: newMessage,
      timestamp: Date.now(),
      isMe: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate mentor response
    setTimeout(() => {
      const responses = [
        "Great question! Let me help you with that.",
        "That's a common challenge. Here's what I recommend...",
        "Excellent progress! Keep it up!",
        "Remember to focus on consistency over perfection.",
      ];
      
      const mentorResponse = {
        id: `msg_${Date.now()}_resp`,
        sender: myMentor.username,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now(),
        isMe: false,
      };
      
      setMessages(prev => [...prev, mentorResponse]);
    }, 2000);
  };

  const renderMentor = ({ item }) => {
    const role = getMentorRole(item.level);
    const isOnline = item.availability === 'online';
    const isBusy = item.availability === 'busy';
    
    return (
      <TouchableOpacity
        style={styles.mentorCard}
        onPress={() => currentUser.level < 10 && handleRequestMentor(item)}
        disabled={currentUser.level >= 10}
      >
        <View style={styles.mentorHeader}>
          <View style={styles.mentorAvatar}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
            {isOnline && (
              <Animated.View
                style={[
                  styles.onlineIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            )}
            {isBusy && <View style={[styles.onlineIndicator, styles.busyIndicator]} />}
          </View>
          
          <View style={styles.mentorInfo}>
            <Text style={[styles.mentorName, pixelFont]}>{item.username}</Text>
            <Text style={[styles.mentorRole, pixelFont, { color: role.color }]}>
              {role.title} • LVL {item.level}
            </Text>
            <Text style={[styles.mentorSpecialty, pixelFont]}>{item.specialty}</Text>
          </View>
          
          <View style={styles.mentorStats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={[styles.statValue, pixelFont]}>{item.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={[styles.statValue, pixelFont]}>{item.studentsHelped}</Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.mentorBio, pixelFont]}>{item.bio}</Text>
        
        {currentUser.level < 10 && (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => handleRequestMentor(item)}
          >
            <Text style={[styles.requestButtonText, pixelFont]}>
              REQUEST MENTOR
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderTipCategory = ({ item }) => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipIcon}>{item.icon}</Text>
        <Text style={[styles.tipTitle, pixelFont]}>{item.title}</Text>
      </View>
      
      <View style={styles.tipContent}>
        {item.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={[styles.tipText, pixelFont]}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMessage = ({ item }) => (
    <View style={[styles.message, item.isMe && styles.myMessage]}>
      <Text style={[styles.messageSender, pixelFont]}>
        {item.sender}
      </Text>
      <Text style={[styles.messageText, pixelFont]}>
        {item.text}
      </Text>
      <Text style={[styles.messageTime, pixelFont]}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

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
        <Text style={[styles.headerTitle, pixelFont]}>MENTORSHIP</Text>
        <View style={styles.levelDisplay}>
          <Text style={[styles.levelText, pixelFont]}>LVL {currentUser.level}</Text>
        </View>
      </LinearGradient>

      {/* Info Banner */}
      {currentUser.level >= 10 && (
        <View style={styles.infoBanner}>
          <Text style={[styles.infoText, pixelFont]}>
            You can become a mentor at level 10! Help others on their journey.
          </Text>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'find' && styles.activeTab]}
          onPress={() => handleTabChange('find')}
        >
          <Text style={[styles.tabText, pixelFont]}>FIND MENTOR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my-mentor' && styles.activeTab]}
          onPress={() => handleTabChange('my-mentor')}
        >
          <Text style={[styles.tabText, pixelFont]}>MY MENTOR</Text>
          {myMentor && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'tips' && styles.activeTab]}
          onPress={() => handleTabChange('tips')}
        >
          <Text style={[styles.tabText, pixelFont]}>TIPS</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {selectedTab === 'find' && (
          <>
            {/* Specialty Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {['all', 'Strength Training', 'Cardio & Endurance', 'Flexibility & Balance'].map(specialty => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterChip,
                    selectedSpecialty === specialty && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text style={[styles.filterText, pixelFont]}>
                    {specialty.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <FlatList
              data={selectedSpecialty === 'all' 
                ? mentors 
                : mentors.filter(m => m.specialty === selectedSpecialty)
              }
              renderItem={renderMentor}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.mentorList}
            />
          </>
        )}
        
        {selectedTab === 'my-mentor' && (
          <>
            {myMentor ? (
              <View style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatAvatar}>{myMentor.avatar}</Text>
                  <View>
                    <Text style={[styles.chatMentorName, pixelFont]}>{myMentor.username}</Text>
                    <Text style={[styles.chatMentorSpecialty, pixelFont]}>{myMentor.specialty}</Text>
                  </View>
                </View>
                
                <FlatList
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={item => item.id}
                  style={styles.messageList}
                  contentContainerStyle={styles.messageContent}
                  inverted
                />
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.messageInput, pixelFont]}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Ask your mentor..."
                    placeholderTextColor={COLORS.gray}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                  >
                    <Text style={styles.sendIcon}>📤</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎓</Text>
                <Text style={[styles.emptyTitle, pixelFont]}>NO MENTOR YET</Text>
                <Text style={[styles.emptyText, pixelFont]}>
                  Find a mentor to guide you on your fitness journey!
                </Text>
                <TouchableOpacity
                  style={styles.findButton}
                  onPress={() => handleTabChange('find')}
                >
                  <Text style={[styles.findButtonText, pixelFont]}>FIND MENTOR</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        {selectedTab === 'tips' && (
          <FlatList
            data={MOCK_TIPS}
            renderItem={renderTipCategory}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tipsList}
          />
        )}
      </Animated.View>
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

  levelDisplay: {
    width: 80,
    alignItems: 'flex-end',
  },

  levelText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 1,
  },

  infoBanner: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  infoText: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },

  activeTab: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  tabText: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  activeDot: {
    position: 'absolute',
    top: 8,
    right: '40%',
    width: 6,
    height: 6,
    backgroundColor: COLORS.yellow,
    borderRadius: 3,
  },

  content: {
    flex: 1,
  },

  filterScroll: {
    padding: 16,
    maxHeight: 60,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },

  activeFilter: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  filterText: {
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  mentorList: {
    padding: 16,
    paddingTop: 0,
  },

  mentorCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 12,
  },

  mentorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  mentorAvatar: {
    position: 'relative',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 40,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  busyIndicator: {
    backgroundColor: COLORS.yellow,
  },

  mentorInfo: {
    flex: 1,
  },

  mentorName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },

  mentorRole: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  mentorSpecialty: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  mentorStats: {
    gap: 8,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statIcon: {
    fontSize: 14,
  },

  statValue: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  mentorBio: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    lineHeight: 16,
    marginBottom: 12,
    opacity: 0.9,
  },

  requestButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 10,
    alignItems: 'center',
  },

  requestButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  chatContainer: {
    flex: 1,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  chatAvatar: {
    fontSize: 32,
    marginRight: 12,
  },

  chatMentorName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },

  chatMentorSpecialty: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  messageList: {
    flex: 1,
    padding: 16,
  },

  messageContent: {
    flexDirection: 'column-reverse',
  },

  message: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },

  myMessage: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    alignSelf: 'flex-end',
  },

  messageSender: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  messageText: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  messageTime: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
    marginTop: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    gap: 12,
  },

  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 12,
    color: COLORS.white,
    fontSize: 10,
    maxHeight: 80,
  },

  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendIcon: {
    fontSize: 20,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },

  findButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },

  findButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  tipsList: {
    padding: 16,
  },

  tipCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 12,
  },

  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  tipTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  tipContent: {
    gap: 8,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  tipBullet: {
    fontSize: 12,
    color: COLORS.yellow,
    marginRight: 8,
  },

  tipText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
});

export default MentorshipSystem;