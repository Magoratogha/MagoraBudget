import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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

export function focusAndOpenKeyboard(el: any, timeout: any) {
  if (!timeout) {
    timeout = 100;
  }
  if (el) {
    // Align temp input element approx. to be where the input element is
    var __tempEl__ = document.createElement("input");
    __tempEl__.style.position = "absolute";
    __tempEl__.style.top = el.offsetTop + 7 + "px";
    __tempEl__.style.left = el.offsetLeft + "px";
    __tempEl__.style.height = '0';
    __tempEl__.style.opacity = '0';
    // Put this temp element as a child of the page <body> and focus on it
    document.body.appendChild(__tempEl__);
    __tempEl__.focus();

    // The keyboard is open. Now do a delayed focus on the target element
    setTimeout(function () {
      el.focus();
      el.click();
      // Remove the temp element
      document.body.removeChild(__tempEl__);
    }, timeout);
  }
}
