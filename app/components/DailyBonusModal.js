/**
 * Daily Bonus Modal Component
 * GameBoy-style daily login rewards display
 * Following MetaSystemsAgent patterns for reward presentation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import DailyBonusManager from '../services/DailyBonusManager';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  white: '#FFFFFF',
  gray: '#666',
};

const DailyBonusModal = ({
  visible = false,
  onClose = () => {},
  onClaimRewards = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [bonusData, setBonusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const sparkleAnims = useRef(
    Array(6).fill(0).map(() => new Animated.Value(0))
  ).current;
  
  // Calendar animation
  const dayAnims = useRef(
    Array(7).fill(0).map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      loadBonusData();
      startEntranceAnimation();
    }
  }, [visible]);

  const loadBonusData = async () => {
    setIsLoading(true);
    const summary = DailyBonusManager.getSummary();
    setBonusData(summary);
    setIsLoading(false);
    setClaimed(!summary.canClaimToday);
  };

  const startEntranceAnimation = () => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(100);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate calendar days
      animateCalendarDays();
    });
  };

  const animateCalendarDays = () => {
    dayAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 50);
    });
  };

  const animateSparkles = () => {
    sparkleAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.2,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  };

  const handleClaim = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const result = await DailyBonusManager.claimDailyBonus();
    if (result.success) {
      setClaimed(true);
      animateSparkles();
      onClaimRewards(result.rewards);
      
      // Close after animation
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible || isLoading || !bonusData) return null;

  const renderWeeklyCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        <Text style={[styles.calendarTitle, pixelFont]}>WEEKLY PROGRESS</Text>
        <View style={styles.weekGrid}>
          {bonusData.weeklyProgress.map((day, index) => (
            <Animated.View
              key={day.day}
              style={[
                styles.dayBox,
                day.claimed && styles.dayBoxClaimed,
                day.isToday && styles.dayBoxToday,
                {
                  opacity: dayAnims[index].opacity,
                  transform: [{ scale: dayAnims[index].scale }],
                },
              ]}
            >
              <Text style={[styles.dayText, pixelFont]}>{day.day}</Text>
              {day.claimed && <Text style={styles.checkmark}>✓</Text>}
              {day.isToday && !day.claimed && !claimed && (
                <Text style={styles.todayIndicator}>!</Text>
              )}
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  const renderStreakInfo = () => {
    return (
      <View style={styles.streakContainer}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={[styles.streakValue, pixelFont]}>
              {bonusData.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, pixelFont]}>CURRENT</Text>
          </View>
          
          <View style={styles.streakDivider} />
          
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>⭐</Text>
            <Text style={[styles.streakValue, pixelFont]}>
              {bonusData.longestStreak}
            </Text>
            <Text style={[styles.streakLabel, pixelFont]}>BEST</Text>
          </View>
          
          <View style={styles.streakDivider} />
          
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>📅</Text>
            <Text style={[styles.streakValue, pixelFont]}>
              {bonusData.totalLogins}
            </Text>
            <Text style={[styles.streakLabel, pixelFont]}>TOTAL</Text>
          </View>
        </View>
        
        {bonusData.nextMilestone && (
          <View style={styles.milestoneHint}>
            <Text style={[styles.milestoneText, pixelFont]}>
              {bonusData.nextMilestone.daysRemaining} days until {bonusData.nextMilestone.streak} day milestone!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderRewardPreview = () => {
    const dayRewards = [
      { day: 'MON', xp: 50, coins: 10 },
      { day: 'TUE', xp: 75, coins: 15 },
      { day: 'WED', xp: 100, coins: 20, special: '🥤' },
      { day: 'THU', xp: 125, coins: 25 },
      { day: 'FRI', xp: 150, coins: 30 },
      { day: 'SAT', xp: 175, coins: 35, special: '🥛' },
      { day: 'SUN', xp: 250, coins: 50, special: '🏆' },
    ];
    
    const currentDay = bonusData.dayInCycle - 1;
    
    return (
      <View style={styles.rewardPreview}>
        <Text style={[styles.rewardTitle, pixelFont]}>DAILY REWARDS</Text>
        <View style={styles.rewardTrack}>
          {dayRewards.map((reward, index) => (
            <View
              key={reward.day}
              style={[
                styles.rewardDay,
                index === currentDay && styles.rewardDayActive,
                index < currentDay && styles.rewardDayClaimed,
              ]}
            >
              <Text style={[styles.rewardDayText, pixelFont]}>{reward.day}</Text>
              {reward.special && <Text style={styles.rewardSpecial}>{reward.special}</Text>}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, '#7fb435', COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contentGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, pixelFont]}>DAILY BONUS</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={[styles.closeButtonText, pixelFont]}>×</Text>
              </TouchableOpacity>
            </View>
            
            {/* Weekly Calendar */}
            {renderWeeklyCalendar()}
            
            {/* Streak Info */}
            {renderStreakInfo()}
            
            {/* Reward Preview */}
            {renderRewardPreview()}
            
            {/* Claim Button */}
            <TouchableOpacity
              style={[
                styles.claimButton,
                claimed && styles.claimButtonDisabled,
              ]}
              onPress={handleClaim}
              disabled={claimed}
            >
              <Text style={[styles.claimButtonText, pixelFont]}>
                {claimed ? 'CLAIMED TODAY' : 'CLAIM BONUS!'}
              </Text>
              {!claimed && (
                <View style={styles.claimRewards}>
                  <Text style={[styles.claimRewardText, pixelFont]}>
                    +{50 + (bonusData.dayInCycle - 1) * 25} XP
                  </Text>
                  <Text style={[styles.claimRewardText, pixelFont]}>
                    +{10 + (bonusData.dayInCycle - 1) * 5} 🪙
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Sparkle effects */}
            {sparkleAnims.map((anim, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.sparkle,
                  {
                    opacity: anim,
                    transform: [
                      { scale: anim },
                      {
                        translateX: (Math.random() - 0.5) * 200,
                      },
                      {
                        translateY: (Math.random() - 0.5) * 200,
                      },
                    ],
                  },
                ]}
              >
                ✨
              </Animated.Text>
            ))}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  modalContent: {
    width: Math.min(screenWidth - 40, 380),
    maxHeight: '80%',
  },

  contentGradient: {
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.dark,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    color: COLORS.dark,
    letterSpacing: 2,
  },

  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 24,
    color: COLORS.dark,
  },

  calendarContainer: {
    marginBottom: 20,
  },

  calendarTitle: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },

  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },

  dayBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.1)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  dayBoxClaimed: {
    backgroundColor: COLORS.yellow,
  },

  dayBoxToday: {
    borderColor: COLORS.yellow,
    borderWidth: 3,
  },

  dayText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },

  checkmark: {
    position: 'absolute',
    fontSize: 16,
    color: COLORS.dark,
  },

  todayIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 12,
    color: COLORS.red,
  },

  streakContainer: {
    backgroundColor: 'rgba(13, 13, 13, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  streakItem: {
    alignItems: 'center',
  },

  streakIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  streakValue: {
    fontSize: 18,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 2,
  },

  streakLabel: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 0.5,
    opacity: 0.7,
  },

  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.dark,
    opacity: 0.2,
  },

  milestoneHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 13, 13, 0.2)',
  },

  milestoneText: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.8,
  },

  rewardPreview: {
    marginBottom: 20,
  },

  rewardTitle: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },

  rewardTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
  },

  rewardDay: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(13, 13, 13, 0.1)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },

  rewardDayActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.dark,
  },

  rewardDayClaimed: {
    opacity: 0.5,
  },

  rewardDayText: {
    fontSize: 7,
    color: COLORS.dark,
    letterSpacing: 0.3,
  },

  rewardSpecial: {
    fontSize: 10,
    marginTop: 2,
  },

  claimButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    paddingVertical: 16,
    alignItems: 'center',
  },

  claimButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },

  claimButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  claimRewards: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },

  claimRewardText: {
    fontSize: 10,
    color: COLORS.dark,
    letterSpacing: 0.5,
    opacity: 0.8,
  },

  sparkle: {
    position: 'absolute',
    fontSize: 20,
    top: '50%',
    left: '50%',
  },
});

export default DailyBonusModal;