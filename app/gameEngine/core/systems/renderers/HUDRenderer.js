/**
 * HUD Renderer Component
 * Handles rendering of UI elements like health bars, timers, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HUDRenderer = (entity) => {
  if (!entity || entity.type !== 'hud') return null;

  const {
    hudType = 'healthBar',
    position = { x: 0, y: 0 },
    data = {},
  } = entity;

  switch (hudType) {
    case 'healthBar':
      return renderHealthBar(position, data);
    case 'timer':
      return renderTimer(position, data);
    case 'combo':
      return renderComboCounter(position, data);
    case 'score':
      return renderScore(position, data);
    default:
      return null;
  }
};

function renderHealthBar(position, data) {
  const {
    health = 100,
    maxHealth = 100,
    width = 200,
    height = 20,
    isPlayer = true,
    color = isPlayer ? '#00FF00' : '#FF0000',
  } = data;

  const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const healthBarColor = healthPercentage > 50 ? color : 
                         healthPercentage > 25 ? '#FFFF00' : '#FF0000';

  return (
    <View
      style={[
        styles.healthBar,
        {
          left: position.x,
          top: position.y,
          width,
          height,
        },
      ]}
    >
      <View style={[styles.healthBarBg, { width, height }]} />
      <View
        style={[
          styles.healthBarFill,
          {
            width: (width - 4) * (healthPercentage / 100),
            height: height - 4,
            backgroundColor: healthBarColor,
          },
        ]}
      />
      <Text style={styles.healthText}>
        {Math.floor(health)}/{maxHealth}
      </Text>
    </View>
  );
}

function renderTimer(position, data) {
  const {
    time = 99,
    fontSize = 24,
    color = '#FFFFFF',
  } = data;

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View
      style={[
        styles.timer,
        {
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <Text
        style={[
          styles.timerText,
          {
            fontSize,
            color,
          },
        ]}
      >
        {timeString}
      </Text>
    </View>
  );
}

function renderComboCounter(position, data) {
  const {
    hits = 0,
    damage = 0,
    fontSize = 20,
  } = data;

  if (hits < 2) return null;

  return (
    <View
      style={[
        styles.combo,
        {
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <Text style={[styles.comboHits, { fontSize: fontSize * 1.2 }]}>
        {hits} HITS!
      </Text>
      <Text style={[styles.comboDamage, { fontSize }]}>
        {damage} DMG
      </Text>
    </View>
  );
}

function renderScore(position, data) {
  const {
    score = 0,
    label = 'SCORE',
    fontSize = 16,
    color = '#FFFFFF',
  } = data;

  return (
    <View
      style={[
        styles.score,
        {
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <Text style={[styles.scoreLabel, { fontSize: fontSize * 0.8, color }]}>
        {label}
      </Text>
      <Text style={[styles.scoreValue, { fontSize, color }]}>
        {score.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  healthBar: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 2,
  },
  healthBarBg: {
    position: 'absolute',
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  healthBarFill: {
    position: 'absolute',
    borderRadius: 2,
    top: 2,
    left: 2,
  },
  healthText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timer: {
    position: 'absolute',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
  },
  timerText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  combo: {
    position: 'absolute',
    alignItems: 'center',
  },
  comboHits: {
    color: '#FFD700',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  comboDamage: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  score: {
    position: 'absolute',
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  scoreValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});