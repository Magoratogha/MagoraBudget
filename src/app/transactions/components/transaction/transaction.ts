import { Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FireStore, Overlay } from '../../../shared/services';
import { Transaction as ITransaction, TransactionType } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { getAccountTypeIcon } from '../../../shared/utils';
import { Account } from '../../../accounts/models';
import { CurrencyPipe } from '@angular/common';
import { EditTransaction } from '../edit-transaction/edit-transaction';

@Component({
  selector: 'app-transaction',
  imports: [
    MatCardModule,
    MatIconModule,
    CurrencyPipe,
  ],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
  host: {
    style: 'display: block;'
  }
})
export class Transaction {
  private _overlay = inject(Overlay);
  private _fireStore = inject(FireStore);

  transaction = input<ITransaction>();
  protected readonly TransactionType = TransactionType;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;

  balanceLabelPrefix = computed(() => {
    switch (this.transaction()?.type) {
        case TransactionType.Expense:
          return '-' ;
        case TransactionType.Income:
          return '+';
        case TransactionType.Transfer:
        default:
          return '';
    }
  });

  hasDeletedAccount = computed(() => {
    switch (this.transaction()?.type) {
      case TransactionType.Transfer:
        return this.getAccountDetails(this.transaction()!.originAccountId).isDeleted
          || this.getAccountDetails(this.transaction()!.targetAccountId!).isDeleted;
      default:
        return this.getAccountDetails(this.transaction()!.originAccountId).isDeleted;
    }
  });

  getAccountDetails(accountId: string): Account {
    return this._fireStore.getUserAccount(accountId);
  }

  edit() {
    if (!this.hasDeletedAccount()) {
      this._overlay.openBottomSheet(EditTransaction, { transaction: this.transaction() });
    }
  }
}
