// FigmaTestButton.js - Test button for Figma integration
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FigmaService from '../services/FigmaService';

const FigmaTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');

  const testFigmaConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      // Test basic connection
      console.log('🔍 Testing Figma connection...');
      const connectionTest = await FigmaService.testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Connection successful!', connectionTest.user);
        setConnectionStatus('✅ Connected');
        
        // Test file access with your new file
        const fileKey = 'vHtsDDAILWiPSGmYzFmFLq'; // Your 16BitFit UI/UX file
        console.log('🔍 Testing file access...');
        const fileData = await FigmaService.getFile(fileKey);
        
        console.log('📄 File data:', fileData);
        Alert.alert(
          'Success! 🎉',
          `Connected to Figma!\n\nFile: ${fileData.name}\nPages: ${fileData.document.children.length}`,
          [{ text: 'OK', style: 'default' }]
        );
        
      } else {
        console.error('❌ Connection failed:', connectionTest.error);
        setConnectionStatus('❌ Failed');
        Alert.alert(
          'Connection Failed',
          connectionTest.error,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Error testing Figma:', error);
      setConnectionStatus('❌ Error');
      Alert.alert(
        'Error',
        `Failed to connect to Figma: ${error.message}`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 Figma Integration Test</Text>
      <Text style={styles.subtitle}>16BitFit UI/UX Cursor Design</Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testFigmaConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Figma Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.status}>Status: {connectionStatus}</Text>
      
      <Text style={styles.helpText}>
        Make sure your Figma token is set in the .env file and you have restarted the app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FigmaTestButton; 