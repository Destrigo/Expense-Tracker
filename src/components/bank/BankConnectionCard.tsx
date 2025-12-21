import { useState } from 'react';
import { Building2, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BankConnection } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { format, parseISO } from 'date-fns';
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

interface BankConnectionCardProps {
  connection: BankConnection;
  onSync: (connectionId: string) => Promise<void>;
  onRemove: (connectionId: string) => Promise<void>;
}

export const BankConnectionCard = ({
  connection,
  onSync,
  onRemove,
}: BankConnectionCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(connection.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemove = async () => {
    await onRemove(connection.id);
    setShowRemoveDialog(false);
  };

  const totalBalance = connection.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {connection.institutionName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {connection.accounts.length} account{connection.accounts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total balance
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {connection.accounts.map(account => (
              <div
                key={account.id}
                className="flex items-center justify-between p-2 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {account.isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{account.accountName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {account.accountType}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Last synced: {format(parseISO(connection.lastSync), 'MMM d, h:mm a')}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowRemoveDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bank Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {connection.institutionName}? This will not delete
              your existing expenses, but you'll need to reconnect to sync new transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};