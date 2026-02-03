import { Component, computed, forwardRef, signal } from '@angular/core';
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
  value = signal<Date>(new Date());
  stringValue = computed(() => moment(this.value()).format('YYYY-MM-DD'))

  private _onChange: ((value: Date) => void) | undefined;
  onTouched: (() => void | undefined) | undefined;

  onValueChange(value: string) {
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
}
