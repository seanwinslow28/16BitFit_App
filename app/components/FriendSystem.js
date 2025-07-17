/**
 * Friend System Component
 * Manage friends, send messages, and view profiles
 */

import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  gray: '#666',
  online: '#4CAF50',
  offline: '#757575',
};

// Mock friend data structure
const createMockFriend = (id, name, level = 1) => ({
  id,
  username: name,
  displayName: name,
  level,
  evolutionStage: Math.floor(level / 10),
  status: Math.random() > 0.5 ? 'online' : 'offline',
  lastActive: Date.now() - Math.floor(Math.random() * 86400000), // Random time in last 24h
  stats: {
    strength: 50 + Math.floor(Math.random() * 50),
    stamina: 50 + Math.floor(Math.random() * 50),
    health: 50 + Math.floor(Math.random() * 50),
    currentStreak: Math.floor(Math.random() * 30),
  },
  appearance: {
    body: 'body_default',
    hair: 'hair_default',
    outfit: 'outfit_default',
    accessories: 'gear_none',
    effects: 'effect_none',
  },
  mutualWorkouts: Math.floor(Math.random() * 10),
  friendship: {
    level: Math.floor(Math.random() * 5) + 1, // 1-5
    xp: Math.floor(Math.random() * 100),
  },
});

const FriendSystem = ({
  currentUser = {},
  friends = [],
  pendingRequests = [],
  onAddFriend = () => {},
  onAcceptRequest = () => {},
  onDeclineRequest = () => {},
  onSendMessage = () => {},
  onViewProfile = () => {},
  onRemoveFriend = () => {},
  onNavigate = () => {},
}) => {
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate tab transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setActiveTab(tab));
  };

  const handleAddFriend = (username) => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAddFriend(username);
    setSearchQuery('');
    
    Alert.alert(
      'Friend Request Sent!',
      `Request sent to ${username}`,
      [{ text: 'OK' }]
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendMessage(selectedFriend.id, messageText);
    setMessageText('');
    setShowMessageModal(false);
    
    Alert.alert(
      'Message Sent!',
      `Your motivational message was sent to ${selectedFriend.username}`,
      [{ text: 'Great!' }]
    );
  };

  const renderFriendCard = (friend, index) => {
    const isOnline = friend.status === 'online';
    const friendshipLevel = friend.friendship?.level || 1;
    
    return (
      <Animated.View
        key={friend.id}
        style={[
          styles.friendCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [index % 2 === 0 ? -50 : 50, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.friendCardTouchable}
          onPress={() => onViewProfile(friend)}
          onLongPress={() => {
            setSelectedFriend(friend);
            setShowMessageModal(true);
          }}
        >
          {/* Status Indicator */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isOnline ? COLORS.online : COLORS.offline }
          ]} />
          
          {/* Friend Avatar */}
          <View style={styles.avatarContainer}>
            <CharacterPreview
              appearance={friend.appearance}
              evolutionStage={friend.evolutionStage}
              size={60}
              animated={false}
              showEffects={false}
            />
          </View>
          
          {/* Friend Info */}
          <View style={styles.friendInfo}>
            <View style={styles.friendHeader}>
              <Text style={[styles.friendName, pixelFont]}>{friend.username}</Text>
              <View style={styles.friendshipBadge}>
                {'❤️'.repeat(friendshipLevel)}
              </View>
            </View>
            
            <Text style={[styles.friendLevel, pixelFont]}>
              LV.{friend.level} • {friend.stats.currentStreak}🔥
            </Text>
            
            <Text style={[styles.friendStatus, pixelFont]}>
              {isOnline ? 'Online Now' : `Last seen ${getTimeAgo(friend.lastActive)}`}
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedFriend(friend);
                setShowMessageModal(true);
              }}
            >
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onViewProfile(friend)}
            >
              <Text style={styles.actionIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPendingRequest = (request) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestIcon}>📩</Text>
        <View style={styles.requestDetails}>
          <Text style={[styles.requestName, pixelFont]}>{request.username}</Text>
          <Text style={[styles.requestLevel, pixelFont]}>Level {request.level}</Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onAcceptRequest(request.id);
          }}
        >
          <Text style={[styles.requestButtonText, pixelFont]}>✓</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.requestButton, styles.declineButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDeclineRequest(request.id);
          }}
        >
          <Text style={[styles.requestButtonText, pixelFont]}>✗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchTab = () => (
    <View style={styles.searchContainer}>
      <Text style={[styles.searchTitle, pixelFont]}>ADD FRIENDS</Text>
      
      <View style={styles.searchInputContainer}>
        <TextInput
          style={[styles.searchInput, pixelFont]}
          placeholder="Enter username or friend code"
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleAddFriend(searchQuery)}
        >
          <Text style={[styles.searchButtonText, pixelFont]}>ADD</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.friendCodeSection}>
        <Text style={[styles.sectionTitle, pixelFont]}>YOUR FRIEND CODE</Text>
        <View style={styles.friendCodeContainer}>
          <Text style={[styles.friendCode, pixelFont]}>
            {currentUser.friendCode || 'NINJA-1234'}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Copied!', 'Friend code copied to clipboard');
            }}
          >
            <Text style={[styles.copyButtonText, pixelFont]}>COPY</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.suggestionsSection}>
        <Text style={[styles.sectionTitle, pixelFont]}>SUGGESTED FRIENDS</Text>
        {[1, 2, 3].map(i => {
          const mockFriend = createMockFriend(`suggest_${i}`, `Fighter${i}`, 10 + i * 5);
          return renderFriendCard(mockFriend, i);
        })}
      </View>
    </View>
  );

  const getTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>FRIENDS</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => handleTabChange('friends')}
        >
          <Text style={[styles.tabText, pixelFont]}>
            FRIENDS ({friends.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => handleTabChange('requests')}
        >
          <Text style={[styles.tabText, pixelFont]}>
            REQUESTS ({pendingRequests.length})
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={[styles.tabBadgeText, pixelFont]}>
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => handleTabChange('search')}
        >
          <Text style={[styles.tabText, pixelFont]}>ADD</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {activeTab === 'friends' && (
            <View style={styles.friendsList}>
              {friends.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>😢</Text>
                  <Text style={[styles.emptyText, pixelFont]}>
                    No friends yet!
                  </Text>
                  <Text style={[styles.emptySubtext, pixelFont]}>
                    Add friends to compete and motivate each other
                  </Text>
                </View>
              ) : (
                friends.map((friend, index) => renderFriendCard(friend, index))
              )}
            </View>
          )}
          
          {activeTab === 'requests' && (
            <View style={styles.requestsList}>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={[styles.emptyText, pixelFont]}>
                    No pending requests
                  </Text>
                </View>
              ) : (
                pendingRequests.map(request => renderPendingRequest(request))
              )}
            </View>
          )}
          
          {activeTab === 'search' && renderSearchTab()}
        </Animated.View>
      </ScrollView>
      
      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messageModal}>
            <Text style={[styles.modalTitle, pixelFont]}>
              SEND MESSAGE TO {selectedFriend?.username.toUpperCase()}
            </Text>
            
            <View style={styles.quickMessages}>
              {['💪 Keep it up!', '🔥 Great streak!', '👊 Let\'s workout!'].map(msg => (
                <TouchableOpacity
                  key={msg}
                  style={styles.quickMessageButton}
                  onPress={() => setMessageText(msg)}
                >
                  <Text style={[styles.quickMessageText, pixelFont]}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.messageInput, pixelFont]}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.gray}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={100}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowMessageModal(false);
                  setMessageText('');
                }}
              >
                <Text style={[styles.modalButtonText, pixelFont]}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendMessage}
              >
                <Text style={[styles.modalButtonText, pixelFont]}>SEND</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    position: 'relative',
  },

  tabActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
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
    paddingHorizontal: 20,
  },

  friendsList: {
    paddingVertical: 10,
  },

  friendCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    marginBottom: 12,
    overflow: 'hidden',
  },

  friendCardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  avatarContainer: {
    marginRight: 12,
  },

  friendInfo: {
    flex: 1,
  },

  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  friendName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginRight: 8,
  },

  friendshipBadge: {
    flexDirection: 'row',
  },

  friendLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  friendStatus: {
    fontSize: 8,
    color: COLORS.gray,
    letterSpacing: 0.3,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIcon: {
    fontSize: 16,
  },

  requestsList: {
    paddingVertical: 10,
  },

  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
    marginBottom: 12,
  },

  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  requestDetails: {
    gap: 4,
  },

  requestName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  requestLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },

  requestButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  declineButton: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.dark,
  },

  requestButtonText: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: 'bold',
  },

  searchContainer: {
    paddingVertical: 10,
  },

  searchTitle: {
    fontSize: 16,
    color: COLORS.yellow,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },

  searchInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },

  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  searchButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  friendCodeSection: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  friendCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 16,
  },

  friendCode: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  copyButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  copyButtonText: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },

  suggestionsSection: {
    marginTop: 20,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  messageModal: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },

  modalTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 20,
  },

  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  quickMessageButton: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  quickMessageText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  messageInput: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.red,
  },

  sendButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  modalButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default FriendSystem;