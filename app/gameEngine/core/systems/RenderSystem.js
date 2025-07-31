/**
 * Render System for react-native-game-engine
 * Handles sprite rendering, interpolation, and visual effects
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Renderer components for different entity types
const renderers = {
  fighter: FighterRenderer,
  projectile: ProjectileRenderer,
  effect: EffectRenderer,
  arena: ArenaRenderer,
  hud: HUDRenderer,
  ui: UIRenderer,
};

export const RenderSystem = (entities, { time }) => {
  // The render system doesn't modify entities, it just ensures they have renderers
  Object.keys(entities).forEach(key => {
    const entity = entities[key];
    
    if (entity.type && renderers[entity.type] && !entity.renderer) {
      entity.renderer = renderers[entity.type];
    }
  });
  
  return entities;
};

// Fighter Renderer Component
function FighterRenderer({ position, previousPosition, velocity, sprite, spriteFrame, scale, alpha, tint, flipX, width, height }) {
  // Interpolate position for smooth rendering
  const interpolationAlpha = 0.1; // This would come from the game loop
  const interpolatedX = previousPosition ? 
    previousPosition.x + (position.x - previousPosition.x) * interpolationAlpha : 
    position.x;
  const interpolatedY = previousPosition ? 
    previousPosition.y + (position.y - previousPosition.y) * interpolationAlpha : 
    position.y;
  
  const fighterStyle = {
    position: 'absolute',
    left: interpolatedX - width / 2,
    bottom: interpolatedY,
    width,
    height,
    transform: [
      { scaleX: flipX ? -scale : scale },
      { scaleY: scale },
    ],
    opacity: alpha || 1,
  };
  
  // Apply tint if needed
  const imageStyle = {
    width: '100%',
    height: '100%',
    tintColor: tint === 0xFF0000 ? '#FF0000' : undefined,
  };
  
  return (
    <View style={fighterStyle}>
      {sprite && (
        <Image 
          source={sprite} 
          style={imageStyle}
          resizeMode="contain"
        />
      )}
      {/* Debug hitbox visualization */}
      {__DEV__ && (
        <View style={[styles.debugHitbox, { width, height }]} />
      )}
    </View>
  );
}

// Projectile Renderer Component
function ProjectileRenderer({ position, rotation, sprite, scale, alpha, trailAlpha }) {
  const projectileStyle = {
    position: 'absolute',
    left: position.x - 15,
    bottom: position.y - 15,
    width: 30,
    height: 30,
    transform: [
      { rotate: `${rotation}rad` },
      { scale: scale || 1 },
    ],
    opacity: alpha || 1,
  };
  
  return (
    <View style={projectileStyle}>
      {/* Trail effect */}
      {trailAlpha && (
        <View style={[styles.projectileTrail, { opacity: trailAlpha }]} />
      )}
      {/* Projectile sprite */}
      <View style={styles.projectileSprite}>
        {sprite === 'fireball' && <Text style={styles.fireballEmoji}>🔥</Text>}
      </View>
    </View>
  );
}

// Effect Renderer Component
function EffectRenderer({ effectType, position, scale, alpha, sprite, followEntity }) {
  const effectStyle = {
    position: 'absolute',
    left: position.x,
    bottom: position.y,
    transform: [{ scale: scale || 1 }],
    opacity: alpha || 1,
  };
  
  if (effectType === 'hit') {
    return (
      <View style={[effectStyle, styles.hitEffect]}>
        <View style={styles.hitBurst} />
      </View>
    );
  } else if (effectType === 'dust') {
    return (
      <View style={[effectStyle, styles.dustEffect]}>
        <View style={styles.dustParticle} />
      </View>
    );
  } else if (effectType === 'aura') {
    return (
      <View style={[effectStyle, styles.auraEffect]}>
        <View style={styles.auraGlow} />
      </View>
    );
  }
  
  return null;
}

// Arena Renderer Component
function ArenaRenderer({ background, width, height }) {
  return (
    <View style={[styles.arena, { width, height }]}>
      {background && (
        <Image 
          source={background} 
          style={styles.arenaBackground}
          resizeMode="cover"
        />
      )}
      <View style={styles.arenaFloor} />
    </View>
  );
}

// HUD Renderer Component
function HUDRenderer({ playerHP, playerMaxHP, bossHP, bossMaxHP, comboCount, specialMeter, roundTime }) {
  return (
    <View style={styles.hud}>
      {/* Health Bars */}
      <View style={styles.healthBars}>
        <View style={styles.playerHealthContainer}>
          <Text style={styles.fighterName}>PLAYER</Text>
          <View style={styles.healthBarBg}>
            <View 
              style={[
                styles.healthBarFill, 
                styles.playerHealthFill,
                { width: `${(playerHP / playerMaxHP) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.timerContainer}>
          <Text style={styles.roundTimer}>{roundTime || 99}</Text>
        </View>
        
        <View style={styles.bossHealthContainer}>
          <Text style={styles.fighterName}>BOSS</Text>
          <View style={styles.healthBarBg}>
            <View 
              style={[
                styles.healthBarFill, 
                styles.bossHealthFill,
                { width: `${(bossHP / bossMaxHP) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Special Meter */}
      <View style={styles.specialMeterContainer}>
        <Text style={styles.specialLabel}>SPECIAL</Text>
        <View style={styles.specialMeterBg}>
          <View 
            style={[
              styles.specialMeterFill,
              { width: `${specialMeter}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Combo Counter */}
      {comboCount > 1 && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>COMBO</Text>
          <Text style={styles.comboCount}>x{comboCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Fighter styles
  debugHitbox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  
  // Projectile styles
  projectileTrail: {
    position: 'absolute',
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255, 100, 0, 0.3)',
    borderRadius: 15,
    left: -10,
  },
  projectileSprite: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireballEmoji: {
    fontSize: 24,
  },
  
  // Effect styles
  hitEffect: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitBurst: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 0, 0.8)',
    borderRadius: 25,
  },
  dustEffect: {
    width: 20,
    height: 20,
  },
  dustParticle: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    borderRadius: 10,
  },
  auraEffect: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraGlow: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.6)',
  },
  
  // Arena styles
  arena: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  arenaBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  arenaFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#708028',
    borderTopWidth: 4,
    borderTopColor: '#0D0D0D',
  },
  
  // HUD styles
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  healthBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerHealthContainer: {
    flex: 1,
    marginRight: 10,
  },
  bossHealthContainer: {
    flex: 1,
    marginLeft: 10,
  },
  timerContainer: {
    paddingHorizontal: 20,
  },
  roundTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F7D51D',
    fontFamily: 'monospace',
  },
  fighterName: {
    fontSize: 12,
    color: '#92CC41',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  healthBarBg: {
    height: 20,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#0D0D0D',
    borderRadius: 4,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  playerHealthFill: {
    backgroundColor: '#92CC41',
  },
  bossHealthFill: {
    backgroundColor: '#E53935',
  },
  specialMeterContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  specialLabel: {
    fontSize: 10,
    color: '#3498db',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  specialMeterBg: {
    height: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#0D0D0D',
    borderRadius: 4,
  },
  specialMeterFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  comboContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 14,
    color: '#F7D51D',
    fontFamily: 'monospace',
  },
  comboCount: {
    fontSize: 24,
    color: '#F7D51D',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});

// UI Renderer Component (for combo display and other UI elements)
function UIRenderer({ component, data }) {
  switch (component) {
    case 'ComboDisplay':
      // Import and use the ComboDisplay component
      const { ComboDisplay } = require('../components/ComboDisplay');
      return <ComboDisplay comboData={data} />;
    default:
      return null;
  }
}