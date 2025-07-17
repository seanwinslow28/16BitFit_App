/**
 * Lazy Screen Component
 * Handles lazy loading of screens with loading states
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedLoadingScreen, { LOADING_TYPES } from './AnimatedLoadingScreen';

const LazyScreen = ({ 
  component,
  loadingType = LOADING_TYPES.CHARACTER,
  loadingMessage = 'LOADING SCREEN...',
  fallback = null,
  ...props 
}) => {
  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import the component
    if (typeof component === 'function') {
      // If it's already a function (lazy loaded), use it directly
      setComponent(() => component);
      setIsLoading(false);
    } else if (typeof component === 'string') {
      // If it's a string path, dynamically import
      const loadComponent = async () => {
        try {
          const module = await import(component);
          setComponent(() => module.default || module);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to load component:', error);
          setIsLoading(false);
        }
      };
      loadComponent();
    } else {
      // If it's already a component, use it
      setComponent(() => component);
      setIsLoading(false);
    }
  }, [component]);

  if (isLoading || !Component) {
    return fallback || (
      <AnimatedLoadingScreen
        type={loadingType}
        message={loadingMessage}
        duration={null} // Keep showing until component loads
      />
    );
  }

  return (
    <Suspense
      fallback={
        fallback || (
          <AnimatedLoadingScreen
            type={loadingType}
            message={loadingMessage}
            duration={null}
          />
        )
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

// Helper to create lazy loaded screens with proper loading states
export const createLazyScreen = (
  importFunc,
  loadingType = LOADING_TYPES.CHARACTER,
  loadingMessage = 'LOADING...'
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <LazyScreen
      component={LazyComponent}
      loadingType={loadingType}
      loadingMessage={loadingMessage}
      {...props}
    />
  );
};

// Pre-configured lazy screens for common screens
export const LazyScreens = {
  Battle: createLazyScreen(
    () => import('../screens/BattleScreen'),
    LOADING_TYPES.BATTLE,
    'PREPARING BATTLE...'
  ),
  Stats: createLazyScreen(
    () => import('../screens/StatsScreen'),
    LOADING_TYPES.PROGRESS,
    'LOADING STATS...'
  ),
  Social: createLazyScreen(
    () => import('../screens/SocialScreen'),
    LOADING_TYPES.DOTS,
    'CONNECTING...'
  ),
  Customize: createLazyScreen(
    () => import('../screens/CharacterCustomizationScreen'),
    LOADING_TYPES.CHARACTER,
    'LOADING WARDROBE...'
  ),
};

export default LazyScreen;