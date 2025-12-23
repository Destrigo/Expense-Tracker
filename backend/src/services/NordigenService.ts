// backend/services/NordigenService.ts
import NordigenClient from 'nordigen-node';

const client = new NordigenClient({
  secretId: process.env.NORDIGEN_SECRET_ID!,
  secretKey: process.env.NORDIGEN_SECRET_KEY!,
  baseUrl: 'https://ob.nordigen.com/api/v2', // required
});

export class NordigenService {
  // Authenticate with Nordigen
  static async init() {
    await client.generateToken();
  }

  // List available institutions
  static async listInstitutions(countryCode: string) {
    await this.init();
    const institutions = await client.institutions.list({ country: countryCode });
    return institutions;
  }

  // Create a new requisition
  static async createRequisition(
    institutionId: string,
    redirectUrl: string,
    reference: string
  ) {
    await this.init();
    const requisition = await client.requisitions.create({
      institutionId,
      redirectUrl,
      reference,
    });
    return requisition;
  }

  // Get requisition info
  static async getRequisition(requisitionId: string) {
    await this.init();
    const requisition = await client.requisitions.get(requisitionId);
    return requisition;
  }

  // Get account info
  static async getAccount(accountId: string) {
    await this.init();
    const account = await client.accounts.get(accountId);
    return account;
  }

  // Get account transactions
  static async getTransactions(accountId: string, startDate: string, endDate: string) {
    await this.init();
    const transactions = await client.accounts.getTransactions(accountId, startDate, endDate);
    return transactions;
  }
}
