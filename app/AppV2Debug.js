import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';

const Tab = createBottomTabNavigator();

// Simple test screen
function TestScreen({ name }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name} Screen</Text>
    </View>
  );
}

function AppV2Debug() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'PressStart2P': require('./assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.error('Font loading failed:', e);
        setFontsLoaded(true); // Continue anyway
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#0F380F',
              borderTopWidth: 2,
              borderTopColor: '#9BBD0F',
            },
            tabBarActiveTintColor: '#FFD700',
            tabBarInactiveTintColor: '#9BBD0F',
            headerShown: false,
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={() => <TestScreen name="Home" />}
            options={{
              tabBarLabel: 'HOME',
            }}
          />
          <Tab.Screen 
            name="Battle" 
            component={() => <TestScreen name="Battle" />}
            options={{
              tabBarLabel: 'BATTLE',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#0F380F',
    fontFamily: 'PressStart2P',
  },
});

export default AppV2Debug;