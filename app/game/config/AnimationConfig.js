/**
 * Animation Configuration
 * Defines all sprite animations for characters
 */

export const ANIMATION_CONFIG = {
  // Player character animations (Sean Fighter as default)
  player: {
    idle: {
      key: 'player_idle',
      frames: [0, 1, 2, 3], // First row: idle animation
      frameRate: 8,
      repeat: -1,
    },
    walk: {
      key: 'player_walk',
      frames: [4, 5, 6, 7], // Second row: walk cycle
      frameRate: 10,
      repeat: -1,
    },
    jump: {
      key: 'player_jump',
      frames: [8], // Third row, first frame
      frameRate: 1,
      repeat: 0,
    },
    fall: {
      key: 'player_fall',
      frames: [9], // Third row, second frame
      frameRate: 1,
      repeat: 0,
    },
    attack_light: {
      key: 'player_attack_light',
      frames: [10, 11], // Third row: light attack
      frameRate: 12,
      repeat: 0,
    },
    attack_heavy: {
      key: 'player_attack_heavy',
      frames: [12, 13], // Fourth row: heavy attack
      frameRate: 10,
      repeat: 0,
    },
    block: {
      key: 'player_block',
      frames: [14], // Fourth row: block pose
      frameRate: 1,
      repeat: 0,
    },
    hurt: {
      key: 'player_hurt',
      frames: [15], // Fourth row: hurt pose
      frameRate: 8,
      repeat: 0,
    },
    victory: {
      key: 'player_victory',
      frames: [0, 1, 2, 3], // Use idle frames for victory
      frameRate: 12,
      repeat: -1,
    },
    defeat: {
      key: 'player_defeat',
      frames: [15], // Use hurt frame for defeat
      frameRate: 1,
      repeat: 0,
    },
  },
  
  // Boss animations (same structure for all bosses)
  boss: {
    idle: {
      frames: [0, 1, 2, 3],
      frameRate: 6,
      repeat: -1,
    },
    walk: {
      frames: [4, 5, 6, 7],
      frameRate: 8,
      repeat: -1,
    },
    attack: {
      frames: [10, 11],
      frameRate: 10,
      repeat: 0,
    },
    special: {
      frames: [12, 13],
      frameRate: 8,
      repeat: 0,
    },
    hurt: {
      frames: [15],
      frameRate: 8,
      repeat: 0,
    },
    victory: {
      frames: [0, 1, 2, 3],
      frameRate: 10,
      repeat: -1,
    },
    defeat: {
      frames: [15],
      frameRate: 1,
      repeat: 0,
    },
  },
};

// Helper function to create animations for a character
export const createCharacterAnimations = (scene, spriteKey, animPrefix) => {
  const config = animPrefix.includes('boss') ? ANIMATION_CONFIG.boss : ANIMATION_CONFIG.player;
  
  Object.entries(config).forEach(([name, anim]) => {
    const animKey = `${animPrefix}_${name}`;
    
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(spriteKey, { frames: anim.frames }),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }
  });
};

// Sprite to boss mapping
export const BOSS_SPRITES = {
  sloth_demon: 'gym_bully',
  junk_food_monster: 'fit_cat',
  procrastination_phantom: 'buff_mage',
  stress_titan: 'rookie_ryu',
};