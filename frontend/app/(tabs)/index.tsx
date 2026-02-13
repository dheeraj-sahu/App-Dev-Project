import FinancialHealthCard from '@/components/home/FinancialHealthCard';
import InsightCard from '@/components/home/InsightCard';
import TransactionItem from '@/components/home/TransactionItem';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useTransactions } from '@/context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, SectionList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { transactions: expenses, refreshTransactions } = useTransactions();
  const router = useRouter();
  const { theme: currentTheme } = useTheme();
  const theme = Colors[currentTheme];
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Start at Feb 2026

  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter transactions for the selected month and year
  const filteredData = useMemo(() => {
    const targetMonth = currentDate.getMonth();
    const targetYear = currentDate.getFullYear();

    return expenses.filter(group => {
      const groupDate = group.date;
      return groupDate.getMonth() === targetMonth && groupDate.getFullYear() === targetYear;
    })
      .map(group => ({ ...group, data: group.items })) // Map items to data for SectionList
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [currentDate, expenses]);

  // Calculate Summary & Trends
  const { summary, trends, expensesByMethod } = useMemo(() => {
    // Current Month Summary
    let currentExpense = 0;
    let currentIncome = 0;
    const currentExpensesByMethod: Record<string, number> = {};

    filteredData.forEach(group => {
      group.items.forEach(item => {
        if (item.type === 'expense') {
          currentExpense += item.amount;
          const method = item.paymentMethod || 'Others';
          currentExpensesByMethod[method] = (currentExpensesByMethod[method] || 0) + item.amount;
        } else {
          currentIncome += item.amount;
        }
      });
    });

    // Previous Month Calculation
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    let prevExpense = 0;
    let prevIncome = 0;

    expenses.forEach(group => {
      const groupDate = group.date;
      if (groupDate.getMonth() === prevMonth && groupDate.getFullYear() === prevYear) {
        group.items.forEach(item => {
          if (item.type === 'expense') {
            prevExpense += item.amount;
          } else {
            prevIncome += item.amount;
          }
        });
      }
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      summary: {
        expense: currentExpense,
        income: currentIncome,
        total: currentIncome - currentExpense
      },
      trends: {
        income: calculateTrend(currentIncome, prevIncome),
        expense: calculateTrend(currentExpense, prevExpense)
      },
      expensesByMethod: currentExpensesByMethod
    };
  }, [filteredData, expenses, currentDate]);

  const formattedMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const renderSectionHeader = ({ section: { date } }: any) => (
    <View style={[styles.sectionHeaderContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionHeaderText, { color: theme.icon }]}>
        {date.toLocaleDateString('default', { month: 'short', day: '2-digit', weekday: 'short' }).toUpperCase()}
      </Text>
      <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Date Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: theme.text }]}>{formattedMonth}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleNextMonth} style={{ marginRight: 16 }}>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            {/* Notification or specific profile action could go here if removing filter */}
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={filteredData as any} // Typing casting for quick fix, assume shape matches
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onAskAI={() => console.log('Ask AI about:', item.title)}
          />
        )}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <View>
            {/* Financial Health Card */}
            <FinancialHealthCard
              income={summary.income}
              expense={summary.expense}
              incomeTrend={trends.income}
              expenseTrend={trends.expense}
              expensesByMethod={expensesByMethod}
            />

            {/* AI Insight */}
            <InsightCard />



            {/* Feed Title */}
            <View style={{ paddingHorizontal: 20, marginTop: 10, marginBottom: 5 }}>
              <Text style={[styles.feedTitle, { color: theme.text }]}>Transactions</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions for this month</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }} // Space for FAB
        stickySectionHeadersEnabled={false}
      />
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
    paddingVertical: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
