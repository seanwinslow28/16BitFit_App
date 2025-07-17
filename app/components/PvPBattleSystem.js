/**
 * PvP Battle System Component
 * Real-time multiplayer battles
 * Following MetaSystemsAgent patterns for competitive gameplay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
  orange: '#e67e22',
  gray: '#666',
  white: '#FFFFFF',
};

// Battle states
const BATTLE_STATES = {
  SEARCHING: 'searching',
  FOUND: 'found',
  PREPARING: 'preparing',
  FIGHTING: 'fighting',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  DRAW: 'draw',
};

// Attack types
const ATTACK_TYPES = {
  PUNCH: { name: 'PUNCH', damage: 10, speed: 1, icon: '👊' },
  KICK: { name: 'KICK', damage: 15, speed: 1.5, icon: '🦵' },
  BLOCK: { name: 'BLOCK', damage: 0, defense: 0.5, icon: '🛡️' },
  SPECIAL: { name: 'SPECIAL', damage: 25, speed: 2, cooldown: 5, icon: '⚡' },
};

// Mock opponents
const MOCK_OPPONENTS = [
  { id: 'o1', username: 'ShadowBoxer', level: 10, avatar: '🥊', strength: 70, health: 100 },
  { id: 'o2', username: 'IronFist', level: 12, avatar: '👊', strength: 80, health: 110 },
  { id: 'o3', username: 'SwiftKicker', level: 8, avatar: '🦵', strength: 60, health: 90 },
  { id: 'o4', username: 'DefenseMaster', level: 15, avatar: '🛡️', strength: 90, health: 120 },
];

const PvPBattleSystem = ({
  currentUser = { username: 'Player', level: 10, strength: 75, health: 100 },
  onNavigate = () => {},
  onBattleComplete = () => {},
}) => {
  const [battleState, setBattleState] = useState(BATTLE_STATES.SEARCHING);
  const [opponent, setOpponent] = useState(null);
  const [playerHP, setPlayerHP] = useState(currentUser.health);
  const [opponentHP, setOpponentHP] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [combo, setCombo] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [specialCooldown, setSpecialCooldown] = useState(0);
  const [battleTimer, setBattleTimer] = useState(60);
  const [showResults, setShowResults] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const playerHealthAnim = useRef(new Animated.Value(1)).current;
  const opponentHealthAnim = useRef(new Animated.Value(1)).current;
  
  // Battle timer ref
  const timerRef = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => {
    // Start matchmaking
    startMatchmaking();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    // Battle timer
    if (battleState === BATTLE_STATES.FIGHTING && battleTimer > 0) {
      timerRef.current = setInterval(() => {
        setBattleTimer(prev => {
          if (prev <= 1) {
            endBattle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [battleState, battleTimer]);

  useEffect(() => {
    // Special attack cooldown
    if (specialCooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setSpecialCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [specialCooldown]);

  const startMatchmaking = async () => {
    setBattleState(BATTLE_STATES.SEARCHING);
    
    // Pulse animation for searching
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Simulate finding opponent
    setTimeout(async () => {
      const randomOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
      setOpponent(randomOpponent);
      setOpponentHP(randomOpponent.health);
      setBattleState(BATTLE_STATES.FOUND);
      
      await SoundFXManager.playSound('battle_start');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Prepare for battle
      setTimeout(() => {
        setBattleState(BATTLE_STATES.PREPARING);
        setTimeout(() => {
          setBattleState(BATTLE_STATES.FIGHTING);
          addBattleLog('FIGHT!', 'system');
        }, 2000);
      }, 2000);
    }, 3000);
  };

  const handleAttack = async (attackType) => {
    if (battleState !== BATTLE_STATES.FIGHTING || selectedAttack) return;
    
    // Check cooldown for special attack
    if (attackType.name === 'SPECIAL' && specialCooldown > 0) {
      await SoundFXManager.playError();
      return;
    }
    
    // Check energy
    const energyCost = attackType.damage * 2;
    if (playerEnergy < energyCost) {
      await SoundFXManager.playError();
      addBattleLog('Not enough energy!', 'warning');
      return;
    }
    
    setSelectedAttack(attackType);
    setPlayerEnergy(prev => Math.max(0, prev - energyCost));
    
    // Play attack sound
    await SoundFXManager.playSound(
      attackType.name === 'PUNCH' ? 'battle_punch_light' :
      attackType.name === 'KICK' ? 'battle_kick' :
      attackType.name === 'BLOCK' ? 'battle_block' :
      'battle_special'
    );
    
    // Execute attack
    if (attackType.name === 'BLOCK') {
      // Defensive move
      addBattleLog(`${currentUser.username} blocks!`, 'player');
    } else {
      // Offensive move
      const damage = calculateDamage(attackType, currentUser.strength);
      const newHP = Math.max(0, opponentHP - damage);
      setOpponentHP(newHP);
      
      // Animate health bar
      Animated.timing(opponentHealthAnim, {
        toValue: newHP / opponent.health,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Update combo
      setCombo(prev => prev + 1);
      
      // Battle log
      addBattleLog(
        `${currentUser.username} uses ${attackType.name} for ${damage} damage!`,
        'player'
      );
      
      // Set cooldown for special
      if (attackType.name === 'SPECIAL') {
        setSpecialCooldown(attackType.cooldown);
      }
      
      // Check victory
      if (newHP <= 0) {
        endBattle(BATTLE_STATES.VICTORY);
        return;
      }
    }
    
    // Opponent counter attack
    setTimeout(() => {
      opponentAttack();
      setSelectedAttack(null);
    }, 1000);
  };

  const opponentAttack = async () => {
    // AI opponent logic
    const attacks = Object.values(ATTACK_TYPES).filter(a => a.name !== 'SPECIAL');
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    
    if (attack.name === 'BLOCK') {
      addBattleLog(`${opponent.username} blocks!`, 'opponent');
    } else {
      const damage = calculateDamage(attack, opponent.strength);
      const blockReduction = selectedAttack?.name === 'BLOCK' ? 0.5 : 1;
      const finalDamage = Math.floor(damage * blockReduction);
      const newHP = Math.max(0, playerHP - finalDamage);
      
      setPlayerHP(newHP);
      
      // Animate health bar
      Animated.timing(playerHealthAnim, {
        toValue: newHP / currentUser.health,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Screen shake on hit
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
      
      await SoundFXManager.playSound('battle_hit');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      addBattleLog(
        `${opponent.username} uses ${attack.name} for ${finalDamage} damage!`,
        'opponent'
      );
      
      // Check defeat
      if (newHP <= 0) {
        endBattle(BATTLE_STATES.DEFEAT);
      }
    }
    
    // Regenerate some energy
    setPlayerEnergy(prev => Math.min(100, prev + 10));
  };

  const calculateDamage = (attack, strength) => {
    const baseDamage = attack.damage;
    const strengthBonus = strength / 100;
    const comboBonus = 1 + (combo * 0.1);
    return Math.floor(baseDamage * strengthBonus * comboBonus);
  };

  const addBattleLog = (message, type) => {
    setBattleLog(prev => [...prev, { message, type, timestamp: Date.now() }].slice(-5));
  };

  const endBattle = async (result) => {
    const finalResult = result || (playerHP > opponentHP ? BATTLE_STATES.VICTORY : 
                                  playerHP < opponentHP ? BATTLE_STATES.DEFEAT : 
                                  BATTLE_STATES.DRAW);
    
    setBattleState(finalResult);
    setShowResults(true);
    
    // Play result sound
    await SoundFXManager.playSound(
      finalResult === BATTLE_STATES.VICTORY ? 'battle_victory' :
      finalResult === BATTLE_STATES.DEFEAT ? 'battle_defeat' :
      'ui_success'
    );
    
    // Calculate rewards
    const rewards = calculateRewards(finalResult);
    onBattleComplete(finalResult, rewards);
  };

  const calculateRewards = (result) => {
    if (result === BATTLE_STATES.VICTORY) {
      return {
        xp: 50 + (opponent.level * 5),
        coins: 20 + (opponent.level * 2),
        items: Math.random() > 0.7 ? ['Battle Trophy'] : [],
      };
    } else if (result === BATTLE_STATES.DRAW) {
      return {
        xp: 20,
        coins: 10,
        items: [],
      };
    }
    return { xp: 10, coins: 5, items: [] };
  };

  const renderBattleScreen = () => {
    const healthPercentage = (playerHP / currentUser.health) * 100;
    const opponentHealthPercentage = (opponentHP / (opponent?.health || 100)) * 100;
    
    return (
      <Animated.View style={[
        styles.battleArena,
        { transform: [{ translateX: shakeAnim }] },
      ]}>
        {/* Battle Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, pixelFont]}>
            {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
          </Text>
        </View>
        
        {/* Opponent */}
        <View style={styles.fighterSection}>
          <View style={styles.fighterInfo}>
            <Text style={styles.fighterAvatar}>{opponent?.avatar}</Text>
            <View>
              <Text style={[styles.fighterName, pixelFont]}>{opponent?.username}</Text>
              <Text style={[styles.fighterLevel, pixelFont]}>LVL {opponent?.level}</Text>
            </View>
          </View>
          
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarBg}>
              <Animated.View 
                style={[
                  styles.healthBar, 
                  { 
                    width: `${opponentHealthPercentage}%`,
                    backgroundColor: opponentHealthPercentage > 50 ? COLORS.primary : 
                                   opponentHealthPercentage > 25 ? COLORS.yellow : COLORS.red,
                  },
                ]} 
              />
            </View>
            <Text style={[styles.healthText, pixelFont]}>
              {opponentHP}/{opponent?.health || 100}
            </Text>
          </View>
        </View>
        
        {/* Battle Log */}
        <ScrollView style={styles.battleLog}>
          {battleLog.map((log, index) => (
            <Text 
              key={index} 
              style={[
                styles.logText, 
                pixelFont,
                log.type === 'player' && styles.playerLog,
                log.type === 'opponent' && styles.opponentLog,
                log.type === 'system' && styles.systemLog,
                log.type === 'warning' && styles.warningLog,
              ]}
            >
              {log.message}
            </Text>
          ))}
        </ScrollView>
        
        {/* Player */}
        <View style={styles.playerSection}>
          <View style={styles.fighterInfo}>
            <Text style={styles.fighterAvatar}>🎮</Text>
            <View>
              <Text style={[styles.fighterName, pixelFont]}>{currentUser.username}</Text>
              <Text style={[styles.fighterLevel, pixelFont]}>LVL {currentUser.level}</Text>
            </View>
            {combo > 0 && (
              <View style={styles.comboContainer}>
                <Text style={[styles.comboText, pixelFont]}>x{combo}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarBg}>
              <Animated.View 
                style={[
                  styles.healthBar, 
                  { 
                    width: `${healthPercentage}%`,
                    backgroundColor: healthPercentage > 50 ? COLORS.primary : 
                                   healthPercentage > 25 ? COLORS.yellow : COLORS.red,
                  },
                ]} 
              />
            </View>
            <Text style={[styles.healthText, pixelFont]}>
              {playerHP}/{currentUser.health}
            </Text>
          </View>
          
          {/* Energy Bar */}
          <View style={styles.energyBarContainer}>
            <View style={styles.energyBarBg}>
              <View 
                style={[
                  styles.energyBar, 
                  { width: `${playerEnergy}%` },
                ]} 
              />
            </View>
            <Text style={[styles.energyText, pixelFont]}>ENERGY</Text>
          </View>
        </View>
        
        {/* Attack Buttons */}
        <View style={styles.attackButtons}>
          {Object.values(ATTACK_TYPES).map((attack) => (
            <TouchableOpacity
              key={attack.name}
              style={[
                styles.attackButton,
                attack.name === 'SPECIAL' && styles.specialButton,
                (attack.name === 'SPECIAL' && specialCooldown > 0) && styles.disabledButton,
                selectedAttack?.name === attack.name && styles.selectedButton,
              ]}
              onPress={() => handleAttack(attack)}
              disabled={battleState !== BATTLE_STATES.FIGHTING || 
                       (attack.name === 'SPECIAL' && specialCooldown > 0)}
            >
              <Text style={styles.attackIcon}>{attack.icon}</Text>
              <Text style={[styles.attackName, pixelFont]}>{attack.name}</Text>
              {attack.name === 'SPECIAL' && specialCooldown > 0 && (
                <Text style={[styles.cooldownText, pixelFont]}>{specialCooldown}s</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderResults = () => {
    const rewards = calculateRewards(battleState);
    
    return (
      <Modal
        visible={showResults}
        animationType="fade"
        transparent
      >
        <View style={styles.resultsOverlay}>
          <View style={styles.resultsContent}>
            <Text style={[styles.resultTitle, pixelFont]}>
              {battleState === BATTLE_STATES.VICTORY ? 'VICTORY!' :
               battleState === BATTLE_STATES.DEFEAT ? 'DEFEAT' :
               'DRAW'}
            </Text>
            
            <Text style={styles.resultIcon}>
              {battleState === BATTLE_STATES.VICTORY ? '🏆' :
               battleState === BATTLE_STATES.DEFEAT ? '💀' :
               '🤝'}
            </Text>
            
            <View style={styles.rewardsSection}>
              <Text style={[styles.rewardsTitle, pixelFont]}>REWARDS</Text>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={[styles.rewardText, pixelFont]}>{rewards.xp} XP</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <Text style={[styles.rewardText, pixelFont]}>{rewards.coins} COINS</Text>
              </View>
              {rewards.items.length > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🎁</Text>
                  <Text style={[styles.rewardText, pixelFont]}>{rewards.items[0]}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.rematchButton}
                onPress={() => {
                  setShowResults(false);
                  setPlayerHP(currentUser.health);
                  setPlayerEnergy(100);
                  setCombo(0);
                  setBattleLog([]);
                  setBattleTimer(60);
                  startMatchmaking();
                }}
              >
                <Text style={[styles.rematchText, pixelFont]}>REMATCH</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exitButton}
                onPress={() => onNavigate('social')}
              >
                <Text style={[styles.exitText, pixelFont]}>EXIT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>PVP BATTLE</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {battleState === BATTLE_STATES.SEARCHING && (
          <View style={styles.searchingContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.searchingIcon}>⚔️</Text>
            </Animated.View>
            <Text style={[styles.searchingText, pixelFont]}>FINDING OPPONENT...</Text>
            <Text style={[styles.searchingSubtext, pixelFont]}>
              Matching you with a worthy challenger
            </Text>
          </View>
        )}
        
        {battleState === BATTLE_STATES.FOUND && opponent && (
          <View style={styles.foundContainer}>
            <Text style={[styles.foundText, pixelFont]}>OPPONENT FOUND!</Text>
            <Text style={styles.vsIcon}>⚔️</Text>
            <View style={styles.matchupContainer}>
              <View style={styles.matchupPlayer}>
                <Text style={styles.playerIcon}>🎮</Text>
                <Text style={[styles.matchupName, pixelFont]}>{currentUser.username}</Text>
                <Text style={[styles.matchupLevel, pixelFont]}>LVL {currentUser.level}</Text>
              </View>
              <Text style={[styles.vsText, pixelFont]}>VS</Text>
              <View style={styles.matchupPlayer}>
                <Text style={styles.playerIcon}>{opponent.avatar}</Text>
                <Text style={[styles.matchupName, pixelFont]}>{opponent.username}</Text>
                <Text style={[styles.matchupLevel, pixelFont]}>LVL {opponent.level}</Text>
              </View>
            </View>
          </View>
        )}
        
        {battleState === BATTLE_STATES.PREPARING && (
          <View style={styles.preparingContainer}>
            <Text style={[styles.preparingText, pixelFont]}>GET READY!</Text>
            <Text style={styles.preparingIcon}>🥊</Text>
          </View>
        )}
        
        {battleState === BATTLE_STATES.FIGHTING && renderBattleScreen()}
        
        {(battleState === BATTLE_STATES.VICTORY || 
          battleState === BATTLE_STATES.DEFEAT || 
          battleState === BATTLE_STATES.DRAW) && renderResults()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  headerSpacer: {
    width: 80,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchingContainer: {
    alignItems: 'center',
  },

  searchingIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  searchingText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },

  searchingSubtext: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  foundContainer: {
    alignItems: 'center',
  },

  foundText: {
    fontSize: 18,
    color: COLORS.yellow,
    letterSpacing: 2,
    marginBottom: 20,
  },

  vsIcon: {
    fontSize: 48,
    marginBottom: 20,
  },

  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },

  matchupPlayer: {
    alignItems: 'center',
  },

  playerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  matchupName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  matchupLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  vsText: {
    fontSize: 20,
    color: COLORS.red,
    letterSpacing: 2,
  },

  preparingContainer: {
    alignItems: 'center',
  },

  preparingText: {
    fontSize: 24,
    color: COLORS.red,
    letterSpacing: 3,
    marginBottom: 20,
  },

  preparingIcon: {
    fontSize: 80,
  },

  battleArena: {
    flex: 1,
    width: screenWidth,
    padding: 20,
  },

  timerContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  timerText: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
  },

  fighterSection: {
    marginBottom: 20,
  },

  playerSection: {
    marginTop: 'auto',
    marginBottom: 20,
  },

  fighterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  fighterAvatar: {
    fontSize: 40,
    marginRight: 12,
  },

  fighterName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  fighterLevel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  comboContainer: {
    marginLeft: 'auto',
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  comboText: {
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1,
  },

  healthBarContainer: {
    marginBottom: 8,
  },

  healthBarBg: {
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  healthBar: {
    height: '100%',
    borderRadius: 8,
  },

  healthText: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: 'right',
    marginTop: 2,
  },

  energyBarContainer: {
    marginTop: 8,
  },

  energyBarBg: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  energyBar: {
    height: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 4,
  },

  energyText: {
    fontSize: 8,
    color: COLORS.blue,
    letterSpacing: 0.5,
    textAlign: 'right',
    marginTop: 2,
  },

  battleLog: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray,
    padding: 12,
    marginVertical: 20,
    maxHeight: 120,
  },

  logText: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  playerLog: {
    color: COLORS.primary,
  },

  opponentLog: {
    color: COLORS.red,
  },

  systemLog: {
    color: COLORS.yellow,
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 8,
  },

  warningLog: {
    color: COLORS.orange,
  },

  attackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  attackButton: {
    flex: 1,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },

  specialButton: {
    backgroundColor: 'rgba(247, 213, 29, 0.2)',
    borderColor: COLORS.yellow,
  },

  disabledButton: {
    opacity: 0.5,
  },

  selectedButton: {
    backgroundColor: 'rgba(146, 204, 65, 0.4)',
  },

  attackIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  attackName: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  cooldownText: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 8,
    color: COLORS.red,
    letterSpacing: 0.5,
  },

  resultsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultsContent: {
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 30,
    width: screenWidth - 60,
    alignItems: 'center',
  },

  resultTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 20,
  },

  resultIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  rewardsSection: {
    marginBottom: 30,
    alignItems: 'center',
  },

  rewardsTitle: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 2,
    marginBottom: 16,
  },

  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },

  rewardIcon: {
    fontSize: 24,
  },

  rewardText: {
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1,
  },

  resultActions: {
    flexDirection: 'row',
    gap: 16,
  },

  rematchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },

  rematchText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  exitButton: {
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },

  exitText: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
  },
});

export default PvPBattleSystem;