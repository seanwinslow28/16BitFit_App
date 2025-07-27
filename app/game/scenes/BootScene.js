/**
 * Boot Scene
 * Initial scene for loading essential assets and configuration
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Set up loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create loading text
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'LOADING...',
      style: {
        font: '20px monospace',
        fill: '#92CC41',
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Create loading bar background
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 10, 320, 20);
    
    // Update loading bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x92CC41, 1);
      progressBar.fillRect(width / 2 - 160, height / 2 - 10, 320 * value, 20);
    });
    
    // Clean up on complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // Load essential assets
    this.loadEssentialAssets();
    
    // Create placeholder ground asset for tutorial
    const groundGraphics = this.make.graphics({ x: 0, y: 0 });
    groundGraphics.fillStyle(0x333333, 1);
    groundGraphics.fillRect(0, 0, 32, 32);
    groundGraphics.generateTexture('ground', 32, 32);
    groundGraphics.destroy();
  }

  loadEssentialAssets() {
    // Check if we're in a WebView context
    if (window.isReactNative && window.assetMap) {
      // Use pre-loaded base64 assets in WebView
      this.loadBase64Assets();
    } else {
      // Normal asset loading for web
      this.load.setBaseURL('assets/');
      this.loadNormalAssets();
    }
  }
  
  loadBase64Assets() {
    const assets = window.assetMap || {};
    
    // Load sprite sheets from base64
    if (assets['sean_fighter']) {
      this.load.spritesheet('sean_fighter', assets['sean_fighter'], {
        frameWidth: 64,
        frameHeight: 64,
      });
    }
    
    if (assets['rookie_ryu']) {
      this.load.spritesheet('rookie_ryu', assets['rookie_ryu'], {
        frameWidth: 64,
        frameHeight: 64,
      });
    }
    
    if (assets['gym_bully']) {
      this.load.spritesheet('gym_bully', assets['gym_bully'], {
        frameWidth: 64,
        frameHeight: 64,
      });
    }
    
    if (assets['fit_cat']) {
      this.load.spritesheet('fit_cat', assets['fit_cat'], {
        frameWidth: 64,
        frameHeight: 64,
      });
    }
    
    if (assets['buff_mage']) {
      this.load.spritesheet('buff_mage', assets['buff_mage'], {
        frameWidth: 64,
        frameHeight: 64,
      });
    }
    
    // Load backgrounds from base64
    if (assets['background_dojo']) {
      this.load.image('background_dojo', assets['background_dojo']);
    }
    if (assets['background_warehouse']) {
      this.load.image('background_warehouse', assets['background_warehouse']);
    }
    if (assets['background_main']) {
      this.load.image('background_main', assets['background_main']);
    }
    
    // Handle load errors
    this.load.on('loaderror', (file) => {
      console.warn(`Failed to load: ${file.src}, using placeholder`);
      this.createPlaceholderAsset(file.key);
    });
  }
  
  loadNormalAssets() {
    // Load character sprite sheets (4x4 grid, 64x64 per frame)
    this.load.spritesheet('sean_fighter', 'Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    this.load.spritesheet('rookie_ryu', 'Sprites/BossBattleSpriteSheets/Rookie_Ryu-Sprite-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    this.load.spritesheet('gym_bully', 'Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    this.load.spritesheet('fit_cat', 'Sprites/BossBattleSpriteSheets/Fit_Cat-Sprite-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    this.load.spritesheet('buff_mage', 'Sprites/BossBattleSpriteSheets/Buff_Mage-Sprite-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    // Load backgrounds
    this.load.image('background_dojo', 'Backgrounds/Tranquil_Dojo_Backround.png');
    this.load.image('background_warehouse', 'Backgrounds/Industrial_Warehouse_at_Dusk.png');
    this.load.image('background_main', 'Backgrounds/Main_Background.png');
    
    // Load UI elements
    this.load.image('health_bar_bg', 'ui/health_bar_bg.png');
    this.load.image('health_bar_fill', 'ui/health_bar_fill.png');
    this.load.image('special_meter_bg', 'ui/special_meter_bg.png');
    this.load.image('special_meter_fill', 'ui/special_meter_fill.png');
    
    // Load placeholder assets if real ones don't exist
    this.load.on('loaderror', (file) => {
      console.warn(`Failed to load: ${file.src}, using placeholder`);
      // Create placeholder graphics
      this.createPlaceholderAsset(file.key);
    });
    
    // Audio will be loaded when sound effects are added to the project
    // For now, we'll create placeholder sound effects programmatically
  }

  createPlaceholderAsset(key) {
    // Create simple colored rectangles as placeholders
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    switch (key) {
      case 'player_idle':
      case 'player_attack':
      case 'player_hurt':
      case 'player_special':
        graphics.fillStyle(0x92CC41, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture(key, 64, 64);
        break;
        
      case 'battle_bg':
        graphics.fillStyle(0x9BBC0F, 1);
        graphics.fillRect(0, 0, 896, 504);
        graphics.generateTexture(key, 896, 504);
        break;
        
      case 'health_bar_bg':
      case 'special_meter_bg':
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, 0, 300, 20);
        graphics.generateTexture(key, 300, 20);
        break;
        
      case 'health_bar_fill':
        graphics.fillStyle(0x92CC41, 1);
        graphics.fillRect(0, 0, 300, 20);
        graphics.generateTexture(key, 300, 20);
        break;
        
      case 'special_meter_fill':
        graphics.fillStyle(0xF7D51D, 1);
        graphics.fillRect(0, 0, 200, 10);
        graphics.generateTexture(key, 200, 10);
        break;
    }
    
    graphics.destroy();
  }

  create() {
    // Set up game settings
    this.game.config.pixelArt = GAME_CONFIG.pixelArt;
    
    // Initialize game systems
    this.registry.set('playerStats', window.playerStats || {});
    this.registry.set('currentBoss', window.currentBoss || {});
    this.registry.set('gameConfig', GAME_CONFIG);
    
    // Transition to menu or directly to battle
    if (window.currentBoss && window.currentBoss.id) {
      this.scene.start('BattleScene');
    } else {
      this.scene.start('BattleMenuScene');
    }
  }
}