import { Component, computed, inject, signal, Signal, ViewChild } from '@angular/core';
import { Overlay, Query } from '../../../shared/services';
import { Transaction as ITransaction } from '../../models';
import { Transaction } from '../../components';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-transactions',
  imports: [
    Transaction,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  private _query = inject(Query);

  overlay = inject(Overlay);
  date = signal(new Date());
  transactions: Signal<ITransaction[]> = this._query.userTransactions;

  monthTransactions = computed<ITransaction[]>(() => {
    return this.transactions().filter(transaction =>
      transaction.date.getMonth() === this.date().getMonth() &&
      transaction.date.getFullYear() === this.date().getFullYear())
  });

  transactionsPerDay = computed<Record<string, ITransaction[]>>(() => {
    const transactionsPerDay: Record<string, ITransaction[]> = {};
    this.monthTransactions().forEach(transaction => {
      const day = transaction.date.getDate().toString();
      if (!transactionsPerDay[day]) {
        transactionsPerDay[day] = [];
      }
      transactionsPerDay[day].push(transaction);
    });
    return transactionsPerDay;
  });

  setDate(date: Date) {
    this.picker.close();
    this.date.set(date);
  }

  nextMonth() {
    this.overlay.triggerVibration('TAP');
    if (this.date().getMonth() === 11) {
      this.date.set(new Date(this.date().getFullYear() + 1, 0));
      return;
    }
    this.date.set(new Date(this.date().getFullYear(), this.date().getMonth() + 1));
  }

  prevMonth() {
    this.overlay.triggerVibration('TAP');
    if (this.date().getMonth() === 0) {
      this.date.set(new Date(this.date().getFullYear() - 1, 11));
      return;
    }
    this.date.set(new Date(this.date().getFullYear(), this.date().getMonth() - 1));
  }

  getDateByDay(day: string): Date {
    return new Date(this.date().getFullYear(), this.date().getMonth(), Number(day));
  }

  protected readonly Object = Object;
}
