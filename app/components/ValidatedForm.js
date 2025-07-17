/**
 * Validated Form Component
 * GameBoy-style form with comprehensive validation
 * Following MetaSystemsAgent patterns for error handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import ValidatedInput from './ValidatedInput';
import ValidationService from '../services/ValidationService';
import SoundFXManager from '../services/SoundFXManager';
import GameBoyButton from './GameBoyButton';
import { Shake, FadeIn } from './MicroAnimations';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const ValidatedForm = ({
  fields = [],
  onSubmit,
  submitButtonText = 'SUBMIT',
  title,
  description,
  style,
  showProgress = true,
  validateOnSubmit = true,
  resetOnSubmit = false,
}) => {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [completedFields, setCompletedFields] = useState(new Set());
  
  // Animation values
  const progressAnim = useState(new Animated.Value(0))[0];
  const errorShake = useState(false)[0];

  useEffect(() => {
    // Initialize form data
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [fields]);

  useEffect(() => {
    // Animate progress bar
    const progress = completedFields.size / fields.length;
    Animated.spring(progressAnim, {
      toValue: progress,
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [completedFields]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleFieldValidation = (fieldName, isValid, errors) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errors,
    }));

    // Update completed fields
    if (isValid && formData[fieldName]) {
      setCompletedFields(prev => new Set([...prev, fieldName]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const validateForm = () => {
    const requiredFields = fields
      .filter(field => field.required)
      .map(field => field.name);

    const validation = ValidationService.validateForm(formData, requiredFields);
    
    if (!validation.isValid) {
      setFieldErrors(validation.results);
      setShowErrors(true);
      
      // Find first error field and shake it
      const firstErrorField = Object.keys(validation.results).find(
        key => !validation.results[key].isValid
      );
      
      if (firstErrorField) {
        SoundFXManager.playSound('ui_error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate if required
    if (validateOnSubmit && !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      
      // Success feedback
      SoundFXManager.playSound('ui_success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset form if requested
      if (resetOnSubmit) {
        const resetData = {};
        fields.forEach(field => {
          resetData[field.name] = field.defaultValue || '';
        });
        setFormData(resetData);
        setCompletedFields(new Set());
        setShowErrors(false);
      }
    } catch (error) {
      setSubmitError(
        ValidationService.getFriendlyErrorMessage(error.message)
      );
      SoundFXManager.playSound('ui_error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field, index) => {
    const fieldErrors = fieldErrors[field.name];
    
    return (
      <FadeIn key={field.name} delay={index * 100}>
        <ValidatedInput
          fieldName={field.name}
          value={formData[field.name] || ''}
          onChangeText={(value) => handleFieldChange(field.name, value)}
          onValidationChange={(isValid, errors) => 
            handleFieldValidation(field.name, isValid, errors)
          }
          placeholder={field.placeholder}
          label={field.label}
          required={field.required}
          validationRules={field.validationRules}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
          maxLength={field.maxLength}
          multiline={field.multiline}
          numberOfLines={field.numberOfLines}
          validateOnBlur={field.validateOnBlur !== false}
          validateOnChange={field.validateOnChange}
          showSuccessIndicator={field.showSuccessIndicator !== false}
        />
      </FadeIn>
    );
  };

  const renderProgress = () => {
    if (!showProgress) return null;

    const progress = completedFields.size / fields.length;
    const percentage = Math.round(progress * 100);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, pixelFont]}>
            FORM PROGRESS
          </Text>
          <Text style={[styles.progressValue, pixelFont]}>
            {percentage}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: progressAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [COLORS.red, COLORS.yellow, COLORS.primary],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['rgba(13, 13, 13, 0.95)', 'rgba(13, 13, 13, 0.9)']}
        style={styles.formContainer}
      >
        {title && (
          <Text style={[styles.title, pixelFont]}>{title}</Text>
        )}
        
        {description && (
          <Text style={[styles.description, pixelFont]}>{description}</Text>
        )}

        {renderProgress()}

        <View style={styles.fieldsContainer}>
          {fields.map((field, index) => renderField(field, index))}
        </View>

        {submitError && (
          <Shake trigger={true} intensity={5} duration={300}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.errorText, pixelFont]}>
                {submitError}
              </Text>
            </View>
          </Shake>
        )}

        <GameBoyButton
          onPress={handleSubmit}
          variant="primary"
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.dark} size="small" />
          ) : (
            <Text style={[styles.submitButtonText, pixelFont]}>
              {submitButtonText}
            </Text>
          )}
        </GameBoyButton>

        {/* Form hints */}
        <View style={styles.hintsContainer}>
          <Text style={[styles.hint, pixelFont]}>
            * Required fields
          </Text>
          {fields.some(f => f.type === 'password') && (
            <Text style={[styles.hint, pixelFont]}>
              Passwords must be 8+ characters with uppercase and numbers
            </Text>
          )}
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  formContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  title: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },

  description: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 16,
  },

  progressContainer: {
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 1,
  },

  progressValue: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 3,
  },

  fieldsContainer: {
    marginBottom: 20,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  errorText: {
    fontSize: 10,
    color: COLORS.red,
    letterSpacing: 0.5,
    flex: 1,
  },

  submitButton: {
    marginTop: 8,
  },

  submitButtonText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  hintsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 102, 102, 0.3)',
  },

  hint: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default ValidatedForm;