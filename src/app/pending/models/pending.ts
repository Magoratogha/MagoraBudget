import { TransactionType } from '../../transactions/models';

export interface Pending {
  id?: string;
  label: string;
  amount: number;
  hasAssociatedTransaction: boolean;
  transactionType?: TransactionType;
  originAccountId?: string;
  targetAccountId?: string;
}
