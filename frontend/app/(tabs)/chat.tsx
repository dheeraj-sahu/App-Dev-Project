import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// --- Standard Chat Components ---

const ChatBubble = ({ isUser, message, theme }: { isUser: boolean; message: string; theme: any }) => (
    <Animated.View
        entering={FadeIn.duration(400)}
        style={[
            styles.bubbleContainer,
            isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
        ]}
    >
        {!isUser && (
            <View style={[styles.aiAvatar, { backgroundColor: theme.tint }]}>
                <Ionicons name="sparkles" size={12} color="#FFF" />
            </View>
        )}
        <View
            style={[
                styles.bubble,
                isUser
                    ? { backgroundColor: theme.tint, borderBottomRightRadius: 4 }
                    : { backgroundColor: theme.card, borderTopLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
            ]}
        >
            <Text style={[styles.messageText, isUser ? { color: '#FFF' } : { color: theme.text }]}>
                {message}
            </Text>
        </View>
    </Animated.View>
);

const StandardChatView = ({ onMicPress, theme }: { onMicPress: () => void; theme: any }) => {
    return (
        <View style={styles.standardContainer}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>FinVault AI</Text>
            </View>

            <ScrollView
                style={styles.chatStream}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                <ChatBubble isUser={false} message="Hello! I'm your FinVault assistant. How can I help you with your budget today?" theme={theme} />
                <ChatBubble isUser={true} message="I think I'm spending too much on coffee." theme={theme} />
                <ChatBubble isUser={false} message="I can help with that. Let's look at your 'Dining & Drinks' category for the last month." theme={theme} />
                {/* Mock Expense Graph Card */}
                <Animated.View entering={FadeIn.delay(200).duration(500)} style={[styles.graphCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.graphHeader}>
                        <Text style={[styles.graphTitle, { color: theme.text }]}>Coffee & Tea</Text>
                        <Text style={[styles.graphAmount, { color: theme.tint }]}>-₹145.20</Text>
                    </View>
                    <View style={styles.mockGraphBar}>
                        <View style={[styles.graphBarFill, { backgroundColor: theme.tint, width: '70%' }]} />
                    </View>
                    <Text style={[styles.graphCaption, { color: theme.icon }]}>12% over budget</Text>
                </Animated.View>
            </ScrollView>

            <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                <View style={styles.soundWaveHint}>
                    <Ionicons name="filter-outline" size={16} color={theme.tint} style={{ transform: [{ rotate: '90deg' }] }} />
                    <Text style={[styles.voiceHintText, { color: theme.icon }]}>Voice Ready</Text>
                </View>
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <TextInput
                            placeholder="Ask about your budget..."
                            placeholderTextColor={theme.icon}
                            style={[styles.input, { color: theme.text }]}
                        />
                        <TouchableOpacity>
                            <Ionicons name="arrow-up-circle" size={32} color={theme.text} style={{ opacity: 0.2 }} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.micButton, { backgroundColor: theme.background, shadowColor: theme.tint }]}
                        onPress={onMicPress}
                    >
                        <LinearGradient
                            colors={[theme.tint, theme.emerald]}
                            style={styles.micGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="mic" size={24} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- Voice Mode Components ---

const PulsatingOrb = ({ theme }: { theme: any }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.orbContainer}>
            <Animated.View style={[styles.orbGlow, animatedStyle]}>
                <LinearGradient
                    colors={['#00FF9D', '#00C6FF', 'transparent']} // Emerald Green to Electric Blue
                    locations={[0, 0.6, 1]}
                    style={styles.orbGradient}
                />
            </Animated.View>
            <View style={styles.orbCore} />
        </View>
    );
};

const VoiceModeView = ({ onClose, theme }: { onClose: () => void; theme: any }) => {
    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={[styles.voiceContainer, { backgroundColor: '#020A14' }]} // Deep Navy/Black
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.voiceContent}>
                {/* Visualizer */}
                <PulsatingOrb theme={theme} />
            </View>

            {/* Transcript Sheet */}
            <Animated.View
                entering={SlideInDown.duration(400)}
                exiting={SlideOutDown.duration(400)}
                style={styles.transcriptSheet}
            >
                <View style={[styles.blurContainer, { backgroundColor: 'rgba(20, 30, 48, 0.95)' }]}>
                    <Text style={styles.transcriptText}>"Show me my food spending..."</Text>
                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                            <Ionicons name="close-circle-outline" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mainMicButton}>
                            <LinearGradient
                                colors={['#00FF9D', '#00C6FF']}
                                style={styles.mainMicGradient}
                            >
                                <Ionicons name="mic" size={32} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                            <View style={styles.stopButton}>
                                <View style={styles.stopIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

export default function ChatScreen() {
    const { theme: currentTheme } = useTheme();
    const theme = Colors[currentTheme];
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StandardChatView onMicPress={() => setIsVoiceMode(true)} theme={theme} />
            {isVoiceMode && (
                <View style={StyleSheet.absoluteFill}>
                    <VoiceModeView onClose={() => setIsVoiceMode(false)} theme={theme} />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    standardContainer: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    chatStream: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for input
    },
    bubbleContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userBubbleContainer: {
        justifyContent: 'flex-end',
    },
    aiBubbleContainer: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 4,
    },
    bubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        maxWidth: '75%',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    graphCard: {
        marginLeft: 36, // Align with AI text
        marginTop: -8,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        width: '70%',
    },
    graphHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    graphTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    graphAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    mockGraphBar: {
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    graphBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    graphCaption: {
        fontSize: 12,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20, // Adjust forSafeArea
        paddingTop: 10,
    },
    soundWaveHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 6,
    },
    voiceHintText: {
        fontSize: 12,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 15,
        height: '100%',
    },
    micButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    micGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Voice Mode Styles
    voiceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    orbContainer: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbGlow: {
        width: '100%',
        height: '100%',
        borderRadius: 125,
        position: 'absolute',
    },
    orbGradient: {
        flex: 1,
        borderRadius: 125,
        opacity: 0.6,
    },
    orbCore: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        shadowColor: '#00FF9D', // Emerald
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 10,
    },
    transcriptSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 250,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    blurContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(20, 30, 48, 0.85)', // Semi-transparent dark navy
    },
    transcriptText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '300',
        textAlign: 'center',
        marginTop: 20,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainMicButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        shadowColor: '#00FF9D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    mainMicGradient: {
        flex: 1,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopButton: {
        width: 20,
        height: 20,
        borderRadius: 2,
        backgroundColor: '#FF3B30',
    },
    stopIcon: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FF3B30',
        borderRadius: 2,
    }

});
