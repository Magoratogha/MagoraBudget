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
  private _userTransactionSortedIds: Signal<string[]> =
    this._fireStore.getUserTransactionSortedIds();
  private _userTransactionsById: Signal<Record<string, Transaction>> =
    this._fireStore.getUserTransactionsById();
  private _userAccountSortedIds: Signal<string[]> = this._fireStore.getUserAccountSortedIds();
  private _userAccountsById: Signal<Record<string, IAccount>> =
    this._fireStore.getUserAccountsById();
  private _userPendingsSortedIds: Signal<string[]> = this._fireStore.getUserPendingsSortedIds();
  private _userPendingsById: Signal<Record<string, Pending>> =
    this._fireStore.getUserPendingsById();

  public userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();

  public userTransactions = computed(() => {
    const sortedIds = this._userTransactionSortedIds();
    const entities = this._userTransactionsById();
    return sortedIds.map((id) => entities[id]);
  });

  public userAccounts = computed(() => {
    const sortedIds = this._userAccountSortedIds();
    const entities = this._userAccountsById();
    return sortedIds.map((id) => entities[id]);
  });

  public userPendings: Signal<Pending[]> = computed(() => {
    const sortedIds = this._userPendingsSortedIds();
    const entities = this._userPendingsById();
    return sortedIds.map((id) => entities[id]);
  });

  public budgetPreference: Signal<BudgetPreference> = this._fireStore.getUserBudgetPreference();
  public isDarkModeEnabled = signal<boolean>(true);

  public currentUserAccounts = computed(() =>
    this.userAccounts().filter((account) => !account.isDeleted),
  );

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

  public isPeriodStartAndEndDaySameMonth = computed(
    () => this.startDayOfPeriod().getMonth() === this.endDayOfPeriod().getMonth(),
  );

  public globalBalance = computed(() =>
    this.currentUserAccounts().reduce((total, account) => total + account.balance, 0),
  );

  public availableBalance = computed(() =>
    this.currentUserAccounts().reduce((total, account) => {
      return this._isAvailableAccountType(account.type) ? total + account.balance : total;
    }, 0),
  );

  public availableExpensesAccounts = computed(() =>
    this.currentUserAccounts().filter((account) => account.type !== AccountType.Debt),
  );

  public availableIncomesAccounts = computed(() => this.currentUserAccounts());

  public periodTransactions = computed<ITransaction[]>(() => {
    const sortedIds = this._userTransactionSortedIds();
    const entities = this._userTransactionsById();
    const startDate = this._normalizeDate(this.startDayOfPeriod());
    const endDate = this._normalizeDate(this.endDayOfPeriod());
    const result: Transaction[] = [];

    for (const id of sortedIds) {
      const transaction = entities[id];
      const date = this._normalizeDate(transaction.date);

      if (date < startDate) break;
      if (date <= endDate) result.push(transaction);
    }

    return result;
  });

  public pendingExpenses = computed(() =>
    this.userPendings().filter(
      (pending) =>
        !pending.isDone &&
        (pending.transactionType === TransactionType.Expense ||
          pending.transactionType === TransactionType.Transfer),
    ),
  );

  periodExpensesTransactions = computed(() =>
    this.periodTransactions().filter((transaction) => {
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
    }),
  );

  periodIncomesTransactions = computed(() =>
    this.periodTransactions().filter((transaction) => {
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
    }),
  );

  public periodIncomes = computed(() =>
    this.periodIncomesTransactions().reduce((total, transaction) => total + transaction.amount, 0),
  );

  public periodExpenses = computed(() =>
    this.periodExpensesTransactions().reduce((total, transaction) => total - transaction.amount, 0),
  );

  public periodExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() =>
    this.periodExpensesTransactions().reduce((expenses, transaction) => {
      const accountType = this._getAccountTypeById(transaction.originAccountId);
      if (expenses.has(accountType)) {
        expenses.set(accountType, expenses.get(accountType)! - transaction.amount);
      } else {
        expenses.set(accountType, -transaction.amount);
      }
      return expenses;
    }, new Map<AccountType, number>()),
  );

  public periodBudgetExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() =>
    this.periodExpensesTransactions().reduce((expenses, transaction) => {
      if (transaction.includedInBudget) {
        const accountType = this._getAccountTypeById(transaction.originAccountId);
        if (expenses.has(accountType)) {
          expenses.set(accountType, expenses.get(accountType)! - transaction.amount);
        } else {
          expenses.set(accountType, -transaction.amount);
        }
      }
      return expenses;
    }, new Map<AccountType, number>()),
  );

  public periodIncomesPerAccountType: Signal<Map<AccountType, number>> = computed(() =>
    this.periodIncomesTransactions().reduce((incomes, transaction) => {
      const accountType = this._getAccountTypeById(transaction.originAccountId);
      if (incomes.has(accountType)) {
        incomes.set(accountType, incomes.get(accountType)! + transaction.amount);
      } else {
        incomes.set(accountType, transaction.amount);
      }
      return incomes;
    }, new Map<AccountType, number>()),
  );

  public periodExpensesPerAccount: Signal<Map<Account, number>> = computed(() =>
    this.periodExpensesTransactions().reduce((expenses, transaction) => {
      const account = this._getAccountById(transaction.originAccountId);
      if (expenses.has(account)) {
        expenses.set(account, expenses.get(account)! - transaction.amount);
      } else {
        expenses.set(account, -transaction.amount);
      }
      return expenses;
    }, new Map<Account, number>()),
  );

  public periodIncomesPerAccount: Signal<Map<Account, number>> = computed(() =>
    this.periodIncomesTransactions().reduce((incomes, transaction) => {
      const account = this._getAccountById(transaction.originAccountId);
      if (incomes.has(account)) {
        incomes.set(account, incomes.get(account)! + transaction.amount);
      } else {
        incomes.set(account, transaction.amount);
      }
      return incomes;
    }, new Map<Account, number>()),
  );

  public pendingExpensesPerAccountType: Signal<Map<AccountType, number>> = computed(() =>
    this.pendingExpenses().reduce((expenses, pending) => {
      const accountType = this._getAccountTypeById(pending.originAccountId!);
      if (expenses.has(accountType)) {
        expenses.set(accountType, expenses.get(accountType)! - pending.amount);
      } else {
        expenses.set(accountType, -pending.amount);
      }
      return expenses;
    }, new Map<AccountType, number>()),
  );

  public updateCurrentDate(date: Date) {
    this._today.set(date);
  }

  public getCurrentDate() {
    return this._today();
  }

  private _getAccountTypeById(accountId: string): AccountType {
    return this._fireStore.getUserAccount(accountId).type;
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
