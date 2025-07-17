/**
 * Trading System Component
 * Trade customization items between friends
 * Following MetaSystemsAgent patterns for item exchange
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';
import SoundFXManager from '../services/SoundFXManager';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  gray: '#666',
  white: '#FFFFFF',
};

// Item rarities
const RARITY = {
  COMMON: { name: 'Common', color: COLORS.gray, value: 1 },
  RARE: { name: 'Rare', color: COLORS.blue, value: 3 },
  EPIC: { name: 'Epic', color: '#9b59b6', value: 5 },
  LEGENDARY: { name: 'Legendary', color: COLORS.yellow, value: 10 },
};

// Mock inventory items
const MOCK_INVENTORY = [
  { id: '1', name: 'Basic Headband', type: 'headwear', rarity: 'COMMON', icon: '🎽', tradeable: true },
  { id: '2', name: 'Power Gloves', type: 'gloves', rarity: 'RARE', icon: '🥊', tradeable: true },
  { id: '3', name: 'Champion Belt', type: 'belt', rarity: 'EPIC', icon: '🏆', tradeable: true },
  { id: '4', name: 'Speed Shoes', type: 'footwear', rarity: 'RARE', icon: '👟', tradeable: true },
  { id: '5', name: 'Energy Drink', type: 'consumable', rarity: 'COMMON', icon: '🥤', tradeable: true, quantity: 5 },
  { id: '6', name: 'Protein Shake', type: 'consumable', rarity: 'RARE', icon: '🥛', tradeable: true, quantity: 3 },
  { id: '7', name: 'Golden Dumbbell', type: 'special', rarity: 'LEGENDARY', icon: '🏋️', tradeable: false },
];

// Mock pending trades
const MOCK_TRADES = [
  {
    id: 't1',
    partner: { username: 'FitNinja', level: 15, avatar: '🥷' },
    status: 'pending',
    youOffer: [{ id: '1', name: 'Basic Headband', icon: '🎽' }],
    theyOffer: [{ id: '4', name: 'Speed Shoes', icon: '👟' }],
    timestamp: Date.now() - 3600000,
  },
  {
    id: 't2',
    partner: { username: 'GymWarrior', level: 20, avatar: '⚔️' },
    status: 'received',
    youOffer: [],
    theyOffer: [{ id: '2', name: 'Power Gloves', icon: '🥊' }],
    timestamp: Date.now() - 7200000,
  },
];

const TradingSystem = ({
  currentUser = { username: 'Player', level: 1 },
  friends = [],
  onNavigate = () => {},
}) => {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [trades, setTrades] = useState(MOCK_TRADES);
  const [selectedTab, setSelectedTab] = useState('inventory'); // inventory, trades, history
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [myOffer, setMyOffer] = useState([]);
  const [theirRequest, setTheirRequest] = useState([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
  }, []);

  const handleTabChange = async (tab) => {
    await SoundFXManager.playTabSwitch();
    setSelectedTab(tab);
  };

  const handleSelectItem = (item) => {
    if (!item.tradeable) {
      SoundFXManager.playError();
      return;
    }
    
    SoundFXManager.playButtonPress();
    if (myOffer.find(i => i.id === item.id)) {
      setMyOffer(myOffer.filter(i => i.id !== item.id));
    } else {
      setMyOffer([...myOffer, item]);
    }
  };

  const handleSendTrade = async () => {
    if (myOffer.length === 0 && theirRequest.length === 0) {
      await SoundFXManager.playError();
      return;
    }
    
    await SoundFXManager.playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const newTrade = {
      id: `t${Date.now()}`,
      partner: selectedFriend,
      status: 'pending',
      youOffer: myOffer,
      theyOffer: theirRequest,
      timestamp: Date.now(),
    };
    
    setTrades([newTrade, ...trades]);
    setShowTradeModal(false);
    setMyOffer([]);
    setTheirRequest([]);
  };

  const handleAcceptTrade = async (trade) => {
    await SoundFXManager.playSuccess();
    
    // Update trade status
    setTrades(trades.map(t => 
      t.id === trade.id ? { ...t, status: 'completed' } : t
    ));
    
    // Update inventory (in real app, this would sync with backend)
    // Remove offered items, add received items
  };

  const handleDeclineTrade = async (trade) => {
    await SoundFXManager.playSound('ui_error');
    
    setTrades(trades.map(t => 
      t.id === trade.id ? { ...t, status: 'declined' } : t
    ));
  };

  const calculateTradeValue = (items) => {
    return items.reduce((total, item) => {
      const rarityInfo = RARITY[item.rarity || 'COMMON'];
      return total + rarityInfo.value * (item.quantity || 1);
    }, 0);
  };

  const renderInventoryItem = ({ item }) => {
    const rarityInfo = RARITY[item.rarity];
    const isSelected = myOffer.find(i => i.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.inventoryItem,
          { borderColor: rarityInfo.color },
          isSelected && styles.selectedItem,
          !item.tradeable && styles.untradeableItem,
        ]}
        onPress={() => handleSelectItem(item)}
        disabled={!item.tradeable}
      >
        <Text style={styles.itemIcon}>{item.icon}</Text>
        <Text style={[styles.itemName, pixelFont]}>{item.name}</Text>
        <Text style={[styles.itemRarity, pixelFont, { color: rarityInfo.color }]}>
          {rarityInfo.name}
        </Text>
        {item.quantity && (
          <Text style={[styles.itemQuantity, pixelFont]}>x{item.quantity}</Text>
        )}
        {!item.tradeable && (
          <Text style={[styles.untradeableText, pixelFont]}>BOUND</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrade = (trade) => {
    const isPending = trade.status === 'pending';
    const isReceived = trade.status === 'received';
    const myValue = calculateTradeValue(trade.youOffer);
    const theirValue = calculateTradeValue(trade.theyOffer);
    
    return (
      <View key={trade.id} style={styles.tradeCard}>
        <View style={styles.tradeHeader}>
          <View style={styles.tradePartner}>
            <Text style={styles.partnerAvatar}>{trade.partner.avatar}</Text>
            <View>
              <Text style={[styles.partnerName, pixelFont]}>{trade.partner.username}</Text>
              <Text style={[styles.partnerLevel, pixelFont]}>LVL {trade.partner.level}</Text>
            </View>
          </View>
          <View style={styles.tradeStatus}>
            <Text style={[styles.statusText, pixelFont, 
              trade.status === 'pending' && { color: COLORS.yellow },
              trade.status === 'completed' && { color: COLORS.primary },
              trade.status === 'declined' && { color: COLORS.red },
            ]}>
              {trade.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.tradeContent}>
          <View style={styles.offerSection}>
            <Text style={[styles.offerLabel, pixelFont]}>YOU OFFER:</Text>
            <View style={styles.offerItems}>
              {trade.youOffer.length === 0 ? (
                <Text style={[styles.noItems, pixelFont]}>Nothing</Text>
              ) : (
                trade.youOffer.map(item => (
                  <View key={item.id} style={styles.miniItem}>
                    <Text style={styles.miniItemIcon}>{item.icon}</Text>
                    <Text style={[styles.miniItemName, pixelFont]}>{item.name}</Text>
                  </View>
                ))
              )}
            </View>
            <Text style={[styles.valueText, pixelFont]}>Value: {myValue}</Text>
          </View>
          
          <Text style={styles.tradeArrow}>⇄</Text>
          
          <View style={styles.offerSection}>
            <Text style={[styles.offerLabel, pixelFont]}>THEY OFFER:</Text>
            <View style={styles.offerItems}>
              {trade.theyOffer.length === 0 ? (
                <Text style={[styles.noItems, pixelFont]}>Nothing</Text>
              ) : (
                trade.theyOffer.map(item => (
                  <View key={item.id} style={styles.miniItem}>
                    <Text style={styles.miniItemIcon}>{item.icon}</Text>
                    <Text style={[styles.miniItemName, pixelFont]}>{item.name}</Text>
                  </View>
                ))
              )}
            </View>
            <Text style={[styles.valueText, pixelFont]}>Value: {theirValue}</Text>
          </View>
        </View>
        
        {isReceived && (
          <View style={styles.tradeActions}>
            <TouchableOpacity
              style={[styles.tradeButton, styles.declineButton]}
              onPress={() => handleDeclineTrade(trade)}
            >
              <Text style={[styles.tradeButtonText, pixelFont]}>DECLINE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tradeButton, styles.acceptButton]}
              onPress={() => handleAcceptTrade(trade)}
            >
              <Text style={[styles.tradeButtonText, pixelFont]}>ACCEPT</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.dark, 'rgba(13, 13, 13, 0.95)', COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('social')}
        >
          <Text style={[styles.backText, pixelFont]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, pixelFont]}>TRADING POST</Text>
        <TouchableOpacity
          style={styles.newTradeButton}
          onPress={() => setShowTradeModal(true)}
        >
          <Text style={styles.newTradeIcon}>🤝</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'inventory' && styles.activeTab]}
          onPress={() => handleTabChange('inventory')}
        >
          <Text style={[styles.tabText, pixelFont]}>INVENTORY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trades' && styles.activeTab]}
          onPress={() => handleTabChange('trades')}
        >
          <Text style={[styles.tabText, pixelFont]}>TRADES</Text>
          {trades.filter(t => t.status === 'received').length > 0 && (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, pixelFont]}>
                {trades.filter(t => t.status === 'received').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => handleTabChange('history')}
        >
          <Text style={[styles.tabText, pixelFont]}>HISTORY</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {selectedTab === 'inventory' && (
          <FlatList
            data={inventory}
            renderItem={renderInventoryItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.inventoryGrid}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {selectedTab === 'trades' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {trades.filter(t => t.status !== 'completed' && t.status !== 'declined').map(renderTrade)}
            {trades.filter(t => t.status !== 'completed' && t.status !== 'declined').length === 0 && (
              <Text style={[styles.emptyText, pixelFont]}>No active trades</Text>
            )}
          </ScrollView>
        )}
        
        {selectedTab === 'history' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {trades.filter(t => t.status === 'completed' || t.status === 'declined').map(renderTrade)}
            {trades.filter(t => t.status === 'completed' || t.status === 'declined').length === 0 && (
              <Text style={[styles.emptyText, pixelFont]}>No trade history</Text>
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Trade Modal */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, pixelFont]}>NEW TRADE</Text>
            
            {/* Friend Selection */}
            <View style={styles.friendSelector}>
              <Text style={[styles.selectorLabel, pixelFont]}>SELECT FRIEND:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { username: 'FitNinja', level: 15, avatar: '🥷' },
                  { username: 'GymWarrior', level: 20, avatar: '⚔️' },
                  { username: 'CardioKing', level: 12, avatar: '🏃' },
                ].map(friend => (
                  <TouchableOpacity
                    key={friend.username}
                    style={[
                      styles.friendOption,
                      selectedFriend?.username === friend.username && styles.selectedFriend,
                    ]}
                    onPress={() => setSelectedFriend(friend)}
                  >
                    <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                    <Text style={[styles.friendName, pixelFont]}>{friend.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Offer Display */}
            <View style={styles.offerDisplay}>
              <View style={styles.offerColumn}>
                <Text style={[styles.offerTitle, pixelFont]}>YOUR OFFER</Text>
                <View style={styles.offerBox}>
                  {myOffer.map(item => (
                    <View key={item.id} style={styles.offerItem}>
                      <Text>{item.icon}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.offerColumn}>
                <Text style={[styles.offerTitle, pixelFont]}>REQUEST</Text>
                <View style={styles.offerBox}>
                  {theirRequest.map(item => (
                    <View key={item.id} style={styles.offerItem}>
                      <Text>{item.icon}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTradeModal(false);
                  setMyOffer([]);
                  setTheirRequest([]);
                  setSelectedFriend(null);
                }}
              >
                <Text style={[styles.modalButtonText, pixelFont]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendTrade}
                disabled={!selectedFriend || (myOffer.length === 0 && theirRequest.length === 0)}
              >
                <Text style={[styles.modalButtonText, pixelFont]}>SEND</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },

  backButton: {
    width: 80,
  },

  backText: {
    color: COLORS.primary,
    fontSize: 12,
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    letterSpacing: 2,
  },

  newTradeButton: {
    width: 80,
    alignItems: 'flex-end',
  },

  newTradeIcon: {
    fontSize: 24,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },

  activeTab: {
    backgroundColor: 'rgba(146, 204, 65, 0.2)',
  },

  tabText: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  badge: {
    position: 'absolute',
    top: 5,
    right: 20,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  badgeText: {
    fontSize: 8,
    color: COLORS.white,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  inventoryGrid: {
    paddingBottom: 20,
  },

  inventoryItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedItem: {
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  untradeableItem: {
    opacity: 0.5,
  },

  itemIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  itemName: {
    fontSize: 8,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  itemRarity: {
    fontSize: 7,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  itemQuantity: {
    fontSize: 8,
    color: COLORS.yellow,
    marginTop: 2,
  },

  untradeableText: {
    position: 'absolute',
    bottom: 2,
    fontSize: 6,
    color: COLORS.red,
    letterSpacing: 0.5,
  },

  tradeCard: {
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    marginBottom: 12,
  },

  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tradePartner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  partnerAvatar: {
    fontSize: 24,
  },

  partnerName: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  partnerLevel: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.3,
  },

  statusText: {
    fontSize: 10,
    letterSpacing: 1,
  },

  tradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  offerSection: {
    flex: 1,
  },

  offerLabel: {
    fontSize: 9,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  offerItems: {
    gap: 4,
  },

  miniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  miniItemIcon: {
    fontSize: 16,
  },

  miniItemName: {
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  noItems: {
    fontSize: 8,
    color: COLORS.gray,
    fontStyle: 'italic',
  },

  valueText: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.3,
    marginTop: 4,
  },

  tradeArrow: {
    fontSize: 20,
    color: COLORS.primary,
  },

  tradeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
  },

  tradeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 2,
  },

  declineButton: {
    borderColor: COLORS.red,
    backgroundColor: 'transparent',
  },

  acceptButton: {
    borderColor: COLORS.dark,
    backgroundColor: COLORS.primary,
  },

  tradeButtonText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 50,
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: screenWidth - 40,
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 20,
  },

  modalTitle: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },

  friendSelector: {
    marginBottom: 20,
  },

  selectorLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 10,
  },

  friendOption: {
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selectedFriend: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(146, 204, 65, 0.3)',
  },

  friendAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },

  friendName: {
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  offerDisplay: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },

  offerColumn: {
    flex: 1,
  },

  offerTitle: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },

  offerBox: {
    height: 100,
    backgroundColor: 'rgba(146, 204, 65, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },

  offerItem: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 2,
  },

  cancelButton: {
    borderColor: COLORS.gray,
    backgroundColor: 'transparent',
  },

  sendButton: {
    borderColor: COLORS.dark,
    backgroundColor: COLORS.primary,
  },

  modalButtonText: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default TradingSystem;