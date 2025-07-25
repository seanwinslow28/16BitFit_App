/**
 * Simple Battle Game Component
 * A simplified battle system using React Native components instead of WebView/Phaser
 * This is more reliable for mobile and avoids asset loading issues
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import BasicSprite from './BasicSprite';
import imageCache from '../services/ImageCache';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BATTLE_AREA_HEIGHT = screenHeight * 0.4; // Reduced to make room for controls
const FLOOR_Y = BATTLE_AREA_HEIGHT - 150; // Raise characters above floor

// Use cached sprite assets for better performance
const getSpriteAsset = (key) => {
  const assetMap = {
    sean_fighter: () => require('../assets/Sprites/Boss Battle Sprite Sheets/Sean_Fighter-Sprite-Sheet.png'),
    gym_bully: () => require('../assets/Sprites/Boss Battle Sprite Sheets/Gym_Bully-Sprite-Sheet.png'),
    fit_cat: () => require('../assets/Sprites/Boss Battle Sprite Sheets/Fit_Cat-Sprite-Sheet.png'),
    buff_mage: () => require('../assets/Sprites/Boss Battle Sprite Sheets/Buff_Mage-Sprite-Sheet.png'),
    rookie_ryu: () => require('../assets/Sprites/Boss Battle Sprite Sheets/Rookie_Ryu-Sprite-Sheet.png'),
  };
  
  return imageCache.getImage(`sprite_${key}`, assetMap[key]);
};

const getBackgroundAsset = (key) => {
  const assetMap = {
    dojo: () => require('../assets/Backgrounds/Tranquil_Dojo_Backround.png'),
    warehouse: () => require('../assets/Backgrounds/Industrial_Warehouse_at_Dusk.png'),
    main: () => require('../assets/Backgrounds/Main_Background.png'),
  };
  
  return imageCache.getImage(`bg_${key}`, assetMap[key]);
};

const SimpleBattleGame = ({ 
  playerStats = {}, 
  boss = {}, 
  onBattleEnd = () => {},
  onUpdateStats = () => {},
  onGameReady = () => {},
}) => {
  // Debug log
  console.log('SimpleBattleGame initialized with boss:', boss);
  console.log('Player sprite: sean_fighter');
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, fighting, victory, defeat
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(boss.health || boss.hp || 100);
  const [comboCount, setComboCount] = useState(0);
  const [specialMeter, setSpecialMeter] = useState(0);
  const [playerAction, setPlayerAction] = useState('idle');
  const [bossAction, setBossAction] = useState('idle');
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // Animation values
  const playerX = useRef(new Animated.Value(50)).current;
  const playerY = useRef(new Animated.Value(0)).current; // Start at 0, position is set by bottom
  const bossX = useRef(new Animated.Value(0)).current; // Start at 0 instead of negative
  const bossY = useRef(new Animated.Value(0)).current; // Start at 0, position is set by bottom
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const playerScale = useRef(new Animated.Value(1)).current;
  const bossScale = useRef(new Animated.Value(1)).current;
  
  // Combat timers
  const comboTimer = useRef(null);
  const bossAITimer = useRef(null);
  
  // Get boss sprite based on boss ID
  const getBossSprite = useCallback(() => {
    const spriteMap = {
      'sloth_demon': 'gym_bully',
      'junk_food_monster': 'fit_cat',
      'procrastination_phantom': 'buff_mage',  
      'stress_titan': 'rookie_ryu',
    };
    const spriteKey = spriteMap[boss.id] || 'rookie_ryu';
    return getSpriteAsset(spriteKey);
  }, [boss.id]);
  
  // Get background based on boss
  const getBackground = useCallback(() => {
    const bgMap = {
      'sloth_demon': 'warehouse',
      'junk_food_monster': 'dojo',
      'procrastination_phantom': 'main',
      'stress_titan': 'warehouse',
    };
    return getBackgroundAsset(bgMap[boss.id] || 'main');
  }, [boss.id]);
  
  // Initialize battle
  useEffect(() => {
    if (gameState === 'ready') {
      onGameReady();
      const startTimer = setTimeout(() => {
        setGameState('fighting');
        startBossAI();
      }, 2000);
      
      return () => clearTimeout(startTimer);
    }
  }, [gameState]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (bossAITimer.current) {
        clearInterval(bossAITimer.current);
        bossAITimer.current = null;
      }
      if (comboTimer.current) {
        clearTimeout(comboTimer.current);
        comboTimer.current = null;
      }
    };
  }, []);
  
  // Boss AI
  const startBossAI = () => {
    bossAITimer.current = setInterval(() => {
      if (Math.random() < 0.3) {
        performBossAttack();
      }
    }, 2000);
  };
  
  // Update stats callback
  useEffect(() => {
    onUpdateStats({
      playerHP,
      bossHP,
      comboCount,
      specialMeter,
      damageDealt,
      damageTaken,
      maxCombo,
    });
  }, [playerHP, bossHP, comboCount, specialMeter, damageDealt, damageTaken, maxCombo]);
  
  // Check victory/defeat conditions
  useEffect(() => {
    if (bossHP <= 0 && gameState === 'fighting') {
      setGameState('victory');
      if (bossAITimer.current) clearInterval(bossAITimer.current);
      onBattleEnd({ 
        victory: true, 
        score: calculateScore(),
        stats: {
          damageDealt,
          damageTaken,
          maxCombo,
          playerHP,
          playerMaxHP: 100
        }
      });
    } else if (playerHP <= 0 && gameState === 'fighting') {
      setGameState('defeat');
      if (bossAITimer.current) clearInterval(bossAITimer.current);
      onBattleEnd({ 
        victory: false, 
        score: 0,
        stats: {
          damageDealt,
          damageTaken,
          maxCombo,
          playerHP: 0,
          playerMaxHP: 100
        }
      });
    }
  }, [playerHP, bossHP]);
  
  const calculateScore = () => {
    // More comprehensive score calculation matching LeaderboardService
    const healthBonus = Math.floor(playerHP * 10);
    const comboBonus = maxCombo * 50;
    const damageBonus = Math.floor(damageDealt * 2);
    const defenseBonus = Math.max(0, 200 - damageTaken * 2);
    const specialBonus = specialMeter * 2;
    
    return healthBonus + comboBonus + damageBonus + defenseBonus + specialBonus;
  };
  
  const performPlayerAttack = (type = 'punch') => {
    if (gameState !== 'fighting' || playerAction !== 'idle') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlayerAction(type);
    
    // Animate player
    Animated.sequence([
      Animated.timing(playerX, {
        toValue: screenWidth / 2 - 40,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(playerX, {
        toValue: 80,
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
    
    // Track damage dealt
    setDamageDealt(prev => prev + actualDamage);
    
    // Update max combo
    setMaxCombo(prev => Math.max(prev, comboCount + 1));
    
    // Boss hurt animation
    Animated.sequence([
      Animated.timing(bossScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bossScale, {
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
    if (type !== 'special') {
      setSpecialMeter(prev => Math.min(100, prev + 15));
    }
    
    // Reset actions
    setTimeout(() => {
      setPlayerAction('idle');
      setBossAction('idle');
    }, 500);
  };
  
  const performBossAttack = () => {
    if (gameState !== 'fighting' || bossAction !== 'idle' || playerAction === 'block') return;
    
    setBossAction('attack');
    
    // Animate boss
    Animated.sequence([
      Animated.timing(bossX, {
        toValue: screenWidth / 2 + 40,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bossX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Apply damage if not blocking
    if (playerAction !== 'block') {
      const damage = boss.attackPower || 15;
      setPlayerHP(prev => Math.max(0, prev - damage));
      setPlayerAction('hurt');
      
      // Track damage taken
      setDamageTaken(prev => prev + damage);
      
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
  
  // Get player sprite
  const getPlayerSprite = useCallback(() => {
    return getSpriteAsset('sean_fighter');
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Test sprite loading with cache */}
      
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
        <Image source={getBackground()} style={styles.background} resizeMode="cover" />
        
        {/* Floor */}
        <View style={styles.floor} />
        
        {/* Optimized sprite loading with cache */}
        
        {/* Player Character */}
        <Animated.View
          style={[
            styles.character,
            {
              left: 0,
              bottom: 100,
              transform: [
                { translateX: playerX },
                { translateY: playerY },
                { scale: playerScale },
              ],
            },
          ]}
        >
          <BasicSprite source={getPlayerSprite()} />
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
              right: 50, // Position from right edge
              bottom: 100,
              transform: [
                { translateX: bossX },
                { translateY: bossY },
                { scale: bossScale },
              ],
            },
          ]}
        >
          <BasicSprite source={getBossSprite()} />
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
      
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.healthBars}>
          <View style={styles.playerHealth}>
            <Text style={[styles.healthLabel, pixelFont]}>HERO</Text>
            <View style={styles.healthBarBg}>
              <View style={[styles.healthBarFill, { width: `${playerHP}%` }]} />
            </View>
          </View>
          
          <View style={styles.bossHealth}>
            <Text style={[styles.healthLabel, pixelFont]}>{boss.name}</Text>
            <View style={styles.healthBarBg}>
              <View style={[styles.healthBarFillBoss, { width: `${(bossHP / (boss.health || boss.hp || 100)) * 100}%` }]} />
            </View>
          </View>
        </View>
        
        {/* Special Meter */}
        <View style={styles.specialMeterContainer}>
          <Text style={[styles.specialLabel, pixelFont]}>SPECIAL</Text>
          <View style={styles.specialMeterBg}>
            <View style={[styles.specialMeterFill, { width: `${specialMeter}%` }]} />
          </View>
        </View>
      </View>
      
      {/* Control Buttons */}
      <View style={styles.controls}>
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => performPlayerAttack('punch')}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>PUNCH</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => performPlayerAttack('kick')}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>KICK</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={performBlock}
            disabled={gameState !== 'fighting'}
          >
            <Text style={[styles.buttonText, pixelFont]}>BLOCK</Text>
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
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'space-between', // Ensure proper layout
  },
  
  battleArena: {
    height: BATTLE_AREA_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  
  floor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#708028',
    borderTopWidth: 4,
    borderTopColor: '#0D0D0D',
    zIndex: 1, // Ensure floor is behind characters
  },
  
  character: {
    position: 'absolute',
    width: 128, // Doubled size
    height: 128, // Doubled size
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure characters are above floor
    backgroundColor: 'rgba(255,255,255,0.3)', // Debug: see character positions
  },
  
  boss: {
    transform: [{ scaleX: -1 }], // Face left
  },
  
  characterSprite: {
    width: 128, // Doubled size
    height: 128, // Doubled size
    backgroundColor: 'rgba(255,255,255,0.3)', // Debug: show sprite bounds more visibly
  },
  
  bossSprite: {
    transform: [{ scaleX: -1 }], // Flip back to normal after parent flip
  },
  
  hurtTint: {
    tintColor: '#FF6666',
  },
  
  blockTint: {
    tintColor: '#3498db',
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
  
  hud: {
    padding: 20,
  },
  
  healthBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  playerHealth: {
    flex: 1,
    marginRight: 10,
  },
  
  bossHealth: {
    flex: 1,
    marginLeft: 10,
  },
  
  healthLabel: {
    fontSize: 12,
    color: '#92CC41',
    marginBottom: 4,
  },
  
  healthBarBg: {
    height: 20,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#0D0D0D',
    borderRadius: 4,
  },
  
  healthBarFill: {
    height: '100%',
    backgroundColor: '#92CC41',
    borderRadius: 2,
  },
  
  healthBarFillBoss: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: 2,
  },
  
  specialMeterContainer: {
    marginTop: 10,
  },
  
  specialLabel: {
    fontSize: 10,
    color: '#3498db',
    marginBottom: 2,
  },
  
  specialMeterBg: {
    height: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#0D0D0D',
    borderRadius: 4,
  },
  
  specialMeterFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 2,
    borderTopColor: '#92CC41',
    height: 100, // Fixed height
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    padding: 15,
    alignItems: 'center',
    minWidth: 80,
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
    fontSize: 12,
    color: '#0D0D0D',
    fontWeight: 'bold',
  },
});

export default SimpleBattleGame;