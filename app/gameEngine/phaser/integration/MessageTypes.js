/**
 * MessageTypes - Defines all message structures for WebView bridge communication
 * Optimized for binary protocols and minimal serialization overhead
 */

// Binary message type constants
export const MESSAGE_TYPES = {
  // Core messages (1-10)
  INIT: 0x01,
  READY: 0x02,
  ERROR: 0x03,
  HEARTBEAT: 0x04,
  
  // Input messages (11-30) - High frequency
  INPUT_DOWN: 0x0B,
  INPUT_UP: 0x0C,
  INPUT_MOVE: 0x0D,
  INPUT_COMBO: 0x0E,
  INPUT_GESTURE: 0x0F,
  
  // Game state (31-50) - Medium frequency  
  STATE_UPDATE: 0x1F,
  HEALTH_UPDATE: 0x20,
  COMBO_UPDATE: 0x21,
  SPECIAL_UPDATE: 0x22,
  ROUND_START: 0x23,
  ROUND_END: 0x24,
  MATCH_END: 0x25,
  
  // Character updates (51-70)
  CHARACTER_UPDATE: 0x33,
  EVOLUTION_UPDATE: 0x34,
  POWER_UP_ACTIVATE: 0x35,
  STATS_UPDATE: 0x36,
  
  // Asset loading (71-90) - Low frequency
  ASSET_REQUEST: 0x47,
  ASSET_LOADED: 0x48,
  ASSET_PROGRESS: 0x49,
  ASSET_ERROR: 0x4A,
  
  // Performance (91-110) - Debug only
  PERF_METRICS: 0x5B,
  PERF_WARNING: 0x5C,
  MEMORY_WARNING: 0x5D,
  FRAME_DROP: 0x5E,
};

// Input code constants for binary protocol
export const INPUT_CODES = {
  // Movement
  LEFT: 0x01,
  RIGHT: 0x02,
  UP: 0x04,
  DOWN: 0x08,
  
  // Actions
  PUNCH: 0x10,
  KICK: 0x20,
  BLOCK: 0x40,
  SPECIAL: 0x80,
  
  // Extended inputs
  DODGE: 0x100,
  GRAB: 0x200,
  TAUNT: 0x400,
  PAUSE: 0x800,
};

// Character states for state updates
export const CHARACTER_STATES = {
  IDLE: 0x00,
  WALKING: 0x01,
  RUNNING: 0x02,
  JUMPING: 0x03,
  FALLING: 0x04,
  ATTACKING: 0x05,
  BLOCKING: 0x06,
  HIT_STUN: 0x07,
  BLOCK_STUN: 0x08,
  KNOCKED_DOWN: 0x09,
  GETTING_UP: 0x0A,
  VICTORY: 0x0B,
  DEFEAT: 0x0C,
};

// Message structures and factories
export class MessageFactory {
  /**
   * Create binary input message
   * @param {number} inputCode - Input code from INPUT_CODES
   * @param {boolean} pressed - True for down, false for up
   * @param {number} timestamp - Event timestamp
   * @returns {ArrayBuffer} Binary message
   */
  static createInputMessage(inputCode, pressed, timestamp = performance.now()) {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    
    view.setUint8(0, pressed ? MESSAGE_TYPES.INPUT_DOWN : MESSAGE_TYPES.INPUT_UP);
    view.setUint8(1, inputCode);
    view.setFloat64(2, timestamp);
    view.setUint16(10, 0); // Reserved for sequence number
    view.setUint32(12, 0); // Reserved for future use
    
    return buffer;
  }
  
  /**
   * Create binary state update message
   * @param {Object} gameState - Current game state
   * @returns {ArrayBuffer} Binary message
   */
  static createStateMessage(gameState) {
    const buffer = new ArrayBuffer(256);
    const view = new DataView(buffer);
    
    // Header
    view.setUint8(0, MESSAGE_TYPES.STATE_UPDATE);
    view.setUint8(1, 1); // Version
    view.setUint16(2, gameState.frame || 0);
    view.setFloat64(4, performance.now());
    
    // Player state (offset 16)
    this.packCharacterState(view, 16, gameState.player);
    
    // Boss state (offset 64)
    this.packCharacterState(view, 64, gameState.boss);
    
    // Combat state (offset 112)
    view.setUint16(112, gameState.combo || 0);
    view.setUint8(114, gameState.specialMeter || 0);
    view.setFloat32(116, gameState.damageMultiplier || 1.0);
    view.setUint32(120, gameState.score || 0);
    
    // Match state (offset 128)
    view.setUint8(128, gameState.round || 1);
    view.setUint32(132, gameState.roundTime || 0);
    view.setUint8(136, gameState.isPaused ? 1 : 0);
    
    return buffer;
  }
  
  /**
   * Pack character state into buffer
   */
  static packCharacterState(view, offset, character) {
    view.setFloat32(offset, character.x || 0);
    view.setFloat32(offset + 4, character.y || 0);
    view.setFloat32(offset + 8, character.vx || 0);
    view.setFloat32(offset + 12, character.vy || 0);
    view.setUint16(offset + 16, character.health || 100);
    view.setUint16(offset + 18, character.maxHealth || 100);
    view.setUint8(offset + 20, character.state || CHARACTER_STATES.IDLE);
    view.setUint8(offset + 21, character.frame || 0);
    view.setUint8(offset + 22, character.facing || 1);
    view.setUint8(offset + 23, character.evolution || 0);
  }
  
  /**
   * Parse binary message
   * @param {ArrayBuffer} buffer - Binary message buffer
   * @returns {Object} Parsed message
   */
  static parseMessage(buffer) {
    const view = new DataView(buffer);
    const type = view.getUint8(0);
    
    switch (type) {
      case MESSAGE_TYPES.INPUT_DOWN:
      case MESSAGE_TYPES.INPUT_UP:
        return this.parseInputMessage(view, type);
        
      case MESSAGE_TYPES.STATE_UPDATE:
        return this.parseStateMessage(view);
        
      case MESSAGE_TYPES.PERF_METRICS:
        return this.parsePerformanceMessage(view);
        
      default:
        return {
          type,
          timestamp: view.getFloat64(buffer.byteLength - 8),
        };
    }
  }
  
  /**
   * Parse input message
   */
  static parseInputMessage(view, type) {
    return {
      type,
      inputCode: view.getUint8(1),
      timestamp: view.getFloat64(2),
      sequence: view.getUint16(10),
    };
  }
  
  /**
   * Parse state message
   */
  static parseStateMessage(view) {
    return {
      type: MESSAGE_TYPES.STATE_UPDATE,
      version: view.getUint8(1),
      frame: view.getUint16(2),
      timestamp: view.getFloat64(4),
      player: this.unpackCharacterState(view, 16),
      boss: this.unpackCharacterState(view, 64),
      combat: {
        combo: view.getUint16(112),
        specialMeter: view.getUint8(114),
        damageMultiplier: view.getFloat32(116),
        score: view.getUint32(120),
      },
      match: {
        round: view.getUint8(128),
        roundTime: view.getUint32(132),
        isPaused: view.getUint8(136) === 1,
      },
    };
  }
  
  /**
   * Unpack character state from buffer
   */
  static unpackCharacterState(view, offset) {
    return {
      x: view.getFloat32(offset),
      y: view.getFloat32(offset + 4),
      vx: view.getFloat32(offset + 8),
      vy: view.getFloat32(offset + 12),
      health: view.getUint16(offset + 16),
      maxHealth: view.getUint16(offset + 18),
      state: view.getUint8(offset + 20),
      frame: view.getUint8(offset + 21),
      facing: view.getUint8(offset + 22),
      evolution: view.getUint8(offset + 23),
    };
  }
  
  /**
   * Parse performance message
   */
  static parsePerformanceMessage(view) {
    return {
      type: MESSAGE_TYPES.PERF_METRICS,
      fps: view.getUint8(1),
      avgFrameTime: view.getFloat32(2),
      maxFrameTime: view.getFloat32(6),
      droppedFrames: view.getUint16(10),
      memoryUsed: view.getUint32(12),
      timestamp: view.getFloat64(16),
    };
  }
  
  /**
   * Create JSON message for complex data
   */
  static createJSONMessage(type, data) {
    return JSON.stringify({
      type,
      data,
      timestamp: performance.now(),
    });
  }
}

// Message validation utilities
export class MessageValidator {
  /**
   * Validate message structure
   */
  static validateMessage(message) {
    if (!message || typeof message !== 'object') {
      return { valid: false, error: 'Invalid message format' };
    }
    
    if (typeof message.type !== 'number') {
      return { valid: false, error: 'Missing or invalid message type' };
    }
    
    if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
      return { valid: false, error: 'Unknown message type' };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate input code
   */
  static validateInputCode(code) {
    return Object.values(INPUT_CODES).includes(code);
  }
  
  /**
   * Validate character state
   */
  static validateCharacterState(state) {
    return Object.values(CHARACTER_STATES).includes(state);
  }
}

// Performance tracking for messages
export class MessagePerformanceTracker {
  constructor() {
    this.metrics = {
      sent: 0,
      received: 0,
      errors: 0,
      totalLatency: 0,
      maxLatency: 0,
      messageTypes: {},
    };
  }
  
  trackSent(type) {
    this.metrics.sent++;
    this.metrics.messageTypes[type] = (this.metrics.messageTypes[type] || 0) + 1;
  }
  
  trackReceived(type, latency) {
    this.metrics.received++;
    if (latency) {
      this.metrics.totalLatency += latency;
      this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);
    }
  }
  
  trackError(type) {
    this.metrics.errors++;
  }
  
  getReport() {
    const avgLatency = this.metrics.received > 0 
      ? this.metrics.totalLatency / this.metrics.received 
      : 0;
      
    return {
      sent: this.metrics.sent,
      received: this.metrics.received,
      errors: this.metrics.errors,
      avgLatency: avgLatency.toFixed(2) + 'ms',
      maxLatency: this.metrics.maxLatency.toFixed(2) + 'ms',
      messageTypes: this.metrics.messageTypes,
    };
  }
  
  reset() {
    this.metrics = {
      sent: 0,
      received: 0,
      errors: 0,
      totalLatency: 0,
      maxLatency: 0,
      messageTypes: {},
    };
  }
}

export default {
  MESSAGE_TYPES,
  INPUT_CODES,
  CHARACTER_STATES,
  MessageFactory,
  MessageValidator,
  MessagePerformanceTracker,
};