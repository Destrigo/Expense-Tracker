import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  bankConnectionId: mongoose.Types.ObjectId;
  plaidTransactionId: string;
  accountId: string;
  amount: number;
  date: Date;
  name: string;
  merchantName?: string;
  category?: string[];
  categoryId?: string;
  pending: boolean;
  synced: boolean;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bankConnectionId: {
      type: Schema.Types.ObjectId,
      ref: 'BankConnection',
      required: true,
    },
    plaidTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    merchantName: String,
    category: [String],
    categoryId: String,
    pending: {
      type: Boolean,
      default: false,
    },
    synced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);