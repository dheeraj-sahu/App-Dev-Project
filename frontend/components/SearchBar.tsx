import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export default function SearchBar() {
    const { theme: currentTheme } = useTheme();
    const theme = Colors[currentTheme];
    const isDark = currentTheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2A2A2A' : '#F0F2F5' }]}>
                <Ionicons name="search" size={20} color={theme.icon} style={styles.icon} />
                <TextInput
                    placeholder="Search..."
                    placeholderTextColor={theme.icon}
                    style={[styles.input, { color: theme.text }]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 44,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
});
