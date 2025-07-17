/**
 * Progress Chart Component
 * GameBoy-style visual progress tracking over time
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Negative stats
  blue: '#3498db',         // Secondary accent
  screenBg: '#9BBC0F',     // Classic GameBoy screen
  gridLine: 'rgba(146, 204, 65, 0.2)',
};

const ProgressChart = ({
  data = [],
  stat = 'health',
  timeRange = 'week', // week, month, year
  height = 200,
  onDataPointPress,
  showTrend = true,
  style,
}) => {
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Mock data for demonstration
  const mockData = generateMockData(timeRange);
  const chartData = data.length > 0 ? data : mockData;
  
  // Calculate chart dimensions
  const chartWidth = screenWidth - 60;
  const chartHeight = height - 60;
  const dataPoints = chartData.length;
  const pointSpacing = chartWidth / (dataPoints - 1);
  
  // Calculate min/max values
  const values = chartData.map(d => d.value);
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue;
  
  // Calculate trend
  const trend = calculateTrend(chartData);
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Auto-scroll to latest data
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 600);
  }, []);

  const handlePointPress = (point, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPoint(index);
    if (onDataPointPress) {
      onDataPointPress(point);
    }
  };

  const getPointColor = (value) => {
    if (value >= 80) return COLORS.primary;
    if (value >= 50) return COLORS.yellow;
    return COLORS.red;
  };

  const renderGridLines = () => {
    const lines = [];
    const lineCount = 5;
    
    for (let i = 0; i <= lineCount; i++) {
      const y = (chartHeight / lineCount) * i;
      const value = Math.round(maxValue - (valueRange / lineCount) * i);
      
      lines.push(
        <View key={i} style={[styles.gridLine, { top: y }]}>
          <View style={styles.gridLineBar} />
          <Text style={[styles.gridLabel, pixelFont]}>{value}</Text>
        </View>
      );
    }
    
    return lines;
  };

  const renderDataPoints = () => {
    return chartData.map((point, index) => {
      const x = index * pointSpacing;
      const y = ((maxValue - point.value) / valueRange) * chartHeight;
      const isSelected = selectedPoint === index;
      const pointColor = getPointColor(point.value);
      
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.dataPoint,
            {
              left: x - 8,
              top: y - 8,
              backgroundColor: pointColor,
            },
            isSelected && styles.selectedPoint,
          ]}
          onPress={() => handlePointPress(point, index)}
          activeOpacity={0.8}
        >
          {isSelected && (
            <View style={styles.tooltip}>
              <Text style={[styles.tooltipValue, pixelFont]}>{point.value}</Text>
              <Text style={[styles.tooltipDate, pixelFont]}>{point.label}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    });
  };

  const renderPath = () => {
    if (chartData.length < 2) return null;
    
    // Create lines between consecutive points
    const lines = [];
    
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = i * pointSpacing;
      const y1 = ((maxValue - chartData[i].value) / valueRange) * chartHeight;
      const x2 = (i + 1) * pointSpacing;
      const y2 = ((maxValue - chartData[i + 1].value) / valueRange) * chartHeight;
      
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      lines.push(
        <View
          key={i}
          style={[
            styles.pathLine,
            {
              left: x1,
              top: y1,
              width: length,
              transform: [
                { rotate: `${angle}deg` },
                { translateX: length / 2 },
              ],
            },
          ]}
        />
      );
    }
    
    return lines;
  };

  const renderBars = () => {
    return chartData.map((point, index) => {
      const x = index * pointSpacing - 12;
      const barHeight = (point.value / maxValue) * chartHeight;
      const y = chartHeight - barHeight;
      const barColor = getPointColor(point.value);
      
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.bar,
            {
              left: x,
              top: y,
              height: barHeight,
              backgroundColor: barColor,
            },
          ]}
          onPress={() => handlePointPress(point, index)}
          activeOpacity={0.8}
        />
      );
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { opacity: fadeAnim }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.statName, pixelFont]}>
            {stat.toUpperCase()} PROGRESS
          </Text>
          <Text style={[styles.timeRange, pixelFont]}>
            LAST {timeRange.toUpperCase()}
          </Text>
        </View>
        
        {showTrend && (
          <View style={styles.trendInfo}>
            <Text style={[styles.trendLabel, pixelFont]}>TREND</Text>
            <Text 
              style={[
                styles.trendValue, 
                pixelFont,
                { color: trend > 0 ? COLORS.primary : COLORS.red }
              ]}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>

      {/* Chart Container */}
      <View style={[styles.chartContainer, { height }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
            {/* Grid */}
            {renderGridLines()}
            
            {/* Data visualization */}
            <View style={styles.dataContainer}>
              {/* Line chart style */}
              {renderPath()}
              {renderDataPoints()}
              
              {/* Alternative: Bar chart style (commented out) */}
              {/* {renderBars()} */}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, pixelFont]}>AVG</Text>
          <Text style={[styles.summaryValue, pixelFont]}>
            {Math.round(averageValue)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, pixelFont]}>HIGH</Text>
          <Text style={[styles.summaryValue, pixelFont, { color: COLORS.primary }]}>
            {Math.round(maxValue)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, pixelFont]}>LOW</Text>
          <Text style={[styles.summaryValue, pixelFont, { color: COLORS.red }]}>
            {Math.round(minValue)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Helper functions
function generateMockData(timeRange) {
  const dataPoints = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
  const data = [];
  let value = 75;
  
  for (let i = 0; i < dataPoints; i++) {
    // Simulate realistic progress with some variation
    value = Math.max(0, Math.min(100, value + (Math.random() - 0.4) * 10));
    
    const date = new Date();
    if (timeRange === 'week') {
      date.setDate(date.getDate() - (dataPoints - i - 1));
      data.push({
        value: Math.round(value),
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        date: date.toISOString(),
      });
    } else if (timeRange === 'month') {
      date.setDate(date.getDate() - (dataPoints - i - 1));
      data.push({
        value: Math.round(value),
        label: date.getDate().toString(),
        date: date.toISOString(),
      });
    } else {
      date.setMonth(date.getMonth() - (dataPoints - i - 1));
      data.push({
        value: Math.round(value),
        label: date.toLocaleDateString('en', { month: 'short' }),
        date: date.toISOString(),
      });
    }
  }
  
  return data;
}

function calculateTrend(data) {
  if (data.length < 2) return 0;
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
  
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  statName: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },

  timeRange: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  trendInfo: {
    alignItems: 'flex-end',
  },

  trendLabel: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  trendValue: {
    fontSize: 14,
    letterSpacing: 1,
  },

  chartContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  chart: {
    position: 'relative',
  },

  gridLine: {
    position: 'absolute',
    left: -20,
    right: -20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  gridLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gridLine,
    marginRight: 8,
  },

  gridLabel: {
    fontSize: 8,
    color: '#666',
    width: 30,
    textAlign: 'right',
  },

  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  pathLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.primary,
    transformOrigin: 'left center',
  },

  dataPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.dark,
    zIndex: 10,
  },

  selectedPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    zIndex: 20,
  },

  bar: {
    position: 'absolute',
    width: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  tooltip: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: COLORS.dark,
    padding: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    minWidth: 60,
    alignItems: 'center',
  },

  tooltipValue: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 2,
  },

  tooltipDate: {
    fontSize: 8,
    color: COLORS.yellow,
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.3)',
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default ProgressChart;