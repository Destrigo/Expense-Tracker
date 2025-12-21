import { useState, useEffect } from 'react';
import { Check, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { getMonthDisplay } from '@/lib/calculations';
import { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface SetBudgetWithPercentagesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudget: number;
  monthKey: string;
  categories: Category[];
  useCategoryPercentages?: boolean;
  categoryPercentages?: Record<string, number>;
  onSave: (
    amount: number, 
    useCategoryPercentages: boolean,
    categoryPercentages?: Record<string, number>
  ) => void;
}

export const SetBudgetWithPercentagesSheet = ({
  open,
  onOpenChange,
  currentBudget,
  monthKey,
  categories,
  useCategoryPercentages = false,
  categoryPercentages = {},
  onSave,
}: SetBudgetWithPercentagesSheetProps) => {
  const [amount, setAmount] = useState('');
  const [usePercentages, setUsePercentages] = useState(useCategoryPercentages);
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      setAmount(currentBudget > 0 ? currentBudget.toString() : '');
      setUsePercentages(useCategoryPercentages);
      
      // Initialize percentages
      const initialPercentages: Record<string, number> = {};
      categories.forEach(cat => {
        initialPercentages[cat.id] = categoryPercentages[cat.id] || 0;
      });
      setPercentages(initialPercentages);
    }
  }, [open, currentBudget, useCategoryPercentages, categoryPercentages, categories]);

  const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
  const budgetAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (usePercentages && totalPercentage !== 100) {
      alert('Percentages must add up to 100%');
      return;
    }
    
    onSave(
      isNaN(parsedAmount) ? 0 : parsedAmount,
      usePercentages,
      usePercentages ? percentages : undefined
    );
    onOpenChange(false);
  };

  const handlePercentageChange = (categoryId: string, value: number) => {
    setPercentages(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const distributeEvenly = () => {
    const evenPercentage = Math.floor(100 / categories.length);
    const newPercentages: Record<string, number> = {};
    categories.forEach((cat, index) => {
      // Give the remainder to the first category
      newPercentages[cat.id] = index === 0 
        ? evenPercentage + (100 - (evenPercentage * categories.length))
        : evenPercentage;
    });
    setPercentages(newPercentages);
  };

  const presetAmounts = [500, 1000, 2000, 3000, 5000];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Set Monthly Budget</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {getMonthDisplay(monthKey)}
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-muted-foreground">
              Total Budget Amount
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

          {/* Category Percentages Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-accent" />
              <div>
                <Label htmlFor="percentages" className="font-medium">
                  Set budget by category
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allocate percentage per category
                </p>
              </div>
            </div>
            <Switch
              id="percentages"
              checked={usePercentages}
              onCheckedChange={setUsePercentages}
            />
          </div>

          {/* Category Percentages */}
          {usePercentages && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">
                  Category Allocation
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={distributeEvenly}
                >
                  Distribute Evenly
                </Button>
              </div>

              <div className="space-y-3">
                {categories.map(category => {
                  const categoryAmount = (budgetAmount * (percentages[category.id] || 0)) / 100;
                  
                  return (
                    <div key={category.id} className="space-y-2 p-3 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            icon={category.icon}
                            color={category.color}
                            size="sm"
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={percentages[category.id] || 0}
                            onChange={e => handlePercentageChange(category.id, parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 text-sm text-right"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[percentages[category.id] || 0]}
                          onValueChange={([value]) => handlePercentageChange(category.id, value)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {formatCurrency(categoryAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`text-sm font-medium ${totalPercentage === 100 ? 'text-success' : 'text-destructive'}`}>
                Total: {totalPercentage.toFixed(0)}% {totalPercentage !== 100 && '(Must equal 100%)'}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {currentBudget > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onSave(0, false, undefined);
                  onOpenChange(false);
                }}
              >
                Remove Budget
              </Button>
            )}
            <Button 
              type="submit" 
              variant="accent" 
              className="flex-1"
              disabled={usePercentages && totalPercentage !== 100}
            >
              <Check className="w-5 h-5" />
              Save Budget
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};