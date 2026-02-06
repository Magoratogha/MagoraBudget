import { Component, inject, Signal } from '@angular/core';
import { FireStore } from '../../../shared/services';
import { Transaction } from '../../models';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [
    JsonPipe
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private _fireStore = inject(FireStore);

  transactions: Signal<Transaction[]> = this._fireStore.getUserTransactions();
}
