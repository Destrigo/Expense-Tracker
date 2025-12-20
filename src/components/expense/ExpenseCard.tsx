import { format, parseISO } from 'date-fns';
import { Repeat, Pencil, Trash2 } from 'lucide-react';
import { Expense, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  showActions?: boolean;
}

export const ExpenseCard = ({
  expense,
  category,
  onEdit,
  onDelete,
  showActions = true,
}: ExpenseCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 shadow-card hover:shadow-elevated transition-shadow duration-200 animate-fade-in">
      <CategoryIcon
        icon={category?.icon || 'more-horizontal'}
        color={category?.color || 'hsl(215, 16%, 47%)'}
        size="md"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {category?.name || 'Unknown'}
          </span>
          {expense.isRecurring && (
            <Repeat className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{format(parseISO(expense.date), 'MMM d')}</span>
          {expense.note && (
            <>
              <span>•</span>
              <span className="truncate">{expense.note}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground tabular-nums">
          {formatCurrency(expense.amount)}
        </span>
        
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(expense)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(expense)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
