/**
 * Debug renderer for visualizing hitboxes and hurtboxes
 * Only renders when debug mode is enabled
 */

import React from 'react';
import { View, Text } from 'react-native';

const HitboxDebugRenderer = ({ debugData, screenDimensions }) => {
  if (!debugData) return null;
  
  const { hitboxes, hurtboxes } = debugData;
  
  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenDimensions.width,
        height: screenDimensions.height,
        pointerEvents: 'none',
      }}
    >
      {/* Render hurtboxes first (behind hitboxes) */}
      {hurtboxes.map((hurtbox, index) => (
        <View
          key={`hurtbox_${index}`}
          style={{
            position: 'absolute',
            left: hurtbox.bounds.min.x,
            top: hurtbox.bounds.min.y,
            width: hurtbox.bounds.max.x - hurtbox.bounds.min.x,
            height: hurtbox.bounds.max.y - hurtbox.bounds.min.y,
            backgroundColor: hurtbox.color,
            borderWidth: 2,
            borderColor: hurtbox.type === 'invulnerable' ? '#666' :
                        hurtbox.type === 'counter' ? '#FFD700' :
                        hurtbox.type === 'armor' ? '#0066FF' : '#00FF00',
            borderStyle: hurtbox.type === 'invulnerable' ? 'dashed' : 'solid',
          }}
        >
          <Text style={{
            position: 'absolute',
            top: -20,
            left: 0,
            fontSize: 10,
            color: '#FFF',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 2,
          }}>
            {hurtbox.type}
          </Text>
        </View>
      ))}
      
      {/* Render hitboxes on top */}
      {hitboxes.map((hitbox, index) => (
        <View
          key={`hitbox_${index}`}
          style={{
            position: 'absolute',
            left: hitbox.bounds.min.x,
            top: hitbox.bounds.min.y,
            width: hitbox.bounds.max.x - hitbox.bounds.min.x,
            height: hitbox.bounds.max.y - hitbox.bounds.min.y,
            backgroundColor: hitbox.color,
            borderWidth: 3,
            borderColor: hitbox.type === 'projectile' ? '#FF00FF' :
                        hitbox.type === 'throw' ? '#FFFF00' :
                        hitbox.type === 'counter' ? '#00FFFF' : '#FF0000',
          }}
        >
          <Text style={{
            position: 'absolute',
            bottom: -20,
            left: 0,
            fontSize: 10,
            color: '#FFF',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 2,
          }}>
            {hitbox.type}
          </Text>
        </View>
      ))}
      
      {/* Debug info panel */}
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
          Hitbox Debug Mode
        </Text>
        <Text style={{ color: '#FF0000', fontSize: 10 }}>
          ■ Strike Hitboxes: {hitboxes.filter(h => h.type === 'strike').length}
        </Text>
        <Text style={{ color: '#FF00FF', fontSize: 10 }}>
          ■ Projectile Hitboxes: {hitboxes.filter(h => h.type === 'projectile').length}
        </Text>
        <Text style={{ color: '#00FF00', fontSize: 10 }}>
          ■ Normal Hurtboxes: {hurtboxes.filter(h => h.type === 'normal').length}
        </Text>
        <Text style={{ color: '#666666', fontSize: 10 }}>
          ■ Invulnerable: {hurtboxes.filter(h => h.type === 'invulnerable').length}
        </Text>
      </View>
    </View>
  );
};

export default HitboxDebugRenderer;