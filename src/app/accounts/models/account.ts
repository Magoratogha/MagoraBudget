import { AccountType } from './account-type';

export interface Account {
  id?: string;
  label: string;
  type: AccountType;
  balance: number;
  quota?: number;
  ownerId: string;
}
