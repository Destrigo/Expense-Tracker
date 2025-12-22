// lib/bankServiceOffline.ts
import { BankConnection, BankTransaction, BankAccount } from './types';
import { AuthServiceOffline } from './authServiceOffline';

export class BankServiceOffline {
  // --- Local storage helpers ---
  private static getConnectionsFromStorage(): BankConnection[] {
    const token = AuthServiceOffline.getCurrentUserToken();
    if (!token) return [];
    const data = localStorage.getItem(`bank-connections_${token}`);
    return data ? JSON.parse(data) : [];
  }

  private static saveConnectionsToStorage(connections: BankConnection[]) {
    const token = AuthServiceOffline.getCurrentUserToken();
    if (!token) return;
    localStorage.setItem(`bank-connections_${token}`, JSON.stringify(connections));
  }

  private static getTransactionsFromStorage(): BankTransaction[] {
    const token = AuthServiceOffline.getCurrentUserToken();
    if (!token) return [];
    const data = localStorage.getItem(`bank-transactions_${token}`);
    return data ? JSON.parse(data) : [];
  }

  private static saveTransactionsToStorage(transactions: BankTransaction[]) {
    const token = AuthServiceOffline.getCurrentUserToken();
    if (!token) return;
    localStorage.setItem(`bank-transactions_${token}`, JSON.stringify(transactions));
  }

  // --- Bank connections ---
  static async getBankConnections(): Promise<BankConnection[]> {
    return this.getConnectionsFromStorage();
  }

  static async createLinkToken(): Promise<{ link_token: string }> {
    // Offline mode: return a fake token
    return { link_token: 'offline-demo-token' };
  }

  static async exchangePublicToken(publicToken: string): Promise<BankConnection> {
    // Offline mode: simulate a new bank connection
    const connections = this.getConnectionsFromStorage();

    const newConnection: BankConnection = {
      id: `${Date.now()}`,
      institutionId: 'offline-bank',
      institutionName: 'Offline Bank',
      accessToken: 'offline-access-token',
      accounts: [
        {
          id: 'acc-1',
          institutionId: 'offline-bank',
          institutionName: 'Offline Bank',
          accountName: 'Checking',
          accountType: 'checking',
          balance: 1000,
          currency: 'USD',
          lastSync: new Date().toISOString(),
          isActive: true,
        },
      ],
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Save to local storage
    connections.push(newConnection);
    this.saveConnectionsToStorage(connections);

    return newConnection;
  }

  static async removeBankConnection(connectionId: string): Promise<void> {
    const connections = this.getConnectionsFromStorage();
    this.saveConnectionsToStorage(connections.filter(c => c.id !== connectionId));

    const transactions = this.getTransactionsFromStorage();
    this.saveTransactionsToStorage(transactions.filter(t => t.bankConnectionId !== connectionId));
  }

  // --- Transactions ---
  static async syncTransactions(): Promise<BankTransaction[]> {
    // Offline mode: just return current local transactions
    return this.getTransactionsFromStorage();
  }

  static async addTransaction(transaction: BankTransaction): Promise<void> {
    const transactions = this.getTransactionsFromStorage();
    transactions.push(transaction);
    this.saveTransactionsToStorage(transactions);
  }

  // --- Accounts ---
  static async getAccountBalances(): Promise<BankAccount[]> {
    const connections = this.getConnectionsFromStorage();
    return connections.flatMap(c => c.accounts);
  }
}
