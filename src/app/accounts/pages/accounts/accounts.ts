import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Account } from '../../components';
import { Overlay } from '../../../shared/services';
import { Account as IAccount, AccountType } from '../../models';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-accounts',
  imports: [
    Account,
    CurrencyPipe
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts implements OnInit {
  accounts: WritableSignal<IAccount[]> = signal([]);
  globalBalance = computed(() => {
    return this.accounts().reduce((total, account) => total + account.balance, 0);
  });
  private _overlay = inject(Overlay)

  ngOnInit(): void {
    this._overlay.showLoader();
    this.accounts.set([
      { id: '1', label: 'Personal Account', type: AccountType.Savings, balance: 5000, ownerId: 'user1' },
      { id: '2', label: 'Credit Card', type: AccountType.CreditCard, balance: -3000, quota: 10000, ownerId: 'user1' },
      { id: '3', label: 'Car Loan', type: AccountType.Debt, balance: -15000, quota: 40000, ownerId: 'user1' },
      { id: '4', label: 'Vacation Fund', type: AccountType.SavingsGoal, balance: 3000, quota: 10000, ownerId: 'user1' },
    ]);
    this._overlay.hideLoader();
  }
}
