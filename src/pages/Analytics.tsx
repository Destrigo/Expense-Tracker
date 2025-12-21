import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  parseISO,
} from 'date-fns';
import { useExpenses } from '@/contexts/ExpenseContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSelector } from '@/components/expense/MonthSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { Button } from '@/components/ui/button';
import {
  getMonthKey,
  getExpensesForMonth,
  calculateTotalSpent,
  calculateSpentByCategory,
  getChartData,
  formatCurrency,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const { expenses, categories, monthlyBudgets } = useExpenses();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);
  const prevMonthKey = useMemo(() => getMonthKey(subMonths(currentMonth, 1)), [currentMonth]);

  // Current and previous period expenses
  const periodExpenses = useMemo(() => {
    if (viewMode === 'monthly') return getExpensesForMonth(expenses, monthKey);
    const start = startOfYear(currentMonth);
    const end = endOfYear(currentMonth);
    return expenses.filter(e => {
      const date = parseISO(e.date);
      return date >= start && date <= end;
    });
  }, [viewMode, expenses, monthKey, currentMonth]);

  const prevPeriodExpenses = useMemo(() => {
    if (viewMode === 'monthly') return getExpensesForMonth(expenses, prevMonthKey);
    const prevYear = new Date(currentMonth);
    prevYear.setFullYear(prevYear.getFullYear() - 1);
    const start = startOfYear(prevYear);
    const end = endOfYear(prevYear);
    return expenses.filter(e => {
      const date = parseISO(e.date);
      return date >= start && date <= end;
    });
  }, [viewMode, expenses, currentMonth, prevMonthKey]);

  const totalSpent = useMemo(() => calculateTotalSpent(periodExpenses), [periodExpenses]);
  const prevTotalSpent = useMemo(() => calculateTotalSpent(prevPeriodExpenses), [prevPeriodExpenses]);

  // Chart data
  const chartData = useMemo(() => {
    if (viewMode === 'monthly') return getChartData(periodExpenses, categories);
    return eachMonthOfInterval({ start: startOfYear(currentMonth), end: endOfYear(currentMonth) }).map(month => {
      const key = getMonthKey(month);
      const monthExpenses = periodExpenses.filter(e => getMonthKey(parseISO(e.date)) === key);
      return { date: format(month, 'MMM'), amount: calculateTotalSpent(monthExpenses) };
    });
  }, [viewMode, periodExpenses, categories, currentMonth]);

  // Daily data
  const dailyData = useMemo(() => {
    if (viewMode !== 'monthly') return [];
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const spent = calculateTotalSpent(periodExpenses.filter(e => e.date === dateStr));
      return { date: format(day, 'd'), amount: spent };
    });
  }, [viewMode, currentMonth, periodExpenses]);

  // Full budget for the month
  const monthlyBudget = useMemo(() => monthlyBudgets.find(b => b.month === monthKey) || { totalBudget: 0, useCategoryPercentages: false, categoryPercentages: {} }, [monthlyBudgets, monthKey]);

  // Category comparison
  const categoryComparison = useMemo(() => {
    return categories.map(category => {
      const budgetPercent = monthlyBudget.categoryPercentages?.[category.id] || 0;
      const budgetAmount = (monthlyBudget.totalBudget * budgetPercent) / 100;
      const spent = calculateSpentByCategory(periodExpenses, category.id);
      const isOver = spent > budgetAmount;
      return { category, budgetAmount, spent, isOver };
    });
  }, [categories, monthlyBudget, periodExpenses]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground rounded-lg shadow-lg p-2 border border-border text-sm">
          <p className="font-medium">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const renderToggle = () => (
    <div className="flex gap-2 mt-4">
      <Button size="sm" variant={viewMode === 'monthly' ? 'default' : 'outline'} onClick={() => setViewMode('monthly')}>Monthly</Button>
      <Button size="sm" variant={viewMode === 'yearly' ? 'default' : 'outline'} onClick={() => setViewMode('yearly')}>Yearly</Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader title="Analytics" subtitle="Understand your spending patterns" />

        {renderToggle()}
        {viewMode === 'monthly' && <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}

        {/* Total Spending */}
        <Card className="mt-6">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(totalSpent)}</p>
              </div>
              {prevTotalSpent > 0 && (
                <div className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium', totalSpent - prevTotalSpent > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success')}>
                  {totalSpent - prevTotalSpent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs {formatCurrency(prevTotalSpent)} {viewMode === 'monthly' ? 'last month' : 'last year'}
            </p>
          </CardContent>
        </Card>

        {/* Spending Chart */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />{viewMode === 'monthly' ? 'Daily Spending' : 'Monthly Spending'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewMode === 'monthly' ? dailyData : chartData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {(viewMode === 'monthly' ? dailyData : chartData).map((entry, idx) => (
                      <Cell key={idx} fill={entry.amount > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Budget List */}
        {viewMode === 'monthly' && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Budget vs Actual by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryComparison.map(item => (
                <div key={item.category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon icon={item.category.icon} color={item.category.color} size="sm" />
                      <span className="text-sm font-medium">{item.category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(item.spent)}</div>
                      <div className="text-xs text-muted-foreground">of {formatCurrency(item.budgetAmount)}</div>
                    </div>
                  </div>
                  <Progress
                    value={Math.min((item.spent / Math.max(item.budgetAmount, 1)) * 100, 100)}
                    className={cn(
                      'h-2',
                      item.isOver && '[&>div]:bg-destructive',
                      !item.isOver && '[&>div]:bg-success'
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
