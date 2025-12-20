import { useState, useMemo } from 'react';
import { Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses } from '@/contexts/ExpenseContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSelector } from '@/components/expense/MonthSelector';
import { QuickStats } from '@/components/expense/QuickStats';
import { BudgetProgressCard } from '@/components/expense/BudgetProgressCard';
import { SpendingChart, ChartLegend } from '@/components/expense/SpendingChart';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { SetBudgetSheet } from '@/components/settings/SetBudgetSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense } from '@/lib/types';
import {
  getMonthKey,
  getExpensesForMonth,
  calculateTotalSpent,
  getMonthlyBudget,
  getChartData,
  getRecentExpenses,
} from '@/lib/calculations';

const Index = () => {
  const {
    expenses,
    categories,
    monthlyBudgets,
    addExpense,
    updateExpense,
    deleteExpense,
    setMonthlyBudget,
  } = useExpenses();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  const monthExpenses = useMemo(
    () => getExpensesForMonth(expenses, monthKey),
    [expenses, monthKey]
  );

  const totalSpent = useMemo(
    () => calculateTotalSpent(monthExpenses),
    [monthExpenses]
  );

  const budget = useMemo(
    () => getMonthlyBudget(monthlyBudgets, monthKey),
    [monthlyBudgets, monthKey]
  );

  const chartData = useMemo(
    () => getChartData(monthExpenses, categories),
    [monthExpenses, categories]
  );

  const recentExpenses = useMemo(
    () => getRecentExpenses(monthExpenses, 5),
    [monthExpenses]
  );

  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
    } else {
      addExpense(expenseData);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (confirm('Delete this expense?')) {
      deleteExpense(expense.id);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Expense Tracker"
          subtitle={format(new Date(), 'EEEE, MMMM d')}
        />

        {/* Month Selector */}
        <MonthSelector
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        {/* Quick Stats */}
        <div className="mt-6">
          <QuickStats
            totalSpent={totalSpent}
            budget={budget}
            remaining={budget - totalSpent}
            expenseCount={monthExpenses.length}
          />
        </div>

        {/* Budget Progress */}
        {budget > 0 && (
          <div className="mt-4">
            <BudgetProgressCard
              spent={totalSpent}
              budget={budget}
              label="Monthly Budget"
            />
          </div>
        )}

        {/* Set Budget Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setIsBudgetOpen(true)}
        >
          <Target className="w-4 h-4 mr-2" />
          {budget > 0 ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
        </Button>

        {/* Spending Chart */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart data={chartData} totalSpent={totalSpent} />
            <ChartLegend data={chartData} />
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Recent Expenses
            </h2>
            {monthExpenses.length > 5 && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/expenses">View all</a>
              </Button>
            )}
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No expenses this month</p>
              <p className="text-xs mt-1">
                Tap the + button to add your first expense
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="group">
                  <ExpenseCard
                    expense={expense}
                    category={categories.find(c => c.id === expense.categoryId)}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <Button
          size="xl"
          variant="accent"
          className="fixed bottom-20 right-4 rounded-full shadow-lg z-40"
          onClick={() => {
            setEditingExpense(null);
            setIsAddExpenseOpen(true);
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Sheets */}
        <AddExpenseSheet
          open={isAddExpenseOpen}
          onOpenChange={open => {
            setIsAddExpenseOpen(open);
            if (!open) setEditingExpense(null);
          }}
          categories={categories}
          expense={editingExpense}
          onSave={handleSaveExpense}
        />

        <SetBudgetSheet
          open={isBudgetOpen}
          onOpenChange={setIsBudgetOpen}
          currentBudget={budget}
          monthKey={monthKey}
          onSave={amount => setMonthlyBudget(monthKey, amount)}
        />
      </div>
    </div>
  );
};

export default Index;
