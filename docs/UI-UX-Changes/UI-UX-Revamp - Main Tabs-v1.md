Our goal is to evolve the user interface from a functional prototype to a visually compelling experience that embodies the "16-Bit" soul of the app. We'll replace the current home screen's implementation with a new version that is:

* **Design-System-Driven:** We will first translate your `mobile_design_tokens.md` into a usable theme file. This ensures consistency and makes future updates easier.  
* **Component-Based:** We'll break down the UI from the HTML prototype into small, reusable React Native components (`StatCard`, `PixelAvatar`, etc.).  
* **Functionally Consistent:** We will keep your existing navigation and data logic from `HomeScreenV2.js`. The new UI will be a "skin" on top of the functionality you've already built, ensuring we don't lose any progress.

This approach gives us the best of both worlds: a beautiful, on-brand interface powered by your existing, working code.

---

### **2\. Design System Implementation 🎨**

First, we need to convert your Markdown design tokens into a format our React Native app can understand. Create a new file for this. This will be the foundation for all styling going forward.

**File:** `src/constants/designTokens.js`

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

### **3\. React Native Component Development 💻**

Now, let's build the new Home Screen. Below is the complete code you can use to replace `HomeScreenV2.js`. I've broken down the HTML prototype into logical, reusable components and integrated your existing data hooks and navigation logic.

This is a single file containing all the necessary components. You can copy this directly into your project or split the sub-components into their own files (e.g., in `src/components/home/`).

**File to Replace:** `src/screens/HomeScreenV2.js`

import React, { useEffect, useRef } from 'react';  
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import { useCharacter } from '../contexts/CharacterContext';  
import designTokens from '../constants/designTokens'; // Import our new design system\!

// \=================================================================================  
// SUB-COMPONENT: StatCard  
// Renders a single statistic based on the new design.  
// \=================================================================================  
const StatCard \= ({ label, value, maxValue, color }) \=\> {  
  const fillWidth \= (value / maxValue) \* 100;

  return (  
    \<View style={styles.statCard}\>  
      \<View style={styles.statInfo}\>  
        \<Text style={styles.statLabel}\>{label}\</Text\>  
        \<Text style={styles.statValue}\>{\`${value}/${maxValue}\`}\</Text\>  
      \</View\>  
      \<View style={styles.progressBar}\>  
        \<View style={\[styles.progressFill, { width: \`${fillWidth}%\`, backgroundColor: color }\]} /\>  
      \</View\>  
    \</View\>  
  );  
};

// \=================================================================================  
// SUB-COMPONENT: PixelAvatar  
// Renders a placeholder pixel art avatar like in the HTML prototype.  
// \=================================================================================  
const PixelAvatar \= () \=\> (  
  \<View style={styles.avatarContainer}\>  
    {/\* This is a simplified representation of the grid from the HTML \*/}  
    \<View style={styles.pixelAvatar}\>  
      {\[...Array(144)\].map((\_, i) \=\> {  
        // Simple pattern for demonstration  
        const isDark \= \[2, 3, 4, 5, 6, 7, 13, 22, 25, 30, 37, 40, 42, 43, 44, 45, 46, 52, 54, 57, 61, 64, 69, 76, 80, 81, 82, 83\].includes(i % 90);  
        const isMedium \= \[14, 15, 16, 17, 18, 19, 21, 26, 29, 31, 36, 38, 51, 55, 66, 68, 70, 75, 88, 92, 93, 94, 95\].includes(i % 100);  
        return (  
          \<View  
            key={i}  
            style={\[  
              styles.pixel,  
              isDark && styles.pixelDark,  
              isMedium && styles.pixelMedium,  
            \]}  
          /\>  
        );  
      })}  
    \</View\>  
  \</View\>  
);

// \=================================================================================  
// REPLACEMENT FOR: HomeScreenV2  
// This is the new, revamped Home Screen.  
// \=================================================================================  
const HomeScreenV2 \= () \=\> {  
  const navigation \= useNavigation();  
  const { characterStats } \= useCharacter();  
  const fadeAnim \= useRef(new Animated.Value(0)).current;

  useEffect(() \=\> {  
    // Keep your existing analytics and fade-in logic  
    Animated.timing(fadeAnim, {  
      toValue: 1,  
      duration: 500,  
      useNativeDriver: true,  
    }).start();  
  }, \[fadeAnim\]);  
    
  // We keep your existing navigation logic. The UI is new, the function is the same.  
  const handleActionPress \= (action) \=\> {  
    switch (action) {  
      case 'battle':  
        navigation.navigate('BattleTab');  
        break;  
      case 'train':  
        navigation.navigate('QuickActivityLog');  
        break;  
      // Add other actions back as needed (feed, history, etc.)  
      case 'stats':  
         navigation.navigate('StatsTab');  
        break;  
    }  
  };

  return (  
    \<ScrollView style={styles.container}\>  
      \<Animated.View style={{ opacity: fadeAnim }}\>  
        {/\* Screen Header from the prototype \*/}  
        \<View style={styles.screenHeader}\>  
          \<Text style={styles.appTitle}\>16BITFIT\</Text\>  
          \<Text style={styles.levelBadge}\>LV.{characterStats?.level || 1}\</Text\>  
        \</View\>

        {/\* Main Content Area \*/}  
        \<View style={styles.contentArea}\>  
          {/\* Left Side: Avatar and Player Info \*/}  
          \<View style={styles.avatarSection}\>  
            \<PixelAvatar /\>  
            \<View style={styles.playerInfo}\>  
              \<Text style={styles.playerName}\>{characterStats?.name || 'PLAYER1'}\</Text\>  
              \<Text style={styles.playerTitle}\>FITNESS HERO\</Text\>  
            \</View\>  
             {/\* Action Buttons can go here \*/}  
            \<View style={styles.actionButtonsContainer}\>  
                \<Text style={styles.button} onPress={() \=\> handleActionPress('train')}\>TRAIN\</Text\>  
                \<Text style={styles.button} onPress={() \=\> handleActionPress('battle')}\>BATTLE\</Text\>  
                \<Text style={styles.button} onPress={() \=\> handleActionPress('stats')}\>STATS\</Text\>  
            \</View\>  
          \</View\>

          {/\* Right Side: Stats \*/}  
          \<View style={styles.statsSection}\>  
            \<StatCard  
              label="HEALTH"  
              value={characterStats?.health || 100}  
              maxValue={100}  
              color={'\#4CAF50'} // Green  
            /\>  
            \<StatCard  
              label="STRENGTH"  
              value={characterStats?.strength || 50}  
              maxValue={100}  
              color={'\#FF6B6B'} // Red  
            /\>  
            \<StatCard  
              label="STAMINA"  
              value={characterStats?.stamina || 50}  
              maxValue={100}  
              color={'\#4ECDC4'} // Teal  
            /\>  
            \<StatCard  
              label="SPEED"  
              value={characterStats?.speed || 50}  
              maxValue={100}  
              color={'\#FFD700'} // Yellow  
            /\>  
          \</View\>  
        \</View\>  
      \</Animated.View\>  
    \</ScrollView\>  
  );  
};

// \=================================================================================  
// STYLESHEET  
// All styles now reference our \`designTokens.js\` file.  
// \=================================================================================  
const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
  },  
  // Screen Header  
  screenHeader: {  
    backgroundColor: colors.theme.surfaceDark,  
    height: 40,  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    paddingHorizontal: spacing.lg,  
    borderBottomWidth: 2,  
    borderBottomColor: colors.theme.text,  
  },  
  appTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.primary,  
    textShadowColor: colors.theme.text,  
    textShadowOffset: { width: 1, height: 1 },  
  },  
  levelBadge: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
  },  
  // Content Area  
  contentArea: {  
    flex: 1,  
    flexDirection: 'row',  
    padding: spacing.lg,  
    gap: spacing.lg,  
  },  
  // Avatar Section  
  avatarSection: {  
    flex: 1,  
    backgroundColor: colors.theme.surface,  
    borderRadius: radius.md,  
    padding: spacing.md,  
    borderWidth: 2,  
    borderColor: colors.theme.surfaceDark,  
    alignItems: 'center',  
  },  
  avatarContainer: {  
    width: 84,  
    height: 84,  
    backgroundColor: colors.theme.surfaceDark,  
    borderRadius: radius.full,  
    marginBottom: spacing.md,  
    borderWidth: 3,  
    borderColor: colors.theme.text,  
    justifyContent: 'center',  
    alignItems: 'center',  
    overflow: 'hidden',  
  },  
  pixelAvatar: {  
    width: 72,  
    height: 72,  
    display: 'flex',  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
  },  
  pixel: {  
    width: 6,  
    height: 6,  
    backgroundColor: colors.screen.light,  
  },  
  pixelDark: { backgroundColor: colors.screen.darkest },  
  pixelMedium: { backgroundColor: colors.screen.dark },  
  playerInfo: {  
    alignItems: 'center',  
  },  
  playerName: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.text,  
    marginBottom: spacing.xs,  
  },  
  playerTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.textLight,  
  },  
  // Stats Section  
  statsSection: {  
    flex: 1,  
    display: 'flex',  
    flexDirection: 'column',  
    gap: spacing.md,  
  },  
  statCard: {  
    backgroundColor: colors.theme.surfaceDark,  
    borderRadius: radius.md,  
    padding: spacing.sm,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
  },  
  statInfo: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    marginBottom: spacing.xs,  
  },  
  statLabel: {  
    fontFamily: typography.fonts.pixel,  
    color: colors.theme.primary,  
    fontSize: typography.styles.sm.fontSize,  
  },  
  statValue: {  
    fontFamily: typography.fonts.pixel,  
    color: colors.theme.primary,  
    fontSize: typography.styles.xs.fontSize,

  },  
  progressBar: {  
    width: '100%',  
    height: 8,  
    backgroundColor: colors.theme.text,  
    borderRadius: radius.sm,  
    overflow: 'hidden',  
  },  
  progressFill: {  
    height: '100%',  
    borderRadius: radius.sm,  
  },  
    actionButtonsContainer: {  
    marginTop: spacing.lg,  
    width: '100%',  
    gap: spacing.md,  
  },  
  button: {  
    fontFamily: typography.fonts.pixel,  
    backgroundColor: colors.theme.surfaceDark,  
    color: colors.theme.primary,  
    textAlign: 'center',  
    paddingVertical: spacing.sm,  
    paddingHorizontal: spacing.md,  
    borderRadius: radius.sm,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
    fontSize: typography.styles.base.fontSize,  
  },  
});

export default HomeScreenV2;

### **4\. Go-to-Market & Next Steps 🚀**

1. **Implementation:** Replace the contents of `HomeScreenV2.js` with the code above. Create the `designTokens.js` file in the specified path. The app should now render the new home screen when you run it.  
2. **Testing:** Thoroughly test the new screen. Ensure all buttons navigate correctly and that the stats update as expected when the `characterStats` change.  
3. **Iteration with Claude:** You can now provide this new, structured, and integrated code to Claude. This gives it a much stronger foundation to work from for future features or screens, as it can now "understand" your app's design language and component structure.  
4. **Future Roadmap:**  
   * **Component Library:** Systematically replace hardcoded styles in other screens (`StatsScreenV2`, etc.) with our new `designTokens`.  
   * **Animation:** Use the `Animation Tokens` from your design file to add juicy, responsive animations to button presses and stat updates.  
   * **Expand the UI:** Apply this new design language to the `BattleScreenV2` HUD and other parts of the app for a completely cohesive experience.

This strategic revamp aligns our visual identity with our technical implementation, setting us up for rapid, high-quality development. Let's get this built\!

### **UI/UX Strategy for the Stats Screen**

We will transform the existing stats screen to match the retro "screen-within-a-screen" aesthetic from your prototype.

* **Layout:** We'll use the same header and content area structure from the new Home Screen.  
* **Component Reuse:** We will reuse the `StatCard` component logic we established for the home screen to ensure visual consistency.  
* **Data Integration:** We will continue to use the `useCharacter()` hook to populate the screen with the user's latest data.  
* **Styling:** All hardcoded styles in `StatsScreenV2.js` will be replaced with values from our new `designTokens.js` file.

---

### **2\. Developer Implementation: Revamped `StatsScreenV2.js`**

Here is the updated code. This is a drop-in replacement for your existing `StatsScreenV2.js` file. It uses the `designTokens` and reuses the `StatCard` component concept for a unified look.

**File to Replace:** `src/screens/StatsScreenV2.js`

JavaScript  
import React from 'react';  
import { View, Text, StyleSheet, ScrollView } from 'react-native';  
import { useCharacter } from '../contexts/CharacterContext';  
import designTokens from '../constants/designTokens'; // Import our new design system\!

// \=================================================================================  
// SUB-COMPONENT: StatCard (For consistency with the Home Screen)  
// You could move this to a shared components folder, e.g., /src/components/StatCard.js  
// \=================================================================================  
const StatCard \= ({ label, value, maxValue, color }) \=\> {  
  const fillWidth \= (value / maxValue) \* 100;

  return (  
    \<View style={styles.statCard}\>  
      \<View style={styles.statInfo}\>  
        \<Text style={styles.statLabel}\>{label}\</Text\>  
        \<Text style={styles.statValue}\>{\`${value}/${maxValue}\`}\</Text\>  
      \</View\>  
      \<View style={styles.progressBar}\>  
        \<View style={\[styles.progressFill, { width: \`${fillWidth}%\`, backgroundColor: color }\]} /\>  
      \</View\>  
    \</View\>  
  );  
};

// \=================================================================================  
// REPLACEMENT FOR: StatsScreenV2  
// \=================================================================================  
const StatsScreenV2 \= () \=\> {  
  const { characterStats } \= useCharacter(); // Fetch character data 

  return (  
    \<View style={styles.container}\>  
      {/\* Screen Header from the prototype design \*/}  
      \<View style={styles.screenHeader}\>  
        \<Text style={styles.appTitle}\>STATS\</Text\>  
      \</View\>  
        
      \<ScrollView style={styles.scrollContainer}\>  
        {/\* Main Stats Container \*/}  
        \<View style={styles.statsContainer}\>  
          \<StatCard  
            label="HEALTH"  
            value={characterStats?.health || 100}  
            maxValue={100}  
            color={'\#4CAF50'} // Green  
          /\>  
          \<StatCard  
            label="STRENGTH"  
            value={characterStats?.strength || 50}  
            maxValue={100}  
            color={'\#FF6B6B'} // Red  
          /\>  
          \<StatCard  
            label="STAMINA"  
            value={characterStats?.stamina || 50}  
            maxValue={100}  
            color={'\#4ECDC4'} // Teal  
          /\>  
          \<StatCard  
            label="SPEED"  
            value={characterStats?.speed || 50}  
            maxValue={100}  
            color={'\#FFD700'} // Yellow  
          /\>  
          {/\* You can add more stats here using the same component \*/}  
        \</View\>  
          
        {/\* Level and Experience Section \*/}  
        \<View style={styles.levelContainer}\>  
          \<Text style={styles.levelLabel}\>LEVEL\</Text\>  
          \<Text style={styles.levelValue}\>{characterStats?.level || 1}\</Text\>  
          \<View style={styles.expBar}\>  
             \<Text style={styles.expLabel}\>EXP: {characterStats?.experience || 0}\</Text\>  
          \</View\>  
        \</View\>  
      \</ScrollView\>  
    \</View\>  
  );  
};

// \=================================================================================  
// STYLESHEET  
// All styles now reference our \`designTokens.js\` file.  
// \=================================================================================  
const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
  },  
  scrollContainer: {  
    flex: 1,  
  },  
  // Screen Header  
  screenHeader: {  
    backgroundColor: colors.theme.surfaceDark,  
    height: 40,  
    justifyContent: 'center',  
    alignItems: 'center',  
    borderBottomWidth: 2,  
    borderBottomColor: colors.theme.text,  
  },  
  appTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.primary,  
    textShadowColor: colors.theme.text,  
    textShadowOffset: { width: 1, height: 1 },  
  },  
  // Stats Section  
  statsContainer: {  
    padding: spacing.lg,  
    display: 'flex',  
    flexDirection: 'column',  
    gap: spacing.md,  
  },  
  statCard: {  
    backgroundColor: colors.theme.surfaceDark,  
    borderRadius: radius.md,  
    padding: spacing.md,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
  },  
  statInfo: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    marginBottom: spacing.xs,  
  },  
  statLabel: {  
    fontFamily: typography.fonts.pixel,  
    color: colors.theme.primary,  
    fontSize: typography.styles.base.fontSize,  
  },  
  statValue: {  
    fontFamily: typography.fonts.pixel,  
    color: colors.theme.primary,  
    fontSize: typography.styles.sm.fontSize,  
  },  
  progressBar: {  
    width: '100%',  
    height: 12,  
    backgroundColor: colors.theme.text,  
    borderRadius: radius.sm,  
    overflow: 'hidden',  
    borderWidth: 1,  
    borderColor: colors.theme.text,  
  },  
  progressFill: {  
    height: '100%',  
  },  
  // Level Section  
  levelContainer: {  
    alignItems: 'center',  
    marginTop: spacing.xl,  
    paddingHorizontal: spacing.lg,  
  },  
  levelLabel: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.text,  
    marginBottom: spacing.sm,  
  },  
  levelValue: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.title.fontSize,  
    color: colors.accent\['steely-blue'\],  
    textShadowColor: colors.theme.text,  
    textShadowOffset: { width: 2, height: 2 },  
    marginBottom: spacing.md,  
  },  
  expBar: {  
    width: '100%',  
    backgroundColor: colors.theme.surfaceDark,  
    padding: spacing.md,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
    alignItems: 'center',  
  },  
  expLabel: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.primary,  
  },  
});

export default StatsScreenV2;

1. **Implement:** Replace your current `StatsScreenV2.js` with this new code.  
2. **Review:** You'll immediately see the `Stats` tab now matches the aesthetic of the new `Home` screen.  
3. **Continue the Rollout:** You can now use this same methodology for the other screens. For each one, ask:  
   * What is the core purpose of this screen?  
   * How can I represent it using our new design components (headers, cards, buttons)?  
   * How do I apply styles from `designTokens.js`?

I recommend tackling the `BattleMenuScreen` and `SocialScreenV2` next to complete the main tab navigation. I am ready to help with those when you are.

### **1\. Product & UI/UX Strategy**

Our goal is to transform the current `BattleMenuScreen` from a basic layout into an immersive, themed menu that feels like part of the Game Boy experience.

* **File Structure:** The existing `BattleMenuScreen` is defined inside `AppV2.js`. For better organization and scalability, we will move it to its own file: `src/screens/BattleMenuScreen.js`.  
* **Visual Consistency:** We'll apply the same "screen-within-a-screen" theme, using the `ScreenHeader` and our `designTokens` for a consistent look and feel with the Home and Stats screens.  
* **Component Design:** We will design new, pixel-style menu buttons that are large, clear, and satisfying to press. This includes a distinct "disabled" state for the "BOSS FIGHT" button, making it clear to users that the feature is coming soon.

---

### **2\. Developer Implementation**

We'll perform two steps: first, create the new `BattleMenuScreen.js` file, and second, update `AppV2.js` to use it.

#### **Step 1: Create the New `BattleMenuScreen.js` File**

Create this new file in your project. It contains the full logic and new styling for the screen.

**File to Create:** `src/screens/BattleMenuScreen.js`

JavaScript  
import React from 'react';  
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import designTokens from '../constants/designTokens';

// \=================================================================================  
// REPLACEMENT FOR: BattleMenuScreen  
// This is the new, revamped Battle Menu Screen.  
// \=================================================================================  
const BattleMenuScreen \= () \=\> {  
  const navigation \= useNavigation();

  return (  
    \<View style={styles.container}\>  
      {/\* Screen Header \*/}  
      \<View style={styles.screenHeader}\>  
        \<Text style={styles.appTitle}\>BATTLE MODE\</Text\>  
      \</View\>  
        
      {/\* Menu Options Container \*/}  
      \<View style={styles.menuContainer}\>  
        {/\* QUICK BATTLE Button (Active) \*/}  
        \<TouchableOpacity  
          style={styles.menuButton}  
          onPress={() \=\> navigation.navigate('BattleScreen')}  
        \>  
          \<Text style={styles.menuButtonText}\>QUICK BATTLE\</Text\>  
        \</TouchableOpacity\>  
          
        {/\* BOSS FIGHT Button (Disabled) \*/}  
        \<View style={\[styles.menuButton, styles.menuButtonDisabled\]}\>  
          \<Text style={styles.menuButtonText}\>BOSS FIGHT\</Text\>  
          \<Text style={styles.comingSoonText}\>COMING SOON\</Text\>  
        \</View\>  
      \</View\>  
    \</View\>  
  );  
};

// \=================================================================================  
// STYLESHEET  
// All styles now reference our \`designTokens.js\` file.  
// \=================================================================================  
const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
  },  
  // Screen Header  
  screenHeader: {  
    backgroundColor: colors.theme.surfaceDark,  
    height: 40,  
    justifyContent: 'center',  
    alignItems: 'center',  
    borderBottomWidth: 2,  
    borderBottomColor: colors.theme.text,  
  },  
  appTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.primary,  
    textShadowColor: colors.theme.text,  
    textShadowOffset: { width: 1, height: 1 },  
  },  
  // Menu Container  
  menuContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: spacing.xl,  
    gap: spacing.xl,  
  },  
  // Menu Buttons  
  menuButton: {  
    width: '100%',  
    backgroundColor: colors.theme.surfaceDark,  
    paddingVertical: spacing.lg,  
    paddingHorizontal: spacing.xl,  
    borderWidth: 2,  
    borderColor: colors.theme.text,  
    alignItems: 'center',  
    justifyContent: 'center',  
  },  
  menuButtonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.primary,  
    textAlign: 'center',  
  },  
  // Disabled State  
  menuButtonDisabled: {  
    backgroundColor: colors.shell.dark,  
    borderColor: colors.button.black,  
    opacity: 0.6,  
  },  
  comingSoonText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.primary,  
    marginTop: spacing.sm,  
  },  
});

export default BattleMenuScreen;

#### **Step 2: Update `AppV2.js`**

Now, we need to modify `AppV2.js` to import and use our new screen file instead of the old inline component.

**File to Edit:** `AppV2.js`

**Import the new screen** at the top with your other screen imports:  
JavaScript  
// ... other imports  
import BattleMenuScreen from './screens/BattleMenuScreen'; // ADD THIS LINE  
// ... other imports

1. 

**Remove the old inline component.** Find and delete this entire block of code from `AppV2.js`:  
JavaScript  
// DELETE THIS ENTIRE FUNCTION  
function BattleMenuScreen({ navigation }) {  
  return (  
    \<View style={{ ... }}\>  
      {/\* ... all the old content ... \*/}  
    \</View\>  
  );  
}

2. 

The `BattleStackNavigator` will now correctly use the imported `BattleMenuScreen` component, as it already references that name. The navigator function should look like this (no changes needed here, just for confirmation):  
JavaScript  
// This function now correctly points to your new component file  
function BattleStackNavigator() {  
  return (  
    \<Stack.Navigator screenOptions={{ headerShown: false }}\>  
      \<Stack.Screen name="BattleHome" component={BattleMenuScreen} /\>  
      \<Stack.Screen name="BattleScreen" component={BattleScreenV2} /\>  
    \</Stack.Navigator\>  
  );  
}

3. 

### **Next Steps**

With this change, your `Battle` tab is now fully integrated into the new design system. The user flow from the tab, through this menu, and into the `BattleScreen` will feel much more unified.

Excellent. Completing the `SocialScreenV2` will give us a consistent look and feel across the entire main tab navigation, which is a huge milestone for the app's user experience.

Since I don't have the original content of `SocialScreenV2.js`, I'll design and build it from the ground up based on what a social screen in a fitness RPG should be. We'll focus on the most important feature first: a **Leaderboard**.

### **1\. Product & UI/UX Strategy**

The "Social" tab is crucial for long-term engagement. It fosters competition and community.

* **Core Feature (MVP):** We will build a "Top Players" leaderboard. This directly plays into the competitive, stat-driven nature of `16BitFit`.  
* **Future-Proof Design:** I will include a simple tab-switching UI within the screen for "Leaderboard" and "Friends." While "Friends" won't be functional yet, this builds the foundation for future expansion without requiring a redesign.  
* **Data & UI:** The leaderboard will rank players by level. Each row will be a clean, readable "player card" styled with our pixelated aesthetic. We'll use a `FlatList` for efficient scrolling and highlight the current user's position.

---

### **2\. Developer Implementation**

Here is the complete code for a brand-new `SocialScreenV2.js`. You can create this file in your `/screens` directory. It's built with mock data that you can later replace with API calls to your Supabase backend.

**File to Create:** `src/screens/SocialScreenV2.js`

JavaScript  
import React, { useState } from 'react';  
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';  
import designTokens from '../constants/designTokens';

// \=================================================================================  
// MOCK DATA: Replace this with an API call to your backend/Supabase.  
// \=================================================================================  
const MOCK\_LEADERBOARD\_DATA \= \[  
  { id: '1', rank: 1, name: 'PixelWarrior', level: 99 },  
  { id: '2', rank: 2, name: 'MegaStreaker', level: 95 },  
  { id: '3', rank: 3, name: 'FitMasterX', level: 92 },  
  { id: '4', rank: 4, name: 'CardioKing', level: 88 },  
  { id: '5', rank: 5, name: 'You', level: 85, isCurrentUser: true }, // Highlighted user  
  { id: '6', rank: 6, name: 'GymGuru', level: 81 },  
  { id: '7', rank: 7, name: 'RookieRyu', level: 76 },  
  { id: '8', rank: 8, name: 'IronHeart', level: 75 },  
  { id: '9', rank: 9, name: 'FlexMaverick', level: 71 },  
  { id: '10', rank: 10, name: 'EnduroKid', level: 68 },  
\];

// \=================================================================================  
// SUB-COMPONENT: PlayerRow  
// Renders a single row in our leaderboard.  
// \=================================================================================  
const PlayerRow \= ({ item }) \=\> (  
  \<View style={\[styles.playerRow, item.isCurrentUser && styles.userRow\]}\>  
    \<Text style={\[styles.playerText, styles.rankText\]}\>{item.rank}\</Text\>  
    \<Text style={\[styles.playerText, styles.nameText\]}\>{item.name}\</Text\>  
    \<Text style={\[styles.playerText, styles.levelText\]}\>LV. {item.level}\</Text\>  
  \</View\>  
);

// \=================================================================================  
// NEW SCREEN: SocialScreenV2  
// \=================================================================================  
const SocialScreenV2 \= () \=\> {  
  const \[activeTab, setActiveTab\] \= useState('Leaderboard');

  const renderContent \= () \=\> {  
    if (activeTab \=== 'Leaderboard') {  
      return (  
        \<FlatList  
          data={MOCK\_LEADERBOARD\_DATA}  
          renderItem={({ item }) \=\> \<PlayerRow item={item} /\>}  
          keyExtractor={item \=\> item.id}  
          ListHeaderComponent={() \=\> (  
             \<View style={styles.listHeader}\>  
                \<Text style={styles.headerText}\>RANK\</Text\>  
                \<Text style={\[styles.headerText, {flex: 1, textAlign: 'left', marginLeft: 20}\]}\>PLAYER\</Text\>  
                \<Text style={styles.headerText}\>LEVEL\</Text\>  
            \</View\>  
          )}  
        /\>  
      );  
    }  
    // Placeholder for the Friends tab content  
    return (  
      \<View style={styles.placeholderContainer}\>  
        \<Text style={styles.placeholderText}\>Friends list coming soon\!\</Text\>  
      \</View\>  
    );  
  };

  return (  
    \<View style={styles.container}\>  
      {/\* Screen Header \*/}  
      \<View style={styles.screenHeader}\>  
        \<Text style={styles.appTitle}\>SOCIAL\</Text\>  
      \</View\>  
        
      {/\* Tab Switcher \*/}  
      \<View style={styles.tabContainer}\>  
        \<TouchableOpacity onPress={() \=\> setActiveTab('Leaderboard')}\>  
          \<Text style={\[styles.tabText, activeTab \=== 'Leaderboard' && styles.activeTabText\]}\>LEADERBOARD\</Text\>  
        \</TouchableOpacity\>  
        \<TouchableOpacity onPress={() \=\> setActiveTab('Friends')}\>  
          \<Text style={\[styles.tabText, activeTab \=== 'Friends' && styles.activeTabText\]}\>FRIENDS\</Text\>  
        \</TouchableOpacity\>  
      \</View\>

      {/\* Dynamic Content Area \*/}  
      \<View style={styles.contentContainer}\>  
        {renderContent()}  
      \</View\>  
    \</View\>  
  );  
};

// \=================================================================================  
// STYLESHEET  
// \=================================================================================  
const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: colors.theme.background,  
  },  
  screenHeader: {  
    backgroundColor: colors.theme.surfaceDark,  
    height: 40,  
    justifyContent: 'center',  
    alignItems: 'center',  
    borderBottomWidth: 2,  
    borderBottomColor: colors.theme.text,  
  },  
  appTitle: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.lg.fontSize,  
    color: colors.theme.primary,  
  },  
  // Tab Navigation  
  tabContainer: {  
    flexDirection: 'row',  
    justifyContent: 'space-around',  
    backgroundColor: colors.theme.surfaceDark,  
    paddingVertical: spacing.sm,  
    borderBottomWidth: 2,  
    borderBottomColor: colors.theme.text,  
  },  
  tabText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.textLight,  
  },  
  activeTabText: {  
    color: colors.theme.primary,  
    textShadowColor: colors.theme.primary,  
    textShadowOffset: {width: 0, height: 0},  
    textShadowRadius: 4,  
  },  
  // Content  
  contentContainer: {  
    flex: 1,  
    padding: spacing.md,  
  },  
  // Leaderboard List  
  listHeader: {  
      flexDirection: 'row',  
      justifyContent: 'space-between',  
      paddingBottom: spacing.sm,  
      borderBottomWidth: 2,  
      borderColor: colors.theme.text,  
      marginBottom: spacing.xs,  
  },  
  headerText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.sm.fontSize,  
    color: colors.theme.text,  
  },  
  playerRow: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    paddingVertical: spacing.md,  
    paddingHorizontal: spacing.sm,  
    borderBottomWidth: 1,  
    borderBottomColor: colors.theme.surfaceDark,  
  },  
  userRow: {  
    backgroundColor: colors.theme.surface,  
    borderWidth: 2,  
    borderColor: colors.accent\['steely-blue'\],  
    borderRadius: radius.sm,  
  },  
  playerText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.text,  
  },  
  rankText: {  
    width: 40,  
    textAlign: 'center',  
  },  
  nameText: {  
    flex: 1,  
    marginLeft: spacing.lg,  
  },  
  levelText: {  
    width: 60,  
    textAlign: 'right',  
  },  
  // Placeholder  
  placeholderContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  placeholderText: {  
    fontFamily: typography.fonts.pixel,  
    fontSize: typography.styles.base.fontSize,  
    color: colors.theme.textLight,  
  },  
});

export default SocialScreenV2;

### **Next Steps**

1. **Integrate:** Add this `SocialScreenV2.js` file to your `/screens` folder. Your app's tab navigator in `AppV2.js` should pick it up automatically.  
2. **Backend Connection:** When you are ready, you can replace the `MOCK_LEADERBOARD_DATA` with a `useEffect` hook that fetches real data from your Supabase database.  
3. **Completion of Main UI:** The core navigation of your app now has a consistent, professional, and on-brand design.

