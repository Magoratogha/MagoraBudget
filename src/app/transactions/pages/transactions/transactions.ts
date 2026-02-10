import { Component, computed, inject, signal, Signal, ViewChild } from '@angular/core';
import { FireStore } from '../../../shared/services';
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
    MatButtonModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  private _fireStore = inject(FireStore);

  date = signal(new Date());
  transactions: Signal<ITransaction[]> = this._fireStore.getUserTransactions();
  monthTransactions = computed<ITransaction[]>(() => {
    return this.transactions().filter(transaction =>
      transaction.date.getMonth() === this.date().getMonth() &&
      transaction.date.getFullYear() === this.date().getFullYear())
  });

  setDate(date: Date) {
    this.picker.close();
    this.date.set(date);
  }

  nextMonth() {
    if (this.date().getMonth() === 11) {
      this.date.set(new Date(this.date().getFullYear() + 1, 0));
      return;
    }
    this.date.set(new Date(this.date().getFullYear(), this.date().getMonth() + 1));
  }

  prevMonth() {
    if (this.date().getMonth() === 0) {
      this.date.set(new Date(this.date().getFullYear() - 1, 11));
      return;
    }
    this.date.set(new Date(this.date().getFullYear(), this.date().getMonth() - 1));
  }
}
