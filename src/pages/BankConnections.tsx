import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { BankConnectionCard } from '@/components/bank/BankConnectionCard';
import { BankConnection } from '@/lib/types';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const BankConnections = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  // Read JWT from localStorage
  const token = localStorage.getItem('jwt');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user info and bank connections
    loadUser(token);
    loadConnections(token);
  }, [token, navigate]);

  const loadUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUsername(data.name);
    } catch (err) {
      console.error(err);
      toast.error('Could not load user info');
    }
  };

  const loadConnections = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/plaid/connections`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        const text = await res.text();
        throw new Error(`Failed to fetch connections: ${res.status} ${text}`);
      }

      const data: BankConnection[] = await res.json();
      setConnections(data);
    } catch (error: any) {
      console.error('loadConnections error:', error);
      toast.error(error.message || 'Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`${API_BASE_URL}/plaid/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Sync failed');
      toast.success('Transactions synced successfully');
      await loadConnections(token);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync transactions');
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`${API_BASE_URL}/plaid/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Remove failed');
      toast.success('Bank connection removed');
      await loadConnections(token);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove connection');
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-safe">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title="Bank Connections"
          subtitle={`Hello ${username}, connected accounts`}
        />

        {isLoading ? (
          <div className="mt-6 text-center text-muted-foreground">
            Loading connections...
          </div>
        ) : connections.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Banks Connected</h3>
              <p className="text-sm text-muted-foreground">
                Connect your bank account to automatically import and categorize transactions
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {connections.map(connection => (
              <BankConnectionCard
                key={connection.id}
                connection={connection}
                onSync={() => handleSync(connection.id)}
                onRemove={() => handleRemove(connection.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankConnections;
