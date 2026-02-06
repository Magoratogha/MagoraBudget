import { NavbarItem } from '../models';

export const NAVBAR_ITEMS: NavbarItem[] = [
  { icon: 'home', route: '/home' },
  { icon: 'calendar_month', route: '/transactions' },
  { icon: 'account_balance', route: '/accounts' },
  { icon: 'list_alt_check', route: '/pending' },
];

export const FIREBASE_COLLECTION_NAMES = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  USER_SETTINGS: 'user-settings',
};

export const WARNING_MODAL_DELETE_WORDING = {
  title: 'Estás seguro?',
  description: 'Esta operación no se puede revertir.',
}
