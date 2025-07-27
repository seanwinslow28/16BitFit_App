/**
 * Error Boundary Component
 * GameBoy-style error handling with recovery options
 * Following MetaSystemsAgent patterns for error states
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
// Removed unused imports

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  white: '#FFFFFF',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Play error sound (disabled for now)
    // SoundFXManager.playError();
    
    // Log to crash reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleShowDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    this.setState({ showDetails: !this.state.showDetails });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.red, '#c62828', COLORS.red]}
            style={styles.gradient}
          >
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>

            {/* Error Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>ERROR!</Text>
              <Text style={styles.subtitle}>
                SOMETHING WENT WRONG
              </Text>
              
              <Text style={styles.errorMessage}>
                {this.state.error && this.state.error.toString()}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={this.handleReset}
              >
                <Text style={styles.buttonText}>
                  RESTART APP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.detailsButton]}
                onPress={this.handleShowDetails}
              >
                <Text style={styles.buttonText}>
                  {this.state.showDetails ? 'HIDE DETAILS' : 'SHOW DETAILS'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Details */}
            {this.state.showDetails && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>
                  TECHNICAL DETAILS:
                </Text>
                <Text style={styles.detailsText}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Text>
              </ScrollView>
            )}

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                If this keeps happening, try:
              </Text>
              <Text style={styles.helpItem}>
                • Force close and restart the app
              </Text>
              <Text style={styles.helpItem}>
                • Check for app updates
              </Text>
              <Text style={styles.helpItem}>
                • Clear app cache
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainer: {
    marginBottom: 20,
  },

  errorIcon: {
    fontSize: 64,
  },

  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    color: COLORS.white,
    letterSpacing: 3,
    marginBottom: 8,
    fontFamily: 'PressStart2P',
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.9,
    fontFamily: 'PressStart2P',
  },

  errorMessage: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'PressStart2P',
  },

  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.dark,
    minWidth: 180,
    alignItems: 'center',
  },

  resetButton: {
    backgroundColor: COLORS.yellow,
  },

  detailsButton: {
    backgroundColor: COLORS.blue,
  },

  buttonText: {
    fontSize: 11,
    color: COLORS.dark,
    letterSpacing: 1,
    fontFamily: 'PressStart2P',
  },

  detailsContainer: {
    maxHeight: 150,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  detailsTitle: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: 'PressStart2P',
  },

  detailsText: {
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 0.5,
    lineHeight: 12,
    opacity: 0.8,
    fontFamily: 'PressStart2P',
  },

  helpContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },

  helpText: {
    fontSize: 10,
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: 'PressStart2P',
  },

  helpItem: {
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.8,
    fontFamily: 'PressStart2P',
  },
});

export default ErrorBoundary;