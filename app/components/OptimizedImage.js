/**
 * Optimized Image Component
 * Handles progressive loading, caching, and placeholders
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  gray: '#333',
};

const OptimizedImage = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder = null,
  placeholderColor = COLORS.gray,
  fadeInDuration = 300,
  showLoadingIndicator = false,
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const placeholderFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset state when source changes
    setIsLoading(true);
    setHasError(false);
    fadeAnim.setValue(0);
    placeholderFadeAnim.setValue(1);
  }, [source]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
    
    // Fade in image
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true,
    }).start();

    // Fade out placeholder
    Animated.timing(placeholderFadeAnim, {
      toValue: 0,
      duration: fadeInDuration,
      useNativeDriver: true,
    }).start();

    onLoad();
  };

  const handleError = (error) => {
    setIsLoading(false);
    setHasError(true);
    onError(error);
  };

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <LinearGradient
        colors={[placeholderColor, `${placeholderColor}88`, placeholderColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, style]}
      >
        {showLoadingIndicator && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </LinearGradient>
    );
  };

  const renderErrorPlaceholder = () => (
    <View style={[styles.errorContainer, style]}>
      <View style={styles.errorIcon}>
        <Text style={styles.errorText}>❌</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder */}
      {(isLoading || hasError) && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: placeholderFadeAnim },
          ]}
        >
          {hasError ? renderErrorPlaceholder() : renderPlaceholder()}
        </Animated.View>
      )}

      {/* Main Image */}
      {!hasError && (
        <Animated.Image
          {...props}
          source={source}
          style={[
            StyleSheet.absoluteFillObject,
            style,
            { opacity: fadeAnim },
          ]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  );
};

// Batch image preloader
class ImagePreloader {
  static cache = new Map();
  static loadingPromises = new Map();

  static async preloadImages(images) {
    const promises = images.map(image => this.preloadImage(image));
    return Promise.all(promises);
  }

  static async preloadImage(source) {
    const key = typeof source === 'string' ? source : source.uri;
    
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Check if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Start loading
    const loadPromise = new Promise((resolve, reject) => {
      Image.prefetch(key)
        .then(() => {
          this.cache.set(key, true);
          this.loadingPromises.delete(key);
          resolve(true);
        })
        .catch(error => {
          this.loadingPromises.delete(key);
          reject(error);
        });
    });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  static clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },

  errorIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    fontSize: 24,
    opacity: 0.5,
  },
});

export { OptimizedImage, ImagePreloader };
export default OptimizedImage;