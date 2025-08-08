import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSupabase } from '../../services/SupabaseService';
import CharacterArena from '../../components/CharacterArena';
import PixelButton from '../../components/PixelButton';
import designTokens from '../../constants/designTokens';

// Define our "Starter" characters
const STARTER_CHARACTERS = [
    {
        id: 'brawler',
        name: 'BRAWLER',
        description: 'Starts with a bonus to Strength.',
        spriteState: 'flex', // Prop for CharacterArena
    },
    {
        id: 'cardio_champ',
        name: 'SPRINTER',
        description: 'Starts with a bonus to Stamina.',
        spriteState: 'postWorkout',
    },
    {
        id: 'yogi',
        name: 'YOGI',
        description: 'Starts with a bonus to Health.',
        spriteState: 'idle',
    },
];

const FITNESS_GOALS = [
    { id: 'build_muscle', name: 'BUILD MUSCLE' },
    { id: 'improve_endurance', name: 'IMPROVE ENDURANCE' },
    { id: 'general_fitness', name: 'GENERAL FITNESS' },
];

const OnboardingCharacterCreationScreen = () => {
    const navigation = useNavigation();
    const { supabase, user } = useSupabase(); // Assuming user object is available after auth

    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [characterName, setCharacterName] = useState(user?.user_metadata?.username || '');
    const [selectedGoalId, setSelectedGoalId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreateCharacter = async () => {
        if (!selectedAvatarId || !characterName || !selectedGoalId) {
            Alert.alert('Incomplete', 'Please select an avatar, name your character, and choose a goal.');
            return;
        }
        setLoading(true);

        // NOTE: You may need to update your 'createUserProfile' function in SupabaseService.js
        // to accept the archetype and goal.
        // This is a conceptual call to what that function *should* do.
        const { error } = await supabase.from('characters').insert({
            user_id: user.id,
            name: characterName,
            archetype: selectedAvatarId,
            fitness_goal: selectedGoalId,
            level: 1, // Default starting stats
            experience: 0,
            strength: 50,
            endurance: 50,
            speed: 50,
            health: 100,
        });

        if (error) {
            Alert.alert('Error', 'Could not create your character. Please try again.');
            setLoading(false);
        } else {
            navigation.navigate('OnboardingHealth'); // Navigate to the final step on success
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>CHOOSE YOUR FIGHTER</Text>
            </View>

            <View style={styles.selectionGrid}>
                {STARTER_CHARACTERS.map((char) => (
                    <Pressable key={char.id} onPress={() => setSelectedAvatarId(char.id)} style={[styles.card, selectedAvatarId === char.id && styles.selectedCard]}>
                        <CharacterArena 
                            characterState={char.spriteState} 
                            backgroundType="dojo"
                            style={styles.characterArena} 
                        />
                        <Text style={styles.cardTitle}>{char.name}</Text>
                        <Text style={styles.cardDescription}>{char.description}</Text>
                    </Pressable>
                ))}
            </View>

            {selectedAvatarId && (
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>NAME YOUR CHARACTER</Text>
                    <TextInput
                        style={styles.input}
                        value={characterName}
                        onChangeText={setCharacterName}
                        placeholder="Enter Name"
                        placeholderTextColor={colors.theme.textLight}
                    />

                    <Text style={styles.sectionTitle}>WHAT IS YOUR GOAL?</Text>
                    <View style={styles.goalContainer}>
                        {FITNESS_GOALS.map(goal => (
                             <Pressable key={goal.id} onPress={() => setSelectedGoalId(goal.id)} style={[styles.goalButton, selectedGoalId === goal.id && styles.selectedGoalButton]}>
                                 <Text style={[styles.goalText, selectedGoalId === goal.id && styles.selectedGoalText]}>{goal.name}</Text>
                             </Pressable>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <PixelButton onPress={handleCreateCharacter} disabled={!selectedAvatarId || !characterName || !selectedGoalId || loading}>
                    {loading ? "CREATING..." : "START MY JOURNEY"}
                </PixelButton>
            </View>
        </ScrollView>
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
        paddingTop: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.xl.fontSize,
        color: colors.theme.text,
    },
    selectionGrid: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.theme.surfaceDark,
        borderWidth: 2,
        borderColor: colors.theme.text,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    selectedCard: {
        borderColor: colors.accent['steely-blue'],
        backgroundColor: colors.theme.text,
    },
    characterArena: {
        width: '100%',
        height: 150, // Fixed height for consistency
        backgroundColor: colors.screen.light, // From the green screen palette
        borderRadius: radius.sm,
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.lg.fontSize,
        color: colors.theme.primary,
        marginBottom: spacing.xs,
    },
    cardDescription: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.sm.fontSize,
        color: colors.theme.textLight,
        textAlign: 'center',
    },
    detailsSection: {
        marginTop: spacing.xl,
        backgroundColor: colors.theme.text,
        padding: spacing.md,
        borderRadius: radius.md,
    },
    sectionTitle: {
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.primary,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.theme.surface,
        borderWidth: 2,
        borderColor: colors.theme.surfaceDark,
        padding: spacing.md,
        borderRadius: radius.sm,
        fontFamily: typography.fonts.pixel,
        fontSize: typography.styles.base.fontSize,
        color: colors.theme.text,
        textAlign: 'center',
    },
    goalContainer: {
        gap: spacing.sm,
    },
    goalButton: {
        backgroundColor: colors.theme.surface,
        padding: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.theme.surfaceDark,
    },
    selectedGoalButton: {
        backgroundColor: colors.accent['steely-blue'],
        borderColor: colors.shell.light,
    },
    goalText: {
        fontFamily: typography.fonts.pixel,
        color: colors.theme.text,
        textAlign: 'center',
    },
    selectedGoalText: {
        color: colors.shell.light,
    },
    buttonContainer: {
        marginVertical: spacing.xl,
    }
});

export default OnboardingCharacterCreationScreen;