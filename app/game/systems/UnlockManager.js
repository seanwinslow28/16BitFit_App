/**
 * Unlock Manager
 * Manages unlockable content like special moves, skins, and abilities
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class UnlockManager {
  constructor(scene) {
    this.scene = scene;
    this.unlockedContent = new Set();
    this.specialMoves = this.defineSpecialMoves();
    this.skins = this.defineSkins();
    this.abilities = this.defineAbilities();
  }
  
  // Define available special moves
  defineSpecialMoves() {
    return {
      'default_special': {
        id: 'default_special',
        name: 'Power Strike',
        description: 'A powerful charging attack',
        damage: 50,
        meterCost: 100,
        unlockCondition: 'default',
        animation: 'player_special_default',
        effects: ['screen_shake', 'impact_burst'],
      },
      'special_move_2': {
        id: 'special_move_2',
        name: 'Whirlwind Kick',
        description: 'Spinning multi-hit attack',
        damage: 30,
        hits: 3,
        meterCost: 100,
        unlockCondition: 'achievement:combo_master',
        animation: 'player_special_whirlwind',
        effects: ['wind_effect', 'multi_hit'],
      },
      'perfect_stance': {
        id: 'perfect_stance',
        name: 'Perfect Counter',
        description: 'Counter-attack with double damage',
        damage: 'counter',
        meterCost: 50,
        unlockCondition: 'achievement:perfectionist',
        animation: 'player_special_counter',
        effects: ['time_slow', 'counter_flash'],
      },
      'ultimate_fury': {
        id: 'ultimate_fury',
        name: 'Ultimate Fury',
        description: 'Unleash a devastating combo',
        damage: 100,
        meterCost: 150,
        unlockCondition: 'level:50',
        animation: 'player_special_ultimate',
        effects: ['screen_flash', 'ultimate_aura'],
      },
    };
  }
  
  // Define available skins
  defineSkins() {
    return {
      'default': {
        id: 'default',
        name: 'Hero',
        description: 'The default hero appearance',
        spriteSheet: 'Sean_Fighter-Sprite-Sheet',
        tint: null,
        unlockCondition: 'default',
      },
      'golden_aura': {
        id: 'golden_aura',
        name: 'Golden Warrior',
        description: 'Radiate with golden power',
        spriteSheet: 'Sean_Fighter-Sprite-Sheet',
        tint: 0xFFD700,
        auraEffect: 'golden',
        unlockCondition: 'achievement:untouchable',
      },
      'champion_skin': {
        id: 'champion_skin',
        name: 'Champion',
        description: 'The ultimate warrior outfit',
        spriteSheet: 'Sean_Fighter-Sprite-Sheet',
        tint: 0x9C27B0,
        particleEffect: 'champion_sparkles',
        unlockCondition: 'achievement:boss_slayer',
      },
      'shadow_form': {
        id: 'shadow_form',
        name: 'Shadow Form',
        description: 'Embrace the darkness',
        spriteSheet: 'Sean_Fighter-Sprite-Sheet',
        tint: 0x424242,
        alpha: 0.8,
        unlockCondition: 'defeats:100',
      },
      'retro_pixel': {
        id: 'retro_pixel',
        name: 'Retro Pixel',
        description: '8-bit style appearance',
        spriteSheet: 'Sean_Fighter-Sprite-Sheet',
        pixelated: true,
        scale: 0.8,
        unlockCondition: 'battles:25',
      },
    };
  }
  
  // Define unlockable abilities
  defineAbilities() {
    return {
      'double_jump': {
        id: 'double_jump',
        name: 'Double Jump',
        description: 'Jump again while in mid-air',
        type: 'passive',
        unlockCondition: 'level:10',
      },
      'air_dash': {
        id: 'air_dash',
        name: 'Air Dash',
        description: 'Dash forward while airborne',
        type: 'active',
        unlockCondition: 'combos:50',
      },
      'rage_mode': {
        id: 'rage_mode',
        name: 'Rage Mode',
        description: 'Increased damage when health is low',
        type: 'passive',
        effect: 'damage_boost_low_health',
        unlockCondition: 'comebacks:10',
      },
      'meter_master': {
        id: 'meter_master',
        name: 'Meter Master',
        description: 'Special meter charges faster',
        type: 'passive',
        effect: 'meter_gain_boost',
        unlockCondition: 'special_moves:100',
      },
    };
  }
  
  // Load unlocked content for player
  async loadUnlockedContent(playerId) {
    try {
      // Get unlocks from battle data service
      const { default: battleDataService } = await import('../../services/battleDataService');
      const unlocks = await battleDataService.getPlayerUnlocks(playerId);
      
      // Add to unlocked set
      unlocks.forEach(unlockId => this.unlockedContent.add(unlockId));
      
      // Add default unlocks
      this.unlockedContent.add('default');
      this.unlockedContent.add('default_special');
      
      console.log('Loaded unlocks:', Array.from(this.unlockedContent));
    } catch (error) {
      console.error('Error loading unlocks:', error);
    }
  }
  
  // Check if content is unlocked
  isUnlocked(contentId) {
    return this.unlockedContent.has(contentId);
  }
  
  // Get available special moves
  getAvailableSpecialMoves() {
    const available = [];
    
    for (const [id, move] of Object.entries(this.specialMoves)) {
      if (this.isUnlocked(id)) {
        available.push(move);
      }
    }
    
    return available;
  }
  
  // Get available skins
  getAvailableSkins() {
    const available = [];
    
    for (const [id, skin] of Object.entries(this.skins)) {
      if (this.isUnlocked(id)) {
        available.push(skin);
      }
    }
    
    return available;
  }
  
  // Get available abilities
  getAvailableAbilities() {
    const available = [];
    
    for (const [id, ability] of Object.entries(this.abilities)) {
      if (this.isUnlocked(id)) {
        available.push(ability);
      }
    }
    
    return available;
  }
  
  // Get locked content with requirements
  getLockedContent() {
    const locked = {
      moves: [],
      skins: [],
      abilities: [],
    };
    
    // Check special moves
    for (const [id, move] of Object.entries(this.specialMoves)) {
      if (!this.isUnlocked(id)) {
        locked.moves.push({
          ...move,
          requirement: this.parseUnlockCondition(move.unlockCondition),
        });
      }
    }
    
    // Check skins
    for (const [id, skin] of Object.entries(this.skins)) {
      if (!this.isUnlocked(id)) {
        locked.skins.push({
          ...skin,
          requirement: this.parseUnlockCondition(skin.unlockCondition),
        });
      }
    }
    
    // Check abilities
    for (const [id, ability] of Object.entries(this.abilities)) {
      if (!this.isUnlocked(id)) {
        locked.abilities.push({
          ...ability,
          requirement: this.parseUnlockCondition(ability.unlockCondition),
        });
      }
    }
    
    return locked;
  }
  
  // Parse unlock condition to human-readable format
  parseUnlockCondition(condition) {
    if (condition === 'default') return 'Available from start';
    
    const [type, value] = condition.split(':');
    
    switch (type) {
      case 'achievement':
        return `Unlock achievement: ${this.getAchievementName(value)}`;
      case 'level':
        return `Reach level ${value}`;
      case 'defeats':
        return `Defeat ${value} enemies`;
      case 'battles':
        return `Complete ${value} battles`;
      case 'combos':
        return `Perform ${value} combos`;
      case 'comebacks':
        return `Win ${value} battles from low health`;
      case 'special_moves':
        return `Use ${value} special moves`;
      default:
        return condition;
    }
  }
  
  // Get achievement name from ID
  getAchievementName(achievementId) {
    const achievementNames = {
      'combo_master': 'Combo Master',
      'untouchable': 'Untouchable',
      'perfectionist': 'Perfectionist',
      'boss_slayer': 'Boss Slayer',
    };
    
    return achievementNames[achievementId] || achievementId;
  }
  
  // Apply skin to player
  applySkin(player, skinId) {
    const skin = this.skins[skinId];
    if (!skin || !this.isUnlocked(skinId)) {
      console.warn(`Skin ${skinId} not available`);
      return;
    }
    
    // Apply tint
    if (skin.tint !== null) {
      player.setTint(skin.tint);
    } else {
      player.clearTint();
    }
    
    // Apply alpha
    if (skin.alpha) {
      player.setAlpha(skin.alpha);
    }
    
    // Apply scale
    if (skin.scale) {
      player.setScale(skin.scale);
    }
    
    // Apply pixelated effect
    if (skin.pixelated) {
      player.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    
    // Add aura effect
    if (skin.auraEffect) {
      this.createAuraEffect(player, skin.auraEffect);
    }
    
    // Add particle effect
    if (skin.particleEffect) {
      this.createParticleEffect(player, skin.particleEffect);
    }
    
    player.currentSkin = skinId;
  }
  
  // Create aura effect for skin
  createAuraEffect(player, auraType) {
    const auraColors = {
      'golden': 0xFFD700,
      'shadow': 0x424242,
      'champion': 0x9C27B0,
    };
    
    const color = auraColors[auraType] || 0xFFFFFF;
    
    // Create aura sprite behind player
    const aura = this.scene.add.sprite(player.x, player.y, player.texture.key);
    aura.setTint(color);
    aura.setAlpha(0.5);
    aura.setScale(player.scaleX * 1.2, player.scaleY * 1.2);
    aura.setDepth(player.depth - 1);
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: aura,
      scale: player.scaleX * 1.3,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    
    // Follow player
    player.auraEffect = aura;
    player.on('destroy', () => aura.destroy());
  }
  
  // Create particle effect for skin
  createParticleEffect(player, particleType) {
    if (particleType === 'champion_sparkles') {
      // Create sparkle particles
      const particles = this.scene.add.particles(player.x, player.y, 'particle', {
        frame: 'sparkle',
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        speed: { min: 20, max: 50 },
        lifespan: 1000,
        frequency: 100,
        emitting: true,
        tint: [0xFFD700, 0x9C27B0, 0xFFFFFF],
      });
      
      particles.setDepth(player.depth + 1);
      
      // Follow player
      player.particleEffect = particles;
      player.on('destroy', () => particles.destroy());
    }
  }
  
  // Get special move by ID
  getSpecialMove(moveId) {
    return this.specialMoves[moveId];
  }
  
  // Check if ability is active
  hasAbility(abilityId) {
    return this.isUnlocked(abilityId);
  }
  
  // Apply ability effects
  applyAbilityEffects(player) {
    const abilities = this.getAvailableAbilities();
    
    abilities.forEach(ability => {
      switch (ability.id) {
        case 'double_jump':
          player.canDoubleJump = true;
          break;
        case 'air_dash':
          player.canAirDash = true;
          break;
        case 'rage_mode':
          // Applied in damage calculation
          player.hasRageMode = true;
          break;
        case 'meter_master':
          player.meterGainMultiplier = 1.5;
          break;
      }
    });
  }
}
