
import { useTransactions } from '@/context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function TransactionDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { transactions: expenses } = useTransactions();

    const transaction = useMemo(() => {
        for (const group of expenses) {
            const found = group.items.find((item) => item.id === id);
            if (found) return { ...found, date: group.date };
        }
        return null;
    }, [id, expenses]);

    if (!transaction) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>Transaction not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formatCurrency = (amount: number) => {
        return `₹${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#FDFCF4' }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#004D40" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Main Amount Card */}
                <View style={styles.amountCard}>
                    <View style={[styles.iconContainer, { backgroundColor: transaction.color }]}>
                        <Ionicons name={transaction.icon as any} size={32} color="white" />
                    </View>
                    <Text style={styles.title}>{transaction.title}</Text>
                    <Text style={styles.subtitle}>{transaction.subtitle}</Text>

                    <Text style={[
                        styles.amount,
                        { color: transaction.type === 'expense' ? '#D32F2F' : '#2E7D32' }
                    ]}>
                        {transaction.amount < 0 ? '-' : ''}{formatCurrency(transaction.amount)}
                    </Text>

                    <Text style={styles.date}>
                        {transaction.date.toLocaleDateString('default', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })} • {transaction.time}
                    </Text>
                </View>

                {/* Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>

                    <View style={styles.row}>
                        <View style={styles.rowLabelContainer}>
                            <Ionicons name="grid-outline" size={20} color="#666" />
                            <Text style={styles.rowLabel}>Category</Text>
                        </View>
                        <Text style={styles.rowValue}>{transaction.category}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.rowLabelContainer}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.rowLabel}>Location</Text>
                        </View>
                        <Text style={styles.rowValue}>{transaction.location}</Text>
                    </View>

                    {transaction.latitude && transaction.longitude && (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: transaction.latitude,
                                    longitude: transaction.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: transaction.latitude,
                                        longitude: transaction.longitude,
                                    }}
                                />
                            </MapView>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.rowLabelContainer}>
                            <Ionicons name="card-outline" size={20} color="#666" />
                            <Text style={styles.rowLabel}>Payment</Text>
                        </View>
                        <Text style={styles.rowValue}>{transaction.paymentMethod}</Text>
                    </View>

                    {transaction.note && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <View style={styles.rowLabelContainer}>
                                    <Ionicons name="document-text-outline" size={20} color="#666" />
                                    <Text style={styles.rowLabel}>Note</Text>
                                </View>
                                <Text style={styles.rowValue}>{transaction.note}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Receipt / Image Section */}
                {transaction.image && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Receipt / Image</Text>
                        <Image
                            source={{ uri: transaction.image }}
                            style={styles.receiptImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#004D40',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    amountCard: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    amount: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#004D40',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rowLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 4,
    },
    receiptImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 8,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
