import { Component, computed, ElementRef, forwardRef, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true
    }
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker implements ControlValueAccessor {
  @ViewChild('datePicker', { static: true }) inputRef!: ElementRef;
  value = signal<Date>(new Date());
  stringValue = computed(() => moment(this.value()).format('YYYY-MM-DD'))

  private _onChange: ((value: Date) => void) | undefined;
  private _onTouched: (() => void | undefined) | undefined;

  onValueChange(value: string) {
    this.value.set(moment(value, 'YYYY-MM-DD').toDate())
    this._onChange!(this.value());
  }

  openDatePicker() {
    this.inputRef.nativeElement.showPicker();
    this._onTouched!();
  }

  writeValue(value: Date): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
