import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameBoyFrame = React.memo(({ children }) => {
  return (
    <View style={styles.gameBoyFrame}>
      {/* Screen area */}
      <View style={styles.screen}>
        {children}
      </View>
      
      {/* GameBoy control buttons */}
      <View style={styles.gameBoyControls}>
        <View style={styles.dPad}>
          <View style={styles.dPadCenter} />
        </View>
        <View style={styles.actionButtonsGroup}>
          <View style={styles.gameBoyButton} />
          <View style={styles.gameBoyButton} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  gameBoyFrame: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.85,
    backgroundColor: '#C4CFA1',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    borderRadius: 10,
    padding: 15,
    borderWidth: 3,
    borderColor: '#556B2F',
  },
  gameBoyControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  dPad: {
    width: 80,
    height: 80,
    backgroundColor: '#0F380F',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadCenter: {
    width: 30,
    height: 30,
    backgroundColor: '#556B2F',
    borderRadius: 15,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  gameBoyButton: {
    width: 40,
    height: 40,
    backgroundColor: '#0F380F',
    borderRadius: 20,
  },
});

export default GameBoyFrame;