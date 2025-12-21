import { createContext, useContext, useState, ReactNode } from 'react';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const CURRENCY_STORAGE_KEY = 'expense-tracker-currency';

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored || 'USD';
  });

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};