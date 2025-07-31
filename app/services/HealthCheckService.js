/**
 * Health Check Service
 * Monitors backend service health and connectivity
 */

import { supabase } from './supabaseClient';

class HealthCheckService {
  constructor() {
    this.lastCheck = null;
    this.checkInterval = null;
    this.listeners = new Set();
    this.status = {
      api: 'unknown',
      database: 'unknown',
      auth: 'unknown',
      lastChecked: null,
      isHealthy: false,
    };
  }

  /**
   * Perform a health check
   */
  async check() {
    try {
      console.log('Performing health check...');
      
      // Call the health check edge function
      const { data, error } = await supabase.functions.invoke('health-check', {
        method: 'GET',
      });

      if (error) {
        console.error('Health check failed:', error);
        this.updateStatus({
          api: 'error',
          database: 'unknown',
          auth: 'unknown',
          lastChecked: new Date().toISOString(),
          isHealthy: false,
          error: error.message,
        });
        return this.status;
      }

      // Update status from response
      this.updateStatus({
        api: data.checks.api,
        database: data.checks.database,
        auth: data.checks.auth,
        lastChecked: data.timestamp,
        isHealthy: data.status === 'healthy',
        version: data.version,
      });

      console.log('Health check completed:', this.status);
      return this.status;
    } catch (error) {
      console.error('Health check error:', error);
      this.updateStatus({
        api: 'error',
        database: 'unknown',
        auth: 'unknown',
        lastChecked: new Date().toISOString(),
        isHealthy: false,
        error: error.message,
      });
      return this.status;
    }
  }

  /**
   * Quick connectivity check (doesn't call edge function)
   */
  async quickCheck() {
    try {
      // Simple auth check
      const { error: authError } = await supabase.auth.getSession();
      
      // Simple database check
      const { error: dbError } = await supabase
        .from('characters')
        .select('id')
        .limit(1);

      const isHealthy = !authError && !dbError;
      
      this.updateStatus({
        api: 'operational',
        database: dbError ? 'error' : 'operational',
        auth: authError ? 'error' : 'operational',
        lastChecked: new Date().toISOString(),
        isHealthy,
      });

      return this.status;
    } catch (error) {
      console.error('Quick check error:', error);
      this.updateStatus({
        api: 'error',
        database: 'unknown',
        auth: 'unknown',
        lastChecked: new Date().toISOString(),
        isHealthy: false,
        error: error.message,
      });
      return this.status;
    }
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(intervalMs = 60000) { // Default: 1 minute
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Initial check
    this.check();

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.check();
    }, intervalMs);

    console.log(`Health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop periodic health checks
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Health monitoring stopped');
    }
  }

  /**
   * Update status and notify listeners
   */
  updateStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
    this.lastCheck = new Date();
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Error notifying health status listener:', error);
      }
    });
  }

  /**
   * Subscribe to health status changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Send current status immediately
    if (this.status.lastChecked) {
      listener(this.status);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Check if backend is healthy
   */
  isHealthy() {
    return this.status.isHealthy;
  }

  /**
   * Get status emoji for UI display
   */
  getStatusEmoji() {
    if (this.status.isHealthy) return '✅';
    if (this.status.api === 'operational' || this.status.database === 'operational') return '⚠️';
    return '❌';
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage() {
    if (!this.status.lastChecked) {
      return 'Health check pending...';
    }

    if (this.status.isHealthy) {
      return 'All systems operational';
    }

    const issues = [];
    if (this.status.api !== 'operational') issues.push('API');
    if (this.status.database !== 'operational') issues.push('Database');
    if (this.status.auth !== 'operational') issues.push('Auth');

    if (issues.length === 0) {
      return 'Unknown issue';
    }

    return `Issues with: ${issues.join(', ')}`;
  }

  /**
   * Format last check time
   */
  getLastCheckTime() {
    if (!this.status.lastChecked) {
      return 'Never';
    }

    const date = new Date(this.status.lastChecked);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
  }
}

// Export singleton instance
export default new HealthCheckService();