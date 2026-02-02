import { TransactionType } from './transaction-type';

export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  originAccountId: string;
  targetAccountId?: string;
  ownerId: string;
}
