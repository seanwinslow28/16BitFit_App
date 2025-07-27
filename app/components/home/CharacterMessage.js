import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CharacterMessage = React.memo(({ characterStats }) => {
  const message = useMemo(() => {
    if (!characterStats) return "Let's get started!";
    
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Ready for morning training?";
    } else if (hour < 17) {
      return "Time for an afternoon workout!";
    } else {
      return "Evening battle time!";
    }
  }, [characterStats]);

  return (
    <View style={styles.messageBubble}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  messageBubble: {
    backgroundColor: '#0F380F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
  },
  messageText: {
    color: '#9BBD0F',
    fontSize: 10,
    fontFamily: 'PressStart2P',
    textAlign: 'center',
  },
});

export default CharacterMessage;