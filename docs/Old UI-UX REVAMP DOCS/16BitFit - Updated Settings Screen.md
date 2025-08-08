### **Product & UI/UX Strategy for the Settings Screen**

Based on your requirements, we will architect a clean, list-based settings screen.

* **Logical Grouping:** We'll group the settings under clear headers: PROFILE, NOTIFICATIONS, INTEGRATIONS, AUDIO, and ACCOUNT. This makes the screen easy to scan and navigate.  
* **Component-Based Rows:** Instead of a simple list of text, we'll create a few different types of setting "rows" to handle different interactions:  
  * A **navigation row** for items that go to a new screen (e.g., "Change Username").  
  * A **toggle row** for on/off settings (e.g., "Workout Reminders").  
  * A **slider row** for variable settings (e.g., "Music Volume").  
  * An **action row** for destructive actions (e.g., "Log Out," "Delete Account").  
* **Consistent Design:** Every element will be styled using our `designTokens`, ensuring it feels like a native part of the 16BitFit OS.  
* **Future-Proofing:** While we won't build the social link functionality yet, the design will easily accommodate a new "Social" section in the future.

### **2\. Developer Implementation**

Here is the code for the `SettingsScreen.js`. It includes the full UI and placeholder logic for all the features you requested.

**A quick note:** For the volume sliders, we'll use a standard community package. You'll need to install it by running: `npm install @react-native-community/slider`

---

**File to Create:** `src/screens/SettingsScreen.js` *(You will need to add this screen to one of your navigators, perhaps accessible from a gear icon on the home screen header).*

JavaScript  
import React, { useState } from 'react';  
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';  
import Slider from '@react-native-community/slider';  
import { useNavigation } from '@react-navigation/native';  
import { useSupabase } from '../services/SupabaseService';  
import designTokens from '../constants/designTokens';

// Helper component for a consistent section header  
const SectionHeader \= ({ title }) \=\> \<Text style={styles.sectionHeader}\>{title}\</Text\>;

// Helper component for a row that navigates somewhere else  
const NavigationRow \= ({ label, onPress }) \=\> (  
    \<Pressable onPress={onPress} style={styles.row}\>  
        \<Text style={styles.rowLabel}\>{label}\</Text\>  
        \<Text style={styles.rowIcon}\>→\</Text\>  
    \</Pressable\>  
);

// Helper component for a row with a toggle switch  
const ToggleRow \= ({ label, value, onValueChange }) \=\> (  
    \<View style={styles.row}\>  
        \<Text style={styles.rowLabel}\>{label}\</Text\>  
        \<Switch  
            value={value}  
            onValueChange={onValueChange}  
            trackColor={{ false: colors.theme.surface, true: colors.accent\['steely-blue'\] }}  
            thumbColor={colors.theme.primary}  
            ios\_backgroundColor={colors.theme.surface}  
        /\>  
    \</View\>  
);

// Helper component for a row with a slider  
const SliderRow \= ({ label, value, onValueChange }) \=\> (  
     \<View style={styles.row}\>  
        \<Text style={styles.rowLabel}\>{label}\</Text\>  
        \<Slider  
            style={{ flex: 1, height: 40 }}  
            minimumValue={0}  
            maximumValue={1}  
            value={value}  
            onValueChange={onValueChange}  
            minimumTrackTintColor={colors.accent\['steely-blue'\]}  
            maximumTrackTintColor={colors.theme.surface}  
            thumbTintColor={colors.theme.primary}  
        /\>  
    \</View\>  
);

const SettingsScreen \= () \=\> {  
    const navigation \= useNavigation();  
    const { supabase } \= useSupabase();

    // State for our settings (in a real app, load this from storage/user profile)  
    const \[remindersEnabled, setRemindersEnabled\] \= useState(true);  
    const \[healthConnected, setHealthConnected\] \= useState(true);  
    const \[musicVolume, setMusicVolume\] \= useState(0.8);  
    const \[soundVolume, setSoundVolume\] \= useState(1.0);

    const handleLogout \= async () \=\> {  
        const { error } \= await supabase.auth.signOut();  
        if (error) Alert.alert('Error', error.message);  
        // On success, navigate to the Auth screen or a logged-out state  
        navigation.navigate('OnboardingAuth');   
    };

    const handleDeleteAccount \= () \=\> {  
        Alert.alert(  
            "Delete Account",  
            "Are you sure? This action is permanent and cannot be undone.",  
            \[  
                { text: "Cancel", style: "cancel" },  
                { text: "DELETE", style: "destructive", onPress: () \=\> console.log("Account Deletion Initiated") }  
            \]  
        );  
    };

    return (  
        \<View style={styles.container}\>  
            \<View style={styles.header}\>  
                \<Text style={styles.title}\>SETTINGS\</Text\>  
            \</View\>  
            \<ScrollView\>  
                \<SectionHeader title="PROFILE" /\>  
                \<NavigationRow label="Change Username" onPress={() \=\> { /\* Navigate to ChangeUsernameScreen \*/ }} /\>  
                \<NavigationRow label="Change Avatar" onPress={() \=\> { /\* Navigate to ChangeAvatarScreen \*/ }} /\>

                \<SectionHeader title="NOTIFICATIONS" /\>  
                \<ToggleRow label="Workout Reminders" value={remindersEnabled} onValueChange={setRemindersEnabled} /\>

                \<SectionHeader title="INTEGRATIONS" /\>  
                \<ToggleRow label="Health Service Connected" value={healthConnected} onValueChange={setHealthConnected} /\>

                \<SectionHeader title="AUDIO" /\>  
                \<SliderRow label="Music" value={musicVolume} onValueChange={setMusicVolume} /\>  
                \<SliderRow label="Sound FX" value={soundVolume} onValueChange={setSoundVolume} /\>

                \<SectionHeader title="ACCOUNT" /\>  
                \<NavigationRow label="Log Out" onPress={handleLogout} /\>  
                \<Pressable onPress={handleDeleteAccount}\>  
                     \<Text style={styles.deleteText}\>Delete Account\</Text\>  
                \</Pressable\>

            \</ScrollView\>  
        \</View\>  
    );  
};

const { colors, typography, spacing, radius } \= designTokens;

const styles \= StyleSheet.create({  
    container: {  
        flex: 1,  
        backgroundColor: colors.theme.background,  
    },  
    header: {  
        backgroundColor: colors.theme.surfaceDark,  
        padding: spacing.md,  
        paddingTop: spacing\['3xl'\],  
        borderBottomWidth: 2,  
        borderColor: colors.theme.text,  
    },  
    title: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.xl.fontSize,  
        color: colors.theme.primary,  
        textAlign: 'center',  
    },  
    sectionHeader: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.textLight,  
        padding: spacing.lg,  
        paddingBottom: spacing.sm,  
    },  
    row: {  
        flexDirection: 'row',  
        justifyContent: 'space-between',  
        alignItems: 'center',  
        backgroundColor: colors.theme.surfaceDark,  
        paddingHorizontal: spacing.lg,  
        paddingVertical: spacing.md,  
        borderTopWidth: 1,  
        borderBottomWidth: 1,  
        borderColor: colors.theme.text,  
    },  
    rowLabel: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: colors.theme.primary,  
    },  
    rowIcon: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.lg.fontSize,  
        color: colors.theme.textLight,  
    },  
    deleteText: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.base.fontSize,  
        color: '\#FF6B6B', // Red for destructive action  
        textAlign: 'center',  
        padding: spacing.lg,  
        marginTop: spacing.lg,  
    }  
});

export default SettingsScreen;  
