import { AfterViewInit, Component, computed, ElementRef, forwardRef, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { AutoFocusDirective } from '../../directives';

@Component({
  selector: 'app-money-input',
  imports: [
    FormsModule,
    NgxMaskDirective,
    AutoFocusDirective
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyInput),
      multi: true
    }
  ],
  templateUrl: './money-input.html',
  styleUrl: './money-input.scss',
  host: { style: 'width: 100%' }
})
export class MoneyInput implements ControlValueAccessor, AfterViewInit {
  @ViewChild('textInput', { static: true }) textInput!: ElementRef<HTMLInputElement>;
  value = signal<number>(0);
  stringValue = computed(() => this.value.toString() || '');

  private _onChange: ((value: number) => void) | undefined;
  onTouched: (() => void | undefined) | undefined;

  ngAfterViewInit() {
  }

  onValueChange(value: string) {
    if (!value) {
      this.value.set(NaN);
    } else {
      this.value.set(Number(value.replaceAll(/[$.,]/g, '')));
    }
    this._onChange!(this.value());
  }

  writeValue(value: number): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: number) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
