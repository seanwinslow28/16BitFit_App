import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 16BitFit</Text>
      <Text style={styles.subtitle}>Connected Successfully!</Text>
      <Text style={styles.description}>Ready for Figma Integration</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C76C8',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#92CC41',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
}); 