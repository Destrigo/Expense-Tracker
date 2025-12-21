import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PlaidService } from '../services/plaidService';
import BankConnection from '../models/BankConnection';
import Transaction from '../models/Transaction';

export class PlaidController {
  static async createLinkToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const linkToken = await PlaidService.createLinkToken(userId);
      
      res.json(linkToken);
    } catch (error) {
      console.error('Create link token error:', error);
      res.status(500).json({ error: 'Failed to create link token' });
    }
  }

  static async exchangePublicToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { public_token } = req.body;

      // Exchange public token for access token
      const exchangeResponse = await PlaidService.exchangePublicToken(public_token);
      const { access_token, item_id } = exchangeResponse;

      // Get accounts
      const accountsData = await PlaidService.getAccounts(access_token);
      
      // Get institution info
      const institution = await PlaidService.getInstitution(
        accountsData.item.institution_id!
      );

      // Save bank connection
      const bankConnection = new BankConnection({
        userId,
        accessToken: access_token,
        itemId: item_id,
        institutionId: institution.institution.institution_id,
        institutionName: institution.institution.name,
        accounts: accountsData.accounts.map(account => ({
          id: account.account_id,
          institutionId: institution.institution.institution_id,
          institutionName: institution.institution.name,
          accountName: account.name,
          accountType: account.type === 'depository' ? 'checking' : account.type as any,
          balance: account.balances.current || 0,
          currency: account.balances.iso_currency_code || 'USD',
          lastSync: new Date(),
          isActive: true,
        })),
        lastSync: new Date(),
      });

      await bankConnection.save();

      res.json({
        id: bankConnection._id,
        institutionName: institution.institution.name,
        accounts: bankConnection.accounts,
      });
    } catch (error) {
      console.error('Exchange token error:', error);
      res.status(500).json({ error: 'Failed to exchange token' });
    }
  }

  static async syncTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { startDate, endDate } = req.body;

      // Get all bank connections for user
      const connections = await BankConnection.find({ userId });

      const allTransactions = [];

      for (const connection of connections) {
        try {
          const transactionsData = await PlaidService.getTransactions(
            connection.accessToken,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate || new Date().toISOString().split('T')[0]
          );

          // Save transactions
          for (const txn of transactionsData.transactions) {
            const existingTransaction = await Transaction.findOne({
              plaidTransactionId: txn.transaction_id,
            });

            if (!existingTransaction) {
              const transaction = new Transaction({
                userId,
                bankConnectionId: connection._id,
                plaidTransactionId: txn.transaction_id,
                accountId: txn.account_id,
                amount: Math.abs(txn.amount), // Plaid returns negative for expenses
                date: new Date(txn.date),
                name: txn.name,
                merchantName: txn.merchant_name,
                category: txn.category,
                pending: txn.pending,
                synced: false,
              });

              await transaction.save();
              allTransactions.push(transaction);
            }
          }

          // Update last sync
          connection.lastSync = new Date();
          await connection.save();
        } catch (error) {
          console.error(`Error syncing connection ${connection._id}:`, error);
        }
      }

      res.json({
        count: allTransactions.length,
        transactions: allTransactions,
      });
    } catch (error) {
      console.error('Sync transactions error:', error);
      res.status(500).json({ error: 'Failed to sync transactions' });
    }
  }

  static async getConnections(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const connections = await BankConnection.find({ userId });

      res.json(connections);
    } catch (error) {
      console.error('Get connections error:', error);
      res.status(500).json({ error: 'Failed to get connections' });
    }
  }

  static async removeConnection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { connectionId } = req.params;

      const connection = await BankConnection.findOne({
        _id: connectionId,
        userId,
      });

      if (!connection) {
        res.status(404).json({ error: 'Connection not found' });
        return;
      }

      // Remove from Plaid
      await PlaidService.removeItem(connection.accessToken);

      // Remove from database
      await BankConnection.deleteOne({ _id: connectionId });

      res.json({ message: 'Connection removed successfully' });
    } catch (error) {
      console.error('Remove connection error:', error);
      res.status(500).json({ error: 'Failed to remove connection' });
    }
  }
}