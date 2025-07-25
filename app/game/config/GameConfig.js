/**
 * Game Configuration
 * Central configuration for the 16BitFit fighting game
 */

export const GAME_CONFIG = {
  // Display settings
  width: 896,
  height: 504,
  pixelArt: true,
  antialias: false,
  
  // Physics settings
  gravity: 800,
  playerSpeed: 200,
  jumpVelocity: -400,
  
  // Combat settings
  combat: {
    lightAttackDamage: 10,
    heavyAttackDamage: 20,
    specialAttackDamage: 35,
    blockDamageReduction: 0.8,
    comboTimeWindow: 2000, // ms
    hitStunDuration: 300, // ms
    specialMeterMax: 100,
    specialMeterGainPerHit: 15,
  },
  
  // Character settings
  player: {
    health: 100,
    width: 64,
    height: 64,
    hitboxWidth: 48,
    hitboxHeight: 60,
  },
  
  // Boss settings
  bosses: {
    sloth_demon: {
      health: 100,
      attackPower: 15,
      defense: 10,
      attackCooldown: 2000,
      specialCooldown: 5000,
      moveSpeed: 100,
    },
    junk_food_monster: {
      health: 150,
      attackPower: 20,
      defense: 15,
      attackCooldown: 1500,
      specialCooldown: 4000,
      moveSpeed: 150,
    },
    procrastination_phantom: {
      health: 200,
      attackPower: 25,
      defense: 20,
      attackCooldown: 1000,
      specialCooldown: 3000,
      moveSpeed: 250,
    },
    stress_titan: {
      health: 250,
      attackPower: 30,
      defense: 25,
      attackCooldown: 1500,
      specialCooldown: 4000,
      moveSpeed: 100,
    },
  },
  
  // Animation settings
  animations: {
    idle: {
      frames: 1,
      frameRate: 1,
      repeat: -1,
    },
    walk: {
      frames: 2,
      frameRate: 8,
      repeat: -1,
    },
    jump: {
      frames: 1,
      frameRate: 1,
      repeat: 0,
    },
    attack_light: {
      frames: 1,
      frameRate: 10,
      repeat: 0,
    },
    attack_heavy: {
      frames: 1,
      frameRate: 8,
      repeat: 0,
    },
    block: {
      frames: 1,
      frameRate: 1,
      repeat: 0,
    },
    hurt: {
      frames: 1,
      frameRate: 8,
      repeat: 0,
    },
    special: {
      frames: 2,
      frameRate: 12,
      repeat: 0,
    },
  },
  
  // UI settings
  ui: {
    healthBarWidth: 300,
    healthBarHeight: 20,
    specialMeterWidth: 200,
    specialMeterHeight: 10,
    comboTextSize: 24,
    damageNumberSize: 18,
  },
  
  // Audio settings
  audio: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6,
  },
  
  // Color palette (GameBoy style)
  colors: {
    primary: 0x92CC41,      // GameBoy green
    dark: 0x0D0D0D,         // Deep black
    yellow: 0xF7D51D,       // Level badge yellow
    red: 0xE53935,          // Damage color
    blue: 0x3498db,         // Special move color
    screenBg: 0x9BBC0F,     // Classic GameBoy screen
  },
};

// Helper functions
export const calculateDamage = (baseDamage, attackerStrength, defenderDefense) => {
  const strengthBonus = attackerStrength * 0.1;
  const defenseReduction = defenderDefense * 0.05;
  return Math.max(1, Math.floor(baseDamage + strengthBonus - defenseReduction));
};

export const calculateSpecialMeterGain = (comboCount) => {
  const baseGain = GAME_CONFIG.combat.specialMeterGainPerHit;
  const comboBonus = Math.min(comboCount * 2, 10);
  return baseGain + comboBonus;
};

export const getHitboxForAction = (action) => {
  const hitboxes = {
    attack_light: { width: 80, height: 40, offsetX: 40, offsetY: 0 },
    attack_heavy: { width: 100, height: 60, offsetX: 50, offsetY: -10 },
    special: { width: 120, height: 80, offsetX: 60, offsetY: -20 },
  };
  return hitboxes[action] || null;
};