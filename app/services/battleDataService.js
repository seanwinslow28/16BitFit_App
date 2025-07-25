/**
 * Battle Data Service
 * Manages battle statistics, achievements, and save data with Supabase
 */

import supabase from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BattleDataService {
  constructor() {
    this.localStorageKey = '16bitfit_battle_data';
    this.achievementsKey = '16bitfit_achievements';
    this.statisticsKey = '16bitfit_statistics';
  }

  // Initialize database tables if they don't exist
  async initializeTables() {
    try {
      // Check if tables exist, if not, they should be created via migrations
      const tables = ['battle_records', 'achievements', 'statistics', 'unlocks'];
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
          console.log(`Table ${table} doesn't exist. Please run migrations.`);
        }
      }
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }

  // Save battle record
  async saveBattleRecord(battleData) {
    const record = {
      player_id: battleData.playerId,
      boss_id: battleData.bossId,
      boss_name: battleData.bossName,
      victory: battleData.victory,
      score: battleData.score,
      duration: battleData.duration,
      max_combo: battleData.maxCombo,
      damage_dealt: battleData.damageDealt,
      damage_taken: battleData.damageTaken,
      special_moves_used: battleData.specialMovesUsed,
      player_health_remaining: battleData.playerHealthRemaining,
      difficulty: battleData.difficulty || 'normal',
      created_at: new Date().toISOString(),
    };

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('battle_records')
        .insert([record])
        .select();

      if (error) throw error;

      // Also save locally for offline access
      await this.saveLocalBattleRecord(record);

      // Update statistics
      await this.updateStatistics(battleData);

      // Check for achievements
      await this.checkAchievements(battleData);

      return { success: true, data };
    } catch (error) {
      console.error('Error saving battle record:', error);
      
      // Fallback to local storage
      await this.saveLocalBattleRecord(record);
      return { success: false, error: error.message };
    }
  }

  // Save battle record locally
  async saveLocalBattleRecord(record) {
    try {
      const existingData = await AsyncStorage.getItem(this.localStorageKey);
      const records = existingData ? JSON.parse(existingData) : [];
      records.push(record);
      
      // Keep only last 100 records locally
      if (records.length > 100) {
        records.shift();
      }
      
      await AsyncStorage.setItem(this.localStorageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving local battle record:', error);
    }
  }

  // Get battle history
  async getBattleHistory(playerId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('battle_records')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching battle history:', error);
      
      // Fallback to local storage
      const localData = await this.getLocalBattleHistory();
      return { success: false, data: localData, error: error.message };
    }
  }

  // Get local battle history
  async getLocalBattleHistory() {
    try {
      const data = await AsyncStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local battle history:', error);
      return [];
    }
  }

  // Update statistics
  async updateStatistics(battleData) {
    try {
      const stats = await this.getStatistics(battleData.playerId);
      
      // Update stats
      stats.total_battles = (stats.total_battles || 0) + 1;
      stats.total_victories = (stats.total_victories || 0) + (battleData.victory ? 1 : 0);
      stats.total_defeats = (stats.total_defeats || 0) + (battleData.victory ? 0 : 1);
      stats.total_score = (stats.total_score || 0) + battleData.score;
      stats.highest_combo = Math.max(stats.highest_combo || 0, battleData.maxCombo);
      stats.total_damage_dealt = (stats.total_damage_dealt || 0) + battleData.damageDealt;
      stats.total_damage_taken = (stats.total_damage_taken || 0) + battleData.damageTaken;
      stats.win_rate = stats.total_battles > 0 ? 
        (stats.total_victories / stats.total_battles * 100).toFixed(1) : 0;
      
      // Boss-specific stats
      if (!stats.boss_defeats) stats.boss_defeats = {};
      if (battleData.victory) {
        stats.boss_defeats[battleData.bossId] = (stats.boss_defeats[battleData.bossId] || 0) + 1;
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('statistics')
        .upsert([{
          player_id: battleData.playerId,
          ...stats,
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      
      // Save locally
      await AsyncStorage.setItem(
        `${this.statisticsKey}_${battleData.playerId}`,
        JSON.stringify(stats)
      );
      
      return stats;
    } catch (error) {
      console.error('Error updating statistics:', error);
      return null;
    }
  }

  // Get statistics
  async getStatistics(playerId) {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || {};
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Fallback to local storage
      const localData = await AsyncStorage.getItem(`${this.statisticsKey}_${playerId}`);
      return localData ? JSON.parse(localData) : {};
    }
  }

  // Achievement definitions
  getAchievementDefinitions() {
    return [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Defeat your first boss',
        icon: '🩸',
        condition: (stats) => stats.total_victories >= 1,
        reward: { xp: 100 },
      },
      {
        id: 'combo_novice',
        name: 'Combo Novice',
        description: 'Achieve a 10 hit combo',
        icon: '⚡',
        condition: (stats) => stats.highest_combo >= 10,
        reward: { xp: 150 },
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Achieve a 20 hit combo',
        icon: '💫',
        condition: (stats) => stats.highest_combo >= 20,
        reward: { xp: 300, unlock: 'special_move_2' },
      },
      {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Win a battle without taking damage',
        icon: '🛡️',
        condition: (stats, battleData) => battleData?.victory && battleData?.damageTaken === 0,
        reward: { xp: 500, unlock: 'golden_aura' },
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Defeat a boss in under 30 seconds',
        icon: '⚡',
        condition: (stats, battleData) => battleData?.victory && battleData?.duration < 30,
        reward: { xp: 400 },
      },
      {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat all 4 bosses',
        icon: '👑',
        condition: (stats) => Object.keys(stats.boss_defeats || {}).length >= 4,
        reward: { xp: 1000, unlock: 'champion_skin' },
      },
      {
        id: 'veteran_fighter',
        name: 'Veteran Fighter',
        description: 'Complete 50 battles',
        icon: '🎖️',
        condition: (stats) => stats.total_battles >= 50,
        reward: { xp: 600 },
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 90% win rate (min 10 battles)',
        icon: '💯',
        condition: (stats) => stats.total_battles >= 10 && stats.win_rate >= 90,
        reward: { xp: 800, unlock: 'perfect_stance' },
      },
    ];
  }

  // Check and unlock achievements
  async checkAchievements(battleData) {
    try {
      const stats = await this.getStatistics(battleData.playerId);
      const unlockedAchievements = await this.getUnlockedAchievements(battleData.playerId);
      const definitions = this.getAchievementDefinitions();
      const newAchievements = [];

      for (const achievement of definitions) {
        // Skip if already unlocked
        if (unlockedAchievements.includes(achievement.id)) continue;

        // Check condition
        if (achievement.condition(stats, battleData)) {
          // Unlock achievement
          await this.unlockAchievement(battleData.playerId, achievement);
          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Unlock achievement
  async unlockAchievement(playerId, achievement) {
    try {
      const achievementRecord = {
        player_id: playerId,
        achievement_id: achievement.id,
        achievement_name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        reward: achievement.reward,
        unlocked_at: new Date().toISOString(),
      };

      // Save to Supabase
      const { error } = await supabase
        .from('achievements')
        .insert([achievementRecord]);

      if (error) throw error;

      // Save locally
      const localKey = `${this.achievementsKey}_${playerId}`;
      const existing = await AsyncStorage.getItem(localKey);
      const achievements = existing ? JSON.parse(existing) : [];
      achievements.push(achievementRecord);
      await AsyncStorage.setItem(localKey, JSON.stringify(achievements));

      // Apply rewards
      if (achievement.reward.unlock) {
        await this.saveUnlock(playerId, achievement.reward.unlock);
      }

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  // Get unlocked achievements
  async getUnlockedAchievements(playerId) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_id')
        .eq('player_id', playerId);

      if (error) throw error;
      return data.map(a => a.achievement_id);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      
      // Fallback to local storage
      const localKey = `${this.achievementsKey}_${playerId}`;
      const localData = await AsyncStorage.getItem(localKey);
      const achievements = localData ? JSON.parse(localData) : [];
      return achievements.map(a => a.achievement_id);
    }
  }

  // Save unlock (skins, moves, etc.)
  async saveUnlock(playerId, unlockId) {
    try {
      const unlock = {
        player_id: playerId,
        unlock_id: unlockId,
        unlocked_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('unlocks')
        .insert([unlock]);

      if (error) throw error;

      // Save locally
      const localKey = `unlocks_${playerId}`;
      const existing = await AsyncStorage.getItem(localKey);
      const unlocks = existing ? JSON.parse(existing) : [];
      unlocks.push(unlockId);
      await AsyncStorage.setItem(localKey, JSON.stringify(unlocks));

      return true;
    } catch (error) {
      console.error('Error saving unlock:', error);
      return false;
    }
  }

  // Get player unlocks
  async getPlayerUnlocks(playerId) {
    try {
      const { data, error } = await supabase
        .from('unlocks')
        .select('unlock_id')
        .eq('player_id', playerId);

      if (error) throw error;
      return data.map(u => u.unlock_id);
    } catch (error) {
      console.error('Error fetching unlocks:', error);
      
      // Fallback to local storage
      const localKey = `unlocks_${playerId}`;
      const localData = await AsyncStorage.getItem(localKey);
      return localData ? JSON.parse(localData) : [];
    }
  }

  // Sync local data with server
  async syncLocalData(playerId) {
    try {
      // Get local battle records
      const localBattles = await this.getLocalBattleHistory();
      
      // Filter records for this player that haven't been synced
      const unsynced = localBattles.filter(b => 
        b.player_id === playerId && !b.synced
      );

      // Sync each record
      for (const battle of unsynced) {
        const { error } = await supabase
          .from('battle_records')
          .insert([battle]);
        
        if (!error) {
          battle.synced = true;
        }
      }

      // Update local storage
      await AsyncStorage.setItem(this.localStorageKey, JSON.stringify(localBattles));

      return { success: true, synced: unsynced.length };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new BattleDataService();