/**
 * Settings Screen
 * GameBoy-style settings interface
 * Following MetaSystemsAgent patterns for user control
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// TODO: Install @react-native-community/slider
// import Slider from '@react-native-community/slider';
// Using a placeholder for now
const Slider = ({ style, minimumValue, maximumValue, value, onSlidingComplete, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor }) => {
  return <View style={[{ height: 40, backgroundColor: 'rgba(146, 204, 65, 0.2)', borderRadius: 20 }, style]} />;
};
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SettingsManager from '../services/SettingsManager';
import SoundFXManager from '../services/SoundFXManager';
import NotificationQueue from '../services/NotificationQueue';
import ScreenEntranceAnimation, { ENTRANCE_TYPES } from '../components/ScreenEntranceAnimation';
import TutorialReplayButton from '../components/TutorialReplayButton';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

// Settings categories
const CATEGORIES = [
  { id: 'sound', label: 'SOUND', icon: '🔊' },
  { id: 'haptics', label: 'HAPTICS', icon: '📳' },
  { id: 'notifications', label: 'ALERTS', icon: '🔔' },
  { id: 'display', label: 'DISPLAY', icon: '🖥️' },
  { id: 'gameplay', label: 'GAMEPLAY', icon: '🎮' },
  { id: 'privacy', label: 'PRIVACY', icon: '🔒' },
  { id: 'account', label: 'ACCOUNT', icon: '👤' },
];

const SettingsScreen = ({ onNavigate = () => {} }) => {
  const [selectedCategory, setSelectedCategory] = useState('sound');
  const [settings, setSettings] = useState(SettingsManager.getAll());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Load current settings
    loadSettings();
    
    // Add listener for setting changes
    SettingsManager.addListener('settings-screen', handleSettingChange);
    
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
      SettingsManager.removeListener('settings-screen');
    };
  }, []);

  const loadSettings = async () => {
    const currentSettings = SettingsManager.getAll();
    setSettings(currentSettings);
  };

  const handleSettingChange = (path, value, oldValue) => {
    // Update local state when settings change
    loadSettings();
  };

  const handleCategorySelect = async (categoryId) => {
    await SoundFXManager.playSound('ui_tab_switch');
    if (SettingsManager.shouldUseHaptics('button')) {
      Haptics.selectionAsync();
    }
    setSelectedCategory(categoryId);
  };

  const handleToggle = async (path, currentValue) => {
    const newValue = !currentValue;
    await SettingsManager.set(path, newValue);
    setUnsavedChanges(true);
    
    // Update notification queue settings if needed
    if (path.startsWith('notifications.')) {
      const notificationSettings = {
        enableCoachTips: SettingsManager.get('notifications.coachTips', true),
        enableAchievements: SettingsManager.get('notifications.achievementAlerts', true),
        enableDailyBonus: SettingsManager.get('notifications.dailyBonus', true),
        enableNetworkAlerts: SettingsManager.get('notifications.networkAlerts', true),
        notificationDuration: SettingsManager.get('notifications.duration', 3000),
      };
      await NotificationQueue.updateSettings(notificationSettings);
    }
    
    if (SettingsManager.shouldPlaySound('ui')) {
      await SoundFXManager.playSound('ui_toggle');
    }
    if (SettingsManager.shouldUseHaptics('button')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSliderChange = async (path, value) => {
    await SettingsManager.set(path, value);
    setUnsavedChanges(true);
  };

  const handleResetCategory = () => {
    Alert.alert(
      'RESET SETTINGS',
      `Reset all ${selectedCategory.toUpperCase()} settings to defaults?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'RESET',
          style: 'destructive',
          onPress: async () => {
            await SettingsManager.reset(selectedCategory);
            await SoundFXManager.playSound('ui_success');
            loadSettings();
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'RESET ALL SETTINGS',
      'This will reset ALL settings to their default values. Are you sure?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'RESET ALL',
          style: 'destructive',
          onPress: async () => {
            await SettingsManager.reset();
            await SoundFXManager.playSound('ui_success');
            loadSettings();
          },
        },
      ]
    );
  };

  const renderSoundSettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>MASTER CONTROLS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Sound Enabled</Text>
          <Switch
            value={settings.sound.enabled}
            onValueChange={(value) => handleToggle('sound.enabled', settings.sound.enabled)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Master Volume</Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderValue, pixelFont]}>
              {Math.round(settings.sound.masterVolume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.sound.masterVolume}
              onSlidingComplete={(value) => handleSliderChange('sound.masterVolume', value)}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.gray}
              thumbTintColor={COLORS.yellow}
            />
          </View>
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>SOUND CATEGORIES</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>UI Sounds</Text>
          <Switch
            value={settings.sound.uiSounds}
            onValueChange={(value) => handleToggle('sound.uiSounds', settings.sound.uiSounds)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Battle Sounds</Text>
          <Switch
            value={settings.sound.battleSounds}
            onValueChange={(value) => handleToggle('sound.battleSounds', settings.sound.battleSounds)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Achievement Sounds</Text>
          <Switch
            value={settings.sound.achievementSounds}
            onValueChange={(value) => handleToggle('sound.achievementSounds', settings.sound.achievementSounds)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={() => SoundFXManager.playSound('ui_success')}>
        <Text style={[styles.testButtonText, pixelFont]}>TEST SOUND</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHapticsSettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>VIBRATION CONTROLS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Haptics Enabled</Text>
          <Switch
            value={settings.haptics.enabled}
            onValueChange={(value) => handleToggle('haptics.enabled', settings.haptics.enabled)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Button Feedback</Text>
          <Switch
            value={settings.haptics.buttonFeedback}
            onValueChange={(value) => handleToggle('haptics.buttonFeedback', settings.haptics.buttonFeedback)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Combat Feedback</Text>
          <Switch
            value={settings.haptics.combatFeedback}
            onValueChange={(value) => handleToggle('haptics.combatFeedback', settings.haptics.combatFeedback)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Achievement Feedback</Text>
          <Switch
            value={settings.haptics.achievementFeedback}
            onValueChange={(value) => handleToggle('haptics.achievementFeedback', settings.haptics.achievementFeedback)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
      >
        <Text style={[styles.testButtonText, pixelFont]}>TEST HAPTICS</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>IN-APP NOTIFICATIONS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Coach Tips</Text>
          <Switch
            value={settings.notifications.coachTips ?? true}
            onValueChange={(value) => handleToggle('notifications.coachTips', settings.notifications.coachTips ?? true)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Achievement Popups</Text>
          <Switch
            value={settings.notifications.achievementAlerts}
            onValueChange={(value) => handleToggle('notifications.achievementAlerts', settings.notifications.achievementAlerts)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Daily Bonus Popup</Text>
          <Switch
            value={settings.notifications.dailyBonus ?? true}
            onValueChange={(value) => handleToggle('notifications.dailyBonus', settings.notifications.dailyBonus ?? true)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Network Alerts</Text>
          <Switch
            value={settings.notifications.networkAlerts ?? true}
            onValueChange={(value) => handleToggle('notifications.networkAlerts', settings.notifications.networkAlerts ?? true)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Notification Duration</Text>
          <Text style={[styles.settingValue, pixelFont]}>
            {(settings.notifications.duration || 3000) / 1000}s
          </Text>
        </View>
      </View>
      
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>REMINDER SETTINGS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Daily Reminders</Text>
          <Switch
            value={settings.notifications.dailyReminders}
            onValueChange={(value) => handleToggle('notifications.dailyReminders', settings.notifications.dailyReminders)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Streak Reminders</Text>
          <Switch
            value={settings.notifications.streakReminders}
            onValueChange={(value) => handleToggle('notifications.streakReminders', settings.notifications.streakReminders)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderDisplaySettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>VISUAL PREFERENCES</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Animations</Text>
          <Switch
            value={settings.display.animations}
            onValueChange={(value) => handleToggle('display.animations', settings.display.animations)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Screen Shake</Text>
          <Switch
            value={settings.display.screenShake}
            onValueChange={(value) => handleToggle('display.screenShake', settings.display.screenShake)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Show Tips</Text>
          <Switch
            value={settings.display.showTips}
            onValueChange={(value) => handleToggle('display.showTips', settings.display.showTips)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Damage Numbers</Text>
          <Switch
            value={settings.display.showDamageNumbers}
            onValueChange={(value) => handleToggle('display.showDamageNumbers', settings.display.showDamageNumbers)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderGameplaySettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>GAME OPTIONS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Auto Save</Text>
          <Switch
            value={settings.gameplay.autoSave}
            onValueChange={(value) => handleToggle('gameplay.autoSave', settings.gameplay.autoSave)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Confirm Actions</Text>
          <Switch
            value={settings.gameplay.confirmActions}
            onValueChange={(value) => handleToggle('gameplay.confirmActions', settings.gameplay.confirmActions)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Show Tutorials</Text>
          <Switch
            value={settings.gameplay.showTutorials}
            onValueChange={(value) => handleToggle('gameplay.showTutorials', settings.gameplay.showTutorials)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>PRIVACY OPTIONS</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Public Profile</Text>
          <Switch
            value={settings.privacy.publicProfile}
            onValueChange={(value) => handleToggle('privacy.publicProfile', settings.privacy.publicProfile)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Show on Leaderboard</Text>
          <Switch
            value={settings.privacy.showOnLeaderboard}
            onValueChange={(value) => handleToggle('privacy.showOnLeaderboard', settings.privacy.showOnLeaderboard)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, pixelFont]}>Friend Requests</Text>
          <Switch
            value={settings.privacy.allowFriendRequests}
            onValueChange={(value) => handleToggle('privacy.allowFriendRequests', settings.privacy.allowFriendRequests)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderAccountSettings = () => (
    <View style={styles.settingsContent}>
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>ACCOUNT INFO</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, pixelFont]}>Username</Text>
          <Text style={[styles.infoValue, pixelFont]}>
            {settings.account.username || 'Not Set'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, pixelFont]}>Email</Text>
          <Text style={[styles.infoValue, pixelFont]}>
            {settings.account.email || 'Not Set'}
          </Text>
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>DATA MANAGEMENT</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.actionButtonText, pixelFont]}>EXPORT DATA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.actionButtonText, pixelFont]}>IMPORT DATA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
          <Text style={[styles.actionButtonText, pixelFont]}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.settingGroup}>
        <Text style={[styles.groupTitle, pixelFont]}>HELP & TUTORIALS</Text>
        
        <TutorialReplayButton
          onStartReplay={() => {
            // Navigate back to home and start tutorial
            onNavigate('home');
          }}
          style={{ marginBottom: 12 }}
        />
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.actionButtonText, pixelFont]}>VIEW HELP DOCS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'sound':
        return renderSoundSettings();
      case 'haptics':
        return renderHapticsSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'display':
        return renderDisplaySettings();
      case 'gameplay':
        return renderGameplaySettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'account':
        return renderAccountSettings();
      default:
        return null;
    }
  };

  return (
    <ScreenEntranceAnimation type={ENTRANCE_TYPES.SLIDE_UP}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <Text style={[styles.backText, pixelFont]}>← BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, pixelFont]}>SETTINGS</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetAll}
          >
            <Text style={[styles.resetText, pixelFont]}>RESET</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.activeCategoryTab,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryLabel, pixelFont]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Settings Content */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {renderCategoryContent()}
            
            {/* Category Reset Button */}
            <TouchableOpacity
              style={styles.categoryResetButton}
              onPress={handleResetCategory}
            >
              <Text style={[styles.categoryResetText, pixelFont]}>
                RESET {selectedCategory.toUpperCase()} SETTINGS
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </ScreenEntranceAnimation>
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
    width: 60,
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

  resetButton: {
    width: 60,
    alignItems: 'flex-end',
  },

  resetText: {
    color: COLORS.red,
    fontSize: 10,
  },

  categoryContainer: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  categoryTab: {
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  activeCategoryTab: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderColor: COLORS.primary,
  },

  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  categoryLabel: {
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  contentScroll: {
    flex: 1,
  },

  settingsContent: {
    padding: 20,
  },

  settingGroup: {
    marginBottom: 24,
    backgroundColor: 'rgba(146, 204, 65, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.dark,
    padding: 16,
  },

  groupTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 16,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  settingLabel: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.5,
    flex: 1,
  },

  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  slider: {
    flex: 1,
    height: 40,
  },

  sliderValue: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    width: 40,
    marginRight: 8,
    textAlign: 'right',
  },

  testButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },

  testButtonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(146, 204, 65, 0.2)',
  },

  infoLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  actionButton: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  dangerButton: {
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    borderColor: COLORS.red,
    marginTop: 20,
  },

  actionButtonText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  categoryResetButton: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.red,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  categoryResetText: {
    fontSize: 10,
    color: COLORS.red,
    letterSpacing: 1,
  },
});

export default SettingsScreen;