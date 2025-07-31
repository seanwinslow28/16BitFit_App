/**
 * Touch Controls for Mobile Fighting Game
 * Implements Street Fighter 2 style controls for touch devices
 */

export class TouchControls extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    
    this.scene = scene;
    this.enabled = true;
    
    // Control layout configuration
    this.config = {
      dpadSize: 150,
      buttonSize: 80,
      buttonSpacing: 100,
      opacity: 0.7,
      vibrateOnTouch: true
    };
    
    // Input state
    this.inputState = {
      direction: null,
      buttons: new Set()
    };
    
    // Gesture detection
    this.gestureBuffer = [];
    this.gestureWindow = 500; // ms
    
    // Create controls
    this.createDPad();
    this.createActionButtons();
    this.createSpecialButtons();
    
    // Add to scene
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);
  }

  createDPad() {
    const x = 150;
    const y = this.scene.game.config.height - 200;
    
    // D-pad background
    this.dpadBg = this.scene.add.circle(x, y, this.config.dpadSize / 2, 0x000000, 0.3);
    this.add(this.dpadBg);
    
    // D-pad directions
    this.dpadZones = {
      up: this.createDPadZone(x, y - 50, 'UP'),
      down: this.createDPadZone(x, y + 50, 'DOWN'),
      left: this.createDPadZone(x - 50, y, 'LEFT'),
      right: this.createDPadZone(x + 50, y, 'RIGHT'),
      upLeft: this.createDPadZone(x - 35, y - 35, 'UP_LEFT', 40),
      upRight: this.createDPadZone(x + 35, y - 35, 'UP_RIGHT', 40),
      downLeft: this.createDPadZone(x - 35, y + 35, 'DOWN_LEFT', 40),
      downRight: this.createDPadZone(x + 35, y + 35, 'DOWN_RIGHT', 40)
    };
    
    // Visual indicators
    this.dpadVisuals = {
      up: this.scene.add.triangle(x, y - 50, 0, 15, -15, -15, 15, -15, 0xffffff, 0.5),
      down: this.scene.add.triangle(x, y + 50, 0, -15, -15, 15, 15, 15, 0xffffff, 0.5),
      left: this.scene.add.triangle(x - 50, y, 15, 0, -15, -15, -15, 15, 0xffffff, 0.5),
      right: this.scene.add.triangle(x + 50, y, -15, 0, 15, -15, 15, 15, 0xffffff, 0.5)
    };
    
    Object.values(this.dpadVisuals).forEach(visual => this.add(visual));
    
    // Touch handling for D-pad
    this.scene.input.on('pointerdown', this.onDPadTouch, this);
    this.scene.input.on('pointermove', this.onDPadMove, this);
    this.scene.input.on('pointerup', this.onDPadRelease, this);
  }

  createDPadZone(x, y, direction, size = 60) {
    const zone = this.scene.add.zone(x, y, size, size);
    zone.setInteractive();
    zone.direction = direction;
    
    return zone;
  }

  createActionButtons() {
    const startX = this.scene.game.config.width - 300;
    const startY = this.scene.game.config.height - 250;
    
    // 6-button layout
    const buttons = [
      { id: 'LP', x: startX - this.config.buttonSpacing, y: startY, label: 'LP', color: 0x0099ff },
      { id: 'MP', x: startX, y: startY, label: 'MP', color: 0x0066cc },
      { id: 'HP', x: startX + this.config.buttonSpacing, y: startY, label: 'HP', color: 0x003399 },
      { id: 'LK', x: startX - this.config.buttonSpacing, y: startY + this.config.buttonSpacing, label: 'LK', color: 0xff9900 },
      { id: 'MK', x: startX, y: startY + this.config.buttonSpacing, label: 'MK', color: 0xcc6600 },
      { id: 'HK', x: startX + this.config.buttonSpacing, y: startY + this.config.buttonSpacing, label: 'HK', color: 0x993300 }
    ];
    
    this.actionButtons = {};
    
    buttons.forEach(config => {
      const button = this.createButton(config);
      this.actionButtons[config.id] = button;
    });
  }

  createSpecialButtons() {
    // Block button (top left of action buttons)
    const blockButton = this.createButton({
      id: 'BLOCK',
      x: this.scene.game.config.width - 400,
      y: this.scene.game.config.height - 350,
      label: 'BLOCK',
      color: 0x666666,
      size: 60
    });
    
    // Throw button (between punch and kick rows)
    const throwButton = this.createButton({
      id: 'THROW',
      x: this.scene.game.config.width - 200,
      y: this.scene.game.config.height - 150,
      label: 'THROW',
      color: 0x9900ff,
      size: 60
    });
    
    this.actionButtons['BLOCK'] = blockButton;
    this.actionButtons['THROW'] = throwButton;
  }

  createButton(config) {
    const button = this.scene.add.circle(
      config.x, 
      config.y, 
      config.size || this.config.buttonSize / 2, 
      config.color, 
      this.config.opacity
    );
    
    button.setInteractive();
    button.setStrokeStyle(3, 0xffffff, 0.8);
    
    // Label
    const label = this.scene.add.text(config.x, config.y, config.label, {
      font: 'bold 20px Arial',
      fill: '#ffffff'
    });
    label.setOrigin(0.5, 0.5);
    
    // Touch events
    button.on('pointerdown', () => this.onButtonPress(config.id));
    button.on('pointerup', () => this.onButtonRelease(config.id));
    button.on('pointerout', () => this.onButtonRelease(config.id));
    
    // Store references
    button.label = label;
    button.id = config.id;
    button.defaultColor = config.color;
    
    this.add([button, label]);
    
    return button;
  }

  onDPadTouch(pointer) {
    if (!this.enabled) return;
    
    // Check which zone was touched
    const zones = Object.entries(this.dpadZones);
    for (const [direction, zone] of zones) {
      if (zone.getBounds().contains(pointer.x, pointer.y)) {
        this.setDirection(zone.direction);
        this.highlightDPad(direction);
        this.addToGestureBuffer(zone.direction);
        
        if (this.config.vibrateOnTouch && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
        break;
      }
    }
  }

  onDPadMove(pointer) {
    if (!this.enabled || !pointer.isDown) return;
    
    // Calculate angle from center
    const centerX = 150;
    const centerY = this.scene.game.config.height - 200;
    const angle = Phaser.Math.Angle.Between(centerX, centerY, pointer.x, pointer.y);
    const distance = Phaser.Math.Distance.Between(centerX, centerY, pointer.x, pointer.y);
    
    if (distance < this.config.dpadSize / 2) {
      // Convert angle to 8-way direction
      const direction = this.angleToDirection(angle);
      if (direction !== this.inputState.direction) {
        this.setDirection(direction);
        this.addToGestureBuffer(direction);
      }
    } else {
      this.setDirection(null);
    }
  }

  onDPadRelease() {
    this.setDirection(null);
    this.resetDPadHighlight();
  }

  angleToDirection(angle) {
    // Convert radians to degrees and normalize
    let degrees = Phaser.Math.RadToDeg(angle);
    if (degrees < 0) degrees += 360;
    
    // 8-way directions
    if (degrees >= 337.5 || degrees < 22.5) return 'RIGHT';
    if (degrees >= 22.5 && degrees < 67.5) return 'DOWN_RIGHT';
    if (degrees >= 67.5 && degrees < 112.5) return 'DOWN';
    if (degrees >= 112.5 && degrees < 157.5) return 'DOWN_LEFT';
    if (degrees >= 157.5 && degrees < 202.5) return 'LEFT';
    if (degrees >= 202.5 && degrees < 247.5) return 'UP_LEFT';
    if (degrees >= 247.5 && degrees < 292.5) return 'UP';
    if (degrees >= 292.5 && degrees < 337.5) return 'UP_RIGHT';
    
    return null;
  }

  setDirection(direction) {
    const oldDirection = this.inputState.direction;
    this.inputState.direction = direction;
    
    // Send input event
    if (direction !== oldDirection) {
      if (oldDirection) {
        this.sendInput(oldDirection + '_RELEASE');
      }
      if (direction) {
        this.sendInput(direction);
      }
    }
  }

  highlightDPad(direction) {
    this.resetDPadHighlight();
    
    if (this.dpadVisuals[direction]) {
      this.dpadVisuals[direction].setAlpha(1);
      this.dpadVisuals[direction].setScale(1.2);
    }
  }

  resetDPadHighlight() {
    Object.values(this.dpadVisuals).forEach(visual => {
      visual.setAlpha(0.5);
      visual.setScale(1);
    });
  }

  onButtonPress(buttonId) {
    if (!this.enabled) return;
    
    const button = this.actionButtons[buttonId];
    if (!button) return;
    
    // Visual feedback
    button.setScale(1.2);
    button.setAlpha(1);
    
    // Haptic feedback
    if (this.config.vibrateOnTouch && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    
    // Track button state
    this.inputState.buttons.add(buttonId);
    
    // Special handling for certain buttons
    if (buttonId === 'THROW') {
      // Throw is LP + LK
      this.sendInput('LP');
      this.sendInput('LK');
    } else {
      this.sendInput(buttonId);
    }
    
    // Add to gesture buffer for special move detection
    this.addToGestureBuffer(buttonId);
  }

  onButtonRelease(buttonId) {
    const button = this.actionButtons[buttonId];
    if (!button) return;
    
    // Reset visual
    button.setScale(1);
    button.setAlpha(this.config.opacity);
    
    // Update state
    this.inputState.buttons.delete(buttonId);
    
    // Send release event
    if (buttonId === 'BLOCK') {
      this.sendInput('BLOCK_RELEASE');
    } else if (buttonId === 'THROW') {
      this.sendInput('LP_RELEASE');
      this.sendInput('LK_RELEASE');
    }
  }

  addToGestureBuffer(input) {
    const now = Date.now();
    
    // Clean old entries
    this.gestureBuffer = this.gestureBuffer.filter(
      entry => now - entry.timestamp < this.gestureWindow
    );
    
    // Add new entry
    this.gestureBuffer.push({
      input: input,
      timestamp: now
    });
    
    // Check for special move gestures
    this.checkGestures();
  }

  checkGestures() {
    // Check for common fighting game motions
    const buffer = this.gestureBuffer.map(e => e.input).join(',');
    
    // Quarter circle forward (QCF)
    if (buffer.includes('DOWN,DOWN_RIGHT,RIGHT')) {
      this.onSpecialMoveDetected('QCF');
    }
    
    // Quarter circle back (QCB)
    if (buffer.includes('DOWN,DOWN_LEFT,LEFT')) {
      this.onSpecialMoveDetected('QCB');
    }
    
    // Dragon punch (DP)
    if (buffer.includes('RIGHT,DOWN,DOWN_RIGHT') || 
        buffer.includes('LEFT,DOWN,DOWN_LEFT')) {
      this.onSpecialMoveDetected('DP');
    }
    
    // Half circle forward (HCF)
    if (buffer.includes('LEFT,DOWN_LEFT,DOWN,DOWN_RIGHT,RIGHT')) {
      this.onSpecialMoveDetected('HCF');
    }
    
    // Half circle back (HCB)
    if (buffer.includes('RIGHT,DOWN_RIGHT,DOWN,DOWN_LEFT,LEFT')) {
      this.onSpecialMoveDetected('HCB');
    }
  }

  onSpecialMoveDetected(motion) {
    // Visual feedback
    this.dpadBg.setStrokeStyle(4, 0xffff00, 1);
    this.scene.time.delayedCall(200, () => {
      this.dpadBg.setStrokeStyle(0);
    });
    
    // Strong haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate([30, 10, 30]);
    }
  }

  sendInput(action) {
    // Send to bridge
    if (this.scene.bridge) {
      this.scene.bridge.send('GAME_INPUT', { action: action });
    }
    
    // Also handle directly for development
    this.scene.handleInput({ action: action });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.3);
  }

  setOpacity(opacity) {
    this.config.opacity = opacity;
    
    // Update all buttons
    Object.values(this.actionButtons).forEach(button => {
      button.setAlpha(opacity);
    });
    
    this.dpadBg.setAlpha(opacity * 0.5);
  }

  // Customization methods
  setLayout(layout) {
    // Allow players to customize button positions
    if (layout.buttons) {
      Object.entries(layout.buttons).forEach(([id, pos]) => {
        const button = this.actionButtons[id];
        if (button) {
          button.x = pos.x;
          button.y = pos.y;
          button.label.x = pos.x;
          button.label.y = pos.y;
        }
      });
    }
    
    if (layout.dpad) {
      // Reposition D-pad
      const dx = layout.dpad.x - 150;
      const dy = layout.dpad.y - (this.scene.game.config.height - 200);
      
      this.dpadBg.x += dx;
      this.dpadBg.y += dy;
      
      Object.values(this.dpadZones).forEach(zone => {
        zone.x += dx;
        zone.y += dy;
      });
      
      Object.values(this.dpadVisuals).forEach(visual => {
        visual.x += dx;
        visual.y += dy;
      });
    }
  }

  destroy() {
    // Clean up event listeners
    this.scene.input.off('pointerdown', this.onDPadTouch, this);
    this.scene.input.off('pointermove', this.onDPadMove, this);
    this.scene.input.off('pointerup', this.onDPadRelease, this);
    
    super.destroy();
  }
}