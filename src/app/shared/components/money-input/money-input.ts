import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

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
export class MoneyInput implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('textInput', { static: true }) textInput!: ElementRef<HTMLInputElement>;
  value = signal<number>(0);
  stringValue = computed(() => this.value.toString() || '');
  offCanvasRef = input<ElementRef>();

  ngAfterViewInit() {
    this.textInput.nativeElement.onclick = () => {
      this.textInput.nativeElement.focus({ preventScroll: true });
    };

    this.offCanvasRef()?.nativeElement.addEventListener('shown.bs.offcanvas', () => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      this.textInput.nativeElement.dispatchEvent(event);
    });
  }

  private _onChange: ((value: number) => void) | undefined;
  onTouched: (() => void | undefined) | undefined;

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

  ngOnDestroy(): void {
    //this.offCanvasRef()?.nativeElement.removeEventListener('shown.bs.offcanvas');
  }
}
