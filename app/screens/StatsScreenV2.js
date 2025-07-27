import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCharacter } from '../contexts/CharacterContext';

const StatsScreenV2 = () => {
  const { characterStats, totalWorkouts, streak, achievements } = useCharacter();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>STATS</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>HEALTH</Text>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: `${characterStats?.health || 100}%`, backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.statValue}>{characterStats?.health || 100}/100</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>STRENGTH</Text>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: `${characterStats?.strength || 50}%`, backgroundColor: '#FF6B6B' }]} />
          </View>
          <Text style={styles.statValue}>{characterStats?.strength || 50}/100</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>STAMINA</Text>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: `${characterStats?.stamina || 50}%`, backgroundColor: '#4ECDC4' }]} />
          </View>
          <Text style={styles.statValue}>{characterStats?.stamina || 50}/100</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>SPEED</Text>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: `${characterStats?.speed || 50}%`, backgroundColor: '#FFD700' }]} />
          </View>
          <Text style={styles.statValue}>{characterStats?.speed || 50}/100</Text>
        </View>
      </View>
      
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>LEVEL</Text>
        <Text style={styles.levelValue}>{characterStats?.level || 1}</Text>
        <Text style={styles.expLabel}>EXP: {characterStats?.experience || 0}</Text>
      </View>
    </ScrollView>
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statLabel: {
    width: 100,
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  statBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#0F380F',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 10,
  },
  statValue: {
    width: 80,
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    textAlign: 'right',
  },
  levelContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  levelLabel: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    marginBottom: 10,
  },
  levelValue: {
    fontSize: 36,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 10,
  },
  expLabel: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
});

export default StatsScreenV2;