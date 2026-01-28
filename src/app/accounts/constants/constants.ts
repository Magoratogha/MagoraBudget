import { AccountType } from '../models';

export const ACCOUNT_TYPE_INFO_MAP: Record<AccountType, { iconClass: string, label: string }> = {
  [AccountType.Savings]: { iconClass: 'bi-cash-coin', label: 'Cuenta Bancaria' },
  [AccountType.CreditCard]: { iconClass: 'bi-credit-card', label: 'Tarjeta de Crédito' },
  [AccountType.Debt]: { iconClass: 'bi-currency-exchange', label: 'Deuda' },
  [AccountType.SavingsGoal]: { iconClass: 'bi-piggy-bank', label: 'Meta de Ahorro' },
}
