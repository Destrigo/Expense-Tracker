import { useState, useEffect } from 'react';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BankConnectionCard } from '@/components/bank/BankConnectionCard';
import { BankService } from '@/lib/bankService';
import { BankConnection } from '@/lib/types';
import { toast } from 'sonner';

const BankConnections = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = 'demo-user'; // TODO: Get from auth context

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const data = await BankService.getBankConnections(userId);
      setConnections(data);
    } catch (error) {
      console.error('Failed to load bank connections:', error);
      toast.error('Failed to load bank connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBank = async () => {
    try {
      // This will open Plaid Link
      const { link_token } = await BankService.createLinkToken(userId);
      
      // TODO: Initialize Plaid Link with link_token
      // This requires Plaid Link SDK integration
      toast.info('Bank connection feature requires backend setup');
    } catch (error) {
      console.error('Failed to create link token:', error);
      toast.error('Failed to connect bank');
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      await BankService.syncTransactions(userId);
      toast.success('Transactions synced successfully');
      await loadConnections();
    } catch (error) {
      console.error('Failed to sync:', error);
      toast.error('Failed to sync transactions');
    }
  };

  const handleRemove = async (connectionId: string) => {
    try {
      await BankService.removeBankConnection(userId, connectionId);
toast.success('Bank connection removed');
await loadConnections();
} catch (error) {
console.error('Failed to remove connection:', error);
toast.error('Failed to remove connection');
}
};
return (
<div className="min-h-screen pb-24 px-4 pt-safe">
<div className="max-w-lg mx-auto">
<PageHeader
       title="Bank Connections"
       subtitle="Connect your bank accounts for automatic tracking"
     />
    {/* Backend Status Warning */}
    <Card className="mt-4 border-warning/50 bg-warning/5">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning mb-1">
              Backend Required
            </h3>
            <p className="text-sm text-muted-foreground">
              Bank integration requires a backend server to securely connect to financial
              institutions. The UI is ready - backend setup is needed to enable this feature.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Button
      size="lg"
      variant="accent"
      className="w-full mt-6"
      onClick={handleConnectBank}
    >
      <Plus className="w-5 h-5 mr-2" />
      Connect Bank Account
    </Button>

    {isLoading ? (
      <div className="mt-6 text-center text-muted-foreground">
        Loading connections...
      </div>
    ) : connections.length === 0 ? (
      <Card className="mt-6">
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            No Banks Connected
          </h3>
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
            onSync={handleSync}
            onRemove={handleRemove}
          />
        ))}
      </div>
    )}
  </div>
</div>
);
};
export default BankConnections;