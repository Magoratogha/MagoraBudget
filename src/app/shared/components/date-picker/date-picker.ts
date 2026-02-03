import { Component, computed, ElementRef, forwardRef, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-date-picker',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true
    }
  ],
  host: { style: 'width: 100%' },
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker implements ControlValueAccessor {
  @ViewChild('datePicker', { static: true }) datePicker!: ElementRef<HTMLInputElement>;
  value = signal<Date>(new Date());
  defaultValue = signal<Date>(new Date());
  stringValue = computed(() => moment(this.value()).format('YYYY-MM-DD'))

  private _onChange: ((value: Date) => void) | undefined;
  onTouched: (() => void | undefined) | undefined;

  onValueChange(value: string) {
    if (!value) {
      this.value.set(this.defaultValue());
      this._onChange!(this.value());
      this.datePicker.nativeElement.value = this.stringValue();
      return;
    }
    this.value.set(moment(value, 'YYYY-MM-DD').toDate())
    this._onChange!(this.value());
  }

  writeValue(value: Date): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  saveDefaultValue(value: string) {
    if (value) {
      this.defaultValue.set(moment(value, 'YYYY-MM-DD').toDate());
      return;
    }
    this.defaultValue.set(new Date());
  }
}
