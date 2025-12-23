import { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PlaidLinkButtonProps {
  onSuccess: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSuccessCallback = useCallback(async (public_token: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE_URL}/plaid/exchange-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token }),
      });

      if (!res.ok) throw new Error('Failed to connect bank');

      toast.success('Bank connected successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Exchange token error:', error);
      toast.error(error.message || 'Failed to connect bank');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = async () => {
    if (linkToken) {
      open();
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE_URL}/plaid/create-link-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to create link token');

      const data = await res.json();
      setLinkToken(data.link_token);
      
      // Wait a bit for Plaid Link to initialize
      setTimeout(() => {
        open();
      }, 100);
    } catch (error: any) {
      console.error('Create link token error:', error);
      toast.error(error.message || 'Failed to initialize bank connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || (linkToken !== null && !ready)}
      size="lg"
      variant="accent"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Building2 className="w-5 h-5 mr-2" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
};