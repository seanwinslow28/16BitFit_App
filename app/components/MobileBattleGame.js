/**
 * Mobile Battle Game Component
 * 2D Fighting game for mobile devices using React Native
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BATTLE_AREA_HEIGHT = 300;
const FLOOR_Y = BATTLE_AREA_HEIGHT - 80;

// Character sprites (using emojis for now, can be replaced with images)
const SPRITES = {
  player: {
    idle: '🥷',
    punch: '👊',
    kick: '🦵',
    block: '🛡️',
    hurt: '😵',
    victory: '🎉',
  },
  boss: {
    sloth_demon: {
      idle: '😴',
      attack: '💤',
      hurt: '😫',
      special: '🛋️',
    },
    junk_food_monster: {
      idle: '🍔',
      attack: '🍟',
      hurt: '🤢',
      special: '🍕',
    },
  },
};

const MobileBattleGame = ({ 
  playerStats = {}, 
  boss = {}, 
  onBattleEnd = () => {},
  onUpdateStats = () => {},
}) => {
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, fighting, victory, defeat
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(boss.hp || 100);
  const [comboCount, setComboCount] = useState(0);
  const [specialMeter, setSpecialMeter] = useState(0);
  const [playerAction, setPlayerAction] = useState('idle');
  const [bossAction, setBossAction] = useState('idle');
  
  // Animation values
  const playerX = useRef(new Animated.Value(50)).current;
  const playerY = useRef(new Animated.Value(FLOOR_Y)).current;
  const bossX = useRef(new Animated.Value(screenWidth - 100)).current;
  const bossY = useRef(new Animated.Value(FLOOR_Y)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
  
  // Combat timers
  const playerActionTimer = useRef(null);
  const bossActionTimer = useRef(null);
  const comboTimer = useRef(null);
  
  // Initialize battle
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeout(() => setGameState('fighting'), 1000);
    }
  }, [gameState]);
  
  // Boss AI
  useEffect(() => {
    if (gameState !== 'fighting') return;
    
    const bossAI = setInterval(() => {
      if (Math.random() < 0.3) {
        performBossAttack();
      }
    }, 2000);
    
    return () => clearInterval(bossAI);
  }, [gameState, playerHP]);
  
  // Update stats callback
  useEffect(() => {
    onUpdateStats({
      playerHP,
      bossHP,
      comboCount,
      specialMeter,
    });
  }, [playerHP, bossHP, comboCount, specialMeter]);
  
  // Check victory/defeat conditions
  useEffect(() => {
    if (bossHP <= 0 && gameState === 'fighting') {
      setGameState('victory');
      onBattleEnd({ victory: true, score: calculateScore() });
    } else if (playerHP <= 0 && gameState === 'fighting') {
      setGameState('defeat');
      onBattleEnd({ victory: false, score: 0 });
    }
  }, [playerHP, bossHP]);
  
  const calculateScore = () => {
    return Math.floor(playerHP * 10 + comboCount * 50 + specialMeter * 20);
  };
  
  const performPlayerAttack = (type = 'punch') => {
    if (gameState !== 'fighting' || playerAction !== 'idle') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlayerAction(type);
    
    // Move player forward
    Animated.sequence([
      Animated.timing(playerX, {
        toValue: bossX._value - 80,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playerX, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Calculate damage
    const damage = type === 'special' ? 30 : (type === 'kick' ? 15 : 10);
    const actualDamage = damage + (playerStats.strength || 0) * 0.1;
    
    // Apply damage
    setBossHP(prev => Math.max(0, prev - actualDamage));
    setBossAction('hurt');
    
    // Flash effect
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Update combo
    if (comboTimer.current) clearTimeout(comboTimer.current);
    setComboCount(prev => prev + 1);
    comboTimer.current = setTimeout(() => setComboCount(0), 2000);
    
    // Build special meter
    setSpecialMeter(prev => Math.min(100, prev + 15));
    
    // Reset actions
    setTimeout(() => {
      setPlayerAction('idle');
      setBossAction('idle');
    }, 500);
  };
  
  const performBossAttack = () => {
    if (bossAction !== 'idle' || playerAction === 'block') return;
    
    setBossAction('attack');
    
    // Move boss forward
    Animated.sequence([
      Animated.timing(bossX, {
        toValue: playerX._value + 80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bossX, {
        toValue: screenWidth - 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Apply damage if not blocking
    if (playerAction !== 'block') {
      const damage = boss.attackPower || 15;
      setPlayerHP(prev => Math.max(0, prev - damage));
      setPlayerAction('hurt');
      
      // Shake screen
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setTimeout(() => {
      setBossAction('idle');
      setPlayerAction('idle');
    }, 500);
  };
  
  const performBlock = () => {
    if (gameState !== 'fighting') return;
    
    setPlayerAction('block');
    setTimeout(() => setPlayerAction('idle'), 1000);
  };
  
  const performSpecial = () => {
    if (specialMeter < 100 || gameState !== 'fighting') return;
    
    setSpecialMeter(0);
    performPlayerAttack('special');
    
    // Special visual effects
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const getCharacterSprite = (character, action) => {
    if (character === 'player') {
      return SPRITES.player[action] || SPRITES.player.idle;
    } else {
      const bossSprites = SPRITES.boss[boss.id] || SPRITES.boss.sloth_demon;
      return bossSprites[action] || bossSprites.idle;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Battle Arena */}
      <Animated.View 
        style={[
          styles.battleArena,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {/* Background */}
        <View style={styles.background}>
          <View style={styles.floor} />
        </View>
        
        {/* Player Character */}
        <Animated.View
          style={[
            styles.character,
            {
              transform: [
                { translateX: playerX },
                { translateY: playerY },
              ],
            },
          ]}
        >
          <Text style={styles.characterSprite}>
            {getCharacterSprite('player', playerAction)}
          </Text>
          {comboCount > 0 && (
            <Text style={[styles.comboText, pixelFont]}>
              x{comboCount}
            </Text>
          )}
        </Animated.View>
        
        {/* Boss Character */}
        <Animated.View
          style={[
            styles.character,
            styles.boss,
            {
              transform: [
                { translateX: bossX },
                { translateY: bossY },
              ],
              opacity: flashAnim,
            },
          ]}
        >
          <Text style={styles.characterSprite}>
            {getCharacterSprite('boss', bossAction)}
          </Text>
        </Animated.View>
        
        {/* Battle Status Messages */}
        {gameState === 'ready' && (
          <View style={styles.messageOverlay}>
            <Text style={[styles.readyText, pixelFont]}>READY?</Text>
            <Text style={[styles.fightText, pixelFont]}>FIGHT!</Text>
          </View>
        )}
        
        {gameState === 'victory' && (
          <View style={styles.messageOverlay}>
            <Text style={[styles.victoryText, pixelFont]}>VICTORY!</Text>
          </View>
        )}
        
        {gameState === 'defeat' && (
          <View style={styles.messageOverlay}>
            <Text style={[styles.defeatText, pixelFont]}>DEFEAT...</Text>
          </View>
        )}
      </Animated.View>
      
      {/* Control Buttons */}
      <View style={styles.controls}>
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => performPlayerAttack('punch')}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>PUNCH</Text>
            <Text style={styles.buttonIcon}>👊</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => performPlayerAttack('kick')}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>KICK</Text>
            <Text style={styles.buttonIcon}>🦵</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={performBlock}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>BLOCK</Text>
            <Text style={styles.buttonIcon}>🛡️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.specialButton,
              specialMeter < 100 && styles.disabledButton,
            ]}
            onPress={performSpecial}
            disabled={specialMeter < 100 || gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>SPECIAL</Text>
            <Text style={styles.buttonIcon}>⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  battleArena: {
    height: BATTLE_AREA_HEIGHT,
    backgroundColor: '#9BBC0F',
    borderWidth: 4,
    borderColor: '#0D0D0D',
    overflow: 'hidden',
    position: 'relative',
  },
  
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  
  floor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#708028',
    borderTopWidth: 2,
    borderTopColor: '#0D0D0D',
  },
  
  character: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  boss: {
    transform: [{ scaleX: -1 }], // Face left
  },
  
  characterSprite: {
    fontSize: 40,
  },
  
  comboText: {
    position: 'absolute',
    top: -20,
    fontSize: 16,
    color: '#F7D51D',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  readyText: {
    fontSize: 32,
    color: '#F7D51D',
    marginBottom: 10,
  },
  
  fightText: {
    fontSize: 48,
    color: '#E53935',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  victoryText: {
    fontSize: 48,
    color: '#92CC41',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  defeatText: {
    fontSize: 48,
    color: '#E53935',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#0D0D0D',
  },
  
  leftControls: {
    flexDirection: 'row',
    gap: 10,
  },
  
  rightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  
  controlButton: {
    backgroundColor: '#92CC41',
    borderWidth: 3,
    borderColor: '#708028',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  
  specialButton: {
    backgroundColor: '#3498db',
    borderColor: '#2c3e50',
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  buttonText: {
    fontSize: 10,
    color: '#0D0D0D',
    marginBottom: 4,
  },
  
  buttonIcon: {
    fontSize: 20,
  },
});

export default MobileBattleGame;