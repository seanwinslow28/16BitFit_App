/**
 * 16BitFit Phaser 3 Game Entry Point
 * Initializes the fighting game engine within React Native WebView
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { bridge } from './bridge/WebViewBridge';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { BattleScene } from './scenes/BattleScene';
import { PerformanceMonitor } from './systems/PerformanceMonitor';

class SixteenBitFitGame {
  constructor() {
    this.game = null;
    this.performanceMonitor = null;
    this.isInitialized = false;
    
    // Wait for WebView environment
    this.initialize();
  }

  initialize() {
    // Check if running in WebView or development
    if (window.ReactNativeWebView || window.location.hostname === 'localhost') {
      this.createGame();
    } else {
      // Wait for WebView injection
      let attempts = 0;
      const checkInterval = setInterval(() => {
        if (window.ReactNativeWebView || attempts > 50) {
          clearInterval(checkInterval);
          this.createGame();
        }
        attempts++;
      }, 100);
    }
  }

  createGame() {
    // Configure scenes
    const gameConfig = {
      ...GAME_CONFIG,
      scene: [BootScene, PreloadScene, BattleScene]
    };

    // Create Phaser game instance
    this.game = new Phaser.Game(gameConfig);
    
    // Attach to bridge
    bridge.attachGame(this.game);
    
    // Initialize performance monitoring
    this.performanceMonitor = new PerformanceMonitor(this.game);
    
    // Set up game event handlers
    this.setupGameEvents();
    
    // Notify React Native that game is ready
    bridge.send('PHASER_INITIALIZED', {
      version: Phaser.VERSION,
      renderer: this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas',
      audioContext: this.game.sound.context ? 'WebAudio' : 'HTML5Audio'
    });
    
    this.isInitialized = true;
  }

  setupGameEvents() {
    // Handle game lifecycle events
    this.game.events.on('ready', () => {
      console.log('Phaser game ready');
      this.onGameReady();
    });

    this.game.events.on('pause', () => {
      bridge.send('GAME_PAUSED', {
        timestamp: Date.now()
      });
    });

    this.game.events.on('resume', () => {
      bridge.send('GAME_RESUMED', {
        timestamp: Date.now()
      });
    });

    this.game.events.on('destroy', () => {
      this.cleanup();
    });

    // Handle bridge messages
    this.setupBridgeHandlers();
  }

  setupBridgeHandlers() {
    // Character data updates
    bridge.on('UPDATE_CHARACTER', (data) => {
      const battleScene = this.game.scene.getScene('BattleScene');
      if (battleScene && battleScene.scene.isActive()) {
        battleScene.updateCharacterData(data);
      }
    });

    // Start battle command
    bridge.on('START_BATTLE', (battleData) => {
      this.startBattle(battleData);
    });

    // Input commands
    bridge.on('GAME_INPUT', (inputData) => {
      const battleScene = this.game.scene.getScene('BattleScene');
      if (battleScene && battleScene.scene.isActive()) {
        battleScene.handleInput(inputData);
      }
    });

    // Quality settings
    bridge.on('SET_QUALITY', (quality) => {
      this.performanceMonitor.setQualityPreset(quality);
    });

    // Debug commands
    bridge.on('TOGGLE_DEBUG', (enabled) => {
      this.game.config.physics.arcade.debug = enabled;
    });
  }

  onGameReady() {
    // Start with boot scene
    this.game.scene.start('BootScene');
    
    // Begin performance monitoring
    this.performanceMonitor.start();
  }

  startBattle(battleData) {
    // Transition to battle scene with data
    this.game.scene.start('BattleScene', battleData);
  }

  cleanup() {
    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
    }
    
    bridge.destroy();
    
    this.isInitialized = false;
  }

  // Public API for React Native
  pauseGame() {
    if (this.game && !this.game.isPaused) {
      this.game.pause();
    }
  }

  resumeGame() {
    if (this.game && this.game.isPaused) {
      this.game.resume();
    }
  }

  setVolume(volume) {
    if (this.game && this.game.sound) {
      this.game.sound.volume = Math.max(0, Math.min(1, volume));
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}

// Create game instance
const gameInstance = new SixteenBitFitGame();

// Expose to window for React Native access
window.SixteenBitFitGame = gameInstance;

// Export for module usage
export default gameInstance;