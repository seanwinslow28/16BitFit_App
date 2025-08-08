import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import designTokens from '../../constants/designTokens';

const { width, height } = Dimensions.get('window');
const PIXEL_SIZE = 40; // The size of each square in the dissolve. Adjust for more/less detail.

const PixelDissolve = ({ isActive, onAnimationEnd }) => {
    const grid = useRef([]).current;
    const animatedValues = useRef([]).current;

    // Create the grid of pixels only once
    if (grid.length === 0) {
        const numCols = Math.ceil(width / PIXEL_SIZE);
        const numRows = Math.ceil(height / PIXEL_SIZE);
        for (let i = 0; i < numRows * numCols; i++) {
            grid.push(i);
            animatedValues.push(new Animated.Value(0));
        }
        // Shuffle the animations for a random dissolve effect
        animatedValues.sort(() => Math.random() - 0.5);
    }

    useEffect(() => {
        if (isActive) {
            // Animate in
            Animated.stagger(2, 
                animatedValues.map(val => Animated.timing(val, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }))
            ).start(() => {
                // Once fully covered, call the onAnimationEnd callback
                if (onAnimationEnd) onAnimationEnd();
                // Then, animate out
                 Animated.stagger(2, 
                    animatedValues.map(val => Animated.timing(val, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }))
                ).start();
            });
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {grid.map((_, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.pixel,
                        { opacity: animatedValues[index] }
                    ]}
                />
            ))}
        </View>
    );
};

const { colors } = designTokens;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pixel: {
        width: PIXEL_SIZE,
        height: PIXEL_SIZE,
        backgroundColor: colors.theme.darkest || '#0F380F', // Use our darkest green for the dissolve color
    }
});

export default PixelDissolve;