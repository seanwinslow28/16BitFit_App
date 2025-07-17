/**
 * Validated Input Component
 * GameBoy-style input with real-time validation
 * Following MetaSystemsAgent patterns for user feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import ValidationService from '../services/ValidationService';
import SoundFXManager from '../services/SoundFXManager';
import { Shake } from './MicroAnimations';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const ValidatedInput = ({
  fieldName,
  value,
  onChangeText,
  placeholder = '',
  label,
  required = false,
  validationRules,
  validateOnBlur = true,
  validateOnChange = false,
  showSuccessIndicator = true,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  onValidationChange = () => {},
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  
  // Animation values
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate border color based on validation state
    Animated.timing(borderColorAnim, {
      toValue: isValid === false ? 1 : isValid === true ? 2 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Animate error message
    Animated.timing(errorOpacity, {
      toValue: showErrors && errors.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate success indicator
    if (isValid === true && showSuccessIndicator) {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0);
    }
  }, [isValid, showErrors, errors]);

  const validate = () => {
    const validation = ValidationService.validateField(
      fieldName,
      value,
      validationRules
    );
    
    setErrors(validation.errors);
    setIsValid(validation.isValid);
    onValidationChange(validation.isValid, validation.errors);

    if (!validation.isValid && value) {
      // Trigger shake animation on error
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      
      // Play error sound
      SoundFXManager.playSound('ui_error', { volume: 0.3 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (validation.isValid && value) {
      // Play success sound
      SoundFXManager.playSound('ui_success', { volume: 0.3 });
    }

    return validation.isValid;
  };

  const handleChangeText = (text) => {
    // Sanitize input based on field type
    const sanitized = ValidationService.sanitizeInput(text, fieldName);
    onChangeText(sanitized);

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setShowErrors(false);
    }

    // Validate on change if enabled
    if (validateOnChange && text) {
      setShowErrors(true);
      validate();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    SoundFXManager.playSound('ui_button_press', { volume: 0.2 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (validateOnBlur && value) {
      setShowErrors(true);
      validate();
    }
  };

  const getBorderColor = () => {
    return borderColorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        isFocused ? COLORS.primary : COLORS.gray,
        COLORS.red,
        COLORS.primary,
      ],
    });
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <View style={styles.labelContainer}>
        <Text style={[styles.label, pixelFont]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {isValid === true && showSuccessIndicator && (
          <Animated.Text
            style={[
              styles.successIndicator,
              { transform: [{ scale: successScale }] },
            ]}
          >
            ✓
          </Animated.Text>
        )}
      </View>
    );
  };

  const renderErrors = () => {
    if (!showErrors || errors.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.errorContainer,
          { opacity: errorOpacity },
        ]}
      >
        {errors.map((error, index) => (
          <Text key={index} style={[styles.errorText, pixelFont]}>
            • {error}
          </Text>
        ))}
      </Animated.View>
    );
  };

  const renderCharacterCount = () => {
    if (!maxLength) return null;

    const remaining = maxLength - (value?.length || 0);
    const isNearLimit = remaining < maxLength * 0.2;

    return (
      <Text
        style={[
          styles.characterCount,
          pixelFont,
          isNearLimit && styles.characterCountWarning,
        ]}
      >
        {value?.length || 0}/{maxLength}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderLabel()}
      
      <Shake trigger={shakeError} intensity={5} duration={300}>
        <Animated.View
          style={[
            styles.inputContainer,
            multiline && styles.multilineContainer,
            {
              borderColor: getBorderColor(),
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              pixelFont,
              multiline && styles.multilineInput,
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            selectionColor={COLORS.primary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Show/hide password toggle */}
          {fieldName === 'password' && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => {
                // Toggle password visibility
                // This would need to be handled by parent component
              }}
            >
              <Text style={styles.passwordToggleIcon}>
                {secureTextEntry ? '👁' : '🙈'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Shake>
      
      <View style={styles.bottomRow}>
        {renderErrors()}
        {renderCharacterCount()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
    flex: 1,
  },

  required: {
    color: COLORS.red,
  },

  successIndicator: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
  },

  inputContainer: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 13, 13, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  multilineContainer: {
    alignItems: 'flex-start',
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  passwordToggle: {
    padding: 10,
  },

  passwordToggleIcon: {
    fontSize: 20,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },

  errorContainer: {
    flex: 1,
  },

  errorText: {
    fontSize: 9,
    color: COLORS.red,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  characterCount: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginLeft: 8,
  },

  characterCountWarning: {
    color: COLORS.yellow,
  },
});

export default ValidatedInput;