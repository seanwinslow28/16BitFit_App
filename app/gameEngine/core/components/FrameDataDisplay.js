/**
 * Frame Data Display Component
 * Visual representation of frame data for debugging and balancing
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CharacterFrameData, getTotalFrames, getFrameAdvantage } from '../data/ComprehensiveFrameData';

const FrameDataDisplay = ({ character = 'warrior', move = 'standingLP', category = 'normals' }) => {
  const getMoveData = () => {
    const charData = CharacterFrameData[character];
    if (!charData) return null;

    if (category === 'normals') {
      return charData.normals[move];
    } else if (category === 'specials') {
      const [moveName, strength] = move.split('_');
      return charData.specials[moveName]?.[strength || 'medium'];
    } else if (category === 'supers') {
      return charData.supers[move];
    }
    return null;
  };

  const moveData = getMoveData();
  if (!moveData) return null;

  const totalFrames = getTotalFrames(moveData);
  const frameWidth = 300 / Math.max(totalFrames, 30); // Scale to fit

  const renderFrameBar = () => {
    const frames = [];
    
    // Startup frames (blue)
    for (let i = 0; i < moveData.startup; i++) {
      frames.push(
        <View 
          key={`startup-${i}`} 
          style={[
            styles.frame, 
            styles.startupFrame,
            { width: frameWidth }
          ]} 
        />
      );
    }

    // Active frames (red)
    for (let i = 0; i < moveData.active; i++) {
      frames.push(
        <View 
          key={`active-${i}`} 
          style={[
            styles.frame, 
            styles.activeFrame,
            { width: frameWidth }
          ]} 
        />
      );
    }

    // Recovery frames (gray)
    for (let i = 0; i < moveData.recovery; i++) {
      frames.push(
        <View 
          key={`recovery-${i}`} 
          style={[
            styles.frame, 
            styles.recoveryFrame,
            { width: frameWidth }
          ]} 
        />
      );
    }

    return frames;
  };

  const renderProperties = () => {
    if (!moveData.properties || moveData.properties.length === 0) {
      return <Text style={styles.propertyText}>None</Text>;
    }

    return moveData.properties.map((prop, index) => (
      <Text key={index} style={styles.propertyTag}>{prop}</Text>
    ));
  };

  const renderCancelOptions = () => {
    if (!moveData.cancelInto || moveData.cancelInto.length === 0) {
      return <Text style={styles.propertyText}>None</Text>;
    }

    return moveData.cancelInto.map((option, index) => (
      <Text key={index} style={styles.cancelTag}>{option}</Text>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{character.toUpperCase()} - {move}</Text>
        <Text style={styles.subtitle}>Frame Data Analysis</Text>
      </View>

      {/* Frame Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frame Timeline</Text>
        <View style={styles.frameBar}>
          {renderFrameBar()}
        </View>
        <View style={styles.frameLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.startupFrame]} />
            <Text style={styles.legendText}>Startup: {moveData.startup}f</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.activeFrame]} />
            <Text style={styles.legendText}>Active: {moveData.active}f</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.recoveryFrame]} />
            <Text style={styles.legendText}>Recovery: {moveData.recovery}f</Text>
          </View>
        </View>
      </View>

      {/* Frame Advantage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frame Advantage</Text>
        <View style={styles.advantageRow}>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageLabel}>On Hit</Text>
            <Text style={[
              styles.advantageValue,
              moveData.onHit > 0 ? styles.positive : styles.negative
            ]}>
              {moveData.onHit === 'KD' ? 'KD' : `${moveData.onHit > 0 ? '+' : ''}${moveData.onHit}`}
            </Text>
          </View>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageLabel}>On Block</Text>
            <Text style={[
              styles.advantageValue,
              moveData.onBlock > 0 ? styles.positive : styles.negative
            ]}>
              {moveData.onBlock === null ? 'N/A' : `${moveData.onBlock > 0 ? '+' : ''}${moveData.onBlock}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Damage & Meter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Damage & Resources</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Damage</Text>
            <Text style={styles.statValue}>{moveData.damage}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Meter Gain</Text>
            <Text style={styles.statValue}>+{moveData.meterGain || 0}</Text>
          </View>
          {moveData.meterCost && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Meter Cost</Text>
              <Text style={[styles.statValue, styles.negative]}>-{moveData.meterCost}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Properties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Properties</Text>
        <View style={styles.propertiesRow}>
          {renderProperties()}
        </View>
      </View>

      {/* Cancel Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cancel Options</Text>
        <View style={styles.propertiesRow}>
          {renderCancelOptions()}
        </View>
      </View>

      {/* Special Properties */}
      {moveData.invincibleFrames && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Properties</Text>
          <Text style={styles.propertyText}>
            Invincible: Frames {moveData.invincibleFrames[0]}-{moveData.invincibleFrames[1]}
          </Text>
        </View>
      )}

      {/* Total Frames Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total: {totalFrames} frames ({(totalFrames / 60 * 1000).toFixed(0)}ms at 60fps)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  frameBar: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  frame: {
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
  },
  startupFrame: {
    backgroundColor: '#4a90e2',
  },
  activeFrame: {
    backgroundColor: '#e74c3c',
  },
  recoveryFrame: {
    backgroundColor: '#7f8c8d',
  },
  frameLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  legendText: {
    color: '#ccc',
    fontSize: 12,
  },
  advantageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  advantageItem: {
    alignItems: 'center',
  },
  advantageLabel: {
    color: '#888',
    fontSize: 14,
  },
  advantageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  positive: {
    color: '#27ae60',
  },
  negative: {
    color: '#e74c3c',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  propertiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyText: {
    color: '#ccc',
    fontSize: 14,
  },
  propertyTag: {
    backgroundColor: '#3498db',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  cancelTag: {
    backgroundColor: '#9b59b6',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  summary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  summaryText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FrameDataDisplay;