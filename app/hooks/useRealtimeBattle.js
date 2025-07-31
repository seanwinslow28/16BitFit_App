/**
 * useRealtimeBattle Hook
 * React hook for managing real-time PvP battles
 */

import { useState, useEffect, useCallback } from 'react';
import BattleRealtimeService from '../services/BattleRealtimeService';
import * as Haptics from 'expo-haptics';

export function useRealtimeBattle(userId, characterStats) {
  const [battleState, setBattleState] = useState('idle');
  const [currentBattle, setCurrentBattle] = useState(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastOpponentMove, setLastOpponentMove] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let unsubscribers = [];

    const initializeBattle = async () => {
      await BattleRealtimeService.initialize(userId);

      // Subscribe to matchmaking events
      const unsubMatchStart = BattleRealtimeService.on('matchmaking_started', () => {
        setIsSearching(true);
        setBattleState('searching');
      });
      unsubscribers.push(unsubMatchStart);

      const unsubMatchFound = BattleRealtimeService.on('match_found', ({ battleId, opponentId }) => {
        setIsSearching(false);
        setBattleState('ready');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
      unsubscribers.push(unsubMatchFound);

      const unsubMatchCancel = BattleRealtimeService.on('matchmaking_cancelled', () => {
        setIsSearching(false);
        setBattleState('idle');
      });
      unsubscribers.push(unsubMatchCancel);

      // Subscribe to battle events
      const unsubBattleUpdate = BattleRealtimeService.on('battle_state_updated', ({ battle, lastMove, damage }) => {
        setCurrentBattle(battle);
        setBattleState('fighting');
        
        if (lastMove) {
          setMoveHistory(prev => [...prev, { ...lastMove, damage }]);
        }
      });
      unsubscribers.push(unsubBattleUpdate);

      const unsubOpponentMove = BattleRealtimeService.on('opponent_move', (move) => {
        setLastOpponentMove(move);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
      unsubscribers.push(unsubOpponentMove);

      const unsubBattleEnd = BattleRealtimeService.on('battle_ended', ({ won, rewards }) => {
        setBattleState('finished');
        
        if (won) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      });
      unsubscribers.push(unsubBattleEnd);

      // Subscribe to connection events
      const unsubOpponentConnect = BattleRealtimeService.on('opponent_connected', ({ connected }) => {
        setOpponentConnected(connected);
      });
      unsubscribers.push(unsubOpponentConnect);
    };

    initializeBattle();

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      BattleRealtimeService.cleanup();
    };
  }, [userId]);

  // Start searching for a match
  const startMatchmaking = useCallback(async () => {
    if (!characterStats || battleState !== 'idle') return false;
    
    try {
      const success = await BattleRealtimeService.startMatchmaking(characterStats);
      return success;
    } catch (error) {
      console.error('Failed to start matchmaking:', error);
      return false;
    }
  }, [characterStats, battleState]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (battleState !== 'searching') return;
    
    try {
      await BattleRealtimeService.cancelMatchmaking();
    } catch (error) {
      console.error('Failed to cancel matchmaking:', error);
    }
  }, [battleState]);

  // Execute a battle move
  const executeMove = useCallback(async (moveType) => {
    if (battleState !== 'fighting') return false;
    
    try {
      const moveData = {
        power: characterStats.strength,
        timestamp: Date.now()
      };
      
      const success = await BattleRealtimeService.executeMove(moveType, moveData);
      return success;
    } catch (error) {
      console.error('Failed to execute move:', error);
      return false;
    }
  }, [battleState, characterStats]);

  // Get current player health
  const getPlayerHealth = useCallback(() => {
    if (!currentBattle || !userId) return 100;
    
    const isPlayer1 = userId === currentBattle.player1_id;
    return isPlayer1 ? currentBattle.player1_health : currentBattle.player2_health;
  }, [currentBattle, userId]);

  // Get opponent health
  const getOpponentHealth = useCallback(() => {
    if (!currentBattle || !userId) return 100;
    
    const isPlayer1 = userId === currentBattle.player1_id;
    return isPlayer1 ? currentBattle.player2_health : currentBattle.player1_health;
  }, [currentBattle, userId]);

  // Check if it's player's turn
  const isPlayerTurn = useCallback(() => {
    if (moveHistory.length === 0) return true;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    return lastMove.user_id !== userId;
  }, [moveHistory, userId]);

  // Get battle result
  const getBattleResult = useCallback(() => {
    if (battleState !== 'finished' || !currentBattle) return null;
    
    const playerHealth = getPlayerHealth();
    const opponentHealth = getOpponentHealth();
    
    return {
      won: playerHealth > opponentHealth,
      playerHealth,
      opponentHealth,
      totalMoves: moveHistory.length,
      duration: currentBattle.duration
    };
  }, [battleState, currentBattle, getPlayerHealth, getOpponentHealth, moveHistory]);

  return {
    // State
    battleState,
    currentBattle,
    opponentConnected,
    moveHistory,
    lastOpponentMove,
    isSearching,
    
    // Actions
    startMatchmaking,
    cancelMatchmaking,
    executeMove,
    
    // Computed properties
    playerHealth: getPlayerHealth(),
    opponentHealth: getOpponentHealth(),
    isPlayerTurn: isPlayerTurn(),
    battleResult: getBattleResult(),
    
    // Helper functions
    getPlayerHealth,
    getOpponentHealth,
    isPlayerTurn,
    getBattleResult
  };
}