import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const PROFILE_IMAGE = 'https://i.pravatar.cc/300?img=47';

export default function ProfileScreen() {
    const { theme: currentTheme, toggleTheme } = useTheme();
    const theme = Colors[currentTheme];
    const isDark = currentTheme === 'dark';

    // Mock Stats Data
    const stats = [
        { label: 'Net Worth', value: '₹1,24,500', icon: 'wallet', color: theme.emerald },
        // { label: 'Credit Score', value: '780', icon: 'speedometer', color: theme.electricBlue },
        { label: 'Budget Score', value: '92/100', icon: 'chart-bar', color: theme.warning },
    ];

    const SettingItem = ({
        icon,
        title,
        subtitle,
        onPress,
        isSwitch,
        switchValue,
        onSwitchChange,
        destructive,
        color
    }: {
        icon: any;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        isSwitch?: boolean;
        switchValue?: boolean;
        onSwitchChange?: (val: boolean) => void;
        destructive?: boolean;
        color?: string;
    }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={isSwitch}
            activeOpacity={0.7}
        >
            <View style={[
                styles.iconContainer,
                { backgroundColor: destructive ? theme.dangerLight : (isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6') }
            ]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={destructive ? theme.danger : (color || theme.text)}
                />
            </View>
            <View style={styles.settingContent}>
                <Text style={[
                    styles.settingTitle,
                    { color: destructive ? theme.danger : theme.text }
                ]}>
                    {title}
                </Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: theme.icon }]}>{subtitle}</Text>}
            </View>

            {isSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#767577', true: theme.tint }}
                    thumbColor={'#fff'}
                    ios_backgroundColor="#3e3e3e"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.icon} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );

    const Section = ({ title, children }: { title?: string, children: React.ReactNode }) => (
        <View style={styles.sectionWrapper}>
            {title && <Text style={[styles.sectionTitle, { color: theme.icon }]}>{title}</Text>}
            <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {children}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.card }]}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[theme.tint, theme.emerald]}
                            style={styles.avatarGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Image
                                source={{ uri: PROFILE_IMAGE }}
                                style={[styles.avatar, { borderColor: theme.card }]}
                            />
                        </LinearGradient>
                        <View style={styles.onlineBadge} />
                    </View>

                    <View style={styles.headerInfo}>
                        <Text style={[styles.name, { color: theme.text }]}>Jane Doe</Text>
                        <Text style={[styles.email, { color: theme.icon }]}>jane.doe@finvault.com</Text>
                        <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.editProfileText, { color: theme.text }]}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Row */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsContainer}
                    style={{ flexGrow: 0 }}
                >
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            style={[
                                styles.statCard,
                                { backgroundColor: theme.card, borderColor: theme.border }
                            ]}
                        >
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <View>
                                <Text style={[styles.statLabel, { color: theme.icon }]}>{stat.label}</Text>
                                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Settings */}
                <View style={styles.settingsContainer}>
                    <Section title="Preferences">
                        <SettingItem
                            icon={isDark ? "moon" : "sunny"}
                            title="Dark Mode"
                            isSwitch
                            switchValue={isDark}
                            onSwitchChange={toggleTheme}
                            color={theme.warning}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        <SettingItem
                            icon="notifications"
                            title="Notifications"
                            subtitle="Email, Push"
                            color={theme.expense}
                            onPress={() => { }}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        <SettingItem
                            icon="language"
                            title="Language"
                            subtitle="English (US)"
                            color={theme.emerald}
                            onPress={() => { }}
                        />
                    </Section>

                    <Section title="Security">
                        <SettingItem
                            icon="shield-checkmark"
                            title="Face ID"
                            isSwitch
                            switchValue={true}
                            onSwitchChange={() => { }}
                            color={theme.success}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        <SettingItem
                            icon="key"
                            title="Change PIN"
                            color={theme.electricBlue}
                            onPress={() => { }}
                        />
                    </Section>

                    <Section title="Support">
                        <SettingItem
                            icon="help-circle"
                            title="Help Center"
                            color={theme.text}
                            onPress={() => { }}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        <SettingItem
                            icon="document-text"
                            title="Privacy Policy"
                            color={theme.text}
                            onPress={() => { }}
                        />
                    </Section>

                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: theme.danger + '15' }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                        <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
                    </TouchableOpacity>

                    <Text style={[styles.version, { color: theme.icon }]}>Version 2.4.0 (Build 305)</Text>

                    {/* Bottom Padding */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatarGradient: {
        padding: 4,
        borderRadius: 60,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerInfo: {
        alignItems: 'center',
        gap: 6,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    email: {
        fontSize: 14,
    },
    editProfileBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    editProfileText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 12,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        minWidth: 160,
        borderWidth: 1,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    settingsContainer: {
        padding: 20,
    },
    sectionWrapper: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 10,
        marginLeft: 8,
    },
    sectionContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    separator: {
        height: 1,
        marginLeft: 68,
        opacity: 0.5,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 8,
        marginTop: 8,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 13,
        opacity: 0.5,
    }
});
