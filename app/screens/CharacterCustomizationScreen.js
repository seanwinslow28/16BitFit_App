/**
 * Character Customization Screen
 * GameBoy-styled character appearance editor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import CharacterPreview from '../components/CharacterPreview';
import CustomizationDatabase from '../components/CustomizationDatabase';
import UnlockSystem from '../components/UnlockSystem';
import EquipmentSystem from '../components/EquipmentSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Locked items
  blue: '#3498db',         // Rare items
  purple: '#9b59b6',       // Epic items
  orange: '#f39c12',       // Legendary items
};

// Customization categories
const CATEGORIES = [
  { id: 'body', name: 'BODY', icon: '👤' },
  { id: 'hair', name: 'HAIR', icon: '💇' },
  { id: 'outfit', name: 'OUTFIT', icon: '👕' },
  { id: 'accessories', name: 'GEAR', icon: '🎒' },
  { id: 'effects', name: 'EFFECTS', icon: '✨' },
];

const CharacterCustomizationScreen = ({
  playerStats = {},
  currentAppearance = {},
  unlockedItems = [],
  onNavigate = () => {},
  onSaveCustomization = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('body');
  const [tempAppearance, setTempAppearance] = useState(currentAppearance);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnlockInfo, setShowUnlockInfo] = useState(false);
  const [selectedLockedItem, setSelectedLockedItem] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const previewScaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Get customization options
  const allItems = CustomizationDatabase.getAllItems();
  const categoryItems = CustomizationDatabase.getItemsByCategory(selectedCategory);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // No rotation animation needed
  }, []);

  const handleCategorySelect = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handleItemSelect = (item) => {
    const isUnlocked = UnlockSystem.isItemUnlocked(item.id, unlockedItems);
    
    if (!isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setSelectedLockedItem(item);
      setShowUnlockInfo(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update appearance
    setTempAppearance(prev => ({
      ...prev,
      [selectedCategory]: item.id,
    }));
    setHasChanges(true);

    // Animate preview
    Animated.sequence([
      Animated.spring(previewScaleAnim, {
        toValue: 1.1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(previewScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    if (!hasChanges) {
      onNavigate('home');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveCustomization(tempAppearance);
    
    Alert.alert(
      'Customization Saved!',
      'Your character looks awesome!',
      [{ text: 'OK', onPress: () => onNavigate('home') }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Appearance?',
      'This will reset your character to default appearance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setTempAppearance(CustomizationDatabase.getDefaultAppearance());
            setHasChanges(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      ]
    );
  };

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {CATEGORIES.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
          onPress={() => handleCategorySelect(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[styles.categoryText, pixelFont]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItemGrid = () => {
    const items = categoryItems;
    
    return (
      <View style={styles.itemGrid}>
        {items.map(item => {
          const isUnlocked = UnlockSystem.isItemUnlocked(item.id, unlockedItems);
          const isSelected = tempAppearance[selectedCategory] === item.id;
          const rarityColor = getRarityColor(item.rarity);
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                isSelected && styles.itemCardSelected,
                !isUnlocked && styles.itemCardLocked,
                isSelected && { borderColor: rarityColor }
              ]}
              onPress={() => handleItemSelect(item)}
              activeOpacity={0.8}
            >
              <View style={styles.itemIconContainer}>
                <Text style={styles.itemIcon}>
                  {isUnlocked ? item.icon : '🔒'}
                </Text>
              </View>
              
              <Text style={[styles.itemName, pixelFont]}>
                {item.name}
              </Text>
              
              {!isUnlocked && (
                <View style={styles.lockInfo}>
                  <Text style={[styles.lockText, pixelFont]}>
                    LV.{item.unlockRequirement.level || 0}
                  </Text>
                </View>
              )}
              
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedIcon}>✓</Text>
                </View>
              )}
              
              <View style={[
                styles.rarityIndicator,
                { backgroundColor: rarityColor }
              ]} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderUnlockInfo = () => {
    if (!showUnlockInfo || !selectedLockedItem) return null;
    
    return (
      <View style={styles.unlockModal}>
        <View style={styles.unlockContent}>
          <Text style={styles.unlockIcon}>{selectedLockedItem.icon}</Text>
          <Text style={[styles.unlockTitle, pixelFont]}>
            {selectedLockedItem.name}
          </Text>
          <Text style={[styles.unlockDescription, pixelFont]}>
            {selectedLockedItem.description}
          </Text>
          
          <View style={styles.unlockRequirements}>
            <Text style={[styles.requirementsTitle, pixelFont]}>
              UNLOCK REQUIREMENTS:
            </Text>
            {selectedLockedItem.unlockRequirement.level && (
              <Text style={[styles.requirementItem, pixelFont]}>
                • Reach Level {selectedLockedItem.unlockRequirement.level}
              </Text>
            )}
            {selectedLockedItem.unlockRequirement.achievement && (
              <Text style={[styles.requirementItem, pixelFont]}>
                • {selectedLockedItem.unlockRequirement.achievement}
              </Text>
            )}
            {selectedLockedItem.unlockRequirement.special && (
              <Text style={[styles.requirementItem, pixelFont]}>
                • {selectedLockedItem.unlockRequirement.special}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.unlockCloseButton}
            onPress={() => {
              setShowUnlockInfo(false);
              setSelectedLockedItem(null);
            }}
          >
            <Text style={[styles.unlockCloseText, pixelFont]}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return COLORS.primary;
      case 'uncommon': return COLORS.blue;
      case 'rare': return COLORS.purple;
      case 'epic': return COLORS.yellow;
      case 'legendary': return COLORS.orange;
      default: return COLORS.primary;
    }
  };

  const renderCharacterStats = () => {
    // Calculate equipment bonuses
    const equipmentBonuses = EquipmentSystem.calculateEquipmentBonuses(tempAppearance);
    const hasAnyBonus = Object.values(equipmentBonuses).some(val => val > 0);
    
    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, pixelFont]}>CHARACTER STATS</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, pixelFont]}>LEVEL</Text>
            <Text style={[styles.statValue, pixelFont]}>{playerStats.level || 1}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, pixelFont]}>EVOLUTION</Text>
            <Text style={[styles.statValue, pixelFont]}>
              {getEvolutionName(playerStats.evolutionStage || 0)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, pixelFont]}>ITEMS</Text>
            <Text style={[styles.statValue, pixelFont]}>
              {unlockedItems.length}/{allItems.length}
            </Text>
          </View>
        </View>
        
        {/* Equipment Bonuses */}
        {hasAnyBonus && (
          <View style={styles.bonusSection}>
            <Text style={[styles.bonusTitle, pixelFont]}>EQUIPMENT BONUSES</Text>
            <View style={styles.bonusGrid}>
              {Object.entries(equipmentBonuses).map(([stat, value]) => {
                if (value === 0) return null;
                return (
                  <View key={stat} style={styles.bonusItem}>
                    <Text style={[styles.bonusStat, pixelFont]}>
                      {stat.toUpperCase()}
                    </Text>
                    <Text style={[styles.bonusValue, pixelFont, { color: COLORS.primary }]}>
                      +{value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const getEvolutionName = (stage) => {
    const names = ['NEWBIE', 'TRAINEE', 'FIGHTER', 'CHAMPION'];
    return names[stage] || 'NEWBIE';
  };

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom,
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (hasChanges) {
              Alert.alert(
                'Unsaved Changes',
                'Do you want to save your customization?',
                [
                  { text: 'Discard', style: 'destructive', onPress: () => onNavigate('home') },
                  { text: 'Save', onPress: handleSave }
                ]
              );
            } else {
              onNavigate('home');
            }
          }}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>CUSTOMIZE</Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={[styles.resetText, pixelFont]}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* Character Preview */}
      <Animated.View 
        style={[
          styles.previewContainer,
          {
            transform: [
              { scale: previewScaleAnim }
            ]
          }
        ]}
      >
        <CharacterPreview
          appearance={tempAppearance}
          evolutionStage={playerStats.evolutionStage || 0}
          size={200}
        />
      </Animated.View>

      {/* Character Stats */}
      {renderCharacterStats()}

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Item Grid */}
      <ScrollView 
        style={styles.itemScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemScrollContent}
      >
        {renderItemGrid()}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <Text style={[styles.saveButtonText, pixelFont]}>
            {hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unlock Info Modal */}
      {renderUnlockInfo()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.dark,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  resetButton: {
    width: 80,
    alignItems: 'flex-end',
  },

  resetText: {
    color: COLORS.yellow,
    fontSize: 12,
  },

  previewContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  statsContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },

  statsTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  categoryScroll: {
    maxHeight: 80,
    marginTop: 20,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryTab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    marginRight: 10,
  },

  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.dark,
  },

  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  itemScroll: {
    flex: 1,
    marginTop: 20,
  },

  itemScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  itemCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },

  itemCardSelected: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  itemCardLocked: {
    opacity: 0.5,
  },

  itemIconContainer: {
    marginBottom: 8,
  },

  itemIcon: {
    fontSize: 32,
  },

  itemName: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  lockInfo: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },

  lockText: {
    fontSize: 6,
    color: COLORS.red,
    letterSpacing: 0.3,
  },

  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedIcon: {
    fontSize: 12,
    color: COLORS.dark,
  },

  rarityIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  saveButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  unlockModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  unlockContent: {
    backgroundColor: '#0a0a0a',
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },

  unlockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  unlockTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },

  unlockDescription: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },

  unlockRequirements: {
    width: '100%',
    marginBottom: 20,
  },

  requirementsTitle: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },

  requirementItem: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  unlockCloseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  unlockCloseText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
  },

  bonusSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  bonusTitle: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },

  bonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },

  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  bonusStat: {
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.3,
  },

  bonusValue: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export default CharacterCustomizationScreen;