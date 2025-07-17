/**
 * Device Frame Component - GameBoy-Inspired Device Shell
 * Creates authentic handheld gaming device appearance around the app
 */

import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Colors } from '../constants/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DeviceFrame = ({ children }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Device Frame */}
      <View style={styles.deviceFrame}>
        {/* App Shell */}
        <View style={styles.appShell}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  deviceFrame: {
    width: Math.min(screenWidth - 20, 410),
    height: Math.min(screenHeight - 40, 892),
    backgroundColor: '#0a0a0a',
    borderRadius: 40,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 30,
  },
  
  appShell: {
    flex: 1,
    backgroundColor: '#050505',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
  },
});

export default DeviceFrame;