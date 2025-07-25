/**
 * Sound Manager
 * Handles audio playback and programmatic sound generation
 */

export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.enabled = true;
    
    // Create basic sounds programmatically
    this.createBasicSounds();
  }
  
  createBasicSounds() {
    // Create Web Audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Helper function to create simple tones
    const createTone = (frequency, duration, type = 'square') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      return {
        play: () => {
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }
      };
    };
    
    // Store sound generators
    this.soundGenerators = {
      hit_light: () => createTone(200, 0.1, 'square'),
      hit_heavy: () => createTone(100, 0.2, 'sawtooth'),
      jump: () => createTone(400, 0.15, 'sine'),
      special: () => createTone(800, 0.3, 'triangle'),
      block: () => createTone(150, 0.1, 'square'),
      victory: () => {
        // Victory fanfare - series of ascending tones
        const notes = [261, 329, 392, 523]; // C, E, G, C
        notes.forEach((freq, i) => {
          setTimeout(() => createTone(freq, 0.2, 'square').play(), i * 100);
        });
      },
      defeat: () => {
        // Defeat sound - descending tones
        const notes = [392, 329, 261, 196]; // G, E, C, G
        notes.forEach((freq, i) => {
          setTimeout(() => createTone(freq, 0.3, 'sawtooth').play(), i * 150);
        });
      }
    };
  }
  
  play(key, config = {}) {
    if (!this.enabled) return;
    
    // Check if we have a real sound loaded
    if (this.scene.sound.get(key)) {
      this.scene.sound.play(key, {
        volume: (config.volume || 1) * this.sfxVolume,
        ...config
      });
    } else if (this.soundGenerators[key]) {
      // Use programmatic sound
      try {
        this.soundGenerators[key]();
      } catch (e) {
        console.warn('Could not play sound:', key, e);
      }
    }
  }
  
  playMusic(key, config = {}) {
    if (!this.enabled) return;
    
    // Stop current music if playing
    this.stopMusic();
    
    if (this.scene.sound.get(key)) {
      this.currentMusic = this.scene.sound.add(key, {
        volume: this.musicVolume,
        loop: true,
        ...config
      });
      this.currentMusic.play();
    }
  }
  
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
  
  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.currentMusic) {
      this.currentMusic.pause();
    } else if (this.enabled && this.currentMusic) {
      this.currentMusic.resume();
    }
  }
}