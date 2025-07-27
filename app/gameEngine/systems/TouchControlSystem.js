import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Matter from 'matter-js';
import { InputBuffer } from '../GameEngine';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Street Fighter-style special move patterns
const SPECIAL_MOVES = {
  hadoken: ['down', 'down-forward', 'forward', 'punch'],
  shoryuken: ['forward', 'down', 'down-forward', 'punch'],
  hurricane_kick: ['down', 'down-back', 'back', 'kick'],
  sonic_boom: ['back', 'forward', 'punch'],
};

class TouchControlSystem {
  constructor() {
    this.inputBuffer = new InputBuffer(500); // 500ms buffer for combos
    this.lastDirection = null;
    this.touchStartTime = 0;
    this.doubleTapTimer = null;
    this.lastTapTime = 0;
  }

  process(entities, { touches, time }) {
    const player = entities.player;
    if (!player || !touches.length) return entities;

    touches.forEach(touch => {
      if (touch.type === 'start') {
        this.handleTouchStart(touch, player, time);
      } else if (touch.type === 'move') {
        this.handleTouchMove(touch, player);
      } else if (touch.type === 'end') {
        this.handleTouchEnd(touch, player);
      }
    });

    // Check for special moves
    this.checkSpecialMoves(player);

    return entities;
  }

  handleTouchStart(touch, player, time) {
    const { pageX, pageY } = touch.event;
    const zone = this.getTouchZone(pageX, pageY);
    
    // Double tap detection for dash
    const currentTime = Date.now();
    if (currentTime - this.lastTapTime < 300 && zone.horizontal === this.lastDirection) {
      this.handleDash(player, zone.horizontal);
    }
    this.lastTapTime = currentTime;
    
    this.touchStartTime = time.current;
    
    switch (zone.type) {
      case 'movement':
        this.handleMovement(player, zone);
        break;
      case 'action':
        this.handleAction(player, zone);
        break;
      case 'special':
        this.handleSpecialZone(player);
        break;
    }
  }

  handleTouchMove(touch, player) {
    const { pageX, pageY } = touch.event;
    const zone = this.getTouchZone(pageX, pageY);
    
    if (zone.type === 'movement') {
      this.handleMovement(player, zone);
    }
  }

  handleTouchEnd(touch, player) {
    // Stop movement when touch ends in movement zone
    const { pageX, pageY } = touch.event;
    const zone = this.getTouchZone(pageX, pageY);
    
    if (zone.type === 'movement') {
      player.move(0); // Stop horizontal movement
      player.setState({ currentAnimation: 'idle' });
    }
  }

  getTouchZone(x, y) {
    const normalizedX = x / screenWidth;
    const normalizedY = y / screenHeight;
    
    // Left side: Movement controls
    if (normalizedX < 0.4) {
      // Diagonal zones for special move inputs
      if (normalizedY < 0.33) {
        if (normalizedX < 0.13) return { type: 'movement', horizontal: 'back', vertical: 'up' };
        if (normalizedX > 0.27) return { type: 'movement', horizontal: 'forward', vertical: 'up' };
        return { type: 'movement', horizontal: null, vertical: 'up' };
      } else if (normalizedY > 0.67) {
        if (normalizedX < 0.13) return { type: 'movement', horizontal: 'back', vertical: 'down' };
        if (normalizedX > 0.27) return { type: 'movement', horizontal: 'forward', vertical: 'down' };
        return { type: 'movement', horizontal: null, vertical: 'down' };
      } else {
        if (normalizedX < 0.13) return { type: 'movement', horizontal: 'back', vertical: null };
        if (normalizedX > 0.27) return { type: 'movement', horizontal: 'forward', vertical: null };
        return { type: 'movement', horizontal: null, vertical: null };
      }
    }
    
    // Right side: Action buttons
    if (normalizedX > 0.6) {
      if (normalizedY < 0.33) {
        return { type: 'action', action: 'punch' };
      } else if (normalizedY < 0.67) {
        return { type: 'action', action: 'kick' };
      } else {
        return { type: 'action', action: 'block' };
      }
    }
    
    // Center: Special move zone
    return { type: 'special' };
  }

  handleMovement(player, zone) {
    // Record directional inputs for special moves
    let directionInput = '';
    if (zone.horizontal && zone.vertical) {
      directionInput = `${zone.vertical}-${zone.horizontal}`;
    } else if (zone.horizontal) {
      directionInput = zone.horizontal;
    } else if (zone.vertical) {
      directionInput = zone.vertical;
    }
    
    if (directionInput) {
      this.inputBuffer.add(directionInput);
      this.lastDirection = zone.horizontal;
    }
    
    // Handle movement
    if (zone.horizontal === 'forward') {
      player.move(player.state.facingRight ? 1 : -1);
    } else if (zone.horizontal === 'back') {
      player.move(player.state.facingRight ? -1 : 1);
    } else {
      player.move(0);
    }
    
    // Handle jumping
    if (zone.vertical === 'up') {
      player.jump();
    } else if (zone.vertical === 'down') {
      // Crouch (future implementation)
    }
  }

  handleAction(player, zone) {
    // Add action to input buffer
    this.inputBuffer.add(zone.action);
    
    // Haptic feedback
    Haptics.impactAsync(
      zone.action === 'block' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );
    
    switch (zone.action) {
      case 'punch':
        player.attack('punch');
        break;
      case 'kick':
        player.attack('kick');
        break;
      case 'block':
        player.block(true);
        // Auto-release block after 1 second
        setTimeout(() => player.block(false), 1000);
        break;
    }
  }

  handleSpecialZone(player) {
    // Special move activation based on character stats
    if (player.characterStats.stamina >= 20 && player.fightingStats.specialMoveUnlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      player.attack('special');
      player.characterStats.stamina -= 20;
    } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  handleDash(player, direction) {
    // Dash move for quick positioning
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dashSpeed = player.fightingStats.moveSpeed * 2;
    const dashDirection = direction === 'forward' ? 
      (player.state.facingRight ? 1 : -1) : 
      (player.state.facingRight ? -1 : 1);
    
    Matter.Body.setVelocity(player.body, {
      x: dashDirection * dashSpeed,
      y: player.body.velocity.y,
    });
  }

  checkSpecialMoves(player) {
    // Check input buffer for special move patterns
    for (const [moveName, pattern] of Object.entries(SPECIAL_MOVES)) {
      if (this.inputBuffer.checkCombo(pattern)) {
        // Special move detected!
        if (player.characterStats.stamina >= 30) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          this.executeSpecialMove(player, moveName);
          this.inputBuffer.clear(); // Clear buffer after special move
          break;
        }
      }
    }
  }

  executeSpecialMove(player, moveName) {
    console.log(`Executing special move: ${moveName}`);
    player.attack('special');
    player.characterStats.stamina -= 30;
    
    // Special move specific effects
    switch (moveName) {
      case 'hadoken':
        // Create projectile entity
        break;
      case 'shoryuken':
        // Upward attack with invincibility frames
        Matter.Body.setVelocity(player.body, {
          x: player.body.velocity.x,
          y: -player.fightingStats.jumpPower * 1.5,
        });
        break;
      case 'hurricane_kick':
        // Spinning attack
        break;
      case 'sonic_boom':
        // Fast projectile
        break;
    }
  }
}

// Export as a system function for React Native Game Engine
export default (entities, input) => {
  if (!entities.touchControl) {
    entities.touchControl = new TouchControlSystem();
  }
  
  return entities.touchControl.process(entities, input);
};