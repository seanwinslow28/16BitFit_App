/**
 * Optimized Render System for 16BitFit
 * Integrates sprite batching, culling, and performance monitoring
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { getSpriteBatcher } from '../rendering/SpriteBatcher';
import { getPerformanceMonitor, QualityPresets } from './PerformanceMonitor';
import { getEnhancedObjectPool } from '../managers/EnhancedObjectPool';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Render layers for proper z-ordering
const RENDER_LAYERS = {
  BACKGROUND: 0,
  FLOOR: 1,
  SHADOWS: 2,
  ENTITIES: 3,
  EFFECTS: 4,
  PROJECTILES: 5,
  UI: 6,
  DEBUG: 7,
};

export const OptimizedRenderSystem = (entities, { time, delta }) => {
  const spriteBatcher = getSpriteBatcher();
  const performanceMonitor = getPerformanceMonitor();
  const objectPool = getEnhancedObjectPool();
  
  // Start performance tracking
  performanceMonitor.startFrame();
  spriteBatcher.startFrame();
  
  // Get current quality settings
  const quality = QualityPresets[performanceMonitor.qualitySettings.current];
  
  // Calculate viewport for culling
  const viewport = {
    x: 0,
    y: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
  
  // Collect renderable entities
  const renderables = [];
  let entityCount = 0;
  
  Object.entries(entities).forEach(([id, entity]) => {
    if (!entity || entity.destroyed) return;
    
    entityCount++;
    
    // Skip invisible entities
    if (entity.visible === false || entity.alpha === 0) return;
    
    // Frustum culling
    if (entity.position && !isInViewport(entity, viewport)) return;
    
    // LOD (Level of Detail) check
    if (shouldSkipLOD(entity, quality)) return;
    
    renderables.push({ id, entity });
  });
  
  // Track entity count
  performanceMonitor.trackEntity(entityCount);
  
  // Sort by layer and depth
  renderables.sort((a, b) => {
    const layerA = a.entity.layer || RENDER_LAYERS.ENTITIES;
    const layerB = b.entity.layer || RENDER_LAYERS.ENTITIES;
    
    if (layerA !== layerB) {
      return layerA - layerB;
    }
    
    // Within same layer, sort by Y position (higher Y = further back)
    const yA = a.entity.position?.y || 0;
    const yB = b.entity.position?.y || 0;
    
    return yB - yA;
  });
  
  // Process entities for batching
  renderables.forEach(({ id, entity }) => {
    if (entity.renderer) {
      // Custom renderer
      entity._renderComponent = entity.renderer(entity);
    } else if (entity.sprite || entity.textureId) {
      // Add to sprite batcher
      const spriteData = {
        id,
        textureId: entity.textureId || entity.sprite?.id || 'default',
        source: entity.sprite,
        x: entity.position.x,
        y: entity.position.y,
        z: entity.position.z || 0,
        width: entity.width || 64,
        height: entity.height || 64,
        rotation: entity.rotation || 0,
        scaleX: entity.scale?.x || entity.scale || 1,
        scaleY: entity.scale?.y || entity.scale || 1,
        alpha: entity.alpha || 1,
        tint: entity.tint,
        flipX: entity.flipX || false,
        flipY: entity.flipY || false,
        layer: entity.layer || RENDER_LAYERS.ENTITIES,
        blendMode: entity.blendMode || 'normal',
        
        // Sprite sheet data
        frameX: entity.frameX,
        frameY: entity.frameY,
        frameWidth: entity.frameWidth,
        frameHeight: entity.frameHeight,
      };
      
      spriteBatcher.addSprite(spriteData);
      performanceMonitor.trackSprite();
    }
  });
  
  // Finalize batching
  spriteBatcher.endFrame();
  
  // Get batched render components
  const batchedSprites = spriteBatcher.render(viewport);
  
  // Create final render output
  entities._renderOutput = (
    <View style={styles.renderContainer}>
      {/* Background layer */}
      {renderLayer(entities, RENDER_LAYERS.BACKGROUND, quality)}
      
      {/* Batched sprites */}
      {batchedSprites}
      
      {/* Custom rendered entities */}
      {renderables.map(({ id, entity }) => 
        entity._renderComponent ? (
          <View key={id} style={styles.entityContainer}>
            {entity._renderComponent}
          </View>
        ) : null
      )}
      
      {/* Effects layer with quality adjustments */}
      {quality.effectQuality !== 'low' && renderEffects(entities, quality)}
      
      {/* UI layer (always rendered) */}
      {renderLayer(entities, RENDER_LAYERS.UI, quality)}
      
      {/* Debug layer */}
      {__DEV__ && renderDebugInfo(performanceMonitor, spriteBatcher, objectPool)}
    </View>
  );
  
  // End performance tracking
  performanceMonitor.endFrame();
  
  // Track draw calls
  const batchStats = spriteBatcher.getStats();
  performanceMonitor.metrics.drawCalls = batchStats.batchCount;
  
  return entities;
};

// Viewport culling check
function isInViewport(entity, viewport) {
  if (!entity.position) return true;
  
  const padding = 100; // Extra padding for smooth entry
  const entityBounds = {
    left: entity.position.x - (entity.width || 64) / 2,
    right: entity.position.x + (entity.width || 64) / 2,
    top: entity.position.y - (entity.height || 64) / 2,
    bottom: entity.position.y + (entity.height || 64) / 2,
  };
  
  return !(
    entityBounds.right < viewport.x - padding ||
    entityBounds.left > viewport.x + viewport.width + padding ||
    entityBounds.bottom < viewport.y - padding ||
    entityBounds.top > viewport.y + viewport.height + padding
  );
}

// Level of Detail check
function shouldSkipLOD(entity, quality) {
  // Skip small particles in low quality
  if (quality.particleLimit && entity.type === 'particle') {
    return entity.particleIndex > quality.particleLimit;
  }
  
  // Skip distant effects
  if (entity.type === 'effect' && entity.distance > 500) {
    return quality.effectQuality === 'low';
  }
  
  // Skip shadows in low quality
  if (entity.type === 'shadow') {
    return !quality.shadowsEnabled;
  }
  
  return false;
}

// Render specific layer
function renderLayer(entities, layer, quality) {
  const layerEntities = [];
  
  Object.entries(entities).forEach(([id, entity]) => {
    if (entity.layer === layer && entity.renderer) {
      layerEntities.push(
        <View key={id}>
          {entity.renderer(entity)}
        </View>
      );
    }
  });
  
  return layerEntities;
}

// Render effects with quality adjustments
function renderEffects(entities, quality) {
  const effects = [];
  let effectCount = 0;
  
  Object.entries(entities).forEach(([id, entity]) => {
    if (entity.type === 'effect' && effectCount < quality.maxActiveEffects) {
      effectCount++;
      
      // Apply quality-based modifications
      const modifiedEntity = {
        ...entity,
        alpha: entity.alpha * (quality.effectQuality === 'medium' ? 0.8 : 1),
        particleCount: Math.floor((entity.particleCount || 10) * quality.textureQuality),
      };
      
      if (entity.renderer) {
        effects.push(
          <View key={id}>
            {entity.renderer(modifiedEntity)}
          </View>
        );
      }
    }
  });
  
  return effects;
}

// Debug information overlay
function renderDebugInfo(performanceMonitor, spriteBatcher, objectPool) {
  const metrics = performanceMonitor.getMetrics();
  const batchStats = spriteBatcher.getStats();
  const poolStats = objectPool.getStats();
  
  return (
    <View style={styles.debugOverlay}>
      <View style={styles.debugPanel}>
        <Text style={styles.debugTitle}>Performance</Text>
        <Text style={styles.debugText}>FPS: {metrics.fps} (avg: {metrics.avgFps})</Text>
        <Text style={styles.debugText}>Frame Time: {metrics.frameTime.toFixed(2)}ms</Text>
        <Text style={styles.debugText}>Quality: {metrics.quality}</Text>
        <Text style={styles.debugText}>Entities: {metrics.activeEntities}</Text>
        <Text style={styles.debugText}>Dropped Frames: {metrics.droppedFrames}</Text>
      </View>
      
      <View style={styles.debugPanel}>
        <Text style={styles.debugTitle}>Rendering</Text>
        <Text style={styles.debugText}>Draw Calls: {metrics.drawCalls}</Text>
        <Text style={styles.debugText}>Sprites: {metrics.renderedSprites}</Text>
        <Text style={styles.debugText}>Batches: {batchStats.batchCount}</Text>
        <Text style={styles.debugText}>Avg/Batch: {batchStats.avgSpritesPerBatch}</Text>
        <Text style={styles.debugText}>Cache Hit: {batchStats.cacheHitRate}%</Text>
      </View>
      
      <View style={styles.debugPanel}>
        <Text style={styles.debugTitle}>Memory</Text>
        <Text style={styles.debugText}>Usage: {metrics.memoryUsage.toFixed(1)}MB</Text>
        <Text style={styles.debugText}>Pool Reuse: {poolStats.totals.reuseRate}%</Text>
        <Text style={styles.debugText}>GC Count: {metrics.gcCount}</Text>
      </View>
    </View>
  );
}

// Import Text component for debug overlay
import { Text } from 'react-native';

const styles = StyleSheet.create({
  renderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  entityContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'column',
    gap: 10,
  },
  debugPanel: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 5,
  },
  debugTitle: {
    color: '#92CC41',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 12,
  },
});

// Export render system components
export const RenderComponents = {
  Fighter: require('./renderers/FighterRenderer').FighterRenderer,
  Effect: require('./renderers/EffectRenderer').EffectRenderer,
  Projectile: require('./renderers/ProjectileRenderer').ProjectileRenderer,
  HUD: require('./renderers/HUDRenderer').HUDRenderer,
  Arena: require('./renderers/ArenaRenderer').ArenaRenderer,
};