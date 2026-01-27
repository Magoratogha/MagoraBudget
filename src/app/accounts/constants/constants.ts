import { AccountType } from '../models';

export const ACCOUNT_TYPE_ICON_MAP: Record<AccountType, string> = {
  [AccountType.Savings]: 'bi-cash-coin',
  [AccountType.CreditCard]: 'bi-credit-card',
  [AccountType.Debt]: 'bi-currency-exchange',
  [AccountType.SavingsGoal]: 'bi-piggy-bank',
}
