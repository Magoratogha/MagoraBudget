import { AccountType } from '../../accounts/models';

export interface BudgetPreference {
  id?: string;
  budgets: Partial<Record<AccountType, { enabled: boolean, amount: number | null }>>;
  ownerId: string;
}
