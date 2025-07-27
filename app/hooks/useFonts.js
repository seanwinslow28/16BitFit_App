/**
 * Custom hook for loading Press Start 2P font
 * Provides retro GameBoy-style typography
 */

import * as Font from 'expo-font';
import { useState, useEffect } from 'react';
import { FONT_CONFIG } from '../constants/Fonts';

export const usePressStart2P = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log('Starting local font loading...');
        await Font.loadAsync(FONT_CONFIG);
        console.log('Local fonts loaded successfully');
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error loading Press Start 2P font:', err);
        setError(err);
        // Set fontsLoaded to true anyway to prevent app from hanging
        setFontsLoaded(true);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('Font loading timeout - using fallback fonts');
        setFontsLoaded(true);
      }
    }, 5000);

    loadFonts();

    return () => clearTimeout(timeoutId);
  }, []);

  return { fontsLoaded, error };
};

// Main hook for component usage
export const useFonts = () => {
  return usePressStart2P();
};

// Export default hook
export default usePressStart2P;

// Font style helper
// Safe pixel font that works regardless of font loading status
export const pixelFont = {
  fontFamily: 'PressStart2P', // Will gracefully fallback to system font if not loaded
  letterSpacing: 1,
};