import { Component, computed, inject, Signal } from '@angular/core';
import { Overlay, Query } from '../../../shared/services';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { Account, AccountType } from '../../../accounts/models';
import { getAccountTypeIcon, getAccountTypeLabel } from '../../../shared/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BudgetPreferences } from '../../components';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, CurrencyPipe, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private _query = inject(Query);
  private _overlay = inject(Overlay);
  availableBalance = this._query.availableBalance;
  monthIncomes = this._query.monthIncomes;
  monthExpenses = this._query.monthExpenses;
  expensesPerAccountType: Signal<[AccountType, number][]> = computed(() => {
    return [...this._query.expensesPerAccountType().entries()].sort((a, b) => a[1] - b[1]);
  });
  expensesPerAccount: Signal<[Account, number][]> = computed(() => {
    return [...this._query.expensesPerAccount().entries()].sort((a, b) => a[1] - b[1]);
  });
  incomesPerAccountType: Signal<[AccountType, number][]> = computed(() => {
    return [...this._query.incomesPerAccountType().entries()].sort((a, b) => b[1] - a[1]);
  });
  incomesPerAccount: Signal<[Account, number][]> = computed(() => {
    return [...this._query.incomesPerAccount().entries()].sort((a, b) => b[1] - a[1]);
  });
  protected readonly Object = Object;
  protected readonly Number = Number;
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;
  protected readonly AccountType = AccountType;

  openBudgetPreferences() {
    this._overlay.openBottomSheet(BudgetPreferences);
  }
}
