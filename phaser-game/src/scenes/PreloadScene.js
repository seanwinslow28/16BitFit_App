/**
 * Preload Scene - Asset loading and preparation
 */

import { AssetManager, ASSET_MANIFEST } from '../systems/AssetManager';
import { bridge } from '../bridge/WebViewBridge';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
    this.assetManager = null;
  }

  init(data) {
    // Receive any initialization data
    this.initData = data || {};
  }

  preload() {
    // Create asset manager
    this.assetManager = new AssetManager(this);
    
    // Set up loading UI
    this.createLoadingUI();
    
    // Load critical assets first
    this.assetManager.loadAssets(ASSET_MANIFEST.critical);
    
    // Load character data if provided
    if (this.initData.characterData) {
      this.assetManager.loadCharacterSprites(this.initData.characterData);
    }
  }

  create() {
    // Assets loaded, prepare for battle
    this.prepareGameSystems();
    
    // Notify bridge
    bridge.send('PRELOAD_COMPLETE', {
      assetsLoaded: this.assetManager.loadedAssets.size,
      timestamp: Date.now()
    });
    
    // Check if we should start battle immediately
    if (this.initData.startBattle) {
      this.scene.start('BattleScene', this.initData.battleData);
    } else {
      // Wait for battle command from React Native
      this.waitForBattleCommand();
    }
  }

  createLoadingUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);
    
    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(width / 2, height / 2 - 100, 'logo');
      logo.setScale(0.5);
    }
    
    // Progress bar
    const barWidth = 600;
    const barHeight = 30;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 50;
    
    // Bar background
    this.add.rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0x444444);
    this.add.rectangle(width / 2, barY, barWidth, barHeight, 0x222222);
    
    // Progress fill
    const progressBar = this.add.rectangle(barX, barY, 0, barHeight - 4, 0x00ff00);
    progressBar.setOrigin(0, 0.5);
    
    // Loading text
    const loadingText = this.add.text(width / 2, barY + 50, 'Loading Assets...', {
      font: '24px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Percentage text
    const percentText = this.add.text(width / 2, barY - 50, '0%', {
      font: '32px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Asset detail text
    const detailText = this.add.text(width / 2, barY + 80, '', {
      font: '16px Arial',
      fill: '#aaaaaa'
    });
    detailText.setOrigin(0.5, 0.5);
    
    // Update loading progress
    this.load.on('progress', (value) => {
      progressBar.width = (barWidth - 4) * value;
      percentText.setText(`${Math.round(value * 100)}%`);
    });
    
    this.load.on('fileprogress', (file) => {
      detailText.setText(`Loading: ${file.key}`);
    });
    
    this.load.on('complete', () => {
      loadingText.setText('Ready!');
      detailText.setText('');
    });
  }

  prepareGameSystems() {
    // Initialize texture atlases
    this.createAnimations();
    
    // Set up sound pools
    this.prepareSoundPools();
    
    // Configure particle systems
    this.prepareParticleSystems();
  }

  createAnimations() {
    // Create common animations that will be used across scenes
    
    // Hit effects
    if (this.textures.exists('ui_atlas')) {
      this.anims.create({
        key: 'hit_spark',
        frames: this.anims.generateFrameNames('ui_atlas', {
          prefix: 'hit_spark_',
          start: 0,
          end: 5,
          zeroPad: 2
        }),
        frameRate: 60,
        repeat: 0
      });
      
      this.anims.create({
        key: 'block_spark',
        frames: this.anims.generateFrameNames('ui_atlas', {
          prefix: 'block_spark_',
          start: 0,
          end: 3,
          zeroPad: 2
        }),
        frameRate: 30,
        repeat: 0
      });
    }
    
    // Character animations will be created dynamically based on loaded character
  }

  prepareSoundPools() {
    // Pre-create sound instances for better performance
    const soundsToPool = [
      { key: 'hit_light', count: 3 },
      { key: 'hit_medium', count: 3 },
      { key: 'hit_heavy', count: 2 },
      { key: 'block', count: 2 },
      { key: 'special_activate', count: 1 }
    ];
    
    soundsToPool.forEach(soundConfig => {
      if (this.cache.audio.exists(soundConfig.key)) {
        for (let i = 0; i < soundConfig.count; i++) {
          this.sound.add(soundConfig.key, { volume: 0 });
        }
      }
    });
  }

  prepareParticleSystems() {
    // Pre-warm particle emitters for instant effects
    // This will be scene-specific
  }

  waitForBattleCommand() {
    // Display ready message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const readyText = this.add.text(width / 2, height / 2 + 150, 'Touch to Continue', {
      font: '28px Arial',
      fill: '#ffffff'
    });
    readyText.setOrigin(0.5, 0.5);
    
    // Pulse animation
    this.tweens.add({
      targets: readyText,
      alpha: 0.5,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // Listen for touch/click
    this.input.once('pointerdown', () => {
      bridge.send('READY_FOR_BATTLE', {
        timestamp: Date.now()
      });
    });
    
    // Also listen for bridge command
    bridge.on('START_BATTLE', (battleData) => {
      this.scene.start('BattleScene', battleData);
    });
  }
}