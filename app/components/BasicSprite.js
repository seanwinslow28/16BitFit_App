import React from 'react';
import { Image, View, Text } from 'react-native';

const BasicSprite = ({ source }) => {
  console.log('BasicSprite source:', source);
  
  return (
    <View style={{ width: 128, height: 128, backgroundColor: 'rgba(255,0,0,0.3)', overflow: 'hidden' }}>
      {source ? (
        <Image
          source={source}
          style={{
            width: 256,  // Show 1/4 of the sprite sheet width
            height: 256, // Show 1/4 of the sprite sheet height
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          resizeMode="cover"
          onError={(e) => console.log('BasicSprite image error:', e.nativeEvent.error)}
          onLoad={() => console.log('BasicSprite image loaded')}
        />
      ) : (
        <View style={{ width: '100%', height: '100%', backgroundColor: 'yellow', justifyContent: 'center', alignItems: 'center' }}>
          <Text>NO IMG</Text>
        </View>
      )}
    </View>
  );
};

export default BasicSprite;