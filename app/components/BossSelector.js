/**
 * Boss Selector Component
 * Grid of available bosses with GameBoy styling
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Damage color
  blue: '#3498db',         // Special move color
  gray: '#666666',         // Locked boss
};

const BossSelector = ({
  bosses = [],
  playerLevel = 1,
  onSelectBoss,
  style,
}) => {
  const scaleAnims = useRef({}).current;
  
  // Initialize animations for each boss
  bosses.forEach(boss => {
    if (!scaleAnims[boss.id]) {
      scaleAnims[boss.id] = new Animated.Value(1);
    }
  });

  const handleBossPress = (boss) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the selected boss card
    Animated.sequence([
      Animated.timing(scaleAnims[boss.id], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[boss.id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onSelectBoss) {
        onSelectBoss(boss);
      }
    });
  };

  const getDifficultyColor = (bossLevel) => {
    const levelDiff = bossLevel - playerLevel;
    if (levelDiff <= 0) return COLORS.primary;
    if (levelDiff <= 5) return COLORS.yellow;
    return COLORS.red;
  };

  const getDifficultyText = (bossLevel) => {
    const levelDiff = bossLevel - playerLevel;
    if (levelDiff <= -5) return 'EASY';
    if (levelDiff <= 0) return 'NORMAL';
    if (levelDiff <= 5) return 'HARD';
    return 'EXTREME';
  };

  const renderBossCard = (boss) => {
    const difficultyColor = getDifficultyColor(boss.level);
    const difficultyText = getDifficultyText(boss.level);
    const isLocked = playerLevel < boss.level;
    
    return (
      <Animated.View
        key={boss.id}
        style={[
          styles.bossCardWrapper,
          {
            transform: [{ scale: scaleAnims[boss.id] }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bossCard,
            isLocked && styles.bossCardLocked,
            { borderColor: isLocked ? COLORS.gray : difficultyColor }
          ]}
          onPress={() => !isLocked && handleBossPress(boss)}
          disabled={isLocked}
          activeOpacity={0.8}
        >
          {/* Boss Sprite */}
          <View style={styles.bossSprite}>
            <Text style={styles.bossSpriteText}>
              {isLocked ? '🔒' : boss.sprite}
            </Text>
          </View>
          
          {/* Boss Info */}
          <View style={styles.bossInfo}>
            <Text style={[
              styles.bossName, 
              pixelFont,
              isLocked && styles.lockedText
            ]}>
              {boss.name}
            </Text>
            
            <View style={styles.bossLevel}>
              <Text style={[styles.levelText, pixelFont]}>
                LV.{boss.level}
              </Text>
              <Text style={[
                styles.difficultyText, 
                pixelFont,
                { color: isLocked ? COLORS.gray : difficultyColor }
              ]}>
                {difficultyText}
              </Text>
            </View>
            
            <Text style={[
              styles.bossDescription,
              pixelFont,
              isLocked && styles.lockedText
            ]}>
              {isLocked ? 'Reach level ' + boss.level : boss.description}
            </Text>
          </View>
          
          {/* Special Move Badge */}
          {!isLocked && (
            <View style={[styles.specialMoveBadge, { backgroundColor: difficultyColor }]}>
              <Text style={[styles.specialMoveText, pixelFont]}>
                {boss.specialMove}
              </Text>
            </View>
          )}
          
          {/* Weakness Indicator */}
          {!isLocked && (
            <View style={styles.weaknessContainer}>
              <Text style={[styles.weaknessLabel, pixelFont]}>WEAK TO:</Text>
              <Text style={[styles.weaknessText, pixelFont]}>
                {boss.weakness.toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Lock Overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={[styles.lockText, pixelFont]}>
                LOCKED
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.bossGrid}>
        {bosses.map(renderBossCard)}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendTitle, pixelFont]}>DIFFICULTY LEVELS</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.legendText, pixelFont]}>EASY/NORMAL</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.yellow }]} />
            <Text style={[styles.legendText, pixelFont]}>HARD</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
            <Text style={[styles.legendText, pixelFont]}>EXTREME</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  bossGrid: {
    gap: 16,
  },

  bossCardWrapper: {
    marginBottom: 8,
  },

  bossCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 4,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  bossCardLocked: {
    opacity: 0.6,
  },

  bossSprite: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bossSpriteText: {
    fontSize: 48,
  },

  bossInfo: {
    flex: 1,
    marginRight: 60,
  },

  bossName: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  bossLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },

  levelText: {
    fontSize: 12,
    color: COLORS.yellow,
  },

  difficultyText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },

  bossDescription: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  lockedText: {
    color: COLORS.gray,
  },

  specialMoveBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  specialMoveText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  weaknessContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },

  weaknessLabel: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  weaknessText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockText: {
    fontSize: 24,
    color: COLORS.gray,
    letterSpacing: 3,
  },

  legend: {
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
  },

  legendTitle: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  legendText: {
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.5,
  },
});

export default BossSelector;