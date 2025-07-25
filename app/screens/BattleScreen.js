/**
 * Battle Screen - 2D Fighting Game Interface
 * Street Fighter/Mortal Kombat style battles with GameBoy aesthetic
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import PhaserWebView from '../components/PhaserWebView';
import MobileBattleGame from '../components/MobileBattleGame';
import SimpleBattleGame from '../components/SimpleBattleGame';
import BossSelector from '../components/BossSelector';
import BattleHUD from '../components/BattleHUD';
import LeaderboardService from '../services/LeaderboardService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Damage color
  blue: '#3498db',         // Special move color
  screenBg: '#9BBC0F',     // Classic GameBoy screen
};

// Boss data structure
const BOSSES = [
  {
    id: 'sloth_demon',
    name: 'SLOTH DEMON',
    level: 5,
    description: 'The embodiment of laziness',
    hp: 100,
    attackPower: 15,
    defense: 10,
    specialMove: 'Couch Lock',
    weakness: 'cardio',
    sprite: '😴', // Placeholder
  },
  {
    id: 'junk_food_monster',
    name: 'JUNK FOOD BEAST',
    level: 10,
    description: 'Master of unhealthy temptations',
    hp: 150,
    attackPower: 20,
    defense: 15,
    specialMove: 'Sugar Rush',
    weakness: 'nutrition',
    sprite: '🍔', // Placeholder
  },
  {
    id: 'procrastination_phantom',
    name: 'PROCRASTINATOR',
    level: 15,
    description: 'Tomorrow never comes',
    hp: 200,
    attackPower: 25,
    defense: 20,
    specialMove: 'Time Warp',
    weakness: 'consistency',
    sprite: '⏰', // Placeholder
  },
  {
    id: 'stress_titan',
    name: 'STRESS TITAN',
    level: 20,
    description: 'Overwhelming pressure incarnate',
    hp: 250,
    attackPower: 30,
    defense: 25,
    specialMove: 'Anxiety Wave',
    weakness: 'meditation',
    sprite: '😰', // Placeholder
  },
];

const BattleScreen = ({
  playerStats = {},
  onNavigate = () => {},
  onBattleComplete = () => {},
}) => {
  const insets = useSafeAreaInsets();
  // Default to first boss for testing
  const [selectedBoss, setSelectedBoss] = useState(BOSSES[0]);
  const [battleState, setBattleState] = useState('battle'); // selection, loading, battle, victory, defeat
  const [battleStats, setBattleStats] = useState({
    playerHP: 100,
    playerMaxHP: 100,
    bossHP: BOSSES[0].hp,
    bossMaxHP: BOSSES[0].hp,
    comboCount: 0,
    specialMeter: 0,
    damageDealt: 0,
    damageTaken: 0,
    maxCombo: 0,
  });
  const [battleStartTime, setBattleStartTime] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Calculate available bosses based on player level
  const availableBosses = BOSSES.filter(boss => playerStats.level >= boss.level);

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBossSelect = useCallback((boss) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBoss(boss);
    
    // Initialize battle stats
    const playerMaxHP = 100 + (playerStats.health || 0);
    const bossMaxHP = boss.hp;
    
    setBattleStats({
      playerHP: playerMaxHP,
      playerMaxHP,
      bossHP: bossMaxHP,
      bossMaxHP,
      comboCount: 0,
      specialMeter: 0,
      damageDealt: 0,
      damageTaken: 0,
      maxCombo: 0,
    });
    
    // Transition to loading state
    setBattleState('loading');
    
    // Simulate loading
    setTimeout(() => {
      setBattleState('battle');
      setBattleStartTime(Date.now()); // Record battle start time
    }, 1500);
  }, [playerStats.health]);

  const handleBattleEnd = async (result) => {
    setBattleState(result.victory ? 'victory' : 'defeat');
    
    // Calculate rewards
    if (result.victory) {
      const xpReward = selectedBoss.level * 20 + result.score;
      const statBoosts = {
        strength: Math.floor(Math.random() * 3) + 1,
        stamina: Math.floor(Math.random() * 3) + 1,
        focus: Math.floor(Math.random() * 3) + 1,
      };
      
      // Submit score to leaderboard
      const leaderboardData = {
        username: playerStats.name || 'Player',
        bossId: selectedBoss.id,
        duration: Math.floor((Date.now() - battleStartTime) / 1000), // in seconds
        maxCombo: result.stats?.maxCombo || battleStats.maxCombo || 0,
        damageDealt: result.stats?.damageDealt || battleStats.damageDealt || 0,
        damageTaken: result.stats?.damageTaken || battleStats.damageTaken || 0,
        playerHP: result.stats?.playerHP || battleStats.playerHP || 0,
        maxPlayerHP: result.stats?.playerMaxHP || battleStats.playerMaxHP || 100,
        difficulty: selectedBoss.difficulty || 'NORMAL',
      };
      
      const leaderboardResult = await LeaderboardService.submitScore(leaderboardData);
      
      if (leaderboardResult.success) {
        console.log('Score submitted successfully! Rank:', leaderboardResult.rank);
        // Store the score and rank for display
        setBattleStats(prev => ({
          ...prev,
          finalScore: leaderboardResult.score,
          globalRank: leaderboardResult.rank?.global_rank
        }));
      }
      
      onBattleComplete({
        victory: true,
        xpEarned: xpReward,
        statBoosts,
        bossDefeated: selectedBoss.id,
        leaderboardScore: leaderboardResult.score,
        leaderboardRank: leaderboardResult.rank?.global_rank,
      });
    } else {
      onBattleComplete({
        victory: false,
        xpLost: 10,
        statPenalty: {
          happiness: -5,
        },
      });
    }
  };

  const renderBossSelection = () => (
    <Animated.View style={[styles.selectionContainer, { opacity: fadeAnim }]}>
      <Text style={[styles.title, pixelFont]}>SELECT YOUR OPPONENT</Text>
      
      {availableBosses.length > 0 ? (
        <>
          <Text style={[styles.subtitle, pixelFont]}>
            Choose wisely - each boss has unique abilities!
          </Text>
          
          <BossSelector
            bosses={availableBosses}
            playerLevel={playerStats.level}
            onSelectBoss={handleBossSelect}
          />
        </>
      ) : (
        <View style={styles.noBossesContainer}>
          <Text style={[styles.noBossesText, pixelFont]}>
            NO BOSSES AVAILABLE
          </Text>
          <Text style={[styles.noBossesSubtext, pixelFont]}>
            Reach Level 5 to unlock your first battle!
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <Text style={[styles.loadingText, pixelFont]}>PREPARING BATTLE...</Text>
      <View style={styles.vsContainer}>
        <View style={styles.fighterInfo}>
          <Text style={styles.fighterIcon}>💪</Text>
          <Text style={[styles.fighterName, pixelFont]}>YOU</Text>
          <Text style={[styles.fighterLevel, pixelFont]}>LV.{playerStats.level}</Text>
        </View>
        
        <Text style={[styles.vsText, pixelFont]}>VS</Text>
        
        <View style={styles.fighterInfo}>
          <Text style={styles.fighterIcon}>{selectedBoss.sprite}</Text>
          <Text style={[styles.fighterName, pixelFont]}>{selectedBoss.name}</Text>
          <Text style={[styles.fighterLevel, pixelFont]}>LV.{selectedBoss.level}</Text>
        </View>
      </View>
      
      <Text style={[styles.tipText, pixelFont]}>
        TIP: {selectedBoss.name} is weak to {selectedBoss.weakness}!
      </Text>
    </View>
  );

  const renderBattle = () => (
    <View style={{ flex: 1 }}>
      <SimpleBattleGame
        playerStats={playerStats}
        boss={selectedBoss}
        onBattleEnd={handleBattleEnd}
        onUpdateStats={(stats) => setBattleStats(prev => ({ ...prev, ...stats }))}
        onGameReady={() => console.log('Game ready!')}
      />
    </View>
  );

  const renderVictoryScreen = () => (
    <View style={styles.resultContainer}>
      <Text style={[styles.victoryText, pixelFont]}>VICTORY!</Text>
      <Text style={styles.victoryIcon}>🏆</Text>
      
      {/* Leaderboard Score Display */}
      {battleStats.finalScore && (
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreLabel, pixelFont]}>FINAL SCORE</Text>
          <Text style={[styles.scoreValue, pixelFont]}>
            {battleStats.finalScore.toLocaleString()}
          </Text>
          {battleStats.globalRank && (
            <Text style={[styles.rankText, pixelFont]}>
              GLOBAL RANK: #{battleStats.globalRank}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.rewardsContainer}>
        <Text style={[styles.rewardsTitle, pixelFont]}>REWARDS EARNED</Text>
        <Text style={[styles.rewardItem, pixelFont]}>
          +{selectedBoss.level * 20} XP
        </Text>
        <Text style={[styles.rewardItem, pixelFont]}>
          STRENGTH +2
        </Text>
        <Text style={[styles.rewardItem, pixelFont]}>
          NEW ACHIEVEMENT UNLOCKED
        </Text>
      </View>
      
      <View style={styles.victoryButtons}>
        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={() => onNavigate('leaderboard')}
        >
          <Text style={[styles.leaderboardButtonText, pixelFont]}>VIEW LEADERBOARD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.continueButtonText, pixelFont]}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDefeatScreen = () => (
    <View style={styles.resultContainer}>
      <Text style={[styles.defeatText, pixelFont]}>DEFEAT...</Text>
      <Text style={styles.defeatIcon}>💀</Text>
      
      <Text style={[styles.defeatMessage, pixelFont]}>
        {selectedBoss.name} was too powerful!
      </Text>
      <Text style={[styles.defeatSubMessage, pixelFont]}>
        Train harder and try again
      </Text>
      
      <View style={styles.defeatButtons}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setBattleState('selection');
            setSelectedBoss(null);
          }}
        >
          <Text style={[styles.retryButtonText, pixelFont]}>RETRY</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.homeButtonText, pixelFont]}>HOME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom,
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>BATTLE MODE</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content based on battle state */}
      <View style={[styles.content, battleState === 'battle' && { paddingHorizontal: 0 }]}>
        {battleState === 'selection' && renderBossSelection()}
        {battleState === 'loading' && renderLoadingScreen()}
        {battleState === 'battle' && renderBattle()}
        {battleState === 'victory' && renderVictoryScreen()}
        {battleState === 'defeat' && renderDefeatScreen()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  selectionContainer: {
    flex: 1,
    paddingTop: 40,
  },

  title: {
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.yellow,
    textAlign: 'center',
    marginBottom: 30,
  },

  noBossesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noBossesText: {
    fontSize: 18,
    color: COLORS.red,
    letterSpacing: 1,
    marginBottom: 10,
  },

  noBossesSubtext: {
    fontSize: 12,
    color: COLORS.yellow,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 40,
  },

  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 40,
  },

  fighterInfo: {
    alignItems: 'center',
  },

  fighterIcon: {
    fontSize: 48,
    marginBottom: 10,
  },

  fighterName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 5,
  },

  fighterLevel: {
    fontSize: 10,
    color: COLORS.yellow,
  },

  vsText: {
    fontSize: 32,
    color: COLORS.red,
    letterSpacing: 3,
  },

  tipText: {
    fontSize: 10,
    color: COLORS.yellow,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  battleContainer: {
    flex: 1,
    paddingTop: 20,
  },

  gameContainer: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    marginTop: 20,
  },

  mobileGameContainer: {
    flex: 1,
    marginTop: 20,
  },

  mobileMessage: {
    fontSize: 24,
    color: COLORS.dark,
    letterSpacing: 2,
    marginBottom: 10,
  },

  mobileSubMessage: {
    fontSize: 12,
    color: COLORS.dark,
    marginBottom: 40,
  },

  mobileBattleButtons: {
    gap: 20,
  },

  mobileBattleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
  },

  mobileBattleButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  victoryText: {
    fontSize: 32,
    color: COLORS.yellow,
    letterSpacing: 3,
    marginBottom: 20,
  },

  victoryIcon: {
    fontSize: 64,
    marginBottom: 30,
  },

  rewardsContainer: {
    backgroundColor: 'rgba(247, 213, 29, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.yellow,
    borderRadius: 8,
    padding: 20,
    marginBottom: 40,
  },

  rewardsTitle: {
    fontSize: 14,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },

  rewardItem: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  continueButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
  },

  continueButtonText: {
    fontSize: 16,
    color: COLORS.dark,
    letterSpacing: 1,
  },
  
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  scoreLabel: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 5,
  },
  
  scoreValue: {
    fontSize: 32,
    color: COLORS.yellow,
    letterSpacing: 2,
  },
  
  rankText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 10,
  },
  
  victoryButtons: {
    gap: 15,
    marginTop: 20,
  },
  
  leaderboardButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },
  
  leaderboardButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },

  defeatText: {
    fontSize: 32,
    color: COLORS.red,
    letterSpacing: 3,
    marginBottom: 20,
  },

  defeatIcon: {
    fontSize: 64,
    marginBottom: 30,
  },

  defeatMessage: {
    fontSize: 14,
    color: COLORS.red,
    marginBottom: 10,
  },

  defeatSubMessage: {
    fontSize: 12,
    color: COLORS.yellow,
    marginBottom: 40,
  },

  defeatButtons: {
    flexDirection: 'row',
    gap: 20,
  },

  retryButton: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
  },

  retryButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  homeButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: COLORS.dark,
  },

  homeButtonText: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
  },
});

export default BattleScreen;