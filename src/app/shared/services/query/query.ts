import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { FireStore } from '../fire-store/fire-store';
import { Account, Account as IAccount, AccountType } from '../../../accounts/models';
import { UserSettings } from '../../models';
import { Transaction as ITransaction, Transaction, TransactionType } from '../../../transactions/models';
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

  public currentUserAccounts = computed(() => {
    return this.userAccounts().filter((account) => !account.isDeleted);
  });

  public startDayOfPeriod = computed(() => {
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

  public endDayOfPeriod = computed(() => {
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

  public isPeriodStartAndEndDaySameMonth = computed(() => {
    const startDay = this.startDayOfPeriod();
    const endDay = this.endDayOfPeriod();
    return startDay.getMonth() === endDay.getMonth();
  });

  public globalBalance = computed(() => {
    return this.currentUserAccounts().reduce((total, account) => total + account.balance, 0);
  });

  public availableBalance = computed(() => {
    return this.currentUserAccounts().reduce((total, account) => {
      return this._isAvailableAccountType(account.type) ? total + account.balance : total;
    }, 0);
  });

  public availableExpensesAccounts = computed(() => {
    return this.currentUserAccounts().filter((account) => account.type !== AccountType.Debt);
  });

  public availableIncomesAccounts = computed(() => {
    return this.currentUserAccounts();
  });

  public periodTransactions = computed<ITransaction[]>(() => {
    return this.userTransactions().filter((transaction) => {
      const startDate = this.startDayOfPeriod();
      const endDate = this.endDayOfPeriod();
      const date = transaction.date;

      const d = this._normalizeDate(date);
      const s = this._normalizeDate(startDate);
      const e = this._normalizeDate(endDate);

      return d >= s && d <= e;
    });
  });

  public pendingExpenses = computed(() => {
    return this.userPendings().filter(
      (pending) =>
        !pending.isDone &&
        (pending.transactionType === TransactionType.Expense ||
          pending.transactionType === TransactionType.Transfer),
    );
  });

  periodExpensesTransactions = computed(() => {
    return this.periodTransactions().filter((transaction) => {
      const originAccountType = this._getAccountTypeById(transaction.originAccountId);
      const targetAccountType = transaction.targetAccountId
        ? this._getAccountTypeById(transaction.targetAccountId)
        : undefined;
      return (
        transaction.type === TransactionType.Expense ||
        (transaction.type === TransactionType.Transfer &&
          ((this._isAvailableAccountType(originAccountType) &&
            !this._isAvailableAccountType(targetAccountType)) ||
            (!this._isAvailableAccountType(originAccountType) &&
              this._isAvailableAccountType(targetAccountType))))
      );
    });
  });

  periodIncomesTransactions = computed(() => {
    return this.periodTransactions().filter((transaction) => {
      const originAccountType = this._getAccountTypeById(transaction.originAccountId);
      const targetAccountType = transaction.targetAccountId
        ? this._getAccountTypeById(transaction.targetAccountId)
        : undefined;
      return (
        transaction.type === TransactionType.Income ||
        (transaction.type === TransactionType.Transfer &&
          !this._isAvailableAccountType(originAccountType) &&
          this._isAvailableAccountType(targetAccountType))
      );
    });
  });

  public periodIncomes = computed(() => {
    return this.periodIncomesTransactions().reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );
  });

  public periodExpenses = computed(() => {
    return this.periodExpensesTransactions().reduce(
      (total, transaction) => total - transaction.amount,
      0,
    );
  });

  public periodExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.periodExpensesTransactions().reduce((expenses, transaction) => {
      const accountType = this._getAccountTypeById(transaction.originAccountId);
      if (expenses.has(accountType)) {
        expenses.set(accountType, expenses.get(accountType)! - transaction.amount);
      } else {
        expenses.set(accountType, -transaction.amount);
      }
      return expenses;
    }, new Map<AccountType, number>());
  });

  public periodBudgetExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.periodExpensesTransactions().reduce((expenses, transaction) => {
      if (transaction.includedInBudget) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (expenses.has(accountType)) {
          expenses.set(accountType, expenses.get(accountType)! - transaction.amount);
        } else {
          expenses.set(accountType, -transaction.amount);
        }
      }
      return expenses;
    }, new Map<AccountType, number>());
  });

  public periodIncomesPerAccountType: Signal<Map<AccountType, number>> = computed(() => {
    return this.periodIncomesTransactions().reduce((incomes, transaction) => {
      const accountType = this._getAccountTypeById(transaction.originAccountId);
      if (incomes.has(accountType)) {
        incomes.set(accountType, incomes.get(accountType)! + transaction.amount);
      } else {
        incomes.set(accountType, transaction.amount);
      }
      return incomes;
    }, new Map<AccountType, number>());
  });

  public periodExpensesPerAccount: Signal<Map<Account, number>> = computed(() => {
    return this.periodExpensesTransactions().reduce((expenses, transaction) => {
      const account = this._getAccountById(transaction.originAccountId);
      if (expenses.has(account)) {
        expenses.set(account, expenses.get(account)! - transaction.amount);
      } else {
        expenses.set(account, -transaction.amount);
      }
      return expenses;
    }, new Map<Account, number>());
  });

  public periodIncomesPerAccount: Signal<Map<Account, number>> = computed(() => {
    return this.periodIncomesTransactions().reduce((incomes, transaction) => {
      const account = this._getAccountById(transaction.originAccountId);
      if (incomes.has(account)) {
        incomes.set(account, incomes.get(account)! + transaction.amount);
      } else {
        incomes.set(account, transaction.amount);
      }
      return incomes;
    }, new Map<Account, number>());
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

  public updateCurrentDate(date: Date) {
    this._today.set(date);
  }

  public getCurrentDate() {
    return this._today();
  }

  private _getAccountTypeById(accountId: string): AccountType {
    const account = this._fireStore.getUserAccount(accountId);
    return account.type;
  }

  private _getAccountById(accountId: string): Account {
    return this._fireStore.getUserAccount(accountId);
  }

  private _normalizeDate(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  private _isAvailableAccountType(accountType?: AccountType): boolean {
    return accountType === AccountType.Savings || accountType === AccountType.Cash;
  }
}
