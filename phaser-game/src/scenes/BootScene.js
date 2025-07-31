/**
 * Boot Scene - Initial setup and configuration
 */

import { bridge } from '../bridge/WebViewBridge';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Set up loading bar
    this.createLoadingBar();
    
    // Load minimal boot assets
    this.load.image('logo', 'assets/ui/logo.png');
    this.load.json('gameConfig', 'assets/config/game.json');
  }

  create() {
    // Configure game settings
    this.configureGame();
    
    // Set up input system
    this.setupInput();
    
    // Notify bridge
    bridge.send('BOOT_COMPLETE', {
      timestamp: Date.now()
    });
    
    // Move to preload scene
    this.scene.start('PreloadScene');
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    
    // Progress bar background
    const barWidth = 400;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2;
    
    this.add.rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0xffffff);
    this.add.rectangle(width / 2, barY, barWidth, barHeight, 0x000000);
    
    // Progress bar fill
    const progressBar = this.add.rectangle(barX, barY, 0, barHeight - 4, 0x00ff00);
    progressBar.setOrigin(0, 0.5);
    
    // Loading text
    const loadingText = this.add.text(width / 2, barY + 40, 'Initializing...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Update progress
    this.load.on('progress', (value) => {
      progressBar.width = (barWidth - 4) * value;
    });
    
    this.load.on('fileprogress', (file) => {
      loadingText.setText(`Loading: ${file.key}`);
    });
  }

  configureGame() {
    // Configure physics
    this.physics.world.setFPS(60);
    
    // Configure rendering
    if (this.game.renderer.type === Phaser.WEBGL) {
      const renderer = this.game.renderer;
      renderer.setBlendMode(Phaser.BlendModes.NORMAL);
    }
    
    // Configure audio
    if (this.sound.context) {
      // Resume audio context if suspended
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
    }
  }

  setupInput() {
    // Enable multi-touch
    this.input.addPointer(1);
    
    // Configure touch settings
    this.input.touch.capture = true;
    
    // Set up keyboard (for development)
    if (!window.ReactNativeWebView) {
      this.input.keyboard.addCapture('W,A,S,D,J,K,L,U,I,O');
    }
  }
}