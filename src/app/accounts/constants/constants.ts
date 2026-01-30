import { AccountType } from '../models';

export const ACCOUNT_TYPE_INFO_MAP: Record<AccountType, { iconClass: string, label: string }> = {
  [AccountType.Cash]: { iconClass: 'bi-cash-coin', label: 'Efectivo' },
  [AccountType.Savings]: { iconClass: 'bi-bank', label: 'Cuenta Bancaria' },
  [AccountType.CreditCard]: { iconClass: 'bi-credit-card', label: 'Tarjeta de Crédito' },
  [AccountType.Debt]: { iconClass: 'bi-currency-exchange', label: 'Deuda' },
  [AccountType.SavingsGoal]: { iconClass: 'bi-piggy-bank', label: 'Meta de Ahorro' },
}
