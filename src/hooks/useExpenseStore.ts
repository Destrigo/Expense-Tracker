import { useState, useEffect, useCallback } from 'react';
import { Expense, Category, Budget, MonthlyBudget, ExpenseStore } from '@/lib/types';
import { loadStore, saveStore, generateId } from '@/lib/storage';

export const useExpenseStore = () => {
  const [store, setStore] = useState<ExpenseStore>(() => loadStore());

  // Persist to localStorage whenever store changes
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Expense operations
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setStore(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setStore(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense =>
        expense.id === id
          ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
          : expense
      ),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      expenses: prev.expenses.filter(expense => expense.id !== id),
    }));
  }, []);

  // Category operations
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    setStore(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id'>>) => {
    setStore(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      ),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category.id !== id),
      // Also delete associated budgets
      budgets: prev.budgets.filter(budget => budget.categoryId !== id),
    }));
  }, []);

  // Budget operations
  const setCategoryBudget = useCallback((categoryId: string, month: string, amount: number) => {
    setStore(prev => {
      const existingIndex = prev.budgets.findIndex(
        b => b.categoryId === categoryId && b.month === month
      );
      
      if (existingIndex >= 0) {
        const newBudgets = [...prev.budgets];
        if (amount <= 0) {
          newBudgets.splice(existingIndex, 1);
        } else {
          newBudgets[existingIndex] = { ...newBudgets[existingIndex], amount };
        }
        return { ...prev, budgets: newBudgets };
      }
      
      if (amount > 0) {
        return {
          ...prev,
          budgets: [...prev.budgets, { id: generateId(), categoryId, month, amount }],
        };
      }
      
      return prev;
    });
  }, []);

  const setMonthlyBudget = useCallback((month: string, totalBudget: number) => {
    setStore(prev => {
      const existingIndex = prev.monthlyBudgets.findIndex(b => b.month === month);
      
      if (existingIndex >= 0) {
        const newBudgets = [...prev.monthlyBudgets];
        if (totalBudget <= 0) {
          newBudgets.splice(existingIndex, 1);
        } else {
          newBudgets[existingIndex] = { ...newBudgets[existingIndex], totalBudget };
        }
        return { ...prev, monthlyBudgets: newBudgets };
      }
      
      if (totalBudget > 0) {
        return {
          ...prev,
          monthlyBudgets: [...prev.monthlyBudgets, { month, totalBudget }],
        };
      }
      
      return prev;
    });
  }, []);

  return {
    ...store,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategoryBudget,
    setMonthlyBudget,
  };
};
