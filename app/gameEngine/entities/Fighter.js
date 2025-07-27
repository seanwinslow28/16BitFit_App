import React from 'react';
import { View, Animated } from 'react-native';
import Matter from 'matter-js';
import CharacterSprite from '../components/CharacterSprite';

class Fighter extends React.Component {
  constructor(props) {
    super(props);
    
    // Get character stats from logged activities/nutrition
    this.characterStats = props.characterStats || {
      health: 100,
      strength: 50,
      stamina: 50,
      speed: 50,
    };
    
    // Calculate fighting attributes from logged fitness data
    this.fightingStats = this.calculateFightingStats(this.characterStats);
    
    // Animation values
    this.animatedX = new Animated.Value(props.body.position.x);
    this.animatedY = new Animated.Value(props.body.position.y);
    this.animatedOpacity = new Animated.Value(1);
    
    // Combat state
    this.state = {
      currentAnimation: 'idle',
      facingRight: true,
      isAttacking: false,
      isBlocking: false,
      blockDirection: null,
      currentHealth: this.fightingStats.maxHealth,
      currentStamina: this.characterStats.stamina,
      comboCount: 0,
      chargeMultiplier: 1,
      totalBattles: props.characterStats?.totalBattles || 0,
    };
    
    // Bind methods
    this.attack = this.attack.bind(this);
    this.block = this.block.bind(this);
    this.move = this.move.bind(this);
    this.jump = this.jump.bind(this);
  }

  calculateFightingStats(characterStats) {
    // Convert fitness stats to fighting game stats
    return {
      maxHealth: characterStats.health,
      attackPower: Math.floor(characterStats.strength * 0.8 + characterStats.stamina * 0.2),
      defense: Math.floor(characterStats.health * 0.6 + characterStats.stamina * 0.4),
      moveSpeed: Math.floor(characterStats.stamina * 0.7 + characterStats.speed * 0.3) / 10,
      jumpPower: Math.floor(characterStats.strength * 0.5 + characterStats.speed * 0.5) / 5,
      comboChance: Math.min(characterStats.stamina / 4, 25), // Max 25% combo chance
      specialMoveUnlocked: characterStats.strength + characterStats.stamina + characterStats.speed > 180,
    };
  }

  componentDidUpdate(prevProps) {
    const { body } = this.props;
    
    // Smooth position updates
    if (body.position.x !== prevProps.body.position.x) {
      Animated.spring(this.animatedX, {
        toValue: body.position.x,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }).start();
    }
    
    if (body.position.y !== prevProps.body.position.y) {
      Animated.spring(this.animatedY, {
        toValue: body.position.y,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }).start();
    }
  }

  takeDamage(damage) {
    const actualDamage = Math.max(1, damage - this.fightingStats.defense);
    this.setState(prevState => ({
      currentHealth: Math.max(0, prevState.currentHealth - actualDamage),
      currentAnimation: 'hurt',
    }));
    
    // Reset to idle after hurt animation
    setTimeout(() => {
      if (this.state.currentHealth > 0) {
        this.setState({ currentAnimation: 'idle' });
      }
    }, 500);
    
    return actualDamage;
  }

  attack(attackType, damageMultiplier = 1) {
    if (this.state.isAttacking) return;
    
    this.setState({ 
      isAttacking: true, 
      currentAnimation: attackType 
    });
    
    // Calculate damage based on attack type and stats
    const baseDamage = {
      punch: 10,
      kick: 15,
      special: 25,
      charge: 20,
      high: 12,
      mid: 10,
      low: 12,
    };
    
    const damage = Math.floor(
      (baseDamage[attackType] || 10) * 
      (1 + this.fightingStats.attackPower / 100) * 
      damageMultiplier
    );
    
    // Combo tracking
    if (this.state.comboCount > 0) {
      this.setState({ comboCount: this.state.comboCount + 1 });
    }
    
    // Reset after attack animation
    setTimeout(() => {
      this.setState({ 
        isAttacking: false, 
        currentAnimation: 'idle' 
      });
    }, 600);
    
    return damage;
  }

  block(isBlocking, direction = null) {
    this.setState({ 
      isBlocking, 
      blockDirection: direction,
      currentAnimation: isBlocking ? 'block' : 'idle' 
    });
  }
  
  setState(updater) {
    if (typeof updater === 'function') {
      const newState = updater(this.state);
      Object.assign(this.state, newState);
    } else {
      Object.assign(this.state, updater);
    }
  }

  move(direction) {
    const speed = this.fightingStats.moveSpeed;
    Matter.Body.setVelocity(this.props.body, {
      x: direction * speed,
      y: this.props.body.velocity.y,
    });
    
    this.setState({ 
      facingRight: direction > 0,
      currentAnimation: 'walk',
    });
  }

  jump() {
    if (Math.abs(this.props.body.velocity.y) < 0.1) {
      const jumpPower = this.fightingStats.jumpPower;
      Matter.Body.setVelocity(this.props.body, {
        x: this.props.body.velocity.x,
        y: -jumpPower,
      });
      
      this.setState({ currentAnimation: 'jump' });
    }
  }

  render() {
    const { body, spriteSheet, isPlayer } = this.props;
    const { currentAnimation, facingRight, currentHealth } = this.state;
    
    // Calculate health percentage for health bar
    const healthPercentage = (currentHealth / this.fightingStats.maxHealth) * 100;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          transform: [
            { translateX: Animated.subtract(this.animatedX, 32) },
            { translateY: Animated.subtract(this.animatedY, 48) },
            { scaleX: facingRight ? 1 : -1 },
          ],
          opacity: this.animatedOpacity,
        }}
      >
        {/* Health bar */}
        <View style={{
          position: 'absolute',
          top: -20,
          left: 0,
          width: 64,
          height: 6,
          backgroundColor: '#333',
          borderRadius: 3,
        }}>
          <View style={{
            width: `${healthPercentage}%`,
            height: '100%',
            backgroundColor: healthPercentage > 50 ? '#4CAF50' : 
                           healthPercentage > 25 ? '#FFC107' : '#F44336',
            borderRadius: 3,
          }} />
        </View>
        
        {/* Character sprite */}
        <CharacterSprite
          spriteSheet={spriteSheet}
          animation={currentAnimation}
          stats={this.fightingStats}
          isPlayer={isPlayer}
        />
        
        {/* Power aura based on stats */}
        {this.renderPowerAura()}
      </Animated.View>
    );
  }

  renderPowerAura() {
    const totalPower = 
      this.fightingStats.attackPower + 
      this.fightingStats.defense + 
      this.fightingStats.moveSpeed * 10;
    
    if (totalPower > 200) {
      return (
        <View style={{
          position: 'absolute',
          top: -5,
          left: -5,
          right: -5,
          bottom: -5,
          borderWidth: 2,
          borderColor: '#FFD700',
          borderRadius: 32,
          opacity: 0.6,
        }} />
      );
    }
    return null;
  }
}

export default Fighter;