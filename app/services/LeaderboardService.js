/**
 * Leaderboard Service
 * Handles all leaderboard operations with Supabase
 */

import { supabase } from './supabaseClient';

class LeaderboardService {
  /**
   * Submit a new score to the leaderboard
   */
  async submitScore(battleData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated to submit scores');
      }

      // Calculate score based on battle performance
      const score = this.calculateScore(battleData);

      const { data, error } = await supabase
        .from('leaderboards')
        .insert({
          user_id: user.id,
          username: battleData.username || user.email?.split('@')[0] || 'Player',
          score: score,
          boss_defeated: battleData.bossId,
          battle_duration: battleData.duration,
          combo_max: battleData.maxCombo,
          damage_dealt: battleData.damageDealt,
          damage_taken: battleData.damageTaken,
          perfect_victory: battleData.damageTaken === 0,
          difficulty: battleData.difficulty || 'NORMAL'
        })
        .select()
        .single();

      if (error) throw error;

      // Get the player's rank
      const rank = await this.getUserRank(user.id);
      
      return { 
        success: true, 
        score, 
        rank,
        data 
      };
    } catch (error) {
      console.error('Error submitting score:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Calculate score based on battle performance
   */
  calculateScore(battleData) {
    const {
      playerHP = 0,
      maxPlayerHP = 100,
      duration = 999,
      maxCombo = 0,
      damageDealt = 0,
      damageTaken = 0,
      difficulty = 'NORMAL'
    } = battleData;

    // Base score components
    const healthBonus = Math.floor((playerHP / maxPlayerHP) * 1000);
    const timeBonus = Math.max(0, 3000 - (duration * 10)); // Faster = more points
    const comboBonus = maxCombo * 100;
    const damageBonus = damageDealt * 2;
    const defenseBonus = Math.max(0, 1000 - damageTaken * 5);

    // Difficulty multiplier
    const difficultyMultiplier = {
      'EASY': 0.5,
      'NORMAL': 1.0,
      'HARD': 1.5,
      'EXTREME': 2.0
    }[difficulty] || 1.0;

    // Calculate final score
    const baseScore = healthBonus + timeBonus + comboBonus + damageBonus + defenseBonus;
    const finalScore = Math.floor(baseScore * difficultyMultiplier);

    return Math.max(0, finalScore);
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        leaderboard: data 
      };
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      return { 
        success: false, 
        error: error.message,
        leaderboard: [] 
      };
    }
  }

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('weekly_leaderboards')
        .select('*')
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        leaderboard: data 
      };
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return { 
        success: false, 
        error: error.message,
        leaderboard: [] 
      };
    }
  }

  /**
   * Get monthly leaderboard
   */
  async getMonthlyLeaderboard(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('monthly_leaderboards')
        .select('*')
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        leaderboard: data 
      };
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
      return { 
        success: false, 
        error: error.message,
        leaderboard: [] 
      };
    }
  }

  /**
   * Get leaderboard by boss
   */
  async getBossLeaderboard(bossId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('boss_defeated', bossId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        leaderboard: data 
      };
    } catch (error) {
      console.error('Error fetching boss leaderboard:', error);
      return { 
        success: false, 
        error: error.message,
        leaderboard: [] 
      };
    }
  }

  /**
   * Get user's rank and best score
   */
  async getUserRank(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_best_score', { p_user_id: userId });

      if (error) throw error;

      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }

  /**
   * Get user's recent scores
   */
  async getUserScores(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        scores: data 
      };
    } catch (error) {
      console.error('Error fetching user scores:', error);
      return { 
        success: false, 
        error: error.message,
        scores: [] 
      };
    }
  }

  /**
   * Get friends leaderboard (if friends system is implemented)
   */
  async getFriendsLeaderboard(userId, friendIds = [], limit = 50) {
    try {
      // Include the user and their friends
      const userIds = [userId, ...friendIds];

      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .in('user_id', userIds)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { 
        success: true, 
        leaderboard: data 
      };
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error);
      return { 
        success: false, 
        error: error.message,
        leaderboard: [] 
      };
    }
  }
}

export default new LeaderboardService();