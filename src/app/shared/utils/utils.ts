import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function onlyNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = /^\d+$/.test(control.value) || control.value === null || isNaN(control.value) || control.value === '';
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
