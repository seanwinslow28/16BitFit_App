/**
 * Touch Controls Component for 16BitFit
 * Optimized for mobile fighting game input with combo support
 * Handles swipes, taps, and holds for special move execution
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
  Text,
  Vibration,
  Dimensions
} from 'react-native';
import { InputNotation } from '../systems/ComboDetectionSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const TouchControls = ({ onInput, showVisualGuides = true }) => {
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [currentDirection, setCurrentDirection] = useState(InputNotation.NEUTRAL);
  const lastDirectionRef = useRef(InputNotation.NEUTRAL);
  const gestureHistoryRef = useRef([]);
  
  // Virtual joystick for movement
  const joystickPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const direction = getDirectionFromTouch(evt.nativeEvent);
        updateDirection(direction);
      },
      
      onPanResponderMove: (evt) => {
        const direction = getDirectionFromTouch(evt.nativeEvent);
        updateDirection(direction);
      },
      
      onPanResponderRelease: () => {
        updateDirection(InputNotation.NEUTRAL);
      }
    })
  ).current;
  
  // Swipe gesture recognizer for special moves
  const gesturePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        gestureHistoryRef.current = [{
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          time: Date.now()
        }];
      },
      
      onPanResponderMove: (evt) => {
        const history = gestureHistoryRef.current;
        history.push({
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          time: Date.now()
        });
        
        // Keep only last 20 points
        if (history.length > 20) {
          history.shift();
        }
        
        // Detect special move gestures
        detectSpecialGestures();
      },
      
      onPanResponderRelease: () => {
        // Final gesture detection
        detectSpecialGestures();
        gestureHistoryRef.current = [];
      }
    })
  ).current;
  
  const getDirectionFromTouch = (touch) => {
    const centerX = SCREEN_WIDTH * 0.2;
    const centerY = SCREEN_HEIGHT * 0.7;
    const deadZone = 30;
    
    const dx = touch.pageX - centerX;
    const dy = touch.pageY - centerY;
    
    if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) {
      return InputNotation.NEUTRAL;
    }
    
    const angle = Math.atan2(-dy, dx) * 180 / Math.PI;
    
    // Convert angle to 8-way direction
    if (angle >= -22.5 && angle < 22.5) return InputNotation.FORWARD;
    if (angle >= 22.5 && angle < 67.5) return InputNotation.UP_FORWARD;
    if (angle >= 67.5 && angle < 112.5) return InputNotation.UP;
    if (angle >= 112.5 && angle < 157.5) return InputNotation.UP_BACK;
    if (angle >= 157.5 || angle < -157.5) return InputNotation.BACK;
    if (angle >= -157.5 && angle < -112.5) return InputNotation.DOWN_BACK;
    if (angle >= -112.5 && angle < -67.5) return InputNotation.DOWN;
    if (angle >= -67.5 && angle < -22.5) return InputNotation.DOWN_FORWARD;
    
    return InputNotation.NEUTRAL;
  };
  
  const updateDirection = (newDirection) => {
    if (newDirection !== lastDirectionRef.current) {
      // Send input for direction change
      if (lastDirectionRef.current !== InputNotation.NEUTRAL) {
        onInput({
          type: getInputTypeFromDirection(lastDirectionRef.current),
          pressed: false
        });
      }
      
      if (newDirection !== InputNotation.NEUTRAL) {
        onInput({
          type: getInputTypeFromDirection(newDirection),
          pressed: true
        });
      }
      
      lastDirectionRef.current = newDirection;
      setCurrentDirection(newDirection);
    }
  };
  
  const detectSpecialGestures = () => {
    const history = gestureHistoryRef.current;
    if (history.length < 3) return;
    
    // Detect quarter circle forward (QCF)
    if (detectQuarterCircle(history, 'forward')) {
      sendSpecialInput('QCF');
    }
    // Detect quarter circle back (QCB)
    else if (detectQuarterCircle(history, 'back')) {
      sendSpecialInput('QCB');
    }
    // Detect dragon punch (DP)
    else if (detectDragonPunch(history)) {
      sendSpecialInput('DP');
    }
  };
  
  const detectQuarterCircle = (history, direction) => {
    if (history.length < 3) return false;
    
    const start = history[0];
    const mid = history[Math.floor(history.length / 2)];
    const end = history[history.length - 1];
    
    if (direction === 'forward') {
      // Down -> Down-Forward -> Forward
      return start.y > mid.y && mid.x > start.x && end.x > mid.x && Math.abs(end.y - start.y) < 50;
    } else {
      // Down -> Down-Back -> Back
      return start.y > mid.y && mid.x < start.x && end.x < mid.x && Math.abs(end.y - start.y) < 50;
    }
  };
  
  const detectDragonPunch = (history) => {
    if (history.length < 3) return false;
    
    const start = history[0];
    const mid = history[Math.floor(history.length / 2)];
    const end = history[history.length - 1];
    
    // Forward -> Down -> Down-Forward
    return start.x < mid.x && mid.y > start.y && end.x > mid.x && end.y > start.y;
  };
  
  const sendSpecialInput = (gesture) => {
    // Vibrate for feedback
    Vibration.vibrate(50);
    
    // Send the motion inputs
    switch (gesture) {
      case 'QCF':
        onInput({ type: 'down', pressed: true });
        setTimeout(() => {
          onInput({ type: 'down', pressed: false });
          onInput({ type: 'down-forward', pressed: true });
        }, 16);
        setTimeout(() => {
          onInput({ type: 'down-forward', pressed: false });
          onInput({ type: 'forward', pressed: true });
        }, 32);
        setTimeout(() => {
          onInput({ type: 'forward', pressed: false });
        }, 48);
        break;
      // Add other gesture implementations
    }
  };
  
  const handleButtonPress = (button) => {
    setActiveButtons(prev => new Set(prev).add(button));
    Vibration.vibrate(20);
    onInput({ type: button, pressed: true });
  };
  
  const handleButtonRelease = (button) => {
    setActiveButtons(prev => {
      const next = new Set(prev);
      next.delete(button);
      return next;
    });
    onInput({ type: button, pressed: false });
  };
  
  const getInputTypeFromDirection = (direction) => {
    switch (direction) {
      case InputNotation.UP: return 'up';
      case InputNotation.DOWN: return 'down';
      case InputNotation.BACK: return 'left';
      case InputNotation.FORWARD: return 'right';
      case InputNotation.UP_BACK: return 'up-left';
      case InputNotation.UP_FORWARD: return 'up-right';
      case InputNotation.DOWN_BACK: return 'down-left';
      case InputNotation.DOWN_FORWARD: return 'down-right';
      default: return null;
    }
  };
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Virtual Joystick */}
      <View
        style={styles.joystickArea}
        {...joystickPanResponder.panHandlers}
      >
        {showVisualGuides && (
          <View style={styles.joystickGuide}>
            <View style={[
              styles.joystickIndicator,
              currentDirection !== InputNotation.NEUTRAL && styles.joystickActive
            ]} />
          </View>
        )}
      </View>
      
      {/* Gesture Area (middle of screen) */}
      <View
        style={styles.gestureArea}
        {...gesturePanResponder.panHandlers}
      >
        {showVisualGuides && (
          <Text style={styles.gestureHint}>Swipe for special moves</Text>
        )}
      </View>
      
      {/* Attack Buttons */}
      <View style={styles.buttonContainer}>
        {/* Punch Buttons */}
        <View style={styles.punchButtons}>
          <TouchButton
            label="LP"
            onPress={() => handleButtonPress('punch')}
            onRelease={() => handleButtonRelease('punch')}
            active={activeButtons.has('punch')}
            style={styles.lightButton}
          />
          <TouchButton
            label="MP"
            onPress={() => handleButtonPress('punch')}
            onRelease={() => handleButtonRelease('punch')}
            active={activeButtons.has('punch')}
            style={styles.mediumButton}
          />
          <TouchButton
            label="HP"
            onPress={() => handleButtonPress('punch')}
            onRelease={() => handleButtonRelease('punch')}
            active={activeButtons.has('punch')}
            style={styles.heavyButton}
          />
        </View>
        
        {/* Kick Buttons */}
        <View style={styles.kickButtons}>
          <TouchButton
            label="LK"
            onPress={() => handleButtonPress('kick')}
            onRelease={() => handleButtonRelease('kick')}
            active={activeButtons.has('kick')}
            style={styles.lightButton}
          />
          <TouchButton
            label="MK"
            onPress={() => handleButtonPress('kick')}
            onRelease={() => handleButtonRelease('kick')}
            active={activeButtons.has('kick')}
            style={styles.mediumButton}
          />
          <TouchButton
            label="HK"
            onPress={() => handleButtonPress('kick')}
            onRelease={() => handleButtonRelease('kick')}
            active={activeButtons.has('kick')}
            style={styles.heavyButton}
          />
        </View>
      </View>
      
      {/* Special Action Buttons */}
      <View style={styles.specialButtons}>
        <TouchButton
          label="BLOCK"
          onPress={() => handleButtonPress('block')}
          onRelease={() => handleButtonRelease('block')}
          active={activeButtons.has('block')}
          style={styles.blockButton}
        />
        <TouchButton
          label="SUPER"
          onPress={() => handleButtonPress('special')}
          onRelease={() => handleButtonRelease('special')}
          active={activeButtons.has('special')}
          style={styles.superButton}
        />
      </View>
    </View>
  );
};

// Individual button component
const TouchButton = ({ label, onPress, onRelease, active, style }) => {
  return (
    <TouchableOpacity
      onPressIn={onPress}
      onPressOut={onRelease}
      style={[styles.button, style, active && styles.buttonActive]}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100
  },
  
  // Joystick styles
  joystickArea: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  joystickGuide: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  joystickIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  joystickActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.6)'
  },
  
  // Gesture area
  gestureArea: {
    position: 'absolute',
    left: SCREEN_WIDTH * 0.3,
    top: SCREEN_HEIGHT * 0.3,
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gestureHint: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
    textAlign: 'center'
  },
  
  // Button container
  buttonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    alignItems: 'flex-end'
  },
  
  // Button rows
  punchButtons: {
    flexDirection: 'row',
    marginBottom: 10
  },
  kickButtons: {
    flexDirection: 'row'
  },
  
  // Individual buttons
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    borderColor: '#FFD700'
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  
  // Button variations
  lightButton: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  mediumButton: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  heavyButton: {
    width: 70,
    height: 70,
    borderRadius: 35
  },
  
  // Special buttons
  specialButtons: {
    position: 'absolute',
    left: 20,
    top: 50,
    flexDirection: 'row'
  },
  blockButton: {
    backgroundColor: 'rgba(0, 0, 255, 0.3)',
    marginRight: 10
  },
  superButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    width: 80,
    height: 80,
    borderRadius: 40
  }
});