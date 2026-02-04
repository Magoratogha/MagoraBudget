import { AccountType } from '../models';

export const ACCOUNT_TYPE_INFO_MAP: Record<AccountType, { iconClass: string, label: string }> = {
  [AccountType.Cash]: { iconClass: 'universal_currency_alt', label: 'Efectivo' },
  [AccountType.Savings]: { iconClass: 'account_balance', label: 'Cuenta Bancaria' },
  [AccountType.CreditCard]: { iconClass: 'credit_card', label: 'Tarjeta de Crédito' },
  [AccountType.Debt]: { iconClass: 'price_change', label: 'Deuda' },
  [AccountType.SavingsGoal]: { iconClass: 'savings', label: 'Meta de Ahorro' },
};

export const BALANCE_FIELD_WORDING_MAP: Record<AccountType, { label: string, placeholder: string }> = {
  [AccountType.Cash]: { placeholder: '150.000', label: 'Cuánto efectivo tienes?' },
  [AccountType.Savings]: { placeholder: '1.450.000', label: 'Cuál es el saldo actual?' },
  [AccountType.CreditCard]: { placeholder: '6.500.000', label: 'Cuánto debes a día de hoy?' },
  [AccountType.Debt]: { placeholder: '12.000.000', label: 'Cuánto debes a día de hoy?' },
  [AccountType.SavingsGoal]: { placeholder: '1.000.000', label: 'Cuánto llevas ahorrado?' },
};

export const QUOTA_FIELD_WORDING_MAP: Partial<Record<AccountType, { label: string, placeholder: string }>> = {
  [AccountType.CreditCard]: { placeholder: '21.400.000', label: 'Cuánto cupo tiene la tarjeta?' },
  [AccountType.Debt]: { placeholder: '50.000.000', label: 'Cuál es el valor total de la deuda?' },
  [AccountType.SavingsGoal]: { placeholder: '4.500.000', label: 'Cuánto quieres ahorrar?' },
};

export const LABEL_FIELD_WORDING_MAP: Record<AccountType, { label: string, placeholder: string }> = {
  [AccountType.Cash]: { placeholder: 'Billetera', label: 'Nombre' },
  [AccountType.Savings]: { placeholder: 'Cuenta de ahorros Bancolombia', label: 'Nombre' },
  [AccountType.CreditCard]: { placeholder: 'Tarjeta de crédito Davivienda', label: 'Nombre' },
  [AccountType.Debt]: { placeholder: 'Libranza Banco de Bogotá', label: 'Nombre' },
  [AccountType.SavingsGoal]: { placeholder: 'Ahorro para viaje', label: 'Nombre' },
};
