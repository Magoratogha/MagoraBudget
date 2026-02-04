import { Component, computed, inject, Signal } from '@angular/core';
import { Account, EditAccount } from '../../components';
import { FireStore, Overlay } from '../../../shared/services';
import { Account as IAccount, AccountType } from '../../models';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-accounts',
  imports: [
    Account,
    CurrencyPipe,
    NgClass,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts {
  private _overlay = inject(Overlay);
  private _fireStore = inject(FireStore);

  accounts: Signal<IAccount[]> = this._fireStore.getUserAccounts();
  globalBalance = computed(() => {
    return this.accounts().reduce((total, account) => total + account.balance, 0);
  });
  availableBalance = computed(() => {
    return this.accounts().reduce((total, account) => {
      if (account.type === AccountType.Savings || account.type === AccountType.Cash) {
        return total + account.balance;
      } else {
        return total;
      }
    }, 0);
  });

  addNewAccount() {
    this._overlay.openBottomSheet(EditAccount);
  }
}
