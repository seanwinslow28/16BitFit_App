/**
 * Sound Effects Manager
 * Comprehensive audio system for battle, UI, and feedback sounds
 * Following MetaSystemsAgent patterns for sensory feedback
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sound categories
const SOUND_CATEGORIES = {
  UI: 'ui',
  BATTLE: 'battle',
  ACHIEVEMENT: 'achievement',
  WORKOUT: 'workout',
  FEEDBACK: 'feedback',
  MUSIC: 'music',
};

// Sound effect mappings (placeholder names - replace with your actual files)
const SOUND_EFFECTS = {
  // UI Sounds
  ui_button_press: { category: SOUND_CATEGORIES.UI, file: 'button_press.mp3', volume: 0.5 },
  ui_menu_open: { category: SOUND_CATEGORIES.UI, file: 'menu_open.mp3', volume: 0.4 },
  ui_menu_close: { category: SOUND_CATEGORIES.UI, file: 'menu_close.mp3', volume: 0.4 },
  ui_tab_switch: { category: SOUND_CATEGORIES.UI, file: 'tab_switch.mp3', volume: 0.3 },
  ui_toggle: { category: SOUND_CATEGORIES.UI, file: 'toggle.mp3', volume: 0.4 },
  ui_error: { category: SOUND_CATEGORIES.UI, file: 'error.mp3', volume: 0.5 },
  ui_success: { category: SOUND_CATEGORIES.UI, file: 'success.mp3', volume: 0.5 },
  ui_notification: { category: SOUND_CATEGORIES.UI, file: 'notification.mp3', volume: 0.6 },
  ui_transition: { category: SOUND_CATEGORIES.UI, file: 'screen_transition.mp3', volume: 0.4 },
  
  // Battle Sounds
  battle_punch_light: { category: SOUND_CATEGORIES.BATTLE, file: 'punch_light.mp3', volume: 0.6 },
  battle_punch_heavy: { category: SOUND_CATEGORIES.BATTLE, file: 'punch_heavy.mp3', volume: 0.7 },
  battle_kick: { category: SOUND_CATEGORIES.BATTLE, file: 'kick.mp3', volume: 0.6 },
  battle_block: { category: SOUND_CATEGORIES.BATTLE, file: 'block.mp3', volume: 0.5 },
  battle_dodge: { category: SOUND_CATEGORIES.BATTLE, file: 'dodge.mp3', volume: 0.4 },
  battle_hit_received: { category: SOUND_CATEGORIES.BATTLE, file: 'hit_received.mp3', volume: 0.6 },
  battle_combo: { category: SOUND_CATEGORIES.BATTLE, file: 'combo.mp3', volume: 0.7 },
  battle_critical_hit: { category: SOUND_CATEGORIES.BATTLE, file: 'critical_hit.mp3', volume: 0.8 },
  battle_ko: { category: SOUND_CATEGORIES.BATTLE, file: 'ko.mp3', volume: 0.9 },
  battle_victory: { category: SOUND_CATEGORIES.BATTLE, file: 'victory.mp3', volume: 0.8 },
  battle_defeat: { category: SOUND_CATEGORIES.BATTLE, file: 'defeat.mp3', volume: 0.7 },
  battle_ready: { category: SOUND_CATEGORIES.BATTLE, file: 'battle_ready.mp3', volume: 0.6 },
  
  // Achievement Sounds
  achievement_unlock: { category: SOUND_CATEGORIES.ACHIEVEMENT, file: 'achievement_unlock.mp3', volume: 0.8 },
  achievement_milestone: { category: SOUND_CATEGORIES.ACHIEVEMENT, file: 'milestone.mp3', volume: 0.9 },
  achievement_level_up: { category: SOUND_CATEGORIES.ACHIEVEMENT, file: 'level_up.mp3', volume: 0.8 },
  achievement_evolution: { category: SOUND_CATEGORIES.ACHIEVEMENT, file: 'evolution.mp3', volume: 1.0 },
  achievement_reward: { category: SOUND_CATEGORIES.ACHIEVEMENT, file: 'reward.mp3', volume: 0.7 },
  
  // Workout Sounds
  workout_start: { category: SOUND_CATEGORIES.WORKOUT, file: 'workout_start.mp3', volume: 0.7 },
  workout_complete: { category: SOUND_CATEGORIES.WORKOUT, file: 'workout_complete.mp3', volume: 0.8 },
  workout_rep_count: { category: SOUND_CATEGORIES.WORKOUT, file: 'rep_count.mp3', volume: 0.5 },
  workout_timer_tick: { category: SOUND_CATEGORIES.WORKOUT, file: 'timer_tick.mp3', volume: 0.3 },
  workout_timer_end: { category: SOUND_CATEGORIES.WORKOUT, file: 'timer_end.mp3', volume: 0.7 },
  
  // Feedback Sounds
  feedback_positive: { category: SOUND_CATEGORIES.FEEDBACK, file: 'positive.mp3', volume: 0.6 },
  feedback_negative: { category: SOUND_CATEGORIES.FEEDBACK, file: 'negative.mp3', volume: 0.6 },
  feedback_coin_collect: { category: SOUND_CATEGORIES.FEEDBACK, file: 'coin_collect.mp3', volume: 0.5 },
  feedback_xp_gain: { category: SOUND_CATEGORIES.FEEDBACK, file: 'xp_gain.mp3', volume: 0.5 },
  feedback_item_equip: { category: SOUND_CATEGORIES.FEEDBACK, file: 'item_equip.mp3', volume: 0.6 },
  feedback_item_unlock: { category: SOUND_CATEGORIES.FEEDBACK, file: 'item_unlock.mp3', volume: 0.7 },
  
  // Background Music
  music_menu: { category: SOUND_CATEGORIES.MUSIC, file: 'menu_theme.mp3', volume: 0.3, loop: true },
  music_battle: { category: SOUND_CATEGORIES.MUSIC, file: 'battle_theme.mp3', volume: 0.4, loop: true },
  music_victory: { category: SOUND_CATEGORIES.MUSIC, file: 'victory_theme.mp3', volume: 0.4, loop: false },
  music_workout: { category: SOUND_CATEGORIES.MUSIC, file: 'workout_theme.mp3', volume: 0.35, loop: true },
  music_achievement: { category: SOUND_CATEGORIES.MUSIC, file: 'achievement_theme.mp3', volume: 0.4, loop: false },
};

class SoundFXManager {
  constructor() {
    this.sounds = {};
    this.currentMusic = null;
    this.settings = {
      sfxEnabled: true,
      musicEnabled: true,
      masterVolume: 1.0,
      sfxVolume: 1.0,
      musicVolume: 0.7,
      hapticEnabled: true,
    };
    this.isInitialized = false;
    this.soundQueue = [];
    this.isPlayingQueue = false;
  }

  /**
   * Initialize sound system
   */
  async initialize() {
    try {
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: Audio.InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
      });

      // Load saved settings
      const savedSettings = await AsyncStorage.getItem('soundSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      // Preload common sounds
      await this.preloadCommonSounds();

      this.isInitialized = true;
      console.log('SoundFXManager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize SoundFXManager:', error);
      return false;
    }
  }

  /**
   * Preload commonly used sounds
   */
  async preloadCommonSounds() {
    const commonSounds = [
      'ui_button_press',
      'ui_success',
      'ui_error',
      'feedback_positive',
      'feedback_coin_collect',
      'achievement_unlock',
    ];

    for (const soundKey of commonSounds) {
      await this.loadSound(soundKey);
    }
  }

  /**
   * Load a sound file
   */
  async loadSound(soundKey) {
    if (this.sounds[soundKey]) {
      return this.sounds[soundKey];
    }

    const soundConfig = SOUND_EFFECTS[soundKey];
    if (!soundConfig) {
      console.warn(`Sound not found: ${soundKey}`);
      return null;
    }

    try {
      // TODO: Replace with actual sound file loading when files are ready
      // For now, create a placeholder sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: `path/to/sounds/${soundConfig.file}` }, // Replace with actual path
        { 
          shouldPlay: false,
          volume: soundConfig.volume * this.settings.sfxVolume * this.settings.masterVolume,
          isLooping: soundConfig.loop || false,
        }
      );

      this.sounds[soundKey] = sound;
      return sound;
    } catch (error) {
      console.warn(`Failed to load sound ${soundKey}:`, error);
      return null;
    }
  }

  /**
   * Play a sound effect
   */
  async playSound(soundKey, options = {}) {
    if (!this.settings.sfxEnabled || !this.isInitialized) return;

    const soundConfig = SOUND_EFFECTS[soundKey];
    if (!soundConfig) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }

    try {
      let sound = this.sounds[soundKey];
      if (!sound) {
        sound = await this.loadSound(soundKey);
        if (!sound) return;
      }

      // Set volume
      const volume = (options.volume || soundConfig.volume) * 
                    this.settings.sfxVolume * 
                    this.settings.masterVolume;
      await sound.setVolumeAsync(volume);

      // Reset to beginning
      await sound.setPositionAsync(0);

      // Play
      await sound.playAsync();

      // Add haptic feedback for certain sounds
      if (this.settings.hapticEnabled && options.haptic !== false) {
        this.triggerHaptic(soundKey);
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundKey}:`, error);
    }
  }

  /**
   * Play background music
   */
  async playMusic(musicKey, fadeIn = true) {
    if (!this.settings.musicEnabled || !this.isInitialized) return;

    const musicConfig = SOUND_EFFECTS[musicKey];
    if (!musicConfig || musicConfig.category !== SOUND_CATEGORIES.MUSIC) {
      console.warn(`Music not found: ${musicKey}`);
      return;
    }

    try {
      // Stop current music
      if (this.currentMusic) {
        await this.stopMusic(fadeIn);
      }

      // Load and play new music
      const music = await this.loadSound(musicKey);
      if (!music) return;

      const volume = musicConfig.volume * this.settings.musicVolume * this.settings.masterVolume;
      
      if (fadeIn) {
        await music.setVolumeAsync(0);
        await music.playAsync();
        
        // Fade in
        let fadeVolume = 0;
        const fadeInterval = setInterval(async () => {
          fadeVolume += 0.05;
          if (fadeVolume >= volume) {
            fadeVolume = volume;
            clearInterval(fadeInterval);
          }
          await music.setVolumeAsync(fadeVolume);
        }, 50);
      } else {
        await music.setVolumeAsync(volume);
        await music.playAsync();
      }

      this.currentMusic = { key: musicKey, sound: music };
    } catch (error) {
      console.error(`Failed to play music ${musicKey}:`, error);
    }
  }

  /**
   * Stop background music
   */
  async stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    try {
      const music = this.currentMusic.sound;
      
      if (fadeOut) {
        const status = await music.getStatusAsync();
        let fadeVolume = status.volume;
        
        const fadeInterval = setInterval(async () => {
          fadeVolume -= 0.05;
          if (fadeVolume <= 0) {
            clearInterval(fadeInterval);
            await music.stopAsync();
          } else {
            await music.setVolumeAsync(fadeVolume);
          }
        }, 50);
      } else {
        await music.stopAsync();
      }
      
      this.currentMusic = null;
    } catch (error) {
      console.error('Failed to stop music:', error);
    }
  }

  /**
   * Play a sequence of sounds
   */
  async playSoundSequence(soundKeys, delay = 100) {
    for (let i = 0; i < soundKeys.length; i++) {
      await this.playSound(soundKeys[i]);
      if (i < soundKeys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * UI Sound Helpers
   */
  async playButtonPress() {
    await this.playSound('ui_button_press');
  }

  async playMenuOpen() {
    await this.playSound('ui_menu_open');
  }

  async playMenuClose() {
    await this.playSound('ui_menu_close');
  }

  async playTabSwitch() {
    await this.playSound('ui_tab_switch');
  }

  async playError() {
    await this.playSound('ui_error', { haptic: true });
  }

  async playSuccess() {
    await this.playSound('ui_success', { haptic: true });
  }

  /**
   * Battle Sound Helpers
   */
  async playPunch(heavy = false) {
    await this.playSound(heavy ? 'battle_punch_heavy' : 'battle_punch_light');
  }

  async playBlock() {
    await this.playSound('battle_block');
  }

  async playHitReceived() {
    await this.playSound('battle_hit_received', { haptic: true });
  }

  async playCombo(comboCount) {
    await this.playSound('battle_combo', { 
      volume: Math.min(0.7 + (comboCount * 0.05), 1.0) 
    });
  }

  async playCriticalHit() {
    await this.playSound('battle_critical_hit', { haptic: true });
  }

  async playKO() {
    await this.playSound('battle_ko', { haptic: true });
  }

  async playVictory() {
    await this.playSound('battle_victory');
  }

  async playDefeat() {
    await this.playSound('battle_defeat');
  }

  /**
   * Achievement Sound Helpers
   */
  async playAchievementUnlock() {
    await this.playSound('achievement_unlock', { haptic: true });
  }

  async playLevelUp() {
    await this.playSound('achievement_level_up', { haptic: true });
  }

  async playEvolution() {
    await this.playSound('achievement_evolution', { haptic: true });
  }

  /**
   * Feedback Sound Helpers
   */
  async playCoinCollect() {
    await this.playSound('feedback_coin_collect');
  }

  async playXPGain() {
    await this.playSound('feedback_xp_gain');
  }

  async playItemEquip() {
    await this.playSound('feedback_item_equip');
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(soundKey) {
    if (!this.settings.hapticEnabled) return;

    const soundConfig = SOUND_EFFECTS[soundKey];
    if (!soundConfig) return;

    // Map sound types to haptic feedback
    switch (soundConfig.category) {
      case SOUND_CATEGORIES.UI:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      
      case SOUND_CATEGORIES.BATTLE:
        if (soundKey.includes('heavy') || soundKey.includes('ko')) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        break;
      
      case SOUND_CATEGORIES.ACHIEVEMENT:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      
      case SOUND_CATEGORIES.FEEDBACK:
        if (soundKey.includes('negative')) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        break;
    }
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Save to storage
    await AsyncStorage.setItem('soundSettings', JSON.stringify(this.settings));
    
    // Apply volume changes to current music
    if (this.currentMusic && this.currentMusic.sound) {
      const musicConfig = SOUND_EFFECTS[this.currentMusic.key];
      const volume = musicConfig.volume * this.settings.musicVolume * this.settings.masterVolume;
      await this.currentMusic.sound.setVolumeAsync(volume);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      // Stop music
      if (this.currentMusic) {
        await this.stopMusic(false);
      }

      // Unload all sounds
      for (const [key, sound] of Object.entries(this.sounds)) {
        await sound.unloadAsync();
      }
      
      this.sounds = {};
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup SoundFXManager:', error);
    }
  }

  /**
   * Mute all sounds
   */
  async muteAll() {
    this.settings.enabled = false;
    await this.saveSettings();
  }

  /**
   * Unmute all sounds
   */
  async unmuteAll() {
    this.settings.enabled = true;
    await this.saveSettings();
  }

  /**
   * Set master volume
   */
  async setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    await this.saveSettings();
    
    // Update volume for all loaded sounds
    for (const sound of Object.values(this.sounds)) {
      if (sound && sound.setVolumeAsync) {
        await sound.setVolumeAsync(this.settings.masterVolume * volume);
      }
    }
  }

  /**
   * Set category volume
   */
  async setCategoryVolume(category, volume) {
    if (this.settings.categoryVolumes[category] !== undefined) {
      this.settings.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
      await this.saveSettings();
    }
  }
}

export default new SoundFXManager();