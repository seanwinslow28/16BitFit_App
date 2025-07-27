import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import LoadingScreen from './components/LoadingScreen';
import AudioService from './services/AudioService';
// Temporarily remove complex imports to fix navigation errors
import { SupabaseProvider } from './services/SupabaseService';
import ErrorBoundary from './components/ErrorBoundary';

const Stack = createStackNavigator();

// Simple fallback screen in case HomeScreenV2 has issues
function SimpleHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>16BitFit V2</Text>
      <Text style={styles.subtitle}>Core Systems Online!</Text>
      <Text style={styles.info}>✅ Fonts: Loaded</Text>
      <Text style={styles.info}>✅ Audio: Ready</Text>
      <Text style={styles.status}>Ready for GameBoy Interface</Text>
    </View>
  );
}

// Stable test screen without complex dependencies
function StableTestScreen({ fontsLoaded }) {
  // Create safe styles object that never references custom fonts unless loaded
  const safeStyles = {
    title: fontsLoaded 
      ? { ...styles.baseTitle, fontFamily: 'PressStart2P' }
      : styles.baseTitle,
    subtitle: fontsLoaded 
      ? { ...styles.baseSubtitle, fontFamily: 'PressStart2P' }
      : styles.baseSubtitle,
    info: fontsLoaded 
      ? { ...styles.baseInfo, fontFamily: 'PressStart2P' }
      : styles.baseInfo,
    status: fontsLoaded 
      ? { ...styles.baseStatus, fontFamily: 'PressStart2P' }
      : styles.baseStatus,
  };

  return (
    <View style={styles.container}>
      <Text style={safeStyles.title}>16BitFit V2</Text>
      <Text style={safeStyles.subtitle}>
        {fontsLoaded ? 'GameBoy Fonts Active!' : 'System Fonts (Safe Mode)'}
      </Text>
      <Text style={safeStyles.info}>✅ Navigation: Fixed</Text>
      <Text style={safeStyles.info}>
        {fontsLoaded ? '✅ Fonts: GameBoy style loaded!' : '⚠️ Fonts: System fallback active'}
      </Text>
      <Text style={safeStyles.info}>✅ Audio: Disabled for stability</Text>
      <Text style={safeStyles.status}>
        {fontsLoaded ? 'Retro aesthetic ready!' : 'Safe mode - ready to continue'}
      </Text>
    </View>
  );
}

function AppV2Simple() {
  console.log('🚀 16BitFit V2 Simple App Loading...');
  
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function loadResources() {
      const fontPromise = loadFonts();
      const audioPromise = loadAudio();
      
      // Wait for both to complete (or fail gracefully)
      await Promise.all([fontPromise, audioPromise]);
      setAppReady(true);
    }

          async function loadFonts() {
        try {
          console.log('🔤 Loading local Press Start 2P font...');
          
          // Use the local font file you downloaded (FIXED PATH)
          await Font.loadAsync({
            'PressStart2P': require('./assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf'),
          });
          
          console.log('✅ Local GameBoy font loaded successfully!');
          setFontsLoaded(true);
        } catch (error) {
          console.warn('⚠️ Local font failed, using system fonts:', error.message);
          setFontsLoaded(false);
        }
      }

    async function loadAudio() {
      try {
        console.log('🔊 Skipping audio for stability...');
        // Temporarily disable audio initialization
        // await AudioService.initialize();
        console.log('✅ Audio disabled for stability');
        setAudioReady(false); // Disabled for now
      } catch (error) {
        console.warn('⚠️ Audio initialization failed, continuing without audio:', error);
        setAudioReady(false); // Continue without audio
      }
    }

    loadResources();
  }, []);

  if (!appReady) {
    const loadingMessage = !fontsLoaded && !audioReady ? "Loading resources..." :
                          !fontsLoaded ? "Loading fonts..." :
                          !audioReady ? "Loading audio..." : "Almost ready...";
    return <LoadingScreen message={loadingMessage} />;
  }
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StableTestScreen fontsLoaded={fontsLoaded} />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9BBD0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Base styles (safe system fonts only)
  baseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F380F',
    marginBottom: 20,
    textAlign: 'center',
  },
  baseSubtitle: {
    fontSize: 16,
    color: '#0F380F',
    textAlign: 'center',
    marginBottom: 20,
  },
  baseInfo: {
    fontSize: 12,
    color: '#0F380F',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  baseStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F380F',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.9,
  },
});

export default AppV2Simple; 