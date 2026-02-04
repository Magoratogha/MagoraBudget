import { Component, computed, inject, input, output } from '@angular/core';
import { Account as IAccount, AccountType } from '../../models';
import { ACCOUNT_TYPE_INFO_MAP } from '../../constants';
import { CurrencyPipe, NgClass, PercentPipe } from '@angular/common';
import { EditAccount } from '../edit-account/edit-account';
import { Overlay } from '../../../shared/services';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-account',
  imports: [
    NgClass,
    CurrencyPipe,
    PercentPipe,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
  AccountType = AccountType;
  accountUpdated = output();
  private _overlay = inject(Overlay)

  account = input<IAccount>();
  balance = computed(() => {
    switch (this.account()?.type) {
      case AccountType.Debt:
      case AccountType.CreditCard:
        return Math.abs(this.account()!.balance as number)
      case AccountType.Cash:
      case AccountType.Savings:
      case AccountType.SavingsGoal:
      default:
        return this.account()!.balance as number;
    }
  });
  target = computed(() => {
    switch (this.account()?.type) {
      case AccountType.Debt:
        return 0;
      case AccountType.CreditCard:
        return Math.abs(this.account()!.quota as number);
      case AccountType.SavingsGoal:
        return this.account()!.quota as number;
      case AccountType.Cash:
      case AccountType.Savings:
      default:
        return null;
    }
  });
  quota = computed(() => {
    switch (this.account()?.type) {
      case AccountType.Debt:
        return Math.abs(this.account()!.quota as number);
      case AccountType.CreditCard:
      case AccountType.SavingsGoal:
        return 0;
      case AccountType.Cash:
      case AccountType.Savings:
      default:
        return null;
    }
  });
  balancePercent = computed(() => {
    switch (this.account()?.type) {
      case AccountType.Debt:
        return 1 - ((this.account()!.balance as number) / (this.account()!.quota as number));
      case AccountType.CreditCard:
      case AccountType.SavingsGoal:
        return (this.account()!.balance as number) / (this.account()!.quota as number);
      case AccountType.Cash:
      case AccountType.Savings:
      default:
        return null;
    }
  });
  parsedBalancePercent = computed(() => (this.balancePercent() || 0) * 100);

  edit() {
    this._overlay.openBottomSheet(EditAccount, { account: this.account() });
  }
}
