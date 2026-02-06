import { Component, inject, Signal } from '@angular/core';
import { FireStore } from '../../../shared/services';
import { Transaction as ITransaction } from '../../models';
import { Transaction } from '../../components';

@Component({
  selector: 'app-transactions',
  imports: [
    Transaction
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private _fireStore = inject(FireStore);

  transactions: Signal<ITransaction[]> = this._fireStore.getUserTransactions();
}
