/**
 * Network Status Indicator
 * Shows current network connection status
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import NetworkManager from '../services/NetworkManager';
import { pixelFont } from '../hooks/useFonts';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
};

const NetworkStatusIndicator = ({ 
  position = 'top',
  showDetails = false,
  onPress = () => {},
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [queueSize, setQueueSize] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get initial state
    setIsOnline(NetworkManager.isOnline());
    setConnectionType(NetworkManager.getConnectionType());
    setQueueSize(NetworkManager.getQueueSize());
    
    // Add listener for network changes
    NetworkManager.addListener('status-indicator', (data) => {
      const wasOffline = !isOnline;
      setIsOnline(data.isConnected);
      setConnectionType(data.connectionType);
      
      // Show banner when going offline or coming back online
      if (wasOffline !== data.isConnected || (!wasOffline && !data.isConnected)) {
        showStatusBanner();
      }
      
      // Update queue size
      setQueueSize(NetworkManager.getQueueSize());
    });
    
    // Start pulse animation for offline state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => {
      NetworkManager.removeListener('status-indicator');
    };
  }, [isOnline]);

  const showStatusBanner = () => {
    setShowBanner(true);
    
    // Animate in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after 3 seconds if online
    if (isOnline) {
      setTimeout(() => {
        hideBanner();
      }, 3000);
    }
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowBanner(false);
    });
  };

  if (!showBanner && isOnline) {
    return null;
  }

  const getPositionStyle = () => {
    if (position === 'top') {
      return { top: 0 };
    }
    return { bottom: 0 };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.banner,
          isOnline ? styles.onlineBanner : styles.offlineBanner,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.content,
            !isOnline && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {isOnline ? '🟢' : '🔴'}
            </Text>
            <Text style={[styles.statusText, pixelFont]}>
              {isOnline ? 'BACK ONLINE' : 'OFFLINE MODE'}
            </Text>
          </View>
          
          {showDetails && (
            <View style={styles.details}>
              <Text style={[styles.detailText, pixelFont]}>
                Connection: {connectionType.toUpperCase()}
              </Text>
              {!isOnline && queueSize > 0 && (
                <Text style={[styles.detailText, pixelFont]}>
                  {queueSize} actions queued
                </Text>
              )}
            </View>
          )}
          
          {!isOnline && (
            <Text style={[styles.infoText, pixelFont]}>
              Your progress will sync when connected
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mini indicator for persistent display
export const NetworkStatusBadge = ({ style }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsOnline(NetworkManager.isOnline());
    setQueueSize(NetworkManager.getQueueSize());
    
    NetworkManager.addListener('status-badge', (data) => {
      setIsOnline(data.isConnected);
      setQueueSize(NetworkManager.getQueueSize());
    });
    
    // Pulse animation for offline state
    if (!isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    return () => {
      NetworkManager.removeListener('status-badge');
    };
  }, [isOnline]);

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        !isOnline && styles.offlineBadge,
        !isOnline && { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <Text style={styles.badgeIcon}>
        {isOnline ? '📤' : '📵'}
      </Text>
      {queueSize > 0 && (
        <View style={styles.queueBadge}>
          <Text style={[styles.queueText, pixelFont]}>{queueSize}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },

  banner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  onlineBanner: {
    backgroundColor: COLORS.primary,
  },

  offlineBanner: {
    backgroundColor: COLORS.red,
  },

  content: {
    alignItems: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusIcon: {
    fontSize: 16,
  },

  statusText: {
    fontSize: 12,
    color: COLORS.dark,
    letterSpacing: 1,
    fontWeight: 'bold',
  },

  details: {
    marginTop: 8,
    alignItems: 'center',
  },

  detailText: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    opacity: 0.8,
  },

  infoText: {
    fontSize: 9,
    color: COLORS.dark,
    letterSpacing: 0.5,
    marginTop: 4,
    opacity: 0.9,
  },

  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.yellow,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  offlineBadge: {
    backgroundColor: COLORS.red,
  },

  badgeIcon: {
    fontSize: 18,
  },

  queueBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },

  queueText: {
    fontSize: 8,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },
});

export default NetworkStatusIndicator;