import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { focusAndOpenKeyboard } from '../../utils';

@Component({
  selector: 'app-money-input',
  imports: [
    FormsModule,
    NgxMaskDirective
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

  private _renderer = inject(Renderer2);

  private _onChange: ((value: number) => void) | undefined;
  onTouched: (() => void | undefined) | undefined;

  ngAfterViewInit() {
    focusAndOpenKeyboard(this.textInput.nativeElement, 1000);
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
