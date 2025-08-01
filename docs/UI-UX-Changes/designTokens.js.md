// /src/constants/designTokens.js

/\*\*  
 \* 16BitFit Design System Tokens  
 \* Converted from mobile\_design\_tokens.md for use in React Native.  
 \* This system provides all the core values for colors, typography, spacing, etc.  
 \*/

// 🎨 1\. Color Tokens (Game Boy Authentic)  
export const colors \= {  
  // Primary Palette  
  shell: {  
    light: "\#C4BEBB",  
    dark: "\#545454",  
  },  
  button: {  
    black: "\#272929",  
    burgundy: "\#9A2257",  
  },  
  screen: {  
    border: "\#84D07D",  
    light: "\#9BBC0F",  
    medium: "\#8BAC0F",  
    dark: "\#306230",  
    darkest: "\#0F380F",  
  },  
  accent: {  
    "steely-blue": "\#5577AA",  
  },

  // Thematic Mapping  
  theme: {  
    primary: "\#9BBC0F",  
    primaryDark: "\#8BAC0F",  
    text: "\#0F380F",  
    textLight: "\#306230",  
    background: "\#9BBC0F",  
    surface: "\#8BAC0F",  
    surfaceDark: "\#306230",  
    accent: "\#9A2257",  
    success: "\#84D07D",  
  },  
};

// 📝 2\. Typography Scale  
export const typography \= {  
  fonts: {  
    pixel: "PressStart2P", // Make sure this matches the name in AppV2.js  
    fallback: "monospace",  
  },  
  // Mobile-Optimized Type Scale  
  styles: {  
    xs: { fontSize: 8, lineHeight: 12 },  
    sm: { fontSize: 10, lineHeight: 14 },  
    base: { fontSize: 12, lineHeight: 16 },  
    lg: { fontSize: 16, lineHeight: 20 },  
    xl: { fontSize: 20, lineHeight: 24 },  
    '2xl': { fontSize: 24, lineHeight: 28 },  
    title: { fontSize: 32, lineHeight: 36 },  
  },  
};

// 📏 3\. Spacing System  
export const spacing \= {  
  xs: 4,  
  sm: 8,  
  md: 12,  
  lg: 16,  
  xl: 20,  
  '2xl': 24,  
  '3xl': 32,  
};

// 🔲 4\. Border Radius  
export const radius \= {  
  none: 0,  
  sm: 4,  
  md: 8,  
  lg: 12,  
  full: 9999,  
};

// 🌊 5\. Shadows & Effects (for React Native)  
export const shadows \= {  
  md: {  
    shadowColor: colors.button.black,  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.3,  
    shadowRadius: 2,  
    elevation: 4,  
  },  
  lg: {  
    shadowColor: colors.button.black,  
    shadowOffset: { width: 0, height: 8 },  
    shadowOpacity: 0.3,  
    shadowRadius: 5,  
    elevation: 8,  
  },  
};

// A simple export to group them  
const designTokens \= {  
  colors,  
  typography,  
  spacing,  
  radius,  
  shadows,  
};

export default designTokens;  
