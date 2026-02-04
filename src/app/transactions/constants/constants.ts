import { TransactionType } from '../models';

export const TRANSACTION_TYPE_INFO_MAP: Record<TransactionType, {
  iconClass: string,
  label: string
}> = {
  [TransactionType.Expense]: { iconClass: 'shopping_cart', label: 'Gasto' },
  [TransactionType.Income]: { iconClass: 'savings', label: 'Ingreso' },
  [TransactionType.Transfer]: { iconClass: 'compare_arrows', label: 'Transferencia' }
};
