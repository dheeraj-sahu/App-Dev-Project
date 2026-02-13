import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SpendingSprints = () => {
    // Mock Data for a week
    const weekData = [
        { day: 'M', value: 200, label: 'Mon' },
        { day: 'T', value: 450, label: 'Tue' },
        { day: 'W', value: 1500, label: 'Wed' },
        { day: 'T', value: 800, label: 'Thu' },
        { day: 'F', value: 2200, label: 'Fri' }, // Peak
        { day: 'S', value: 1800, label: 'Sat' },
        { day: 'S', value: 600, label: 'Sun' },
    ];

    const maxValue = Math.max(...weekData.map(d => d.value));

    const getOpacity = (value: number) => {
        return (value / maxValue) * 0.9 + 0.1; // Min 0.1 opacity
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Spending Sprints</Text>
            <Text style={styles.subtitle}>Peak spending heatmap (Weekly)</Text>

            <View style={styles.heatmapContainer}>
                {weekData.map((item, index) => (
                    <View key={index} style={styles.dayColumn}>
                        <View
                            style={[
                                styles.heatBlock,
                                {
                                    backgroundColor: `rgba(41, 121, 255, ${getOpacity(item.value)})`,
                                    height: 40 + (item.value / maxValue) * 40, // Dynamic height
                                }
                            ]}
                        />
                        <Text style={styles.dayLabel}>{item.day}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginVertical: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2B3C',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
    },
    heatmapContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
    },
    dayColumn: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 30,
    },
    heatBlock: {
        width: '100%',
        borderRadius: 6,
        marginBottom: 8,
    },
    dayLabel: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default SpendingSprints;
