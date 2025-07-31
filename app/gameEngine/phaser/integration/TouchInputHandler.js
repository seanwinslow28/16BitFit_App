/**
 * TouchInputHandler - Low-latency touch controls for fighting game
 * Target: <50ms input latency with gesture recognition
 * 
 * Features:
 * - Predictive touch handling
 * - Gesture recognition (swipes, holds, taps)
 * - Input buffering for combos
 * - Haptic feedback integration
 */

import { Vibration } from 'react-native';

// Input gesture types
const GESTURE_TYPES = {
  TAP: 'TAP',
  DOUBLE_TAP: 'DOUBLE_TAP',
  HOLD: 'HOLD',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT',
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  CIRCLE: 'CIRCLE',
  DIAGONAL_UP_RIGHT: 'DIAGONAL_UP_RIGHT',
  DIAGONAL_DOWN_RIGHT: 'DIAGONAL_DOWN_RIGHT',
};

// Fighting game input mappings
const GESTURE_TO_ACTION = {
  [GESTURE_TYPES.TAP]: 'punch',
  [GESTURE_TYPES.DOUBLE_TAP]: 'heavy_punch',
  [GESTURE_TYPES.HOLD]: 'block',
  [GESTURE_TYPES.SWIPE_LEFT]: 'move_backward',
  [GESTURE_TYPES.SWIPE_RIGHT]: 'move_forward',
  [GESTURE_TYPES.SWIPE_UP]: 'jump',
  [GESTURE_TYPES.SWIPE_DOWN]: 'crouch',
  [GESTURE_TYPES.CIRCLE]: 'special_move',
  [GESTURE_TYPES.DIAGONAL_UP_RIGHT]: 'uppercut',
  [GESTURE_TYPES.DIAGONAL_DOWN_RIGHT]: 'sweep',
};

// Special move patterns (simplified Street Fighter style)
const SPECIAL_PATTERNS = {
  hadouken: ['down', 'down_forward', 'forward', 'punch'],
  shoryuken: ['forward', 'down', 'down_forward', 'punch'],
  hurricane_kick: ['down', 'down_back', 'back', 'kick'],
  sonic_boom: ['back', 'forward', 'punch'],
};

class TouchInputHandler {
  constructor(bridge) {
    this.bridge = bridge;
    
    // Touch state
    this.touches = new Map();
    this.activeGestures = new Map();
    
    // Gesture detection parameters
    this.config = {
      tapTimeout: 200,           // ms to register as tap
      doubleTapWindow: 300,      // ms between taps for double tap
      holdThreshold: 500,        // ms to register as hold
      swipeThreshold: 50,        // pixels to register as swipe
      swipeVelocity: 0.3,       // pixels/ms for swipe
      deadZone: 10,             // pixels of dead zone
    };
    
    // Input buffer for combos
    this.inputBuffer = [];
    this.bufferTimeout = 500;  // ms to keep inputs in buffer
    this.lastInputTime = 0;
    
    // Performance tracking
    this.latencyBuffer = new Array(60).fill(0);
    this.latencyIndex = 0;
    
    // Virtual stick state
    this.virtualStick = {
      active: false,
      origin: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      direction: null,
    };
    
    // Initialize gesture recognizers
    this.initializeGestureRecognizers();
  }
  
  /**
   * Initialize gesture recognition system
   */
  initializeGestureRecognizers() {
    this.gestureRecognizers = {
      tap: new TapRecognizer(this.config),
      swipe: new SwipeRecognizer(this.config),
      hold: new HoldRecognizer(this.config),
      circle: new CircleRecognizer(this.config),
    };
  }
  
  /**
   * Handle touch start event
   */
  handleTouchStart(event) {
    const timestamp = performance.now();
    
    for (let i = 0; i < event.nativeEvent.touches.length; i++) {
      const touch = event.nativeEvent.touches[i];
      const touchData = {
        id: touch.identifier,
        startX: touch.pageX,
        startY: touch.pageY,
        currentX: touch.pageX,
        currentY: touch.pageY,
        startTime: timestamp,
        lastMoveTime: timestamp,
        velocity: { x: 0, y: 0 },
        gesture: null,
      };
      
      this.touches.set(touch.identifier, touchData);
      
      // Check if touch is in virtual stick area
      if (this.isInVirtualStickArea(touch.pageX, touch.pageY)) {
        this.activateVirtualStick(touch.pageX, touch.pageY);
      }
      
      // Start gesture detection
      this.startGestureDetection(touchData);
    }
    
    // Prevent default to avoid delays
    event.preventDefault();
  }
  
  /**
   * Handle touch move event
   */
  handleTouchMove(event) {
    const timestamp = performance.now();
    
    for (let i = 0; i < event.nativeEvent.touches.length; i++) {
      const touch = event.nativeEvent.touches[i];
      const touchData = this.touches.get(touch.identifier);
      
      if (!touchData) continue;
      
      // Calculate velocity
      const deltaTime = timestamp - touchData.lastMoveTime;
      const deltaX = touch.pageX - touchData.currentX;
      const deltaY = touch.pageY - touchData.currentY;
      
      touchData.velocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      };
      
      // Update position
      touchData.currentX = touch.pageX;
      touchData.currentY = touch.pageY;
      touchData.lastMoveTime = timestamp;
      
      // Update virtual stick if active
      if (this.virtualStick.active) {
        this.updateVirtualStick(touch.pageX, touch.pageY);
      }
      
      // Update gesture detection
      this.updateGestureDetection(touchData);
    }
    
    event.preventDefault();
  }
  
  /**
   * Handle touch end event
   */
  handleTouchEnd(event) {
    const timestamp = performance.now();
    
    for (let i = 0; i < event.nativeEvent.changedTouches.length; i++) {
      const touch = event.nativeEvent.changedTouches[i];
      const touchData = this.touches.get(touch.identifier);
      
      if (!touchData) continue;
      
      // Finalize gesture detection
      const gesture = this.finalizeGesture(touchData, timestamp);
      
      if (gesture) {
        this.handleGesture(gesture, timestamp);
      }
      
      // Deactivate virtual stick if needed
      if (this.virtualStick.active && touch.identifier === this.virtualStick.touchId) {
        this.deactivateVirtualStick();
      }
      
      // Clean up
      this.touches.delete(touch.identifier);
    }
    
    event.preventDefault();
  }
  
  /**
   * Start gesture detection for a touch
   */
  startGestureDetection(touchData) {
    // Initialize recognizers for this touch
    Object.values(this.gestureRecognizers).forEach(recognizer => {
      recognizer.start(touchData);
    });
  }
  
  /**
   * Update gesture detection during move
   */
  updateGestureDetection(touchData) {
    Object.values(this.gestureRecognizers).forEach(recognizer => {
      recognizer.update(touchData);
    });
  }
  
  /**
   * Finalize gesture when touch ends
   */
  finalizeGesture(touchData, timestamp) {
    let bestGesture = null;
    let bestScore = 0;
    
    // Get the best matching gesture
    Object.values(this.gestureRecognizers).forEach(recognizer => {
      const result = recognizer.finalize(touchData, timestamp);
      if (result && result.score > bestScore) {
        bestGesture = result.gesture;
        bestScore = result.score;
      }
    });
    
    return bestGesture;
  }
  
  /**
   * Handle recognized gesture
   */
  handleGesture(gesture, timestamp) {
    // Track input latency
    const latency = timestamp - gesture.startTime;
    this.trackLatency(latency);
    
    // Map gesture to action
    const action = GESTURE_TO_ACTION[gesture.type];
    if (!action) return;
    
    // Add to input buffer
    this.addToInputBuffer(action, timestamp);
    
    // Check for special moves
    const specialMove = this.checkSpecialMoves();
    if (specialMove) {
      this.executeSpecialMove(specialMove);
    } else {
      // Send regular action
      this.sendAction(action, timestamp);
    }
    
    // Haptic feedback
    this.provideHapticFeedback(gesture.type);
  }
  
  /**
   * Virtual stick management
   */
  isInVirtualStickArea(x, y) {
    // Left side of screen for movement
    return x < 200 && y > 200;
  }
  
  activateVirtualStick(x, y) {
    this.virtualStick = {
      active: true,
      origin: { x, y },
      current: { x, y },
      direction: null,
    };
  }
  
  updateVirtualStick(x, y) {
    const dx = x - this.virtualStick.origin.x;
    const dy = y - this.virtualStick.origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Apply dead zone
    if (distance < this.config.deadZone) {
      this.virtualStick.direction = null;
      return;
    }
    
    // Calculate 8-way direction
    const angle = Math.atan2(dy, dx);
    const octant = Math.round(8 * angle / (2 * Math.PI) + 8) % 8;
    
    const directions = [
      'right', 'down_right', 'down', 'down_left',
      'left', 'up_left', 'up', 'up_right'
    ];
    
    const newDirection = directions[octant];
    
    // Send direction change
    if (newDirection !== this.virtualStick.direction) {
      if (this.virtualStick.direction) {
        this.sendAction(`stop_${this.virtualStick.direction}`);
      }
      this.virtualStick.direction = newDirection;
      this.sendAction(newDirection);
    }
  }
  
  deactivateVirtualStick() {
    if (this.virtualStick.direction) {
      this.sendAction(`stop_${this.virtualStick.direction}`);
    }
    
    this.virtualStick = {
      active: false,
      origin: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      direction: null,
    };
  }
  
  /**
   * Input buffer management
   */
  addToInputBuffer(action, timestamp) {
    // Clean old inputs
    const cutoffTime = timestamp - this.bufferTimeout;
    this.inputBuffer = this.inputBuffer.filter(input => input.timestamp > cutoffTime);
    
    // Add new input
    this.inputBuffer.push({ action, timestamp });
    
    // Limit buffer size
    if (this.inputBuffer.length > 10) {
      this.inputBuffer.shift();
    }
  }
  
  /**
   * Check for special move patterns
   */
  checkSpecialMoves() {
    if (this.inputBuffer.length < 3) return null;
    
    // Get recent inputs
    const recentInputs = this.inputBuffer.slice(-6).map(i => i.action);
    
    // Check each special pattern
    for (const [moveName, pattern] of Object.entries(SPECIAL_PATTERNS)) {
      if (this.matchesPattern(recentInputs, pattern)) {
        // Clear buffer to prevent repeated execution
        this.inputBuffer = [];
        return moveName;
      }
    }
    
    return null;
  }
  
  /**
   * Check if input sequence matches pattern
   */
  matchesPattern(inputs, pattern) {
    if (inputs.length < pattern.length) return false;
    
    // Check if pattern appears in recent inputs
    for (let i = 0; i <= inputs.length - pattern.length; i++) {
      let matches = true;
      for (let j = 0; j < pattern.length; j++) {
        if (inputs[i + j] !== pattern[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    
    return false;
  }
  
  /**
   * Execute special move
   */
  executeSpecialMove(moveName) {
    console.log(`Executing special move: ${moveName}`);
    this.sendAction(`special_${moveName}`, performance.now());
    
    // Strong haptic feedback for special moves
    Vibration.vibrate([0, 50, 50, 100]);
  }
  
  /**
   * Send action to game
   */
  sendAction(action, timestamp) {
    if (this.bridge) {
      this.bridge.sendInput(action, true);
    }
  }
  
  /**
   * Provide haptic feedback
   */
  provideHapticFeedback(gestureType) {
    const patterns = {
      [GESTURE_TYPES.TAP]: 10,
      [GESTURE_TYPES.DOUBLE_TAP]: [0, 10, 50, 10],
      [GESTURE_TYPES.HOLD]: 50,
      [GESTURE_TYPES.SWIPE_LEFT]: 20,
      [GESTURE_TYPES.SWIPE_RIGHT]: 20,
      [GESTURE_TYPES.SWIPE_UP]: 30,
      [GESTURE_TYPES.SWIPE_DOWN]: 30,
      [GESTURE_TYPES.CIRCLE]: [0, 20, 20, 20, 20, 50],
    };
    
    const pattern = patterns[gestureType];
    if (pattern) {
      Vibration.vibrate(pattern);
    }
  }
  
  /**
   * Track input latency
   */
  trackLatency(latency) {
    this.latencyBuffer[this.latencyIndex % 60] = latency;
    this.latencyIndex++;
  }
  
  /**
   * Get average input latency
   */
  getAverageLatency() {
    const sum = this.latencyBuffer.reduce((a, b) => a + b, 0);
    return sum / this.latencyBuffer.length;
  }
  
  /**
   * Get input performance metrics
   */
  getMetrics() {
    return {
      averageLatency: this.getAverageLatency().toFixed(2) + 'ms',
      activeTouches: this.touches.size,
      bufferSize: this.inputBuffer.length,
      virtualStickActive: this.virtualStick.active,
    };
  }
}

/**
 * Gesture Recognizers
 */

class TapRecognizer {
  constructor(config) {
    this.config = config;
    this.lastTap = null;
  }
  
  start(touchData) {
    touchData.tapStarted = true;
  }
  
  update(touchData) {
    // Invalidate tap if moved too far
    const distance = Math.sqrt(
      Math.pow(touchData.currentX - touchData.startX, 2) +
      Math.pow(touchData.currentY - touchData.startY, 2)
    );
    
    if (distance > this.config.deadZone) {
      touchData.tapStarted = false;
    }
  }
  
  finalize(touchData, timestamp) {
    if (!touchData.tapStarted) return null;
    
    const duration = timestamp - touchData.startTime;
    
    // Check if it's a tap
    if (duration < this.config.tapTimeout) {
      // Check for double tap
      if (this.lastTap && 
          timestamp - this.lastTap.timestamp < this.config.doubleTapWindow &&
          Math.abs(touchData.startX - this.lastTap.x) < 50 &&
          Math.abs(touchData.startY - this.lastTap.y) < 50) {
        
        this.lastTap = null;
        return {
          gesture: {
            type: GESTURE_TYPES.DOUBLE_TAP,
            startTime: touchData.startTime,
            x: touchData.startX,
            y: touchData.startY,
          },
          score: 1.0,
        };
      }
      
      // Single tap
      this.lastTap = {
        timestamp,
        x: touchData.startX,
        y: touchData.startY,
      };
      
      return {
        gesture: {
          type: GESTURE_TYPES.TAP,
          startTime: touchData.startTime,
          x: touchData.startX,
          y: touchData.startY,
        },
        score: 0.9,
      };
    }
    
    return null;
  }
}

class SwipeRecognizer {
  constructor(config) {
    this.config = config;
  }
  
  start(touchData) {
    touchData.swipeData = {
      maxVelocity: { x: 0, y: 0 },
    };
  }
  
  update(touchData) {
    // Track maximum velocity
    if (Math.abs(touchData.velocity.x) > Math.abs(touchData.swipeData.maxVelocity.x)) {
      touchData.swipeData.maxVelocity.x = touchData.velocity.x;
    }
    if (Math.abs(touchData.velocity.y) > Math.abs(touchData.swipeData.maxVelocity.y)) {
      touchData.swipeData.maxVelocity.y = touchData.velocity.y;
    }
  }
  
  finalize(touchData, timestamp) {
    const dx = touchData.currentX - touchData.startX;
    const dy = touchData.currentY - touchData.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if it's a swipe
    if (distance < this.config.swipeThreshold) return null;
    
    // Check velocity
    const velocity = touchData.swipeData.maxVelocity;
    if (Math.abs(velocity.x) < this.config.swipeVelocity && 
        Math.abs(velocity.y) < this.config.swipeVelocity) {
      return null;
    }
    
    // Determine swipe direction
    let type;
    if (Math.abs(dx) > Math.abs(dy)) {
      type = dx > 0 ? GESTURE_TYPES.SWIPE_RIGHT : GESTURE_TYPES.SWIPE_LEFT;
    } else {
      type = dy > 0 ? GESTURE_TYPES.SWIPE_DOWN : GESTURE_TYPES.SWIPE_UP;
    }
    
    // Check for diagonal swipes
    const angle = Math.atan2(dy, dx);
    if (angle > Math.PI / 6 && angle < Math.PI / 3) {
      type = GESTURE_TYPES.DIAGONAL_DOWN_RIGHT;
    } else if (angle > -Math.PI / 3 && angle < -Math.PI / 6) {
      type = GESTURE_TYPES.DIAGONAL_UP_RIGHT;
    }
    
    return {
      gesture: {
        type,
        startTime: touchData.startTime,
        distance,
        velocity: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y),
      },
      score: 0.95,
    };
  }
}

class HoldRecognizer {
  constructor(config) {
    this.config = config;
  }
  
  start(touchData) {
    touchData.holdData = {
      moved: false,
    };
  }
  
  update(touchData) {
    const distance = Math.sqrt(
      Math.pow(touchData.currentX - touchData.startX, 2) +
      Math.pow(touchData.currentY - touchData.startY, 2)
    );
    
    if (distance > this.config.deadZone) {
      touchData.holdData.moved = true;
    }
  }
  
  finalize(touchData, timestamp) {
    if (touchData.holdData.moved) return null;
    
    const duration = timestamp - touchData.startTime;
    
    if (duration >= this.config.holdThreshold) {
      return {
        gesture: {
          type: GESTURE_TYPES.HOLD,
          startTime: touchData.startTime,
          duration,
          x: touchData.startX,
          y: touchData.startY,
        },
        score: 0.85,
      };
    }
    
    return null;
  }
}

class CircleRecognizer {
  constructor(config) {
    this.config = config;
  }
  
  start(touchData) {
    touchData.circleData = {
      points: [{ x: touchData.startX, y: touchData.startY }],
    };
  }
  
  update(touchData) {
    // Sample points for circle detection
    touchData.circleData.points.push({
      x: touchData.currentX,
      y: touchData.currentY,
    });
    
    // Limit points to prevent memory issues
    if (touchData.circleData.points.length > 50) {
      touchData.circleData.points.shift();
    }
  }
  
  finalize(touchData, timestamp) {
    const points = touchData.circleData.points;
    if (points.length < 10) return null;
    
    // Simple circle detection: check if path returns near start
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const returnDistance = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) +
      Math.pow(lastPoint.y - firstPoint.y, 2)
    );
    
    // Check total path length
    let pathLength = 0;
    for (let i = 1; i < points.length; i++) {
      pathLength += Math.sqrt(
        Math.pow(points[i].x - points[i-1].x, 2) +
        Math.pow(points[i].y - points[i-1].y, 2)
      );
    }
    
    // Circle heuristic: returns near start and path is circular
    if (returnDistance < 50 && pathLength > 200) {
      return {
        gesture: {
          type: GESTURE_TYPES.CIRCLE,
          startTime: touchData.startTime,
          radius: pathLength / (2 * Math.PI),
        },
        score: 0.8,
      };
    }
    
    return null;
  }
}

export default TouchInputHandler;