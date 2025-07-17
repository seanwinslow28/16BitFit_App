// CursorTestSquare.js - Blue square with "Cursor Test" text (simulating Figma design)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CursorTestSquare = ({ size = 150, backgroundColor = '#2563eb' }) => {
  return (
    <View style={[styles.square, { width: size, height: size, backgroundColor }]}>
      <Text style={styles.text}>Cursor Test</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1d4ed8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CursorTestSquare; 