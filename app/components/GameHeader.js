/**
 * Game Header Component - Top navigation bar with retro styling
 * Displays app logo and potentially navigation elements
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../constants/DesignSystem';

const GameHeader = ({ 
  title = "16BIT FIT",
  showMenu = false,
  onMenuPress = () => {},
  fontFamily = 'monospace',
}) => {
  return (
    <View style={styles.container}>
      {/* Menu button (if needed) */}
      {showMenu && (
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Text style={[styles.menuIcon, { fontFamily }]}>☰</Text>
        </TouchableOpacity>
      )}

      {/* App logo/title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.logoText, { fontFamily }]}>
          {title}
        </Text>
      </View>

      {/* Right side spacer for balance */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  menuIcon: {
    ...Typography.titleMedium,
    fontSize: 18,
    color: Colors.primary.logoYellow,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  logoText: {
    ...Typography.titleLarge,
    fontSize: 20,
    color: Colors.primary.logoYellow,
    letterSpacing: 3,
    textShadowColor: '#5a7829',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  spacer: {
    width: 40,
  },
});

export default GameHeader;