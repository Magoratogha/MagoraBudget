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
  BUDGET_PREFERENCES: 'budget-preferences',
};

export const WARNING_MODAL_DELETE_WORDING = {
  title: '¿Estás seguro?',
  description: '¡Pilas! Esta operación no se puede revertir.',
}

export const WARNING_MODAL_DELETE_ACCOUNT_WORDING = {
  title: '¿Estás seguro?',
  description: [
    '¡Pilas! No podrás editar ninguna transacción asociada con esta cuenta una vez eliminada.',
    'Si aun así quieres eliminarla, te recomendamos eliminar primero sus transacciones asociadas.',
    'Esta operación no se puede revertir.'],
}
