import { Component, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-date-picker',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker {
  @ViewChild('datePicker', { static: true }) inputRef!: ElementRef;
  value = input(new Date());
  inputValue = signal<string>(this.dateToString(this.value()));
  valueChanged = output<Date>();

  constructor() {
    effect(() => {
      this.valueChanged.emit(this.stringToDate(this.inputValue()));
    })
  }

  stringToDate(date: string): Date {
    return moment(date, 'YYYY-MM-DD').toDate();
  }

  dateToString(date: Date) {
    return moment(date).format('YYYY-MM-DD');
  }

  openDatePicker() {
    this.inputRef.nativeElement.showPicker();
  }
}
