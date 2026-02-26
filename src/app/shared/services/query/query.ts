import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FireStore } from '../fire-store/fire-store';
import { Account, Account as IAccount, AccountType } from '../../../accounts/models';
import { UserSettings } from '../../models';
import { Transaction as ITransaction, Transaction, TransactionType } from '../../../transactions/models';
import { DELETED_ACCOUNT_TEMPLATE } from '../../../accounts/constants';
import { BudgetPreference } from '../../../home/models';
import { Pending } from '../../../pending/models';

@Injectable({
  providedIn: 'root',
})
export class Query {
  private _fireStore = inject(FireStore);
  private _today = signal(new Date());

  public userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();
  public budgetPreference: Signal<BudgetPreference> = this._fireStore.getUserBudgetPreference();
  public userAccounts: Signal<IAccount[]> = this._fireStore.getUserAccounts();
  public userTransactions: Signal<Transaction[]> = this._fireStore.getUserTransactions();
  public userPendings: Signal<Pending[]> = this._fireStore.getUserPendings();
  public isDarkModeEnabled = signal<boolean>(true);

  public startDayOfMonth = computed(() => {
    const startDay = this.userSettings().startDayOfMonth ?? 1;
    const today = this._today();

    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();

    const targetMonth = currentDay >= startDay ? month : month - 1;
    const lastDayOfTargetMonth = new Date(year, targetMonth + 1, 0).getDate();

    if (startDay > lastDayOfTargetMonth) {
      return new Date(year, month, 1);
    }

    return new Date(year, targetMonth, startDay);
  });

  public endDayOfMonth = computed(() => {
    const startDay = this.userSettings().startDayOfMonth ?? 1;
    const today = this._today();

    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();

    const lastDay = new Date(year, month + 1, 0).getDate();
    const clampedStart = Math.min(startDay, lastDay);
    const useLastDay = startDay > lastDay;

    const targetMonth = currentDay >= clampedStart ? month + 1 : month;
    const day = useLastDay ? clampedStart : clampedStart - 1;

    return new Date(year, targetMonth, day);
  });

  public isStartAndEndDaySameMonth = computed(() => {
    const startDay = this.startDayOfMonth();
    const endDay = this.endDayOfMonth();
    return startDay.getMonth() === endDay.getMonth();
  });

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
    return this.userTransactions().filter(transaction => {
      const startDate = this.startDayOfMonth();
      const endDate = this.endDayOfMonth();
      const date = transaction.date;

      const d = this._normalizeDate(date);
      const s = this._normalizeDate(startDate);
      const e = this._normalizeDate(endDate);

      return d >= s && d <= e;
    })
  });

  public monthIncomes = computed(() => {
    return this.monthTransactions().reduce((total, transaction) => {
      if (transaction.type === TransactionType.Income || transaction.type === TransactionType.Transfer) {
        return total + transaction.amount;
      } else {
        return total;
      }
    }, 0);
  });

  public monthExpenses = computed(() => {
    return this.monthTransactions().reduce((total, transaction) => {
      if (transaction.type === TransactionType.Expense || transaction.type === TransactionType.Transfer) {
        return total - transaction.amount;
      } else {
        return total;
      }
    }, 0);
  });

  public pendingExpenses = computed(() => {
    return this.userPendings().filter((pending) => !pending.isDone && (pending.transactionType === TransactionType.Expense || pending.transactionType === TransactionType.Transfer));
  });

  public expensesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Expense || transaction.type === TransactionType.Transfer) {
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

  public pendingExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.pendingExpenses().reduce((expenses, pending) => {
      const accountType = this._getAccountTypeById(pending.originAccountId!);
      if (expenses.has(accountType)) {
        expenses.set(accountType, expenses.get(accountType)! - pending.amount);
      } else {
        expenses.set(accountType, -pending.amount);
      }
      return expenses;
    }, new Map<AccountType, number>());
  });

  public expensesPerAccount: Signal<Map<Account, number>> = computed(() => {
    return this.monthTransactions().reduce((expenses, transaction) => {
      if (transaction.type === TransactionType.Expense || transaction.type === TransactionType.Transfer) {
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
      if (transaction.type === TransactionType.Income || transaction.type === TransactionType.Transfer) {
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
      if (transaction.type === TransactionType.Income || transaction.type === TransactionType.Transfer) {
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

  private _normalizeDate(date: Date): number {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  }
}
