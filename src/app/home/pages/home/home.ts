import { Component, inject, Signal } from '@angular/core';
import { Query } from '../../../shared/services';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { AccountType } from '../../../accounts/models';
import { getAccountTypeIcon, getAccountTypeLabel } from '../../../shared/utils';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, CurrencyPipe, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private _query = inject(Query);
  availableBalance = this._query.availableBalance;
  monthIncomes = this._query.monthIncomes;
  monthExpenses = this._query.monthExpenses;
  expensesPerAccountType: Signal<Partial<Record<AccountType, number>>> = this._query.expensesPerAccountType;
  incomesPerAccountType: Signal<Partial<Record<AccountType, number>>> = this._query.incomesPerAccountType;
  protected readonly Object = Object;
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
  protected readonly Number = Number;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
