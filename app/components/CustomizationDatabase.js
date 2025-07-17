/**
 * Customization Database
 * All available character appearance options
 */

const CUSTOMIZATION_ITEMS = {
  // Body Types (Base character variations)
  body: [
    {
      id: 'body_default',
      name: 'Classic Fighter',
      icon: '👤',
      category: 'body',
      rarity: 'common',
      description: 'The original 16-bit warrior',
      unlockRequirement: { level: 1 },
      isDefault: true,
    },
    {
      id: 'body_ninja',
      name: 'Shadow Ninja',
      icon: '🥷',
      category: 'body',
      rarity: 'uncommon',
      description: 'Silent but deadly',
      unlockRequirement: { level: 5 },
    },
    {
      id: 'body_knight',
      name: 'Iron Knight',
      icon: '🛡️',
      category: 'body',
      rarity: 'rare',
      description: 'Heavy armor, heavy gains',
      unlockRequirement: { level: 10 },
    },
    {
      id: 'body_monk',
      name: 'Zen Monk',
      icon: '🧘',
      category: 'body',
      rarity: 'rare',
      description: 'Inner peace, outer strength',
      unlockRequirement: { level: 15 },
    },
    {
      id: 'body_robot',
      name: 'Cyber Fighter',
      icon: '🤖',
      category: 'body',
      rarity: 'epic',
      description: 'Futuristic fitness warrior',
      unlockRequirement: { level: 20, achievement: 'Tech Savvy' },
    },
    {
      id: 'body_dragon',
      name: 'Dragon Warrior',
      icon: '🐉',
      category: 'body',
      rarity: 'legendary',
      description: 'Mythical power unleashed',
      unlockRequirement: { level: 30, special: 'Defeat all bosses' },
    },
  ],

  // Hair Styles
  hair: [
    {
      id: 'hair_default',
      name: 'Spiky Fighter',
      icon: '💇',
      category: 'hair',
      rarity: 'common',
      description: 'Classic anime protagonist hair',
      unlockRequirement: { level: 1 },
      isDefault: true,
    },
    {
      id: 'hair_long',
      name: 'Flowing Locks',
      icon: '💁',
      category: 'hair',
      rarity: 'common',
      description: 'Majestic and flowing',
      unlockRequirement: { level: 3 },
    },
    {
      id: 'hair_mohawk',
      name: 'Battle Mohawk',
      icon: '🎸',
      category: 'hair',
      rarity: 'uncommon',
      description: 'Punk rock warrior',
      unlockRequirement: { level: 7 },
    },
    {
      id: 'hair_topknot',
      name: 'Samurai Topknot',
      icon: '🎎',
      category: 'hair',
      rarity: 'uncommon',
      description: 'Honor and discipline',
      unlockRequirement: { level: 8 },
    },
    {
      id: 'hair_afro',
      name: 'Power Afro',
      icon: '🎤',
      category: 'hair',
      rarity: 'rare',
      description: 'Groovy and powerful',
      unlockRequirement: { level: 12 },
    },
    {
      id: 'hair_rainbow',
      name: 'Rainbow Rage',
      icon: '🌈',
      category: 'hair',
      rarity: 'epic',
      description: 'Taste the rainbow gains',
      unlockRequirement: { achievement: 'Diversity Champion' },
    },
    {
      id: 'hair_fire',
      name: 'Flame Hair',
      icon: '🔥',
      category: 'hair',
      rarity: 'legendary',
      description: 'Your gains are on fire!',
      unlockRequirement: { level: 25, achievement: 'Streak Master' },
    },
  ],

  // Outfits
  outfit: [
    {
      id: 'outfit_default',
      name: 'Training Gear',
      icon: '👕',
      category: 'outfit',
      rarity: 'common',
      description: 'Basic but effective',
      unlockRequirement: { level: 1 },
      isDefault: true,
    },
    {
      id: 'outfit_gi',
      name: 'Martial Arts Gi',
      icon: '🥋',
      category: 'outfit',
      rarity: 'common',
      description: 'Traditional warrior attire',
      unlockRequirement: { level: 2 },
    },
    {
      id: 'outfit_tank',
      name: 'Power Tank',
      icon: '🎽',
      category: 'outfit',
      rarity: 'common',
      description: 'Show off those gains',
      unlockRequirement: { achievement: 'First Workout' },
    },
    {
      id: 'outfit_hoodie',
      name: 'Beast Hoodie',
      icon: '🧥',
      category: 'outfit',
      rarity: 'uncommon',
      description: 'Cozy but fierce',
      unlockRequirement: { level: 6 },
    },
    {
      id: 'outfit_armor',
      name: 'Battle Armor',
      icon: '🛡️',
      category: 'outfit',
      rarity: 'rare',
      description: 'Heavy metal workout gear',
      unlockRequirement: { level: 14 },
    },
    {
      id: 'outfit_ninja',
      name: 'Shadow Suit',
      icon: '🥷',
      category: 'outfit',
      rarity: 'rare',
      description: 'Silent gains in the night',
      unlockRequirement: { level: 16 },
    },
    {
      id: 'outfit_tech',
      name: 'Cyber Suit',
      icon: '🦾',
      category: 'outfit',
      rarity: 'epic',
      description: 'Augmented performance wear',
      unlockRequirement: { level: 22, achievement: 'Tech Upgrade' },
    },
    {
      id: 'outfit_golden',
      name: 'Golden Champion',
      icon: '🏆',
      category: 'outfit',
      rarity: 'legendary',
      description: 'For true champions only',
      unlockRequirement: { level: 40, special: 'Reach Champion Evolution' },
    },
  ],

  // Accessories/Gear
  accessories: [
    {
      id: 'gear_none',
      name: 'No Gear',
      icon: '🚫',
      category: 'accessories',
      rarity: 'common',
      description: 'Natural and free',
      unlockRequirement: { level: 1 },
      isDefault: true,
    },
    {
      id: 'gear_headband',
      name: 'Sweat Band',
      icon: '🎯',
      category: 'accessories',
      rarity: 'common',
      description: 'Keep the sweat at bay',
      unlockRequirement: { level: 2 },
    },
    {
      id: 'gear_gloves',
      name: 'Power Gloves',
      icon: '🥊',
      category: 'accessories',
      rarity: 'common',
      description: 'Extra grip for extra reps',
      unlockRequirement: { achievement: 'Strength Training' },
    },
    {
      id: 'gear_shades',
      name: 'Cool Shades',
      icon: '🕶️',
      category: 'accessories',
      rarity: 'uncommon',
      description: 'Too cool for cardio',
      unlockRequirement: { level: 9 },
    },
    {
      id: 'gear_cape',
      name: 'Hero Cape',
      icon: '🦸',
      category: 'accessories',
      rarity: 'rare',
      description: 'Not all heroes skip leg day',
      unlockRequirement: { level: 18, achievement: 'Hero Status' },
    },
    {
      id: 'gear_crown',
      name: 'Fitness Crown',
      icon: '👑',
      category: 'accessories',
      rarity: 'epic',
      description: 'Rule the gym kingdom',
      unlockRequirement: { level: 28, achievement: 'Gym Royalty' },
    },
    {
      id: 'gear_wings',
      name: 'Angel Wings',
      icon: '👼',
      category: 'accessories',
      rarity: 'legendary',
      description: 'Ascend to fitness heaven',
      unlockRequirement: { level: 35, special: '100 day streak' },
    },
    {
      id: 'gear_aura',
      name: 'Power Aura',
      icon: '💫',
      category: 'accessories',
      rarity: 'legendary',
      description: 'Radiate pure energy',
      unlockRequirement: { level: 45, special: 'Max all stats' },
    },
  ],

  // Special Effects
  effects: [
    {
      id: 'effect_none',
      name: 'No Effect',
      icon: '⭕',
      category: 'effects',
      rarity: 'common',
      description: 'Clean and simple',
      unlockRequirement: { level: 1 },
      isDefault: true,
    },
    {
      id: 'effect_sparkles',
      name: 'Sparkles',
      icon: '✨',
      category: 'effects',
      rarity: 'common',
      description: 'Shine bright like a diamond',
      unlockRequirement: { level: 4 },
    },
    {
      id: 'effect_sweat',
      name: 'Workout Sweat',
      icon: '💦',
      category: 'effects',
      rarity: 'common',
      description: 'Show your hard work',
      unlockRequirement: { achievement: 'First Sweat' },
    },
    {
      id: 'effect_steam',
      name: 'Power Steam',
      icon: '♨️',
      category: 'effects',
      rarity: 'uncommon',
      description: 'Overheating from gains',
      unlockRequirement: { level: 11 },
    },
    {
      id: 'effect_lightning',
      name: 'Lightning Bolts',
      icon: '⚡',
      category: 'effects',
      rarity: 'rare',
      description: 'Electric performance',
      unlockRequirement: { level: 17, achievement: 'Speed Demon' },
    },
    {
      id: 'effect_fire',
      name: 'Flame Aura',
      icon: '🔥',
      category: 'effects',
      rarity: 'epic',
      description: 'Burning calories literally',
      unlockRequirement: { level: 24, achievement: 'On Fire' },
    },
    {
      id: 'effect_rainbow',
      name: 'Rainbow Trail',
      icon: '🌈',
      category: 'effects',
      rarity: 'epic',
      description: 'Leave a trail of awesomeness',
      unlockRequirement: { achievement: 'All Workout Types' },
    },
    {
      id: 'effect_galaxy',
      name: 'Cosmic Energy',
      icon: '🌌',
      category: 'effects',
      rarity: 'legendary',
      description: 'Universe-level gains',
      unlockRequirement: { level: 50, special: 'Complete all achievements' },
    },
  ],
};

const CustomizationDatabase = {
  getAllItems: () => {
    return Object.values(CUSTOMIZATION_ITEMS).flat();
  },

  getItemsByCategory: (category) => {
    return CUSTOMIZATION_ITEMS[category] || [];
  },

  getItemById: (itemId) => {
    const allItems = Object.values(CUSTOMIZATION_ITEMS).flat();
    return allItems.find(item => item.id === itemId);
  },

  getDefaultAppearance: () => {
    const defaults = {};
    Object.keys(CUSTOMIZATION_ITEMS).forEach(category => {
      const defaultItem = CUSTOMIZATION_ITEMS[category].find(item => item.isDefault);
      if (defaultItem) {
        defaults[category] = defaultItem.id;
      }
    });
    return defaults;
  },

  getItemsByRarity: (rarity) => {
    const allItems = Object.values(CUSTOMIZATION_ITEMS).flat();
    return allItems.filter(item => item.rarity === rarity);
  },

  getUnlockableItems: (playerLevel, achievements = [], specialConditions = []) => {
    const allItems = Object.values(CUSTOMIZATION_ITEMS).flat();
    return allItems.filter(item => {
      const req = item.unlockRequirement;
      
      // Check level requirement
      if (req.level && playerLevel < req.level) return false;
      
      // Check achievement requirement
      if (req.achievement && !achievements.includes(req.achievement)) return false;
      
      // Check special conditions
      if (req.special && !specialConditions.includes(req.special)) return false;
      
      return true;
    });
  },

  getLockedItems: (playerLevel, achievements = [], specialConditions = []) => {
    const allItems = Object.values(CUSTOMIZATION_ITEMS).flat();
    const unlockableItems = CustomizationDatabase.getUnlockableItems(
      playerLevel, 
      achievements, 
      specialConditions
    );
    const unlockableIds = unlockableItems.map(item => item.id);
    
    return allItems.filter(item => !unlockableIds.includes(item.id));
  },

  calculateAppearanceStats: (appearance) => {
    // Some items could provide stat bonuses in the future
    let bonuses = {
      strength: 0,
      stamina: 0,
      focus: 0,
      health: 0,
      happiness: 0,
    };

    // Example: Certain outfits give small stat bonuses
    if (appearance.outfit === 'outfit_armor') {
      bonuses.health += 5;
    }
    if (appearance.outfit === 'outfit_ninja') {
      bonuses.focus += 5;
    }
    if (appearance.accessories === 'gear_crown') {
      bonuses.happiness += 10;
    }

    return bonuses;
  },

  getEvolutionUnlocks: (evolutionStage) => {
    // Special items unlocked at each evolution
    const evolutionRewards = {
      1: ['body_ninja', 'hair_topknot'], // Trainee
      2: ['body_knight', 'outfit_armor'], // Fighter  
      3: ['body_dragon', 'outfit_golden', 'gear_wings'], // Champion
    };

    return evolutionRewards[evolutionStage] || [];
  },
};

export default CustomizationDatabase;