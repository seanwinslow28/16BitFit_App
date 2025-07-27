import React from 'react';
import { View, Text } from 'react-native';
import Matter from 'matter-js';
import * as Haptics from 'expo-haptics';

const BattlePhysicsSystem = (entities, { time, dispatch }) => {
  const { world, player, enemy } = entities;
  
  if (!world || !world.engine) return entities;
  
  // Update physics world
  Matter.Engine.update(world.engine, time.delta);
  
  // Ground collision detection
  checkGroundCollision(player);
  checkGroundCollision(enemy);
  
  // Combat collision detection
  if (player && enemy) {
    checkCombatCollision(player, enemy, entities, dispatch);
  }
  
  // Update animation states based on physics
  updateAnimationStates(player, time);
  updateAnimationStates(enemy, time);
  
  // Arena boundaries
  enforceArenaBounds(player);
  enforceArenaBounds(enemy);
  
  return entities;
};

const checkGroundCollision = (fighter) => {
  if (!fighter) return;
  
  const { body } = fighter;
  const groundY = 350; // Arena ground level
  
  // Simple ground collision
  if (body.position.y > groundY) {
    Matter.Body.setPosition(body, {
      x: body.position.x,
      y: groundY,
    });
    Matter.Body.setVelocity(body, {
      x: body.velocity.x,
      y: 0,
    });
    
    // Reset to idle if was jumping
    if (fighter.state.currentAnimation === 'jump') {
      fighter.setState({ currentAnimation: 'idle' });
    }
  }
};

const checkCombatCollision = (attacker, defender, entities, dispatch) => {
  if (!attacker.state.isAttacking || defender.state.isBlocking) return;
  
  const distance = Math.abs(attacker.body.position.x - defender.body.position.x);
  const inRange = distance < 80; // Attack range
  
  if (inRange && attacker.state.isAttacking && !attacker.hitRegistered) {
    // Calculate damage
    const baseDamage = attacker.attack(attacker.state.currentAnimation);
    let finalDamage = baseDamage;
    
    if (defender.state.isBlocking) {
      // Reduced damage when blocking
      finalDamage = Math.floor(baseDamage * 0.3);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Apply damage
    const actualDamage = defender.takeDamage(finalDamage);
    
    // Create damage effect
    createDamageEffect(entities, defender.body.position, actualDamage);
    
    // Knockback
    const knockbackForce = defender.state.isBlocking ? 2 : 5;
    const knockbackDirection = attacker.body.position.x < defender.body.position.x ? 1 : -1;
    
    Matter.Body.setVelocity(defender.body, {
      x: knockbackDirection * knockbackForce,
      y: -2,
    });
    
    // Mark hit as registered to prevent multiple hits
    attacker.hitRegistered = true;
    
    // Check for KO
    if (defender.state.currentHealth <= 0) {
      handleKnockout(defender, dispatch);
    }
    
    // Combo system
    if (attacker.lastHitTime && time.current - attacker.lastHitTime < 800) {
      attacker.state.comboCount++;
      createComboEffect(entities, attacker.body.position, attacker.state.comboCount);
    } else {
      attacker.state.comboCount = 1;
    }
    attacker.lastHitTime = time.current;
  }
};

const updateAnimationStates = (fighter, time) => {
  if (!fighter) return;
  
  // Reset attack state after animation completes
  if (fighter.state.isAttacking && !fighter.attackResetTimer) {
    fighter.attackResetTimer = setTimeout(() => {
      fighter.setState({ 
        isAttacking: false, 
        currentAnimation: 'idle' 
      });
      fighter.hitRegistered = false;
      fighter.attackResetTimer = null;
    }, 600);
  }
  
  // Update animation based on velocity
  if (!fighter.state.isAttacking && !fighter.state.isBlocking) {
    if (Math.abs(fighter.body.velocity.y) > 0.5) {
      if (fighter.state.currentAnimation !== 'jump') {
        fighter.setState({ currentAnimation: 'jump' });
      }
    } else if (Math.abs(fighter.body.velocity.x) > 0.5) {
      if (fighter.state.currentAnimation !== 'walk') {
        fighter.setState({ currentAnimation: 'walk' });
      }
    } else if (fighter.state.currentAnimation !== 'idle' && 
               fighter.state.currentAnimation !== 'hurt') {
      fighter.setState({ currentAnimation: 'idle' });
    }
  }
};

const enforceArenaBounds = (fighter) => {
  if (!fighter) return;
  
  const { body } = fighter;
  const minX = 50;
  const maxX = 750;
  
  if (body.position.x < minX) {
    Matter.Body.setPosition(body, { x: minX, y: body.position.y });
    Matter.Body.setVelocity(body, { x: 0, y: body.velocity.y });
  } else if (body.position.x > maxX) {
    Matter.Body.setPosition(body, { x: maxX, y: body.position.y });
    Matter.Body.setVelocity(body, { x: 0, y: body.velocity.y });
  }
};

const createDamageEffect = (entities, position, damage) => {
  const effectId = `damage_${Date.now()}`;
  entities[effectId] = {
    position: { ...position },
    damage,
    startTime: Date.now(),
    renderer: DamageNumber,
  };
  
  // Remove after animation
  setTimeout(() => {
    delete entities[effectId];
  }, 1000);
};

const createComboEffect = (entities, position, combo) => {
  const effectId = `combo_${Date.now()}`;
  entities[effectId] = {
    position: { x: position.x, y: position.y - 50 },
    combo,
    startTime: Date.now(),
    renderer: ComboCounter,
  };
  
  setTimeout(() => {
    delete entities[effectId];
  }, 1500);
};

const handleKnockout = (fighter, dispatch) => {
  fighter.setState({ 
    currentAnimation: 'defeat',
    isDefeated: true 
  });
  
  // Dispatch victory event
  setTimeout(() => {
    dispatch({ type: 'battle-end', winner: fighter === entities.player ? 'enemy' : 'player' });
  }, 2000);
};

// Damage number component
const DamageNumber = ({ damage, position, startTime }) => {
  const elapsed = Date.now() - startTime;
  const opacity = Math.max(0, 1 - elapsed / 1000);
  const offsetY = -elapsed / 20;
  
  return (
    <View style={{
      position: 'absolute',
      left: position.x - 20,
      top: position.y + offsetY,
      opacity,
    }}>
      <Text style={{
        color: '#FF0000',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}>
        -{damage}
      </Text>
    </View>
  );
};

// Combo counter component
const ComboCounter = ({ combo, position }) => {
  return (
    <View style={{
      position: 'absolute',
      left: position.x - 30,
      top: position.y,
      backgroundColor: '#FFD700',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
    }}>
      <Text style={{
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
      }}>
        {combo} HIT!
      </Text>
    </View>
  );
};

export default BattlePhysicsSystem;