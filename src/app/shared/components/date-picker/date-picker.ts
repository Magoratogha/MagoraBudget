import { Component, forwardRef, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-date-picker',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    DatePipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true
    },
    provideNativeDateAdapter()
  ],
  host: { style: 'width: 100%' },
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker implements ControlValueAccessor {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  value = signal<Date>(new Date());

  private _onChange: ((value: Date) => void) | undefined;
  private _onTouched: (() => void | undefined) | undefined;

  writeValue(value: Date): void {
    this.value.set(value);
    this._onChange?.(value);
  }

  registerOnChange(fn: (value: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  openPicker() {
    this.picker.open();
    this._onTouched?.();
  }
}
