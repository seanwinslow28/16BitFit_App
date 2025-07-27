import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatBar = React.memo(({ label, value, max, color }) => {
  const percentage = (value / max) * 100;
  
  return (
    <View style={styles.statBar}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarContainer}>
        <View 
          style={[
            styles.statBarFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
});

const StatsDisplay = React.memo(({ characterStats }) => {
  return (
    <View style={styles.container}>
      <StatBar 
        label="HP" 
        value={characterStats?.health || 100} 
        max={100} 
        color="#4CAF50" 
      />
      <StatBar 
        label="STR" 
        value={characterStats?.strength || 50} 
        max={100} 
        color="#FF6B6B" 
      />
      <StatBar 
        label="STA" 
        value={characterStats?.stamina || 50} 
        max={100} 
        color="#4ECDC4" 
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  statLabel: {
    width: 30,
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#0F380F',
    marginHorizontal: 5,
    borderRadius: 4,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    width: 30,
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
    textAlign: 'right',
  },
});

export default StatsDisplay;