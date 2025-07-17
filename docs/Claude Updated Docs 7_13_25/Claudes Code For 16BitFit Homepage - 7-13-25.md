**CLAUDES NEW CODE FOR HOMESCREEN APP INTERFACE**  
Here's the HomeScreen component properly converted for your React Native/Expo tech stack:  
typescript  
*// screens/HomeScreen.tsx*  
import React, { useState, useEffect } from 'react';  
import {  
  View,  
  Text,  
  StyleSheet,  
  TouchableOpacity,  
  Dimensions,  
  ScrollView,  
  Animated,  
  StatusBar,  
} from 'react-native';  
import { LinearGradient } from 'expo-linear-gradient';  
import { useFonts } from 'expo-font';  
import \* as Haptics from 'expo-haptics';  
const { width: screenWidth, height: screenHeight } \= Dimensions.get('window');  
export default function HomeScreen() {  
  *// Load retro font*  
  const \[fontsLoaded\] \= useFonts({  
    'PressStart2P': require('../assets/fonts/PressStart2P-Regular.ttf'),  
  });  
  *// Animation states*  
  const \[showLevelUp, setShowLevelUp\] \= useState(false);  
  const \[showDamage, setShowDamage\] \= useState(false);  
  const \[showSparkle, setShowSparkle\] \= useState(false);  
  const \[showTapRing, setShowTapRing\] \= useState(false);  
  const \[combo, setCombo\] \= useState(0);  
  const \[showCombo, setShowCombo\] \= useState(false);  
  *// Animated values*  
  const floatAnim \= useRef(new Animated.Value(0)).current;  
  const pulseAnim \= useRef(new Animated.Value(1)).current;  
  const rotateAnim \= useRef(new Animated.Value(0)).current;  
  useEffect(() \=\> {  
    *// Float animation*  
    Animated.loop(  
      Animated.sequence(\[  
        Animated.timing(floatAnim, {  
          toValue: \-10,  
          duration: 2000,  
          useNativeDriver: true,  
        }),  
        Animated.timing(floatAnim, {  
          toValue: 0,  
          duration: 2000,  
          useNativeDriver: true,  
        }),  
      \])  
    ).start();  
    *// Pulse animation*  
    Animated.loop(  
      Animated.sequence(\[  
        Animated.timing(pulseAnim, {  
          toValue: 1.1,  
          duration: 1500,  
          useNativeDriver: true,  
        }),  
        Animated.timing(pulseAnim, {  
          toValue: 1,  
          duration: 1500,  
          useNativeDriver: true,  
        }),  
      \])  
    ).start();  
    *// Rotate animation*  
    Animated.loop(  
      Animated.timing(rotateAnim, {  
        toValue: 1,  
        duration: 30000,  
        useNativeDriver: true,  
      })  
    ).start();  
  }, \[\]);  
  const handleWorkout \= async () \=\> {  
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  
    setShowSparkle(true);  
    setShowTapRing(true);  
    setCombo(prev \=\> prev \+ 1);  
    setShowCombo(true);  
      
    setTimeout(() \=\> {  
      setShowSparkle(false);  
      setShowTapRing(false);  
    }, 1000);  
      
    setTimeout(() \=\> {  
      setShowCombo(false);  
    }, 2000);  
  };  
  const handleCheatMeal \= async () \=\> {  
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);  
    setShowDamage(true);  
    setCombo(0);  
    setTimeout(() \=\> setShowDamage(false), 400);  
  };  
  if (\!fontsLoaded) {  
    return null;  
  }  
  const spin \= rotateAnim.interpolate({  
    inputRange: \[0, 1\],  
    outputRange: \['0deg', '360deg'\],  
  });  
  return (  
    \<View style={styles.container}\>  
      \<StatusBar barStyle="light-content" /\>  
        
      {*/\* Device Frame \*/*}  
      \<View style={styles.deviceFrame}\>  
        {*/\* App Shell \*/*}  
        \<View style={styles.appShell}\>  
            
          {*/\* Header Bar \*/*}  
          \<View style={styles.headerBar}\>  
            \<Text style={styles.logoText}\>16BIT FIT\</Text\>  
          \</View\>  
            
          {*/\* Main Game Window \*/*}  
          \<LinearGradient  
            colors={\['rgba(155, 188, 15, 0.25)', 'rgba(155, 188, 15, 0.15)', 'rgba(155, 188, 15, 0.25)'\]}  
            start={{ x: 0, y: 0 }}  
            end={{ x: 1, y: 1 }}  
            style={styles.gameWindow}  
          \>  
            {*/\* Scanline Overlay \*/*}  
            \<View style={styles.scanlineOverlay} /\>  
              
            {*/\* Character Arena \*/*}  
            \<View style={styles.characterArena}\>  
              {*/\* Glow Effect \*/*}  
              \<Animated.View   
                style={\[  
                  styles.avatarGlow,   
                  { transform: \[{ scale: pulseAnim }\] }  
                \]}   
              /\>  
                
              {*/\* Character Sprite Container \*/*}  
              \<Animated.View   
                style={\[  
                  styles.characterSprite,  
                  { transform: \[{ translateY: floatAnim }\] }  
                \]}  
              \>  
                {*/\* Inner Glow \*/*}  
                \<LinearGradient  
                  colors={\['rgba(155, 188, 15, 0.4)', 'rgba(155, 188, 15, 0.1)', 'transparent'\]}  
                  style={styles.innerGlow}  
                /\>  
                  
                {*/\* Character Emoji Placeholder \*/*}  
                \<Text style={styles.spriteEmoji}\>🥷\</Text\>  
                  
                {*/\* Power Ring \*/*}  
                \<Animated.View   
                  style={\[  
                    styles.powerRing,  
                    { transform: \[{ rotate: spin }\] }  
                  \]}  
                \>  
                  \<Svg width={380} height={380} style={StyleSheet.absoluteFillObject}\>  
                    \<Circle  
                      cx={190}  
                      cy={190}  
                      r={185}  
                      stroke="rgba(0,0,0,0.3)"  
                      strokeWidth={5}  
                      fill="none"  
                    /\>  
                    \<Circle  
                      cx={190}  
                      cy={190}  
                      r={185}  
                      stroke="\#92CC41"  
                      strokeWidth={6}  
                      strokeDasharray={\[870, 292\]}  
                      fill="none"  
                    /\>  
                  \</Svg\>  
                \</Animated.View\>  
                  
                {*/\* Level Badge \*/*}  
                \<TouchableOpacity   
                  style={styles.levelBadge}  
                  onPress={() \=\> {  
                    setShowLevelUp(true);  
                    setTimeout(() \=\> setShowLevelUp(false), 1000);  
                  }}  
                \>  
                  \<Text style={styles.levelText}\>LV.1\</Text\>  
                \</TouchableOpacity\>  
                  
                {*/\* Animations \*/*}  
                {showLevelUp && \<LevelUpEffect /\>}  
                {showDamage && \<DamageEffect /\>}  
                {showSparkle && \<SparkleEffect /\>}  
                {showTapRing && \<TapRingEffect /\>}  
                {showCombo && combo \> 0 && \<ComboCounter combo={combo} /\>}  
              \</Animated.View\>  
                
              {*/\* Character Name \*/*}  
              \<View style={styles.characterName}\>  
                \<Text style={styles.nameText}\>NINJA WARRIOR\</Text\>  
              \</View\>  
                
              {*/\* Status Effects \*/*}  
              \<View style={styles.statusEffects}\>  
                \<TouchableOpacity style={styles.statusEffect}\>  
                  \<Text style={styles.statusIcon}\>⚔️\</Text\>  
                \</TouchableOpacity\>  
                \<TouchableOpacity style={styles.statusEffect}\>  
                  \<Text style={styles.statusIcon}\>💨\</Text\>  
                \</TouchableOpacity\>  
                \<TouchableOpacity style={styles.statusEffect}\>  
                  \<Text style={styles.statusIcon}\>🛡️\</Text\>  
                \</TouchableOpacity\>  
              \</View\>  
            \</View\>  
              
            {*/\* Quick Stats \*/*}  
            \<View style={styles.quickStats}\>  
              \<View style={styles.quickStatItem}\>  
                \<Text style={styles.quickStatIcon}\>❤️\</Text\>  
                \<View style={styles.quickStatContent}\>  
                  \<Text style={\[styles.quickStatValue, styles.lowHealth\]}\>25%\</Text\>  
                  \<Text style={styles.criticalText}\>CRITICAL\</Text\>  
                \</View\>  
              \</View\>  
              \<View style={styles.quickStatItem}\>  
                \<Text style={styles.quickStatIcon}\>⚡\</Text\>  
                \<Text style={styles.quickStatValue}\>75%\</Text\>  
              \</View\>  
            \</View\>  
          \</LinearGradient\>  
            
          {*/\* Action Buttons \*/*}  
          \<View style={styles.actionButtonContainer}\>  
            \<View style={styles.actionButtonRow}\>  
              \<TouchableOpacity   
                style={styles.actionButton}  
                onPress={handleWorkout}  
                activeOpacity={0.8}  
              \>  
                \<Text style={styles.actionButtonText}\>WORKOUT\</Text\>  
              \</TouchableOpacity\>  
                
              \<TouchableOpacity   
                style={styles.actionButton}  
                onPress={handleWorkout}  
                activeOpacity={0.8}  
              \>  
                \<Text style={styles.actionButtonText}\>EAT HEALTHY\</Text\>  
              \</TouchableOpacity\>  
            \</View\>  
              
            \<View style={styles.actionButtonRow}\>  
              \<TouchableOpacity   
                style={\[styles.actionButton, styles.secondaryActionButton\]}  
                onPress={handleCheatMeal}  
                activeOpacity={0.8}  
              \>  
                \<Text style={\[styles.actionButtonText, styles.smallerText\]}\>SKIP WORKOUT\</Text\>  
              \</TouchableOpacity\>  
                
              \<TouchableOpacity   
                style={\[styles.actionButton, styles.secondaryActionButton\]}  
                onPress={handleCheatMeal}  
                activeOpacity={0.8}  
              \>  
                \<Text style={\[styles.actionButtonText, styles.smallerText\]}\>CHEAT MEAL\</Text\>  
              \</TouchableOpacity\>  
            \</View\>  
          \</View\>  
            
          {*/\* Bottom Navigation \*/*}  
          \<View style={styles.bottomNav}\>  
            \<TouchableOpacity style={\[styles.navButton, styles.navButtonActive\]}\>  
              \<Text style={styles.navButtonIcon}\>🏠\</Text\>  
              \<Text style={\[styles.navButtonText, styles.navButtonTextActive\]}\>HOME\</Text\>  
            \</TouchableOpacity\>  
              
            \<TouchableOpacity style={styles.navButton}\>  
              \<Text style={styles.navButtonIcon}\>⚔️\</Text\>  
              \<Text style={styles.navButtonText}\>BATTLE\</Text\>  
            \</TouchableOpacity\>  
              
            \<TouchableOpacity style={styles.navButton}\>  
              \<Text style={styles.navButtonIcon}\>📊\</Text\>  
              \<Text style={styles.navButtonText}\>STATS\</Text\>  
            \</TouchableOpacity\>  
          \</View\>  
            
        \</View\>  
      \</View\>  
    \</View\>  
  );  
}  
const styles \= StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '\#000000',  
    alignItems: 'center',  
    justifyContent: 'center',  
  },  
    
  deviceFrame: {  
    width: Math.min(screenWidth \- 20, 410),  
    height: Math.min(screenHeight \- 40, 892),  
    backgroundColor: '\#0a0a0a',  
    borderRadius: 40,  
    padding: 10,  
    shadowColor: '\#000',  
    shadowOffset: { width: 0, height: 20 },  
    shadowOpacity: 0.8,  
    shadowRadius: 20,  
    elevation: 30,  
  },  
    
  appShell: {  
    flex: 1,  
    backgroundColor: '\#050505',  
    borderRadius: 30,  
    borderWidth: 3,  
    borderColor: '\#333',  
    overflow: 'hidden',  
  },  
    
  headerBar: {  
    height: 56,  
    backgroundColor: '\#0D0D0D',  
    borderBottomWidth: 2,  
    borderBottomColor: '\#333',  
    alignItems: 'center',  
    justifyContent: 'center',  
    shadowColor: '\#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.5,  
    shadowRadius: 4,  
  },  
    
  logoText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 22,  
    color: '\#92CC41',  
    letterSpacing: 2,  
    textShadowColor: '\#5a7829',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 0,  
  },  
    
  gameWindow: {  
    flex: 1,  
    margin: 12,  
    marginBottom: 8,  
    borderWidth: 4,  
    borderColor: '\#0D0D0D',  
    borderRadius: 8,  
    overflow: 'hidden',  
  },  
    
  scanlineOverlay: {  
    ...StyleSheet.absoluteFillObject,  
    opacity: 0.15,  
    backgroundColor: 'transparent',  
    *// Note: React Native doesn't support repeating-linear-gradient*  
    *// You'd need to use an image or custom component for true scanlines*  
  },  
    
  characterArena: {  
    flex: 1,  
    alignItems: 'center',  
    justifyContent: 'center',  
    paddingTop: 10,  
    paddingBottom: 10,  
  },  
    
  avatarGlow: {  
    position: 'absolute',  
    width: 400,  
    height: 400,  
    borderRadius: 200,  
    backgroundColor: 'rgba(155, 188, 15, 0.2)',  
  },  
    
  characterSprite: {  
    width: 360,  
    height: 360,  
    backgroundColor: 'rgba(0,0,0,0.3)',  
    borderWidth: 12,  
    borderColor: '\#0D0D0D',  
    borderRadius: 24,  
    alignItems: 'center',  
    justifyContent: 'center',  
    shadowColor: '\#9BBC0F',  
    shadowOffset: { width: 0, height: 0 },  
    shadowOpacity: 0.7,  
    shadowRadius: 40,  
    elevation: 20,  
  },  
    
  innerGlow: {  
    position: 'absolute',  
    width: '85%',  
    height: '85%',  
    borderRadius: 20,  
  },  
    
  spriteEmoji: {  
    fontSize: 220,  
    zIndex: 3,  
  },  
    
  powerRing: {  
    position: 'absolute',  
    width: '100%',  
    height: '100%',  
  },  
    
  levelBadge: {  
    position: 'absolute',  
    bottom: \-24,  
    right: \-24,  
    backgroundColor: '\#F7D51D',  
    borderWidth: 6,  
    borderColor: '\#0D0D0D',  
    borderRadius: 10,  
    paddingVertical: 10,  
    paddingHorizontal: 20,  
    shadowColor: '\#000',  
    shadowOffset: { width: 0, height: 10 },  
    shadowOpacity: 0.8,  
    shadowRadius: 0,  
    elevation: 15,  
  },  
    
  levelText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 16,  
    color: '\#0D0D0D',  
    letterSpacing: 2,  
  },  
    
  characterName: {  
    marginTop: 28,  
    backgroundColor: 'rgba(0,0,0,0.8)',  
    borderWidth: 5,  
    borderColor: '\#0D0D0D',  
    borderRadius: 10,  
    paddingVertical: 14,  
    paddingHorizontal: 28,  
    shadowColor: '\#92CC41',  
    shadowOffset: { width: 0, height: 0 },  
    shadowOpacity: 0.4,  
    shadowRadius: 20,  
  },  
    
  nameText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 14,  
    color: '\#92CC41',  
    letterSpacing: 2,  
    textShadowColor: 'rgba(0,0,0,0.7)',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 0,  
  },  
    
  statusEffects: {  
    flexDirection: 'row',  
    gap: 10,  
    marginTop: 16,  
  },  
    
  statusEffect: {  
    width: 40,  
    height: 40,  
    backgroundColor: 'rgba(0,0,0,0.7)',  
    borderWidth: 3,  
    borderColor: '\#0D0D0D',  
    borderRadius: 6,  
    alignItems: 'center',  
    justifyContent: 'center',  
    shadowColor: '\#92CC41',  
    shadowOffset: { width: 0, height: 0 },  
    shadowOpacity: 0.3,  
    shadowRadius: 10,  
  },  
    
  statusIcon: {  
    fontSize: 20,  
  },  
    
  quickStats: {  
    position: 'absolute',  
    bottom: 20,  
    alignSelf: 'center',  
    flexDirection: 'row',  
    gap: 32,  
    backgroundColor: 'rgba(0,0,0,0.8)',  
    paddingVertical: 12,  
    paddingHorizontal: 24,  
    borderRadius: 10,  
    borderWidth: 4,  
    borderColor: '\#0D0D0D',  
  },  
    
  quickStatItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    gap: 10,  
  },  
    
  quickStatContent: {  
    alignItems: 'center',  
  },  
    
  quickStatIcon: {  
    fontSize: 24,  
  },  
    
  quickStatValue: {  
    fontFamily: 'PressStart2P',  
    fontSize: 14,  
    color: '\#92CC41',  
    textShadowColor: 'rgba(0,0,0,0.8)',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 0,  
  },  
    
  lowHealth: {  
    color: '\#E53935',  
  },  
    
  criticalText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 6,  
    color: '\#E53935',  
    marginTop: 2,  
    letterSpacing: 0.5,  
  },  
    
  actionButtonContainer: {  
    paddingVertical: 8,  
    paddingHorizontal: 12,  
    gap: 10,  
  },  
    
  actionButtonRow: {  
    flexDirection: 'row',  
    gap: 10,  
  },  
    
  actionButton: {  
    flex: 1,  
    height: 44,  
    backgroundColor: '\#92CC41',  
    borderWidth: 4,  
    borderColor: '\#0D0D0D',  
    borderRadius: 4,  
    alignItems: 'center',  
    justifyContent: 'center',  
    shadowColor: '\#000',  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.3,  
    shadowRadius: 0,  
    elevation: 8,  
  },  
    
  secondaryActionButton: {  
    backgroundColor: '\#E53935',  
  },  
    
  actionButtonText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 12,  
    color: '\#0D0D0D',  
    letterSpacing: 1,  
  },  
    
  smallerText: {  
    fontSize: 10,  
  },  
    
  bottomNav: {  
    height: 66,  
    backgroundColor: '\#0D0D0D',  
    borderTopWidth: 2,  
    borderTopColor: '\#333',  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-around',  
    paddingBottom: 8,  
  },  
    
  navButton: {  
    alignItems: 'center',  
    justifyContent: 'center',  
    paddingHorizontal: 20,  
    paddingVertical: 8,  
    borderRadius: 4,  
  },  
    
  navButtonActive: {  
    backgroundColor: '\#F7D51D',  
  },  
    
  navButtonIcon: {  
    fontSize: 20,  
    marginBottom: 4,  
  },  
    
  navButtonText: {  
    fontFamily: 'PressStart2P',  
    fontSize: 10,  
    color: '\#F7D51D',  
    letterSpacing: 0.5,  
  },  
    
  navButtonTextActive: {  
    color: '\#0D0D0D',  
  },  
});  
And here are the animation components you'll need:  
typescript  
*// components/animations/LevelUpEffect.tsx*  
import React, { useEffect, useRef } from 'react';  
import { Animated, StyleSheet, Text } from 'react-native';  
export const LevelUpEffect: React.FC \= () \=\> {  
  const scaleAnim \= useRef(new Animated.Value(0)).current;  
  const opacityAnim \= useRef(new Animated.Value(1)).current;  
  useEffect(() \=\> {  
    Animated.parallel(\[  
      Animated.timing(scaleAnim, {  
        toValue: 2,  
        duration: 1000,  
        useNativeDriver: true,  
      }),  
      Animated.timing(opacityAnim, {  
        toValue: 0,  
        duration: 1000,  
        useNativeDriver: true,  
      }),  
    \]).start();  
  }, \[\]);  
  return (  
    \<Animated.View  
      style={\[  
        styles.container,  
        {  
          transform: \[{ scale: scaleAnim }\],  
          opacity: opacityAnim,  
        },  
      \]}  
    \>  
      \<Text style={styles.text}\>LEVEL UP\!\</Text\>  
      \<Text style={styles.burst}\>✨\</Text\>  
    \</Animated.View\>  
  );  
};  
const styles \= StyleSheet.create({  
  container: {  
    position: 'absolute',  
    alignItems: 'center',  
    justifyContent: 'center',  
  },  
  text: {  
    fontFamily: 'PressStart2P',  
    fontSize: 16,  
    color: '\#F7D51D',  
    textShadowColor: '\#0D0D0D',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 0,  
  },  
  burst: {  
    position: 'absolute',  
    fontSize: 60,  
  },  
});  
typescript  
*// components/animations/SparkleEffect.tsx*  
import React, { useEffect, useRef } from 'react';  
import { Animated, StyleSheet, Text, View } from 'react-native';  
export const SparkleEffect: React.FC \= () \=\> {  
  const translateY \= useRef(new Animated.Value(20)).current;  
  const opacity \= useRef(new Animated.Value(1)).current;  
  useEffect(() \=\> {  
    Animated.parallel(\[  
      Animated.timing(translateY, {  
        toValue: \-40,  
        duration: 800,  
        useNativeDriver: true,  
      }),  
      Animated.timing(opacity, {  
        toValue: 0,  
        duration: 800,  
        useNativeDriver: true,  
      }),  
    \]).start();  
  }, \[\]);  
  return (  
    \<View style={StyleSheet.absoluteFillObject}\>  
      {\[0, 1, 2\].map((index) \=\> (  
        \<Animated.Text  
          key={index}  
          style={\[  
            styles.sparkle,  
            {  
              left: \`${20 \+ index \* 30}%\`,  
              transform: \[{ translateY }\],  
              opacity,  
            },  
          \]}  
        \>  
          ✨  
        \</Animated.Text\>  
      ))}  
    \</View\>  
  );  
};  
const styles \= StyleSheet.create({  
  sparkle: {  
    position: 'absolute',  
    bottom: 20,  
    fontSize: 20,  
  },  
});  
Key adaptations for your tech stack:

1. **Font Loading**: Uses expo-font to load Press Start 2P  
2. **Gradients**: Uses expo-linear-gradient for GameBoy tint  
3. **Haptics**: Added expo-haptics for tactile feedback  
4. **SVG**: You'll need to add react-native-svg for the power ring  
5. **TypeScript**: Fully typed components  
6. **Performance**: Uses useNativeDriver for smooth animations  
7. **Structure**: Modular components ready for your architecture

For Supabase integration, you'd add:  
typescript  
*// services/characterService.ts*  
import { supabase } from '../lib/supabase';  
export interface Character {  
  id: string;  
  user\_id: string;  
  name: string;  
  level: number;  
  health: number;  
  energy: number;  
  strength: number;  
  motivation: number;  
  exp: number;  
  created\_at: string;  
  updated\_at: string;  
}  
export const characterService \= {  
  async getCharacter(userId: string): Promise\<Character | null\> {  
    const { data, error } \= await supabase  
      .from('characters')  
      .select('\*')  
      .eq('user\_id', userId)  
      .single();  
      
    if (error) {  
      console.error('Error fetching character:', error);  
      return null;  
    }  
      
    return data;  
  },  
  async updateStats(characterId: string, stats: Partial\<Character\>) {  
    const { data, error } \= await supabase  
      .from('characters')  
      .update(stats)  
      .eq('id', characterId);  
      
    return { data, error };  
  },  
};  
