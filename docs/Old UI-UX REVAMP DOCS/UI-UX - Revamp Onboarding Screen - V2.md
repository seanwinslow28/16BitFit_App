### **Onboarding Phase 1: The Welcome Screen**

Let's start with the first step of your onboarding flow. This screen will set the tone for the entire app, welcoming the user and explaining the core loop in a simple, engaging way.

#### **Here is the code for the `OnboardingWelcomeScreen.js`:**

This would be a new screen file in your project. It serves as the entry point for new users before they log in or create an account.

**File to Create:** `src/screens/onboarding/OnboardingWelcomeScreen.js` *(You may need to create an `onboarding` folder inside `/screens` for better organization)*

JavaScript  
import React from 'react';  
import { View, Text, StyleSheet } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import PixelButton from '../../components/PixelButton'; // Assuming you created the animated button  
import designTokens from '../../constants/designTokens';

const OnboardingWelcomeScreen \= () \=\> {  
    const navigation \= useNavigation();

    // In a real app, you would have a more robust navigation stack for onboarding  
    // For now, we'll assume it navigates to the next step.  
    const handleGetStarted \= () \=\> {  
        // We'll need to create this screen next  
        navigation.navigate('OnboardingAuth');   
    };

    return (  
        \<View style={styles.container}\>  
            \<View style={styles.content}\>  
                \<Text style={styles.title}\>WELCOME TO\</Text\>  
                \<Text style={styles.appName}\>16BITFIT\</Text\>

                \<View style={styles.coreLoopContainer}\>  
                    \<Text style={styles.loopText}\>1. TRAIN in real life.\</Text\>  
                    \<Text style={styles.loopText}\>2. LEVEL UP your character.\</Text\>  
                    \<Text style={styles.loopText}\>3. BATTLE to test your strength.\</Text\>  
                \</View\>

                \<Text style={styles.subtitle}\>Your fitness journey starts now\!\</Text\>  
            \</View\>

            \<View style={styles.buttonContainer}\>  
                \<PixelButton onPress={handleGetStarted}\>  
                    GET STARTED  
                \</PixelButton\>  
            \</View\>  
        \</View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flex: 1,  
        backgroundColor: colors.theme.background,  
        padding: spacing.lg,  
        justifyContent: 'center',  
    },  
    content: {  
        flex: 1,  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.lg.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
    },  
    appName: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.title.fontSize,  
        color: colors.accent\['steely-blue'\],  
        textAlign: 'center',  
        marginBottom: spacing\['4xl'\],  
        textShadowColor: colors.theme.text,  
        textShadowOffset: { width: 2, height: 2 },  
    },  
    coreLoopContainer: {  
        backgroundColor: colors.theme.surfaceDark,  
        padding: spacing.lg,  
        borderRadius: radius.md,  
        borderWidth: 2,  
        borderColor: colors.theme.text,  
        marginBottom: spacing\['4xl'\],  
    },  
    loopText: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.primary,  
        textAlign: 'left',  
        marginVertical: spacing.sm,  
        lineHeight: typography.styles.lg.lineHeight,  
    },  
    subtitle: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
    },  
    buttonContainer: {  
        padding: spacing.lg,  
    }  
});

export default OnboardingWelcomeScreen;

### **The Onboarding Plan Moving Forward**

Here is the full flow we will build, based on your requirements:

1. **`OnboardingWelcomeScreen.js` (Complete ✔️):** The screen above. It introduces the app's core loop.  
2. **`OnboardingAuthScreen.js` (Next):** This screen will present the user with the options to "Sign Up" or "Log In." We'll provide fields for email/password and a "Sign in with Google" button, using the functions from your  
    `SupabaseService.js` file.  
3. **`OnboardingCharacterCreationScreen.js`:** After successful signup, the user will be taken here. We will design a UI inspired by classic Pokémon games where they can choose from a few "starter" avatars and name their character.  
4. **`OnboardingGoalScreen.js`:** The final step of character creation. The user will select their primary fitness goal (e.g., "Build Muscle," "Improve Endurance").  
5. **`OnboardingHealthScreen.js`:** The final step of the entire flow, where we prompt the user to connect to their Health service using the logic from `HealthIntegration.js`.

This structured approach will create an engaging and logical first-time experience for your users.

Let's proceed. I'm ready to build the **`OnboardingAuthScreen.js`** when you are.

### **Product & UI/UX Strategy for `OnboardingAuthScreen`**

Based on your requirements, this screen needs to handle both logging in for existing users and signing up for new ones.

* **UI Pattern:** We'll use a simple and clear tabbed interface. Users can easily switch between "LOG IN" and "SIGN UP" forms.  
* **Functionality:**  
  * The "SIGN UP" form will include fields for Username, Email, and Password.  
  * The "LOG IN" form will have fields for Email and Password.  
  * We will include a placeholder "Continue with Google" button on both forms as requested.  
* **Integration:** The forms will be designed to integrate directly with the `signIn` and `signUp` methods in your existing `SupabaseService.js` file.  
* **Feel:** We'll use our `<PixelButton />` for all actions to maintain the "Fluid Retro" feel. The input fields will be styled to look like they belong in our 16-bit OS.

### **2\. Developer Implementation**

Here is the code for the `OnboardingAuthScreen.js`. This screen manages the UI for both authentication states and is ready to be wired up to your backend service.

**File to Create:** `src/screens/onboarding/OnboardingAuthScreen.js`

JavaScript  
import React, { useState } from 'react';  
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import { useSupabase } from '../../services/SupabaseService'; // Using the hook from your service   
import PixelButton from '../../components/PixelButton';  
import designTokens from '../../constants/designTokens';

const OnboardingAuthScreen \= () \=\> {  
    const navigation \= useNavigation();  
    const { supabase } \= useSupabase(); // Get the Supabase client

    const \[authMode, setAuthMode\] \= useState('signup'); // Default to 'signup' for new users  
    const \[email, setEmail\] \= useState('');  
    const \[password, setPassword\] \= useState('');  
    const \[username, setUsername\] \= useState('');  
    const \[loading, setLoading\] \= useState(false);

    const handleSignUp \= async () \=\> {  
        if (\!username || \!email || \!password) {  
            Alert.alert('Error', 'Please fill in all fields.');  
            return;  
        }  
        setLoading(true);  
        // Uses the signUp method from your SupabaseService.js file   
        const { error } \= await supabase.auth.signUp({  
            email: email,  
            password: password,  
            options: {  
                data: {  
                    username: username,  
                },  
            },  
        });

        if (error) Alert.alert('Sign Up Error', error.message);  
        else navigation.navigate('OnboardingCharacterCreation'); // Navigate on success  
        setLoading(false);  
    };

    const handleLogin \= async () \=\> {  
        if (\!email || \!password) {  
            Alert.alert('Error', 'Please enter your email and password.');  
            return;  
        }  
        setLoading(true);  
        // Uses the signInWithPassword method from your SupabaseService.js file   
        const { error } \= await supabase.auth.signInWithPassword({  
            email: email,  
            password: password,  
        });

        if (error) Alert.alert('Login Error', error.message);  
        // On successful login, we can skip the rest of onboarding for now  
        else navigation.navigate('Main');   
        setLoading(false);  
    };

    return (  
        \<View style={styles.container}\>  
            \<View style={styles.header}\>  
                \<Text style={styles.title}\>{authMode \=== 'signup' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}\</Text\>  
            \</View\>  
              
            \<View style={styles.tabContainer}\>  
                \<Pressable onPress={() \=\> setAuthMode('signup')} style={\[styles.tab, authMode \=== 'signup' && styles.activeTab\]}\>  
                    \<Text style={styles.tabText}\>SIGN UP\</Text\>  
                \</Pressable\>  
                \<Pressable onPress={() \=\> setAuthMode('login')} style={\[styles.tab, authMode \=== 'login' && styles.activeTab\]}\>  
                    \<Text style={styles.tabText}\>LOG IN\</Text\>  
                \</Pressable\>  
            \</View\>

            \<View style={styles.formContainer}\>  
                {authMode \=== 'signup' && (  
                    \<TextInput  
                        style={styles.input}  
                        placeholder="USERNAME"  
                        placeholderTextColor={colors.theme.textLight}  
                        value={username}  
                        onChangeText={setUsername}  
                        autoCapitalize="none"  
                    /\>  
                )}  
                \<TextInput  
                    style={styles.input}  
                    placeholder="EMAIL"  
                    placeholderTextColor={colors.theme.textLight}  
                    value={email}  
                    onChangeText={setEmail}  
                    keyboardType="email-address"  
                    autoCapitalize="none"  
                /\>  
                \<TextInput  
                    style={styles.input}  
                    placeholder="PASSWORD"  
                    placeholderTextColor={colors.theme.textLight}  
                    value={password}  
                    onChangeText={setPassword}  
                    secureTextEntry  
                /\>

                \<PixelButton onPress={authMode \=== 'signup' ? handleSignUp : handleLogin} disabled={loading}\>  
                    {loading ? 'LOADING...' : (authMode \=== 'signup' ? 'SIGN UP' : 'LOG IN')}  
                \</PixelButton\>

                \<Text style={styles.orText}\>OR\</Text\>  
                  
                \<PixelButton style={styles.googleButton} textStyle={styles.googleButtonText}\>  
                    CONTINUE WITH GOOGLE  
                \</PixelButton\>  
            \</View\>  
        \</View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flex: 1,  
        backgroundColor: colors.theme.background,  
        padding: spacing.lg,  
    },  
    header: {  
        paddingTop: spacing\['4xl'\],  
        paddingBottom: spacing.xl,  
        alignItems: 'center',  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.xl.fontSize,  
        color: colors.theme.text,  
    },  
    tabContainer: {  
        flexDirection: 'row',  
        borderWidth: 2,  
        borderColor: colors.theme.text,  
        borderRadius: radius.md,  
        marginBottom: spacing.xl,  
    },  
    tab: {  
        flex: 1,  
        padding: spacing.md,  
        alignItems: 'center',  
    },  
    activeTab: {  
        backgroundColor: colors.theme.surfaceDark,  
    },  
    tabText: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
    },  
    formContainer: {  
        gap: spacing.md,  
    },  
    input: {  
        backgroundColor: colors.theme.surface,  
        borderWidth: 2,  
        borderColor: colors.theme.text,  
        padding: spacing.md,  
        borderRadius: radius.sm,  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
    },  
    orText: {  
        fontFamily: typography.fonts.pixel,  
        color: colors.theme.text,  
        textAlign: 'center',  
        marginVertical: spacing.sm,  
    },  
    googleButton: {  
        backgroundColor: colors.shell.light,  
        borderColor: colors.button.black,  
    },  
    googleButtonText: {  
        color: colors.button.black,  
        fontSize: typography.styles.base.fontSize,  
    }  
});

export default OnboardingAuthScreen;

### **Next Steps**

Once the user is authenticated, they'll land on the most exciting part of onboarding: **Character Creation**.

When you're ready, we'll design the `OnboardingCharacterCreationScreen.js`. This is where we'll implement the Pokémon-style selection screen for the user to choose their starter avatar and give it a name. Let me know when you're ready to proceed\!

Of course. Let's proceed. This is a fantastic step—the Character Creation screen. It's the moment the user forms their first real connection with the app. We'll lean heavily into that classic Pokémon-style "Choose Your Starter" feel you described.

### **1\. Product & UI/UX Strategy for Character Creation**

This screen will be a single, interactive flow where the user brings their fitness avatar to life.

* **Pokémon-Inspired Selection:** We'll present a choice of 3 "starter" avatars, each with a different focus, allowing the user to pick one that aligns with their style. We will use your existing  
   `<CharacterArena />` component to display the sprites, which is a perfect way to integrate your game development work.  
* **Progressive Form:** To avoid overwhelming the user, the screen will reveal itself in stages. Once an avatar is selected, the fields for naming the character and setting a fitness goal will appear.  
* **Clear Actions:** The user will name their character (pre-filled with their signup username for convenience) and select a primary fitness goal from a simple list.  
* **Final Confirmation:** A prominent button at the bottom will allow them to confirm their choices and officially start their journey.

### **2\. Developer Implementation**

Here is the code for the `OnboardingCharacterCreationScreen.js`. It includes the UI for avatar selection, naming, and goal setting, and is ready to be connected to your Supabase service.

**File to Create:** `src/screens/onboarding/OnboardingCharacterCreationScreen.js`

JavaScript  
import React, { useState } from 'react';  
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import { useSupabase } from '../../services/SupabaseService';  
import CharacterArena from '../../components/CharacterArena'; // Using your existing component  
import PixelButton from '../../components/PixelButton';  
import designTokens from '../../constants/designTokens';

// Define our "Starter" characters  
const STARTER\_CHARACTERS \= \[  
    {  
        id: 'brawler',  
        name: 'BRAWLER',  
        description: 'Starts with a bonus to Strength.',  
        spriteState: 'flex', // Prop for CharacterArena  
    },  
    {  
        id: 'cardio\_champ',  
        name: 'SPRINTER',  
        description: 'Starts with a bonus to Stamina.',  
        spriteState: 'postWorkout',  
    },  
    {  
        id: 'yogi',  
        name: 'YOGI',  
        description: 'Starts with a bonus to Health.',  
        spriteState: 'idle',  
    },  
\];

const FITNESS\_GOALS \= \[  
    { id: 'build\_muscle', name: 'BUILD MUSCLE' },  
    { id: 'improve\_endurance', name: 'IMPROVE ENDURANCE' },  
    { id: 'general\_fitness', name: 'GENERAL FITNESS' },  
\];

const OnboardingCharacterCreationScreen \= () \=\> {  
    const navigation \= useNavigation();  
    const { supabase, user } \= useSupabase(); // Assuming user object is available after auth

    const \[selectedAvatarId, setSelectedAvatarId\] \= useState(null);  
    const \[characterName, setCharacterName\] \= useState(user?.user\_metadata?.username || '');  
    const \[selectedGoalId, setSelectedGoalId\] \= useState(null);  
    const \[loading, setLoading\] \= useState(false);

    const handleCreateCharacter \= async () \=\> {  
        if (\!selectedAvatarId || \!characterName || \!selectedGoalId) {  
            Alert.alert('Incomplete', 'Please select an avatar, name your character, and choose a goal.');  
            return;  
        }  
        setLoading(true);

        // NOTE: You may need to update your 'createUserProfile' function in SupabaseService.js  
        // to accept the archetype and goal.  
        // This is a conceptual call to what that function \*should\* do.  
        const { error } \= await supabase.from('characters').insert({  
            user\_id: user.id,  
            name: characterName,  
            archetype: selectedAvatarId,  
            fitness\_goal: selectedGoalId,  
            level: 1, // Default starting stats  
            experience: 0,  
            strength: 50,  
            endurance: 50,  
            speed: 50,  
            health: 100,  
        });

        if (error) {  
            Alert.alert('Error', 'Could not create your character. Please try again.');  
            setLoading(false);  
        } else {  
            navigation.navigate('OnboardingHealth'); // Navigate to the final step on success  
        }  
    };

    return (  
        \<ScrollView style={styles.container}\>  
            \<View style={styles.header}\>  
                \<Text style={styles.title}\>CHOOSE YOUR FIGHTER\</Text\>  
            \</View\>

            \<View style={styles.selectionGrid}\>  
                {STARTER\_CHARACTERS.map((char) \=\> (  
                    \<Pressable key={char.id} onPress={() \=\> setSelectedAvatarId(char.id)} style={\[styles.card, selectedAvatarId \=== char.id && styles.selectedCard\]}\>  
                        \<CharacterArena   
                            characterState={char.spriteState}   
                            backgroundType="dojo"  
                            style={styles.characterArena}   
                        /\>  
                        \<Text style={styles.cardTitle}\>{char.name}\</Text\>  
                        \<Text style={styles.cardDescription}\>{char.description}\</Text\>  
                    \</Pressable\>  
                ))}  
            \</View\>

            {selectedAvatarId && (  
                \<View style={styles.detailsSection}\>  
                    \<Text style={styles.sectionTitle}\>NAME YOUR CHARACTER\</Text\>  
                    \<TextInput  
                        style={styles.input}  
                        value={characterName}  
                        onChangeText={setCharacterName}  
                        placeholder="Enter Name"  
                        placeholderTextColor={colors.theme.textLight}  
                    /\>

                    \<Text style={styles.sectionTitle}\>WHAT IS YOUR GOAL?\</Text\>  
                    \<View style={styles.goalContainer}\>  
                        {FITNESS\_GOALS.map(goal \=\> (  
                             \<Pressable key={goal.id} onPress={() \=\> setSelectedGoalId(goal.id)} style={\[styles.goalButton, selectedGoalId \=== goal.id && styles.selectedGoalButton\]}\>  
                                 \<Text style={\[styles.goalText, selectedGoalId \=== goal.id && styles.selectedGoalText\]}\>{goal.name}\</Text\>  
                             \</Pressable\>  
                        ))}  
                    \</View\>  
                \</View\>  
            )}

            \<View style={styles.buttonContainer}\>  
                \<PixelButton onPress={handleCreateCharacter} disabled={\!selectedAvatarId || \!characterName || \!selectedGoalId || loading}\>  
                    {loading ? "CREATING..." : "START MY JOURNEY"}  
                \</PixelButton\>  
            \</View\>  
        \</ScrollView\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flex: 1,  
        backgroundColor: colors.theme.background,  
        padding: spacing.lg,  
    },  
    header: {  
        paddingTop: spacing.xl,  
        alignItems: 'center',  
        marginBottom: spacing.lg,  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.xl.fontSize,  
        color: colors.theme.text,  
    },  
    selectionGrid: {  
        gap: spacing.md,  
    },  
    card: {  
        backgroundColor: colors.theme.surfaceDark,  
        borderWidth: 2,  
        borderColor: colors.theme.text,  
        borderRadius: radius.md,  
        padding: spacing.md,  
        alignItems: 'center',  
    },  
    selectedCard: {  
        borderColor: colors.accent\['steely-blue'\],  
        backgroundColor: colors.theme.text,  
    },  
    characterArena: {  
        width: '100%',  
        height: 150, // Fixed height for consistency  
        backgroundColor: colors.screen.lightestGreen, // From the green screen palette  
        borderRadius: radius.sm,  
        marginBottom: spacing.sm,  
    },  
    cardTitle: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.lg.fontSize,  
        color: colors.theme.primary,  
        marginBottom: spacing.xs,  
    },  
    cardDescription: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.sm.fontSize,  
        color: colors.theme.textLight,  
        textAlign: 'center',  
    },  
    detailsSection: {  
        marginTop: spacing.xl,  
        backgroundColor: colors.theme.text,  
        padding: spacing.md,  
        borderRadius: radius.md,  
    },  
    sectionTitle: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.primary,  
        marginBottom: spacing.md,  
        marginTop: spacing.sm,  
        textAlign: 'center',  
    },  
    input: {  
        backgroundColor: colors.theme.surface,  
        borderWidth: 2,  
        borderColor: colors.theme.surfaceDark,  
        padding: spacing.md,  
        borderRadius: radius.sm,  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
    },  
    goalContainer: {  
        gap: spacing.sm,  
    },  
    goalButton: {  
        backgroundColor: colors.theme.surface,  
        padding: spacing.md,  
        borderRadius: radius.sm,  
        borderWidth: 2,  
        borderColor: colors.theme.surfaceDark,  
    },  
    selectedGoalButton: {  
        backgroundColor: colors.accent\['steely-blue'\],  
        borderColor: colors.shell.light,  
    },  
    goalText: {  
        fontFamily: typography.fonts.pixel,  
        color: colors.theme.text,  
        textAlign: 'center',  
    },  
    selectedGoalText: {  
        color: colors.shell.light,  
    },  
    buttonContainer: {  
        marginVertical: spacing.xl,  
    }  
});

export default OnboardingCharacterCreationScreen;

### **Next Steps**

The flow is coming together beautifully. After the user creates their character, the last crucial step is to connect their real-world activity to the game.

When you're ready, we'll build the final piece of the onboarding puzzle: **`OnboardingHealthScreen.js`**.

### **Product & UI/UX Strategy for the Health Connection Screen**

This screen has one primary goal: to clearly and concisely explain the value of connecting a health service and to make the process a single, simple action.

* **Value Proposition:** We'll lead with the benefit. Instead of a dry "Grant Permissions" message, we'll frame it in the language of the game: "Turn Your Real Steps into In-Game Strength\!"  
* **Clear Actions:** There will be one primary call-to-action button, which will be platform-specific ("Connect to Apple Health" on iOS, "Connect to Google Fit" on Android). We must also provide a "Skip for Now" option so users are not forced to connect.  
* **Integration:** This screen will directly use your existing `HealthIntegration.js` service. The "Connect" button will trigger the  
   `requestPermissions` function, and the screen will reflect the connection status.  
* **Feel:** The design will be clean and focused, guiding the user's attention to the benefit and the primary action button.

### **2\. Developer Implementation**

Here is the code for the final onboarding screen. It uses your `HealthIntegration.js` service to handle the logic, providing a seamless user experience.

**File to Create:** `src/screens/onboarding/OnboardingHealthScreen.js`

JavaScript  
import React, { useState, useEffect } from 'react';  
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';  
import { useNavigation } from '@react-navigation/native';  
import HealthIntegration from '../../services/HealthIntegration'; // Using your existing service  
import PixelButton from '../../components/PixelButton';  
import designTokens from '../../constants/designTokens';

const OnboardingHealthScreen \= () \=\> {  
    const navigation \= useNavigation();  
    const \[status, setStatus\] \= useState('Not Connected');  
    const \[loading, setLoading\] \= useState(false);

    // Initialize the health service when the screen loads  
    useEffect(() \=\> {  
        const init \= async () \=\> {  
            await HealthIntegration.initialize();  
            const currentStatus \= HealthIntegration.getStatus();  
            setStatus(currentStatus.permissions.steps ? 'Connected' : 'Not Connected');  
        };  
        init();  
    }, \[\]);

    const handleConnect \= async () \=\> {  
        setLoading(true);  
        const permissions \= await HealthIntegration.requestPermissions();  
        // If successful, update status and navigate to the main app  
        if (permissions.steps) {  
            setStatus('Connected');  
            // Give user a moment to see the success state  
            setTimeout(() \=\> {  
                navigation.navigate('Main');   
            }, 1000);  
        } else {  
            // Handle case where user denies permissions  
            setStatus('Permission Denied');  
            setLoading(false);  
        }  
    };

    const handleSkip \= () \=\> {  
        // Navigate to the main app, skipping the health connection  
        navigation.navigate('Main');  
    };

    const platformName \= Platform.OS \=== 'ios' ? 'Apple Health' : 'Google Fit';

    return (  
        \<View style={styles.container}\>  
            \<View style={styles.content}\>  
                \<Text style={styles.icon}\>❤️\</Text\>  
                \<Text style={styles.title}\>LINK YOUR HEALTH DATA\</Text\>  
                \<Text style={styles.description}\>  
                    16BitFit uses your real-world activity to power up your character.  
                    Connect to {platformName} to turn your steps, workouts, and sleep into in-game stats\!  
                \</Text\>  
                \<Text style={styles.statusText}\>  
                    Status: {status}  
                \</Text\>  
            \</View\>

            \<View style={styles.buttonContainer}\>  
                \<PixelButton onPress={handleConnect} disabled={loading || status \=== 'Connected'}\>  
                    {status \=== 'Connected' ? 'CONNECTED\!' : \`CONNECT TO ${platformName.toUpperCase()}\`}  
                \</PixelButton\>  
                \<Pressable onPress={handleSkip}\>  
                    \<Text style={styles.skipText}\>Skip for Now\</Text\>  
                \</Pressable\>  
            \</View\>  
        \</View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flex: 1,  
        backgroundColor: colors.theme.background,  
        justifyContent: 'center',  
        padding: spacing.lg,  
    },  
    content: {  
        flex: 1,  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    icon: {  
        fontSize: 80,  
        marginBottom: spacing.xl,  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.xl.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
        marginBottom: spacing.md,  
    },  
    description: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
        lineHeight: typography.styles.lg.lineHeight,  
        marginBottom: spacing.xl,  
        paddingHorizontal: spacing.md,  
    },  
    statusText: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.sm.fontSize,  
        color: colors.theme.textLight,  
        backgroundColor: colors.theme.surfaceDark,  
        padding: spacing.sm,  
        borderRadius: radius.sm,  
    },  
    buttonContainer: {  
        padding: spacing.lg,  
        gap: spacing.md,  
    },  
    skipText: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.text,  
        textAlign: 'center',  
        textDecorationLine: 'underline',  
    }  
});

export default OnboardingHealthScreen;

### **Onboarding Flow Complete\!**

Congratulations\! We have now designed the entire multi-step onboarding flow you envisioned:

1. **Welcome Screen:** Introduces the app's core loop.  
2. **Authentication:** Allows users to sign up or log in.  
3. **Character Creation:** A Pokémon-inspired screen to choose and name an avatar and set goals.  
4. **Health Connection:** This final screen links the user's real-world data to the game.

Your app now has a complete, cohesive, and engaging entry point for every new user.

