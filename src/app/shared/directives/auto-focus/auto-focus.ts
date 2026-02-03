import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective {

  constructor(private elementRef: ElementRef) {

    // Create non-visible temporary input element and focus it
    const tmpElement = document.createElement('input');

    setTimeout(() => {
      tmpElement.style.width = '0';
      tmpElement.style.height = '0';
      tmpElement.style.margin = '0';
      tmpElement.style.padding = '0';
      tmpElement.style.border = '0';
      tmpElement.style.opacity = '0';
      document.body.appendChild(tmpElement);
      tmpElement.focus();
    }, 1000);


    setTimeout(() => {
      // Focus the main (input) element, thus opening iOS keyboard
      this.elementRef.nativeElement.focus();
      document.body.removeChild(tmpElement);
    }, 2000);
  }
}
