/**
 * Network Test Button
 * Component to test network error handling functionality
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import NetworkManager from '../services/NetworkManager';
import { showError, showSuccess, showWarning } from './ToastNotification';
import { pixelFont } from '../hooks/useFonts';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
};

const NetworkTestButton = ({ style }) => {
  const testNetworkError = async () => {
    try {
      // Test with a failing URL to trigger retry logic
      const result = await NetworkManager.request(
        'https://jsonplaceholder.typicode.com/posts/999999', // This will return 404
        {
          method: 'GET',
        },
        {
          maxRetries: 2,
          queueIfOffline: true,
          onRetry: (attempt, maxRetries, delay) => {
            showWarning(`Retrying... Attempt ${attempt} of ${maxRetries}`);
          },
        }
      );
      
      if (result.success) {
        showSuccess('Request succeeded!');
      } else if (result.queued) {
        showWarning('Request queued for offline sync');
      } else {
        showError(`Request failed: ${result.error}`);
      }
    } catch (error) {
      showError(`Test failed: ${error.message}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={testNetworkError}
    >
      <Text style={[styles.buttonText, pixelFont]}>TEST NETWORK</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  buttonText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default NetworkTestButton;