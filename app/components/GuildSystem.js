/**
 * Guild System Component
 * Team-based social features with chat and collaborative goals
 * Following MetaSystemsAgent design patterns
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import CharacterPreview from './CharacterPreview';

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  orange: '#f39c12',
  green: '#27ae60',
  gray: '#666',
  online: '#4CAF50',
  offline: '#757575',
};

// Guild roles
const GUILD_ROLES = {
  leader: { icon: '👑', color: COLORS.yellow, permissions: ['kick', 'invite', 'edit', 'goals'] },
  officer: { icon: '⭐', color: COLORS.blue, permissions: ['invite', 'goals'] },
  member: { icon: '⚔️', color: COLORS.primary, permissions: [] },
};

// Guild goals/challenges
const GUILD_GOALS = [
  {
    id: 'g1',
    title: 'TEAM WORKOUT',
    description: '100 total workouts this week',
    type: 'weekly',
    target: 100,
    current: 67,
    reward: { xp: 500, coins: 200, guildXP: 1000 },
    icon: '💪',
  },
  {
    id: 'g2',
    title: 'STREAK MASTERS',
    description: 'All members maintain 3-day streak',
    type: 'daily',
    target: 10, // 10 members
    current: 7,
    reward: { xp: 300, coins: 100, guildXP: 500 },
    icon: '🔥',
  },
  {
    id: 'g3',
    title: 'BOSS HUNTERS',
    description: 'Defeat 50 bosses together',
    type: 'monthly',
    target: 50,
    current: 23,
    reward: { xp: 1000, coins: 500, guildXP: 2000, item: 'Guild Banner' },
    icon: '🎯',
  },
];

// Mock guild data
const createMockGuild = () => ({
  id: 'guild_001',
  name: 'FITNESS WARRIORS',
  emoji: '⚔️',
  level: 5,
  xp: 2500,
  xpToNext: 5000,
  memberCount: 10,
  maxMembers: 20,
  description: 'Train hard, fight harder!',
  joinCode: 'FIT2024',
  created: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  stats: {
    totalWorkouts: 450,
    totalBattles: 230,
    weeklyActivity: 85, // percentage
  },
});

const createMockMember = (id, name, role = 'member') => ({
  id,
  username: name,
  role,
  level: 10 + Math.floor(Math.random() * 20),
  joinedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
  status: Math.random() > 0.3 ? 'online' : 'offline',
  lastActive: Date.now() - Math.floor(Math.random() * 3600000),
  contribution: Math.floor(Math.random() * 100),
  appearance: {
    body: 'body_default',
    hair: 'hair_default',
    outfit: 'outfit_default',
    accessories: 'gear_none',
    effects: 'effect_none',
  },
});

const GuildSystem = ({
  currentUser = { id: 'user_1', username: 'YOU', role: 'member' },
  guild = null,
  onNavigate = () => {},
  onCreateGuild = () => {},
  onJoinGuild = () => {},
  onLeaveGuild = () => {},
  onSendMessage = () => {},
  onKickMember = () => {},
  onPromoteMember = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, chat, goals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [guildData, setGuildData] = useState(guild || (guild === null ? null : createMockGuild()));
  const [members, setMembers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (guildData) {
      // Generate mock members
      const mockMembers = [
        createMockMember('user_1', 'YOU', 'member'),
        createMockMember('user_2', 'NINJA_MASTER', 'leader'),
        createMockMember('user_3', 'FIT_WARRIOR', 'officer'),
        ...Array(7).fill(0).map((_, i) => 
          createMockMember(`user_${i + 4}`, `MEMBER_${i + 1}`)
        ),
      ];
      setMembers(mockMembers);
      
      // Generate mock chat
      setChatMessages([
        { id: 1, userId: 'user_2', username: 'NINJA_MASTER', message: 'Great workout today team!', timestamp: Date.now() - 3600000 },
        { id: 2, userId: 'user_3', username: 'FIT_WARRIOR', message: "Let's hit our weekly goal! 💪", timestamp: Date.now() - 1800000 },
        { id: 3, userId: 'user_1', username: 'YOU', message: 'Just finished my cardio!', timestamp: Date.now() - 900000 },
        { id: 4, userId: 'user_5', username: 'MEMBER_2', message: 'Boss battle anyone?', timestamp: Date.now() - 300000 },
      ]);
    }
    
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
  }, [guildData]);

  const handleTabChange = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMessage = {
      id: chatMessages.length + 1,
      userId: currentUser.id,
      username: currentUser.username,
      message: messageText,
      timestamp: Date.now(),
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
    onSendMessage(newMessage);
  };

  const handleMemberAction = (member, action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (action) {
      case 'kick':
        Alert.alert(
          'Kick Member',
          `Remove ${member.username} from the guild?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Kick', 
              style: 'destructive',
              onPress: () => onKickMember(member.id),
            },
          ]
        );
        break;
      case 'promote':
        Alert.alert(
          'Promote Member',
          `Promote ${member.username} to Officer?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Promote', 
              onPress: () => onPromoteMember(member.id),
            },
          ]
        );
        break;
      case 'view':
        setSelectedMember(member);
        break;
    }
  };

  const renderNoGuildView = () => (
    <View style={styles.noGuildContainer}>
      <Text style={styles.noGuildIcon}>⚔️</Text>
      <Text style={[styles.noGuildTitle, pixelFont]}>NO GUILD</Text>
      <Text style={[styles.noGuildText, pixelFont]}>
        Join a guild to team up with other players!
      </Text>
      
      <TouchableOpacity
        style={styles.createGuildButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={[styles.buttonText, pixelFont]}>CREATE GUILD</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.joinGuildButton}
        onPress={() => setShowJoinModal(true)}
      >
        <Text style={[styles.buttonText, pixelFont]}>JOIN GUILD</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Guild Header */}
      <View style={styles.guildHeader}>
        <Text style={styles.guildEmoji}>{guildData.emoji}</Text>
        <View style={styles.guildInfo}>
          <Text style={[styles.guildName, pixelFont]}>{guildData.name}</Text>
          <Text style={[styles.guildLevel, pixelFont]}>LEVEL {guildData.level}</Text>
          <View style={styles.xpBar}>
            <View 
              style={[
                styles.xpFill, 
                { width: `${(guildData.xp / guildData.xpToNext) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.xpText, pixelFont]}>
            {guildData.xp}/{guildData.xpToNext} XP
          </Text>
        </View>
      </View>
      
      {/* Guild Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={[styles.statValue, pixelFont]}>
            {guildData.memberCount}/{guildData.maxMembers}
          </Text>
          <Text style={[styles.statLabel, pixelFont]}>MEMBERS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💪</Text>
          <Text style={[styles.statValue, pixelFont]}>{guildData.stats.totalWorkouts}</Text>
          <Text style={[styles.statLabel, pixelFont]}>WORKOUTS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⚔️</Text>
          <Text style={[styles.statValue, pixelFont]}>{guildData.stats.totalBattles}</Text>
          <Text style={[styles.statLabel, pixelFont]}>BATTLES</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={[styles.statValue, pixelFont]}>{guildData.stats.weeklyActivity}%</Text>
          <Text style={[styles.statLabel, pixelFont]}>ACTIVITY</Text>
        </View>
      </View>
      
      {/* Guild Description */}
      <View style={styles.descriptionCard}>
        <Text style={[styles.descriptionTitle, pixelFont]}>ABOUT</Text>
        <Text style={[styles.descriptionText, pixelFont]}>{guildData.description}</Text>
        <View style={styles.joinCodeContainer}>
          <Text style={[styles.joinCodeLabel, pixelFont]}>JOIN CODE:</Text>
          <Text style={[styles.joinCode, pixelFont]}>{guildData.joinCode}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={[styles.copyText, pixelFont]}>COPY</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleTabChange('chat')}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionText, pixelFont]}>CHAT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleTabChange('goals')}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={[styles.actionText, pixelFont]}>GOALS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.leaveButton]}
          onPress={() => {
            Alert.alert(
              'Leave Guild',
              'Are you sure you want to leave this guild?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: onLeaveGuild },
              ]
            );
          }}
        >
          <Text style={styles.actionIcon}>🚪</Text>
          <Text style={[styles.actionText, pixelFont]}>LEAVE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMembersTab = () => (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      style={styles.tabContent}
      renderItem={({ item: member }) => {
        const role = GUILD_ROLES[member.role];
        const isOnline = member.status === 'online';
        const canManage = currentUser.role === 'leader' || 
                         (currentUser.role === 'officer' && member.role === 'member');
        
        return (
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => handleMemberAction(member, 'view')}
            onLongPress={() => canManage && handleMemberAction(member, 'kick')}
          >
            <Animated.View 
              style={[
                styles.onlineIndicator,
                { 
                  backgroundColor: isOnline ? COLORS.online : COLORS.offline,
                  transform: isOnline ? [{ scale: pulseAnim }] : [],
                }
              ]} 
            />
            
            <CharacterPreview
              appearance={member.appearance}
              size={50}
              animated={false}
            />
            
            <View style={styles.memberInfo}>
              <View style={styles.memberHeader}>
                <Text style={[styles.memberName, pixelFont]}>{member.username}</Text>
                <Text style={[styles.roleIcon]}>{role.icon}</Text>
              </View>
              <Text style={[styles.memberLevel, pixelFont]}>
                LV.{member.level} • {member.contribution} pts
              </Text>
              <Text style={[styles.memberStatus, pixelFont]}>
                {isOnline ? 'Online' : `Last seen ${getTimeAgo(member.lastActive)}`}
              </Text>
            </View>
            
            {canManage && member.id !== currentUser.id && (
              <TouchableOpacity
                style={styles.memberActionButton}
                onPress={() => handleMemberAction(member, member.role === 'member' ? 'promote' : 'kick')}
              >
                <Text style={styles.memberActionIcon}>
                  {member.role === 'member' ? '⬆️' : '❌'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );

  const renderChatTab = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={chatMessages}
        keyExtractor={(item) => item.id.toString()}
        style={styles.chatMessages}
        renderItem={({ item: message }) => (
          <View 
            style={[
              styles.messageRow,
              message.userId === currentUser.id && styles.myMessageRow,
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.userId === currentUser.id && styles.myMessageBubble,
            ]}>
              {message.userId !== currentUser.id && (
                <Text style={[styles.messageUsername, pixelFont]}>
                  {message.username}
                </Text>
              )}
              <Text style={[styles.messageText, pixelFont]}>
                {message.message}
              </Text>
              <Text style={[styles.messageTime, pixelFont]}>
                {getTimeAgo(message.timestamp)}
              </Text>
            </View>
          </View>
        )}
      />
      
      <View style={styles.chatInput}>
        <TextInput
          style={[styles.messageInput, pixelFont]}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.gray}
          value={messageText}
          onChangeText={setMessageText}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          maxLength={100}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={[styles.sendButtonText, pixelFont]}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderGoalsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.goalsTitle, pixelFont]}>GUILD CHALLENGES</Text>
      
      {GUILD_GOALS.map(goal => {
        const progress = goal.current / goal.target;
        const isComplete = progress >= 1;
        
        return (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, pixelFont]}>{goal.title}</Text>
                <Text style={[styles.goalDescription, pixelFont]}>
                  {goal.description}
                </Text>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: goal.type === 'daily' ? COLORS.yellow : COLORS.blue }]}>
                <Text style={[styles.goalBadgeText, pixelFont]}>
                  {goal.type.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.goalProgress}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { 
                      width: `${progress * 100}%`,
                      backgroundColor: isComplete ? COLORS.green : COLORS.primary,
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, pixelFont]}>
                {goal.current}/{goal.target}
              </Text>
            </View>
            
            <View style={styles.goalRewards}>
              <Text style={[styles.rewardLabel, pixelFont]}>REWARDS:</Text>
              <View style={styles.rewardItems}>
                <Text style={[styles.rewardItem, pixelFont]}>⭐ {goal.reward.xp}</Text>
                <Text style={[styles.rewardItem, pixelFont]}>🪙 {goal.reward.coins}</Text>
                <Text style={[styles.rewardItem, pixelFont]}>🏆 {goal.reward.guildXP}</Text>
                {goal.reward.item && (
                  <Text style={[styles.rewardItem, pixelFont]}>🎁 {goal.reward.item}</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
      
      <View style={styles.contributionCard}>
        <Text style={[styles.contributionTitle, pixelFont]}>YOUR CONTRIBUTION</Text>
        <View style={styles.contributionStats}>
          <View style={styles.contributionStat}>
            <Text style={styles.contributionIcon}>💪</Text>
            <Text style={[styles.contributionValue, pixelFont]}>12</Text>
            <Text style={[styles.contributionLabel, pixelFont]}>WORKOUTS</Text>
          </View>
          <View style={styles.contributionStat}>
            <Text style={styles.contributionIcon}>⚔️</Text>
            <Text style={[styles.contributionValue, pixelFont]}>5</Text>
            <Text style={[styles.contributionLabel, pixelFont]}>BATTLES</Text>
          </View>
          <View style={styles.contributionStat}>
            <Text style={styles.contributionIcon}>🏆</Text>
            <Text style={[styles.contributionValue, pixelFont]}>85</Text>
            <Text style={[styles.contributionLabel, pixelFont]}>POINTS</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const getTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

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
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>GUILD</Text>
        <View style={styles.headerSpace} />
      </View>

      {!guildData ? (
        renderNoGuildView()
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabBar}>
            {['overview', 'members', 'chat', 'goals'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={[styles.tabText, pixelFont]}>
                  {tab.toUpperCase()}
                </Text>
                {tab === 'chat' && chatMessages.length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={[styles.tabBadgeText, pixelFont]}>
                      {chatMessages.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'goals' && renderGoalsTab()}
          </Animated.View>
        </>
      )}

      {/* Create Guild Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, pixelFont]}>CREATE GUILD</Text>
            {/* Guild creation form would go here */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={[styles.modalCloseText, pixelFont]}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Guild Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, pixelFont]}>JOIN GUILD</Text>
            {/* Guild join form would go here */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowJoinModal(false)}
            >
              <Text style={[styles.modalCloseText, pixelFont]}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  noGuildContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  noGuildIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  noGuildTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 10,
  },

  noGuildText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },

  createGuildButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    marginBottom: 16,
  },

  joinGuildButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  buttonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.dark,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
  },

  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },

  tabActive: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },

  tabText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  tabBadge: {
    position: 'absolute',
    top: 8,
    right: 20,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  tabBadgeText: {
    fontSize: 8,
    color: '#fff',
  },

  content: {
    flex: 1,
  },

  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  guildHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    marginBottom: 16,
  },

  guildEmoji: {
    fontSize: 48,
    marginRight: 16,
  },

  guildInfo: {
    flex: 1,
  },

  guildName: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  guildLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  xpBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  xpFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  xpText: {
    fontSize: 8,
    color: COLORS.gray,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    padding: 12,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
  },

  descriptionCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    marginBottom: 16,
  },

  descriptionTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 8,
  },

  descriptionText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    lineHeight: 16,
    marginBottom: 12,
  },

  joinCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 6,
    padding: 8,
  },

  joinCodeLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginRight: 8,
  },

  joinCode: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    flex: 1,
  },

  copyButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },

  copyText: {
    fontSize: 8,
    color: '#fff',
  },

  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },

  leaveButton: {
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    borderColor: COLORS.red,
  },

  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  actionText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },

  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },

  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  memberName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginRight: 6,
  },

  roleIcon: {
    fontSize: 16,
  },

  memberLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  memberStatus: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
  },

  memberActionButton: {
    padding: 8,
  },

  memberActionIcon: {
    fontSize: 20,
  },

  chatContainer: {
    flex: 1,
  },

  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },

  myMessageRow: {
    alignItems: 'flex-end',
  },

  messageBubble: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.dark,
    padding: 12,
    maxWidth: '80%',
  },

  myMessageBubble: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderColor: COLORS.primary,
  },

  messageUsername: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  messageText: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  messageTime: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
    marginTop: 4,
  },

  chatInput: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 2,
    borderTopColor: COLORS.dark,
  },

  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginRight: 10,
  },

  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  goalsTitle: {
    fontSize: 16,
    color: COLORS.yellow,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },

  goalCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    marginBottom: 16,
  },

  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  goalIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  goalInfo: {
    flex: 1,
  },

  goalTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  goalDescription: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  goalBadgeText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  goalProgress: {
    marginBottom: 12,
  },

  progressBar: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  progressText: {
    position: 'absolute',
    right: 8,
    top: 3,
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  goalRewards: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rewardLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginRight: 12,
  },

  rewardItems: {
    flexDirection: 'row',
    gap: 12,
  },

  rewardItem: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  contributionCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 20,
  },

  contributionTitle: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },

  contributionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  contributionStat: {
    alignItems: 'center',
  },

  contributionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  contributionValue: {
    fontSize: 18,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 2,
  },

  contributionLabel: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },

  modalTitle: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalCloseButton: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  modalCloseText: {
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
});

export default GuildSystem;