/**
 * Boot Scene - Initial setup and configuration
 * Handles device detection and performance profiling
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  init() {
    // Device detection
    this.detectDevice();
    
    // Set up performance monitoring
    this.initPerformanceMonitoring();
    
    // Configure global settings
    this.configureGlobalSettings();
  }

  preload() {
    // Load minimal assets needed for loading screen
    this.load.image('logo', 'assets/ui/16bitfit-logo.png');
    this.load.image('loading-bar-bg', 'assets/ui/loading-bar-bg.png');
    this.load.image('loading-bar-fill', 'assets/ui/loading-bar-fill.png');
  }

  create() {
    // Display logo
    const { width, height } = this.scale.gameSize;
    const logo = this.add.image(width / 2, height / 2 - 100, 'logo');
    logo.setScale(0.5);

    // Add loading text
    const loadingText = this.add.text(width / 2, height / 2 + 50, 'Initializing...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FFFFFF',
    });
    loadingText.setOrigin(0.5);

    // Fade in effect
    this.cameras.main.fadeIn(500);

    // Proceed to preload scene after a short delay
    this.time.delayedCall(1000, () => {
      this.scene.start('PreloadScene');
    });
  }

  detectDevice() {
    const game = this.game;
    
    // Detect device capabilities
    game.device = {
      pixelRatio: window.devicePixelRatio || 1,
      iOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      android: /android/i.test(navigator.userAgent),
      mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      touch: 'ontouchstart' in window,
    };

    // Detect performance tier
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        game.device.gpu = renderer;
      }
    }

    // Set quality level based on device
    this.setQualityLevel();
  }

  setQualityLevel() {
    const game = this.game;
    let quality = 'high';

    // Lower quality for older devices
    if (game.device.pixelRatio < 2) {
      quality = 'medium';
    }

    // Check for low-end devices
    if (game.device.mobile && !game.device.iOS) {
      // Rough Android performance detection
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        quality = 'low';
      }
    }

    game.config.quality = quality;
    console.log(`Quality level set to: ${quality}`);
  }

  initPerformanceMonitoring() {
    const game = this.game;
    
    // FPS tracking
    game.performanceMonitor = {
      fps: 60,
      deltaHistory: [],
      frameCount: 0,
      lastTime: performance.now(),
      
      update: function() {
        const currentTime = performance.now();
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.deltaHistory.push(delta);
        if (this.deltaHistory.length > 60) {
          this.deltaHistory.shift();
        }
        
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
          const avgDelta = this.deltaHistory.reduce((a, b) => a + b) / this.deltaHistory.length;
          this.fps = Math.round(1000 / avgDelta);
          
          // Auto-adjust quality if needed
          if (game.config.quality !== 'low' && this.fps < 45) {
            game.events.emit('qualityDowngrade');
          }
        }
      }
    };
  }

  configureGlobalSettings() {
    const game = this.game;
    
    // Set up global game settings
    game.globals = {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      autoSaveEnabled: true,
      showFPS: false,
      showHitboxes: false,
    };

    // Configure physics settings based on quality
    const quality = game.config.quality || 'high';
    const qualitySettings = GameConfig.performance.qualityLevels[quality];
    
    game.physics.world.defaults.debug = false;
    game.config.maxParticles = GameConfig.performance.particlePoolSize * qualitySettings.particles;
  }
}