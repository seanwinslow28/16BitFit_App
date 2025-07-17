/**
 * Custom hook for loading Press Start 2P font
 * Provides retro GameBoy-style typography
 */

import * as Font from 'expo-font';
import { useState, useEffect } from 'react';
import { 
  PressStart2P_400Regular 
} from '@expo-google-fonts/press-start-2p';

export const usePressStart2P = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'PressStart2P': PressStart2P_400Regular,
          'PressStart2P-Regular': PressStart2P_400Regular,
        });
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error loading Press Start 2P font:', err);
        setError(err);
        // Set fontsLoaded to true anyway to prevent app from hanging
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, error };
};

// Font style helper
export const pixelFont = {
  fontFamily: 'PressStart2P',
  letterSpacing: 1,
};