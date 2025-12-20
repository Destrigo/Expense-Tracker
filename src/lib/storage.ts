import { ExpenseStore, DEFAULT_CATEGORIES } from './types';

const STORAGE_KEY = 'expense-tracker-data';

const getDefaultStore = (): ExpenseStore => ({
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  monthlyBudgets: [],
});

export const loadStore = (): ExpenseStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultStore = getDefaultStore();
      saveStore(defaultStore);
      return defaultStore;
    }
    const parsed = JSON.parse(stored);
    // Merge with defaults to ensure all fields exist
    return {
      ...getDefaultStore(),
      ...parsed,
      categories: parsed.categories?.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
    };
  } catch (error) {
    console.error('Failed to load store:', error);
    return getDefaultStore();
  }
};

export const saveStore = (store: ExpenseStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save store:', error);
  }
};

export const exportToCSV = (store: ExpenseStore): string => {
  const headers = ['Date', 'Amount', 'Category', 'Note', 'Recurring'];
  const rows = store.expenses.map(expense => {
    const category = store.categories.find(c => c.id === expense.categoryId);
    return [
      expense.date,
      expense.amount.toFixed(2),
      category?.name || 'Unknown',
      expense.note || '',
      expense.isRecurring ? expense.recurringType : '',
    ].map(field => `"${field}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (store: ExpenseStore, filename?: string): void => {
  const csv = exportToCSV(store);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
