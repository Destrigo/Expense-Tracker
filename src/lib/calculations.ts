import {
  Expense,
  Category,
  Budget,
  MonthlyBudget,
  MonthSummary,
} from './types';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfYear,
  endOfYear,
} from 'date-fns';

/* =========================
   Currency utilities
   ========================= */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

const DEFAULT_CURRENCY: CurrencyCode = 'USD';
const STORAGE_KEY = 'expense-tracker-currency';

const normalizeCurrency = (value: string | null): CurrencyCode => {
  if (value === 'USD' || value === 'EUR' || value === 'GBP') {
    return value;
  }
  return DEFAULT_CURRENCY;
};

const getSafeCurrency = (currency?: CurrencyCode): CurrencyCode => {
  if (currency) return currency;
  return normalizeCurrency(localStorage.getItem(STORAGE_KEY));
};

/* =========================
   Formatting
   ========================= */

export const formatCurrency = (
  amount: number,
  currency?: CurrencyCode
): string => {
  const safeCurrency = getSafeCurrency(currency);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactCurrency = (
  amount: number,
  currency?: CurrencyCode
): string => {
  const safeCurrency = getSafeCurrency(currency);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

/* =========================
   Date helpers
   ========================= */

export const getMonthKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
};

export const getMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return format(new Date(Number(year), Number(month) - 1), 'MMMM yyyy');
};

/* =========================
   Expense filters
   ========================= */

export const getExpensesForMonth = (
  expenses: Expense[],
  monthKey: string
): Expense[] => {
  const [year, month] = monthKey.split('-').map(Number);
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
};

export const getExpensesForYear = (
  expenses: Expense[],
  year: number
): Expense[] => {
  const start = startOfYear(new Date(year, 0));
  const end = endOfYear(new Date(year, 0));

  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
};

/* =========================
   Calculations
   ========================= */

export const calculateTotalSpent = (expenses: Expense[]): number =>
  expenses.reduce((sum, expense) => sum + expense.amount, 0);

export const calculateSpentByCategory = (
  expenses: Expense[],
  categoryId: string
): number =>
  expenses
    .filter(expense => expense.categoryId === categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0);

export const getCategoryBudget = (
  budgets: Budget[],
  categoryId: string,
  monthKey: string
): number =>
  budgets.find(
    b => b.categoryId === categoryId && b.month === monthKey
  )?.amount ?? 0;

export const getMonthlyBudget = (
  monthlyBudgets: MonthlyBudget[],
  monthKey: string
): number =>
  monthlyBudgets.find(b => b.month === monthKey)?.totalBudget ?? 0;

export const calculateMonthSummary = (
  expenses: Expense[],
  categories: Category[],
  budgets: Budget[],
  monthlyBudgets: MonthlyBudget[],
  monthKey: string
): MonthSummary => {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const totalSpent = calculateTotalSpent(monthExpenses);
  const totalBudget = getMonthlyBudget(monthlyBudgets, monthKey);

  const categoryBreakdown = categories
    .map(category => {
      const spent = calculateSpentByCategory(monthExpenses, category.id);
      const budget = getCategoryBudget(budgets, category.id, monthKey);

      return {
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        spent,
        budget,
        percentUsed: budget > 0 ? (spent / budget) * 100 : 0,
      };
    })
    .filter(cat => cat.spent > 0 || cat.budget > 0);

  return {
    month: monthKey,
    totalSpent,
    totalBudget,
    remaining: totalBudget - totalSpent,
    percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    categoryBreakdown,
  };
};

/* =========================
   Misc helpers
   ========================= */

export const getRecentExpenses = (
  expenses: Expense[],
  limit = 5
): Expense[] =>
  [...expenses]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, limit);

export const groupExpensesByDate = (
  expenses: Expense[]
): Record<string, Expense[]> =>
  expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

export const sortExpensesByDate = (
  expenses: Expense[],
  order: 'asc' | 'desc' = 'desc'
): Expense[] =>
  [...expenses].sort((a, b) => {
    const diff =
      new Date(b.date).getTime() - new Date(a.date).getTime();
    return order === 'desc' ? diff : -diff;
  });

export const getChartData = (
  expenses: Expense[],
  categories: Category[]
): { name: string; value: number; color: string }[] =>
  categories
    .map(category => ({
      name: category.name,
      value: calculateSpentByCategory(expenses, category.id),
      color: category.color,
    }))
    .filter(item => item.value > 0);
