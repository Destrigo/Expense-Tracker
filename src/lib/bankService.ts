import { BankTransaction, BankAccount, BankConnection } from './types';

// This will connect to your backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class BankService {
  private static async fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = options.headers?.['Authorization'] || ''; // optional
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>), // <- cast here
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

  // Initialize Plaid Link Token
static async createLinkToken(token: string): Promise<{ link_token: string }> {
  return this.fetchAPI('/plaid/create-link-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

  // Exchange public token for access token
  static async exchangePublicToken(token: string, publicToken: string): Promise<BankConnection> {
    return this.fetchAPI('/plaid/exchange-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ public_token: publicToken }),
    });
  }

  // Get all bank connections for user
static async getBankConnections(token: string): Promise<BankConnection[]> {
  return this.fetchAPI('/plaid/connections', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

  // Sync transactions from all connected accounts
  static async syncTransactions(token: string, startDate?: string, endDate?: string): Promise<BankTransaction[]> {
    return this.fetchAPI(
      '/plaid/sync-transactions',
      {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate }),
      }
    );
  }

  // Get account balances
  static async getAccountBalances(userId: string): Promise<BankAccount[]> {
    return this.fetchAPI(`/bank/balances/${userId}`);
  }

  // Remove bank connection
static async removeBankConnection(token: string, connectionId: string): Promise<void> {
  return this.fetchAPI(`/plaid/connections/${connectionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

  // Categorize transaction using AI/rules
  static async categorizeTransaction(
    transaction: BankTransaction,
    categories: Array<{ id: string; name: string }>
  ): Promise<string> {
    // Simple rule-based categorization (will be enhanced with backend AI)
    const merchant = transaction.merchantName?.toLowerCase() || 
                     transaction.description.toLowerCase();

    // Food & Dining
    if (merchant.match(/restaurant|cafe|coffee|food|pizza|burger|starbucks|mcdonald/)) {
      return categories.find(c => c.name.includes('Food'))?.id || 'other';
    }

    // Transport
    if (merchant.match(/uber|lyft|taxi|gas|fuel|parking|transit|subway/)) {
      return categories.find(c => c.name.includes('Transport'))?.id || 'other';
    }

    // Shopping
    if (merchant.match(/amazon|walmart|target|store|shop|retail/)) {
      return categories.find(c => c.name.includes('Shopping'))?.id || 'other';
    }

    // Entertainment
    if (merchant.match(/netflix|spotify|theater|cinema|movie|game|entertainment/)) {
      return categories.find(c => c.name.includes('Entertainment'))?.id || 'other';
    }

    // Bills
    if (merchant.match(/utility|electric|water|internet|phone|bill|insurance/)) {
      return categories.find(c => c.name.includes('Bills'))?.id || 'other';
    }

    // Health
    if (merchant.match(/pharmacy|doctor|hospital|medical|health|gym|fitness/)) {
      return categories.find(c => c.name.includes('Health'))?.id || 'other';
    }

    return 'other';
  }
}