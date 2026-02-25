import { TransactionType } from '../../transactions/models';

export interface Pending {
  id?: string;
  label: string;
  amount: number;
  isDone: boolean;
  hasAssociatedTransaction: boolean;
  transactionType: TransactionType;
  originAccountId: string;
  targetAccountId?: string;
  ownerId: string;
}
