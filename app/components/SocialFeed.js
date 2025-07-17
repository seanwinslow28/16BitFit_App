/**
 * Social Feed Component
 * Share achievements and motivate friends
 * Following MetaSystemsAgent patterns for social engagement
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
  Dimensions,
  Image,
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
  gray: '#666',
  white: '#FFFFFF',
};

// Post types
const POST_TYPES = {
  ACHIEVEMENT: 'achievement',
  WORKOUT: 'workout',
  LEVEL_UP: 'level_up',
  EVOLUTION: 'evolution',
  STREAK: 'streak',
  BATTLE_WIN: 'battle_win',
  CUSTOM: 'custom',
};

// Sample feed data
const SAMPLE_FEED = [
  {
    id: '1',
    type: POST_TYPES.ACHIEVEMENT,
    user: { username: 'FitNinja', level: 15, avatar: '🥷' },
    timestamp: Date.now() - 3600000,
    content: 'Just unlocked the "Iron Will" achievement! 💪',
    achievement: { name: 'Iron Will', icon: '🏋️', description: '30 day workout streak!' },
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    type: POST_TYPES.EVOLUTION,
    user: { username: 'GymWarrior', level: 20, avatar: '⚔️' },
    timestamp: Date.now() - 7200000,
    content: 'MY CHARACTER EVOLVED TO CHAMPION! 🎉',
    evolution: { from: 'Fighter', to: 'Champion', icon: '👑' },
    likes: 25,
    comments: 8,
  },
  {
    id: '3',
    type: POST_TYPES.WORKOUT,
    user: { username: 'CardioKing', level: 12, avatar: '🏃' },
    timestamp: Date.now() - 10800000,
    content: 'Crushed my morning run! 5K in 25 minutes 🏃‍♂️',
    workout: { type: 'cardio', duration: 25, stats: '+5 Stamina, +3 Health' },
    likes: 8,
    comments: 2,
  },
];

const SocialFeed = ({
  currentUser = { username: 'Player', level: 1 },
  onNavigate = () => {},
  onViewProfile = () => {},
}) => {
  const [posts, setPosts] = useState(SAMPLE_FEED);
  const [newPostText, setNewPostText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  
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
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await SoundFXManager.playSound('ui_success');
    
    // Simulate loading new posts
    setTimeout(() => {
      // Could add new posts here
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = async (postId) => {
    await SoundFXManager.playSound('feedback_positive');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ));
    } else {
      newLikedPosts.add(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    }
    setLikedPosts(newLikedPosts);
  };

  const handleNewPost = async () => {
    if (!newPostText.trim()) return;
    
    await SoundFXManager.playSound('ui_success');
    
    const newPost = {
      id: Date.now().toString(),
      type: POST_TYPES.CUSTOM,
      user: currentUser,
      timestamp: Date.now(),
      content: newPostText,
      likes: 0,
      comments: 0,
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowNewPost(false);
  };

  const formatTimestamp = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderPost = (post) => {
    const isLiked = likedPosts.has(post.id);
    
    return (
      <Animated.View
        key={post.id}
        style={[
          styles.postCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Post Header */}
        <TouchableOpacity
          style={styles.postHeader}
          onPress={() => onViewProfile(post.user)}
        >
          <Text style={styles.userAvatar}>{post.user.avatar}</Text>
          <View style={styles.userInfo}>
            <Text style={[styles.username, pixelFont]}>{post.user.username}</Text>
            <Text style={[styles.userLevel, pixelFont]}>LVL {post.user.level}</Text>
          </View>
          <Text style={[styles.timestamp, pixelFont]}>{formatTimestamp(post.timestamp)}</Text>
        </TouchableOpacity>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={[styles.contentText, pixelFont]}>{post.content}</Text>
          
          {/* Special content based on post type */}
          {post.type === POST_TYPES.ACHIEVEMENT && post.achievement && (
            <View style={styles.achievementBox}>
              <Text style={styles.achievementIcon}>{post.achievement.icon}</Text>
              <View>
                <Text style={[styles.achievementName, pixelFont]}>{post.achievement.name}</Text>
                <Text style={[styles.achievementDesc, pixelFont]}>{post.achievement.description}</Text>
              </View>
            </View>
          )}
          
          {post.type === POST_TYPES.EVOLUTION && post.evolution && (
            <View style={styles.evolutionBox}>
              <Text style={[styles.evolutionText, pixelFont]}>
                {post.evolution.from} → {post.evolution.to}
              </Text>
              <Text style={styles.evolutionIcon}>{post.evolution.icon}</Text>
            </View>
          )}
          
          {post.type === POST_TYPES.WORKOUT && post.workout && (
            <View style={styles.workoutBox}>
              <Text style={[styles.workoutType, pixelFont]}>
                {post.workout.type.toUpperCase()} - {post.workout.duration} MIN
              </Text>
              <Text style={[styles.workoutStats, pixelFont]}>{post.workout.stats}</Text>
            </View>
          )}
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.actionText, pixelFont]}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Comment on post:', post.id)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={[styles.actionText, pixelFont]}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Share post:', post.id)}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={[styles.actionText, pixelFont]}>SHARE</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
        <Text style={[styles.headerTitle, pixelFont]}>SOCIAL FEED</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setShowNewPost(!showNewPost)}
        >
          <Text style={styles.newPostIcon}>✏️</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* New Post Form */}
      {showNewPost && (
        <View style={styles.newPostForm}>
          <TextInput
            style={[styles.newPostInput, pixelFont]}
            value={newPostText}
            onChangeText={setNewPostText}
            placeholder="Share your fitness journey..."
            placeholderTextColor={COLORS.gray}
            multiline
            maxLength={200}
          />
          <View style={styles.newPostActions}>
            <TouchableOpacity
              style={[styles.postButton, styles.cancelButton]}
              onPress={() => {
                setShowNewPost(false);
                setNewPostText('');
              }}
            >
              <Text style={[styles.postButtonText, pixelFont]}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postButton, styles.shareButton]}
              onPress={handleNewPost}
            >
              <Text style={[styles.postButtonText, pixelFont]}>POST</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Feed */}
      <ScrollView
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {posts.map(post => renderPost(post))}
        
        {/* Load more indicator */}
        <TouchableOpacity style={styles.loadMore}>
          <Text style={[styles.loadMoreText, pixelFont]}>LOAD MORE POSTS</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  newPostButton: {
    width: 80,
    alignItems: 'flex-end',
  },

  newPostIcon: {
    fontSize: 24,
  },

  newPostForm: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    padding: 16,
  },

  newPostInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 12,
    color: COLORS.primary,
    fontSize: 11,
    minHeight: 80,
    marginBottom: 12,
  },

  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 2,
  },

  cancelButton: {
    borderColor: COLORS.gray,
    backgroundColor: 'transparent',
  },

  shareButton: {
    borderColor: COLORS.dark,
    backgroundColor: COLORS.primary,
  },

  postButtonText: {
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.primary,
  },

  feed: {
    flex: 1,
  },

  postCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.05)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(146, 204, 65, 0.2)',
    padding: 16,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },

  userInfo: {
    flex: 1,
  },

  username: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  userLevel: {
    fontSize: 9,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  timestamp: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  postContent: {
    marginBottom: 16,
  },

  contentText: {
    fontSize: 11,
    color: COLORS.white,
    lineHeight: 18,
    letterSpacing: 0.5,
  },

  achievementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 213, 29, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    padding: 12,
    marginTop: 12,
    gap: 12,
  },

  achievementIcon: {
    fontSize: 32,
  },

  achievementName: {
    fontSize: 11,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 2,
  },

  achievementDesc: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    opacity: 0.8,
  },

  evolutionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    marginTop: 12,
    gap: 16,
  },

  evolutionText: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  evolutionIcon: {
    fontSize: 32,
  },

  workoutBox: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.blue,
    padding: 12,
    marginTop: 12,
  },

  workoutType: {
    fontSize: 10,
    color: COLORS.blue,
    letterSpacing: 1,
    marginBottom: 4,
  },

  workoutStats: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    opacity: 0.8,
  },

  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.2)',
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionIcon: {
    fontSize: 20,
  },

  likedIcon: {
    transform: [{ scale: 1.1 }],
  },

  actionText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  loadMore: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadMoreText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    opacity: 0.7,
  },

  bottomSpacer: {
    height: 100,
  },
});

export default SocialFeed;