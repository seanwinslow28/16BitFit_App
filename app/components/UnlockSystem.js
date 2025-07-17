/**
 * Unlock System Component
 * Manages unlocking of customization items
 */

import CustomizationDatabase from './CustomizationDatabase';

const UnlockSystem = {
  // Check if an item is unlocked
  isItemUnlocked: (itemId, unlockedItems = []) => {
    // Default items are always unlocked
    const item = CustomizationDatabase.getItemById(itemId);
    if (!item) return false;
    if (item.isDefault) return true;
    
    // Check if item is in unlocked list
    return unlockedItems.includes(itemId);
  },

  // Get newly unlockable items based on current state
  getNewUnlocks: (playerStats, previousUnlocks = []) => {
    const { level = 1, achievements = [], specialConditions = [] } = playerStats;
    
    // Get all currently unlockable items
    const currentlyUnlockable = CustomizationDatabase.getUnlockableItems(
      level,
      achievements,
      specialConditions
    );

    // Filter out already unlocked items and defaults
    const newUnlocks = currentlyUnlockable.filter(item => 
      !previousUnlocks.includes(item.id) && !item.isDefault
    );

    return newUnlocks;
  },

  // Check for level-based unlocks
  checkLevelUnlocks: (newLevel, previousLevel, unlockedItems = []) => {
    const allItems = CustomizationDatabase.getAllItems();
    const newUnlocks = [];

    allItems.forEach(item => {
      // Skip if already unlocked or is default
      if (unlockedItems.includes(item.id) || item.isDefault) return;

      const req = item.unlockRequirement;
      
      // Check if this item unlocks at the new level
      if (req.level && req.level <= newLevel && req.level > previousLevel) {
        // Check if other requirements are met (achievements, special)
        if (!req.achievement && !req.special) {
          newUnlocks.push(item);
        }
      }
    });

    return newUnlocks;
  },

  // Check for achievement-based unlocks
  checkAchievementUnlocks: (newAchievements, unlockedItems = []) => {
    const allItems = CustomizationDatabase.getAllItems();
    const newUnlocks = [];

    allItems.forEach(item => {
      // Skip if already unlocked or is default
      if (unlockedItems.includes(item.id) || item.isDefault) return;

      const req = item.unlockRequirement;
      
      // Check if this item unlocks with any new achievement
      if (req.achievement && newAchievements.includes(req.achievement)) {
        newUnlocks.push(item);
      }
    });

    return newUnlocks;
  },

  // Check for evolution-based unlocks
  checkEvolutionUnlocks: (evolutionStage, unlockedItems = []) => {
    const evolutionItemIds = CustomizationDatabase.getEvolutionUnlocks(evolutionStage);
    const newUnlocks = [];

    evolutionItemIds.forEach(itemId => {
      if (!unlockedItems.includes(itemId)) {
        const item = CustomizationDatabase.getItemById(itemId);
        if (item) {
          newUnlocks.push(item);
        }
      }
    });

    return newUnlocks;
  },

  // Get unlock progress for an item
  getUnlockProgress: (item, playerStats) => {
    const req = item.unlockRequirement;
    const progress = {
      unlocked: false,
      percentage: 0,
      requirements: [],
    };

    // Level progress
    if (req.level) {
      const levelProgress = Math.min((playerStats.level || 1) / req.level, 1);
      progress.requirements.push({
        type: 'level',
        current: playerStats.level || 1,
        required: req.level,
        percentage: levelProgress * 100,
        completed: levelProgress >= 1,
      });
      progress.percentage += levelProgress * (100 / Object.keys(req).length);
    }

    // Achievement progress
    if (req.achievement) {
      const hasAchievement = (playerStats.achievements || []).includes(req.achievement);
      progress.requirements.push({
        type: 'achievement',
        name: req.achievement,
        completed: hasAchievement,
        percentage: hasAchievement ? 100 : 0,
      });
      if (hasAchievement) {
        progress.percentage += (100 / Object.keys(req).length);
      }
    }

    // Special condition progress
    if (req.special) {
      const hasSpecial = (playerStats.specialConditions || []).includes(req.special);
      progress.requirements.push({
        type: 'special',
        description: req.special,
        completed: hasSpecial,
        percentage: hasSpecial ? 100 : 0,
      });
      if (hasSpecial) {
        progress.percentage += (100 / Object.keys(req).length);
      }
    }

    progress.unlocked = progress.percentage >= 100;
    return progress;
  },

  // Generate unlock notification messages
  generateUnlockMessage: (item) => {
    const messages = {
      common: [
        `New ${item.category} unlocked: ${item.name}!`,
        `${item.icon} ${item.name} is now available!`,
      ],
      uncommon: [
        `Nice! You've unlocked ${item.name}! ${item.icon}`,
        `Uncommon unlock: ${item.name} - ${item.description}`,
      ],
      rare: [
        `🎉 RARE UNLOCK! ${item.name} is yours!`,
        `Awesome! ${item.icon} ${item.name} unlocked!`,
      ],
      epic: [
        `⚡ EPIC UNLOCK! ${item.name} achieved!`,
        `🌟 Legendary progress! ${item.name} unlocked!`,
      ],
      legendary: [
        `🏆 LEGENDARY! ${item.name} is now yours!`,
        `🔥 ULTIMATE UNLOCK! ${item.icon} ${item.name}!`,
      ],
    };

    const rarityMessages = messages[item.rarity] || messages.common;
    return rarityMessages[Math.floor(Math.random() * rarityMessages.length)];
  },

  // Calculate total unlock percentage
  calculateTotalUnlockProgress: (unlockedItems = []) => {
    const allItems = CustomizationDatabase.getAllItems();
    const nonDefaultItems = allItems.filter(item => !item.isDefault);
    
    if (nonDefaultItems.length === 0) return 100;
    
    const unlockedCount = nonDefaultItems.filter(item => 
      unlockedItems.includes(item.id)
    ).length;
    
    return Math.round((unlockedCount / nonDefaultItems.length) * 100);
  },

  // Get unlock statistics
  getUnlockStats: (unlockedItems = []) => {
    const allItems = CustomizationDatabase.getAllItems();
    const stats = {
      total: allItems.filter(item => !item.isDefault).length,
      unlocked: unlockedItems.length,
      byRarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      },
      byCategory: {
        body: 0,
        hair: 0,
        outfit: 0,
        accessories: 0,
        effects: 0,
      },
    };

    unlockedItems.forEach(itemId => {
      const item = CustomizationDatabase.getItemById(itemId);
      if (item && !item.isDefault) {
        stats.byRarity[item.rarity]++;
        stats.byCategory[item.category]++;
      }
    });

    return stats;
  },

  // Suggest next unlocks
  getSuggestedUnlocks: (playerStats, unlockedItems = []) => {
    const lockedItems = CustomizationDatabase.getLockedItems(
      playerStats.level || 1,
      playerStats.achievements || [],
      playerStats.specialConditions || []
    );

    // Sort by how close they are to being unlocked
    const itemsWithProgress = lockedItems.map(item => ({
      ...item,
      progress: UnlockSystem.getUnlockProgress(item, playerStats),
    }));

    // Sort by unlock percentage (closest to unlock first)
    itemsWithProgress.sort((a, b) => b.progress.percentage - a.progress.percentage);

    // Return top 3 suggestions
    return itemsWithProgress.slice(0, 3);
  },
};

export default UnlockSystem;