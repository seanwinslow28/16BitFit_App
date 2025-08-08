### **The Strategy: A Reusable "Stat Gain" Animation**

Instead of creating a one-off animation, we'll build a powerful, reusable component that can be triggered anytime the user's stats increase. This component will encapsulate the animation logic described in your style guide.

1. **Create `<StatGainAnimation />`:** A new component that takes the character's initial stats and the stat gains as props. It will display a modal-like sequence showing each stat bar filling up.  
2. **Animate Each Stat:** For each stat that increased, the component will:  
   * Display the stat name (e.g., "STRENGTH").  
   * Show an animated progress bar filling from the old value to the new value.  
   * Pop up a "+X" text to show the exact amount gained.  
   * End with a "flash" effect to feel impactful.  
3. **Integrate into a Flow:** We will replace the static success screen in `FoodSelectionScreenV2.js` with this new, dynamic component as a proof-of-concept.

---

### **2\. Developer Implementation**

This is a two-part implementation. First, we create the animation component itself. Second, we update `FoodSelectionScreenV2.js` to use it.

#### **Part 1: The New `<StatGainAnimation />` Component**

This component is complex, using React Native's `Animated` API to create the sequential animations.

**File to Create:** `src/components/StatGainAnimation.js`

JavaScript  
import React, { useEffect, useRef } from 'react';  
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';  
import designTokens from '../constants/designTokens';

const StatBar \= ({ label, from, to, duration }) \=\> {  
    const animatedValue \= useRef(new Animated.Value(from)).current;  
    const flashAnim \= useRef(new Animated.Value(0)).current;

    useEffect(() \=\> {  
        Animated.sequence(\[  
            Animated.timing(animatedValue, {  
                toValue: to,  
                duration: duration,  
                easing: Easing.out(Easing.ease),  
                useNativeDriver: false, // Required for width animation  
            }),  
            Animated.sequence(\[  
                Animated.timing(flashAnim, { toValue: 1, duration: 50, useNativeDriver: true }),  
                Animated.timing(flashAnim, { toValue: 0, duration: 250, useNativeDriver: true }),  
            \])  
        \]).start();  
    }, \[\]);

    const widthInterpolation \= animatedValue.interpolate({  
        inputRange: \[0, 100\],  
        outputRange: \['0%', '100%'\],  
    });

    const flashInterpolation \= flashAnim.interpolate({  
        inputRange: \[0, 1\],  
        outputRange: \[0, 0.4\],  
    });

    return (  
        \<View style={styles.statRow}\>  
            \<Text style={styles.statLabel}\>{label}\</Text\>  
            \<View style={styles.statBarBackground}\>  
                \<Animated.View style={\[styles.statBarFill, { width: widthInterpolation }\]} /\>  
                \<Animated.View style={\[styles.flashOverlay, { opacity: flashInterpolation }\]} /\>  
            \</View\>  
        \</View\>  
    );  
};

const StatGainAnimation \= ({ initialStats, gains, onComplete }) \=\> {  
    const fadeAnim \= useRef(new Animated.Value(0)).current;  
    const statAnims \= useRef(Object.keys(gains).map(() \=\> new Animated.Value(0))).current;

    useEffect(() \=\> {  
        Animated.sequence(\[  
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),  
            Animated.stagger(600, // Stagger each stat animation  
                Object.keys(gains).map((key, index) \=\>  
                    Animated.timing(statAnims\[index\], { toValue: 1, duration: 400, useNativeDriver: true })  
                )  
            ),  
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, delay: 500, useNativeDriver: true })  
        \]).start(onComplete); // Call the onComplete callback when all animations finish  
    }, \[\]);  
      
    return (  
        \<Animated.View style={\[styles.container, { opacity: fadeAnim }\]}\>  
            \<View style={styles.panel}\>  
                \<Text style={styles.title}\>STATS INCREASED\!\</Text\>  
                {Object.entries(gains).map((\[key, value\], index) \=\> {  
                    if (value \=== 0\) return null;  
                    const from \= initialStats\[key\] || 0;  
                    const to \= from \+ value;

                    return (  
                        \<Animated.View key={key} style={{ opacity: statAnims\[index\], transform: \[{ scale: statAnims\[index\] }\]}}\>  
                            \<StatBar label={key.toUpperCase()} from={from} to={to} duration={400} /\>  
                        \</Animated.View\>  
                    );  
                })}  
            \</View\>  
        \</Animated.View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        ...StyleSheet.absoluteFillObject,  
        backgroundColor: 'rgba(0,0,0,0.75)',  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    panel: {  
        width: '90%',  
        backgroundColor: colors.theme.text,  
        borderRadius: radius.md,  
        padding: spacing.lg,  
        borderWidth: 2,  
        borderColor: colors.theme.primary,  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.lg.fontSize,  
        color: colors.accent\['steely-blue'\],  
        textAlign: 'center',  
        marginBottom: spacing.lg,  
    },  
    statRow: {  
        marginBottom: spacing.md,  
    },  
    statLabel: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.primary,  
        marginBottom: spacing.sm,  
    },  
    statBarBackground: {  
        height: 20,  
        backgroundColor: colors.theme.surfaceDark,  
        borderRadius: radius.sm,  
        overflow: 'hidden',  
        borderWidth: 1,  
        borderColor: colors.theme.surface,  
    },  
    statBarFill: {  
        height: '100%',  
        backgroundColor: colors.accent\['steely-blue'\],  
    },  
    flashOverlay: {  
        ...StyleSheet.absoluteFillObject,  
        backgroundColor: '\#FFFFFF',  
    }  
});

export default StatGainAnimation;

#### **Part 2: Integrating the Animation into `FoodSelectionScreenV2.js`**

Now, we'll update the food selection screen to call our new component.

**File to Edit:** `src/screens/FoodSelectionScreenV2.js`

JavaScript  
import React, { useState, useRef } from 'react';  
// ... other imports  
import { useCharacter } from '../contexts/CharacterContext';  
import designTokens from '../constants/designTokens';  
import StatGainAnimation from '../../components/StatGainAnimation'; // Import the new component

// ... QUICK\_FOODS data remains the same

const FoodSelectionScreenV2 \= () \=\> {  
    const navigation \= useNavigation();  
    // Get the full character context, including stats  
    const { addNutrition, characterStats } \= useCharacter();  
      
    const \[selectedFood, setSelectedFood\] \= useState(null);  
    // We'll use this new state to trigger the animation  
    const \[statGains, setStatGains\] \= useState(null);   
      
    const eatAnim \= useRef(new Animated.Value(1)).current;

    // ... handleFoodSelect and calculateStatGains logic remains the same  
      
    const handleEatFood \= async (food) \=\> {  
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);  
          
        const gains \= calculateStatGains(food);  
          
        // Log nutrition using CharacterContext  
        addNutrition({  
          name: food.name,  
          category: food.category,  
          calories: food.calories,  
          protein: food.protein || 0,  
        });  
          
        // Instead of setShowSuccess, we set the gains to trigger our new component  
        setStatGains(gains);  
    };  
      
    const handleAnimationComplete \= () \=\> {  
        // This is called when the StatGainAnimation finishes  
        setStatGains(null); // Reset the state  
        navigation.goBack();  
    };

    // The main render function  
    return (  
        \<View style={styles.container}\>  
            {/\* The rest of the screen UI (ScrollView, foodGrid, etc.) remains the same \*/}  
            {/\* ... \*/}

            {/\* Conditionally render our new animation component over everything \*/}  
            {statGains && (  
                \<StatGainAnimation  
                    initialStats={characterStats}  
                    gains={statGains}  
                    onComplete={handleAnimationComplete}  
                /\>  
            )}  
        \</View\>  
    );  
};

// ... Styles remain the same

export default FoodSelectionScreenV2;

### **Summary and Next Steps**

We have successfully created our first "Fluid Retro" animated sequence. When you now log a food item, instead of a static success message, you will see a full-screen, dynamic breakdown of your stat increases. This single change dramatically increases the feeling of reward and polish.

We can now use this `<StatGainAnimation />` component after every workout as well, creating a consistent reward loop.

What would you like to tackle next?

* **Implement the animated `<PixelButton />`** more broadly across the app.  
* **Design another animation,** such as the "Pixel Dissolve" screen transition.  
* **Move on to building out the Settings sub-screens** (like "Change Username").


### **PIXEL BUTTON AND PIXEL DISSOLVE**

Part 1: The Animated <PixelButton />
You're right to prioritize this. Consistent, tactile button feedback is one of the fastest ways to make an app feel higher quality. We already created the <PixelButton /> component with its "depress and pop" animation. Now, let's integrate it into one of our key screens.

The QuickActivityLogScreen.js is a perfect candidate because it has a final, important "LOG ACTIVITY" button.

Here are the changes for QuickActivityLogScreen.js:
I've updated the file to import and use our new animated button. The changes are minimal, showing how easy it is to upgrade from a Pressable to a PixelButton.

File to Edit: src/screens/QuickActivityLogScreen.js

JavaScript

import React, { useState, useRef, useEffect } from 'react';
// ... other imports
import { SafeAreaView } from 'react-native-safe-area-context';
import designTokens from '../constants/designTokens';
import PixelButton from '../../components/PixelButton'; // 1. IMPORT the new button

// ... All data and existing logic remains the same ...

const QuickActivityLogScreen = () => {
  // ... All existing state and logic remains the same ...

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ... All other UI (header, category selection, etc.) remains the same ... */}
        
        {selectedCategory && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ... Duration and Intensity sections remain the same ... */}
            
            {previewStats &&
              <View style={styles.previewPanel}>
                {/* ... Stat Preview UI remains the same ... */}
              </View>
            }
            
            {/* 2. REPLACE the old Pressable with our new PixelButton */}
            <View style={styles.buttonContainer}>
              <PixelButton onPress={handleLogActivity}>
                LOG ACTIVITY 🎮
              </PixelButton>
            </View>

          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
  // ... All other styles remain the same ...
  
  // 3. REMOVE the old logButton and logButtonText styles
  /*
  logButton: {
    backgroundColor: colors.accent['steely-blue'],
    paddingVertical: spacing.md,
    margin: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  logButtonText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.shell.light,
  },
  */

  // 4. ADD a container style for the button if needed for layout
  buttonContainer: {
    margin: spacing.lg,
  },

  // ... All other styles remain the same ...
});

export default QuickActivityLogScreen;
Action for You: Apply this same pattern to other key action buttons across the app (e.g., the "GET STARTED" button in OnboardingWelcomeScreen.js, the "SIGN UP" button in OnboardingAuthScreen.js, etc.).

Part 2: The "Pixel Dissolve" Screen Transition
This is a signature "Fluid Retro" effect that will make your app stand out. A pixel dissolve is an advanced animation that isn't built into standard navigators.

Our strategy is to first build a component that creates the visual effect. Later, this can be integrated into your app's navigation transitions.

Here is the code for a <PixelDissolve /> component:
This component is a full-screen overlay that creates a grid of pixels and animates their opacity in a random, staggered way to create the dissolve effect.

File to Create: src/components/animations/PixelDissolve.js

JavaScript

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');
const PIXEL_SIZE = 40; // The size of each square in the dissolve. Adjust for more/less detail.

const PixelDissolve = ({ isActive, onAnimationEnd }) => {
    const grid = useRef([]).current;
    const animatedValues = useRef([]).current;

    // Create the grid of pixels only once
    if (grid.length === 0) {
        const numCols = Math.ceil(width / PIXEL_SIZE);
        const numRows = Math.ceil(height / PIXEL_SIZE);
        for (let i = 0; i < numRows * numCols; i++) {
            grid.push(i);
            animatedValues.push(new Animated.Value(0));
        }
        // Shuffle the animations for a random dissolve effect
        animatedValues.sort(() => Math.random() - 0.5);
    }

    useEffect(() => {
        if (isActive) {
            // Animate in
            Animated.stagger(2, 
                animatedValues.map(val => Animated.timing(val, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }))
            ).start(() => {
                // Once fully covered, call the onAnimationEnd callback
                if (onAnimationEnd) onAnimationEnd();
                // Then, animate out
                 Animated.stagger(2, 
                    animatedValues.map(val => Animated.timing(val, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }))
                ).start();
            });
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {grid.map((_, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.pixel,
                        { opacity: animatedValues[index] }
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pixel: {
        width: PIXEL_SIZE,
        height: PIXEL_SIZE,
        backgroundColor: '#0F380F', // Use our darkest green for the dissolve color
    }
});

export default PixelDissolve;
How to Test It:

To see this effect in action without modifying your navigation stack, you can create a simple test screen.

Example File: src/screens/AnimationTestScreen.js

JavaScript

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PixelButton from '../components/PixelButton';
import PixelDissolve from '../components/animations/PixelDissolve';

const AnimationTestScreen = () => {
    const [isDissolving, setIsDissolving] = useState(false);
    const [bgColor, setBgColor] = useState('#9BBC0F');

    const triggerDissolve = () => {
        setIsDissolving(true);
    };

    const handleAnimationEnd = () => {
        // This is where a real navigation would happen.
        // For the test, we'll just change the background color.
        setBgColor(bgColor === '#9BBC0F' ? '#4ECDC4' : '#9BBC0F');
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={styles.text}>Animation Test</Text>
            <PixelButton onPress={triggerDissolve}>
                TRIGGER DISSOLVE
            </PixelButton>
            <PixelDissolve 
                isActive={isDissolving} 
                onAnimationEnd={() => {
                    handleAnimationEnd();
                    setIsDissolving(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    },
    text: {
        fontFamily: 'PressStart2P',
        fontSize: 24,
        color: '#0F380F'
    }
});

export default AnimationTestScreen;
Now you can temporarily add this AnimationTestScreen to your navigator to see and fine-tune your signature "Pixel Dissolve" effect. What's next on our list?
