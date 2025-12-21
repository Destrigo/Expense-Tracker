import { useEffect, useMemo, useState } from 'react';
import { User, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useCurrency } from '@/contexts/CurrencyContext';

type ProfileData = {
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
};

const STORAGE_KEY = 'expense-tracker-profile';

const defaultProfile: ProfileData = {
  name: '',
  email: '',
  monthlyIncome: 0,
  currency: 'USD', // Changed from '€' to 'USD',
};

const Profile = () => {
  const { expenses } = useExpenses();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const loadedProfile = JSON.parse(stored);
      setProfile(loadedProfile);
      // Sync currency with global context
      if (loadedProfile.currency) {
        setGlobalCurrency(loadedProfile.currency);
      }
    }
  }, []);

  /* Derived stats */
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const expenseCount = expenses.length;

  const handleChange = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K]
  ) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    
    // If currency changed, update global currency
    if (key === 'currency') {
      setGlobalCurrency(value as string);
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Profile"
          subtitle="Your personal information"
          icon={<User className="w-5 h-5" />}
        />

        {/* Profile Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={profile.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="john@email.com"
              />
            </div>

            <div className="space-y-1">
              <Label>Monthly Income</Label>
              <Input
                type="number"
                value={profile.monthlyIncome}
                onChange={e =>
                  handleChange('monthlyIncome', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Currency</Label>
              <select
                value={profile.currency}
                onChange={e => {
                  const newCurrency = e.target.value;
                  setProfile(prev => ({ ...prev, currency: newCurrency }));
                  setGlobalCurrency(newCurrency);
                  setSaved(false);
                }}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              >
                {[
                  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL',
                ].map(curr => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full mt-2" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Account Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="font-semibold">
                {profile.currency} {totalExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Entries</p>
              <p className="font-semibold">{expenseCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
