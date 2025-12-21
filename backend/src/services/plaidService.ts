import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  static async createLinkToken(userId: string) {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: {
          client_user_id: userId,
        },
        client_name: 'Expense Tracker',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: `${process.env.BACKEND_URL}/api/plaid/webhook`,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  static async exchangePublicToken(publicToken: string) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  static async getAccounts(accessToken: string) {
    try {
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  static async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async getInstitution(institutionId: string) {
    try {
      const response = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });

      return response.data;
    } catch (error) {
      console.error('Error getting institution:', error);
      throw error;
    }
  }

  static async removeItem(accessToken: string) {
    try {
      const response = await plaidClient.itemRemove({
        access_token: accessToken,
      });

      return response.data;
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }
}