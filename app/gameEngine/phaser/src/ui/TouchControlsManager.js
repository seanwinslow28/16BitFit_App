/**
 * Touch Controls Manager - Mobile-optimized fighting game controls
 * Implements virtual D-pad, attack buttons, and gesture recognition
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export default class TouchControlsManager extends Phaser.Events.EventEmitter {
  constructor(scene) {
    super();
    this.scene = scene;
    this.config = GameConfig.touchControls;
    
    // Control zones
    this.zones = {};
    this.activePointers = new Map();
    
    // Gesture detection
    this.gestureStartTime = 0;
    this.gestureStartPos = null;
    this.doubleTapTimer = 0;
    this.lastTapTime = 0;
    this.lastTapPos = null;
    
    // Visual feedback
    this.visualsEnabled = true;
    this.hapticEnabled = true;
    
    // Input state
    this.currentInput = {
      movement: { x: 0, y: 0 },
      buttons: {
        lightAttack: false,
        heavyAttack: false,
        special: false,
        block: false
      }
    };
  }

  create() {
    // Create control zones based on screen size
    this.createControlZones();
    
    // Create visual overlays
    if (this.visualsEnabled) {
      this.createVisuals();
    }
    
    // Set up input handling
    this.setupInputHandling();
    
    // Create gesture recognizer
    this.createGestureRecognizer();
  }

  createControlZones() {
    const { width, height } = this.scene.scale.gameSize;
    const zones = this.config.zones;
    
    // Movement zone (left side)
    this.zones.movement = {
      x: zones.movement.x * width,
      y: zones.movement.y * height,
      width: zones.movement.width * width,
      height: zones.movement.height * height,
      center: {
        x: zones.movement.x * width + (zones.movement.width * width) / 2,
        y: zones.movement.y * height + (zones.movement.height * height) / 2
      }
    };
    
    // Attack buttons (right side)
    this.zones.lightAttack = this.createButtonZone(zones.lightAttack, width, height);
    this.zones.heavyAttack = this.createButtonZone(zones.heavyAttack, width, height);
    this.zones.special = this.createButtonZone(zones.special, width, height);
    this.zones.block = this.createButtonZone(zones.block, width, height);
  }

  createButtonZone(zoneConfig, screenWidth, screenHeight) {
    return {
      x: zoneConfig.x * screenWidth,
      y: zoneConfig.y * screenHeight,
      width: zoneConfig.width * screenWidth,
      height: zoneConfig.height * screenHeight,
      center: {
        x: zoneConfig.x * screenWidth + (zoneConfig.width * screenWidth) / 2,
        y: zoneConfig.y * screenHeight + (zoneConfig.height * screenHeight) / 2
      }
    };
  }

  createVisuals() {
    this.visuals = this.scene.add.container(0, 0);
    
    // Movement D-pad visual
    const dpad = this.createDPadVisual();
    this.visuals.add(dpad);
    
    // Attack buttons
    this.createButtonVisual('lightAttack', 'LP', 0x00FF00);
    this.createButtonVisual('heavyAttack', 'HP', 0xFF0000);
    this.createButtonVisual('special', 'SP', 0xFFFF00);
    this.createButtonVisual('block', 'BLK', 0x0080FF);
    
    // Set initial alpha
    this.visuals.setAlpha(0.3);
    
    // Layer on top
    this.visuals.setDepth(1000);
  }

  createDPadVisual() {
    const zone = this.zones.movement;
    const container = this.scene.add.container(zone.center.x, zone.center.y);
    
    // Background circle
    const bg = this.scene.add.circle(0, 0, zone.width / 2, 0x000000, 0.3);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    container.add(bg);
    
    // D-pad cross
    const crossSize = zone.width / 3;
    const horizontal = this.scene.add.rectangle(0, 0, crossSize, crossSize / 3, 0xFFFFFF, 0.3);
    const vertical = this.scene.add.rectangle(0, 0, crossSize / 3, crossSize, 0xFFFFFF, 0.3);
    container.add(horizontal);
    container.add(vertical);
    
    // Direction indicators
    const arrows = ['↑', '→', '↓', '←'];
    const positions = [
      { x: 0, y: -crossSize / 2 },
      { x: crossSize / 2, y: 0 },
      { x: 0, y: crossSize / 2 },
      { x: -crossSize / 2, y: 0 }
    ];
    
    arrows.forEach((arrow, i) => {
      const text = this.scene.add.text(positions[i].x, positions[i].y, arrow, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFFFFF'
      });
      text.setOrigin(0.5);
      container.add(text);
    });
    
    // Store reference
    this.dpadVisual = container;
    
    return container;
  }

  createButtonVisual(type, label, color) {
    const zone = this.zones[type];
    const button = this.scene.add.container(zone.center.x, zone.center.y);
    
    // Button background
    const bg = this.scene.add.circle(0, 0, zone.width / 2, color, 0.3);
    bg.setStrokeStyle(2, color, 0.8);
    button.add(bg);
    
    // Button label
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    text.setOrigin(0.5);
    button.add(text);
    
    // Store reference
    this[`${type}Visual`] = { button, bg, text };
    
    this.visuals.add(button);
  }

  setupInputHandling() {
    // Enable multi-touch
    this.scene.input.addPointer(3); // Support up to 4 simultaneous touches
    
    // Pointer events
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
    this.scene.input.on('pointercancel', this.handlePointerUp, this);
  }

  handlePointerDown(pointer) {
    const zone = this.getZoneAtPoint(pointer.x, pointer.y);
    
    if (zone) {
      this.activePointers.set(pointer.id, { zone, startX: pointer.x, startY: pointer.y });
      
      switch (zone) {
        case 'movement':
          this.handleMovementStart(pointer);
          break;
          
        case 'lightAttack':
        case 'heavyAttack':
        case 'special':
        case 'block':
          this.handleButtonPress(zone);
          break;
      }
      
      // Haptic feedback
      if (this.hapticEnabled) {
        this.triggerHaptic('light');
      }
    }
    
    // Gesture detection
    this.checkForDoubleTap(pointer);
    this.gestureStartTime = Date.now();
    this.gestureStartPos = { x: pointer.x, y: pointer.y };
  }

  handlePointerMove(pointer) {
    const activePointer = this.activePointers.get(pointer.id);
    if (!activePointer) return;
    
    if (activePointer.zone === 'movement') {
      this.handleMovementUpdate(pointer);
    }
    
    // Check for gesture
    if (this.gestureStartPos) {
      this.checkForGesture(pointer);
    }
  }

  handlePointerUp(pointer) {
    const activePointer = this.activePointers.get(pointer.id);
    if (!activePointer) return;
    
    switch (activePointer.zone) {
      case 'movement':
        this.handleMovementEnd();
        break;
        
      case 'lightAttack':
      case 'heavyAttack':
      case 'special':
      case 'block':
        this.handleButtonRelease(activePointer.zone);
        break;
    }
    
    this.activePointers.delete(pointer.id);
    
    // Reset gesture tracking
    this.gestureStartPos = null;
  }

  getZoneAtPoint(x, y) {
    for (const [name, zone] of Object.entries(this.zones)) {
      if (x >= zone.x && x <= zone.x + zone.width &&
          y >= zone.y && y <= zone.y + zone.height) {
        return name;
      }
    }
    return null;
  }

  handleMovementStart(pointer) {
    this.updateMovementVector(pointer);
    
    // Visual feedback
    if (this.dpadVisual) {
      this.dpadVisual.setAlpha(0.6);
    }
  }

  handleMovementUpdate(pointer) {
    this.updateMovementVector(pointer);
  }

  handleMovementEnd() {
    this.currentInput.movement = { x: 0, y: 0 };
    this.emit('input', { type: 'move', direction: 'neutral' });
    
    // Visual feedback
    if (this.dpadVisual) {
      this.dpadVisual.setAlpha(0.3);
    }
  }

  updateMovementVector(pointer) {
    const zone = this.zones.movement;
    const dx = pointer.x - zone.center.x;
    const dy = pointer.y - zone.center.y;
    
    // Normalize to -1 to 1
    const maxDistance = zone.width / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.config.deadZone * maxDistance) {
      const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
      const angle = Math.atan2(dy, dx);
      
      this.currentInput.movement = {
        x: Math.cos(angle) * normalizedDistance,
        y: Math.sin(angle) * normalizedDistance
      };
      
      // Convert to 8-way direction
      const direction = this.getDirectionFromVector(this.currentInput.movement);
      this.emit('input', { type: 'move', direction });
      
      // Handle special movement inputs
      if (direction === 'up') {
        this.emit('input', { type: 'jump' });
      } else if (direction === 'down') {
        this.emit('input', { type: 'crouch', active: true });
      }
    }
  }

  getDirectionFromVector(vector) {
    const angle = Math.atan2(vector.y, vector.x);
    const octant = Math.round(8 * angle / (2 * Math.PI) + 8) % 8;
    
    const directions = ['right', 'downright', 'down', 'downleft', 'left', 'upleft', 'up', 'upright'];
    return directions[octant];
  }

  handleButtonPress(buttonType) {
    this.currentInput.buttons[buttonType] = true;
    
    // Visual feedback
    const visual = this[`${buttonType}Visual`];
    if (visual) {
      visual.bg.setAlpha(0.6);
      visual.button.setScale(0.9);
    }
    
    // Emit appropriate event
    switch (buttonType) {
      case 'lightAttack':
        this.emit('input', { type: 'attack', strength: 'light', limb: 'punch' });
        break;
      case 'heavyAttack':
        this.emit('input', { type: 'attack', strength: 'heavy', limb: 'punch' });
        break;
      case 'special':
        this.checkSpecialMove();
        break;
      case 'block':
        this.emit('input', { type: 'block', active: true });
        break;
    }
  }

  handleButtonRelease(buttonType) {
    this.currentInput.buttons[buttonType] = false;
    
    // Visual feedback
    const visual = this[`${buttonType}Visual`];
    if (visual) {
      visual.bg.setAlpha(0.3);
      visual.button.setScale(1);
    }
    
    // Emit release event for block
    if (buttonType === 'block') {
      this.emit('input', { type: 'block', active: false });
    }
  }

  checkForDoubleTap(pointer) {
    const currentTime = Date.now();
    
    if (this.lastTapTime && currentTime - this.lastTapTime < this.config.doubleTapWindow) {
      if (this.lastTapPos) {
        const dx = pointer.x - this.lastTapPos.x;
        const dy = pointer.y - this.lastTapPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
          // Double tap detected
          this.handleDoubleTap(pointer);
        }
      }
    }
    
    this.lastTapTime = currentTime;
    this.lastTapPos = { x: pointer.x, y: pointer.y };
  }

  handleDoubleTap(pointer) {
    const zone = this.getZoneAtPoint(pointer.x, pointer.y);
    
    if (zone === 'movement') {
      // Double tap on movement = dash
      const direction = this.currentInput.movement.x > 0 ? 'right' : 'left';
      this.emit('input', { type: 'dash', direction });
    }
  }

  checkForGesture(pointer) {
    if (!this.gestureStartPos) return;
    
    const dx = pointer.x - this.gestureStartPos.x;
    const dy = pointer.y - this.gestureStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const time = Date.now() - this.gestureStartTime;
    
    // Quick swipe detection
    if (distance > 100 && time < 300) {
      const angle = Math.atan2(dy, dx);
      this.handleSwipeGesture(angle);
      this.gestureStartPos = null; // Prevent multiple detections
    }
  }

  handleSwipeGesture(angle) {
    // Convert angle to gesture
    const pi = Math.PI;
    
    if (angle > -pi/4 && angle < pi/4) {
      // Right swipe - special move
      this.emit('input', { type: 'gesture', gesture: 'hadouken' });
    } else if (angle > pi/4 && angle < 3*pi/4) {
      // Down swipe - sweep
      this.emit('input', { type: 'gesture', gesture: 'sweep' });
    } else if (angle < -pi/4 && angle > -3*pi/4) {
      // Up swipe - uppercut
      this.emit('input', { type: 'gesture', gesture: 'uppercut' });
    }
  }

  checkSpecialMove() {
    // Simple special move based on current state
    if (this.currentInput.movement.y < -0.5) {
      // Up + Special = Dragon Punch
      this.emit('input', { type: 'special', move: 'dragonPunch' });
    } else if (Math.abs(this.currentInput.movement.x) > 0.5) {
      // Forward/Back + Special = Hadouken
      this.emit('input', { type: 'special', move: 'hadouken' });
    } else {
      // Neutral Special
      this.emit('input', { type: 'special', move: 'neutral' });
    }
  }

  triggerHaptic(intensity = 'light') {
    if (!this.hapticEnabled || !window.navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 20],
      special: [50, 30, 50]
    };
    
    window.navigator.vibrate(patterns[intensity] || patterns.light);
  }

  setVisualsEnabled(enabled) {
    this.visualsEnabled = enabled;
    if (this.visuals) {
      this.visuals.setVisible(enabled);
    }
  }

  setHapticEnabled(enabled) {
    this.hapticEnabled = enabled;
  }

  update() {
    // Update visual feedback based on input state
    if (this.visualsEnabled && this.visuals) {
      // Pulse effect for active buttons
      Object.entries(this.currentInput.buttons).forEach(([button, pressed]) => {
        if (pressed && this[`${button}Visual`]) {
          const visual = this[`${button}Visual`];
          visual.button.setScale(0.9 + Math.sin(Date.now() * 0.01) * 0.05);
        }
      });
    }
  }

  destroy() {
    // Clean up event listeners
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointercancel', this.handlePointerUp, this);
    
    // Destroy visuals
    if (this.visuals) {
      this.visuals.destroy();
    }
    
    // Clear references
    this.activePointers.clear();
    this.removeAllListeners();
  }
}