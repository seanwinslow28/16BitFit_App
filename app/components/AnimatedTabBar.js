/**
 * Animated Tab Bar Component
 * GameBoy-style tab navigation with smooth animations
 * Following MetaSystemsAgent patterns for intuitive navigation
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';
import { PressAnimation } from './MicroAnimations';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy colors
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  gray: '#666',
  white: '#FFFFFF',
};

const AnimatedTabBar = ({
  tabs = [],
  activeTab = 0,
  onTabPress = () => {},
  style,
}) => {
  // Animation values
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const tabScales = useRef(
    tabs.map(() => new Animated.Value(1))
  ).current;
  const tabOpacities = useRef(
    tabs.map((_, index) => new Animated.Value(index === activeTab ? 1 : 0.7))
  ).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Tab measurements
  const [tabLayouts, setTabLayouts] = useState([]);
  const tabWidth = screenWidth / tabs.length;

  useEffect(() => {
    // Animate indicator to active tab
    if (tabLayouts[activeTab]) {
      Animated.spring(indicatorPosition, {
        toValue: tabLayouts[activeTab].x,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }

    // Animate tab opacities
    tabOpacities.forEach((opacity, index) => {
      Animated.timing(opacity, {
        toValue: index === activeTab ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Pulse glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [activeTab, tabLayouts]);

  const handleTabPress = async (index) => {
    if (index === activeTab) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Sound effect
    await SoundFXManager.playSound('ui_tab_switch');

    // Animate pressed tab
    Animated.sequence([
      Animated.timing(tabScales[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(tabScales[index], {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onTabPress(index);
  };

  const measureTab = (index, event) => {
    const { x, width } = event.nativeEvent.layout;
    const newLayouts = [...tabLayouts];
    newLayouts[index] = { x, width };
    setTabLayouts(newLayouts);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['rgba(13, 13, 13, 0.95)', COLORS.dark]}
        style={styles.backgroundGradient}
      />

      {/* Active indicator */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            width: tabWidth - 20,
            transform: [
              { translateX: indicatorPosition },
              { translateX: 10 }, // Center offset
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary, '#7eb635']}
          style={styles.indicatorGradient}
        />
        
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.indicatorGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPress(index)}
            onLayout={(event) => measureTab(index, event)}
            activeOpacity={0.8}
          >
            <PressAnimation scale={0.9}>
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    opacity: tabOpacities[index],
                    transform: [{ scale: tabScales[index] }],
                  },
                ]}
              >
                {/* Tab icon */}
                <Animated.Text
                  style={[
                    styles.tabIcon,
                    {
                      transform: [
                        {
                          translateY: index === activeTab
                            ? new Animated.Value(-2)
                            : new Animated.Value(0),
                        },
                      ],
                    },
                  ]}
                >
                  {tab.icon}
                </Animated.Text>
                
                {/* Tab label */}
                <Text
                  style={[
                    styles.tabLabel,
                    pixelFont,
                    index === activeTab && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
                
                {/* Badge if present */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Animated.View
                    style={[
                      styles.badge,
                      {
                        transform: [
                          {
                            scale: index === activeTab
                              ? new Animated.Value(1.1)
                              : new Animated.Value(1),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, pixelFont]}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </Animated.View>
                )}
              </Animated.View>
            </PressAnimation>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top border line */}
      <View style={styles.topBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 65,
    backgroundColor: COLORS.dark,
    position: 'relative',
  },

  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },

  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  tabLabel: {
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },

  indicatorGradient: {
    flex: 1,
  },

  indicatorGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },

  badge: {
    position: 'absolute',
    top: 2,
    right: -8,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  badgeText: {
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },
});

export default AnimatedTabBar;