import { formatCurrency } from '@/lib/calculations';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetProgressCardProps {
  spent: number;
  budget: number;
  label?: string;
  showRemaining?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BudgetProgressCard = ({
  spent,
  budget,
  label = 'Budget',
  showRemaining = true,
  size = 'md',
}: BudgetProgressCardProps) => {
  const remaining = budget - spent;
  const percentUsed = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget;
  const isNearLimit = percentUsed >= 80 && percentUsed < 100;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border/50 shadow-card',
        sizeClasses[size]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            isOverBudget
              ? 'bg-destructive/10 text-destructive'
              : isNearLimit
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          )}
        >
          {percentUsed.toFixed(0)}% used
        </span>
      </div>

      <Progress
        value={percentUsed}
        className={cn(
          'h-2 mb-3',
          isOverBudget && '[&>div]:bg-destructive',
          isNearLimit && '[&>div]:bg-warning',
          !isOverBudget && !isNearLimit && '[&>div]:bg-accent'
        )}
      />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(spent)}
          </span>
          <span className="text-sm text-muted-foreground">
            {' '}
            / {formatCurrency(budget)}
          </span>
        </div>
        {showRemaining && budget > 0 && (
          <span
            className={cn(
              'text-sm font-medium',
              isOverBudget ? 'text-destructive' : 'text-success'
            )}
          >
            {isOverBudget ? '-' : ''}
            {formatCurrency(Math.abs(remaining))} {isOverBudget ? 'over' : 'left'}
          </span>
        )}
      </div>
    </div>
  );
};
