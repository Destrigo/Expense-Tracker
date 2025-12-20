import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthSelector = ({
  currentMonth,
  onMonthChange,
}: MonthSelectorProps) => {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const isCurrentMonth =
    format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="flex items-center justify-between bg-card rounded-xl border border-border/50 shadow-card p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <button
        onClick={() => onMonthChange(new Date())}
        className="flex flex-col items-center px-4 py-1 rounded-lg hover:bg-secondary transition-colors"
      >
        <span className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM')}
        </span>
        <span className="text-xs text-muted-foreground">
          {format(currentMonth, 'yyyy')}
        </span>
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        disabled={isCurrentMonth}
        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
