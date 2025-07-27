import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useNavigation } from '@react-navigation/native';

import { createWorld, ARENA_BOUNDS, FIGHTER_PHYSICS } from '../gameEngine/GameEngine';
import Fighter from '../gameEngine/entities/Fighter';
import TouchControlSystem from '../gameEngine/systems/TouchControlSystem';
import CombatTierSystem, { getCombatTier, CombatTiers } from '../gameEngine/systems/CombatTierSystem';
import BattlePhysicsSystem from '../gameEngine/systems/BattlePhysicsSystem';
import CombatTierIndicator from '../components/CombatTierIndicator';
import { useCharacter } from '../contexts/CharacterContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BattleScreenV2 = ({ route }) => {
  const navigation = useNavigation();
  const gameEngine = useRef(null);
  const { characterStats, addActivity, addAchievement, totalWorkouts } = useCharacter();
  
  const [gameReady, setGameReady] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [entities, setEntities] = useState(null);
  
  // Get enemy data from route params or generate default
  const enemyData = route?.params?.enemy || {
    name: 'Training Dummy',
    stats: {
      health: 80,
      strength: 40,
      stamina: 40,
      speed: 40,
    },
  };

  useEffect(() => {
    initializeBattle();
    
    return () => {
      // Cleanup
      if (gameEngine.current) {
        gameEngine.current.stop();
      }
    };
  }, []);

  const initializeBattle = async () => {
    try {
      // Create physics world
      const engine = createWorld();
      
      // Create ground
      const ground = Matter.Bodies.rectangle(
        ARENA_BOUNDS.width / 2,
        ARENA_BOUNDS.groundY + 50,
        ARENA_BOUNDS.width,
        100,
        { isStatic: true }
      );
      
      // Create fighter bodies
      const playerBody = Matter.Bodies.rectangle(
        200,
        200,
        FIGHTER_PHYSICS.width,
        FIGHTER_PHYSICS.height,
        {
          ...FIGHTER_PHYSICS,
          label: 'player',
        }
      );
      
      const enemyBody = Matter.Bodies.rectangle(
        600,
        200,
        FIGHTER_PHYSICS.width,
        FIGHTER_PHYSICS.height,
        {
          ...FIGHTER_PHYSICS,
          label: 'enemy',
        }
      );
      
      Matter.World.add(engine.world, [ground, playerBody, enemyBody]);
      
      // Create entities
      const entities = {
        world: { engine },
        player: {
          body: playerBody,
          characterStats: characterStats || {
            health: 100,
            strength: 50,
            stamina: 50,
            speed: 50,
          },
          renderer: Fighter,
          spriteSheet: require('../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
          isPlayer: true,
        },
        enemy: {
          body: enemyBody,
          characterStats: enemyData.stats,
          renderer: Fighter,
          spriteSheet: require('../assets/Sprites/BossBattleSpriteSheets/Rookie_Ryu-Sprite-Sheet.png'),
          isPlayer: false,
        },
      };
      
      setEntities(entities);
      setGameReady(true);
    } catch (error) {
      console.error('Failed to initialize battle:', error);
    }
  };

  const handleEvent = (event) => {
    if (event.type === 'battle-end') {
      setBattleResult(event.winner);
      
      // Update character stats based on result
      if (event.winner === 'player') {
        // Victory rewards
        updateCharacterProgress('victory');
      } else {
        // Defeat penalties (minimal)
        updateCharacterProgress('defeat');
      }
      
      // Navigate back to main screen after delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }
  };

  const updateCharacterProgress = (result) => {
    if (result === 'victory') {
      // Log battle as activity
      addActivity({
        name: 'Boss Battle Victory',
        category: 'sports',
        intensity: 5,
        duration: 5,
      });
      addAchievement('Defeated a boss!');
    } else {
      // Log defeat
      addActivity({
        name: 'Boss Battle Attempt',
        category: 'sports',
        intensity: 3,
        duration: 5,
      });
    }
  };

  const calculateRewards = (winner) => {
    if (winner === 'player') {
      return {
        experience: 50,
        coins: 25,
        unlockedMoves: characterStats.strength > 60 ? ['uppercut'] : [],
      };
    }
    return {
      experience: 10,
      coins: 5,
    };
  };

  if (!gameReady || !entities) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing Battle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Battle Arena Background */}
      <View style={styles.arenaBackground}>
        {/* Add background image here */}
      </View>
      
      {/* Game Engine */}
      <GameEngine
        ref={gameEngine}
        style={styles.gameContainer}
        systems={[
          getCombatTier(characterStats?.totalBattles || 0) === CombatTiers.ADVANCED 
            ? TouchControlSystem 
            : CombatTierSystem,
          BattlePhysicsSystem
        ]}
        entities={entities}
        running={!battleResult}
        onEvent={handleEvent}
      />
      
      {/* Battle HUD */}
      <View style={styles.hudContainer}>
        <BattleHUD 
          playerStats={characterStats}
          enemyStats={enemyData.stats}
        />
      </View>
      
      {/* Touch Control Overlay */}
      <TouchControlOverlay />
      
      {/* Combat Tier Indicator */}
      {!battleResult && (
        <View style={styles.tierIndicatorContainer}>
          <CombatTierIndicator totalBattles={characterStats?.totalBattles || 0} />
        </View>
      )}
      
      {/* Victory/Defeat Screen */}
      {battleResult && (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>
            {battleResult === 'player' ? 'VICTORY!' : 'DEFEAT!'}
          </Text>
          <Text style={styles.resultSubtext}>
            {battleResult === 'player' 
              ? 'Your training paid off!' 
              : 'Keep training and try again!'}
          </Text>
        </View>
      )}
    </View>
  );
};

// Battle HUD Component
const BattleHUD = ({ playerStats, enemyStats }) => {
  return (
    <View style={styles.hud}>
      {/* Player info */}
      <View style={styles.fighterInfo}>
        <Text style={styles.fighterName}>YOU</Text>
        <View style={styles.statsBar}>
          <Text style={styles.statText}>STR: {playerStats.strength}</Text>
          <Text style={styles.statText}>STA: {playerStats.stamina}</Text>
        </View>
      </View>
      
      {/* VS indicator */}
      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>
      
      {/* Enemy info */}
      <View style={[styles.fighterInfo, styles.enemyInfo]}>
        <Text style={styles.fighterName}>ENEMY</Text>
        <View style={styles.statsBar}>
          <Text style={styles.statText}>STR: {enemyStats.strength}</Text>
          <Text style={styles.statText}>STA: {enemyStats.stamina}</Text>
        </View>
      </View>
    </View>
  );
};

// Touch control visual overlay
const TouchControlOverlay = () => {
  return (
    <View style={styles.controlOverlay} pointerEvents="none">
      {/* Movement area indicator */}
      <View style={[styles.controlZone, styles.movementZone]}>
        <Text style={styles.zoneText}>MOVE</Text>
      </View>
      
      {/* Action buttons area */}
      <View style={[styles.controlZone, styles.actionZone]}>
        <View style={styles.actionButton}>
          <Text style={styles.buttonText}>PUNCH</Text>
        </View>
        <View style={styles.actionButton}>
          <Text style={styles.buttonText}>KICK</Text>
        </View>
        <View style={styles.actionButton}>
          <Text style={styles.buttonText}>BLOCK</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'PressStart2P',
  },
  arenaBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  fighterInfo: {
    alignItems: 'center',
  },
  enemyInfo: {
    alignItems: 'flex-end',
  },
  fighterName: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'PressStart2P',
    marginBottom: 5,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 10,
  },
  statText: {
    color: '#FFD700',
    fontSize: 10,
    fontFamily: 'PressStart2P',
  },
  vsContainer: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  vsText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'PressStart2P',
  },
  controlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlZone: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  movementZone: {
    left: 10,
    bottom: 50,
    width: screenWidth * 0.35,
    height: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionZone: {
    right: 10,
    bottom: 50,
    width: screenWidth * 0.35,
    height: screenHeight * 0.4,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  zoneText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 20,
    fontFamily: 'PressStart2P',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: 'PressStart2P',
  },
  tierIndicatorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 36,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 20,
  },
  resultSubtext: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default BattleScreenV2;