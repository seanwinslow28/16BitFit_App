import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSupabase } from '../../services/SupabaseService';
import PixelButton from '../../components/PixelButton';
import designTokens from '../../constants/designTokens';

const OnboardingAuthScreen = () => {
    const navigation = useNavigation();
    const { supabase } = useSupabase(); // Get the Supabase client

    const [authMode, setAuthMode] = useState('signup'); // Default to 'signup' for new users
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        // Uses the signUp method from your SupabaseService.js file
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (error) Alert.alert('Sign Up Error', error.message);
        else navigation.navigate('OnboardingCharacterCreation'); // Navigate on success
        setLoading(false);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        // Uses the signInWithPassword method from your SupabaseService.js file
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Login Error', error.message);
        // On successful login, we can skip the rest of onboarding for now
        else navigation.navigate('Main');
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{authMode === 'signup' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</Text>
            </View>
              
            <View style={styles.tabContainer}>
                <Pressable onPress={() => setAuthMode('signup')} style={[styles.tab, authMode === 'signup' && styles.activeTab]}>
                    <Text style={styles.tabText}>SIGN UP</Text>
                </Pressable>
                <Pressable onPress={() => setAuthMode('login')} style={[styles.tab, authMode === 'login' && styles.activeTab]}>
                    <Text style={styles.tabText}>LOG IN</Text>
                </Pressable>
            </View>

            <View style={styles.formContainer}>
                {authMode === 'signup' && (
                    <TextInput
                        style={styles.input}
                        placeholder="USERNAME"
                        placeholderTextColor={colors.theme.textLight}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder="EMAIL"
                    placeholderTextColor={colors.theme.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="PASSWORD"
                    placeholderTextColor={colors.theme.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <PixelButton onPress={authMode === 'signup' ? handleSignUp : handleLogin} disabled={loading}>
                    {loading ? 'LOADING...' : (authMode === 'signup' ? 'SIGN UP' : 'LOG IN')}
                </PixelButton>

                <Text style={styles.orText}>OR</Text>
                  
                <PixelButton style={styles.googleButton} textStyle={styles.googleButtonText}>
                    CONTINUE WITH GOOGLE
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
    },
    header: {
        paddingTop: spacing['4xl'],
        paddingBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.xl.fontSize,
        color: colors.theme.text,
    },
    tabContainer: {
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: colors.theme.text,
        borderRadius: radius.md,
        marginBottom: spacing.xl,
    },
    tab: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: colors.theme.surfaceDark,
    },
    tabText: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
    },
    formContainer: {
        gap: spacing.md,
    },
    input: {
        backgroundColor: colors.theme.surface,
        borderWidth: 2,
        borderColor: colors.theme.text,
        padding: spacing.md,
        borderRadius: radius.sm,
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
    },
    orText: {
        fontFamily: typography.fonts.pixel,
        color: colors.theme.text,
        textAlign: 'center',
        marginVertical: spacing.sm,
    },
    googleButton: {
        backgroundColor: colors.shell.light,
        borderColor: colors.button.black,
    },
    googleButtonText: {
        color: colors.button.black,
        fontSize: typography.styles.base.fontSize,
    }
});

export default OnboardingAuthScreen;