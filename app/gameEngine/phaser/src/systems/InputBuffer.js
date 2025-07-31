/**
 * Input Buffer System - Street Fighter 2 style input buffering
 * Handles special move detection with motion inputs
 */

import { GameConfig } from '../config/GameConfig';

export default class InputBuffer {
  constructor(scene) {
    this.scene = scene;
    this.buffer = [];
    this.maxBufferSize = 60; // frames
    this.bufferWindow = GameConfig.combat.inputBufferWindow;
    
    // Special move definitions
    this.specialMoves = {
      // Quarter circle forward + punch (Hadouken)
      hadouken: {
        inputs: ['down', 'downforward', 'forward', 'punch'],
        window: 30,
        move: 'hadouken'
      },
      
      // Dragon punch motion (Shoryuken)
      dragonPunch: {
        inputs: ['forward', 'down', 'downforward', 'punch'],
        window: 30,
        move: 'dragonPunch'
      },
      
      // Quarter circle back + kick (Hurricane Kick)
      hurricaneKick: {
        inputs: ['down', 'downback', 'back', 'kick'],
        window: 30,
        move: 'hurricaneKick'
      },
      
      // Charge back then forward + punch (Sonic Boom)
      sonicBoom: {
        inputs: ['back:30', 'forward', 'punch'],
        window: 10,
        move: 'sonicBoom',
        charge: true
      },
      
      // 360 motion + punch (Spinning Piledriver)
      spinningPiledriver: {
        inputs: ['forward', 'downforward', 'down', 'downback', 'back', 'upback', 'up', 'upforward', 'punch'],
        window: 40,
        move: 'spinningPiledriver'
      },
      
      // Double quarter circle forward + punch (Super)
      superHadouken: {
        inputs: ['down', 'downforward', 'forward', 'down', 'downforward', 'forward', 'punch'],
        window: 40,
        move: 'superHadouken',
        super: true
      }
    };
    
    // Direction mappings
    this.directionMap = {
      'neutral': 5,
      'down': 2,
      'downforward': 3,
      'forward': 6,
      'upforward': 9,
      'up': 8,
      'upback': 7,
      'back': 4,
      'downback': 1
    };
    
    // Charge tracking
    this.chargeState = {
      back: 0,
      down: 0
    };
  }

  addInput(input) {
    const timestamp = Date.now();
    const frame = this.scene.frameCount;
    
    // Convert input to buffer format
    const bufferEntry = {
      type: input.type,
      direction: input.direction,
      button: this.getButton(input),
      timestamp,
      frame
    };
    
    this.buffer.push(bufferEntry);
    
    // Trim buffer
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }
    
    // Update charge state
    this.updateChargeState(input);
  }

  getButton(input) {
    if (input.type === 'attack') {
      return input.limb;
    }
    return input.type;
  }

  updateChargeState(input) {
    if (input.type === 'move') {
      if (input.direction === 'back' || input.direction === 'downback' || input.direction === 'upback') {
        this.chargeState.back++;
      } else {
        this.chargeState.back = 0;
      }
      
      if (input.direction === 'down' || input.direction === 'downback' || input.direction === 'downforward') {
        this.chargeState.down++;
      } else {
        this.chargeState.down = 0;
      }
    }
  }

  checkSpecialMoves(fighter) {
    // Check each special move
    for (const [name, moveData] of Object.entries(this.specialMoves)) {
      if (this.checkMoveInput(moveData, fighter)) {
        // Clear buffer after successful special
        this.clearRecentInputs();
        return moveData.move;
      }
    }
    
    return null;
  }

  checkMoveInput(moveData, fighter) {
    const requiredInputs = moveData.inputs;
    const window = moveData.window;
    
    // Get recent inputs within window
    const recentInputs = this.getRecentInputs(window);
    if (recentInputs.length < requiredInputs.length) {
      return false;
    }
    
    // Check for charge moves
    if (moveData.charge) {
      return this.checkChargeMove(moveData, recentInputs);
    }
    
    // Check sequence matching
    return this.checkInputSequence(requiredInputs, recentInputs);
  }

  checkChargeMove(moveData, recentInputs) {
    const inputs = moveData.inputs;
    
    // Parse charge requirement
    for (const input of inputs) {
      if (input.includes(':')) {
        const [direction, chargeTime] = input.split(':');
        const required = parseInt(chargeTime);
        
        if (direction === 'back' && this.chargeState.back < required) {
          return false;
        }
        if (direction === 'down' && this.chargeState.down < required) {
          return false;
        }
      }
    }
    
    // Check the rest of the inputs
    const nonChargeInputs = inputs.filter(i => !i.includes(':'));
    return this.checkInputSequence(nonChargeInputs, recentInputs);
  }

  checkInputSequence(required, actual) {
    let requiredIndex = 0;
    let lastMatchFrame = -1;
    
    for (const input of actual) {
      const requiredInput = required[requiredIndex];
      
      if (this.inputMatches(input, requiredInput)) {
        // Check if inputs are close enough in time
        if (lastMatchFrame !== -1 && input.frame - lastMatchFrame > this.bufferWindow) {
          // Too much time between inputs, reset
          requiredIndex = 0;
          lastMatchFrame = -1;
          continue;
        }
        
        requiredIndex++;
        lastMatchFrame = input.frame;
        
        if (requiredIndex === required.length) {
          return true;
        }
      }
    }
    
    return false;
  }

  inputMatches(actual, required) {
    // Check button inputs
    if (required === 'punch') {
      return actual.button === 'punch' && actual.type === 'attack';
    }
    if (required === 'kick') {
      return actual.button === 'kick' && actual.type === 'attack';
    }
    
    // Check direction inputs
    if (actual.type === 'move' && actual.direction === required) {
      return true;
    }
    
    // Check numeric pad notation
    const numpadDir = this.directionMap[actual.direction];
    if (numpadDir && numpadDir.toString() === required) {
      return true;
    }
    
    return false;
  }

  getRecentInputs(frames) {
    const currentFrame = this.scene.frameCount;
    return this.buffer.filter(input => 
      currentFrame - input.frame <= frames
    );
  }

  clearRecentInputs() {
    const keepFrames = 10;
    const currentFrame = this.scene.frameCount;
    
    this.buffer = this.buffer.filter(input =>
      currentFrame - input.frame <= keepFrames
    );
  }

  update() {
    // Clean old inputs
    const maxAge = 2000; // 2 seconds
    const now = Date.now();
    
    this.buffer = this.buffer.filter(input =>
      now - input.timestamp < maxAge
    );
  }

  // Helper methods for common motions
  detectQuarterCircle(direction = 'forward') {
    const window = 30;
    const inputs = this.getRecentInputs(window);
    
    if (direction === 'forward') {
      return this.checkInputSequence(['down', 'downforward', 'forward'], inputs);
    } else {
      return this.checkInputSequence(['down', 'downback', 'back'], inputs);
    }
  }

  detectDragonPunch() {
    const window = 30;
    const inputs = this.getRecentInputs(window);
    return this.checkInputSequence(['forward', 'down', 'downforward'], inputs);
  }

  detectHalfCircle(direction = 'forward') {
    const window = 40;
    const inputs = this.getRecentInputs(window);
    
    if (direction === 'forward') {
      return this.checkInputSequence(['back', 'downback', 'down', 'downforward', 'forward'], inputs);
    } else {
      return this.checkInputSequence(['forward', 'downforward', 'down', 'downback', 'back'], inputs);
    }
  }

  // Debug visualization
  getBufferDisplay() {
    const display = [];
    const recentInputs = this.getRecentInputs(60);
    
    recentInputs.forEach(input => {
      if (input.type === 'move') {
        display.push(this.directionMap[input.direction] || '5');
      } else if (input.type === 'attack') {
        display.push(input.button === 'punch' ? 'P' : 'K');
      }
    });
    
    return display.join(' ');
  }

  reset() {
    this.buffer = [];
    this.chargeState = {
      back: 0,
      down: 0
    };
  }
}