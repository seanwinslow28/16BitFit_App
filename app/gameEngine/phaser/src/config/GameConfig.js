/**
 * Main Game Configuration for 16BitFit
 * Optimized for 60fps mobile performance and Street Fighter 2 style mechanics
 */

export const GameConfig = {
  // Display settings
  display: {
    width: 414, // iPhone 12 Pro width
    height: 896, // iPhone 12 Pro height
    pixelArt: true,
    antialias: false,
    targetFPS: 60,
    minFPS: 30,
  },

  // Combat settings - Street Fighter 2 inspired
  combat: {
    frameData: {
      lightPunch: { startup: 3, active: 2, recovery: 7, damage: 10, hitstun: 12, blockstun: 8 },
      mediumPunch: { startup: 5, active: 3, recovery: 10, damage: 20, hitstun: 16, blockstun: 12 },
      heavyPunch: { startup: 8, active: 4, recovery: 14, damage: 30, hitstun: 20, blockstun: 16 },
      lightKick: { startup: 4, active: 2, recovery: 8, damage: 12, hitstun: 14, blockstun: 10 },
      mediumKick: { startup: 6, active: 3, recovery: 12, damage: 22, hitstun: 18, blockstun: 14 },
      heavyKick: { startup: 10, active: 4, recovery: 16, damage: 35, hitstun: 24, blockstun: 18 },
    },
    comboCancelWindow: 8, // frames to cancel into next move
    inputBufferWindow: 10, // frames to buffer inputs
    maxComboLength: 10,
    damageScaling: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.3], // per hit in combo
    pushbackOnHit: 4,
    pushbackOnBlock: 2,
  },

  // Character evolution settings
  evolution: {
    stages: [
      { level: 1, name: 'Base', powerMultiplier: 1.0, speedMultiplier: 1.0 },
      { level: 10, name: 'Enhanced', powerMultiplier: 1.2, speedMultiplier: 1.1 },
      { level: 25, name: 'Advanced', powerMultiplier: 1.5, speedMultiplier: 1.2 },
      { level: 50, name: 'Elite', powerMultiplier: 2.0, speedMultiplier: 1.3 },
      { level: 100, name: 'Ultimate', powerMultiplier: 3.0, speedMultiplier: 1.5 },
    ],
    visualEffects: {
      auraColors: ['#FFFFFF', '#00FF00', '#0080FF', '#FF00FF', '#FFD700'],
      particleCount: [0, 5, 10, 20, 30],
      glowIntensity: [0, 0.2, 0.4, 0.6, 1.0],
    },
  },

  // Boss AI settings
  bossAI: {
    difficulty: {
      easy: { reactionTime: 500, mistakeChance: 0.3, comboLength: 2 },
      normal: { reactionTime: 300, mistakeChance: 0.2, comboLength: 3 },
      hard: { reactionTime: 150, mistakeChance: 0.1, comboLength: 5 },
      expert: { reactionTime: 100, mistakeChance: 0.05, comboLength: 7 },
    },
    patterns: {
      aggressive: { attackWeight: 0.7, defendWeight: 0.2, movementWeight: 0.1 },
      defensive: { attackWeight: 0.3, defendWeight: 0.5, movementWeight: 0.2 },
      balanced: { attackWeight: 0.5, defendWeight: 0.3, movementWeight: 0.2 },
    },
  },

  // Touch control settings
  touchControls: {
    zones: {
      movement: { x: 0, y: 0.5, width: 0.3, height: 0.5 }, // Left side
      lightAttack: { x: 0.7, y: 0.6, width: 0.15, height: 0.2 },
      heavyAttack: { x: 0.85, y: 0.6, width: 0.15, height: 0.2 },
      special: { x: 0.775, y: 0.8, width: 0.15, height: 0.2 },
      block: { x: 0.7, y: 0.4, width: 0.3, height: 0.2 },
    },
    sensitivity: 0.7,
    deadZone: 0.1,
    doubleTapWindow: 300, // ms for dash
    holdThreshold: 200, // ms for charge moves
  },

  // Performance settings
  performance: {
    maxSprites: 100,
    particlePoolSize: 500,
    textureAtlasSize: 2048,
    enableDynamicQuality: true,
    qualityLevels: {
      low: { particles: 0.3, shadows: false, effects: 0.5 },
      medium: { particles: 0.6, shadows: false, effects: 0.8 },
      high: { particles: 1.0, shadows: true, effects: 1.0 },
    },
  },

  // Audio settings
  audio: {
    masterVolume: 0.8,
    sfxVolume: 0.7,
    musicVolume: 0.5,
    voiceVolume: 0.9,
    enableHaptics: true,
    combatSounds: {
      hit: ['hit1', 'hit2', 'hit3'],
      block: ['block1', 'block2'],
      special: ['special1', 'special2'],
      ko: ['ko1', 'ko2'],
    },
  },

  // Asset paths
  assets: {
    basePath: 'assets/',
    characters: 'characters/',
    backgrounds: 'backgrounds/',
    effects: 'effects/',
    audio: 'audio/',
    ui: 'ui/',
  },
};

// Character archetypes configuration
export const CharacterArchetypes = {
  brawler: {
    name: 'Brawler',
    stats: {
      health: 1200,
      attack: 130,
      defense: 110,
      speed: 90,
      special: 100,
    },
    moveSet: {
      specials: ['PowerPunch', 'RagingUppercut', 'BerserkerRush'],
      supers: ['UltimateBeatdown'],
    },
    combos: [
      { notation: 'LP, MP, HP', damage: 80, difficulty: 'easy' },
      { notation: 'MP, HP, QCF+P', damage: 120, difficulty: 'medium' },
      { notation: 'JP, HP, HCB+K, SUPER', damage: 200, difficulty: 'hard' },
    ],
  },
  speedster: {
    name: 'Speedster',
    stats: {
      health: 900,
      attack: 100,
      defense: 80,
      speed: 150,
      special: 120,
    },
    moveSet: {
      specials: ['LightningDash', 'SpinKick', 'AirCombo'],
      supers: ['HyperSpeed'],
    },
    combos: [
      { notation: 'LK, MK, HK', damage: 70, difficulty: 'easy' },
      { notation: 'LP, MP, QCB+K', damage: 100, difficulty: 'medium' },
      { notation: 'AIR HP, LK, MK, DP+P', damage: 150, difficulty: 'hard' },
    ],
  },
  technician: {
    name: 'Technician',
    stats: {
      health: 1000,
      attack: 110,
      defense: 100,
      speed: 110,
      special: 130,
    },
    moveSet: {
      specials: ['CounterStrike', 'GrapplingHook', 'TacticalRoll'],
      supers: ['PerfectCounter'],
    },
    combos: [
      { notation: 'MP, LP, HP', damage: 85, difficulty: 'easy' },
      { notation: 'COUNTER, HP, QCF+P', damage: 130, difficulty: 'medium' },
      { notation: 'MP, HP, HCF+P, SUPER', damage: 180, difficulty: 'hard' },
    ],
  },
};

// Input notation reference
export const InputNotation = {
  // Directions
  'QCF': 'Quarter Circle Forward',
  'QCB': 'Quarter Circle Back',
  'HCF': 'Half Circle Forward',
  'HCB': 'Half Circle Back',
  'DP': 'Dragon Punch (Forward, Down, Down-Forward)',
  
  // Attacks
  'LP': 'Light Punch',
  'MP': 'Medium Punch',
  'HP': 'Heavy Punch',
  'LK': 'Light Kick',
  'MK': 'Medium Kick',
  'HK': 'Heavy Kick',
  'P': 'Any Punch',
  'K': 'Any Kick',
};

export default GameConfig;