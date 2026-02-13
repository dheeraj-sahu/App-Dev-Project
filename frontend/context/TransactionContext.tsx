import { addTransaction as addTxToDB, deleteTransaction as deleteTxFromDB, getTransactions as fetchTransactions, initDatabase } from '@/services/DatabaseService';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type TransactionType = 'expense' | 'income';

export interface TransactionItem {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    currency: string;
    type: TransactionType;
    icon: string;
    color: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    time: string;
    category: string;
    paymentMethod: string;
    note?: string;
    image?: string;
}

export interface TransactionGroup {
    id: string;
    date: Date;
    items: TransactionItem[];
}

interface TransactionContextType {
    transactions: TransactionGroup[];
    addTransaction: (transaction: Omit<TransactionItem, 'id'> & { date: Date }) => void;
    deleteTransaction: (groupId: string, itemId: string) => void;
    refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<TransactionGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                await refreshTransactions();
            } catch (error) {
                console.error("Failed to initialize database", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const refreshTransactions = useCallback(async () => {
        const data = await fetchTransactions();
        setTransactions(data);
    }, []);

    const addTransaction = useCallback(async (newTransaction: Omit<TransactionItem, 'id'> & { date: Date }) => {
        try {
            await addTxToDB(newTransaction);
            await refreshTransactions();
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    }, [refreshTransactions]);

    const deleteTransaction = useCallback(async (groupId: string, itemId: string) => {
        try {
            await deleteTxFromDB(itemId);
            await refreshTransactions();
        } catch (error) {
            console.error("Failed to delete transaction", error);
        }
    }, [refreshTransactions]);

    return (
        <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, refreshTransactions }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
}
