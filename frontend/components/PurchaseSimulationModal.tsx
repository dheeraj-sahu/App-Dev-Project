import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PurchaseSimulationModalProps {
    visible: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: '1', name: 'Food', icon: 'fast-food' },
    { id: '2', name: 'Tech', icon: 'laptop' },
    { id: '3', name: 'Travel', icon: 'airplane' },
    { id: '4', name: 'Fashion', icon: 'shirt' },
    { id: '5', name: 'Ent.', icon: 'ticket' }, // Entertainment
    { id: '6', name: 'Home', icon: 'home' },
];

export function PurchaseSimulationModal({ visible, onClose }: PurchaseSimulationModalProps) {
    const { theme: currentTheme } = useTheme();
    const theme = Colors[currentTheme];
    const isDark = currentTheme === 'dark';

    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible) {
            setAmount('');
            setSelectedCategory(null);
            setPrediction(null);
        }
    }, [visible]);

    const handlePredict = () => {
        // Logic to simulate purchase impact would go here
        console.log(`Simulating purchase: ₹${amount} for ${selectedCategory}`);
        setPrediction("Buying these shoes now will leave you with only ₹500 for the rest of the month. Wait 4 days?");
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <BlurView
                    intensity={Platform.OS === 'ios' ? 25 : 100}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.absoluteBlur}
                >
                    {/* This empty view is just to catch taps on the blurred area */}
                    <View style={styles.dismissArea} />
                </BlurView>
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                pointerEvents="box-none" // Allow touches to pass through mostly, but catch on content
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContentWrapper}>
                        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>

                            {/* Handle Bar */}
                            <View style={styles.handleBarContainer}>
                                <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
                            </View>

                            {/* Header / Title */}
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Simulate Purchase</Text>

                            {/* Massive Input Field */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.currencySymbol, { color: theme.tint }]}>₹</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: theme.text }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.icon} // Lighter color for placeholder
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={(text) => {
                                        setAmount(text);
                                        if (prediction) setPrediction(null); // Clear prediction on edit
                                    }}
                                    autoFocus={true}
                                    selectionColor={theme.tint}
                                />
                            </View>

                            {/* Categories or Result */}
                            {!prediction ? (
                                <>
                                    {/* Category Pills */}
                                    <View style={styles.categoriesContainer}>
                                        <Text style={[styles.sectionLabel, { color: theme.icon }]}>Select Category</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.categoriesScrollContent}
                                        >
                                            {CATEGORIES.map((cat) => {
                                                const isSelected = selectedCategory === cat.name;
                                                return (
                                                    <TouchableOpacity
                                                        key={cat.id}
                                                        style={[
                                                            styles.categoryPill,
                                                            {
                                                                backgroundColor: isSelected ? theme.tint : (isDark ? '#333' : '#F3F4F6'),
                                                                borderColor: isSelected ? theme.tint : theme.border,
                                                                borderWidth: 1,
                                                            }
                                                        ]}
                                                        onPress={() => setSelectedCategory(cat.name)}
                                                    >
                                                        <Ionicons
                                                            name={cat.icon as any}
                                                            size={16}
                                                            color={isSelected ? '#FFF' : theme.text}
                                                        />
                                                        <Text style={[
                                                            styles.categoryText,
                                                            { color: isSelected ? '#FFF' : theme.text }
                                                        ]}>
                                                            {cat.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Action Button */}
                                    <TouchableOpacity
                                        style={styles.actionButtonContainer}
                                        onPress={handlePredict}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={[theme.electricBlue || '#2979FF', '#2196F3']} // Fallback to blue if text color
                                            style={styles.actionButton}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <MaterialCommunityIcons name="sparkles" size={20} color="#FFF" style={styles.actionIcon} />
                                            <Text style={styles.actionButtonText}>Predict Impact</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={[styles.predictionCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFF9C4', borderColor: theme.warning }]}>
                                    <View style={styles.predictionHeader}>
                                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.warning} />
                                        <Text style={[styles.predictionTitle, { color: theme.warning }]}>Impact Alert</Text>
                                    </View>
                                    <Text style={[styles.predictionText, { color: isDark ? '#EEE' : '#333' }]}>
                                        Buying these shoes now will leave you with only <Text style={{ fontWeight: 'bold', color: theme.danger }}>₹500</Text> for the rest of the month.
                                    </Text>
                                    <View style={[styles.suggestionBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                        <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={theme.text} />
                                        <Text style={[styles.suggestionText, { color: theme.text }]}>Wait 4 days?</Text>
                                    </View>
                                </View>
                            )}

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    absoluteBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
    },
    dismissArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 2,
    },
    modalContentWrapper: {
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    handleBarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    currencySymbol: {
        fontSize: 40,
        fontWeight: '300',
        marginRight: 4,
        marginTop: -8, // Slight adjustment to align with massive text
    },
    amountInput: {
        fontSize: 64,
        fontWeight: '200',
        minWidth: 100,
        textAlign: 'center',
        padding: 0, // Remove default padding
    },
    categoriesContainer: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
        marginLeft: 4,
    },
    categoriesScrollContent: {
        gap: 12,
        paddingRight: 20, // Add some padding at the end of scroll
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionButtonContainer: {
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 24,
        shadowColor: '#2979FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    actionIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    predictionCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        gap: 12,
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    predictionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    predictionText: {
        fontSize: 16,
        lineHeight: 24,
    },
    suggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
