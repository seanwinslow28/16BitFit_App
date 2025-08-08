import 'react-native-gesture-handler'; // Must be at the top
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { preloadAssets } from './utils/assetPreloader';

// Screens
import HomeScreenV2 from './screens/HomeScreenV2';
import BattleScreenV2 from './screens/BattleScreenV2';
import WorkoutSelectionV2 from './screens/WorkoutSelectionV2';
import FoodSelectionScreenV2 from './screens/FoodSelectionScreenV2';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';
import QuickActivityLogScreen from './screens/QuickActivityLogScreen';
import { 
  GuestOnboardingScreen,
  OnboardingWelcomeScreen,
  OnboardingAuthScreen,
  OnboardingCharacterCreationScreen,
  OnboardingHealthScreen
} from './screens/onboarding';

// Import V2 screens that we know exist
import StatsScreenV2 from './screens/StatsScreenV2';
import SocialScreenV2 from './screens/SocialScreenV2';
import BattleMenuScreen from './screens/BattleMenuScreen';
import SettingsScreen from './screens/SettingsScreen';

// Components
import ControlDeckTabBar from './components/ControlDeckTabBar';

// Services
import { SupabaseProvider } from './services/SupabaseService';
import AudioService from './services/AudioService';
import PostHogService from './services/PostHogService';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import OnboardingManager from './services/OnboardingManager';

// Contexts
import { CharacterProvider } from './contexts/CharacterContext';

// Theme
import { navigationTheme, statusBarTheme } from './constants/Theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Tab navigator for main screens
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <ControlDeckTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreenV2}
        options={{ tabBarLabel: 'HOME' }}
      />
      <Tab.Screen 
        name="BattleTab" 
        component={BattleStackNavigator}
        options={{ tabBarLabel: 'BATTLE' }}
      />
      <Tab.Screen 
        name="StatsTab" 
        component={StatsScreenV2}
        options={{ tabBarLabel: 'STATS' }}
      />
      <Tab.Screen 
        name="SocialTab" 
        component={SocialScreenV2}
        options={{ tabBarLabel: 'SOCIAL' }}
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

// BattleMenuScreen has been moved to ./screens/BattleMenuScreen.js

// Root stack navigator
function RootNavigator() {
  const [needsOnboarding, setNeedsOnboarding] = useState(null);

  useEffect(() => {
    // Check if user needs onboarding
    OnboardingManager.initialize().then(() => {
      setNeedsOnboarding(OnboardingManager.needsOnboarding());
    });
  }, []);

  if (needsOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#9BBD0F' },
      }}
      initialRouteName={needsOnboarding ? "GuestOnboarding" : "Main"}
    >
      <Stack.Screen name="GuestOnboarding" component={GuestOnboardingScreen} />
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingAuth" component={OnboardingAuthScreen} />
      <Stack.Screen name="OnboardingCharacterCreation" component={OnboardingCharacterCreationScreen} />
      <Stack.Screen name="OnboardingHealth" component={OnboardingHealthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="BattleMenu" component={BattleMenuScreen} />
      <Stack.Screen name="WorkoutSelection" component={WorkoutSelectionV2} />
      <Stack.Screen name="QuickActivityLog" component={QuickActivityLogScreen} />
      <Stack.Screen name="FoodSelection" component={FoodSelectionScreenV2} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <Stack.Screen name="Stats" component={StatsScreenV2} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function AppV2() {
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
            <StatusBar 
              barStyle={statusBarTheme.style} 
              backgroundColor={statusBarTheme.backgroundColor} 
            />
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </CharacterProvider>
        </SupabaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default AppV2;