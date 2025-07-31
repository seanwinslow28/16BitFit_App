/**
 * Game Input Controller
 * Provides touch controls for the Phaser 3 fighting game
 * Optimized for <50ms input latency
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Vibration,
  Platform
} from 'react-native';
import { Haptics } from 'expo-haptics';

const GameInputController = ({ onInput, disabled = false }) => {
  const inputBuffer = useRef([]);
  const lastInputTime = useRef(0);
  
  // Optimized input handler with haptic feedback
  const sendInput = useCallback((action, options = {}) => {
    if (disabled) return;
    
    const now = performance.now();
    const timeSinceLastInput = now - lastInputTime.current;
    
    // Prevent input spam (minimum 16ms between inputs)
    if (timeSinceLastInput < 16 && !options.force) return;
    
    // Add to input buffer for combo detection
    inputBuffer.current.push({
      action,
      timestamp: now
    });
    
    // Keep buffer size manageable
    if (inputBuffer.current.length > 20) {
      inputBuffer.current.shift();
    }
    
    // Haptic feedback
    if (options.haptic !== false) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(
          options.heavy ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
        );
      } else {
        Vibration.vibrate(options.heavy ? 20 : 10);
      }
    }
    
    // Send input
    onInput({
      action,
      timestamp: now,
      buffer: inputBuffer.current.slice(-5) // Last 5 inputs for combo detection
    });
    
    lastInputTime.current = now;
  }, [onInput, disabled]);

  // D-Pad handlers
  const handleDPadPress = useCallback((direction) => {
    sendInput(`MOVE_${direction}`);
  }, [sendInput]);

  const handleDPadRelease = useCallback(() => {
    sendInput('MOVE_STOP', { haptic: false });
  }, [sendInput]);

  // Action button handlers
  const handlePunch = useCallback((strength) => {
    sendInput(`PUNCH_${strength}`, { heavy: strength === 'HEAVY' });
  }, [sendInput]);

  const handleKick = useCallback((strength) => {
    sendInput(`KICK_${strength}`, { heavy: strength === 'HEAVY' });
  }, [sendInput]);

  const handleSpecial = useCallback(() => {
    sendInput('SPECIAL', { heavy: true });
  }, [sendInput]);

  const handleBlock = useCallback((isPressed) => {
    sendInput(isPressed ? 'BLOCK' : 'BLOCK_RELEASE', { haptic: isPressed });
  }, [sendInput]);

  const handleJump = useCallback(() => {
    sendInput('JUMP');
  }, [sendInput]);

  return (
    <View style={styles.container} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Left side - D-Pad */}
      <View style={styles.leftControls}>
        <View style={styles.dpad}>
          <TouchableOpacity
            style={[styles.dpadButton, styles.dpadUp]}
            onPressIn={() => handleDPadPress('UP')}
            onPressOut={handleDPadRelease}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>↑</Text>
          </TouchableOpacity>
          
          <View style={styles.dpadMiddle}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadLeft]}
              onPressIn={() => handleDPadPress('LEFT')}
              onPressOut={handleDPadRelease}
              activeOpacity={0.7}
            >
              <Text style={styles.dpadText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.dpadCenter} />
            
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadRight]}
              onPressIn={() => handleDPadPress('RIGHT')}
              onPressOut={handleDPadRelease}
              activeOpacity={0.7}
            >
              <Text style={styles.dpadText}>→</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.dpadButton, styles.dpadDown]}
            onPressIn={() => handleDPadPress('DOWN')}
            onPressOut={handleDPadRelease}
            activeOpacity={0.7}
          >
            <Text style={styles.dpadText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View style={styles.rightControls}>
        {/* Top row - Punches */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.lightButton]}
            onPress={() => handlePunch('LIGHT')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>LP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.mediumButton]}
            onPress={() => handlePunch('MEDIUM')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>MP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.heavyButton]}
            onPress={() => handlePunch('HEAVY')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>HP</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row - Kicks */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.lightButton]}
            onPress={() => handleKick('LIGHT')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>LK</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.mediumButton]}
            onPress={() => handleKick('MEDIUM')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>MK</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.heavyButton]}
            onPress={() => handleKick('HEAVY')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>HK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center buttons */}
      <View style={styles.centerControls}>
        <TouchableOpacity
          style={[styles.utilityButton, styles.blockButton]}
          onPressIn={() => handleBlock(true)}
          onPressOut={() => handleBlock(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.utilityText}>BLOCK</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.utilityButton, styles.specialButton]}
          onPress={handleSpecial}
          activeOpacity={0.7}
        >
          <Text style={styles.utilityText}>SPECIAL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  leftControls: {
    flex: 1,
    alignItems: 'flex-start'
  },
  rightControls: {
    flex: 1,
    alignItems: 'flex-end'
  },
  centerControls: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    gap: 10
  },
  
  // D-Pad styles
  dpad: {
    width: 120,
    height: 120,
    position: 'relative'
  },
  dpadButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dpadUp: {
    top: 0,
    left: 40,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  dpadDown: {
    bottom: 0,
    left: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  dpadLeft: {
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  dpadRight: {
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  dpadMiddle: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row'
  },
  dpadCenter: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  dpadText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  
  // Action button styles
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  lightButton: {
    backgroundColor: 'rgba(100, 200, 100, 0.3)',
    borderColor: 'rgba(100, 200, 100, 0.8)'
  },
  mediumButton: {
    backgroundColor: 'rgba(200, 200, 100, 0.3)',
    borderColor: 'rgba(200, 200, 100, 0.8)'
  },
  heavyButton: {
    backgroundColor: 'rgba(200, 100, 100, 0.3)',
    borderColor: 'rgba(200, 100, 100, 0.8)'
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  
  // Utility button styles
  utilityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2
  },
  blockButton: {
    backgroundColor: 'rgba(100, 100, 200, 0.3)',
    borderColor: 'rgba(100, 100, 200, 0.8)'
  },
  specialButton: {
    backgroundColor: 'rgba(200, 100, 200, 0.3)',
    borderColor: 'rgba(200, 100, 200, 0.8)'
  },
  utilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default GameInputController;