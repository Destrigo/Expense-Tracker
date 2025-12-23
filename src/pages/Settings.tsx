import { useState } from 'react';
import {
  Download,
  Trash2,
  Plus,
  Tag,
  Palette,
  ChevronRight,
  Shield,
  Database,
  Building2,
} from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryIcon, AVAILABLE_ICONS } from '@/components/expense/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { downloadCSV } from '@/lib/storage';
import { Category, CATEGORY_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Settings = () => {
  const {
    expenses,
    categories,
    budgets,
    monthlyBudgets,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useExpenses();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [clearDataConfirm, setClearDataConfirm] = useState(false);

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('more-horizontal');

  const handleExportCSV = () => {
    downloadCSV({ expenses, categories, budgets, monthlyBudgets });
    toast.success('Expenses exported successfully');
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      });
      toast.success('Category updated');
    } else {
      addCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      });
      toast.success('Category added');
    }

    resetCategoryForm();
    setIsAddCategoryOpen(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryIcon(category.icon);
    setIsAddCategoryOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    const hasExpenses = expenses.some(e => e.categoryId === category.id);
    if (hasExpenses) {
      toast.error('Cannot delete category with expenses');
      return;
    }
    setDeleteConfirm(category);
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirm) {
      deleteCategory(deleteConfirm.id);
      toast.success('Category deleted');
      setDeleteConfirm(null);
    }
  };

  const resetCategoryForm = () => {
    setNewCategoryName('');
    setNewCategoryColor(CATEGORY_COLORS[0]);
    setNewCategoryIcon('more-horizontal');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Manage your app preferences"
        />

        {/* Data & Privacy */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Local Storage Only</p>
                  <p className="text-xs text-muted-foreground">
                    All data stays on your device
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={handleExportCSV}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to CSV
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
            {/* removed for bank connection */}
            {/* <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.location.href = '/bank-connections'}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Connections
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button> */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Connections</p>
                      <p className="text-xs text-muted-foreground">
                        Auto-import transactions from your bank
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    Soon
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setClearDataConfirm(true)}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Categories
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  resetCategoryForm();
                  setEditingCategory(null);
                  setIsAddCategoryOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleEditCategory(category)}
                  className="flex items-center gap-3 w-full p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-left"
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    size="sm"
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mt-4">
          <CardContent className="pt-5">
            <div className="text-center text-muted-foreground">
              <p className="text-sm font-medium">Expense Tracker</p>
              <p className="text-xs mt-1">
                Privacy-first • Offline-only • Open source
              </p>
              <p className="text-xs mt-2">
                {expenses.length} expenses tracked
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Sheet */}
        <Sheet
          open={isAddCategoryOpen}
          onOpenChange={open => {
            setIsAddCategoryOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetCategoryForm();
            }
          }}
        >
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Name</Label>
                <Input
                  id="categoryName"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-transform',
                        newCategoryColor === color &&
                          'ring-2 ring-offset-2 ring-foreground scale-110'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategoryIcon(icon)}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        newCategoryIcon === icon
                          ? 'bg-accent/10 ring-2 ring-accent'
                          : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      <CategoryIcon
                        icon={icon}
                        color={newCategoryColor}
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {editingCategory && (
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      handleDeleteCategory(editingCategory);
                      setIsAddCategoryOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={handleSaveCategory}
                  disabled={!newCategoryName.trim()}
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Delete Category Confirmation */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCategory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear Data Confirmation */}
        <AlertDialog
          open={clearDataConfirm}
          onOpenChange={setClearDataConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your expenses, categories, and
                budgets. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
