import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Repeat, X, Check } from 'lucide-react';
import { Expense, Category } from '@/lib/types';
import { CategoryIcon } from './CategoryIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  expense?: Expense | null;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddExpenseSheet = ({
  open,
  onOpenChange,
  categories,
  expense,
  onSave,
}: AddExpenseSheetProps) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategoryId(expense.categoryId);
      setDate(expense.date);
      setNote(expense.note || '');
      setIsRecurring(expense.isRecurring || false);
      setRecurringType(expense.recurringType || 'monthly');
    } else {
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNote('');
      setIsRecurring(false);
      setRecurringType('monthly');
    }
  }, [expense, categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!categoryId) return;

    onSave({
      amount: parsedAmount,
      categoryId,
      date,
      note: note.trim() || undefined,
      isRecurring: isRecurring || undefined,
      recurringType: isRecurring ? recurringType : undefined,
    });

    onOpenChange(false);
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-muted-foreground">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-10 h-14 text-2xl font-semibold"
                autoFocus
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.slice(0, 8).map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                    categoryId === category.id
                      ? 'border-accent bg-accent/5'
                      : 'border-transparent bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    size="sm"
                  />
                  <span className="text-xs font-medium text-foreground truncate w-full text-center">
                    {category.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
            {categories.length > 8 && (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="More categories..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-muted-foreground">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="pl-11"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-muted-foreground">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add a note..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-accent" />
              <div>
                <Label htmlFor="recurring" className="font-medium">
                  Recurring expense
                </Label>
                <p className="text-sm text-muted-foreground">
                  Repeat this expense automatically
                </p>
              </div>
            </div>
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <Select
              value={recurringType}
              onValueChange={(value: 'weekly' | 'monthly') => setRecurringType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            variant="accent"
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0 || !categoryId}
          >
            <Check className="w-5 h-5" />
            {expense ? 'Update Expense' : 'Add Expense'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
