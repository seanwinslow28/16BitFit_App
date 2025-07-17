/**
 * Equipment System Component
 * Manages equipment that provides stat bonuses
 */

import CustomizationDatabase from './CustomizationDatabase';

// Equipment stat bonuses configuration
const EQUIPMENT_BONUSES = {
  // Accessories (Gear)
  gear_headband: {
    focus: 2,
    stamina: 1,
    description: 'Improves focus during workouts',
  },
  gear_gloves: {
    strength: 3,
    health: 1,
    description: 'Better grip for strength training',
  },
  gear_shades: {
    happiness: 2,
    focus: 1,
    description: 'Look cool, feel cool',
  },
  gear_cape: {
    happiness: 3,
    stamina: 2,
    description: 'Heroes never skip leg day',
  },
  gear_crown: {
    happiness: 5,
    focus: 3,
    health: 2,
    description: 'Rule your fitness kingdom',
  },
  gear_wings: {
    stamina: 5,
    happiness: 4,
    health: 3,
    description: 'Soar to new heights',
  },
  gear_aura: {
    all_stats: 3, // Special bonus to all stats
    description: 'Radiate pure energy',
  },

  // Outfits
  outfit_gi: {
    focus: 2,
    stamina: 1,
    description: 'Traditional martial arts discipline',
  },
  outfit_tank: {
    strength: 2,
    description: 'Show off your gains',
  },
  outfit_hoodie: {
    happiness: 2,
    health: 1,
    description: 'Comfortable confidence',
  },
  outfit_armor: {
    health: 5,
    strength: 2,
    description: 'Heavy protection, heavy gains',
  },
  outfit_ninja: {
    focus: 4,
    stamina: 3,
    description: 'Silent but deadly workouts',
  },
  outfit_tech: {
    focus: 3,
    health: 2,
    stamina: 2,
    description: 'High-tech performance',
  },
  outfit_golden: {
    all_stats: 5, // Champion's bonus
    description: 'The ultimate warrior attire',
  },

  // Special Effects (minor bonuses)
  effect_sparkles: {
    happiness: 1,
    description: 'A little magic in your workout',
  },
  effect_sweat: {
    stamina: 1,
    description: 'Proof of hard work',
  },
  effect_steam: {
    strength: 1,
    stamina: 1,
    description: 'Overheating from intensity',
  },
  effect_lightning: {
    focus: 2,
    stamina: 2,
    description: 'Electric performance',
  },
  effect_fire: {
    strength: 3,
    stamina: 2,
    description: 'Burning calories literally',
  },
  effect_rainbow: {
    happiness: 3,
    health: 1,
    description: 'Spreading positivity',
  },
  effect_galaxy: {
    all_stats: 2,
    description: 'Universal power',
  },
};

// Equipment sets that provide additional bonuses when worn together
const EQUIPMENT_SETS = {
  martial_artist: {
    items: ['outfit_gi', 'gear_headband'],
    bonus: {
      focus: 3,
      strength: 2,
    },
    name: 'Martial Artist Set',
    description: 'Complete martial arts gear',
  },
  ninja_master: {
    items: ['outfit_ninja', 'effect_steam'],
    bonus: {
      focus: 5,
      stamina: 3,
    },
    name: 'Shadow Warrior Set',
    description: 'Master of stealth and endurance',
  },
  champion: {
    items: ['outfit_golden', 'gear_crown', 'effect_galaxy'],
    bonus: {
      all_stats: 10,
    },
    name: 'Champion Set',
    description: 'The complete champion ensemble',
  },
  tech_warrior: {
    items: ['outfit_tech', 'effect_lightning'],
    bonus: {
      focus: 4,
      health: 3,
    },
    name: 'Cyber Athlete Set',
    description: 'High-tech fitness warrior',
  },
  fire_starter: {
    items: ['outfit_tank', 'effect_fire'],
    bonus: {
      strength: 5,
      stamina: 3,
    },
    name: 'Blazing Power Set',
    description: 'Burning with intensity',
  },
};

const EquipmentSystem = {
  // Calculate total stat bonuses from equipped items
  calculateEquipmentBonuses: (appearance) => {
    let bonuses = {
      health: 0,
      strength: 0,
      stamina: 0,
      focus: 0,
      happiness: 0,
    };

    // Collect equipped items
    const equippedItems = [];
    
    // Add bonuses from each equipped item
    Object.entries(appearance).forEach(([category, itemId]) => {
      if (itemId && EQUIPMENT_BONUSES[itemId]) {
        equippedItems.push(itemId);
        const itemBonus = EQUIPMENT_BONUSES[itemId];
        
        // Apply individual item bonuses
        Object.entries(itemBonus).forEach(([stat, value]) => {
          if (stat === 'all_stats') {
            // Apply to all stats
            Object.keys(bonuses).forEach(s => {
              bonuses[s] += value;
            });
          } else if (bonuses.hasOwnProperty(stat)) {
            bonuses[stat] += value;
          }
        });
      }
    });

    // Check for set bonuses
    Object.entries(EQUIPMENT_SETS).forEach(([setId, setData]) => {
      const hasAllItems = setData.items.every(item => equippedItems.includes(item));
      
      if (hasAllItems) {
        // Apply set bonus
        Object.entries(setData.bonus).forEach(([stat, value]) => {
          if (stat === 'all_stats') {
            Object.keys(bonuses).forEach(s => {
              bonuses[s] += value;
            });
          } else if (bonuses.hasOwnProperty(stat)) {
            bonuses[stat] += value;
          }
        });
      }
    });

    return bonuses;
  },

  // Get equipment description for an item
  getEquipmentDescription: (itemId) => {
    return EQUIPMENT_BONUSES[itemId]?.description || null;
  },

  // Get stat bonuses for a specific item
  getItemBonuses: (itemId) => {
    const bonus = EQUIPMENT_BONUSES[itemId];
    if (!bonus) return null;

    const statBonuses = {};
    Object.entries(bonus).forEach(([key, value]) => {
      if (key !== 'description') {
        statBonuses[key] = value;
      }
    });

    return statBonuses;
  },

  // Check which sets are active for the current appearance
  getActiveSets: (appearance) => {
    const equippedItems = Object.values(appearance).filter(id => id && id !== 'none');
    const activeSets = [];

    Object.entries(EQUIPMENT_SETS).forEach(([setId, setData]) => {
      const hasAllItems = setData.items.every(item => equippedItems.includes(item));
      if (hasAllItems) {
        activeSets.push({
          id: setId,
          ...setData,
        });
      }
    });

    return activeSets;
  },

  // Get progress towards completing sets
  getSetProgress: (appearance) => {
    const equippedItems = Object.values(appearance).filter(id => id && id !== 'none');
    const setProgress = [];

    Object.entries(EQUIPMENT_SETS).forEach(([setId, setData]) => {
      const ownedItems = setData.items.filter(item => equippedItems.includes(item));
      const progress = {
        id: setId,
        name: setData.name,
        description: setData.description,
        itemsRequired: setData.items,
        itemsOwned: ownedItems,
        progress: ownedItems.length / setData.items.length,
        isComplete: ownedItems.length === setData.items.length,
        bonus: setData.bonus,
      };
      
      setProgress.push(progress);
    });

    // Sort by progress (closest to completion first)
    setProgress.sort((a, b) => b.progress - a.progress);

    return setProgress;
  },

  // Get recommended equipment based on player stats
  getRecommendedEquipment: (playerStats, unlockedItems) => {
    const recommendations = [];
    
    // Find which stats need improvement
    const statThreshold = 50; // Below this, stat needs improvement
    const weakStats = [];
    
    if (playerStats.health < statThreshold) weakStats.push('health');
    if (playerStats.strength < statThreshold) weakStats.push('strength');
    if (playerStats.stamina < statThreshold) weakStats.push('stamina');
    if (playerStats.focus < statThreshold) weakStats.push('focus');
    if (playerStats.happiness < statThreshold) weakStats.push('happiness');

    // Find equipment that boosts weak stats
    Object.entries(EQUIPMENT_BONUSES).forEach(([itemId, bonuses]) => {
      if (!unlockedItems.includes(itemId)) return;
      
      let relevanceScore = 0;
      weakStats.forEach(stat => {
        if (bonuses[stat]) {
          relevanceScore += bonuses[stat];
        }
        if (bonuses.all_stats) {
          relevanceScore += bonuses.all_stats;
        }
      });

      if (relevanceScore > 0) {
        const item = CustomizationDatabase.getItemById(itemId);
        if (item) {
          recommendations.push({
            ...item,
            relevanceScore,
            bonuses: EquipmentSystem.getItemBonuses(itemId),
            reason: `Boosts ${weakStats.join(', ')}`,
          });
        }
      }
    });

    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return recommendations.slice(0, 5); // Top 5 recommendations
  },

  // Calculate combat power bonus from equipment
  getCombatPowerBonus: (appearance) => {
    const bonuses = EquipmentSystem.calculateEquipmentBonuses(appearance);
    const totalBonus = Object.values(bonuses).reduce((sum, val) => sum + val, 0);
    
    // Each equipment bonus point adds 2 combat power
    return totalBonus * 2;
  },

  // Get equipment rarity distribution
  getEquipmentRarityStats: (appearance, allUnlockedItems) => {
    const equipped = Object.values(appearance).filter(id => id && id !== 'none' && id.includes('_'));
    const rarityCount = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    equipped.forEach(itemId => {
      const item = CustomizationDatabase.getItemById(itemId);
      if (item && item.rarity) {
        rarityCount[item.rarity]++;
      }
    });

    return {
      equipped: equipped.length,
      byRarity: rarityCount,
      averageRarity: equipped.length > 0 ? 
        Object.entries(rarityCount).reduce((sum, [rarity, count]) => {
          const rarityValue = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return sum + (rarityValue[rarity] * count);
        }, 0) / equipped.length : 0,
    };
  },
};

export default EquipmentSystem;