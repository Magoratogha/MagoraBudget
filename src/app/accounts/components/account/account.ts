import { Component, computed, input } from '@angular/core';
import { Account as IAccount, AccountType } from '../../models';
import { ACCOUNT_TYPE_ICON_MAP } from '../../constants';
import { CurrencyPipe, NgClass, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-account',
  imports: [
    NgClass,
    CurrencyPipe,
    PercentPipe
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  ACCOUNT_TYPE_ICON_MAP = ACCOUNT_TYPE_ICON_MAP;
  AccountType = AccountType;

  account = input<IAccount>();
  target = computed(() => {
    if (this.account()?.type === AccountType.CreditCard || this.account()?.type === AccountType.Debt) {
      return 0;
    }
    if (this.account()?.type === AccountType.SavingsGoal) {
      return this.account()!.quota as number;
    }
    return null;
  });
  quota = computed(() => {
    if (this.account()?.type === AccountType.CreditCard || this.account()?.type === AccountType.Debt) {
      return (this.account()!.quota as number) * -1;
    }
    if (this.account()?.type === AccountType.SavingsGoal) {
      return 0
    }
    return null;
  });
  balancePercent = computed(() => {
    if (this.account()?.type === AccountType.CreditCard || this.account()?.type === AccountType.Debt) {
      return 1 - Math.abs((this.account()!.balance as number) / (this.account()!.quota as number));
    }
    if (this.account()?.type === AccountType.SavingsGoal) {
      return (this.account()!.balance as number) / (this.account()!.quota as number);
    }
    return null;
  });
  parsedBalancePercent = computed(() => (this.balancePercent() || 0) * 100);
}
