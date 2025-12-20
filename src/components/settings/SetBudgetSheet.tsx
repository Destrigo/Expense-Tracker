import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getMonthDisplay } from '@/lib/calculations';

interface SetBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudget: number;
  monthKey: string;
  onSave: (amount: number) => void;
}

export const SetBudgetSheet = ({
  open,
  onOpenChange,
  currentBudget,
  monthKey,
  onSave,
}: SetBudgetSheetProps) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(currentBudget > 0 ? currentBudget.toString() : '');
    }
  }, [open, currentBudget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    onSave(isNaN(parsedAmount) ? 0 : parsedAmount);
    onOpenChange(false);
  };

  const presetAmounts = [500, 1000, 2000, 3000, 5000];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Set Monthly Budget</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {getMonthDisplay(monthKey)}
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-muted-foreground">
              Budget Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                $
              </span>
              <Input
                id="budget"
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

          <div className="space-y-2">
            <Label className="text-muted-foreground">Quick amounts</Label>
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map(preset => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? 'accent' : 'secondary'}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {currentBudget > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onSave(0);
                  onOpenChange(false);
                }}
              >
                Remove Budget
              </Button>
            )}
            <Button type="submit" variant="accent" className="flex-1">
              <Check className="w-5 h-5" />
              Save Budget
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
