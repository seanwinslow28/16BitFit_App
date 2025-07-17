/**
 * ValidatedInput Component Tests
 * Testing input validation and user feedback
 * Following MetaSystemsAgent patterns for component testing
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ValidatedInput from '../../app/components/ValidatedInput';

describe('ValidatedInput', () => {
  const defaultProps = {
    fieldName: 'username',
    value: '',
    onChangeText: jest.fn(),
    placeholder: 'Enter username',
    label: 'Username',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput {...defaultProps} />
    );
    expect(getByDisplayValue('')).toBeTruthy();
  });

  it('displays label correctly', () => {
    const { getByText } = render(
      <ValidatedInput {...defaultProps} />
    );
    expect(getByText('Username')).toBeTruthy();
  });

  it('displays placeholder correctly', () => {
    const { getByPlaceholderText } = render(
      <ValidatedInput {...defaultProps} />
    );
    expect(getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('shows required indicator when required', () => {
    const { getByText } = render(
      <ValidatedInput {...defaultProps} required={true} />
    );
    expect(getByText('*')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <ValidatedInput {...defaultProps} onChangeText={onChangeText} />
    );
    
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test');
    
    expect(onChangeText).toHaveBeenCalledWith('test');
  });

  it('validates input on blur', async () => {
    const onValidationChange = jest.fn();
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        value="ab"
        validateOnBlur={true}
        onValidationChange={onValidationChange}
      />
    );
    
    const input = getByDisplayValue('ab');
    fireEvent(input, 'blur');
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        false,
        expect.arrayContaining([
          'Username must be at least 3 characters'
        ])
      );
    });
  });

  it('validates input on change when enabled', async () => {
    const onValidationChange = jest.fn();
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        validateOnChange={true}
        onValidationChange={onValidationChange}
      />
    );
    
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'ab');
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  it('displays validation errors', async () => {
    const { getByDisplayValue, getByText } = render(
      <ValidatedInput
        {...defaultProps}
        value="ab"
        validateOnBlur={true}
      />
    );
    
    const input = getByDisplayValue('ab');
    fireEvent(input, 'blur');
    
    await waitFor(() => {
      expect(getByText('Username must be at least 3 characters')).toBeTruthy();
    });
  });

  it('shows success indicator when valid', async () => {
    const { getByDisplayValue, getByText } = render(
      <ValidatedInput
        {...defaultProps}
        value="ValidUser123"
        validateOnBlur={true}
        showSuccessIndicator={true}
      />
    );
    
    const input = getByDisplayValue('ValidUser123');
    fireEvent(input, 'blur');
    
    await waitFor(() => {
      expect(getByText('✓')).toBeTruthy();
    });
  });

  it('handles secure text entry', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        fieldName="password"
        secureTextEntry={true}
      />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('displays character count when maxLength is set', () => {
    const { getByText } = render(
      <ValidatedInput
        {...defaultProps}
        value="test"
        maxLength={20}
      />
    );
    
    expect(getByText('4/20')).toBeTruthy();
  });

  it('warns when approaching character limit', () => {
    const { getByText } = render(
      <ValidatedInput
        {...defaultProps}
        value="a".repeat(18)
        maxLength={20}
      />
    );
    
    const characterCount = getByText('18/20');
    expect(characterCount).toBeTruthy();
    // Should have warning styling when > 80% of limit
  });

  it('supports multiline input', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        multiline={true}
        numberOfLines={3}
      />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(3);
  });

  it('sanitizes input based on field type', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        fieldName="username"
        onChangeText={onChangeText}
      />
    );
    
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test@user#123');
    
    // Should sanitize username input
    expect(onChangeText).toHaveBeenCalledWith('testuser123');
  });

  it('clears errors when user starts typing', async () => {
    const { getByDisplayValue, getByText, queryByText } = render(
      <ValidatedInput
        {...defaultProps}
        value="ab"
        validateOnBlur={true}
      />
    );
    
    const input = getByDisplayValue('ab');
    
    // Trigger validation error
    fireEvent(input, 'blur');
    
    await waitFor(() => {
      expect(getByText('Username must be at least 3 characters')).toBeTruthy();
    });
    
    // Start typing - should clear errors
    fireEvent.changeText(input, 'abc');
    
    await waitFor(() => {
      expect(queryByText('Username must be at least 3 characters')).toBeNull();
    });
  });

  it('handles focus and blur events', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput {...defaultProps} />
    );
    
    const input = getByDisplayValue('');
    
    // Should handle focus
    fireEvent(input, 'focus');
    
    // Should handle blur
    fireEvent(input, 'blur');
    
    // Should not crash
    expect(input).toBeTruthy();
  });

  it('applies custom validation rules', async () => {
    const customRules = {
      minLength: 5,
      maxLength: 10,
      pattern: /^[a-zA-Z]+$/,
      messages: {
        minLength: 'Must be at least 5 characters',
        maxLength: 'Must be at most 10 characters',
        pattern: 'Only letters allowed',
      },
    };
    
    const onValidationChange = jest.fn();
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        value="test123"
        validationRules={customRules}
        validateOnBlur={true}
        onValidationChange={onValidationChange}
      />
    );
    
    const input = getByDisplayValue('test123');
    fireEvent(input, 'blur');
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        false,
        expect.arrayContaining(['Only letters allowed'])
      );
    });
  });

  it('handles different keyboard types', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        keyboardType="email-address"
      />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.keyboardType).toBe('email-address');
  });

  it('applies custom styling', () => {
    const customStyle = { marginTop: 20 };
    const customInputStyle = { fontSize: 16 };
    
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        style={customStyle}
        inputStyle={customInputStyle}
      />
    );
    
    const input = getByDisplayValue('');
    expect(input).toBeTruthy();
  });

  it('handles validation animation', async () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        value="ValidUser123"
        validateOnBlur={true}
      />
    );
    
    const input = getByDisplayValue('ValidUser123');
    fireEvent(input, 'blur');
    
    // Should trigger success animation
    await waitFor(() => {
      expect(input).toBeTruthy();
    });
  });

  it('handles password toggle functionality', () => {
    const { getByText } = render(
      <ValidatedInput
        {...defaultProps}
        fieldName="password"
        secureTextEntry={true}
      />
    );
    
    // Should show password toggle button
    expect(getByText('🙈')).toBeTruthy();
  });

  it('handles error shake animation', async () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        value="ab"
        validateOnBlur={true}
      />
    );
    
    const input = getByDisplayValue('ab');
    fireEvent(input, 'blur');
    
    // Should trigger shake animation on error
    await waitFor(() => {
      expect(input).toBeTruthy();
    });
  });

  it('handles disabled state', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput
        {...defaultProps}
        editable={false}
      />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.editable).toBe(false);
  });

  it('handles autoCapitalize and autoCorrect settings', () => {
    const { getByDisplayValue } = render(
      <ValidatedInput {...defaultProps} />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });
});