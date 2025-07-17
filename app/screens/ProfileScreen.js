/**
 * Profile Screen
 * User profile management with cloud sync integration
 * Following MetaSystemsAgent patterns for profile and auth
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import CharacterPreview from '../components/CharacterPreview';
import CloudSyncManager from '../services/CloudSyncManager';
import SupabaseService from '../services/SupabaseService';

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
};

const ProfileScreen = ({
  playerStats = {},
  customizationData = {},
  achievements = [],
  onNavigate = () => {},
  onUpdateProfile = () => {},
  onSignOut = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // signin or signup
  const [syncStatus, setSyncStatus] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const syncRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    
    // Set up sync status listener
    const unsubscribe = CloudSyncManager.onSyncComplete((results) => {
      console.log('Sync completed:', results);
      loadProfile(); // Reload profile after sync
    });

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

    return () => {
      unsubscribe();
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = SupabaseService.getCurrentUser();
      setSyncStatus(CloudSyncManager.getSyncStatus());
      
      if (user && !user.isAnonymous) {
        const { profile } = await CloudSyncManager.getUserProfile(user.id);
        if (profile) {
          setProfile(profile);
          setUsername(profile.username || '');
          setBio(profile.bio || '');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { user, error } = await CloudSyncManager.signUp(email, password, username);
    
    if (error) {
      Alert.alert('Sign Up Failed', error);
    } else {
      Alert.alert('Success!', 'Account created successfully');
      setShowAuthModal(false);
      loadProfile();
    }
    
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { user, error } = await CloudSyncManager.signIn(email, password);
    
    if (error) {
      Alert.alert('Sign In Failed', error);
    } else {
      Alert.alert('Welcome Back!', 'Signed in successfully');
      setShowAuthModal(false);
      loadProfile();
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await CloudSyncManager.signOut();
            if (error) {
              Alert.alert('Error', error);
            } else {
              setProfile(null);
              onSignOut();
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updates = {
      username: username.trim(),
      bio: bio.trim(),
      updated_at: new Date().toISOString(),
    };

    const { profile: updatedProfile, error } = await CloudSyncManager.updateUserProfile(updates);
    
    if (error) {
      Alert.alert('Update Failed', error);
    } else {
      Alert.alert('Success!', 'Profile updated');
      setIsEditing(false);
      loadProfile();
    }
    
    setLoading(false);
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate sync icon
    Animated.loop(
      Animated.timing(syncRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      { iterations: 3 }
    ).start();

    const results = await CloudSyncManager.performSync();
    setSyncStatus(CloudSyncManager.getSyncStatus());
    
    if (results.failed > 0) {
      Alert.alert('Sync Complete', `Synced ${results.success} items, ${results.failed} failed`);
    } else {
      Alert.alert('Sync Complete', 'All data synced successfully!');
    }
  };

  const renderStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>🏆</Text>
        <Text style={[styles.statValue, pixelFont]}>{playerStats.level || 1}</Text>
        <Text style={[styles.statLabel, pixelFont]}>LEVEL</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>🔥</Text>
        <Text style={[styles.statValue, pixelFont]}>{playerStats.streak || 0}</Text>
        <Text style={[styles.statLabel, pixelFont]}>STREAK</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>⭐</Text>
        <Text style={[styles.statValue, pixelFont]}>{achievements.length}</Text>
        <Text style={[styles.statLabel, pixelFont]}>ACHIEVEMENTS</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>💪</Text>
        <Text style={[styles.statValue, pixelFont]}>{playerStats.totalWorkouts || 0}</Text>
        <Text style={[styles.statLabel, pixelFont]}>WORKOUTS</Text>
      </View>
    </View>
  );

  const renderSyncStatus = () => {
    const spin = syncRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.syncStatusCard}>
        <View style={styles.syncHeader}>
          <Text style={[styles.syncTitle, pixelFont]}>CLOUD SYNC</Text>
          <TouchableOpacity onPress={handleSync} disabled={syncStatus.isSyncing}>
            <Animated.Text style={[styles.syncIcon, { transform: [{ rotate: spin }] }]}>
              🔄
            </Animated.Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.syncInfo}>
          <View style={styles.syncRow}>
            <Text style={[styles.syncLabel, pixelFont]}>STATUS:</Text>
            <Text style={[styles.syncValue, pixelFont, { color: syncStatus.isOnline ? COLORS.green : COLORS.red }]}>
              {syncStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
          
          {syncStatus.lastSyncTime && (
            <View style={styles.syncRow}>
              <Text style={[styles.syncLabel, pixelFont]}>LAST SYNC:</Text>
              <Text style={[styles.syncValue, pixelFont]}>
                {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
              </Text>
            </View>
          )}
          
          {syncStatus.pendingItems > 0 && (
            <View style={styles.syncRow}>
              <Text style={[styles.syncLabel, pixelFont]}>PENDING:</Text>
              <Text style={[styles.syncValue, pixelFont, { color: COLORS.yellow }]}>
                {syncStatus.pendingItems} items
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAuthModal = () => (
    <Modal
      visible={showAuthModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAuthModal(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.authModal}>
          <Text style={[styles.modalTitle, pixelFont]}>
            {authMode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Text>
          
          {authMode === 'signup' && (
            <TextInput
              style={[styles.authInput, pixelFont]}
              placeholder="Username"
              placeholderTextColor={COLORS.gray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              maxLength={20}
            />
          )}
          
          <TextInput
            style={[styles.authInput, pixelFont]}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={[styles.authInput, pixelFont]}
            placeholder="Password"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={authMode === 'signin' ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.dark} />
            ) : (
              <Text style={[styles.authButtonText, pixelFont]}>
                {authMode === 'signin' ? 'SIGN IN' : 'SIGN UP'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.authToggle}
            onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
          >
            <Text style={[styles.authToggleText, pixelFont]}>
              {authMode === 'signin' 
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAuthModal(false)}
          >
            <Text style={[styles.modalCloseText, pixelFont]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const isAnonymous = syncStatus.user?.isAnonymous;

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
        <Text style={[styles.headerTitle, pixelFont]}>PROFILE</Text>
        <View style={styles.headerSpace} />
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
          {/* Character Preview */}
          <View style={styles.characterSection}>
            <CharacterPreview
              appearance={customizationData.appearance}
              evolutionStage={playerStats.evolutionStage}
              size={120}
              animated={true}
              showEffects={true}
            />
          </View>

          {/* Profile Info */}
          <View style={styles.profileCard}>
            {isAnonymous ? (
              <View style={styles.anonymousSection}>
                <Text style={styles.anonymousIcon}>👤</Text>
                <Text style={[styles.anonymousTitle, pixelFont]}>GUEST MODE</Text>
                <Text style={[styles.anonymousText, pixelFont]}>
                  Sign in to save your progress to the cloud
                </Text>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => setShowAuthModal(true)}
                >
                  <Text style={[styles.signInButtonText, pixelFont]}>
                    SIGN IN / SIGN UP
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.profileHeader}>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, pixelFont]}>
                      {profile?.username || 'LOADING...'}
                    </Text>
                    <Text style={[styles.profileEmail, pixelFont]}>
                      {syncStatus.user?.email || ''}
                    </Text>
                  </View>
                  {!isEditing && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isEditing ? (
                  <View style={styles.editSection}>
                    <TextInput
                      style={[styles.editInput, pixelFont]}
                      placeholder="Username"
                      placeholderTextColor={COLORS.gray}
                      value={username}
                      onChangeText={setUsername}
                      maxLength={20}
                    />
                    <TextInput
                      style={[styles.editInput, styles.bioInput, pixelFont]}
                      placeholder="Bio"
                      placeholderTextColor={COLORS.gray}
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      maxLength={100}
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={[styles.editActionButton, styles.cancelButton]}
                        onPress={() => {
                          setIsEditing(false);
                          setUsername(profile?.username || '');
                          setBio(profile?.bio || '');
                        }}
                      >
                        <Text style={[styles.editActionText, pixelFont]}>CANCEL</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editActionButton, styles.saveButton]}
                        onPress={handleSaveProfile}
                      >
                        <Text style={[styles.editActionText, pixelFont]}>SAVE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.profileBio, pixelFont]}>
                    {profile?.bio || 'No bio yet'}
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Stats */}
          {renderStats()}

          {/* Sync Status */}
          {!isAnonymous && renderSyncStatus()}

          {/* Sign Out Button */}
          {!isAnonymous && (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={[styles.signOutText, pixelFont]}>SIGN OUT</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer} />
        </Animated.View>
      </ScrollView>

      {/* Auth Modal */}
      {renderAuthModal()}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  characterSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  profileCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 20,
    marginBottom: 20,
  },

  anonymousSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  anonymousIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },

  anonymousTitle: {
    fontSize: 18,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 8,
  },

  anonymousText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  signInButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  editButton: {
    padding: 8,
  },

  editIcon: {
    fontSize: 20,
  },

  profileBio: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    lineHeight: 18,
  },

  editSection: {
    gap: 12,
  },

  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  editActionButton: {
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

  saveButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  editActionText: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    padding: 16,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  syncStatusCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 20,
  },

  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  syncTitle: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  syncIcon: {
    fontSize: 24,
  },

  syncInfo: {
    gap: 8,
  },

  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  syncLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  syncValue: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  signOutButton: {
    backgroundColor: COLORS.red,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    marginBottom: 20,
  },

  signOutText: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  authModal: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },

  modalTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },

  authInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    marginBottom: 16,
  },

  authButtonDisabled: {
    opacity: 0.6,
  },

  authButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  authToggle: {
    alignItems: 'center',
    marginBottom: 16,
  },

  authToggleText: {
    fontSize: 10,
    color: COLORS.blue,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },

  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  modalCloseText: {
    fontSize: 12,
    color: COLORS.red,
    letterSpacing: 1,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    height: 100,
  },
});

export default ProfileScreen;