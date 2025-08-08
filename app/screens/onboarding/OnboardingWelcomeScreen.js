import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PixelButton from '../../components/PixelButton';
import designTokens from '../../constants/designTokens';

const OnboardingWelcomeScreen = () => {
    const navigation = useNavigation();

    // In a real app, you would have a more robust navigation stack for onboarding
    // For now, we'll assume it navigates to the next step.
    const handleGetStarted = () => {
        // We'll need to create this screen next
        navigation.navigate('OnboardingAuth');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>WELCOME TO</Text>
                <Text style={styles.appName}>16BITFIT</Text>

                <View style={styles.coreLoopContainer}>
                    <Text style={styles.loopText}>1. TRAIN in real life.</Text>
                    <Text style={styles.loopText}>2. LEVEL UP your character.</Text>
                    <Text style={styles.loopText}>3. BATTLE to test your strength.</Text>
                </View>

                <Text style={styles.subtitle}>Your fitness journey starts now!</Text>
            </View>

            <View style={styles.buttonContainer}>
                <PixelButton onPress={handleGetStarted}>
                    GET STARTED
                </PixelButton>
            </View>
        </View>
    );
};

const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.theme.background,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.lg.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
    },
    appName: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.title.fontSize,
        color: colors.accent['steely-blue'],
        textAlign: 'center',
        marginBottom: spacing['4xl'],
        textShadowColor: colors.theme.text,
        textShadowOffset: { width: 2, height: 2 },
    },
    coreLoopContainer: {
        backgroundColor: colors.theme.surfaceDark,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.theme.text,
        marginBottom: spacing['4xl'],
    },
    loopText: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.primary,
        textAlign: 'left',
        marginVertical: spacing.sm,
        lineHeight: typography.styles.lg.lineHeight,
    },
    subtitle: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
    },
    buttonContainer: {
        padding: spacing.lg,
    }
});

export default OnboardingWelcomeScreen;