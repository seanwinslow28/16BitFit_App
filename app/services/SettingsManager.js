/**
 * Settings Manager
 * Centralized settings management with persistence
 * Following MetaSystemsAgent patterns for user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import SoundFXManager from './SoundFXManager';

const STORAGE_KEY = '@16BitFit:settings';

// Default settings
const DEFAULT_SETTINGS = {
  // Sound Settings
  sound: {
    enabled: true,
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    uiSounds: true,
    battleSounds: true,
    achievementSounds: true,
  },
  
  // Haptics Settings
  haptics: {
    enabled: true,
    intensity: 'medium', // light, medium, heavy
    buttonFeedback: true,
    combatFeedback: true,
    achievementFeedback: true,
  },
  
  // Notifications Settings
  notifications: {
    enabled: true,
    dailyReminders: true,
    reminderTime: '09:00',
    achievementAlerts: true,
    socialAlerts: true,
    challengeAlerts: true,
    streakReminders: true,
  },
  
  // Display Settings
  display: {
    theme: 'gameboy', // gameboy, modern, dark
    animations: true,
    reducedMotion: false,
    showTips: true,
    showDamageNumbers: true,
    screenShake: true,
  },
  
  // Gameplay Settings
  gameplay: {
    difficulty: 'normal', // easy, normal, hard
    autoSave: true,
    autoSaveInterval: 5, // minutes
    confirmActions: true,
    showTutorials: true,
    quickActions: false,
  },
  
  // Privacy Settings
  privacy: {
    shareStats: true,
    publicProfile: true,
    showOnLeaderboard: true,
    allowFriendRequests: true,
    dataCollection: true,
  },
  
  // Account Settings
  account: {
    username: '',
    email: '',
    linkedAccounts: {
      google: false,
      apple: false,
      facebook: false,
    },
    backupEnabled: true,
    lastBackup: null,
  },
};

class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = new Map();
    this.initialized = false;
  }

  /**
   * Initialize settings from storage
   */
  async initialize() {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed);
      }
      
      // Apply settings
      await this.applySettings();
      this.initialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      return false;
    }
  }

  /**
   * Merge saved settings with defaults (to handle new settings in updates)
   */
  mergeSettings(defaults, saved) {
    const merged = { ...defaults };
    
    for (const key in saved) {
      if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        merged[key] = this.mergeSettings(defaults[key] || {}, saved[key]);
      } else {
        merged[key] = saved[key];
      }
    }
    
    return merged;
  }

  /**
   * Get a specific setting value
   */
  get(path) {
    const keys = path.split('.');
    let value = this.settings;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    
    return value;
  }

  /**
   * Set a specific setting value
   */
  async set(path, value) {
    const keys = path.split('.');
    let current = this.settings;
    
    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set the value
    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // Save to storage
    await this.save();
    
    // Apply the setting change
    await this.applySetting(path, value, oldValue);
    
    // Notify listeners
    this.notifyListeners(path, value, oldValue);
  }

  /**
   * Set multiple settings at once
   */
  async setMultiple(settings) {
    for (const [path, value] of Object.entries(settings)) {
      await this.set(path, value);
    }
  }

  /**
   * Reset settings to defaults
   */
  async reset(category = null) {
    if (category) {
      this.settings[category] = { ...DEFAULT_SETTINGS[category] };
    } else {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    
    await this.save();
    await this.applySettings();
    this.notifyListeners('reset', this.settings);
  }

  /**
   * Save settings to storage
   */
  async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Save settings to storage (alias for save)
   */
  async saveSettings() {
    return this.save();
  }

  /**
   * Apply all settings
   */
  async applySettings() {
    // Sound settings
    if (!this.settings.sound.enabled) {
      await SoundFXManager.muteAll();
    } else {
      await SoundFXManager.unmuteAll();
      await SoundFXManager.setMasterVolume(this.settings.sound.masterVolume);
    }
    
    // Haptics settings
    if (!this.settings.haptics.enabled) {
      // Disable haptics globally (would need to be checked before each haptic call)
    }
    
    // Other settings can be applied here
  }

  /**
   * Apply a specific setting change
   */
  async applySetting(path, value, oldValue) {
    const [category, setting] = path.split('.');
    
    switch (category) {
      case 'sound':
        await this.applySoundSetting(setting, value);
        break;
        
      case 'haptics':
        this.applyHapticSetting(setting, value);
        break;
        
      case 'notifications':
        await this.applyNotificationSetting(setting, value);
        break;
        
      case 'display':
        this.applyDisplaySetting(setting, value);
        break;
        
      // Add other categories as needed
    }
  }

  /**
   * Apply sound settings
   */
  async applySoundSetting(setting, value) {
    switch (setting) {
      case 'enabled':
        if (value) {
          await SoundFXManager.unmuteAll();
        } else {
          await SoundFXManager.muteAll();
        }
        break;
        
      case 'masterVolume':
        await SoundFXManager.setMasterVolume(value);
        break;
        
      case 'sfxVolume':
        await SoundFXManager.setCategoryVolume('sfx', value);
        break;
        
      case 'musicVolume':
        await SoundFXManager.setCategoryVolume('music', value);
        break;
    }
  }

  /**
   * Apply haptic settings
   */
  applyHapticSetting(setting, value) {
    // Haptic settings are checked at runtime
    // This could trigger a test haptic
    if (setting === 'enabled' && value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  /**
   * Apply notification settings
   */
  async applyNotificationSetting(setting, value) {
    // Would integrate with notification service
    console.log('Notification setting changed:', setting, value);
  }

  /**
   * Apply display settings
   */
  applyDisplaySetting(setting, value) {
    // Display settings are typically read at render time
    // Could trigger a re-render here if needed
  }

  /**
   * Add a listener for setting changes
   */
  addListener(id, callback) {
    this.listeners.set(id, callback);
  }

  /**
   * Remove a listener
   */
  removeListener(id) {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners of a setting change
   */
  notifyListeners(path, value, oldValue) {
    this.listeners.forEach(callback => {
      try {
        callback(path, value, oldValue);
      } catch (error) {
        console.error('Error in settings listener:', error);
      }
    });
  }

  /**
   * Check if haptics should fire
   */
  shouldUseHaptics(type = 'general') {
    if (!this.settings.haptics.enabled) return false;
    
    switch (type) {
      case 'button':
        return this.settings.haptics.buttonFeedback;
      case 'combat':
        return this.settings.haptics.combatFeedback;
      case 'achievement':
        return this.settings.haptics.achievementFeedback;
      default:
        return true;
    }
  }

  /**
   * Check if sounds should play
   */
  shouldPlaySound(category = 'general') {
    if (!this.settings.sound.enabled) return false;
    
    switch (category) {
      case 'ui':
        return this.settings.sound.uiSounds;
      case 'battle':
        return this.settings.sound.battleSounds;
      case 'achievement':
        return this.settings.sound.achievementSounds;
      default:
        return true;
    }
  }

  /**
   * Get all settings
   */
  getAll() {
    return { ...this.settings };
  }

  /**
   * Export settings as JSON
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = this.mergeSettings(DEFAULT_SETTINGS, imported);
      await this.save();
      await this.applySettings();
      this.notifyListeners('import', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

// Create singleton instance
const settingsManager = new SettingsManager();

export default settingsManager;
export { DEFAULT_SETTINGS };