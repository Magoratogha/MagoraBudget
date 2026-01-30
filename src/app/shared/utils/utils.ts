import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function onlyNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = /^\d+$/.test(control.value);
    return isValid ? null : { onlyNumbers: { value: control.value } };
  };
}
