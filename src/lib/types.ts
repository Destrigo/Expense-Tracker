export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budgetLimit?: number;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // ISO date string
  note?: string;
  isRecurring?: boolean;
  recurringType?: 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface MonthlyBudget {
  month: string; // YYYY-MM format
  totalBudget: number;
  useCategoryPercentages?: boolean; // New field
  categoryPercentages?: Record<string, number>; // categoryId -> percentage
}

export interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  monthlyBudgets: MonthlyBudget[];
}

export interface MonthSummary {
  month: string;
  totalSpent: number;
  totalBudget: number;
  remaining: number;
  percentUsed: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    color: string;
    spent: number;
    budget: number;
    percentUsed: number;
  }[];
}

export interface BankTransaction {
  id: string;
  bankConnectionId: string; // <-- add this
  date: string;
  description: string;
  amount: number;
  merchantName?: string;
  category?: string;
  pending: boolean;
  accountId: string;
}

export interface BankAccount {
  id: string;
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  lastSync: string;
  isActive: boolean;
}

export interface BankConnection {
  id: string;
  accessToken: string; // Will be stored securely via backend
  institutionId: string;
  institutionName: string;
  accounts: BankAccount[];
  createdAt: string;
  lastSync: string;
}

export type ViewMode = 'month' | 'year';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', color: 'hsl(24, 95%, 53%)', icon: 'utensils' },
  { id: 'transport', name: 'Transport', color: 'hsl(199, 89%, 48%)', icon: 'car' },
  { id: 'shopping', name: 'Shopping', color: 'hsl(280, 85%, 65%)', icon: 'shopping-bag' },
  { id: 'entertainment', name: 'Entertainment', color: 'hsl(340, 82%, 52%)', icon: 'film' },
  { id: 'bills', name: 'Bills & Utilities', color: 'hsl(45, 93%, 47%)', icon: 'file-text' },
  { id: 'health', name: 'Health', color: 'hsl(142, 76%, 36%)', icon: 'heart' },
  { id: 'other', name: 'Other', color: 'hsl(215, 16%, 47%)', icon: 'more-horizontal' },
];

export const CATEGORY_COLORS = [
  'hsl(24, 95%, 53%)',   // Orange
  'hsl(199, 89%, 48%)',  // Blue
  'hsl(280, 85%, 65%)',  // Purple
  'hsl(340, 82%, 52%)',  // Pink
  'hsl(45, 93%, 47%)',   // Yellow
  'hsl(142, 76%, 36%)',  // Green
  'hsl(215, 16%, 47%)',  // Gray
  'hsl(168, 76%, 42%)',  // Teal
  'hsl(0, 72%, 51%)',    // Red
  'hsl(262, 83%, 58%)',  // Violet
];
