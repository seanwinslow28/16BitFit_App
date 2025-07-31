/**
 * Touch Button - Reusable button component for mobile UI
 * Optimized for touch with visual and haptic feedback
 */

import Phaser from 'phaser';

export default class TouchButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, config = {}) {
    super(scene, x, y);
    
    this.scene = scene;
    this.config = {
      width: config.width || 100,
      height: config.height || 40,
      fontSize: config.fontSize || '14px',
      fontFamily: config.fontFamily || '"Press Start 2P"',
      color: config.color || 0x00FF00,
      textColor: config.textColor || '#FFFFFF',
      onClick: config.onClick || (() => {}),
      onDown: config.onDown || null,
      onUp: config.onUp || null,
      haptic: config.haptic !== false,
      sound: config.sound || 'menu-select'
    };
    
    this.isPressed = false;
    this.isEnabled = true;
    
    // Create button elements
    this.createButton(text);
    
    // Add to scene
    scene.add.existing(this);
  }

  createButton(text) {
    // Background
    this.background = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.color,
      0.3
    );
    this.background.setStrokeStyle(2, this.config.color, 0.8);
    this.add(this.background);
    
    // Text
    this.text = this.scene.add.text(0, 0, text, {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: this.config.textColor
    });
    this.text.setOrigin(0.5);
    this.add(this.text);
    
    // Make interactive
    this.background.setInteractive({ useHandCursor: true });
    
    // Set up events
    this.setupEvents();
  }

  setupEvents() {
    this.background.on('pointerdown', this.onPointerDown, this);
    this.background.on('pointerup', this.onPointerUp, this);
    this.background.on('pointerout', this.onPointerOut, this);
    this.background.on('pointerover', this.onPointerOver, this);
  }

  onPointerDown() {
    if (!this.isEnabled) return;
    
    this.isPressed = true;
    
    // Visual feedback
    this.setScale(0.95);
    this.background.setAlpha(0.6);
    
    // Haptic feedback
    if (this.config.haptic && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    
    // Sound
    if (this.config.sound && this.scene.game.soundManager) {
      this.scene.game.soundManager.playSound(this.config.sound);
    }
    
    // Custom down handler
    if (this.config.onDown) {
      this.config.onDown();
    }
  }

  onPointerUp() {
    if (!this.isEnabled || !this.isPressed) return;
    
    this.isPressed = false;
    
    // Visual feedback
    this.setScale(1);
    this.background.setAlpha(0.3);
    
    // Execute click handler
    this.config.onClick();
    
    // Custom up handler
    if (this.config.onUp) {
      this.config.onUp();
    }
  }

  onPointerOut() {
    if (!this.isEnabled) return;
    
    this.isPressed = false;
    this.setScale(1);
    this.background.setAlpha(0.3);
  }

  onPointerOver() {
    if (!this.isEnabled) return;
    
    // Hover effect
    this.background.setAlpha(0.5);
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.setAlpha(1);
      this.background.setInteractive();
    } else {
      this.setAlpha(0.5);
      this.background.disableInteractive();
    }
  }

  setText(text) {
    this.text.setText(text);
  }

  setColor(color) {
    this.config.color = color;
    this.background.setFillStyle(color, 0.3);
    this.background.setStrokeStyle(2, color, 0.8);
  }

  destroy() {
    // Clean up events
    this.background.off('pointerdown', this.onPointerDown, this);
    this.background.off('pointerup', this.onPointerUp, this);
    this.background.off('pointerout', this.onPointerOut, this);
    this.background.off('pointerover', this.onPointerOver, this);
    
    super.destroy();
  }
}