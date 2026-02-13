import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

const PredictiveBalanceChart = () => {
    const primaryColor = '#2979FF'; // Electric Blue
    const projectedColor = '#4FC3F7'; // Lighter Blue for projection

    const { width } = Dimensions.get('window');

    // Light Theme Colors
    const backgroundColor = '#FFFFFF';
    const textColor = '#1A2B3C';
    const subtitleColor = '#666';
    const borderColor = '#F0F0F0';

    // Mock Data
    const actualData = [
        { value: 12000, label: 'Mon', dataPointText: '12k', textColor: textColor },
        { value: 11500, label: 'Tue', dataPointText: '11.5k', textColor: textColor },
        { value: 13000, label: 'Wed', dataPointText: '13k', textColor: textColor },
        { value: 12800, label: 'Thu', dataPointText: '12.8k', textColor: textColor },
        { value: 14000, label: 'Fri', dataPointText: '14k', textColor: textColor },
        { value: 13500, label: 'Sat', dataPointText: '13.5k', textColor: textColor },
        { value: 15000, label: 'Today', dataPointText: '15k', textColor: primaryColor }, // Highlight Today
    ];

    const projectedData = [
        { value: 15000, label: 'Today' },
        { value: 14800, label: 'Mon', dataPointText: '14.8k', textColor: projectedColor },
        { value: 15200, label: 'Tue', dataPointText: '15.2k', textColor: projectedColor },
        { value: 15800, label: 'Wed', dataPointText: '15.8k', textColor: projectedColor },
        { value: 16500, label: 'Thu', dataPointText: '16.5k', textColor: projectedColor },
        { value: 17000, label: 'Fri', dataPointText: '17k', textColor: projectedColor },
        { value: 19200, label: 'Sat', dataPointText: '19.2k', textColor: projectedColor },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Predictive Balance</Text>
                    <Text style={styles.subtitle}>Forecast starting from Today</Text>
                </View>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                        <Text style={styles.legendText}>Actual</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: projectedColor, opacity: 0.5, borderStyle: 'dotted', borderWidth: 1 }]} />
                        <Text style={styles.legendText}>Projected</Text>
                    </View>
                </View>
            </View>

            <View style={styles.chartWrapper}>
                <LineChart
                    data={actualData}
                    data2={projectedData}
                    height={180}
                    width={width - 80}
                    thickness={3}
                    thickness2={3}
                    color1={primaryColor}
                    color2={projectedColor}
                    strokeDashArray2={[5, 5]}
                    curved
                    // Show Data Points for markers
                    hideDataPoints={false}
                    dataPointsColor1={primaryColor}
                    dataPointsColor2={projectedColor}
                    dataPointsRadius={4}

                    hideRules
                    hideYAxisText
                    xAxisColor="transparent"
                    yAxisColor="transparent"

                    startFillColor1="rgba(41, 121, 255, 0.2)"
                    endFillColor1="rgba(41, 121, 255, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.1}
                    areaChart

                    initialSpacing={20}
                    endSpacing={20}

                    pointerConfig={{
                        pointerStripHeight: 160,
                        pointerStripColor: '#E0E0E0',
                        pointerStripWidth: 2,
                        pointerColor: primaryColor,
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: false,
                        pointerLabelComponent: (items: any) => {
                            const item = items[0];
                            return (
                                <View
                                    style={{
                                        height: 90,
                                        width: 100,
                                        justifyContent: 'center',
                                        marginTop: -30,
                                        marginLeft: -40,
                                    }}>
                                    <Text style={{ color: textColor, fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                                        {item.label}
                                    </Text>
                                    <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F5F5F5' }}>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', color: textColor }}>
                                            {'₹' + item.value.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            );
                        },
                    }}
                />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
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
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -10,
    },
});

export default PredictiveBalanceChart;
