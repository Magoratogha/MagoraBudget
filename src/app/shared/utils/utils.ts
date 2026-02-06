import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AccountType } from '../../accounts/models';
import { ACCOUNT_TYPE_INFO_MAP } from '../../accounts/constants';
import { TransactionType } from '../../transactions/models';
import { TRANSACTION_TYPE_INFO_MAP } from '../../transactions/constants';

export function onlyNumbersValidator(allowFalsyValues = true): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = /^\d+$/.test(control.value) || (allowFalsyValues ? (control.value === null || isNaN(control.value) || control.value === '') : false);
    return isValid ? null : { onlyNumbers: { value: control.value } };
  };
}

export function quotaMinValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const balance = control.get('balance');
    const quota = control.get('quota');
    const isValid = (quota?.value === null || isNaN(quota?.value) || quota?.value === '') || (quota && balance && quota?.value >= balance?.value);
    return isValid ? null : { quotaLessThanBalance: { value: control.value } };
  };
}

export function getAccountTypeIcon(accountType: AccountType): string {
  return ACCOUNT_TYPE_INFO_MAP[accountType].iconClass;
}

export function getAccountTypeLabel(accountType: AccountType): string {
  return ACCOUNT_TYPE_INFO_MAP[accountType].label;
}

export function getTransactionTypeIcon(transactionType: TransactionType): string {
  return TRANSACTION_TYPE_INFO_MAP[transactionType].iconClass;
}

export function getTransactionTypeLabel(transactionType: TransactionType): string {
  return TRANSACTION_TYPE_INFO_MAP[transactionType].label;
}
