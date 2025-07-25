/**
 * Leaderboard Button Component
 * Quick access to view leaderboards from home screen
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { pixelFont } from '../hooks/useFonts';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  blue: '#3498db',
};

const LeaderboardButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🏆</Text>
        <Text style={[styles.text, pixelFont]}>LEADERBOARD</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.blue,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  icon: {
    fontSize: 20,
  },

  text: {
    fontSize: 14,
    color: COLORS.blue,
    letterSpacing: 1,
  },
});

export default LeaderboardButton;