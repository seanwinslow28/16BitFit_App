import React from 'react';  
import { View, Text, Pressable, StyleSheet } from 'react-native';  
import designTokens from '../constants/designTokens';

// Simple icon components to represent the Game Boy buttons  
const AButton = () => <View style={[styles.buttonShape, styles.abButton]}><Text style={styles.buttonText}>A</Text></View>;  
const BButton = () => <View style={[styles.buttonShape, styles.abButton]}><Text style={styles.buttonText}>B</Text></View>;  
const HomeIcon = () => <Text style={styles.iconText}>🏠</Text>;  
const SocialIcon = () => <Text style={styles.iconText}>🌐</Text>;

const ControlDeckTabBar = ({ state, descriptors, navigation }) => {  
    return (  
        <View style={styles.container}>  
            {state.routes.map((route, index) => {  
                const { options } = descriptors[route.key];  
                const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;  
                const isFocused = state.index === index;

                const onPress = () => {  
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });  
                    if (!isFocused && !event.defaultPrevented) {  
                        navigation.navigate(route.name);  
                    }  
                };

                const getIcon = () => {  
                    if (route.name === 'HomeTab') return <HomeIcon />;  
                    if (route.name === 'BattleTab') return <AButton />;  
                    if (route.name === 'StatsTab') return <BButton />;  
                    if (route.name === 'SocialTab') return <SocialIcon />;  
                    return null;  
                }

                return (  
                    <Pressable  
                        key={index}  
                        accessibilityRole="button"  
                        accessibilityState={isFocused ? { selected: true } : {}}  
                        onPress={onPress}  
                        style={styles.tabButton}  
                    >  
                        <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>  
                            {getIcon()}  
                        </View>  
                        <Text style={[styles.label, { color: isFocused ? colors.theme.primary : colors.theme.textLight }]}>  
                            {label}  
                        </Text>  
                    </Pressable>  
                );  
            })}  
        </View>  
    );  
};

const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({  
    container: {  
        flexDirection: 'row',  
        height: 85,  
        backgroundColor: colors.shell.dark, // The gray "shell" plastic color  
        borderTopWidth: 2,  
        borderColor: colors.button.black,  
        paddingBottom: 20, // For the home indicator area  
    },  
    tabButton: {  
        flex: 1,  
        justifyContent: 'center',  
        alignItems: 'center',  
        gap: spacing.xs,  
    },  
    iconContainer: {  
        justifyContent: 'center',  
        alignItems: 'center',  
        width: 50,  
        height: 50,  
        borderRadius: radius.full,  
    },  
    focusedIconContainer: {  
        backgroundColor: 'rgba(155, 188, 15, 0.2)', // A faint green glow  
    },  
    label: {  
        fontFamily: typography.fonts.pixel,  
        fontSize: typography.styles.sm.fontSize,  
    },  
    iconText: {  
        fontSize: 28,  
    },  
    // Styles for the A/B button icons  
    buttonShape: {  
        width: 36,  
        height: 36,  
        borderRadius: radius.full,  
        justifyContent: 'center',  
        alignItems: 'center',  
        borderWidth: 2,  
    },  
    abButton: {  
        backgroundColor: colors.button.burgundy,  
        borderColor: colors.button.black,  
    },  
    buttonText: {  
        fontFamily: typography.fonts.pixel,  
        color: colors.shell.light,  
        fontSize: typography.styles.lg.fontSize,  
    }  
});

export default ControlDeckTabBar;