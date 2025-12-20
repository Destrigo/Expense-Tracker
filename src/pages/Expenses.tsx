import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useExpenses } from '@/contexts/ExpenseContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSelector } from '@/components/expense/MonthSelector';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Expense } from '@/lib/types';
import {
  getMonthKey,
  getExpensesForMonth,
  sortExpensesByDate,
  groupExpensesByDate,
  formatCurrency,
  calculateTotalSpent,
} from '@/lib/calculations';

const Expenses = () => {
  const { expenses, categories, addExpense, updateExpense, deleteExpense } =
    useExpenses();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  const filteredExpenses = useMemo(() => {
    let filtered = getExpensesForMonth(expenses, monthKey);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.categoryId === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.note?.toLowerCase().includes(query) ||
          categories
            .find(c => c.id === e.categoryId)
            ?.name.toLowerCase()
            .includes(query)
      );
    }

    return sortExpensesByDate(filtered);
  }, [expenses, monthKey, categoryFilter, searchQuery, categories]);

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(filteredExpenses),
    [filteredExpenses]
  );

  const sortedDates = useMemo(
    () =>
      Object.keys(groupedExpenses).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      ),
    [groupedExpenses]
  );

  const totalFiltered = useMemo(
    () => calculateTotalSpent(filteredExpenses),
    [filteredExpenses]
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
    setDeleteConfirm(expense);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteExpense(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader title="Expenses" subtitle="Track and manage your spending" />

        {/* Month Selector */}
        <MonthSelector
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        {/* Search and Filter */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-sm text-muted-foreground">
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-medium text-foreground">
            Total: {formatCurrency(totalFiltered)}
          </span>
        </div>

        {/* Expenses List */}
        <div className="mt-4 space-y-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No expenses found</p>
              <p className="text-xs mt-1">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first expense to get started'}
              </p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-sm font-medium text-foreground">
                    {format(parseISO(date), 'EEEE, MMMM d')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(
                      calculateTotalSpent(groupedExpenses[date])
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedExpenses[date].map(expense => (
                    <div key={expense.id} className="group">
                      <ExpenseCard
                        expense={expense}
                        category={categories.find(
                          c => c.id === expense.categoryId
                        )}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
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

        {/* Sheets and Dialogs */}
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

        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Expenses;
