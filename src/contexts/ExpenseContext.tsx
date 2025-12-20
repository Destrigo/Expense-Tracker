import { createContext, useContext, ReactNode } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';

type ExpenseContextType = ReturnType<typeof useExpenseStore>;

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const store = useExpenseStore();

  return (
    <ExpenseContext.Provider value={store}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
