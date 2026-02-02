import { TransactionType } from '../models';

export const TRANSACTION_TYPE_INFO_MAP: Record<TransactionType, {
  iconClass: string,
  label: string
}> = {
  [TransactionType.Expense]: { iconClass: 'bi-cart', label: 'Gasto' },
  [TransactionType.Income]: { iconClass: 'bi-piggy-bank', label: 'Ingreso' },
  [TransactionType.Transfer]: { iconClass: 'bi-arrow-left-right', label: 'Transferencia' }
};
