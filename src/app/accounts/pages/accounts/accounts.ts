import { Component, inject, Signal } from '@angular/core';
import { Account, EditAccount } from '../../components';
import { Overlay, Query } from '../../../shared/services';
import { Account as IAccount } from '../../models';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-accounts',
  imports: [
    Account,
    CurrencyPipe,
    MatButtonModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts {
  private _overlay = inject(Overlay);
  private _query = inject(Query);

  accounts: Signal<IAccount[]> = this._query.userAccounts;
  globalBalance = this._query.globalBalance;
  availableBalance = this._query.availableBalance;

  addNewAccount() {
    this._overlay.openBottomSheet(EditAccount);
  }
}
