import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Note: If expo-blur is not installed, we can simulate with semi-transparent background.
// I will check imports later, but for now I'll use a semi-transparent view fallback to be safe.

const AISummaryCard = () => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>AI Insight</Text>
                    <Text style={styles.text}>
                        Based on your current trajectory, you will save <Text style={styles.highlight}>₹4,200</Text> more than last month.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 24,
        padding: 4, // Gradient border effect simulation or just padding
        marginVertical: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // Very light blue/gray
        borderRadius: 20,
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2979FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#2979FF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    text: {
        color: '#1A2B3C',
        fontSize: 13,
        lineHeight: 18,
    },
    highlight: {
        color: '#2979FF',
        fontWeight: 'bold',
    },
});

export default AISummaryCard;
