import { Component, computed, DestroyRef, inject, input, output } from '@angular/core';
import { Account as IAccount, AccountType } from '../../models';
import { ACCOUNT_TYPE_INFO_MAP } from '../../constants';
import { CurrencyPipe, NgClass, PercentPipe } from '@angular/common';
import { EditAccount } from '../edit-account/edit-account';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay } from '../../../shared/services';

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
  ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
  AccountType = AccountType;
  accountUpdated = output();
  private _overlay = inject(Overlay)
  private _destroyRef = inject(DestroyRef);

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
      return this.account()!.quota;
    }
    if (this.account()?.type === AccountType.SavingsGoal) {
      return 0
    }
    return null;
  });
  balancePercent = computed(() => {
    if (this.account()?.type === AccountType.CreditCard || this.account()?.type === AccountType.Debt) {
      const temp = (this.account()!.balance as number) / (this.account()!.quota as number);
      if (temp > 1) {
        return 0;
      }
      return 1 - temp;
    }
    if (this.account()?.type === AccountType.SavingsGoal) {
      return (this.account()!.balance as number) / (this.account()!.quota as number);
    }
    return null;
  });
  parsedBalancePercent = computed(() => (this.balancePercent() || 0) * 100);

  edit() {
    this._overlay.openBottomSheet(EditAccount, { account: this.account() })
      ?.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((shouldFetchData) => {
        if (shouldFetchData) {
          this.accountUpdated.emit();
        }
      });
  }
}
