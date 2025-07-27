import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SocialScreenV2 = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SOCIAL</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoon}>COMING SOON!</Text>
        <Text style={styles.subtitle}>Connect with friends</Text>
        <Text style={styles.subtitle}>Share achievements</Text>
        <Text style={styles.subtitle}>Battle other players</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 20,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginVertical: 5,
    opacity: 0.7,
  },
});

export default SocialScreenV2;