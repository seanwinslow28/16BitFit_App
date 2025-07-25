/**
 * Audio Manager
 * Advanced audio system with dynamic music, 3D sound, and effects processing
 */

export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    
    // Audio categories
    this.music = {};
    this.sounds = {};
    this.voices = {};
    
    // Current state
    this.currentMusic = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.voiceVolume = 0.8;
    this.masterVolume = 1.0;
    this.muted = false;
    
    // Dynamic music state
    this.musicIntensity = 'normal'; // normal, intense, victory, defeat
    this.intensityTransitioning = false;
    
    // 3D audio settings
    this.listenerPosition = { x: 0, y: 0 };
    
    // Initialize audio
    this.initializeAudio();
  }
  
  initializeAudio() {
    // Set up audio context for advanced features
    if (this.scene.sound.context) {
      this.audioContext = this.scene.sound.context;
      this.setupAudioNodes();
    }
    
    // Load audio configuration
    this.loadAudioConfig();
  }
  
  setupAudioNodes() {
    // Create master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.masterVolume;
    
    // Create compressor for dynamic range
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    
    // Create reverb for environmental effects
    this.reverb = this.audioContext.createConvolver();
    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = 0.1;
    
    // Connect nodes
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);
  }
  
  loadAudioConfig() {
    // Define audio assets and their properties
    this.audioConfig = {
      music: {
        battle_normal: {
          key: 'battle_music_normal',
          path: 'Audio/Music/battle_normal.mp3',
          volume: 0.5,
          loop: true
        },
        battle_intense: {
          key: 'battle_music_intense',
          path: 'Audio/Music/battle_intense.mp3',
          volume: 0.6,
          loop: true
        },
        victory: {
          key: 'victory_music',
          path: 'Audio/Music/victory.mp3',
          volume: 0.7,
          loop: false
        },
        defeat: {
          key: 'defeat_music',
          path: 'Audio/Music/defeat.mp3',
          volume: 0.5,
          loop: false
        }
      },
      sounds: {
        // Combat sounds
        punch_light: {
          key: 'punch_light',
          variations: ['Audio/SFX/punch_light_1.wav', 'Audio/SFX/punch_light_2.wav'],
          volume: 0.8,
          rate: { min: 0.9, max: 1.1 }
        },
        punch_heavy: {
          key: 'punch_heavy',
          variations: ['Audio/SFX/punch_heavy_1.wav', 'Audio/SFX/punch_heavy_2.wav'],
          volume: 0.9,
          rate: { min: 0.8, max: 1.0 }
        },
        kick_light: {
          key: 'kick_light',
          variations: ['Audio/SFX/kick_light_1.wav'],
          volume: 0.8,
          rate: { min: 0.9, max: 1.1 }
        },
        kick_heavy: {
          key: 'kick_heavy',
          variations: ['Audio/SFX/kick_heavy_1.wav'],
          volume: 0.9,
          rate: { min: 0.8, max: 1.0 }
        },
        block: {
          key: 'block',
          variations: ['Audio/SFX/block_1.wav', 'Audio/SFX/block_2.wav'],
          volume: 0.7,
          rate: { min: 0.95, max: 1.05 }
        },
        special_charge: {
          key: 'special_charge',
          path: 'Audio/SFX/special_charge.wav',
          volume: 0.8
        },
        special_release: {
          key: 'special_release',
          path: 'Audio/SFX/special_release.wav',
          volume: 1.0
        },
        
        // Movement sounds
        jump: {
          key: 'jump',
          path: 'Audio/SFX/jump.wav',
          volume: 0.6
        },
        land: {
          key: 'land',
          variations: ['Audio/SFX/land_soft.wav', 'Audio/SFX/land_hard.wav'],
          volume: 0.5
        },
        dash: {
          key: 'dash',
          path: 'Audio/SFX/dash.wav',
          volume: 0.6
        },
        
        // Environmental sounds
        explosion: {
          key: 'explosion',
          path: 'Audio/SFX/explosion.wav',
          volume: 0.9
        },
        steam_vent: {
          key: 'steam_vent',
          path: 'Audio/SFX/steam_vent.wav',
          volume: 0.5
        },
        crate_fall: {
          key: 'crate_fall',
          path: 'Audio/SFX/crate_fall.wav',
          volume: 0.7
        },
        
        // UI sounds
        menu_select: {
          key: 'menu_select',
          path: 'Audio/SFX/menu_select.wav',
          volume: 0.5
        },
        menu_confirm: {
          key: 'menu_confirm',
          path: 'Audio/SFX/menu_confirm.wav',
          volume: 0.6
        }
      },
      voices: {
        player_hurt: {
          key: 'player_hurt',
          variations: ['Audio/Voice/player_hurt_1.wav', 'Audio/Voice/player_hurt_2.wav'],
          volume: 0.7
        },
        player_attack: {
          key: 'player_attack',
          variations: ['Audio/Voice/player_attack_1.wav', 'Audio/Voice/player_attack_2.wav'],
          volume: 0.6
        },
        player_victory: {
          key: 'player_victory',
          path: 'Audio/Voice/player_victory.wav',
          volume: 0.8
        },
        boss_taunt: {
          key: 'boss_taunt',
          variations: ['Audio/Voice/boss_taunt_1.wav', 'Audio/Voice/boss_taunt_2.wav'],
          volume: 0.8
        }
      }
    };
  }
  
  preloadAudio(loader) {
    // Preload all audio files
    Object.entries(this.audioConfig.music).forEach(([key, config]) => {
      if (config.path && loader.audio) {
        loader.audio(config.key, config.path);
      }
    });
    
    Object.entries(this.audioConfig.sounds).forEach(([key, config]) => {
      if (config.path && loader.audio) {
        loader.audio(config.key, config.path);
      } else if (config.variations && loader.audio) {
        config.variations.forEach((path, index) => {
          loader.audio(`${config.key}_${index}`, path);
        });
      }
    });
  }
  
  // Music control methods
  playMusic(key, intensity = 'normal') {
    if (this.muted) return;
    
    const config = this.audioConfig.music[`${key}_${intensity}`] || this.audioConfig.music[key];
    if (!config) return;
    
    // Stop current music with fade
    if (this.currentMusic) {
      this.fadeOutMusic(500);
    }
    
    // Check if audio exists or use generated music
    if (this.scene.cache.audio.exists(config.key)) {
      this.currentMusic = this.scene.sound.add(config.key, {
        volume: config.volume * this.musicVolume * this.masterVolume,
        loop: config.loop
      });
      
      this.currentMusic.play();
      this.fadeInMusic(1000);
    } else {
      // Use programmatic music generation
      this.playGeneratedMusic(key, intensity);
    }
    
    this.musicIntensity = intensity;
  }
  
  playGeneratedMusic(type, intensity) {
    // Generate simple background music using Web Audio
    if (!this.audioContext) return;
    
    // Stop any existing generated music
    if (this.musicOscillators) {
      this.musicOscillators.forEach(osc => osc.stop());
    }
    
    this.musicOscillators = [];
    
    // Define chord progressions for different music types
    const progressions = {
      battle_normal: [
        [130.81, 164.81, 196.00], // C minor
        [146.83, 174.61, 220.00], // D minor
        [130.81, 164.81, 196.00], // C minor
        [174.61, 220.00, 261.63]  // F major
      ],
      battle_intense: [
        [146.83, 174.61, 220.00], // D minor
        [164.81, 207.65, 246.94], // E minor  
        [146.83, 174.61, 220.00], // D minor
        [130.81, 164.81, 196.00]  // C minor
      ]
    };
    
    const progression = progressions[`${type}_${intensity}`] || progressions.battle_normal;
    let chordIndex = 0;
    
    // Create bass line
    const playBass = () => {
      const bass = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(progression[chordIndex][0] / 2, this.audioContext.currentTime);
      
      bassGain.gain.setValueAtTime(0.1 * this.musicVolume, this.audioContext.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      bass.connect(bassGain);
      bassGain.connect(this.masterGain);
      
      bass.start();
      bass.stop(this.audioContext.currentTime + 0.5);
      
      this.musicOscillators.push(bass);
    };
    
    // Create rhythm
    this.musicInterval = setInterval(() => {
      if (this.muted) return;
      
      playBass();
      chordIndex = (chordIndex + 1) % progression.length;
    }, intensity === 'intense' ? 250 : 500);
  }
  
  changeMusicIntensity(newIntensity) {
    if (this.musicIntensity === newIntensity || this.intensityTransitioning) return;
    
    this.intensityTransitioning = true;
    
    // Crossfade to new intensity
    this.fadeOutMusic(500, () => {
      this.playMusic('battle', newIntensity);
      this.intensityTransitioning = false;
    });
  }
  
  fadeOutMusic(duration = 1000, callback) {
    if (!this.currentMusic) return;
    
    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: 0,
      duration: duration,
      onComplete: () => {
        if (this.currentMusic) {
          this.currentMusic.stop();
          this.currentMusic = null;
        }
        if (callback) callback();
      }
    });
  }
  
  fadeInMusic(duration = 1000) {
    if (!this.currentMusic) return;
    
    const targetVolume = this.currentMusic.volume;
    this.currentMusic.setVolume(0);
    
    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: targetVolume,
      duration: duration
    });
  }
  
  // Sound effect methods
  playSound(key, options = {}) {
    if (this.muted) return;
    
    const config = this.audioConfig.sounds[key];
    if (!config) {
      // Fallback to programmatic sound
      this.playGeneratedSound(key);
      return;
    }
    
    let soundKey = config.key;
    
    // Handle variations
    if (config.variations) {
      const varIndex = Math.floor(Math.random() * config.variations.length);
      soundKey = `${config.key}_${varIndex}`;
    }
    
    // Check if sound exists
    if (this.scene.cache.audio.exists(soundKey)) {
      const volume = (options.volume || config.volume || 1) * this.sfxVolume * this.masterVolume;
      
      // Apply rate variation for more natural sounds
      let rate = 1;
      if (config.rate) {
        rate = Phaser.Math.FloatBetween(config.rate.min, config.rate.max);
      }
      
      const sound = this.scene.sound.add(soundKey, {
        volume: volume,
        rate: rate,
        ...options
      });
      
      // Apply 3D positioning if provided
      if (options.x !== undefined && options.y !== undefined) {
        this.apply3DSound(sound, options.x, options.y);
      }
      
      sound.play();
      
      return sound;
    } else {
      // Use generated sound
      this.playGeneratedSound(key, options);
    }
  }
  
  playGeneratedSound(key, options = {}) {
    // Use the existing sound manager for generated sounds
    if (this.scene.soundManager) {
      this.scene.soundManager.play(key, options);
    }
  }
  
  // 3D positional audio
  apply3DSound(sound, x, y) {
    const dx = x - this.listenerPosition.x;
    const dy = y - this.listenerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate volume based on distance
    const maxDistance = 500;
    const volume = Math.max(0, 1 - (distance / maxDistance));
    sound.setVolume(sound.volume * volume);
    
    // Calculate pan based on horizontal position
    const pan = Phaser.Math.Clamp(dx / 300, -1, 1);
    if (sound.setPan) {
      sound.setPan(pan);
    }
  }
  
  updateListenerPosition(x, y) {
    this.listenerPosition = { x, y };
  }
  
  // Voice methods
  playVoice(key, character = 'player') {
    if (this.muted) return;
    
    const voiceKey = `${character}_${key}`;
    const config = this.audioConfig.voices[voiceKey];
    
    if (config) {
      this.playSound(voiceKey, {
        volume: config.volume * this.voiceVolume
      });
    }
  }
  
  // Combat-specific audio
  playCombatSound(action, strength = 'light') {
    const soundMap = {
      punch: `punch_${strength}`,
      kick: `kick_${strength}`,
      block: 'block',
      special: 'special_release',
      hit: 'impact',
      miss: 'whoosh'
    };
    
    const soundKey = soundMap[action];
    if (soundKey) {
      this.playSound(soundKey);
    }
    
    // Play voice with some probability
    if (Math.random() < 0.3 && action !== 'block') {
      this.playVoice('attack');
    }
  }
  
  // Environmental audio
  playEnvironmentalSound(type, x, y) {
    this.playSound(type, { x, y });
  }
  
  // Dynamic audio ducking
  duckAudio(duration = 300) {
    // Lower music volume during important sounds
    if (this.currentMusic) {
      const originalVolume = this.currentMusic.volume;
      
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: originalVolume * 0.3,
        duration: 100,
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.currentMusic,
            volume: originalVolume,
            duration: duration,
            delay: duration
          });
        }
      });
    }
  }
  
  // Victory/Defeat audio
  playVictorySequence() {
    this.fadeOutMusic(500);
    this.duckAudio(2000);
    
    setTimeout(() => {
      this.playMusic('victory');
      this.playVoice('victory');
    }, 600);
  }
  
  playDefeatSequence() {
    this.fadeOutMusic(500);
    
    setTimeout(() => {
      this.playMusic('defeat');
    }, 600);
  }
  
  // Volume controls
  setMasterVolume(volume) {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
  
  setVoiceVolume(volume) {
    this.voiceVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
  
  toggleMute() {
    this.muted = !this.muted;
    
    if (this.muted) {
      if (this.currentMusic) this.currentMusic.pause();
      this.scene.sound.mute = true;
    } else {
      if (this.currentMusic) this.currentMusic.resume();
      this.scene.sound.mute = false;
    }
  }
  
  // Cleanup
  destroy() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }
    
    if (this.musicOscillators) {
      this.musicOscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
    }
    
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    this.scene.sound.removeAll();
  }
}