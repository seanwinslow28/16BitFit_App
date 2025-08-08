import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HealthIntegration from '../../services/HealthIntegration';
import PixelButton from '../../components/PixelButton';
import designTokens from '../../constants/designTokens';

const OnboardingHealthScreen = () => {
    const navigation = useNavigation();
    const [status, setStatus] = useState('Not Connected');
    const [loading, setLoading] = useState(false);

    // Initialize the health service when the screen loads
    useEffect(() => {
        const init = async () => {
            await HealthIntegration.initialize();
            const currentStatus = HealthIntegration.getStatus();
            setStatus(currentStatus.permissions.steps ? 'Connected' : 'Not Connected');
        };
        init();
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        const permissions = await HealthIntegration.requestPermissions();
        // If successful, update status and navigate to the main app
        if (permissions.steps) {
            setStatus('Connected');
            // Give user a moment to see the success state
            setTimeout(() => {
                navigation.navigate('Main');
            }, 1000);
        } else {
            // Handle case where user denies permissions
            setStatus('Permission Denied');
            setLoading(false);
        }
    };

    const handleSkip = () => {
        // Navigate to the main app, skipping the health connection
        navigation.navigate('Main');
    };

    const platformName = Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit';

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>❤️</Text>
                <Text style={styles.title}>LINK YOUR HEALTH DATA</Text>
                <Text style={styles.description}>
                    16BitFit uses your real-world activity to power up your character.
                    Connect to {platformName} to turn your steps, workouts, and sleep into in-game stats!
                </Text>
                <Text style={styles.statusText}>
                    Status: {status}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <PixelButton onPress={handleConnect} disabled={loading || status === 'Connected'}>
                    {status === 'Connected' ? 'CONNECTED!' : `CONNECT TO ${platformName.toUpperCase()}`}
                </PixelButton>
                <Pressable onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip for Now</Text>
                </Pressable>
            </View>
        </View>
    );
};

const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.theme.background,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 80,
        marginBottom: spacing.xl,
    },
    title: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.xl.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
        lineHeight: typography.styles.lg.lineHeight,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    statusText: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.sm.fontSize,
        color: colors.theme.textLight,
        backgroundColor: colors.theme.surfaceDark,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    buttonContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    skipText: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
        textDecorationLine: 'underline',
    }
});

export default OnboardingHealthScreen;