import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FireStore } from '../fire-store/fire-store';
import { Account as IAccount, AccountType } from '../../../accounts/models';
import { UserSettings } from '../../models';
import { Transaction as ITransaction, Transaction, TransactionType } from '../../../transactions/models';

@Injectable({
  providedIn: 'root',
})
export class Query {
  private _fireStore = inject(FireStore);
  private _today = signal(new Date());

  public userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();
  public userAccounts: Signal<IAccount[]> = this._fireStore.getUserAccounts();
  public userTransactions: Signal<Transaction[]> = this._fireStore.getUserTransactions();

  public globalBalance = computed(() => {
    return this.userAccounts().reduce((total, account) => total + account.balance, 0);
  });

  public availableBalance = computed(() => {
    return this.userAccounts().reduce((total, account) => {
      if (account.type === AccountType.Savings || account.type === AccountType.Cash) {
        return total + account.balance;
      } else {
        return total;
      }
    }, 0);
  });

  public availableExpensesAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.type !== AccountType.Debt);
  });

  public availableIncomesAccounts = computed(() => {
    return this.userAccounts();
  });

  public monthTransactions = computed<ITransaction[]>(() => {
    return this.userTransactions().filter(transaction =>
      transaction.date.getMonth() === this._today().getMonth() &&
      transaction.date.getFullYear() === this._today().getFullYear())
  });

  public monthIncomes = computed(() => {
    return this.monthTransactions().reduce((total, transaction) => {
      if (transaction.type === TransactionType.Income) {
        return total + transaction.amount;
      } else {
        return total;
      }
    }, 0);
  });

  public monthExpenses = computed(() => {
    return this.monthTransactions().reduce((total, transaction) => {
      if (transaction.type === TransactionType.Expense) {
        return total - transaction.amount;
      } else {
        return total;
      }
    }, 0);
  });

  public expensesPerAccountType: Signal<Partial<Record<AccountType, number>>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Expense) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (accountType !== null) {
          expenses[accountType] = (expenses[accountType] || 0) - transaction.amount;
          return expenses;
        }
        return expenses;
      } else {
        return expenses;
      }
    }, {} as Partial<Record<AccountType, number>>);
  });

  public incomesPerAccountType: Signal<Partial<Record<AccountType, number>>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Income) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (accountType !== null) {
          expenses[accountType] = (expenses[accountType] || 0) + transaction.amount;
          return expenses;
        }
        return expenses;
      } else {
        return expenses;
      }
    }, {} as Partial<Record<AccountType, number>>);
  });

  public updateCurrentDate(date: Date) {
    this._today.set(date);
  }

  private _getAccountTypeById(accountId: string): AccountType | null {
    const account = this._fireStore.getUserAccount(accountId);
    return account? account.type : null;
  }
}
