/**
 * Sprite Batching System for 16BitFit
 * Optimizes rendering by batching similar sprites together
 * Reduces draw calls and improves performance
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export class SpriteBatcher {
  constructor() {
    // Batch configuration
    this.config = {
      maxBatchSize: 32,
      maxTexturesPerBatch: 8,
      sortByTexture: true,
      sortByDepth: true,
      useSpriteSheets: true,
    };
    
    // Active batches
    this.batches = new Map();
    this.batchPool = [];
    this.frameCount = 0;
    
    // Sprite sheet cache
    this.spriteSheetCache = new Map();
    
    // Performance tracking
    this.stats = {
      totalSprites: 0,
      batchCount: 0,
      drawCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }
  
  startFrame() {
    // Clear previous frame's batches
    this.batches.forEach(batch => {
      batch.sprites = [];
      this.batchPool.push(batch);
    });
    this.batches.clear();
    
    // Reset stats
    this.stats.totalSprites = 0;
    this.stats.batchCount = 0;
    this.stats.drawCalls = 0;
    this.frameCount++;
  }
  
  addSprite(sprite) {
    this.stats.totalSprites++;
    
    // Find or create appropriate batch
    const batch = this.findOrCreateBatch(sprite);
    batch.sprites.push(sprite);
    
    // Check if batch is full
    if (batch.sprites.length >= this.config.maxBatchSize) {
      this.finalizeBatch(batch);
    }
  }
  
  findOrCreateBatch(sprite) {
    const textureId = sprite.textureId || 'default';
    const layer = sprite.layer || 0;
    const blendMode = sprite.blendMode || 'normal';
    
    // Create batch key
    const batchKey = `${textureId}_${layer}_${blendMode}`;
    
    // Check existing batch
    let batch = this.batches.get(batchKey);
    
    if (!batch || batch.sprites.length >= this.config.maxBatchSize) {
      // Get batch from pool or create new
      batch = this.batchPool.pop() || this.createBatch();
      
      batch.textureId = textureId;
      batch.layer = layer;
      batch.blendMode = blendMode;
      batch.sprites = [];
      
      this.batches.set(batchKey, batch);
      this.stats.batchCount++;
    }
    
    return batch;
  }
  
  createBatch() {
    return {
      id: `batch_${Date.now()}_${Math.random()}`,
      textureId: null,
      layer: 0,
      blendMode: 'normal',
      sprites: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    };
  }
  
  finalizeBatch(batch) {
    // Calculate batch bounds for culling
    this.calculateBatchBounds(batch);
    
    // Sort sprites within batch if needed
    if (this.config.sortByDepth) {
      batch.sprites.sort((a, b) => (a.z || 0) - (b.z || 0));
    }
  }
  
  calculateBatchBounds(batch) {
    if (batch.sprites.length === 0) return;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    batch.sprites.forEach(sprite => {
      const x = sprite.x - sprite.width / 2;
      const y = sprite.y - sprite.height / 2;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + sprite.width);
      maxY = Math.max(maxY, y + sprite.height);
    });
    
    batch.bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  
  endFrame() {
    // Finalize any remaining batches
    this.batches.forEach(batch => {
      if (batch.sprites.length > 0) {
        this.finalizeBatch(batch);
      }
    });
  }
  
  render(viewBounds) {
    const renderedBatches = [];
    
    // Sort batches by layer
    const sortedBatches = Array.from(this.batches.values())
      .filter(batch => batch.sprites.length > 0)
      .sort((a, b) => a.layer - b.layer);
    
    sortedBatches.forEach(batch => {
      // Frustum culling
      if (this.isBatchVisible(batch, viewBounds)) {
        renderedBatches.push(this.renderBatch(batch));
        this.stats.drawCalls++;
      }
    });
    
    return renderedBatches;
  }
  
  isBatchVisible(batch, viewBounds) {
    // Simple AABB collision check
    return !(
      batch.bounds.x > viewBounds.x + viewBounds.width ||
      batch.bounds.x + batch.bounds.width < viewBounds.x ||
      batch.bounds.y > viewBounds.y + viewBounds.height ||
      batch.bounds.y + batch.bounds.height < viewBounds.y
    );
  }
  
  renderBatch(batch) {
    // Check if we can use sprite sheet optimization
    if (this.config.useSpriteSheets && batch.sprites.length > 1) {
      return this.renderSpriteSheetBatch(batch);
    }
    
    // Render individual sprites
    return (
      <View key={batch.id} style={styles.batchContainer}>
        {batch.sprites.map((sprite, index) => 
          this.renderSprite(sprite, `${batch.id}_${index}`)
        )}
      </View>
    );
  }
  
  renderSpriteSheetBatch(batch) {
    const { textureId } = batch;
    const spriteSheet = this.getSpriteSheet(textureId);
    
    if (!spriteSheet) {
      // Fallback to individual rendering
      return this.renderBatch(batch);
    }
    
    return (
      <View key={batch.id} style={styles.batchContainer}>
        {batch.sprites.map((sprite, index) => 
          this.renderSpriteFromSheet(sprite, spriteSheet, `${batch.id}_${index}`)
        )}
      </View>
    );
  }
  
  renderSprite(sprite, key) {
    const {
      x, y, width, height,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      alpha = 1,
      tint,
      source,
      flipX = false,
      flipY = false,
    } = sprite;
    
    const transform = [];
    
    if (rotation !== 0) {
      transform.push({ rotate: `${rotation}rad` });
    }
    
    if (scaleX !== 1 || flipX) {
      transform.push({ scaleX: flipX ? -scaleX : scaleX });
    }
    
    if (scaleY !== 1 || flipY) {
      transform.push({ scaleY: flipY ? -scaleY : scaleY });
    }
    
    const spriteStyle = {
      position: 'absolute',
      left: x - width / 2,
      bottom: y - height / 2,
      width,
      height,
      opacity: alpha,
      transform,
    };
    
    if (tint) {
      spriteStyle.tintColor = tint;
    }
    
    return (
      <Image
        key={key}
        source={source}
        style={spriteStyle}
        resizeMode="contain"
      />
    );
  }
  
  renderSpriteFromSheet(sprite, spriteSheet, key) {
    const {
      x, y, width, height,
      frameX, frameY, frameWidth, frameHeight,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      alpha = 1,
      tint,
      flipX = false,
      flipY = false,
    } = sprite;
    
    const transform = [];
    
    if (rotation !== 0) {
      transform.push({ rotate: `${rotation}rad` });
    }
    
    if (scaleX !== 1 || flipX) {
      transform.push({ scaleX: flipX ? -scaleX : scaleX });
    }
    
    if (scaleY !== 1 || flipY) {
      transform.push({ scaleY: flipY ? -scaleY : scaleY });
    }
    
    const containerStyle = {
      position: 'absolute',
      left: x - width / 2,
      bottom: y - height / 2,
      width,
      height,
      opacity: alpha,
      transform,
      overflow: 'hidden',
    };
    
    const imageStyle = {
      position: 'absolute',
      left: -frameX,
      top: -frameY,
      width: spriteSheet.width,
      height: spriteSheet.height,
    };
    
    if (tint) {
      imageStyle.tintColor = tint;
    }
    
    return (
      <View key={key} style={containerStyle}>
        <Image
          source={spriteSheet.source}
          style={imageStyle}
          resizeMode="none"
        />
      </View>
    );
  }
  
  getSpriteSheet(textureId) {
    // Check cache
    let spriteSheet = this.spriteSheetCache.get(textureId);
    
    if (spriteSheet) {
      this.stats.cacheHits++;
      return spriteSheet;
    }
    
    this.stats.cacheMisses++;
    
    // Load sprite sheet configuration
    spriteSheet = this.loadSpriteSheet(textureId);
    
    if (spriteSheet) {
      this.spriteSheetCache.set(textureId, spriteSheet);
    }
    
    return spriteSheet;
  }
  
  loadSpriteSheet(textureId) {
    // Define sprite sheet configurations
    const spriteSheets = {
      player: {
        source: require('../../../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
        width: 1024,
        height: 1024,
        frames: {
          idle: { x: 0, y: 0, width: 128, height: 128, count: 4 },
          walk: { x: 0, y: 128, width: 128, height: 128, count: 6 },
          punch: { x: 0, y: 256, width: 128, height: 128, count: 4 },
          kick: { x: 0, y: 384, width: 128, height: 128, count: 4 },
        },
      },
      boss_sloth: {
        source: require('../../../assets/Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png'),
        width: 1024,
        height: 1024,
        frames: {
          idle: { x: 0, y: 0, width: 128, height: 128, count: 4 },
          attack: { x: 0, y: 128, width: 128, height: 128, count: 6 },
        },
      },
    };
    
    return spriteSheets[textureId] || null;
  }
  
  getStats() {
    return {
      ...this.stats,
      avgSpritesPerBatch: this.stats.batchCount > 0 
        ? Math.round(this.stats.totalSprites / this.stats.batchCount)
        : 0,
      cacheHitRate: this.stats.cacheHits + this.stats.cacheMisses > 0
        ? Math.round((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100)
        : 0,
    };
  }
  
  clear() {
    this.batches.clear();
    this.batchPool = [];
    this.spriteSheetCache.clear();
  }
}

const styles = StyleSheet.create({
  batchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

// Singleton instance
let spriteBatcher = null;

export function getSpriteBatcher() {
  if (!spriteBatcher) {
    spriteBatcher = new SpriteBatcher();
  }
  return spriteBatcher;
}