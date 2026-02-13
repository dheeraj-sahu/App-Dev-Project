import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

// Mock Data
const BUDGET_CATEGORIES = [
    { id: '1', name: 'Food', spent: 4500, limit: 8000, color: 'warning', icon: 'fast-food', suggestion: true },
    { id: '2', name: 'Travel', spent: 2100, limit: 5000, color: 'success', icon: 'bus', suggestion: false },
    { id: '3', name: 'Shopping', spent: 8200, limit: 10000, color: 'danger', icon: 'cart', suggestion: false },
    { id: '4', name: 'Utilities', spent: 1200, limit: 3000, color: 'success', icon: 'water', suggestion: false },
];

const UPCOMING_BILLS = [
    { id: '1', name: 'Netflix', date: 'Due Tomorrow', amount: 499, icon: 'movie-open' },
    { id: '2', name: 'Electricity', date: 'Due in 3 days', amount: 1250, icon: 'flash' },
    { id: '3', name: 'Internet', date: 'Due in 5 days', amount: 899, icon: 'wifi' },
];

import { PurchaseSimulationModal } from '@/components/PurchaseSimulationModal';

export default function BudgetScreen() {
    const { theme: currentTheme } = useTheme();
    const [simulationModalVisible, setSimulationModalVisible] = React.useState(false);
    // We force some light theme aspects for the "Airy" look if needed, but standardizing on theme context is better.
    // The user requested "Clean, airy, optimistic" which usually implies light mode.
    // We will use the theme values but ensuring they match the vibe.
    const theme = Colors[currentTheme];
    const isDark = currentTheme === 'dark';

    // Gauge Calculation
    const radius = 100;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;
    const halfCircle = radius + strokeWidth;
    const percentage = 65; // Safe to spend percentage
    const maxStroke = (Math.PI * radius); // Only semi-circle
    const strokeDashoffset = maxStroke - (maxStroke * percentage) / 100;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Weekly Budget</Text>
                    <TouchableOpacity style={[styles.dateBadge, { backgroundColor: theme.card }]}>
                        <Text style={[styles.dateText, { color: theme.text }]}>Feb 11 - Feb 17</Text>
                        <Ionicons name="chevron-down" size={12} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Hero: Safe-to-Spend Gauge */}
                <View style={[styles.heroSection, { backgroundColor: theme.card }]}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                        <Svg height={radius + strokeWidth} width={width * 0.8} viewBox={`0 0 ${width * 0.8} ${radius + strokeWidth + 20}`}>
                            <Defs>
                                <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor={theme.emerald} stopOpacity="1" />
                                    <Stop offset="1" stopColor={theme.tint} stopOpacity="1" />
                                </SvgGradient>
                            </Defs>
                            {/* Background Arc */}
                            <Circle
                                cx={width * 0.4}
                                cy={radius + strokeWidth}
                                r={radius}
                                stroke={isDark ? '#333' : '#F3F4F6'}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${maxStroke} ${circumference}`}
                                strokeLinecap="round"
                                fill="transparent"
                                rotation="-180"
                                originX={width * 0.4}
                                originY={radius + strokeWidth}
                            />
                            {/* Foreground Arc */}
                            <Circle
                                cx={width * 0.4}
                                cy={radius + strokeWidth}
                                r={radius}
                                stroke="url(#grad)" // Gradient Emerald
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${maxStroke} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                rotation="-180"
                                originX={width * 0.4}
                                originY={radius + strokeWidth}
                            />
                        </Svg>

                        {/* Center Text */}
                        <View style={[styles.gaugeTextContainer, { bottom: 0 }]}>
                            <Text style={[styles.safeLabel, { color: theme.icon }]}>Safe to Spend</Text>
                            <Text style={[styles.amountText, { color: theme.text }]}>₹12,400</Text>
                            <Text style={[styles.subtitleText, { color: theme.icon }]}>After all bills paid</Text>
                        </View>
                    </View>
                </View>

                {/* Fixed Costs Strip */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Bills</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.costsScroll}>
                        {UPCOMING_BILLS.map((bill) => (
                            <View key={bill.id} style={[
                                styles.billCard,
                                { backgroundColor: isDark ? 'rgba(41, 121, 255, 0.15)' : 'rgba(41, 121, 255, 0.05)', borderColor: theme.border }
                            ]}>
                                <View style={[styles.billIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFF' }]}>
                                    <MaterialCommunityIcons name={bill.icon as any} size={20} color={theme.text} />
                                </View>
                                <View>
                                    <Text style={[styles.billName, { color: theme.text }]}>{bill.name}</Text>
                                    <Text style={[styles.billDate, { color: theme.icon }]}>{bill.date}</Text>
                                </View>
                                <Text style={[styles.billAmount, { color: theme.text }]}>₹{bill.amount}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Smart Envelopes */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Smart Envelopes</Text>
                    <View style={styles.grid}>
                        {BUDGET_CATEGORIES.map((cat) => {
                            const progress = cat.spent / cat.limit;
                            const progressColor =
                                cat.color === 'danger' ? theme.danger :
                                    cat.color === 'warning' ? theme.warning :
                                        theme.success;

                            return (
                                <View key={cat.id} style={[styles.envelopeCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
                                    {cat.suggestion && (
                                        <View style={[styles.suggestionBadge, { backgroundColor: theme.tint }]}>
                                            <MaterialCommunityIcons name="sparkles" size={10} color="#FFF" />
                                            <Text style={styles.suggestionText}>AI Tip</Text>
                                        </View>
                                    )}

                                    <View style={styles.envelopeHeader}>
                                        <View style={[styles.catIcon, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}>
                                            <Ionicons name={cat.icon as any} size={18} color={theme.text} />
                                        </View>
                                        <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
                                    </View>

                                    <View style={styles.progressContainer}>
                                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}>
                                            <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: progressColor }]} />
                                        </View>
                                        <View style={styles.amountRow}>
                                            <Text style={[styles.spentText, { color: theme.text }]}>₹{cat.spent}</Text>
                                            <Text style={[styles.limitText, { color: theme.icon }]}> / ₹{cat.limit}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Spacer for FAB */}
                <View style={{ height: 100 }} />

            </ScrollView>


            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => setSimulationModalVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[theme.electricBlue || '#2979FF', '#2196F3']}
                    style={styles.fab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialCommunityIcons name="cart-outline" size={24} color="#FFF" />
                    <Text style={styles.fabText}>Simulate Purchase</Text>
                </LinearGradient>
            </TouchableOpacity>

            <PurchaseSimulationModal
                visible={simulationModalVisible}
                onClose={() => setSimulationModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    heroSection: {
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        // Soft shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    gaugeTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 20,
    },
    safeLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    amountText: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 2,
    },
    subtitleText: {
        fontSize: 12,
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },
    costsScroll: {
        overflow: 'visible',
    },
    billCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingRight: 16,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        gap: 12,
        minWidth: 200,
    },
    billIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    billName: {
        fontSize: 14,
        fontWeight: '600',
    },
    billDate: {
        fontSize: 10,
    },
    billAmount: {
        marginLeft: 'auto',
        fontSize: 14,
        fontWeight: '700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    envelopeCard: {
        width: '48%',
        borderRadius: 20,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    envelopeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    catIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catName: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressContainer: {
        gap: 6,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    spentText: {
        fontSize: 14,
        fontWeight: '700',
    },
    limitText: {
        fontSize: 12,
    },
    suggestionBadge: {
        position: 'absolute',
        top: -8,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        zIndex: 10,
    },
    suggestionText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        shadowColor: '#2979FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
    },
    fabText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
