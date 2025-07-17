/**
 * Validation Service
 * Comprehensive input validation and error handling
 * Following MetaSystemsAgent patterns for data integrity
 */

// Validation rules
const VALIDATION_RULES = {
  // User profile validation
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
    messages: {
      required: 'Username is required',
      minLength: 'Username must be at least 3 characters',
      maxLength: 'Username cannot exceed 20 characters',
      pattern: 'Username can only contain letters, numbers, hyphens, and underscores',
      taken: 'This username is already taken',
    },
  },
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: 'Email is required',
      pattern: 'Please enter a valid email address',
      taken: 'This email is already registered',
    },
  },
  
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false, // Optional for better UX
    messages: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters',
      maxLength: 'Password is too long',
      requireUppercase: 'Password must contain at least one uppercase letter',
      requireLowercase: 'Password must contain at least one lowercase letter',
      requireNumber: 'Password must contain at least one number',
      requireSpecial: 'Password must contain at least one special character',
      weak: 'Password is too weak. Try adding more characters',
    },
  },
  
  // Game data validation
  characterName: {
    minLength: 1,
    maxLength: 15,
    pattern: /^[a-zA-Z0-9 ]+$/,
    messages: {
      required: 'Character name is required',
      minLength: 'Character name cannot be empty',
      maxLength: 'Character name is too long (max 15 characters)',
      pattern: 'Character name can only contain letters, numbers, and spaces',
    },
  },
  
  // Stats validation
  stat: {
    min: 0,
    max: 100,
    messages: {
      min: 'Stat value cannot be negative',
      max: 'Stat value cannot exceed 100',
      invalid: 'Invalid stat value',
    },
  },
  
  level: {
    min: 1,
    max: 100,
    messages: {
      min: 'Level must be at least 1',
      max: 'Maximum level is 100',
      invalid: 'Invalid level value',
    },
  },
  
  xp: {
    min: 0,
    max: 999999,
    messages: {
      min: 'XP cannot be negative',
      max: 'XP value is too high',
      invalid: 'Invalid XP value',
    },
  },
  
  // Workout validation
  workoutDuration: {
    min: 1,
    max: 300, // 5 hours max
    messages: {
      required: 'Workout duration is required',
      min: 'Workout must be at least 1 minute',
      max: 'Workout duration cannot exceed 5 hours',
      invalid: 'Invalid duration',
    },
  },
  
  workoutIntensity: {
    options: ['low', 'medium', 'high'],
    messages: {
      required: 'Please select workout intensity',
      invalid: 'Invalid intensity level',
    },
  },
  
  // Nutrition validation
  calories: {
    min: 0,
    max: 10000,
    messages: {
      min: 'Calories cannot be negative',
      max: 'Calorie value seems too high',
      invalid: 'Invalid calorie value',
    },
  },
  
  waterIntake: {
    min: 0,
    max: 20, // liters
    messages: {
      min: 'Water intake cannot be negative',
      max: 'Water intake value seems too high',
      invalid: 'Invalid water intake value',
    },
  },
  
  // Social validation
  friendCode: {
    pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    messages: {
      required: 'Friend code is required',
      pattern: 'Friend code must be in format: XXXX-XXXX',
      invalid: 'Invalid friend code',
      notFound: 'Friend code not found',
    },
  },
  
  message: {
    maxLength: 200,
    messages: {
      maxLength: 'Message is too long (max 200 characters)',
      empty: 'Message cannot be empty',
      inappropriate: 'Message contains inappropriate content',
    },
  },
};

class ValidationService {
  /**
   * Validate a single field
   */
  static validateField(fieldName, value, rules = VALIDATION_RULES[fieldName]) {
    if (!rules) {
      return { isValid: true, errors: [] };
    }

    const errors = [];

    // Required check
    if (rules.required && !value) {
      errors.push(rules.messages.required);
      return { isValid: false, errors };
    }

    // Skip other validations if value is empty and not required
    if (!value && !rules.required) {
      return { isValid: true, errors: [] };
    }

    // String validations
    if (typeof value === 'string') {
      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(rules.messages.minLength);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(rules.messages.maxLength);
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.messages.pattern);
      }

      // Password specific validations
      if (fieldName === 'password') {
        if (rules.requireUppercase && !/[A-Z]/.test(value)) {
          errors.push(rules.messages.requireUppercase);
        }
        if (rules.requireLowercase && !/[a-z]/.test(value)) {
          errors.push(rules.messages.requireLowercase);
        }
        if (rules.requireNumber && !/[0-9]/.test(value)) {
          errors.push(rules.messages.requireNumber);
        }
        if (rules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.push(rules.messages.requireSpecial);
        }
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(value)) {
      const numValue = Number(value);
      
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(rules.messages.min);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(rules.messages.max);
      }
    }

    // Options validation (enum)
    if (rules.options && !rules.options.includes(value)) {
      errors.push(rules.messages.invalid);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate multiple fields
   */
  static validateForm(formData, requiredFields = []) {
    const results = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach(fieldName => {
      const validation = this.validateField(fieldName, formData[fieldName]);
      results[fieldName] = validation;
      if (!validation.isValid) {
        isValid = false;
      }
    });

    // Check required fields
    requiredFields.forEach(fieldName => {
      if (!formData[fieldName]) {
        results[fieldName] = {
          isValid: false,
          errors: [VALIDATION_RULES[fieldName]?.messages.required || 'This field is required'],
        };
        isValid = false;
      }
    });

    return {
      isValid,
      results,
      errors: this.flattenErrors(results),
    };
  }

  /**
   * Flatten validation errors for easy display
   */
  static flattenErrors(results) {
    const errors = [];
    Object.keys(results).forEach(fieldName => {
      if (!results[fieldName].isValid) {
        results[fieldName].errors.forEach(error => {
          errors.push({ field: fieldName, message: error });
        });
      }
    });
    return errors;
  }

  /**
   * Validate game stats
   */
  static validateStats(stats) {
    const validStats = {};
    const errors = [];

    const statFields = ['health', 'strength', 'stamina', 'happiness', 'weight'];
    
    statFields.forEach(stat => {
      if (stats[stat] !== undefined) {
        const value = Number(stats[stat]);
        if (isNaN(value) || value < 0 || value > 100) {
          errors.push(`Invalid ${stat} value: must be between 0 and 100`);
        } else {
          validStats[stat] = value;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      validStats,
      errors,
    };
  }

  /**
   * Validate workout data
   */
  static validateWorkout(workoutData) {
    const errors = [];

    // Validate workout type
    const validTypes = ['cardio', 'strength', 'yoga', 'sports'];
    if (!validTypes.includes(workoutData.type)) {
      errors.push('Invalid workout type');
    }

    // Validate duration
    const duration = Number(workoutData.duration);
    if (isNaN(duration) || duration < 1 || duration > 300) {
      errors.push('Workout duration must be between 1 and 300 minutes');
    }

    // Validate intensity if provided
    if (workoutData.intensity) {
      const validIntensities = ['low', 'medium', 'high'];
      if (!validIntensities.includes(workoutData.intensity)) {
        errors.push('Invalid workout intensity');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate nutrition data
   */
  static validateNutrition(nutritionData) {
    const errors = [];

    // Validate meal type
    const validTypes = ['healthy', 'junk', 'balanced'];
    if (nutritionData.type && !validTypes.includes(nutritionData.type)) {
      errors.push('Invalid meal type');
    }

    // Validate calories
    if (nutritionData.calories !== undefined) {
      const calories = Number(nutritionData.calories);
      if (isNaN(calories) || calories < 0 || calories > 10000) {
        errors.push('Calories must be between 0 and 10000');
      }
    }

    // Validate water intake
    if (nutritionData.water !== undefined) {
      const water = Number(nutritionData.water);
      if (isNaN(water) || water < 0 || water > 20) {
        errors.push('Water intake must be between 0 and 20 liters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') return input;

    // Remove any HTML/script tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    switch (type) {
      case 'username':
        // Allow only alphanumeric, underscore, and hyphen
        sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');
        break;
      
      case 'number':
        // Allow only numbers
        sanitized = sanitized.replace(/[^0-9]/g, '');
        break;
      
      case 'email':
        // Basic email sanitization
        sanitized = sanitized.toLowerCase().trim();
        break;
      
      case 'message':
        // Allow most characters but remove potential XSS
        sanitized = sanitized
          .replace(/[<>]/g, '')
          .trim()
          .substring(0, 200);
        break;
      
      default:
        // General text sanitization
        sanitized = sanitized.trim();
    }

    return sanitized;
  }

  /**
   * Check for inappropriate content
   */
  static checkInappropriateContent(text) {
    // Simple profanity check (expand this list as needed)
    const inappropriateWords = [
      // Add inappropriate words here
    ];

    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  }

  /**
   * Validate friend code format
   */
  static validateFriendCode(code) {
    const validation = this.validateField('friendCode', code);
    return validation;
  }

  /**
   * Generate friendly error message
   */
  static getFriendlyErrorMessage(error) {
    // Map technical errors to user-friendly messages
    const errorMap = {
      'Network request failed': 'Connection error. Please check your internet.',
      'Invalid credentials': 'Wrong username or password.',
      'User not found': 'Account not found. Please check your details.',
      'Duplicate entry': 'This information is already in use.',
      'Server error': 'Something went wrong. Please try again.',
    };

    return errorMap[error] || error;
  }
}

export default ValidationService;
export { VALIDATION_RULES };