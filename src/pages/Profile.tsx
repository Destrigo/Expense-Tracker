import { useEffect, useState, useMemo } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useCurrency } from '@/contexts/CurrencyContext';

type ProfileData = {
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Profile = () => {
  const navigate = useNavigate();
  const { expenses } = useExpenses();
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user');

        const data: ProfileData = await res.json();
        setProfile(data);
        setGlobalCurrency(data.currency);
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const expenseCount = expenses.length;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return null; // fallback if user not found
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Profile"
          subtitle="Your personal information"
          icon={<User className="w-5 h-5" />}
        />

        {/* Profile Info (read-only) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-semibold">{profile.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-semibold">{profile.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Income</p>
              <p className="font-semibold">
                {profile.currency} {profile.monthlyIncome.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-semibold">{profile.currency}</p>
            </div>
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
