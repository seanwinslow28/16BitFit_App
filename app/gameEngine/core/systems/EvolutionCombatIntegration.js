/**
 * Evolution Combat Integration System
 * Connects the 5-stage evolution system with combat mechanics
 * Handles visual effects, stat modifiers, and evolution-based combat features
 */

import evolutionManager, { EvolutionStages } from '../../../services/CharacterEvolutionSystem';
import spriteManager from '../../../services/EvolutionSpriteManager';
import ParticleEffectSystem from './ParticleEffectSystem';
import AuraEffectSystem from './AuraEffectSystem';
import PerformanceMonitor from '../utils/PerformanceMonitor';

class EvolutionCombatIntegration {
  constructor() {
    this.particleSystem = new ParticleEffectSystem();
    this.auraSystem = new AuraEffectSystem();
    this.activeEffects = new Map();
    this.evolutionModifiers = new Map();
  }

  /**
   * Initialize evolution combat integration for a fighter
   */
  initializeFighter(fighter) {
    const evolution = evolutionManager.getCurrentEvolution();
    
    // Set up evolution-based properties
    fighter.evolutionStage = evolution.id;
    fighter.evolutionName = evolution.name;
    fighter.powerMultiplier = evolution.powerMultiplier;
    
    // Apply visual theme
    fighter.visualTheme = evolution.visualTheme;
    fighter.equipment = evolution.equipment;
    
    // Initialize aura and particle effects
    if (evolution.visualTheme.auraColor) {
      this.auraSystem.createAura(fighter.id, {
        color: evolution.visualTheme.auraColor,
        intensity: evolution.visualTheme.glowIntensity,
        size: this.getAuraSize(evolution.id),
      });
    }
    
    // Set up hitbox/hurtbox modifiers based on evolution
    this.updateHitboxSizes(fighter, evolution.id);
    
    // Initialize evolution-specific abilities
    this.initializeEvolutionAbilities(fighter, evolution.id);
    
    return fighter;
  }

  /**
   * Update hitbox/hurtbox sizes based on evolution stage
   */
  updateHitboxSizes(fighter, evolutionStage) {
    // Evolution stage affects fighter size and reach
    const sizeModifiers = {
      0: { scale: 1.0, reach: 1.0 },     // Basic
      1: { scale: 1.05, reach: 1.1 },    // Intermediate
      2: { scale: 1.1, reach: 1.2 },     // Advanced
      3: { scale: 1.15, reach: 1.3 },    // Master
      4: { scale: 1.2, reach: 1.4 },     // Legend
    };
    
    const modifier = sizeModifiers[evolutionStage] || sizeModifiers[0];
    
    // Update fighter dimensions
    fighter.width = (fighter.baseWidth || 64) * modifier.scale;
    fighter.height = (fighter.baseHeight || 96) * modifier.scale;
    fighter.attackRange = (fighter.baseAttackRange || 80) * modifier.reach;
    
    // Update hitbox
    fighter.hitbox = {
      x: fighter.position.x - fighter.width / 2,
      y: fighter.position.y - fighter.height,
      width: fighter.width,
      height: fighter.height,
    };
  }

  /**
   * Apply evolution-based stat modifiers to combat calculations
   */
  applyEvolutionModifiers(baseDamage, attacker, defender) {
    const attackerEvolution = this.getEvolutionData(attacker.evolutionStage);
    const defenderEvolution = this.getEvolutionData(defender.evolutionStage);
    
    // Apply attacker's power multiplier
    let damage = baseDamage * attackerEvolution.powerMultiplier;
    
    // Apply evolution-based damage bonus
    const evolutionBonus = 1 + (attacker.evolutionStage * 0.15);
    damage *= evolutionBonus;
    
    // Apply defender's evolution defense
    const defenseModifier = 1 - (defender.evolutionStage * 0.05);
    damage *= defenseModifier;
    
    // Special evolution matchup bonuses
    if (attacker.evolutionStage > defender.evolutionStage) {
      const stageDifference = attacker.evolutionStage - defender.evolutionStage;
      damage *= (1 + stageDifference * 0.1); // 10% bonus per stage difference
    }
    
    return Math.floor(damage);
  }

  /**
   * Update combat visuals based on evolution
   */
  updateCombatVisuals(fighter, action, timestep) {
    const evolution = this.getEvolutionData(fighter.evolutionStage);
    
    // Update aura effects
    if (evolution.visualTheme.auraColor) {
      this.auraSystem.update(fighter.id, {
        position: fighter.position,
        intensity: this.getAuraIntensity(fighter, action),
        pulse: action === 'special' || action === 'ultimate',
      });
    }
    
    // Update particle effects
    if (evolution.visualTheme.particleEffect) {
      this.updateParticleEffects(fighter, action, evolution);
    }
    
    // Handle special move transformations
    if (action === 'special' || action === 'ultimate') {
      this.triggerTransformationEffect(fighter, evolution);
    }
  }

  /**
   * Create attack visual effects based on evolution
   */
  createAttackEffects(attacker, attack, hitPosition) {
    const evolution = this.getEvolutionData(attacker.evolutionStage);
    const effects = [];
    
    // Check performance budget
    const budget = PerformanceMonitor.getEvolutionEffectBudget();
    if (!PerformanceMonitor.isPerformanceAcceptable() && effects.length > 2) {
      return effects.slice(0, 2); // Limit effects if performance is poor
    }
    
    // Basic hit effect
    effects.push({
      type: 'hit',
      position: hitPosition,
      sprite: this.getHitEffectSprite(attacker.evolutionStage, attack.type),
      scale: 1 + (attacker.evolutionStage * 0.2),
      duration: 300,
    });
    
    // Evolution-specific effects
    switch (attacker.evolutionStage) {
      case 1: // Intermediate - Energy wisps
        effects.push({
          type: 'energy_wisp',
          position: hitPosition,
          count: 3,
          color: evolution.visualTheme.primary,
          spread: 50,
          duration: 500,
        });
        break;
        
      case 2: // Advanced - Power flames
        effects.push({
          type: 'flame_burst',
          position: hitPosition,
          count: 5,
          color: evolution.visualTheme.primary,
          size: 'medium',
          duration: 600,
        });
        break;
        
      case 3: // Master - Golden energy
        effects.push({
          type: 'golden_explosion',
          position: hitPosition,
          rings: 2,
          color: evolution.visualTheme.auraColor,
          size: 'large',
          duration: 800,
        });
        break;
        
      case 4: // Legend - Cosmic energy
        effects.push({
          type: 'cosmic_impact',
          position: hitPosition,
          shockwaves: 3,
          color: evolution.visualTheme.auraColor,
          distortion: true,
          screenShake: true,
          duration: 1000,
        });
        break;
    }
    
    // Create special move effects
    if (attack.type === 'special' || attack.type === 'ultimate') {
      effects.push(...this.createSpecialMoveEffects(attacker, attack, hitPosition));
    }
    
    return effects;
  }

  /**
   * Create special move visual effects
   */
  createSpecialMoveEffects(fighter, attack, position) {
    const effects = [];
    const evolution = this.getEvolutionData(fighter.evolutionStage);
    
    // Evolution-specific special effects
    const specialEffects = {
      1: { // Intermediate
        chargeUp: { particles: 10, color: '#3498db', size: 'small' },
        impact: { type: 'energy_burst', radius: 100 },
      },
      2: { // Advanced
        chargeUp: { particles: 20, color: '#9b59b6', size: 'medium', spiral: true },
        impact: { type: 'flame_wave', radius: 150, flames: 8 },
      },
      3: { // Master
        chargeUp: { particles: 30, color: '#ffd700', size: 'large', vortex: true },
        impact: { type: 'golden_nova', radius: 200, rings: 3 },
      },
      4: { // Legend
        chargeUp: { particles: 50, color: '#ff0000', size: 'huge', reality_tear: true },
        impact: { type: 'cosmic_annihilation', radius: 300, blackhole: true },
      },
    };
    
    const stageEffects = specialEffects[fighter.evolutionStage] || specialEffects[1];
    
    // Charge-up effect
    effects.push({
      type: 'charge_up',
      position: fighter.position,
      ...stageEffects.chargeUp,
      duration: 500,
    });
    
    // Impact effect
    effects.push({
      type: 'special_impact',
      position: position,
      ...stageEffects.impact,
      evolutionStage: fighter.evolutionStage,
      duration: 1000,
    });
    
    return effects;
  }

  /**
   * Handle transformation effects during special moves
   */
  triggerTransformationEffect(fighter, evolution) {
    // Temporary visual transformation during special moves
    const transformationData = {
      scale: 1.2 + (evolution.id * 0.1),
      glowIntensity: evolution.visualTheme.glowIntensity * 2,
      auraExpansion: 1.5,
      duration: 1000,
      
      // Evolution-specific transformations
      effects: {
        0: null, // Basic - no transformation
        1: { type: 'energy_surge', color: '#3498db' },
        2: { type: 'power_awakening', color: '#9b59b6', flames: true },
        3: { type: 'golden_ascension', color: '#ffd700', wings: true },
        4: { type: 'cosmic_transcendence', color: '#ff0000', reality_warp: true },
      }[evolution.id],
    };
    
    // Store transformation state
    fighter.isTransformed = true;
    fighter.transformationEnd = Date.now() + transformationData.duration;
    fighter.transformationData = transformationData;
    
    // Create transformation particles
    if (transformationData.effects) {
      this.particleSystem.createBurst({
        position: fighter.position,
        type: transformationData.effects.type,
        color: transformationData.effects.color,
        count: 20 + (evolution.id * 10),
        spread: 100,
        duration: transformationData.duration,
      });
    }
  }

  /**
   * Update particle effects based on action and evolution
   */
  updateParticleEffects(fighter, action, evolution) {
    // Check performance budget
    const budget = PerformanceMonitor.getEvolutionEffectBudget();
    
    const particleConfigs = {
      'energy_wisps': {
        count: 3,
        speed: 50,
        lifetime: 1000,
        color: evolution.visualTheme.primary,
        orbit: true,
      },
      'power_flames': {
        count: 5,
        speed: 80,
        lifetime: 800,
        color: evolution.visualTheme.primary,
        rise: true,
      },
      'golden_energy': {
        count: 8,
        speed: 100,
        lifetime: 1200,
        color: '#ffd700',
        sparkle: true,
      },
      'cosmic_energy': {
        count: 12,
        speed: 120,
        lifetime: 1500,
        color: evolution.visualTheme.auraColor,
        warp: true,
        trail: true,
      },
    };
    
    const config = particleConfigs[evolution.visualTheme.particleEffect];
    if (config) {
      // Apply performance budget limits
      config.count = Math.min(config.count, budget.maxParticlesPerEffect);
      
      // Increase particle intensity during attacks
      if (action === 'attack' || action === 'special') {
        config.count = Math.min(config.count * 2, budget.maxParticlesPerEffect);
        config.speed *= 1.5;
      }
      
      this.particleSystem.updateEmitter(fighter.id, {
        position: fighter.position,
        ...config,
      });
    }
  }

  /**
   * Get aura size based on evolution stage
   */
  getAuraSize(evolutionStage) {
    const sizes = {
      0: 0,    // No aura
      1: 80,   // Small aura
      2: 100,  // Medium aura
      3: 120,  // Large aura
      4: 150,  // Massive aura
    };
    return sizes[evolutionStage] || 0;
  }

  /**
   * Get aura intensity based on fighter state
   */
  getAuraIntensity(fighter, action) {
    const baseIntensity = this.getEvolutionData(fighter.evolutionStage).visualTheme.glowIntensity;
    
    // Modify intensity based on action
    const actionModifiers = {
      'idle': 1.0,
      'walk': 1.1,
      'attack': 1.5,
      'special': 2.0,
      'ultimate': 3.0,
      'hurt': 0.5,
      'block': 1.2,
    };
    
    const modifier = actionModifiers[action] || 1.0;
    
    // Add health-based intensity
    const healthPercent = fighter.health / fighter.maxHealth;
    const healthModifier = healthPercent < 0.3 ? 1.5 : 1.0;
    
    return baseIntensity * modifier * healthModifier;
  }

  /**
   * Get hit effect sprite based on evolution and attack type
   */
  getHitEffectSprite(evolutionStage, attackType) {
    const baseEffects = {
      'normal': 'hit_normal',
      'heavy': 'hit_heavy',
      'special': 'hit_spark',
      'critical': 'critical_hit',
    };
    
    // Evolution-specific hit effects
    const evolutionEffects = {
      0: baseEffects[attackType] || 'hit_normal',
      1: attackType === 'special' ? 'energy_burst' : baseEffects[attackType],
      2: attackType === 'special' ? 'flame_impact' : 'hit_heavy',
      3: attackType === 'special' ? 'golden_explosion' : 'super_hit',
      4: attackType === 'special' ? 'cosmic_annihilation' : 'super_hit',
    };
    
    return evolutionEffects[evolutionStage] || 'hit_normal';
  }

  /**
   * Initialize evolution-specific abilities
   */
  initializeEvolutionAbilities(fighter, evolutionStage) {
    const abilities = {
      0: [], // Basic - no special abilities
      1: ['energy_wave'], // Intermediate - projectile
      2: ['energy_wave', 'power_dash'], // Advanced - projectile + dash
      3: ['energy_wave', 'power_dash', 'counter_strike'], // Master - counter ability
      4: ['energy_wave', 'power_dash', 'counter_strike', 'time_slow'], // Legend - time manipulation
    };
    
    fighter.evolutionAbilities = abilities[evolutionStage] || [];
    fighter.canUseSpecial = evolutionStage >= 1;
    fighter.canUseUltimate = evolutionStage >= 2;
    fighter.canTranscend = evolutionStage === 4;
  }

  /**
   * Get evolution data helper
   */
  getEvolutionData(evolutionStage) {
    const stages = Object.values(EvolutionStages);
    return stages.find(stage => stage.id === evolutionStage) || stages[0];
  }

  /**
   * Check if evolution grants special combat properties
   */
  getEvolutionCombatProperties(evolutionStage) {
    const properties = {
      0: { // Basic
        damageReduction: 0,
        critChance: 0.05,
        dodgeChance: 0,
        counterChance: 0,
      },
      1: { // Intermediate
        damageReduction: 0.05,
        critChance: 0.08,
        dodgeChance: 0.02,
        counterChance: 0,
      },
      2: { // Advanced
        damageReduction: 0.1,
        critChance: 0.12,
        dodgeChance: 0.05,
        counterChance: 0.05,
      },
      3: { // Master
        damageReduction: 0.15,
        critChance: 0.15,
        dodgeChance: 0.08,
        counterChance: 0.1,
      },
      4: { // Legend
        damageReduction: 0.2,
        critChance: 0.2,
        dodgeChance: 0.1,
        counterChance: 0.15,
        damageReflection: 0.1, // Unique to Legend
      },
    };
    
    return properties[evolutionStage] || properties[0];
  }

  /**
   * Apply evolution combat properties to damage calculation
   */
  applyEvolutionDefense(damage, defender) {
    const properties = this.getEvolutionCombatProperties(defender.evolutionStage);
    
    // Apply damage reduction
    damage *= (1 - properties.damageReduction);
    
    // Check for dodge
    if (Math.random() < properties.dodgeChance) {
      return { damage: 0, dodged: true };
    }
    
    // Check for counter (only if not already countering)
    if (!defender.isCountering && Math.random() < properties.counterChance) {
      defender.triggerCounter = true;
    }
    
    // Legend-specific damage reflection
    if (properties.damageReflection && Math.random() < properties.damageReflection) {
      return { damage: Math.floor(damage * 0.5), reflected: Math.floor(damage * 0.5) };
    }
    
    return { damage: Math.floor(damage), dodged: false };
  }

  /**
   * Update all active effects
   */
  update(entities, timestep) {
    // Update particle system
    this.particleSystem.update(timestep);
    
    // Update aura system
    this.auraSystem.update(timestep);
    
    // Update transformation states
    Object.values(entities).forEach(entity => {
      if (entity.type === 'fighter' && entity.isTransformed) {
        if (Date.now() > entity.transformationEnd) {
          entity.isTransformed = false;
          entity.transformationData = null;
        }
      }
    });
  }

  /**
   * Clean up effects for removed entities
   */
  cleanup(entityId) {
    this.particleSystem.removeEmitter(entityId);
    this.auraSystem.removeAura(entityId);
    this.activeEffects.delete(entityId);
  }
}

// Export singleton instance
export default new EvolutionCombatIntegration();