import mongoose, { Document, Schema } from 'mongoose';

export interface IBankAccount {
  id: string;
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  lastSync: Date;
  isActive: boolean;
}

export interface IBankConnection extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  accounts: IBankAccount[];
  createdAt: Date;
  lastSync: Date;
}

const BankConnectionSchema = new Schema<IBankConnection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    institutionId: {
      type: String,
      required: true,
    },
    institutionName: {
      type: String,
      required: true,
    },
    accounts: [
      {
        id: String,
        institutionId: String,
        institutionName: String,
        accountName: String,
        accountType: {
          type: String,
          enum: ['checking', 'savings', 'credit'],
        },
        balance: Number,
        currency: String,
        lastSync: Date,
        isActive: Boolean,
      },
    ],
    lastSync: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBankConnection>('BankConnection', BankConnectionSchema);