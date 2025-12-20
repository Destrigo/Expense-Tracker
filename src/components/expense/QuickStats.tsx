import { TrendingDown, TrendingUp, Wallet, Target } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  totalSpent: number;
  budget: number;
  remaining: number;
  expenseCount: number;
}

export const QuickStats = ({
  totalSpent,
  budget,
  remaining,
  expenseCount,
}: QuickStatsProps) => {
  const isOverBudget = remaining < 0;
  const hasBudget = budget > 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm text-muted-foreground">Spent</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formatCompactCurrency(totalSpent)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              hasBudget
                ? isOverBudget
                  ? 'bg-destructive/10'
                  : 'bg-success/10'
                : 'bg-muted'
            )}
          >
            {hasBudget ? (
              isOverBudget ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success" />
              )
            ) : (
              <Target className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {hasBudget ? 'Remaining' : 'Budget'}
          </span>
        </div>
        <p
          className={cn(
            'text-2xl font-bold',
            hasBudget
              ? isOverBudget
                ? 'text-destructive'
                : 'text-success'
              : 'text-muted-foreground'
          )}
        >
          {hasBudget
            ? `${isOverBudget ? '-' : ''}${formatCompactCurrency(Math.abs(remaining))}`
            : 'Not set'}
        </p>
        {hasBudget && (
          <p className="text-xs text-muted-foreground mt-1">
            of {formatCompactCurrency(budget)} budget
          </p>
        )}
      </div>
    </div>
  );
};
