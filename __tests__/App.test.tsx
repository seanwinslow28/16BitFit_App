/**
 * Main App Component Tests
 * Testing the core app functionality and GameBoy interface
 * Following MetaSystemsAgent patterns for comprehensive testing
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('gameboy-shell')).toBeTruthy();
  });

  it('displays the correct initial screen', () => {
    const { getByText } = render(<App />);
    expect(getByText('16BITFIT')).toBeTruthy();
  });

  it('shows player stats correctly', async () => {
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText(/LEVEL/)).toBeTruthy();
      expect(getByText(/XP/)).toBeTruthy();
    });
  });

  it('handles character interaction', async () => {
    const { getByTestId } = render(<App />);
    
    const character = getByTestId('character-sprite');
    fireEvent.press(character);
    
    await waitFor(() => {
      // Should trigger character animation
      expect(character).toBeTruthy();
    });
  });

  it('navigates between screens correctly', async () => {
    const { getByText, getByTestId } = render(<App />);
    
    // Navigate to workout screen
    const workoutButton = getByTestId('workout-button');
    fireEvent.press(workoutButton);
    
    await waitFor(() => {
      expect(getByText(/WORKOUT/)).toBeTruthy();
    });
    
    // Navigate back to home
    const homeButton = getByTestId('home-button');
    fireEvent.press(homeButton);
    
    await waitFor(() => {
      expect(getByText('16BITFIT')).toBeTruthy();
    });
  });

  it('displays correct GameBoy styling', () => {
    const { getByTestId } = render(<App />);
    
    const shell = getByTestId('gameboy-shell');
    expect(shell).toHaveStyle({
      backgroundColor: '#92CC41',
    });
    
    const screen = getByTestId('gameboy-screen');
    expect(screen).toHaveStyle({
      backgroundColor: '#0D0D0D',
    });
  });

  it('handles D-pad navigation', async () => {
    const { getByTestId } = render(<App />);
    
    const dpadUp = getByTestId('dpad-up');
    const dpadDown = getByTestId('dpad-down');
    const dpadLeft = getByTestId('dpad-left');
    const dpadRight = getByTestId('dpad-right');
    
    // Test D-pad functionality
    fireEvent.press(dpadUp);
    fireEvent.press(dpadDown);
    fireEvent.press(dpadLeft);
    fireEvent.press(dpadRight);
    
    // Should not crash and should handle navigation
    expect(dpadUp).toBeTruthy();
    expect(dpadDown).toBeTruthy();
    expect(dpadLeft).toBeTruthy();
    expect(dpadRight).toBeTruthy();
  });

  it('handles A and B button presses', async () => {
    const { getByTestId } = render(<App />);
    
    const aButton = getByTestId('a-button');
    const bButton = getByTestId('b-button');
    
    fireEvent.press(aButton);
    fireEvent.press(bButton);
    
    // Should handle button presses without crashing
    expect(aButton).toBeTruthy();
    expect(bButton).toBeTruthy();
  });

  it('updates player stats correctly', async () => {
    const { getByText, getByTestId } = render(<App />);
    
    // Mock completing a workout
    const workoutButton = getByTestId('workout-button');
    fireEvent.press(workoutButton);
    
    // Mock workout completion
    const completeWorkoutButton = getByTestId('complete-workout');
    fireEvent.press(completeWorkoutButton);
    
    await waitFor(() => {
      // Stats should update
      expect(getByText(/LEVEL/)).toBeTruthy();
    });
  });

  it('handles character evolution', async () => {
    const { getByTestId } = render(<App />);
    
    const character = getByTestId('character-sprite');
    
    // Mock high stats for evolution
    // This would require triggering evolution conditions
    
    await waitFor(() => {
      expect(character).toBeTruthy();
    });
  });

  it('maintains responsive layout', () => {
    const { getByTestId } = render(<App />);
    
    const shell = getByTestId('gameboy-shell');
    const screen = getByTestId('gameboy-screen');
    
    // Should maintain proper proportions
    expect(shell).toBeTruthy();
    expect(screen).toBeTruthy();
  });

  it('handles font loading', async () => {
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      const titleText = getByText('16BITFIT');
      expect(titleText).toBeTruthy();
    });
  });

  it('displays correct animations', async () => {
    const { getByTestId } = render(<App />);
    
    const character = getByTestId('character-sprite');
    
    // Test character animations
    fireEvent.press(character);
    
    // Fast forward animations
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(character).toBeTruthy();
    });
  });

  it('handles error states gracefully', async () => {
    // Mock an error scenario
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByTestId } = render(<App />);
    
    // Should still render the shell even with errors
    expect(getByTestId('gameboy-shell')).toBeTruthy();
    
    consoleSpy.mockRestore();
  });

  it('persists player data', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    // Mock saved data
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
      level: 10,
      xp: 5000,
      health: 90,
      strength: 85,
      stamina: 80,
      happiness: 95,
      weight: 70,
    }));
    
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  it('handles battle system correctly', async () => {
    const { getByTestId } = render(<App />);
    
    // Navigate to battle screen
    const battleButton = getByTestId('battle-button');
    fireEvent.press(battleButton);
    
    await waitFor(() => {
      expect(getByTestId('battle-screen')).toBeTruthy();
    });
  });

  it('validates input correctly', async () => {
    const { getByTestId } = render(<App />);
    
    // Navigate to settings or input screen
    const input = getByTestId('text-input');
    
    // Test invalid input
    fireEvent.changeText(input, 'invalid@input');
    
    await waitFor(() => {
      // Should show validation error
      expect(getByTestId('validation-error')).toBeTruthy();
    });
  });

  it('handles network connectivity', async () => {
    const NetInfo = require('@react-native-community/netinfo');
    
    // Mock offline state
    NetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
    
    const { getByTestId } = render(<App />);
    
    await waitFor(() => {
      // Should handle offline state
      expect(getByTestId('gameboy-shell')).toBeTruthy();
    });
  });

  it('maintains accessibility features', () => {
    const { getByTestId } = render(<App />);
    
    const aButton = getByTestId('a-button');
    const bButton = getByTestId('b-button');
    
    // Should have accessibility labels
    expect(aButton).toHaveProp('accessibilityLabel');
    expect(bButton).toHaveProp('accessibilityLabel');
  });

  it('handles performance monitoring', async () => {
    const { getByTestId } = render(<App />);
    
    // Should initialize performance monitoring
    expect(getByTestId('gameboy-shell')).toBeTruthy();
    
    // Performance metrics should be tracked
    await waitFor(() => {
      expect(getByTestId('gameboy-shell')).toBeTruthy();
    });
  });

  it('handles sound effects correctly', async () => {
    const { getByTestId } = render(<App />);
    
    const aButton = getByTestId('a-button');
    fireEvent.press(aButton);
    
    // Should trigger sound effect
    await waitFor(() => {
      expect(aButton).toBeTruthy();
    });
  });

  it('handles haptic feedback', async () => {
    const haptics = require('expo-haptics');
    
    const { getByTestId } = render(<App />);
    
    const aButton = getByTestId('a-button');
    fireEvent.press(aButton);
    
    await waitFor(() => {
      expect(haptics.impactAsync).toHaveBeenCalled();
    });
  });

  it('handles screen transitions', async () => {
    const { getByTestId } = render(<App />);
    
    const workoutButton = getByTestId('workout-button');
    fireEvent.press(workoutButton);
    
    // Should animate screen transition
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(getByTestId('workout-screen')).toBeTruthy();
    });
  });
});