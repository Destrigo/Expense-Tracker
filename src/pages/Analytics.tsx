import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { useExpenses } from '@/contexts/ExpenseContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSelector } from '@/components/expense/MonthSelector';
import { SpendingChart, ChartLegend } from '@/components/expense/SpendingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import {
  getMonthKey,
  getExpensesForMonth,
  calculateTotalSpent,
  calculateSpentByCategory,
  getChartData,
  formatCurrency,
  getCategoryBudget,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const { expenses, categories, budgets } = useExpenses();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);
  const prevMonthKey = useMemo(
    () => getMonthKey(subMonths(currentMonth, 1)),
    [currentMonth]
  );

  const monthExpenses = useMemo(
    () => getExpensesForMonth(expenses, monthKey),
    [expenses, monthKey]
  );

  const prevMonthExpenses = useMemo(
    () => getExpensesForMonth(expenses, prevMonthKey),
    [expenses, prevMonthKey]
  );

  const totalSpent = useMemo(
    () => calculateTotalSpent(monthExpenses),
    [monthExpenses]
  );

  const prevTotalSpent = useMemo(
    () => calculateTotalSpent(prevMonthExpenses),
    [prevMonthExpenses]
  );

  const chartData = useMemo(
    () => getChartData(monthExpenses, categories),
    [monthExpenses, categories]
  );

  // Daily spending data
  const dailyData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = monthExpenses.filter(e => e.date === dateStr);
      return {
        date: format(day, 'd'),
        amount: calculateTotalSpent(dayExpenses),
      };
    });
  }, [currentMonth, monthExpenses]);

  // Category breakdown with budgets
  const categoryBreakdown = useMemo(() => {
    return categories
      .map(category => {
        const spent = calculateSpentByCategory(monthExpenses, category.id);
        const budget = getCategoryBudget(budgets, category.id, monthKey);
        return {
          ...category,
          spent,
          budget,
          percentUsed: budget > 0 ? (spent / budget) * 100 : 0,
        };
      })
      .filter(c => c.spent > 0 || c.budget > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, monthExpenses, budgets, monthKey]);

  // Month comparison
  const monthChange = prevTotalSpent > 0
    ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100
    : 0;
  const isSpendingUp = monthChange > 0;

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

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Analytics"
          subtitle="Understand your spending patterns"
        />

        {/* Month Selector */}
        <MonthSelector
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        {/* Month Comparison */}
        <Card className="mt-6">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              {prevTotalSpent > 0 && (
                <div
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                    isSpendingUp
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  )}
                >
                  {isSpendingUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(monthChange).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs {formatCurrency(prevTotalSpent)} last month
            </p>
          </CardContent>
        </Card>

        {/* Daily Spending Chart */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Daily Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.amount > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart data={chartData} totalSpent={totalSpent} />
            
            {/* Category List with Progress */}
            <div className="mt-6 space-y-4">
              {categoryBreakdown.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {category.name}
                        </span>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(category.spent)}
                        </span>
                      </div>
                      {category.budget > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={Math.min(category.percentUsed, 100)}
                            className={cn(
                              'h-1.5 flex-1',
                              category.percentUsed > 100 && '[&>div]:bg-destructive',
                              category.percentUsed >= 80 &&
                                category.percentUsed <= 100 &&
                                '[&>div]:bg-warning'
                            )}
                            style={
                              category.percentUsed <= 80
                                ? { ['--progress-color' as any]: category.color }
                                : undefined
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(category.budget)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
