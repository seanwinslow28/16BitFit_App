/**
 * Performance Monitor Screen - Real-time performance monitoring and optimization
 * Integrates all performance services for comprehensive 60fps monitoring
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import PhaserWebView from '../components/PhaserWebView';
import useWebViewPerformance from '../hooks/useWebViewPerformance';
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';
import PerformanceTestingService from '../services/PerformanceTestingService';
import BatteryOptimizationService from '../services/BatteryOptimizationService';
import ReactNativePerformanceService from '../services/ReactNativePerformanceService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PerformanceMonitorScreen = ({ navigation }) => {
  // Performance hooks
  const {
    metrics,
    optimizations,
    warnings,
    setQuality,
    getReport,
  } = useWebViewPerformance({
    autoOptimize: true,
    onPerformanceWarning: handlePerformanceWarning,
  });
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [powerProfile, setPowerProfile] = useState('balanced');
  const [deviceInfo, setDeviceInfo] = useState(null);
  
  // Refs
  const webViewRef = useRef(null);
  
  // Initialize services
  useEffect(() => {
    initializeServices();
    
    return () => {
      // Cleanup
      BatteryOptimizationService.endSession();
    };
  }, []);
  
  const initializeServices = async () => {
    // Initialize all performance services
    await PerformanceOptimizationService.init();
    await BatteryOptimizationService.init();
    ReactNativePerformanceService.init();
    await PerformanceTestingService.init();
    
    // Start battery session
    BatteryOptimizationService.startSession();
    
    // Get device info
    const info = PerformanceOptimizationService.deviceProfile;
    setDeviceInfo(info);
  };
  
  // Handle performance warnings
  function handlePerformanceWarning(warning) {
    if (warning.severity === 'critical') {
      Alert.alert(
        'Performance Issue',
        `Critical performance issue detected: ${warning.message}`,
        [
          {
            text: 'Auto-Optimize',
            onPress: () => PerformanceOptimizationService.optimizePerformance(metrics),
          },
          { text: 'Ignore', style: 'cancel' },
        ]
      );
    }
  }
  
  // Run performance test
  const runPerformanceTest = async () => {
    setIsTestRunning(true);
    setTestResults(null);
    
    try {
      const results = await PerformanceTestingService.runAllTests({
        onProgress: setTestProgress,
        onTestComplete: (result) => {
          console.log('Test completed:', result.scenario);
        },
      });
      
      setTestResults(results);
    } catch (error) {
      Alert.alert('Test Error', error.message);
    } finally {
      setIsTestRunning(false);
      setTestProgress(null);
    }
  };
  
  // Quick performance check
  const runQuickCheck = async () => {
    const result = await PerformanceTestingService.quickCheck();
    
    Alert.alert(
      'Quick Check',
      `FPS: ${result.fps}\n${result.recommendation}`,
      [{ text: 'OK' }]
    );
  };
  
  // Find optimal quality
  const findOptimalQuality = async () => {
    setIsTestRunning(true);
    
    try {
      const result = await PerformanceTestingService.findOptimalQuality();
      
      Alert.alert(
        'Optimal Quality Found',
        `Recommended quality: ${result.optimal}`,
        [
          {
            text: 'Apply',
            onPress: () => {
              setQuality(result.optimal);
              PerformanceOptimizationService.setQuality(result.optimal);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsTestRunning(false);
    }
  };
  
  // Set power profile
  const changePowerProfile = async (profile) => {
    setPowerProfile(profile);
    await BatteryOptimizationService.setPowerProfile(profile);
  };
  
  // Render overview tab
  const renderOverview = () => {
    const perfReport = PerformanceOptimizationService.getPerformanceReport();
    const batteryReport = BatteryOptimizationService.getPowerReport();
    const rnReport = ReactNativePerformanceService.getPerformanceReport();
    
    return (
      <ScrollView style={styles.tabContent}>
        {/* Current Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Performance</Text>
          
          <View style={styles.metricGrid}>
            <MetricCard
              label="FPS"
              value={metrics.fps}
              target={60}
              unit="fps"
              status={getMetricStatus(metrics.fps, 60, 55, 45)}
            />
            
            <MetricCard
              label="Latency"
              value={metrics.latency}
              target={50}
              unit="ms"
              status={getMetricStatus(50 - metrics.latency, 0, -10, -20)}
            />
            
            <MetricCard
              label="Memory"
              value={perfReport.current.memory}
              target={150}
              unit="MB"
              status={getMetricStatus(150 - perfReport.current.memory, 0, -30, -50)}
            />
            
            <MetricCard
              label="Battery"
              value={batteryReport.current.batteryLevel}
              target={100}
              unit="%"
              status={batteryReport.current.isCharging ? 'charging' : 'normal'}
            />
          </View>
        </View>
        
        {/* Performance Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Score</Text>
          
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{metrics.performanceScore}</Text>
              <Text style={styles.scoreLabel}>{metrics.performanceLevel}</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <Text style={styles.detailText}>
                Quality: {perfReport.current.quality}
              </Text>
              <Text style={styles.detailText}>
                Device Tier: {deviceInfo?.tier || 'unknown'}
              </Text>
              <Text style={styles.detailText}>
                Power Mode: {powerProfile}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <ActionButton
              icon="speed"
              label="Quick Check"
              onPress={runQuickCheck}
              disabled={isTestRunning}
            />
            
            <ActionButton
              icon="tune"
              label="Find Optimal"
              onPress={findOptimalQuality}
              disabled={isTestRunning}
            />
            
            <ActionButton
              icon="memory"
              label="Clear Memory"
              onPress={() => {
                PerformanceOptimizationService.forceCleanup();
                Alert.alert('Memory Cleared', 'Caches and unused resources cleared');
              }}
            />
            
            <ActionButton
              icon="battery-charging-full"
              label="Battery Report"
              onPress={() => {
                const report = batteryReport.session;
                Alert.alert(
                  'Battery Usage',
                  `Duration: ${report.duration.toFixed(0)} min\n` +
                  `Drain: ${report.totalDrain}%\n` +
                  `Rate: ${report.averageDrainRate.toFixed(2)}% per min\n` +
                  `Projected 30min: ${report.projectedDrainPer30Min.toFixed(0)}%`
                );
              }}
            />
          </View>
        </View>
        
        {/* Warnings */}
        {warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Warnings</Text>
            
            {warnings.map((warning, index) => (
              <View key={warning.id} style={styles.warningItem}>
                <Icon 
                  name="warning" 
                  size={16} 
                  color={warning.severity === 'critical' ? '#E53935' : '#F7D51D'} 
                />
                <Text style={styles.warningText}>{warning.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };
  
  // Render metrics tab
  const renderMetrics = () => {
    const report = getReport();
    
    return (
      <ScrollView style={styles.tabContent}>
        {/* FPS History Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FPS History (Last 60 samples)</Text>
          
          <View style={styles.chart}>
            {report.history.fps.map((fps, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  { 
                    height: `${(fps / 60) * 100}%`,
                    backgroundColor: fps >= 55 ? '#92CC41' : fps >= 45 ? '#F7D51D' : '#E53935',
                  }
                ]}
              />
            ))}
          </View>
          
          <View style={styles.chartLegend}>
            <Text style={styles.legendText}>Min: {Math.min(...report.history.fps)}</Text>
            <Text style={styles.legendText}>Avg: {metrics.avgFps}</Text>
            <Text style={styles.legendText}>Max: {Math.max(...report.history.fps)}</Text>
          </View>
        </View>
        
        {/* Detailed Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>
          
          <MetricRow label="Average FPS" value={`${metrics.avgFps} fps`} />
          <MetricRow label="Min FPS" value={`${metrics.minFps} fps`} />
          <MetricRow label="Max FPS" value={`${metrics.maxFps} fps`} />
          <MetricRow label="Dropped Frames" value={metrics.totalDroppedFrames} />
          <MetricRow label="Average Latency" value={`${metrics.avgLatency} ms`} />
          <MetricRow label="Max Latency" value={`${metrics.maxLatency} ms`} />
          <MetricRow label="Message Rate" value={`${metrics.messageRate.toFixed(1)} /s`} />
        </View>
        
        {/* Message Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WebView Communication</Text>
          
          <MetricRow label="Messages Sent" value={report.messageMetrics.sent} />
          <MetricRow label="Messages Received" value={report.messageMetrics.received} />
          <MetricRow label="Average Size" value={`${report.messageMetrics.averageSize} bytes`} />
          <MetricRow label="Total Data" value={`${(report.messageMetrics.totalBytes / 1024).toFixed(1)} KB`} />
        </View>
      </ScrollView>
    );
  };
  
  // Render testing tab
  const renderTesting = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Test Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tests</Text>
          
          {!isTestRunning ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={runPerformanceTest}
            >
              <Icon name="play-arrow" size={20} color="#000" />
              <Text style={styles.primaryButtonText}>Run All Tests</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.testProgress}>
              <Text style={styles.progressText}>
                {testProgress ? `Testing: ${testProgress.scenario}` : 'Initializing...'}
              </Text>
              {testProgress && (
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${testProgress.progress}%` }
                    ]}
                  />
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Test Results */}
        {testResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            
            <View style={styles.testSummary}>
              <Text style={styles.summaryText}>
                Pass Rate: {testResults.summary.passRate}
              </Text>
              <Text style={styles.summaryText}>
                Overall FPS: {testResults.summary.overallFps}
              </Text>
              <Text style={styles.summaryText}>
                Peak Memory: {testResults.summary.peakMemory} MB
              </Text>
            </View>
            
            {/* Individual Test Results */}
            {testResults.results.map((result, index) => (
              <View key={index} style={styles.testResult}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{result.scenario}</Text>
                  <Icon 
                    name={result.passed ? 'check-circle' : 'cancel'}
                    size={20}
                    color={result.passed ? '#92CC41' : '#E53935'}
                  />
                </View>
                
                <View style={styles.testMetrics}>
                  <Text style={styles.testMetric}>
                    FPS: {result.fps.average} (expected: {result.fps.expected})
                  </Text>
                  <Text style={styles.testMetric}>
                    Consistency: {result.fps.consistency}%
                  </Text>
                  <Text style={styles.testMetric}>
                    Peak Memory: {result.memory.peak} MB
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Recommendations */}
            {testResults.recommendations.length > 0 && (
              <View style={styles.recommendations}>
                <Text style={styles.recommendationTitle}>Recommendations</Text>
                {testResults.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendation}>
                    <Text style={styles.recommendationText}>
                      • {rec.scenario}: {rec.issue}
                    </Text>
                    {rec.suggestions.map((suggestion, i) => (
                      <Text key={i} style={styles.suggestionText}>
                        - {suggestion}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };
  
  // Render settings tab
  const renderSettings = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Quality Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Settings</Text>
          
          <View style={styles.qualityButtons}>
            {['ultra', 'high', 'medium', 'low', 'potato'].map(quality => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityButton,
                  optimizations.renderQuality === quality && styles.qualityButtonActive
                ]}
                onPress={() => {
                  setQuality(quality);
                  PerformanceOptimizationService.setQuality(quality);
                }}
              >
                <Text style={styles.qualityButtonText}>{quality}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Power Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Power Profile</Text>
          
          <View style={styles.powerButtons}>
            {['performance', 'balanced', 'batterySaver', 'ultraSaver'].map(profile => (
              <TouchableOpacity
                key={profile}
                style={[
                  styles.powerButton,
                  powerProfile === profile && styles.powerButtonActive
                ]}
                onPress={() => changePowerProfile(profile)}
              >
                <Text style={styles.powerButtonText}>
                  {profile.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Current Optimizations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Optimizations</Text>
          
          <OptimizationRow label="Render Quality" value={optimizations.renderQuality} />
          <OptimizationRow label="Particle Effects" value={optimizations.particleEffects ? 'On' : 'Off'} />
          <OptimizationRow label="Shadows" value={optimizations.shadows ? 'On' : 'Off'} />
          <OptimizationRow label="Anti-aliasing" value={optimizations.antialiasing ? 'On' : 'Off'} />
          <OptimizationRow label="Target FPS" value={optimizations.targetFps} />
        </View>
        
        {/* React Native Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>React Native Optimization</Text>
          
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              const levels = ['high', 'medium', 'low'];
              const current = ReactNativePerformanceService.currentLevel;
              const currentIndex = levels.indexOf(current);
              const nextLevel = levels[(currentIndex + 1) % levels.length];
              ReactNativePerformanceService.setOptimizationLevel(nextLevel);
              Alert.alert('RN Optimization', `Changed to ${nextLevel} level`);
            }}
          >
            <Text style={styles.settingButtonText}>
              RN Level: {ReactNativePerformanceService.currentLevel}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  // Get metric status color
  const getMetricStatus = (value, good, warning, critical) => {
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    if (value >= critical) return 'critical';
    return 'critical';
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Monitor</Text>
        <TouchableOpacity onPress={() => {
          const report = PerformanceOptimizationService.getPerformanceReport();
          console.log('Full Performance Report:', report);
          Alert.alert('Report Logged', 'Check console for full report');
        }}>
          <Icon name="info" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        {['overview', 'metrics', 'testing', 'settings'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'testing' && renderTesting()}
        {activeTab === 'settings' && renderSettings()}
      </View>
      
      {/* Hidden WebView for testing */}
      <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>
        <PhaserWebView
          ref={webViewRef}
          onReady={() => console.log('WebView ready for testing')}
          characterData={{ type: 'brawler' }}
          battleConfig={{ difficulty: 'normal' }}
        />
      </View>
    </View>
  );
};

// Component: Metric Card
const MetricCard = ({ label, value, target, unit, status }) => {
  const statusColors = {
    good: '#92CC41',
    warning: '#F7D51D',
    critical: '#E53935',
    charging: '#4FC3F7',
    normal: '#FFF',
  };
  
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricCardLabel}>{label}</Text>
      <Text style={[styles.metricCardValue, { color: statusColors[status] || '#FFF' }]}>
        {typeof value === 'number' ? value.toFixed(0) : value}
      </Text>
      <Text style={styles.metricCardUnit}>{unit}</Text>
    </View>
  );
};

// Component: Action Button
const ActionButton = ({ icon, label, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Icon name={icon} size={24} color={disabled ? '#666' : '#92CC41'} />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

// Component: Metric Row
const MetricRow = ({ label, value }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricRowLabel}>{label}:</Text>
    <Text style={styles.metricRowValue}>{value}</Text>
  </View>
);

// Component: Optimization Row
const OptimizationRow = ({ label, value }) => (
  <View style={styles.optimizationRow}>
    <Text style={styles.optimizationLabel}>{label}</Text>
    <Text style={styles.optimizationValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#92CC41',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  tabTextActive: {
    color: '#92CC41',
    fontWeight: 'bold',
  },
  
  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  
  // Sections
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92CC41',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Metric Grid
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  metricCardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  metricCardUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Score
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#92CC41',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#92CC41',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  scoreLabel: {
    fontSize: 12,
    color: '#92CC41',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  scoreDetails: {
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Actions
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionButton: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#92CC41',
    marginTop: 8,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Warnings
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Chart
  chart: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    overflow: 'hidden',
  },
  chartBar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Metrics
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  metricRowLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  metricRowValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Testing
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#92CC41',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  testProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#92CC41',
  },
  testSummary: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  testResult: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  testMetrics: {
    marginLeft: 8,
  },
  testMetric: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  recommendations: {
    marginTop: 16,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F7D51D',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  recommendation: {
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  suggestionText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 16,
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  
  // Settings
  qualityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qualityButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  qualityButtonActive: {
    backgroundColor: '#92CC41',
  },
  qualityButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  powerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  powerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  powerButtonActive: {
    backgroundColor: '#4FC3F7',
  },
  powerButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  optimizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  optimizationLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  optimizationValue: {
    fontSize: 14,
    color: '#92CC41',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  settingButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
  settingButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
});

export default PerformanceMonitorScreen;