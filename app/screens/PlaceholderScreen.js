import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ route }) => {
  const screenName = route?.name || 'Screen';
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{screenName}</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    opacity: 0.7,
  },
});

export default PlaceholderScreen;