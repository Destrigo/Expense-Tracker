import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NordigenService } from '../services/NordigenService';
import BankConnection from '../models/BankConnection';

export class NordigenController {
  static async createLink(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const requisition = await NordigenService.createRequisition(userId);
      res.json(requisition); // frontend will redirect to requisition.link
    } catch (error) {
      console.error('Create link error:', error);
      res.status(500).json({ error: 'Failed to create bank link' });
    }
  }

  static async fetchAccounts(req: AuthRequest, res: Response) {
    try {
      const { requisitionId } = req.body;
      const accountsData = await NordigenService.getAccounts(requisitionId);

      // Save connections in DB
      for (const data of accountsData) {
        const existing = await BankConnection.findOne({ itemId: data.account.id });
        if (!existing) {
          await BankConnection.create({
            userId: req.userId!,
            itemId: data.account.id,
            institutionId: data.account.institution_id,
            institutionName: data.account.institution_name,
            accounts: [
              {
                id: data.account.id,
                accountName: data.account.name,
                accountType: data.account.type,
                balance: data.account.balances.current,
                currency: data.account.balances.iso_currency_code,
                lastSync: new Date(),
                isActive: true,
              },
            ],
            lastSync: new Date(),
          });
        }
      }

      res.json(accountsData);
    } catch (error) {
      console.error('Fetch accounts error:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }
}
