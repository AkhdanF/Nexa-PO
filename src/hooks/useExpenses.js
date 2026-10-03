// Hook: useExpenses
import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config/app.js';
import { SAMPLE_EXPENSES } from '../utils/sampleData.js';
import { executeAppsScript } from '../services/googleSheets.js';

export function useExpenses() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKeys.EXPENSES);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(APP_CONFIG.storageKeys.EXPENSES, JSON.stringify(SAMPLE_EXPENSES));
      return SAMPLE_EXPENSES;
    } catch (e) {
      console.error('Failed to parse expenses from localStorage:', e);
      return SAMPLE_EXPENSES;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage:', e);
    }
  }, [expenses]);

  // Add Expense
  const addExpense = useCallback(async (expenseData) => {
    setLoading(true);
    const newId = 'EXP-' + String(Date.now()).slice(-5);
    const newExpense = {
      ...expenseData,
      id: newId,
      timestamp: new Date().toISOString(),
      amount: parseFloat(expenseData.amount) || 0,
      paymentMethod: expenseData.paymentMethod || 'Cash / Tunai',
      description: expenseData.description ? expenseData.description.trim() : '',
    };

    setExpenses((prev) => [newExpense, ...prev]);

    const res = await executeAppsScript('create_expense', newExpense);
    setLoading(false);
    return { success: true, expense: newExpense, syncResult: res };
  }, []);

  // Update Expense
  const updateExpense = useCallback(
    async (expenseId, updatedFields) => {
      setLoading(true);

      const existingExpense = expenses.find((e) => e.id === expenseId);
      if (!existingExpense) {
        setLoading(false);
        return { success: false, error: 'Pengeluaran tidak ditemukan' };
      }

      const updatedItem = {
        ...existingExpense,
        ...updatedFields,
        amount: parseFloat(updatedFields.amount !== undefined ? updatedFields.amount : existingExpense.amount) || 0,
        updatedAt: new Date().toISOString(),
      };

      setExpenses((prev) =>
        prev.map((item) => (item.id === expenseId ? updatedItem : item))
      );

      const res = await executeAppsScript('create_expense', updatedItem); // handles upsert
      setLoading(false);
      return { success: true, expense: updatedItem, syncResult: res };
    },
    [expenses]
  );

  // Delete Expense
  const deleteExpense = useCallback(async (expenseId) => {
    setLoading(true);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    const res = await executeAppsScript('delete_expense', { id: expenseId });
    setLoading(false);
    return { success: true, syncResult: res };
  }, []);

  // Reset to sample expenses
  const resetToSample = useCallback(() => {
    setExpenses(SAMPLE_EXPENSES);
    localStorage.setItem(APP_CONFIG.storageKeys.EXPENSES, JSON.stringify(SAMPLE_EXPENSES));
  }, []);

  return {
    expenses,
    setExpenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    resetToSample,
  };
}
