/**
 * 16BitFit - Gamified Fitness & Nutrition Tracking App
 * GameBoy-Style Shell with Avatar Evolution System
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const App = () => {
  // Game State
  const [currentScreen, setCurrentScreen] = useState('home');
  const [playerStats, setPlayerStats] = useState({
    level: 5,
    xp: 180,
    xpToNext: 300,
    focus: 85,
    strength: 72,
    endurance: 68,
    health: 90,
    evolutionStage: 2,
    streak: 7,
  });

  const [avatarState, setAvatarState] = useState({
    mood: 'happy',
    appearance: 'fit',
    gear: ['headband', 'gloves'],
    animations: ['flex', 'run'],
  });

  const [dailyActions, setDailyActions] = useState({
    workoutLogged: false,
    mealLogged: false,
    restLogged: false,
  });

  const [bossAvailable, setBossAvailable] = useState(false);
  const [inBattle, setInBattle] = useState(false);

  // Check for boss availability based on level milestones
  useEffect(() => {
    setBossAvailable(playerStats.level % 5 === 0 && playerStats.level > 0);
  }, [playerStats.level]);

  // GameBoy Shell Components
  const GameBoyShell = ({children}) => (
    <View style={styles.gameBoyShell}>
      {/* Top Speaker */}
      <View style={styles.topSection}>
        <View style={styles.speakerGrill}>
          {Array(6).fill(0).map((_, i) => (
            <View key={i} style={styles.speakerHole} />
          ))}
        </View>
      </View>

      {/* Screen Area */}
      <View style={styles.screenArea}>
        <Text style={styles.gameBoyLabel}>16BitFit</Text>
        <View style={styles.screenFrame}>
          <View style={styles.screen}>
            {children}
          </View>
        </View>
        <View style={styles.powerLED} />
      </View>

      {/* Controls */}
      <View style={styles.controlsArea}>
        <View style={styles.leftControls}>
          <View style={styles.dPad}>
            <TouchableOpacity style={[styles.dPadButton, styles.dPadUp]} />
            <View style={styles.dPadMiddle}>
              <TouchableOpacity style={[styles.dPadButton, styles.dPadLeft]} />
              <TouchableOpacity style={[styles.dPadButton, styles.dPadRight]} />
            </View>
            <TouchableOpacity style={[styles.dPadButton, styles.dPadDown]} />
          </View>
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity style={[styles.actionButton, styles.buttonA]}>
            <Text style={styles.buttonLabel}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.buttonB]}>
            <Text style={styles.buttonLabel}>B</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>SELECT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.selectButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Avatar Component
  const Avatar = () => {
    const getAvatarEmoji = () => {
      if (playerStats.evolutionStage >= 4) return '🥇'; // Champion
      if (playerStats.evolutionStage >= 3) return '💪'; // Strong
      if (playerStats.evolutionStage >= 2) return '🏃'; // Fit
      if (playerStats.evolutionStage >= 1) return '🚶'; // Active
      return '😴'; // Beginner
    };

    const getAvatarMessage = () => {
      if (playerStats.health >= 90) return "I'm feeling amazing!";
      if (playerStats.health >= 70) return "Ready for action!";
      if (playerStats.health >= 50) return "Let's get moving...";
      return "I need some help...";
    };

    return (
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarSprite}>{getAvatarEmoji()}</Text>
        <Text style={styles.avatarName}>Warrior Level {playerStats.level}</Text>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{getAvatarMessage()}</Text>
        </View>
        <View style={styles.avatarGear}>
          {avatarState.gear.map((item, index) => (
            <Text key={index} style={styles.gearItem}>{item === 'headband' ? '🎽' : '🥊'}</Text>
          ))}
        </View>
      </View>
    );
  };

  // Navigation Component
  const BottomNav = () => (
    <View style={styles.navigation}>
      {[
        {key: 'home', icon: '🏠', label: 'Home'},
        {key: 'avatar', icon: '👤', label: 'Avatar'},
        {key: 'workout', icon: '💪', label: 'Train'},
        {key: 'nutrition', icon: '🍎', label: 'Feed'},
        {key: 'battle', icon: '⚔️', label: 'Battle'},
        {key: 'stats', icon: '📊', label: 'Stats'},
      ].map(({key, icon, label}) => (
        <TouchableOpacity
          key={key}
          style={[styles.navButton, currentScreen === key && styles.navButtonActive]}
          onPress={() => setCurrentScreen(key)}
        >
          <Text style={styles.navIcon}>{icon}</Text>
          <Text style={styles.navLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Stats Component
  const StatBar = ({current, max, color, label}) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
      <View style={styles.statBarContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statBarBackground}>
          <View style={[styles.statBarFill, {width: `${percentage}%`, backgroundColor: color}]} />
        </View>
        <Text style={styles.statText}>{current}/{max}</Text>
      </View>
    );
  };

  // Action Handlers
  const logWorkout = (type) => {
    setPlayerStats(prev => ({
      ...prev,
      xp: prev.xp + 25,
      strength: Math.min(prev.strength + 2, 100),
      endurance: Math.min(prev.endurance + 2, 100),
      health: Math.min(prev.health + 1, 100),
    }));
    setDailyActions(prev => ({...prev, workoutLogged: true}));
    setAvatarState(prev => ({...prev, mood: 'excited'}));
  };

  const logMeal = (type) => {
    const healthBoost = type === 'healthy' ? 3 : -1;
    const focusBoost = type === 'healthy' ? 2 : -1;
    
    setPlayerStats(prev => ({
      ...prev,
      xp: prev.xp + (type === 'healthy' ? 15 : 5),
      health: Math.max(Math.min(prev.health + healthBoost, 100), 0),
      focus: Math.max(Math.min(prev.focus + focusBoost, 100), 0),
    }));
    setDailyActions(prev => ({...prev, mealLogged: true}));
  };

  const startBossBattle = () => {
    setInBattle(true);
    setCurrentScreen('battle');
  };

  // Screen Components
  const HomeScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Avatar />
      
      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <StatBar current={playerStats.xp} max={playerStats.xpToNext} color="#FFD700" label="XP" />
        <StatBar current={playerStats.health} max={100} color="#FF4444" label="HP" />
      </View>

      {/* Daily Progress */}
      <View style={styles.dailyProgress}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.progressItems}>
          <Text style={[styles.progressItem, dailyActions.workoutLogged && styles.completed]}>
            🏋️ Workout {dailyActions.workoutLogged ? '✅' : '⏰'}
          </Text>
          <Text style={[styles.progressItem, dailyActions.mealLogged && styles.completed]}>
            🍎 Nutrition {dailyActions.mealLogged ? '✅' : '⏰'}
          </Text>
        </View>
      </View>

      {/* Boss Alert */}
      {bossAvailable && (
        <TouchableOpacity style={styles.bossAlert} onPress={startBossBattle}>
          <Text style={styles.bossAlertText}>⚔️ BOSS AVAILABLE!</Text>
          <Text style={styles.bossAlertSubtext}>Level {playerStats.level} Challenge</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const WorkoutScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>💪 Training Ground</Text>
      
      <View style={styles.actionGrid}>
        {[
          {type: 'cardio', name: '🏃 Cardio', desc: '+2 Endurance, +1 Health'},
          {type: 'strength', name: '🏋️ Strength', desc: '+3 Strength, +1 Health'},
          {type: 'yoga', name: '🧘 Yoga', desc: '+2 Focus, +1 Health'},
          {type: 'sports', name: '⚽ Sports', desc: '+1 All Stats'},
        ].map(workout => (
          <TouchableOpacity 
            key={workout.type}
            style={styles.actionCard}
            onPress={() => logWorkout(workout.type)}
          >
            <Text style={styles.actionTitle}>{workout.name}</Text>
            <Text style={styles.actionDesc}>{workout.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const NutritionScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>🍎 Nutrition Log</Text>
      
      <View style={styles.actionGrid}>
        {[
          {type: 'healthy', name: '🥗 Healthy Meal', desc: '+3 Health, +2 Focus'},
          {type: 'protein', name: '🍗 Protein', desc: '+2 Strength, +1 Health'},
          {type: 'junk', name: '🍕 Junk Food', desc: '-1 Health, -1 Focus'},
          {type: 'hydration', name: '💧 Water', desc: '+1 All Stats'},
        ].map(meal => (
          <TouchableOpacity 
            key={meal.type}
            style={[styles.actionCard, meal.type === 'junk' && styles.negativeAction]}
            onPress={() => logMeal(meal.type)}
          >
            <Text style={styles.actionTitle}>{meal.name}</Text>
            <Text style={styles.actionDesc}>{meal.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const BattleScreen = () => {
    const [battlePhase, setBattlePhase] = useState('prep');
    const [battleResult, setBattleResult] = useState(null);

    const executeBattle = () => {
      setBattlePhase('fighting');
      
      // Battle logic based on stats
      const totalStats = playerStats.strength + playerStats.endurance + playerStats.focus + playerStats.health;
      const requiredStats = playerStats.level * 50; // Dynamic difficulty
      
      setTimeout(() => {
        const won = totalStats >= requiredStats;
        setBattleResult(won ? 'win' : 'lose');
        setBattlePhase('result');
        
        if (won) {
          setPlayerStats(prev => ({
            ...prev,
            xp: prev.xp + 100,
            level: prev.level + 1,
            evolutionStage: Math.min(prev.evolutionStage + 1, 5),
          }));
        }
      }, 3000);
    };

    if (battlePhase === 'prep') {
      return (
        <View style={styles.screenContent}>
          <Text style={styles.screenTitle}>⚔️ Boss Battle</Text>
          <View style={styles.bossCard}>
            <Text style={styles.bossSprite}>👹</Text>
            <Text style={styles.bossName}>Junk Food Demon</Text>
            <Text style={styles.bossLevel}>Level {playerStats.level}</Text>
          </View>
          
          <View style={styles.battleStats}>
            <Text style={styles.battleStatsTitle}>Your Combat Power:</Text>
            <Text style={styles.combatPower}>
              {playerStats.strength + playerStats.endurance + playerStats.focus + playerStats.health}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.battleButton} onPress={executeBattle}>
            <Text style={styles.battleButtonText}>⚔️ START BATTLE!</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (battlePhase === 'fighting') {
      return (
        <View style={styles.screenContent}>
          <Text style={styles.battleAnimation}>⚔️ BATTLE IN PROGRESS! ⚔️</Text>
          <Text style={styles.battleText}>Your fighter is battling...</Text>
        </View>
      );
    }

    return (
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>
          {battleResult === 'win' ? '🏆 VICTORY!' : '💀 DEFEAT!'}
        </Text>
        <Text style={styles.battleResultText}>
          {battleResult === 'win' 
            ? 'Your healthy habits paid off! +100 XP, Level Up!'
            : 'You need more training! Keep logging workouts and meals.'}
        </Text>
        <TouchableOpacity 
          style={styles.battleButton} 
          onPress={() => {
            setCurrentScreen('home');
            setInBattle(false);
            setBattlePhase('prep');
            setBattleResult(null);
          }}
        >
          <Text style={styles.battleButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const StatsScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>📊 Character Stats</Text>
      
      <View style={styles.statsPanel}>
        <StatBar current={playerStats.focus} max={100} color="#9D4EDD" label="🧠 Focus" />
        <StatBar current={playerStats.strength} max={100} color="#FF6B6B" label="💪 Strength" />
        <StatBar current={playerStats.endurance} max={100} color="#4ECDC4" label="🏃 Endurance" />
        <StatBar current={playerStats.health} max={100} color="#45B7D1" label="❤️ Health" />
      </View>

      <View style={styles.achievementPanel}>
        <Text style={styles.sectionTitle}>🏆 Evolution Stage</Text>
        <Text style={styles.evolutionText}>Stage {playerStats.evolutionStage}/5</Text>
        <Text style={styles.streakText}>🔥 {playerStats.streak} Day Streak</Text>
      </View>
    </ScrollView>
  );

  const AvatarScreen = () => (
    <ScrollView style={styles.screenContent}>
      <Text style={styles.screenTitle}>👤 Your Fighter</Text>
      <Avatar />
      
      <View style={styles.evolutionInfo}>
        <Text style={styles.sectionTitle}>Evolution Progress</Text>
        <Text style={styles.evolutionDescription}>
          {playerStats.evolutionStage === 0 && "Beginner Fighter - Just starting your journey!"}
          {playerStats.evolutionStage === 1 && "Active Fighter - Building good habits!"}
          {playerStats.evolutionStage === 2 && "Fit Fighter - Looking strong and healthy!"}
          {playerStats.evolutionStage === 3 && "Strong Fighter - Impressive dedication!"}
          {playerStats.evolutionStage === 4 && "Elite Fighter - Nearly at peak performance!"}
          {playerStats.evolutionStage === 5 && "Champion Fighter - Maximum evolution achieved!"}
        </Text>
      </View>
    </ScrollView>
  );

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'avatar': return <AvatarScreen />;
      case 'workout': return <WorkoutScreen />;
      case 'nutrition': return <NutritionScreen />;
      case 'battle': return <BattleScreen />;
      case 'stats': return <StatsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <GameBoyShell>
        {renderCurrentScreen()}
        <BottomNav />
      </GameBoyShell>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  
  // GameBoy Shell Styles
  gameBoyShell: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerGrill: {
    flexDirection: 'row',
    gap: 3,
  },
  speakerHole: {
    width: 4,
    height: 4,
    backgroundColor: '#1d4ed8',
    borderRadius: 2,
  },
  screenArea: {
    backgroundColor: '#2d1b69',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    position: 'relative',
  },
  gameBoyLabel: {
    color: '#c084fc',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  screenFrame: {
    backgroundColor: '#1e1b4b',
    borderRadius: 10,
    padding: 8,
    minHeight: height * 0.65,
  },
  screen: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    flex: 1,
    position: 'relative',
  },
  powerLED: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  controlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  leftControls: {
    alignItems: 'center',
  },
  dPad: {
    width: 80,
    height: 80,
    alignItems: 'center',
  },
  dPadButton: {
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  dPadUp: {
    width: 25,
    height: 25,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dPadDown: {
    width: 25,
    height: 25,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  dPadMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dPadLeft: {
    width: 25,
    height: 25,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  dPadRight: {
    width: 25,
    height: 25,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  rightControls: {
    flexDirection: 'column',
    gap: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1d4ed8',
    borderWidth: 3,
    borderColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonA: {
    alignSelf: 'flex-end',
  },
  buttonB: {
    alignSelf: 'flex-start',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  selectButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  startButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Screen Content Styles
  screenContent: {
    flex: 1,
    padding: 10,
  },
  screenTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'monospace',
  },

  // Avatar Styles
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  avatarSprite: {
    fontSize: 60,
    marginBottom: 10,
  },
  avatarName: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  speechBubble: {
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  speechText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  avatarGear: {
    flexDirection: 'row',
    gap: 5,
  },
  gearItem: {
    fontSize: 20,
  },

  // Navigation Styles
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 2,
    borderTopColor: '#475569',
    paddingVertical: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    backgroundColor: '#374151',
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
  },

  // Stats Styles
  quickStats: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  statsPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    width: 80,
    fontWeight: 'bold',
  },
  statBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: '#374151',
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  statText: {
    color: '#9ca3af',
    fontSize: 10,
    width: 40,
    textAlign: 'right',
  },

  // Daily Progress Styles
  dailyProgress: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressItems: {
    gap: 5,
  },
  progressItem: {
    color: '#9ca3af',
    fontSize: 12,
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 5,
  },
  completed: {
    color: '#10b981',
    backgroundColor: '#064e3b',
  },

  // Boss Alert Styles
  bossAlert: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  bossAlertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bossAlertSubtext: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 5,
  },

  // Action Grid Styles
  actionGrid: {
    gap: 10,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#475569',
  },
  negativeAction: {
    borderColor: '#dc2626',
    backgroundColor: '#7f1d1d',
  },
  actionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },

  // Battle Styles
  bossCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  bossSprite: {
    fontSize: 80,
    marginBottom: 10,
  },
  bossName: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bossLevel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  battleStats: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  battleStatsTitle: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 10,
  },
  combatPower: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  battleButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  battleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  battleAnimation: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
  battleText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  battleResultText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  // Evolution Styles
  achievementPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#475569',
  },
  evolutionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  streakText: {
    color: '#10b981',
    fontSize: 14,
  },
  evolutionInfo: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  evolutionDescription: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default App;
