/**
 * Onboarding Screens Export
 * Central export for all onboarding-related screens
 */

export { default as CharacterSelectionScreen } from '../CharacterSelectionScreen';
// export { default as CharacterSelectionDemo } from '../CharacterSelectionDemo'; // File missing - commented out
export { default as GuestOnboardingScreen } from './GuestOnboardingScreen';

// New onboarding screens
export { default as OnboardingWelcomeScreen } from './OnboardingWelcomeScreen';
export { default as OnboardingAuthScreen } from './OnboardingAuthScreen';
export { default as OnboardingCharacterCreationScreen } from './OnboardingCharacterCreationScreen';
export { default as OnboardingHealthScreen } from './OnboardingHealthScreen';

// Re-export components for easy access
export { default as ArchetypeCharacterDisplay } from '../../components/ArchetypeCharacterDisplay';
export { useCharacterArchetype } from '../../hooks/useCharacterArchetype';