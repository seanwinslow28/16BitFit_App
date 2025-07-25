/**
 * Touch Controls System
 * Mobile-optimized touch controls for fighting game
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class TouchControls extends Phaser.Events.EventEmitter {
  constructor(scene) {
    super();
    this.scene = scene;
    this.buttons = {};
    
    this.createControls();
  }

  createControls() {
    const { width, height } = this.scene.cameras.main;
    const buttonSize = 60;
    const padding = 20;
    
    // D-Pad for movement
    this.createDPad(padding + 80, height - 150);
    
    // Action buttons
    this.createActionButtons(width - 200, height - 150);
    
    // Special button
    this.createSpecialButton(width / 2, height - 60);
    
    // Moves list button
    this.createMovesButton(width - 80, 40);
  }

  createDPad(x, y) {
    const size = 50;
    const gap = 5;
    
    // Left button
    this.createButton('left', x - size - gap, y, size, size, '←', () => {
      this.emit('action', 'moveLeft');
    }, () => {
      this.emit('action', 'stopMove');
    });
    
    // Right button
    this.createButton('right', x + size + gap, y, size, size, '→', () => {
      this.emit('action', 'moveRight');
    }, () => {
      this.emit('action', 'stopMove');
    });
    
    // Up button (jump)
    this.createButton('up', x, y - size - gap, size, size, '↑', () => {
      this.emit('action', 'jump');
    });
    
    // Down button (air dash - when double tapped in air)
    this.createButton('down', x, y + size + gap, size * 0.8, size * 0.8, '↓', () => {
      this.emit('action', 'airDash');
    });
  }

  createActionButtons(x, y) {
    const size = 55;
    const gap = 10;
    
    // Block button (top left)
    this.createButton('block', x - size - gap, y - size - gap, size, size, 'BLOCK', () => {
      this.emit('action', 'block');
    }, () => {
      this.emit('action', 'stopBlock');
    });
    
    // Punch button (top right)
    this.createButton('punch', x + gap, y - size - gap, size, size, 'PUNCH', () => {
      this.emit('action', 'punch');
    });
    
    // Kick button (bottom right)
    this.createButton('kick', x + gap, y + gap, size, size, 'KICK', () => {
      this.emit('action', 'kick');
    });
  }

  createSpecialButton(x, y) {
    const width = 150;
    const height = 40;
    
    const button = this.scene.add.rectangle(x, y, width, height, 0x3498db, 0.8)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    const text = this.scene.add.text(x, y, 'SPECIAL', {
      font: '16px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    // Special meter indicator
    const meterBg = this.scene.add.rectangle(x, y - 30, width, 8, 0x222222)
      .setStrokeStyle(2, 0x0D0D0D);
    
    this.specialMeterFill = this.scene.add.rectangle(
      x - width / 2, y - 30, 0, 6, 0xF7D51D
    ).setOrigin(0, 0.5);
    
    button.on('pointerdown', () => {
      this.emit('action', 'special');
      button.setScale(0.9);
    });
    
    button.on('pointerup', () => {
      button.setScale(1);
    });
    
    button.on('pointerout', () => {
      button.setScale(1);
    });
    
    this.buttons.special = { button, text, meterBg };
  }
  
  createMovesButton(x, y) {
    const button = this.scene.add.rectangle(x, y, 100, 35, 0x666666, 0.8)
      .setInteractive()
      .setStrokeStyle(2, 0x92CC41);
    
    const text = this.scene.add.text(x, y, 'MOVES', {
      font: '14px monospace',
      fill: '#92CC41',
    }).setOrigin(0.5);
    
    button.on('pointerdown', () => {
      this.emit('action', 'toggleMoves');
      button.setScale(0.9);
    });
    
    button.on('pointerup', () => {
      button.setScale(1);
    });
    
    button.on('pointerout', () => {
      button.setScale(1);
    });
    
    this.buttons.moves = { button, text };
  }

  createButton(name, x, y, width, height, label, onDown, onUp) {
    // Button background
    const button = this.scene.add.rectangle(x, y, width, height, 0x92CC41, 0.8)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    // Button label
    const text = this.scene.add.text(x, y, label, {
      font: label.length > 2 ? '12px monospace' : '20px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    // Touch handlers
    button.on('pointerdown', () => {
      button.setFillStyle(0xF7D51D, 0.9);
      button.setScale(0.9);
      if (onDown) onDown();
    });
    
    button.on('pointerup', () => {
      button.setFillStyle(0x92CC41, 0.8);
      button.setScale(1);
      if (onUp) onUp();
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(0x92CC41, 0.8);
      button.setScale(1);
      if (onUp) onUp();
    });
    
    this.buttons[name] = { button, text };
  }

  updateSpecialMeter(current, max) {
    if (this.specialMeterFill) {
      const width = 150 * (current / max);
      this.specialMeterFill.setSize(width, 6);
      
      // Change color when ready
      if (current >= max) {
        this.specialMeterFill.setFillStyle(0x00FF00);
        this.buttons.special.button.setFillStyle(0x00FF00, 0.9);
      } else {
        this.specialMeterFill.setFillStyle(0xF7D51D);
        this.buttons.special.button.setFillStyle(0x3498db, 0.8);
      }
    }
  }

  setEnabled(enabled) {
    Object.values(this.buttons).forEach(({ button }) => {
      button.setInteractive(enabled);
      button.setAlpha(enabled ? 1 : 0.5);
    });
  }
  
  highlightButtons(buttonNames = []) {
    // Reset all buttons
    Object.entries(this.buttons).forEach(([name, { button, text }]) => {
      if (buttonNames.includes(name) || 
          (name === 'left' && buttonNames.includes('dpad')) ||
          (name === 'right' && buttonNames.includes('dpad')) ||
          (name === 'up' && buttonNames.includes('dpad')) ||
          (name === 'down' && buttonNames.includes('dpad'))) {
        // Highlight selected buttons
        button.setStrokeStyle(4, 0xF7D51D);
        button.setScale(1.1);
        if (text) text.setScale(1.1);
      } else {
        // Dim other buttons
        button.setStrokeStyle(3, 0x0D0D0D);
        button.setScale(1);
        button.setAlpha(0.5);
        if (text) {
          text.setScale(1);
          text.setAlpha(0.5);
        }
      }
    });
  }

  destroy() {
    Object.values(this.buttons).forEach(({ button, text }) => {
      button.destroy();
      text.destroy();
    });
    
    if (this.specialMeterFill) {
      this.specialMeterFill.destroy();
    }
    
    super.destroy();
  }
}