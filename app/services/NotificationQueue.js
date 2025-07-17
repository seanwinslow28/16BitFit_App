/**
 * Notification Queue Service
 * Manages notification display order and prevents overlapping
 * Following MetaSystemsAgent patterns for better UX
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@16BitFit:notificationSettings';
const DEFAULT_COOLDOWN = 30000; // 30 seconds between similar notifications
const QUEUE_DELAY = 1000; // 1 second between queued notifications

class NotificationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentNotification = null;
    this.lastShownTimestamps = new Map();
    this.settings = {
      enableCoachTips: true,
      enableAchievements: true,
      enableDailyBonus: true,
      enableNetworkAlerts: true,
      notificationDuration: 3000, // 3 seconds default
      maxNotificationsPerSession: 3,
      cooldownPeriod: DEFAULT_COOLDOWN,
    };
    this.sessionNotificationCount = 0;
    this.callbacks = new Map();
    this.priorities = {
      critical: 1,      // Network errors, critical alerts
      achievement: 2,   // Level up, unlocks
      dailyBonus: 3,    // Daily rewards
      coachTip: 4,      // Coach advice
      info: 5,          // General info
    };
  }

  /**
   * Initialize notification queue
   */
  async initialize() {
    try {
      // Load settings
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
      
      // Reset session count
      this.sessionNotificationCount = 0;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize NotificationQueue:', error);
      return false;
    }
  }

  /**
   * Register notification display callback
   */
  registerCallback(type, callback) {
    this.callbacks.set(type, callback);
  }

  /**
   * Add notification to queue
   */
  enqueue(notification) {
    // Check if notifications are enabled for this type
    if (!this.shouldShowNotification(notification)) {
      return false;
    }
    
    // Check cooldown
    if (!this.checkCooldown(notification)) {
      console.log(`Notification ${notification.id} skipped due to cooldown`);
      return false;
    }
    
    // Check session limit
    if (this.sessionNotificationCount >= this.settings.maxNotificationsPerSession) {
      console.log('Session notification limit reached');
      return false;
    }
    
    // Add to queue with priority
    const priority = this.priorities[notification.priority] || 5;
    notification.priorityValue = priority;
    
    this.queue.push(notification);
    this.queue.sort((a, b) => a.priorityValue - b.priorityValue);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return true;
  }

  /**
   * Process notification queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      
      // Update cooldown timestamp
      this.updateCooldown(notification);
      
      // Display notification
      await this.displayNotification(notification);
      
      // Increment session count
      this.sessionNotificationCount++;
      
      // Wait before showing next
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, QUEUE_DELAY));
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Display notification
   */
  async displayNotification(notification) {
    this.currentNotification = notification;
    
    // Get appropriate callback
    const callback = this.callbacks.get(notification.type);
    if (!callback) {
      console.warn(`No callback registered for notification type: ${notification.type}`);
      return;
    }
    
    // Calculate duration
    const duration = notification.duration || this.settings.notificationDuration;
    
    // Display notification
    try {
      await callback(notification, duration);
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
    
    this.currentNotification = null;
  }

  /**
   * Check if notification should be shown
   */
  shouldShowNotification(notification) {
    switch (notification.type) {
      case 'coachTip':
        return this.settings.enableCoachTips;
      case 'achievement':
        return this.settings.enableAchievements;
      case 'dailyBonus':
        return this.settings.enableDailyBonus;
      case 'network':
        return this.settings.enableNetworkAlerts;
      default:
        return true;
    }
  }

  /**
   * Check cooldown for notification
   */
  checkCooldown(notification) {
    const key = `${notification.type}_${notification.subtype || 'default'}`;
    const lastShown = this.lastShownTimestamps.get(key);
    
    if (!lastShown) {
      return true;
    }
    
    const timeSinceLastShown = Date.now() - lastShown;
    return timeSinceLastShown >= this.settings.cooldownPeriod;
  }

  /**
   * Update cooldown timestamp
   */
  updateCooldown(notification) {
    const key = `${notification.type}_${notification.subtype || 'default'}`;
    this.lastShownTimestamps.set(key, Date.now());
  }

  /**
   * Clear current notification
   */
  clearCurrent() {
    this.currentNotification = null;
  }

  /**
   * Clear all queued notifications
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Reset session count
   */
  resetSessionCount() {
    this.sessionNotificationCount = 0;
  }

  /**
   * Create notification object
   */
  createNotification(type, data) {
    return {
      id: `${type}_${Date.now()}`,
      type,
      priority: data.priority || 'info',
      subtype: data.subtype,
      title: data.title,
      message: data.message,
      icon: data.icon,
      duration: data.duration,
      data: data.data,
      timestamp: Date.now(),
    };
  }

  /**
   * Quick methods for common notifications
   */
  
  enqueueCoachTip(tip) {
    return this.enqueue(this.createNotification('coachTip', {
      priority: 'coachTip',
      subtype: tip.id,
      title: tip.coach?.name || 'Coach',
      message: tip.message,
      icon: tip.coach?.sprite || '👨‍🏫',
      duration: 3000, // Reduced from 5000
      data: tip,
    }));
  }

  enqueueAchievement(achievement) {
    return this.enqueue(this.createNotification('achievement', {
      priority: 'achievement',
      subtype: achievement.id,
      title: achievement.title,
      message: achievement.description,
      icon: achievement.icon,
      duration: 3000, // Reduced from 4000
      data: achievement,
    }));
  }

  enqueueDailyBonus(bonus) {
    // Convert to small notification instead of modal
    return this.enqueue(this.createNotification('dailyBonus', {
      priority: 'dailyBonus',
      subtype: 'daily',
      title: 'Daily Bonus Available!',
      message: `Claim your ${bonus.streak} day reward`,
      icon: '🎁',
      duration: 4000,
      data: bonus,
    }));
  }

  enqueueNetworkAlert(alert) {
    return this.enqueue(this.createNotification('network', {
      priority: 'critical',
      subtype: alert.type,
      title: alert.title || 'Network Status',
      message: alert.message,
      icon: alert.type === 'error' ? '🔴' : '🟢',
      duration: 2000, // Quick for network alerts
      data: alert,
    }));
  }

  enqueueToast(type, message, duration = 3000) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    
    return this.enqueue(this.createNotification('toast', {
      priority: type === 'error' ? 'critical' : 'info',
      subtype: type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      icon: icons[type] || 'ℹ️',
      duration,
    }));
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentNotification: this.currentNotification,
      sessionCount: this.sessionNotificationCount,
      settings: this.getSettings(),
    };
  }
}

export default new NotificationQueue();