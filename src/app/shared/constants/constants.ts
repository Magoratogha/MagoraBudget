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
  PENDINGS: 'pendings',
};

export const WARNING_MODAL_DELETE_WORDING = {
  title: '¿Estás seguro?',
  description: '¡Pilas! Esta operación no se puede revertir.',
}

export const WARNING_MODAL_PENDING_AMOUNT_WORDING = {
  title: 'No podemos completar este pendiente',
  description: [
    '¡Pilas! Éste pendiente tiene activada la transacción automática y el MONTO configurado no es válido para alguna de las cuentas asociadas.',
    'Por favor, edita el pendiente para ajustar el monto, o desactiva la transacción automática si ya no es necesaria.',
  ],
}

export const WARNING_MODAL_PENDING_ACCOUNT_WORDING = {
  title: 'No podemos completar este pendiente',
  description: [
    '¡Pilas! Éste pendiente tiene activada la transacción automática y alguna de las cuentas asociadas ya NO EXISTE.',
    'Por favor, edita el pendiente para seleccionar una cuenta válida, o desactiva la transacción automática si ya no es necesaria.',
  ],
}

export const WARNING_MODAL_DELETE_ACCOUNT_WORDING = {
  title: '¿Estás seguro?',
  description: [
    '¡Pilas! No podrás editar ninguna transacción asociada con esta cuenta una vez eliminada.',
    'Si aun así quieres eliminarla, te recomendamos eliminar primero sus transacciones asociadas.',
    'Esta operación no se puede revertir.'],
}

export const DEFAULT_VIBRATION_PATTERN = [50, 0, 100];
