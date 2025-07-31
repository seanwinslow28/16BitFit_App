/**
 * Input System for fighting game controls
 * Handles input buffering and integrates with ComboDetectionSystem
 * for advanced combo and special move recognition
 */

import ComboDetectionSystem, { InputNotation } from './ComboDetectionSystem';

const INPUT_BUFFER_TIME = 500; // 500ms buffer for combos
const DOUBLE_TAP_WINDOW = 300; // 300ms for dash inputs

// Input mappings
const INPUT_MAP = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  PUNCH: 'punch',
  KICK: 'kick',
  BLOCK: 'block',
  SPECIAL: 'special',
};

// Combo patterns (fighting game notation)
const COMBO_PATTERNS = {
  // Basic combos
  DOUBLE_PUNCH: ['punch', 'punch'],
  DOUBLE_KICK: ['kick', 'kick'],
  PUNCH_KICK: ['punch', 'kick'],
  
  // Special moves
  HADOUKEN: ['down', 'down-right', 'right', 'punch'], // Quarter-circle forward + punch
  SHORYUKEN: ['right', 'down', 'down-right', 'punch'], // Dragon punch motion
  TATSUMAKI: ['down', 'down-left', 'left', 'kick'], // Quarter-circle back + kick
  
  // Dash moves
  FORWARD_DASH: ['right', 'right'],
  BACKWARD_DASH: ['left', 'left'],
};

export const InputSystem = (entities, { timestep }) => {
  const player = entities.player;
  if (!player) return entities;
  
  // Initialize input state
  if (!player.inputState) {
    player.inputState = {
      buffer: [],
      currentInputs: {},
      lastInputTime: 0,
      comboWindow: false,
    };
  }
  
  const now = Date.now();
  const inputState = player.inputState;
  
  // Process input queue
  if (player.inputQueue && player.inputQueue.length > 0) {
    while (player.inputQueue.length > 0) {
      const input = player.inputQueue.shift();
      processInput(player, input, now);
    }
  }
  
  // Clean old inputs from buffer
  inputState.buffer = inputState.buffer.filter(
    entry => now - entry.time < INPUT_BUFFER_TIME
  );
  
  // Check for combos
  const detectedCombo = detectCombos(inputState.buffer);
  if (detectedCombo) {
    executeCombo(player, detectedCombo);
    inputState.buffer = []; // Clear buffer after combo
  }
  
  // Apply movement based on current inputs
  applyMovement(player, inputState.currentInputs, timestep);
  
  return entities;
};

function processInput(player, input, timestamp) {
  const { inputState } = player;
  
  // Convert input to notation for combo system
  let notationInput = null;
  switch (input.type) {
    case INPUT_MAP.LEFT:
      notationInput = player.facing === 'right' ? InputNotation.BACK : InputNotation.FORWARD;
      break;
    case INPUT_MAP.RIGHT:
      notationInput = player.facing === 'right' ? InputNotation.FORWARD : InputNotation.BACK;
      break;
    case INPUT_MAP.UP:
      notationInput = InputNotation.UP;
      break;
    case INPUT_MAP.DOWN:
      notationInput = InputNotation.DOWN;
      break;
    case INPUT_MAP.PUNCH:
      // Determine punch strength based on hold time or modifier
      notationInput = InputNotation.MP; // Default to medium punch
      break;
    case INPUT_MAP.KICK:
      notationInput = InputNotation.MK; // Default to medium kick
      break;
  }
  
  // Send input to combo detection system
  if (notationInput && input.pressed) {
    ComboDetectionSystem.addInput(notationInput, player.id);
  }
  
  // Add to local buffer for legacy compatibility
  inputState.buffer.push({
    type: input.type,
    time: timestamp,
  });
  
  // Update current input state
  if (input.pressed) {
    inputState.currentInputs[input.type] = true;
    
    // Handle immediate actions
    switch (input.type) {
      case INPUT_MAP.PUNCH:
        if (player.state === 'idle' || player.state === 'moving') {
          executeAttack(player, 'punch');
        }
        break;
        
      case INPUT_MAP.KICK:
        if (player.state === 'idle' || player.state === 'moving') {
          executeAttack(player, 'kick');
        }
        break;
        
      case INPUT_MAP.BLOCK:
        if (player.state === 'idle' || player.state === 'moving') {
          player.state = 'blocking';
          player.velocity.x *= 0.5; // Slow down while blocking
        }
        break;
        
      case INPUT_MAP.SPECIAL:
        if (player.specialMeter >= 100) {
          executeSpecialMove(player);
        }
        break;
        
      case INPUT_MAP.UP:
        if (player.grounded) {
          jump(player);
        }
        break;
    }
  } else {
    // Input released
    delete inputState.currentInputs[input.type];
    
    // Handle release actions
    if (input.type === INPUT_MAP.BLOCK && player.state === 'blocking') {
      player.state = 'idle';
    }
  }
  
  inputState.lastInputTime = timestamp;
}

function detectCombos(buffer) {
  if (buffer.length < 2) return null;
  
  // Check each combo pattern
  for (const [comboName, pattern] of Object.entries(COMBO_PATTERNS)) {
    if (matchesPattern(buffer, pattern)) {
      return comboName;
    }
  }
  
  return null;
}

function matchesPattern(buffer, pattern) {
  if (buffer.length < pattern.length) return false;
  
  // Get the last N inputs from buffer
  const recentInputs = buffer.slice(-pattern.length);
  
  // Check if time between inputs is within combo window
  for (let i = 1; i < recentInputs.length; i++) {
    const timeDiff = recentInputs[i].time - recentInputs[i - 1].time;
    if (timeDiff > DOUBLE_TAP_WINDOW) return false;
  }
  
  // Check if input types match pattern
  return pattern.every((input, index) => 
    recentInputs[index].type === input
  );
}

function executeAttack(player, type) {
  player.state = 'attacking';
  player.currentAttack = type;
  player.attackFrame = 0;
  
  // Set attack properties based on type
  if (type === 'punch') {
    player.attackDuration = 15; // 15 frames (250ms at 60fps)
    player.attackDamage = 10;
    player.attackRange = 50;
  } else if (type === 'kick') {
    player.attackDuration = 20; // 20 frames (333ms at 60fps)
    player.attackDamage = 15;
    player.attackRange = 70;
  }
  
  // Add to combo counter
  player.comboCount = (player.comboCount || 0) + 1;
  player.lastComboTime = Date.now();
  
  // Build special meter
  player.specialMeter = Math.min(100, (player.specialMeter || 0) + 10);
}

function executeSpecialMove(player) {
  player.state = 'special';
  player.specialMeter = 0;
  player.attackFrame = 0;
  player.attackDuration = 30; // 30 frames (500ms at 60fps)
  player.attackDamage = 30;
  player.attackRange = 100;
  
  // Special move has invincibility frames
  player.invincible = true;
  player.invincibilityFrames = 10;
}

function executeCombo(player, comboName) {
  // Execute special combo moves
  switch (comboName) {
    case 'HADOUKEN':
      createProjectile(player, 'fireball');
      break;
      
    case 'SHORYUKEN':
      player.velocity.y = -600; // Rising uppercut
      executeAttack(player, 'uppercut');
      break;
      
    case 'FORWARD_DASH':
      player.velocity.x = player.facing === 'right' ? 500 : -500;
      player.state = 'dashing';
      break;
      
    case 'DOUBLE_PUNCH':
      executeAttack(player, 'double_punch');
      player.attackDamage = 20;
      break;
  }
}

function jump(player) {
  player.velocity.y = -500; // Jump velocity
  player.grounded = false;
  player.state = 'jumping';
}

function applyMovement(player, currentInputs, timestep) {
  const dt = timestep / 1000; // Convert to seconds
  
  // Horizontal movement
  if (currentInputs[INPUT_MAP.LEFT] && player.state !== 'attacking') {
    player.velocity.x = -player.stats.speed;
    player.facing = 'left';
  } else if (currentInputs[INPUT_MAP.RIGHT] && player.state !== 'attacking') {
    player.velocity.x = player.stats.speed;
    player.facing = 'right';
  } else if (player.grounded) {
    // Apply friction when grounded
    player.velocity.x *= 0.85;
  }
  
  // Cancel small velocities
  if (Math.abs(player.velocity.x) < 10) {
    player.velocity.x = 0;
  }
}

function createProjectile(player, type) {
  // This will be handled by the combat system
  player.pendingProjectile = {
    type,
    direction: player.facing,
    position: { ...player.position },
  };
}