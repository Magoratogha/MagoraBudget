import { Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FireStore, Overlay } from '../../../shared/services';
import { Transaction as ITransaction, TransactionType } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { getAccountTypeIcon, getTransactionTypeLabel } from '../../../shared/utils';
import { Account } from '../../../accounts/models';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { EditTransaction } from '../edit-transaction/edit-transaction';

@Component({
  selector: 'app-transaction',
  imports: [
    MatCardModule,
    MatIconModule,
    CurrencyPipe,
    MatChipsModule,
    NgTemplateOutlet,
  ],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
})
export class Transaction {
  private _overlay = inject(Overlay);
  private _fireStore = inject(FireStore);

  transaction = input<ITransaction>();
  protected readonly TransactionType = TransactionType;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;
  protected readonly getTransactionTypeLabel = getTransactionTypeLabel;

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
        return !this.getAccountDetails(this.transaction()!.originAccountId)
          || !this.getAccountDetails(this.transaction()!.targetAccountId!);
      default:
        return !this.getAccountDetails(this.transaction()!.originAccountId);
    }
  });

  getAccountDetails(accountId: string): Account | null {
    return this._fireStore.getUserAccount(accountId);
  }

  edit() {
    if (!this.hasDeletedAccount()) {
      this._overlay.openBottomSheet(EditTransaction, { transaction: this.transaction() });
    }
  }
}
