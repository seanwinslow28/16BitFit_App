/**
 * Audio Service
 * Handles all audio playback and management
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AudioService {
  constructor() {
    this.sounds = new Map();
    this.backgroundMusic = null;
    this.isInitialized = false;
    this.settings = {
      sfxEnabled: true,
      musicEnabled: true,
      sfxVolume: 0.7,
      musicVolume: 0.3,
    };
  }

  // Initialize audio system
  async initialize() {
    try {
      // Set audio mode for the app
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      // Load settings
      await this.loadSettings();

      // Preload essential sounds
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('Audio system initialized');
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }

  // Load audio settings from storage
  async loadSettings() {
    try {
      const storedSettings = await AsyncStorage.getItem('audioSettings');
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  // Save audio settings to storage
  async saveSettings() {
    try {
      await AsyncStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  // Preload essential sound effects
  async preloadSounds() {
    // For now, we'll create placeholder sound objects
    // In a real implementation, these would load actual audio files
    const soundFiles = [
      { key: 'button_press', placeholder: true },
      { key: 'workout_complete', placeholder: true },
      { key: 'meal_healthy', placeholder: true },
      { key: 'meal_junk', placeholder: true },
      { key: 'stat_increase', placeholder: true },
      { key: 'stat_decrease', placeholder: true },
      { key: 'level_up', placeholder: true },
      { key: 'evolution', placeholder: true },
      { key: 'battle_start', placeholder: true },
      { key: 'battle_victory', placeholder: true },
      { key: 'battle_defeat', placeholder: true },
      { key: 'health_sync', placeholder: true },
      { key: 'notification', placeholder: true },
      { key: 'character_happy', placeholder: true },
      { key: 'character_sad', placeholder: true },
    ];

    for (const soundFile of soundFiles) {
      try {
        if (soundFile.placeholder) {
          // Create placeholder sound object
          this.sounds.set(soundFile.key, {
            isLoaded: false,
            isPlaceholder: true,
            sound: null,
          });
        } else {
          // In a real implementation, this would load the actual audio file:
          // const { sound } = await Audio.Sound.createAsync(require(`../assets/Audio/SFX/${soundFile.key}.mp3`));
          // this.sounds.set(soundFile.key, { isLoaded: true, sound });
        }
      } catch (error) {
        console.error(`Failed to preload sound ${soundFile.key}:`, error);
      }
    }
  }

  // Play a sound effect
  async playSFX(soundKey, options = {}) {
    try {
      if (!this.isInitialized || !this.settings.sfxEnabled) {
        return;
      }

      const soundObj = this.sounds.get(soundKey);
      if (!soundObj) {
        console.warn(`Sound ${soundKey} not found`);
        return;
      }

      if (soundObj.isPlaceholder) {
        // For placeholder sounds, just log the action
        console.log(`🔊 Playing SFX: ${soundKey}`);
        return;
      }

      // Play the actual sound
      const { sound } = soundObj;
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(this.settings.sfxVolume * (options.volume || 1));
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundKey}:`, error);
    }
  }

  // Play background music
  async playBackgroundMusic(musicKey = 'background_music') {
    try {
      if (!this.isInitialized || !this.settings.musicEnabled) {
        return;
      }

      // Stop current music if playing
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }

      // For now, create a placeholder
      console.log(`🎵 Playing background music: ${musicKey}`);
      
      // In a real implementation, this would load and play the music:
      // const { sound } = await Audio.Sound.createAsync(
      //   require(`../assets/Audio/Music/${musicKey}.mp3`),
      //   {
      //     shouldPlay: true,
      //     isLooping: true,
      //     volume: this.settings.musicVolume,
      //   }
      // );
      // this.backgroundMusic = sound;
      
      this.backgroundMusic = { isPlaceholder: true, musicKey };
    } catch (error) {
      console.error(`Failed to play background music ${musicKey}:`, error);
    }
  }

  // Stop background music
  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic && !this.backgroundMusic.isPlaceholder) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }
      this.backgroundMusic = null;
      console.log('🎵 Background music stopped');
    } catch (error) {
      console.error('Failed to stop background music:', error);
    }
  }

  // Update audio settings
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // Update background music volume if playing
    if (this.backgroundMusic && !this.backgroundMusic.isPlaceholder) {
      await this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
    }
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Action-specific sound effects
  async playButtonPress() {
    await this.playSFX('button_press');
  }

  async playWorkoutComplete() {
    await this.playSFX('workout_complete');
  }

  async playMealLogged(isHealthy) {
    await this.playSFX(isHealthy ? 'meal_healthy' : 'meal_junk');
  }

  async playStatChange(isIncrease) {
    await this.playSFX(isIncrease ? 'stat_increase' : 'stat_decrease');
  }

  async playLevelUp() {
    await this.playSFX('level_up');
  }

  async playEvolution() {
    await this.playSFX('evolution');
  }

  async playBattleStart() {
    await this.playSFX('battle_start');
    await this.playBackgroundMusic('battle_music');
  }

  async playBattleEnd(won) {
    await this.playSFX(won ? 'battle_victory' : 'battle_defeat');
    if (won) {
      await this.playBackgroundMusic('victory_music');
      // Return to background music after victory music
      setTimeout(() => {
        this.playBackgroundMusic('background_music');
      }, 3000);
    } else {
      await this.playBackgroundMusic('background_music');
    }
  }

  async playHealthSync() {
    await this.playSFX('health_sync');
  }

  async playNotification() {
    await this.playSFX('notification');
  }

  async playCharacterEmotion(emotion) {
    const soundKey = emotion === 'happy' ? 'character_happy' : 'character_sad';
    await this.playSFX(soundKey);
  }

  // Cleanup resources
  async cleanup() {
    try {
      // Stop background music
      await this.stopBackgroundMusic();
      
      // Unload all sounds
      for (const [key, soundObj] of this.sounds) {
        if (soundObj.sound && !soundObj.isPlaceholder) {
          await soundObj.sound.unloadAsync();
        }
      }
      
      this.sounds.clear();
      this.isInitialized = false;
      console.log('Audio service cleaned up');
    } catch (error) {
      console.error('Audio cleanup failed:', error);
    }
  }
}

export default new AudioService();