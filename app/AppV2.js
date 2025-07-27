import 'react-native-gesture-handler'; // Must be at the top
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { preloadAssets } from './utils/assetPreloader';

// Screens
import HomeScreenV2 from './screens/HomeScreenV2';
import BattleScreenV2 from './screens/BattleScreenV2';
import WorkoutSelectionV2 from './screens/WorkoutSelectionV2';
import FoodSelectionScreenV2 from './screens/FoodSelectionScreenV2';
import PlaceholderScreen from './screens/PlaceholderScreen';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';

// Import V2 screens that we know exist
import StatsScreenV2 from './screens/StatsScreenV2';
import SocialScreenV2 from './screens/SocialScreenV2';

// Services
import { SupabaseProvider } from './services/SupabaseService';
import AudioService from './services/AudioService';
import PostHogService from './services/PostHogService';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

// Contexts
import { CharacterProvider } from './contexts/CharacterContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Tab navigator for main screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0F380F',
          borderTopWidth: 2,
          borderTopColor: '#9BBD0F',
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#9BBD0F',
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'PressStart2P',
          fontSize: 10,
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreenV2}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="BattleTab" 
        component={BattleStackNavigator}
        options={{
          tabBarLabel: 'BATTLE',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '⚔️' : '🗡️'}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="StatsTab" 
        component={StatsScreenV2}
        options={{
          tabBarLabel: 'STATS',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '📊' : '📈'}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="SocialTab" 
        component={SocialScreenV2}
        options={{
          tabBarLabel: 'SOCIAL',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '🌐' : '👥'}</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack navigator for battle flow
function BattleStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BattleHome" component={BattleMenuScreen} />
      <Stack.Screen name="BattleScreen" component={BattleScreenV2} />
    </Stack.Navigator>
  );
}

// Simple battle menu screen
function BattleMenuScreen({ navigation }) {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#9BBD0F',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        fontSize: 24,
        fontFamily: 'PressStart2P',
        color: '#0F380F',
        marginBottom: 40,
      }}>
        BATTLE MODE
      </Text>
      
      <View style={{ gap: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#0F380F',
            paddingVertical: 20,
            paddingHorizontal: 40,
            borderRadius: 10,
          }}
          onPress={() => navigation.navigate('BattleScreen')}
        >
          <Text
            style={{
              color: '#9BBD0F',
              fontSize: 14,
              fontFamily: 'PressStart2P',
            }}
          >
            QUICK BATTLE
          </Text>
        </TouchableOpacity>
        
        <View
          style={{
            backgroundColor: '#556B2F',
            paddingVertical: 20,
            paddingHorizontal: 40,
            borderRadius: 10,
            opacity: 0.5,
          }}
        >
          <Text
            style={{
              color: '#9BBD0F',
              fontSize: 14,
              fontFamily: 'PressStart2P',
            }}
          >
            BOSS FIGHT
          </Text>
          <Text
            style={{
              color: '#9BBD0F',
              fontSize: 8,
              fontFamily: 'PressStart2P',
              marginTop: 5,
            }}
          >
            COMING SOON
          </Text>
        </View>
      </View>
    </View>
  );
}

// Root stack navigator
function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#9BBD0F' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="WorkoutSelection" component={WorkoutSelectionV2} />
      <Stack.Screen name="FoodSelection" component={FoodSelectionScreenV2} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    </Stack.Navigator>
  );
}

function AppV2() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appReady, setAppReady] = useState(false);
  
  // Log to verify new app is running
  console.log('16BitFit V2 App Loading...');

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts from local file
        await Font.loadAsync({
          'PressStart2P': require('./assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf'),
        });
        
        // Preload image assets
        await preloadAssets();
        
        // Initialize audio
        try {
          await AudioService.initialize();
        } catch (audioError) {
          console.warn('Audio initialization failed, continuing without audio:', audioError);
        }
        
        // Initialize PostHog analytics
        try {
          await PostHogService.initialize();
        } catch (analyticsError) {
          console.warn('PostHog initialization failed, continuing without analytics:', analyticsError);
        }
        
        setFontsLoaded(true);
        setAppReady(true);
      } catch (e) {
        console.error('❌ Error loading app resources:', e);
        setAppReady(true); // Continue anyway
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SupabaseProvider>
          <CharacterProvider>
            <StatusBar barStyle="light-content" backgroundColor="#0F380F" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CharacterProvider>
        </SupabaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default AppV2;