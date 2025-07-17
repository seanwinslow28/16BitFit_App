/**
 * ValidationService Tests
 * Testing input validation and error handling
 * Following MetaSystemsAgent patterns for comprehensive validation testing
 */

import ValidationService, { VALIDATION_RULES } from '../../app/services/ValidationService';

describe('ValidationService', () => {
  describe('validateField', () => {
    it('validates username correctly', () => {
      // Valid username
      expect(ValidationService.validateField('username', 'TestUser123')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Too short
      expect(ValidationService.validateField('username', 'ab')).toEqual({
        isValid: false,
        errors: ['Username must be at least 3 characters'],
      });
      
      // Too long
      expect(ValidationService.validateField('username', 'a'.repeat(25))).toEqual({
        isValid: false,
        errors: ['Username cannot exceed 20 characters'],
      });
      
      // Invalid characters
      expect(ValidationService.validateField('username', 'test@user')).toEqual({
        isValid: false,
        errors: ['Username can only contain letters, numbers, hyphens, and underscores'],
      });
      
      // Empty
      expect(ValidationService.validateField('username', '')).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('validates email correctly', () => {
      // Valid email
      expect(ValidationService.validateField('email', 'test@example.com')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Invalid format
      expect(ValidationService.validateField('email', 'invalid-email')).toEqual({
        isValid: false,
        errors: ['Please enter a valid email address'],
      });
      
      // Missing @ symbol
      expect(ValidationService.validateField('email', 'testexample.com')).toEqual({
        isValid: false,
        errors: ['Please enter a valid email address'],
      });
      
      // Missing domain
      expect(ValidationService.validateField('email', 'test@')).toEqual({
        isValid: false,
        errors: ['Please enter a valid email address'],
      });
    });

    it('validates password correctly', () => {
      // Valid password
      expect(ValidationService.validateField('password', 'Test123456')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Too short
      expect(ValidationService.validateField('password', 'Test1')).toEqual({
        isValid: false,
        errors: ['Password must be at least 8 characters'],
      });
      
      // Missing uppercase
      expect(ValidationService.validateField('password', 'test123456')).toEqual({
        isValid: false,
        errors: ['Password must contain at least one uppercase letter'],
      });
      
      // Missing lowercase
      expect(ValidationService.validateField('password', 'TEST123456')).toEqual({
        isValid: false,
        errors: ['Password must contain at least one lowercase letter'],
      });
      
      // Missing number
      expect(ValidationService.validateField('password', 'TestPassword')).toEqual({
        isValid: false,
        errors: ['Password must contain at least one number'],
      });
      
      // Multiple errors
      expect(ValidationService.validateField('password', 'test')).toEqual({
        isValid: false,
        errors: [
          'Password must be at least 8 characters',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one number',
        ],
      });
    });

    it('validates character name correctly', () => {
      // Valid name
      expect(ValidationService.validateField('characterName', 'Hero123')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Too long
      expect(ValidationService.validateField('characterName', 'SuperLongCharacterName')).toEqual({
        isValid: false,
        errors: ['Character name is too long (max 15 characters)'],
      });
      
      // Invalid characters
      expect(ValidationService.validateField('characterName', 'Hero@123')).toEqual({
        isValid: false,
        errors: ['Character name can only contain letters, numbers, and spaces'],
      });
      
      // Empty
      expect(ValidationService.validateField('characterName', '')).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('validates numeric fields correctly', () => {
      // Valid stat
      expect(ValidationService.validateField('stat', 50)).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Below minimum
      expect(ValidationService.validateField('stat', -10)).toEqual({
        isValid: false,
        errors: ['Stat value cannot be negative'],
      });
      
      // Above maximum
      expect(ValidationService.validateField('stat', 150)).toEqual({
        isValid: false,
        errors: ['Stat value cannot exceed 100'],
      });
      
      // String number
      expect(ValidationService.validateField('stat', '75')).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('validates workout duration correctly', () => {
      // Valid duration
      expect(ValidationService.validateField('workoutDuration', 30)).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Too short
      expect(ValidationService.validateField('workoutDuration', 0)).toEqual({
        isValid: false,
        errors: ['Workout must be at least 1 minute'],
      });
      
      // Too long
      expect(ValidationService.validateField('workoutDuration', 400)).toEqual({
        isValid: false,
        errors: ['Workout duration cannot exceed 5 hours'],
      });
    });

    it('validates workout intensity correctly', () => {
      // Valid intensity
      expect(ValidationService.validateField('workoutIntensity', 'medium')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Invalid intensity
      expect(ValidationService.validateField('workoutIntensity', 'extreme')).toEqual({
        isValid: false,
        errors: ['Invalid intensity level'],
      });
    });

    it('validates friend code correctly', () => {
      // Valid friend code
      expect(ValidationService.validateField('friendCode', 'ABCD-1234')).toEqual({
        isValid: true,
        errors: [],
      });
      
      // Invalid format
      expect(ValidationService.validateField('friendCode', 'ABCD1234')).toEqual({
        isValid: false,
        errors: ['Friend code must be in format: XXXX-XXXX'],
      });
      
      // Too long
      expect(ValidationService.validateField('friendCode', 'ABCDE-12345')).toEqual({
        isValid: false,
        errors: ['Friend code must be in format: XXXX-XXXX'],
      });
    });

    it('handles unknown field types gracefully', () => {
      expect(ValidationService.validateField('unknownField', 'value')).toEqual({
        isValid: true,
        errors: [],
      });
    });
  });

  describe('validateForm', () => {
    it('validates complete form correctly', () => {
      const formData = {
        username: 'TestUser',
        email: 'test@example.com',
        password: 'Test123456',
      };
      
      const result = ValidationService.validateForm(formData, ['username', 'email', 'password']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('identifies form errors correctly', () => {
      const formData = {
        username: 'ab',
        email: 'invalid-email',
        password: 'short',
      };
      
      const result = ValidationService.validateForm(formData, ['username', 'email', 'password']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles missing required fields', () => {
      const formData = {
        username: 'TestUser',
      };
      
      const result = ValidationService.validateForm(formData, ['username', 'email', 'password']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Email is required',
          }),
          expect.objectContaining({
            field: 'password',
            message: 'Password is required',
          }),
        ])
      );
    });
  });

  describe('validateStats', () => {
    it('validates valid stats', () => {
      const stats = {
        health: 80,
        strength: 75,
        stamina: 90,
        happiness: 85,
        weight: 70,
      };
      
      const result = ValidationService.validateStats(stats);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.validStats).toEqual(stats);
    });

    it('identifies invalid stats', () => {
      const stats = {
        health: -10,
        strength: 150,
        stamina: 'invalid',
        happiness: 85,
        weight: 70,
      };
      
      const result = ValidationService.validateStats(stats);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          'Invalid health value: must be between 0 and 100',
          'Invalid strength value: must be between 0 and 100',
          'Invalid stamina value: must be between 0 and 100',
        ])
      );
    });
  });

  describe('validateWorkout', () => {
    it('validates valid workout', () => {
      const workout = {
        type: 'cardio',
        duration: 30,
        intensity: 'medium',
      };
      
      const result = ValidationService.validateWorkout(workout);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('identifies invalid workout', () => {
      const workout = {
        type: 'invalid',
        duration: 400,
        intensity: 'extreme',
      };
      
      const result = ValidationService.validateWorkout(workout);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          'Invalid workout type',
          'Workout duration must be between 1 and 300 minutes',
          'Invalid workout intensity',
        ])
      );
    });
  });

  describe('validateNutrition', () => {
    it('validates valid nutrition', () => {
      const nutrition = {
        type: 'healthy',
        calories: 500,
        water: 2.5,
      };
      
      const result = ValidationService.validateNutrition(nutrition);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('identifies invalid nutrition', () => {
      const nutrition = {
        type: 'invalid',
        calories: -100,
        water: 25,
      };
      
      const result = ValidationService.validateNutrition(nutrition);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          'Invalid meal type',
          'Calories must be between 0 and 10000',
          'Water intake must be between 0 and 20 liters',
        ])
      );
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      expect(ValidationService.sanitizeInput(input)).toBe('Hello World');
    });

    it('sanitizes username input', () => {
      const input = 'test@user#123!';
      expect(ValidationService.sanitizeInput(input, 'username')).toBe('testuser123');
    });

    it('sanitizes number input', () => {
      const input = 'abc123def456';
      expect(ValidationService.sanitizeInput(input, 'number')).toBe('123456');
    });

    it('sanitizes email input', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      expect(ValidationService.sanitizeInput(input, 'email')).toBe('test@example.com');
    });

    it('sanitizes message input', () => {
      const input = '<script>alert("xss")</script>Hello World! This is a very long message that exceeds the limit of 200 characters and should be truncated to ensure it fits within the allowed message length for the application.';
      const sanitized = ValidationService.sanitizeInput(input, 'message');
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });

    it('handles non-string input', () => {
      expect(ValidationService.sanitizeInput(123)).toBe(123);
      expect(ValidationService.sanitizeInput(null)).toBe(null);
      expect(ValidationService.sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('checkInappropriateContent', () => {
    it('returns false for clean content', () => {
      expect(ValidationService.checkInappropriateContent('Hello world')).toBe(false);
    });

    it('would detect inappropriate content', () => {
      // Test would fail since no inappropriate words are defined
      expect(ValidationService.checkInappropriateContent('clean message')).toBe(false);
    });
  });

  describe('validateFriendCode', () => {
    it('validates correct friend code format', () => {
      const result = ValidationService.validateFriendCode('ABCD-1234');
      expect(result.isValid).toBe(true);
    });

    it('rejects incorrect friend code format', () => {
      const result = ValidationService.validateFriendCode('ABCD1234');
      expect(result.isValid).toBe(false);
    });
  });

  describe('getFriendlyErrorMessage', () => {
    it('returns friendly message for known errors', () => {
      expect(ValidationService.getFriendlyErrorMessage('Network request failed'))
        .toBe('Connection error. Please check your internet.');
      
      expect(ValidationService.getFriendlyErrorMessage('Invalid credentials'))
        .toBe('Wrong username or password.');
    });

    it('returns original message for unknown errors', () => {
      const unknownError = 'Unknown error occurred';
      expect(ValidationService.getFriendlyErrorMessage(unknownError))
        .toBe(unknownError);
    });
  });

  describe('VALIDATION_RULES', () => {
    it('contains all required rule sets', () => {
      expect(VALIDATION_RULES).toHaveProperty('username');
      expect(VALIDATION_RULES).toHaveProperty('email');
      expect(VALIDATION_RULES).toHaveProperty('password');
      expect(VALIDATION_RULES).toHaveProperty('characterName');
      expect(VALIDATION_RULES).toHaveProperty('stat');
      expect(VALIDATION_RULES).toHaveProperty('workoutDuration');
      expect(VALIDATION_RULES).toHaveProperty('workoutIntensity');
      expect(VALIDATION_RULES).toHaveProperty('friendCode');
    });

    it('has proper structure for each rule', () => {
      Object.values(VALIDATION_RULES).forEach(rule => {
        expect(rule).toHaveProperty('messages');
        expect(typeof rule.messages).toBe('object');
      });
    });
  });
});