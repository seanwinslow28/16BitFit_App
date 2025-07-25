/**
 * Expo Configuration with Performance Optimizations
 * Following MetaSystemsAgent patterns for optimal build configuration
 */

export default {
  expo: {
    name: "16BitFit",
    slug: "16bitfit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0D0D0D"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.16bitfit.app",
      buildNumber: "1.0.0",
      // iOS Performance Optimizations
      infoPlist: {
        UIBackgroundModes: ["background-processing"],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            // Add trusted domains here
          }
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0D0D0D"
      },
      package: "com.16bitfit.app",
      versionCode: 1,
      // Android Performance Optimizations
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.VIBRATE"
      ],
      // Enable R8 optimization
      useNextNotificationsApi: true,
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 21
    },
    web: {
      favicon: "./assets/favicon.png",
      // Web Performance Optimizations
      bundler: "metro",
      build: {
        babel: {
          include: ["@expo/vector-icons"]
        }
      }
    },
    plugins: [
      "expo-font",
      "expo-linear-gradient",
      "expo-av",
      "expo-haptics",
      "expo-asset",
      "expo-file-system",
      "expo-image",
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            // Enable R8 optimization
            useR8: true,
            // Optimize for size
            packagingOptions: {
              pickFirst: ["**/libc++_shared.so", "**/libjsc.so"]
            }
          },
          ios: {
            // iOS optimization flags
            deploymentTarget: "11.0"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "16bitfit-project-id"
      }
    },
    // Performance and optimization settings
    jsEngine: "jsc", // Use JavaScriptCore for better performance
    runtimeVersion: "1.0.0",
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 5000
    },
    // Asset optimization
    assetOptimization: {
      enabled: true,
      compressionLevel: 80,
      formats: ["webp", "avif"],
      sizes: [
        { width: 320, height: 568 }, // iPhone 5
        { width: 375, height: 667 }, // iPhone 6/7/8
        { width: 414, height: 736 }, // iPhone 6/7/8 Plus
        { width: 375, height: 812 }, // iPhone X
        { width: 414, height: 896 }, // iPhone XR
        { width: 390, height: 844 }, // iPhone 12
        { width: 428, height: 926 }, // iPhone 12 Pro Max
      ]
    },
    // Bundle optimization
    bundleOptimization: {
      enabled: true,
      minify: true,
      treeShaking: true,
      codeElimination: true,
      // Remove unused imports
      removeUnusedImports: true,
      // Optimize images
      optimizeImages: true,
      // Compress assets
      compressAssets: true
    },
    // Network optimization
    network: {
      timeout: 10000,
      retryCount: 3,
      cacheEnabled: true,
      compressionEnabled: true
    },
    // Development settings
    developmentClient: {
      silentLaunch: true
    }
  }
};