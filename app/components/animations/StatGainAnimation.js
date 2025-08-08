import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import designTokens from '../../constants/designTokens';

const StatBar = ({ label, from, to, duration, delay = 0 }) => {
    const animatedValue = useRef(new Animated.Value(from)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                // Animate the bar filling
                Animated.timing(animatedValue, {
                    toValue: to,
                    duration: duration,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false, // Required for width animation
                }),
                // Animate the "+X" text appearing
                Animated.parallel([
                    Animated.timing(textOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(textTranslateY, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.out(Easing.back),
                        useNativeDriver: true,
                    })
                ])
            ]),
            // Flash effect at the end
            Animated.sequence([
                Animated.timing(flashAnim, { 
                    toValue: 1, 
                    duration: 100, 
                    useNativeDriver: true 
                }),
                Animated.timing(flashAnim, { 
                    toValue: 0, 
                    duration: 200, 
                    useNativeDriver: true 
                }),
            ])
        ]).start();
    }, []);

    const widthInterpolation = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const flashInterpolation = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
    });

    const gain = to - from;

    return (
        <View style={styles.statRow}>
            <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{label}</Text>
                <Animated.View style={{ 
                    opacity: textOpacity,
                    transform: [{ translateY: textTranslateY }]
                }}>
                    <Text style={styles.statGain}>+{gain}</Text>
                </Animated.View>
            </View>
            <View style={styles.statBarBackground}>
                <Animated.View style={[styles.statBarFill, { width: widthInterpolation }]} />
                <Animated.View style={[styles.flashOverlay, { opacity: flashInterpolation }]} />
            </View>
            <Text style={styles.statValue}>{to}/100</Text>
        </View>
    );
};

const StatGainAnimation = ({ initialStats, gains, onComplete }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, { 
                toValue: 1, 
                duration: 300, 
                useNativeDriver: true 
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Calculate total animation time and trigger exit
        const statEntries = Object.entries(gains).filter(([_, value]) => value > 0);
        const totalTime = 300 + (statEntries.length * 600) + 1000; // Entry + staggered stats + pause

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { 
                    toValue: 0, 
                    duration: 300, 
                    useNativeDriver: true 
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                if (onComplete) onComplete();
            });
        }, totalTime);
    }, []);
      
    return (
        <Animated.View style={[
            styles.container, 
            { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
            }
        ]}>
            <View style={styles.panel}>
                <Text style={styles.title}>STATS INCREASED!</Text>
                <View style={styles.divider} />
                {Object.entries(gains).map(([key, value], index) => {
                    if (value === 0) return null;
                    const from = initialStats[key] || 0;
                    const to = Math.min(from + value, 100); // Cap at 100

                    return (
                        <StatBar 
                            key={key} 
                            label={key.toUpperCase()} 
                            from={from} 
                            to={to} 
                            duration={400}
                            delay={index * 300} // Stagger each stat
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
};

const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 56, 15, 0.85)', // Dark green overlay
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    panel: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: colors.theme.text,
        borderRadius: radius.lg,
        padding: spacing['2xl'],
        borderWidth: 4,
        borderColor: colors.theme.primary,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.xl.fontSize,
        color: colors.accent['steely-blue'],
        textAlign: 'center',
        marginBottom: spacing.sm,
        textShadowColor: colors.theme.primary,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    divider: {
        height: 2,
        backgroundColor: colors.theme.primary,
        marginBottom: spacing.lg,
        opacity: 0.3,
    },
    statRow: {
        marginBottom: spacing.lg,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.primary,
    },
    statGain: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.sm.fontSize,
        color: colors.accent['steely-blue'],
        fontWeight: 'bold',
    },
    statBarBackground: {
        height: 24,
        backgroundColor: colors.theme.surfaceDark,
        borderRadius: radius.sm,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.theme.surface,
    },
    statBarFill: {
        height: '100%',
        backgroundColor: colors.accent['steely-blue'],
        borderRadius: radius.sm - 2,
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        borderRadius: radius.sm - 2,
    },
    statValue: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.xs.fontSize,
        color: colors.theme.textLight,
        textAlign: 'right',
        marginTop: spacing.xs,
    }
});

export default StatGainAnimation;