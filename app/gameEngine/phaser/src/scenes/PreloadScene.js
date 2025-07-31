/**
 * Preload Scene - Asset loading with progress tracking
 * Optimized for mobile with asset bundling and compression
 */

import Phaser from 'phaser';
import { GameConfig, CharacterArchetypes } from '../config/GameConfig';
import AssetManifest from '../config/AssetManifest';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init() {
    this.loadingProgress = 0;
    this.assetLoadErrors = [];
  }

  preload() {
    const { width, height } = this.scale.gameSize;

    // Create loading bar
    this.createLoadingBar(width, height);

    // Set up load callbacks
    this.setupLoadCallbacks();

    // Load assets based on manifest
    this.loadAssets();
  }

  create() {
    // Create texture atlases for performance
    this.createTextureAtlases();

    // Initialize sound manager
    this.initializeSoundManager();

    // Cache frequently used data
    this.cacheGameData();

    // Proceed to menu after assets are ready
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }

  createLoadingBar(width, height) {
    // Background
    const bgBar = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
    bgBar.setStrokeStyle(2, 0x666666);

    // Progress bar
    this.progressBar = this.add.rectangle(
      width / 2 - 195,
      height / 2,
      0,
      20,
      0x00FF00
    );
    this.progressBar.setOrigin(0, 0.5);

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading: 0%', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#FFFFFF',
    });
    this.loadingText.setOrigin(0.5);

    // Asset being loaded text
    this.assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#CCCCCC',
    });
    this.assetText.setOrigin(0.5);
  }

  setupLoadCallbacks() {
    // Progress callback
    this.load.on('progress', (value) => {
      this.loadingProgress = value;
      this.progressBar.width = 390 * value;
      this.loadingText.setText(`Loading: ${Math.round(value * 100)}%`);
    });

    // File load callback
    this.load.on('fileprogress', (file) => {
      this.assetText.setText(`Loading: ${file.key}`);
    });

    // Complete callback
    this.load.on('complete', () => {
      this.loadingText.setText('Loading Complete!');
      this.assetText.setText('');
      
      if (this.assetLoadErrors.length > 0) {
        console.warn('Some assets failed to load:', this.assetLoadErrors);
      }
    });

    // Error callback
    this.load.on('loaderror', (fileObj) => {
      console.error('Error loading asset:', fileObj.key);
      this.assetLoadErrors.push(fileObj.key);
    });
  }

  loadAssets() {
    const basePath = GameConfig.assets.basePath;

    // Load spritesheets for characters
    this.loadCharacterAssets();

    // Load backgrounds
    this.loadBackgrounds();

    // Load UI elements
    this.loadUIAssets();

    // Load effects and particles
    this.loadEffects();

    // Load audio
    this.loadAudio();

    // Load fonts
    this.loadFonts();
  }

  loadCharacterAssets() {
    const charactersPath = GameConfig.assets.basePath + GameConfig.assets.characters;

    // Load each character archetype with evolution stages
    Object.keys(CharacterArchetypes).forEach(archetype => {
      // Base character spritesheet
      this.load.spritesheet(
        `${archetype}-idle`,
        `${charactersPath}${archetype}/idle.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      this.load.spritesheet(
        `${archetype}-walk`,
        `${charactersPath}${archetype}/walk.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      this.load.spritesheet(
        `${archetype}-attack`,
        `${charactersPath}${archetype}/attack.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      this.load.spritesheet(
        `${archetype}-special`,
        `${charactersPath}${archetype}/special.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      this.load.spritesheet(
        `${archetype}-hit`,
        `${charactersPath}${archetype}/hit.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      this.load.spritesheet(
        `${archetype}-ko`,
        `${charactersPath}${archetype}/ko.png`,
        { frameWidth: 128, frameHeight: 128 }
      );

      // Load evolution stage overlays
      for (let i = 1; i <= 5; i++) {
        this.load.image(
          `${archetype}-evolution-${i}`,
          `${charactersPath}${archetype}/evolution-${i}.png`
        );
      }
    });

    // Load boss characters
    this.loadBossAssets();
  }

  loadBossAssets() {
    const bossesPath = GameConfig.assets.basePath + 'bosses/';
    const bosses = ['sedentary', 'junkfood', 'procrastination', 'stress', 'fatigue'];

    bosses.forEach(boss => {
      this.load.spritesheet(
        `boss-${boss}`,
        `${bossesPath}${boss}/spritesheet.png`,
        { frameWidth: 192, frameHeight: 192 }
      );
    });
  }

  loadBackgrounds() {
    const bgPath = GameConfig.assets.basePath + GameConfig.assets.backgrounds;
    
    // Battle backgrounds
    this.load.image('bg-gym', `${bgPath}gym.png`);
    this.load.image('bg-street', `${bgPath}street.png`);
    this.load.image('bg-dojo', `${bgPath}dojo.png`);
    this.load.image('bg-arena', `${bgPath}arena.png`);
    this.load.image('bg-rooftop', `${bgPath}rooftop.png`);

    // Parallax layers
    this.load.image('bg-gym-far', `${bgPath}gym-far.png`);
    this.load.image('bg-gym-mid', `${bgPath}gym-mid.png`);
    this.load.image('bg-gym-near', `${bgPath}gym-near.png`);
  }

  loadUIAssets() {
    const uiPath = GameConfig.assets.basePath + GameConfig.assets.ui;

    // Health bars and UI elements
    this.load.image('healthbar-bg', `${uiPath}healthbar-bg.png`);
    this.load.image('healthbar-fill', `${uiPath}healthbar-fill.png`);
    this.load.image('healthbar-damage', `${uiPath}healthbar-damage.png`);
    this.load.image('super-meter-bg', `${uiPath}super-meter-bg.png`);
    this.load.image('super-meter-fill', `${uiPath}super-meter-fill.png`);

    // Touch control overlays
    this.load.image('touch-dpad', `${uiPath}touch-dpad.png`);
    this.load.image('touch-button', `${uiPath}touch-button.png`);
    this.load.image('touch-button-pressed', `${uiPath}touch-button-pressed.png`);

    // Combo counter
    this.load.spritesheet('combo-numbers', `${uiPath}combo-numbers.png`, {
      frameWidth: 32,
      frameHeight: 48
    });

    // Icons
    this.load.image('icon-punch', `${uiPath}icon-punch.png`);
    this.load.image('icon-kick', `${uiPath}icon-kick.png`);
    this.load.image('icon-special', `${uiPath}icon-special.png`);
    this.load.image('icon-block', `${uiPath}icon-block.png`);
  }

  loadEffects() {
    const effectsPath = GameConfig.assets.basePath + GameConfig.assets.effects;

    // Hit effects
    this.load.spritesheet('hit-spark', `${effectsPath}hit-spark.png`, {
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.spritesheet('block-spark', `${effectsPath}block-spark.png`, {
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.spritesheet('super-flash', `${effectsPath}super-flash.png`, {
      frameWidth: 128,
      frameHeight: 128
    });

    // Particle effects
    this.load.image('particle-star', `${effectsPath}particle-star.png`);
    this.load.image('particle-sweat', `${effectsPath}particle-sweat.png`);
    this.load.image('particle-dust', `${effectsPath}particle-dust.png`);
    this.load.image('particle-energy', `${effectsPath}particle-energy.png`);

    // Evolution effects
    this.load.spritesheet('evolution-aura', `${effectsPath}evolution-aura.png`, {
      frameWidth: 256,
      frameHeight: 256
    });

    this.load.spritesheet('level-up', `${effectsPath}level-up.png`, {
      frameWidth: 128,
      frameHeight: 128
    });
  }

  loadAudio() {
    const audioPath = GameConfig.assets.basePath + GameConfig.assets.audio;

    // Music
    this.load.audio('music-menu', `${audioPath}music/menu.mp3`);
    this.load.audio('music-battle', `${audioPath}music/battle.mp3`);
    this.load.audio('music-victory', `${audioPath}music/victory.mp3`);
    this.load.audio('music-defeat', `${audioPath}music/defeat.mp3`);

    // Sound effects
    const sfx = [
      'hit1', 'hit2', 'hit3',
      'block1', 'block2',
      'special1', 'special2',
      'ko1', 'ko2',
      'whoosh1', 'whoosh2',
      'power-up', 'level-up',
      'combo-break', 'super-activate',
      'menu-select', 'menu-back'
    ];

    sfx.forEach(sound => {
      this.load.audio(sound, `${audioPath}sfx/${sound}.mp3`);
    });

    // Voice clips
    const voices = ['ready', 'fight', 'ko', 'perfect', 'win'];
    voices.forEach(voice => {
      this.load.audio(`voice-${voice}`, `${audioPath}voice/${voice}.mp3`);
    });
  }

  loadFonts() {
    // Load bitmap fonts for better performance
    this.load.bitmapFont(
      'arcade',
      'assets/fonts/arcade.png',
      'assets/fonts/arcade.xml'
    );

    this.load.bitmapFont(
      'damage',
      'assets/fonts/damage.png',
      'assets/fonts/damage.xml'
    );
  }

  createTextureAtlases() {
    // Create texture atlases for better batching
    // This is handled automatically by Phaser's texture packer
  }

  initializeSoundManager() {
    // Set up sound manager with volume controls
    this.sound.volume = GameConfig.audio.masterVolume;
    
    // Create sound categories
    this.game.soundManager = {
      playSound: (key, volume = 1.0) => {
        if (this.game.globals.soundEnabled) {
          this.sound.play(key, { volume: volume * GameConfig.audio.sfxVolume });
        }
      },
      
      playMusic: (key, loop = true) => {
        if (this.game.globals.musicEnabled) {
          if (this.game.currentMusic) {
            this.game.currentMusic.stop();
          }
          this.game.currentMusic = this.sound.play(key, {
            volume: GameConfig.audio.musicVolume,
            loop: loop
          });
        }
      },
      
      stopMusic: () => {
        if (this.game.currentMusic) {
          this.game.currentMusic.stop();
          this.game.currentMusic = null;
        }
      }
    };
  }

  cacheGameData() {
    // Cache frequently accessed data
    this.cache.json.add('gameConfig', GameConfig);
    this.cache.json.add('characterArchetypes', CharacterArchetypes);
    
    // Pre-calculate frame data
    const frameDataCache = {};
    Object.entries(GameConfig.combat.frameData).forEach(([move, data]) => {
      frameDataCache[move] = {
        ...data,
        totalFrames: data.startup + data.active + data.recovery,
        advantage: data.hitstun - (data.active + data.recovery),
        blockAdvantage: data.blockstun - (data.active + data.recovery)
      };
    });
    this.cache.json.add('frameDataCache', frameDataCache);
  }
}