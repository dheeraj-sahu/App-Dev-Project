import AISummaryCard from '@/components/trends/AISummaryFloating'; // Kept filename same, but component is now a Card
import FinancialHealthRadar from '@/components/trends/FinancialHealthRadar';
import PredictiveBalanceChart from '@/components/trends/PredictiveBalanceChart';
import SpendingSprints from '@/components/trends/SpendingSprints';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

// Light Theme
const THEME = {
  background: '#FFFFFF',
  text: '#1A2B3C',
  accent: '#2979FF',
};

export default function TrendsScreen() {

  // Mock Data for Radar Chart
  const healthData = [
    { label: 'Savings', value: 85, fullMark: 100 },
    { label: 'Budget', value: 65, fullMark: 100 },
    { label: 'Debt', value: 95, fullMark: 100 },
    { label: 'Invest', value: 45, fullMark: 100 },
    { label: 'Growth', value: 70, fullMark: 100 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trends</Text>
          <Text style={styles.headerSubtitle}>Your Financial Pulse</Text>
        </View>

        {/* Financial Health Radar */}
        <FinancialHealthRadar data={healthData} />

        {/* AI Insight Card - Now part of the flow */}
        <AISummaryCard />

        {/* Predictive Balance */}
        <PredictiveBalanceChart />

        {/* Spending Sprints */}
        <SpendingSprints />

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
});
