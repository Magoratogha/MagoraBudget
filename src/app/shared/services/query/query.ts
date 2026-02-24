import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FireStore } from '../fire-store/fire-store';
import { Account, Account as IAccount, AccountType } from '../../../accounts/models';
import { UserSettings } from '../../models';
import { Transaction as ITransaction, Transaction, TransactionType } from '../../../transactions/models';
import { DELETED_ACCOUNT_TEMPLATE } from '../../../accounts/constants';
import { BudgetPreference } from '../../../home/models';

@Injectable({
  providedIn: 'root',
})
export class Query {
  private _fireStore = inject(FireStore);
  private _today = signal(new Date());

  public userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();
  public budgetPreference: Signal<BudgetPreference> = this._fireStore.getBudgetPreference();
  public userAccounts: Signal<IAccount[]> = this._fireStore.getUserAccounts();
  public userTransactions: Signal<Transaction[]> = this._fireStore.getUserTransactions();
  public isDarkModeEnabled = signal<boolean>(true);

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

  public expensesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Expense) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (expenses.has(accountType)) {
          expenses.set(accountType, expenses.get(accountType)! - transaction.amount);
        } else {
          expenses.set(accountType, -transaction.amount);
        }
        return expenses;
      } else {
        return expenses;
      }
    }, new Map<AccountType, number>());
  });

  public expensesPerAccount: Signal<Map<Account, number>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Expense) {
        const account = this._getAccountById(transaction.originAccountId);
        if (expenses.has(account)) {
          expenses.set(account, expenses.get(account)! - transaction.amount);
        } else {
          expenses.set(account, -transaction.amount);
        }
        return expenses;
      } else {
        return expenses;
      }
    }, new Map<Account, number>());
  });

  public incomesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.monthTransactions().reduce((incomes, transaction) => {
      if (transaction.type === TransactionType.Income) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (incomes.has(accountType)) {
          incomes.set(accountType, incomes.get(accountType)! + transaction.amount);
        } else {
          incomes.set(accountType, transaction.amount);
        }
        return incomes;
      } else {
        return incomes;
      }
    }, new Map<AccountType, number>());
  });

  public incomesPerAccount: Signal<Map<Account, number>> = computed(() => {
    return this.monthTransactions().reduce((incomes, transaction) => {
      if (transaction.type === TransactionType.Income) {
        const account = this._getAccountById(transaction.originAccountId);
        if (incomes.has(account)) {
          incomes.set(account, incomes.get(account)! + transaction.amount);
        } else {
          incomes.set(account, transaction.amount);
        }
        return incomes;
      } else {
        return incomes;
      }
    }, new Map<Account, number>());
  });

  public updateCurrentDate(date: Date) {
    this._today.set(date);
  }

  public getCurrentDate() {
    return this._today();
  }

  private _getAccountTypeById(accountId: string): AccountType {
    const account = this._fireStore.getUserAccount(accountId);
    return account ? account.type : AccountType.Deleted;
  }

  private _getAccountById(accountId: string): Account {
    return this._fireStore.getUserAccount(accountId) || DELETED_ACCOUNT_TEMPLATE;
  }
}
