/**
 * Battle Controls Component
 * Touch-friendly combat controls with GameBoy styling
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  red: '#E53935',          // Attack color
  blue: '#3498db',         // Special move color
  purple: '#9b59b6',       // Ultimate move
};

const BattleControls = ({
  onMove,
  onAttack,
  onDefend,
  onSpecial,
  specialMeterFull = false,
  disabled = false,
  style,
}) => {
  const [activeButton, setActiveButton] = useState(null);
  
  // Animation values for each button
  const buttonAnims = {
    left: useRef(new Animated.Value(1)).current,
    right: useRef(new Animated.Value(1)).current,
    punch: useRef(new Animated.Value(1)).current,
    kick: useRef(new Animated.Value(1)).current,
    block: useRef(new Animated.Value(1)).current,
    special: useRef(new Animated.Value(1)).current,
  };

  const handleButtonPress = (button, action) => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveButton(button);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonAnims[button], {
        toValue: 0.85,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnims[button], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Execute action
    if (action) action();
  };

  const handleButtonRelease = () => {
    setActiveButton(null);
  };

  const renderDPad = () => (
    <View style={styles.dPadContainer}>
      <View style={styles.dPadCross}>
        {/* Left Button */}
        <Animated.View
          style={[
            styles.dPadButtonWrapper,
            styles.dPadLeft,
            { transform: [{ scale: buttonAnims.left }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.dPadButton, activeButton === 'left' && styles.buttonActive]}
            onPressIn={() => handleButtonPress('left', () => onMove && onMove('left'))}
            onPressOut={handleButtonRelease}
            disabled={disabled}
          >
            <Text style={styles.dPadArrow}>◄</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Right Button */}
        <Animated.View
          style={[
            styles.dPadButtonWrapper,
            styles.dPadRight,
            { transform: [{ scale: buttonAnims.right }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.dPadButton, activeButton === 'right' && styles.buttonActive]}
            onPressIn={() => handleButtonPress('right', () => onMove && onMove('right'))}
            onPressOut={handleButtonRelease}
            disabled={disabled}
          >
            <Text style={styles.dPadArrow}>►</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Center piece */}
        <View style={styles.dPadCenter} />
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {/* Main attack buttons */}
      <View style={styles.mainButtons}>
        {/* Punch Button */}
        <Animated.View
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: buttonAnims.punch }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.punchButton,
              activeButton === 'punch' && styles.buttonActive,
            ]}
            onPress={() => handleButtonPress('punch', () => onAttack && onAttack('punch'))}
            disabled={disabled}
          >
            <Text style={[styles.buttonLabel, pixelFont]}>PUNCH</Text>
            <Text style={styles.buttonIcon}>👊</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Kick Button */}
        <Animated.View
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: buttonAnims.kick }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.kickButton,
              activeButton === 'kick' && styles.buttonActive,
            ]}
            onPress={() => handleButtonPress('kick', () => onAttack && onAttack('kick'))}
            disabled={disabled}
          >
            <Text style={[styles.buttonLabel, pixelFont]}>KICK</Text>
            <Text style={styles.buttonIcon}>🦵</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Secondary buttons */}
      <View style={styles.secondaryButtons}>
        {/* Block Button */}
        <Animated.View
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: buttonAnims.block }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.blockButton,
              activeButton === 'block' && styles.buttonActive,
            ]}
            onPressIn={() => handleButtonPress('block', () => onDefend && onDefend())}
            onPressOut={handleButtonRelease}
            disabled={disabled}
          >
            <Text style={[styles.buttonLabel, pixelFont]}>BLOCK</Text>
            <Text style={styles.buttonIcon}>🛡️</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Special Button */}
        <Animated.View
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: buttonAnims.special }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.specialButton,
              !specialMeterFull && styles.buttonDisabled,
              activeButton === 'special' && styles.buttonActive,
            ]}
            onPress={() => specialMeterFull && handleButtonPress('special', () => onSpecial && onSpecial())}
            disabled={disabled || !specialMeterFull}
          >
            <Text style={[styles.buttonLabel, pixelFont]}>SPECIAL</Text>
            <Text style={styles.buttonIcon}>⚡</Text>
            {specialMeterFull && (
              <View style={styles.readyIndicator}>
                <Text style={[styles.readyText, pixelFont]}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  const renderComboHints = () => (
    <View style={styles.comboHints}>
      <Text style={[styles.comboTitle, pixelFont]}>COMBOS</Text>
      <View style={styles.comboList}>
        <Text style={[styles.comboItem, pixelFont]}>↓↘→ + PUNCH = HADOUKEN</Text>
        <Text style={[styles.comboItem, pixelFont]}>→↓↘ + KICK = HURRICANE</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.controlsLayout}>
        {/* Left side - Movement */}
        <View style={styles.leftControls}>
          {renderDPad()}
        </View>
        
        {/* Right side - Actions */}
        <View style={styles.rightControls}>
          {renderActionButtons()}
        </View>
      </View>
      
      {/* Combo hints at bottom */}
      {renderComboHints()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 3,
    borderTopColor: COLORS.dark,
  },

  controlsLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  leftControls: {
    flex: 1,
    alignItems: 'flex-start',
  },

  rightControls: {
    flex: 1,
    alignItems: 'flex-end',
  },

  // D-Pad styles
  dPadContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dPadCross: {
    width: 120,
    height: 120,
    position: 'relative',
  },

  dPadButtonWrapper: {
    position: 'absolute',
  },

  dPadButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.dark,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dPadLeft: {
    left: 0,
    top: 40,
  },

  dPadRight: {
    right: 0,
    top: 40,
  },

  dPadCenter: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: COLORS.dark,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 15,
    left: 45,
    top: 45,
  },

  dPadArrow: {
    fontSize: 20,
    color: COLORS.primary,
  },

  // Action button styles
  actionButtonsContainer: {
    gap: 10,
  },

  mainButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  secondaryButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  actionButtonWrapper: {
    // Wrapper for animation
  },

  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dark,
  },

  punchButton: {
    borderColor: COLORS.red,
  },

  kickButton: {
    borderColor: COLORS.yellow,
  },

  blockButton: {
    borderColor: COLORS.blue,
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  specialButton: {
    borderColor: COLORS.purple,
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  buttonActive: {
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonLabel: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  buttonIcon: {
    fontSize: 20,
  },

  readyIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: COLORS.yellow,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  readyText: {
    fontSize: 12,
    color: COLORS.dark,
  },

  // Combo hints
  comboHints: {
    marginTop: 10,
    paddingHorizontal: 20,
  },

  comboTitle: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  comboList: {
    flexDirection: 'row',
    gap: 20,
  },

  comboItem: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
});

export default BattleControls;