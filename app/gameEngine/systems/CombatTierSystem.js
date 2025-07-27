import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Matter from 'matter-js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Combat tiers based on user experience
export const CombatTiers = {
  BEGINNER: 'beginner',     // Sessions 1-10
  INTERMEDIATE: 'intermediate', // Sessions 11-50
  ADVANCED: 'advanced',     // Sessions 50+
};

// Get combat tier based on total battles
export const getCombatTier = (totalBattles) => {
  if (totalBattles <= 10) return CombatTiers.BEGINNER;
  if (totalBattles <= 50) return CombatTiers.INTERMEDIATE;
  return CombatTiers.ADVANCED;
};

// One-touch combat for beginners
class BeginnerCombatSystem {
  constructor() {
    this.lastTapTime = 0;
    this.tapCount = 0;
    this.holdStartTime = 0;
    this.isHolding = false;
    this.autoComboActive = false;
  }

  process(entities, { touches, time }) {
    const player = entities.player;
    if (!player || !touches.length) return entities;

    touches.forEach(touch => {
      const currentTime = Date.now();
      
      if (touch.type === 'start') {
        // Check for double tap
        if (currentTime - this.lastTapTime < 300) {
          this.tapCount++;
          if (this.tapCount === 2) {
            this.handleDoubleTap(player);
            this.tapCount = 0;
          }
        } else {
          this.tapCount = 1;
        }
        
        this.lastTapTime = currentTime;
        this.holdStartTime = currentTime;
        this.isHolding = true;
        
        // Single tap - start auto combo
        if (!this.autoComboActive) {
          this.startAutoCombo(player);
        }
        
      } else if (touch.type === 'end') {
        const holdDuration = currentTime - this.holdStartTime;
        
        if (this.isHolding && holdDuration > 500) {
          // Hold detected - charge attack
          this.handleChargeAttack(player, holdDuration);
        }
        
        this.isHolding = false;
      }
    });

    // Check for pinch gesture (two fingers)
    if (touches.length >= 2) {
      this.handleBlock(player);
    }

    return entities;
  }

  startAutoCombo(player) {
    this.autoComboActive = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Execute a visually satisfying combo
    const comboSequence = ['punch', 'punch', 'kick', 'special'];
    let comboIndex = 0;
    
    const executeNextMove = () => {
      if (comboIndex < comboSequence.length && this.autoComboActive) {
        player.attack(comboSequence[comboIndex]);
        comboIndex++;
        setTimeout(executeNextMove, 300);
      } else {
        this.autoComboActive = false;
      }
    };
    
    executeNextMove();
  }

  handleChargeAttack(player, holdDuration) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const chargeMultiplier = Math.min(holdDuration / 1000, 3); // Max 3x damage
    player.attack('charge', chargeMultiplier);
  }

  handleDoubleTap(player) {
    if (player.characterStats.stamina >= 20) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      player.attack('special');
      player.characterStats.stamina -= 20;
    }
  }

  handleBlock(player) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    player.block(true);
    setTimeout(() => player.block(false), 1000);
  }
}

// Strategic combat for intermediate players
class IntermediateCombatSystem {
  constructor() {
    this.swipeStartPos = null;
    this.lastAttackType = null;
    this.comboWindow = false;
  }

  process(entities, { touches, time }) {
    const player = entities.player;
    if (!player || !touches.length) return entities;

    touches.forEach(touch => {
      const { pageX, pageY } = touch.event;
      
      if (touch.type === 'start') {
        this.swipeStartPos = { x: pageX, y: pageY };
        
        // Long press detection
        this.longPressTimer = setTimeout(() => {
          this.handleDirectionalBlock(player, pageX, pageY);
        }, 300);
        
      } else if (touch.type === 'move' && this.swipeStartPos) {
        clearTimeout(this.longPressTimer);
        
        const deltaX = pageX - this.swipeStartPos.x;
        const deltaY = pageY - this.swipeStartPos.y;
        
        // Detect swipe
        if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
          this.handleSwipe(player, deltaX, deltaY);
          this.swipeStartPos = null;
        }
        
      } else if (touch.type === 'end') {
        clearTimeout(this.longPressTimer);
        
        if (this.swipeStartPos) {
          // It was a tap, not a swipe
          const zone = this.getTapZone(pageX, pageY);
          this.handleTap(player, zone);
        }
        
        this.swipeStartPos = null;
      }
    });

    return entities;
  }

  handleSwipe(player, deltaX, deltaY) {
    // Horizontal swipe - movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        player.move(player.state.facingRight ? 1 : -1);
      } else {
        player.move(player.state.facingRight ? -1 : 1);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  handleTap(player, zone) {
    // Rock-paper-scissors system
    const attackType = zone.height < 0.33 ? 'high' : 
                      zone.height < 0.67 ? 'mid' : 'low';
    
    // Combo timing window
    if (this.comboWindow) {
      this.executeComboAttack(player, attackType);
    } else {
      this.executeAttack(player, attackType);
    }
    
    // Open combo window
    this.comboWindow = true;
    setTimeout(() => { this.comboWindow = false; }, 500);
  }

  handleDirectionalBlock(player, x, y) {
    const direction = this.getDirection(x, y);
    player.block(true, direction);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  executeAttack(player, type) {
    // Rock-paper-scissors logic
    const effectiveness = this.calculateEffectiveness(type, player.opponent?.blockDirection);
    player.attack(type, effectiveness);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  executeComboAttack(player, type) {
    // Enhanced damage for combos
    player.attack(type, 1.5);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  calculateEffectiveness(attackType, blockDirection) {
    // Strike beats Throw, Throw beats Block, Block beats Strike
    if (!blockDirection) return 1.0;
    
    const matchup = {
      'high': { beats: 'low', loses: 'high' },
      'mid': { beats: 'high', loses: 'mid' },
      'low': { beats: 'mid', loses: 'low' },
    };
    
    if (matchup[attackType].beats === blockDirection) return 1.5;
    if (matchup[attackType].loses === blockDirection) return 0.5;
    return 1.0;
  }

  getTapZone(x, y) {
    return {
      width: x / screenWidth,
      height: y / screenHeight,
    };
  }

  getDirection(x, y) {
    const normalizedX = x / screenWidth;
    if (normalizedX < 0.33) return 'left';
    if (normalizedX > 0.67) return 'right';
    return 'center';
  }
}

// Advanced system uses the existing TouchControlSystem
// which already has quarter-circle motions and complex inputs

// Main combat tier system
class CombatTierSystem {
  constructor() {
    this.beginnerSystem = new BeginnerCombatSystem();
    this.intermediateSystem = new IntermediateCombatSystem();
    // Advanced system uses TouchControlSystem
  }

  process(entities, input) {
    const player = entities.player;
    if (!player) return entities;

    // Get combat tier from character stats
    const totalBattles = player.characterStats?.totalBattles || 0;
    const tier = getCombatTier(totalBattles);

    // Process based on tier
    switch (tier) {
      case CombatTiers.BEGINNER:
        return this.beginnerSystem.process(entities, input);
      
      case CombatTiers.INTERMEDIATE:
        return this.intermediateSystem.process(entities, input);
      
      case CombatTiers.ADVANCED:
        // Advanced tier handled by TouchControlSystem
        return entities;
      
      default:
        return entities;
    }
  }
}

// Export as a system function
export default (entities, input) => {
  if (!entities.combatTier) {
    entities.combatTier = new CombatTierSystem();
  }
  
  return entities.combatTier.process(entities, input);
};