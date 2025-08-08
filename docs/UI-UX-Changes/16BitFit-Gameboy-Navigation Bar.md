### **The "Thematic Integration" Strategy**

Instead of putting your app *inside* a picture of a Game Boy, we will deconstruct the Game Boy and infuse its iconic hardware elements *directly into your existing full-screen UI*. We'll take the parts—the gray plastic, the D-pad, the A/B buttons—and give them a functional purpose within your app.

Your question, "Do each component individually and layer it?" is spot on. That's precisely the plan.

Let's start with the most impactful place: the **bottom tab bar.**

We will replace the current, standard tab bar with a custom-built **"Control Deck"** component that is styled to look and feel like the bottom half of the Game Boy. This achieves everything you want:

* It **incorporates the hardware elements** (D-pad, A/B buttons).  
* It **keeps your main screens full-size** and immersive.  
* It gives a functional purpose to the classic controls.

---

### **Implementation: Building the "Control Deck" Tab Bar**

Here is the code to create this new experience. This involves two steps: creating the new custom tab bar component and then telling your main navigator in `AppV2.js` to use it.

#### **Step 1: Create the `ControlDeckTabBar.js` Component**

This new component will render our stylized buttons and handle navigation.

**File to Create:** `src/components/ControlDeckTabBar.js`

JavaScript  
import React from 'react';  
import { View, Text, Pressable, StyleSheet } from 'react-native';  
import designTokens from '../constants/designTokens';

// Simple icon components to represent the Game Boy buttons  
const AButton \= () \=\> \<View style={\[styles.buttonShape, styles.abButton\]}\>\<Text style={styles.buttonText}\>A\</Text\>\</View\>;  
const BButton \= () \=\> \<View style={\[styles.buttonShape, styles.abButton\]}\>\<Text style={styles.buttonText}\>B\</Text\>\</View\>;  
const HomeIcon \= () \=\> \<Text style={styles.iconText}\>🏠\</Text\>;  
const SocialIcon \= () \=\> \<Text style={styles.iconText}\>🌐\</Text\>;

const ControlDeckTabBar \= ({ state, descriptors, navigation }) \=\> {  
    return (  
        \<View style={styles.container}\>  
            {state.routes.map((route, index) \=\> {  
                const { options } \= descriptors\[route.key\];  
                const label \= options.tabBarLabel \!== undefined ? options.tabBarLabel : route.name;  
                const isFocused \= state.index \=== index;

                const onPress \= () \=\> {  
                    const event \= navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });  
                    if (\!isFocused && \!event.defaultPrevented) {  
                        navigation.navigate(route.name);  
                    }  
                };

                const getIcon \= () \=\> {  
                    if (route.name \=== 'HomeTab') return \<HomeIcon /\>;  
                    if (route.name \=== 'BattleTab') return \<AButton /\>;  
                    if (route.name \=== 'StatsTab') return \<BButton /\>;  
                    if (route.name \=== 'SocialTab') return \<SocialIcon /\>;  
                    return null;  
                }

                return (  
                    \<Pressable  
                        key={index}  
                        accessibilityRole="button"  
                        accessibilityState={isFocused ? { selected: true } : {}}  
                        onPress={onPress}  
                        style={styles.tabButton}  
                    \>  
                        \<View style={\[styles.iconContainer, isFocused && styles.focusedIconContainer\]}\>  
                            {getIcon()}  
                        \</View\>  
                        \<Text style={\[styles.label, { color: isFocused ? colors.theme.primary : colors.theme.textLight }\]}\>  
                            {label}  
                        \</Text\>  
                    \</Pressable\>  
                );  
            })}  
        \</View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flexDirection: 'row',  
        height: 85,  
        backgroundColor: colors.shell.dark, // The gray "shell" plastic color  
        borderTopWidth: 2,  
        borderColor: colors.button.black,  
        paddingBottom: 20, // For the home indicator area  
    },  
    tabButton: {  
        flex: 1,  
        justifyContent: 'center',  
        alignItems: 'center',  
        gap: spacing.xs,  
    },  
    iconContainer: {  
        justifyContent: 'center',  
        alignItems: 'center',  
        width: 50,  
        height: 50,  
        borderRadius: radius.full,  
    },  
    focusedIconContainer: {  
        backgroundColor: 'rgba(155, 188, 15, 0.2)', // A faint green glow  
    },  
    label: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.sm.fontSize,  
    },  
    iconText: {  
        fontSize: 28,  
    },  
    // Styles for the A/B button icons  
    buttonShape: {  
        width: 36,  
        height: 36,  
        borderRadius: radius.full,  
        justifyContent: 'center',  
        alignItems: 'center',  
        borderWidth: 2,  
    },  
    abButton: {  
        backgroundColor: colors.button.burgundy,  
        borderColor: colors.button.black,  
    },  
    buttonText: {  
        fontFamily: typography.fonts.pixel,  
        color: colors.shell.light,  
        fontSize: typography.styles.lg.fontSize,  
    }  
});

export default ControlDeckTabBar;

#### **Step 2: Update `AppV2.js` to Use the New Tab Bar**

Now, we just need to tell our `Tab.Navigator` to use our new `ControlDeckTabBar` component instead of the default one.

**File to Edit:** `AppV2.js`

JavaScript  
// ... other imports  
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  
import ControlDeckTabBar from './components/ControlDeckTabBar'; // 1\. IMPORT our new component

const Tab \= createBottomTabNavigator();

function MainTabs() {  
  return (  
    // 2\. ADD the \`tabBar\` prop and remove the old styling props  
    \<Tab.Navigator  
      tabBar={props \=\> \<ControlDeckTabBar {...props} /\>}  
      screenOptions={{ headerShown: false }}  
    \>  
      \<Tab.Screen   
        name="HomeTab"   
        component={HomeScreenV2}  
        options={{ tabBarLabel: 'HOME' }} // Keep labels for our component to use  
      /\>  
      \<Tab.Screen   
        name="BattleTab"   
        component={BattleStackNavigator}  
        options={{ tabBarLabel: 'BATTLE' }}  
      /\>  
      \<Tab.Screen   
        name="StatsTab"   
        component={StatsScreenV2}  
        options={{ tabBarLabel: 'STATS' }}  
      /\>  
      \<Tab.Screen   
        name="SocialTab"   
        component={SocialScreenV2}  
        options={{ tabBarLabel: 'SOCIAL' }}  
      /\>  
    \</Tab.Navigator\>  
  );  
}

// ... rest of the file

### **The Result**

By making this change, your app will now have a custom navigation bar at the bottom that looks and feels like the controls of the Game Boy, while your main content screens remain full-sized and immersive. This is the best of both worlds and perfectly executes the "Thematic Integration" strategy.

