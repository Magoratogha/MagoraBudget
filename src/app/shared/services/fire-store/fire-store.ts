import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
  collection,
  deleteDoc,
  disableNetwork,
  doc,
  DocumentChange,
  enableNetwork,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Account } from '../../../accounts/models';
import { BudgetPreference } from '../../../home/models';
import { Pending } from '../../../pending/models';
import { Transaction, TransactionType } from '../../../transactions/models';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';
import { UserSettings } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);
  private _userAccountsById = signal<Record<string, Account>>({});
  private _userAccountSortedIds = signal<string[]>([]);
  private _userTransactionsById = signal<Record<string, Transaction>>({});
  private _userTransactionSortedIds = signal<string[]>([]);
  private _userPendingsById = signal<Record<string, Pending>>({});
  private _userPendingsSortedIds = signal<string[]>([]);
  private _userSettings = signal<UserSettings>({} as UserSettings);
  private _userBudgetPreference = signal<BudgetPreference>({} as BudgetPreference);
  private _unsubscribeFunctions: Unsubscribe[] = [];

  public isOnline = signal<boolean>(true);

  constructor() {
    effect(async () => {
      if (this.isOnline()) {
        await enableNetwork(this._db);
      } else {
        await disableNetwork(this._db);
      }
    });
  }

  public initListeners(userId: string): void {
    this._unsubscribeFunctions.push(
      this._listenToUserAccounts(userId),
      this._listenToUserTransactions(userId),
      this._listenToUserSettings(userId),
      this._listenToUserBudgetPreference(userId),
      this._listenToUserPendings(userId),
    );
  }

  public cleanListeners(): void {
    this._unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    this._unsubscribeFunctions = [];
  }

  public async addNewUser(user: User) {
    try {
      const data = {
        name: user.displayName,
        mail: user.email,
        provider: user.providerId,
        pictureUrl: user.photoURL || null,
      };
      await this._performOperation(() =>
        setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USERS, user.uid), data),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public getUserAccount(accountId: string) {
    return this._userAccountsById()[accountId]!;
  }

  public getUserTransaction(transactionId: string) {
    return this._userTransactionsById()[transactionId] || null;
  }

  public async addAccount(account: Account): Promise<string> {
    try {
      this._cleanWhiteSpaces(account);
      const docRef = doc(collection(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS));
      await this._performOperation(() => setDoc(docRef, account));
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editAccount(accountId: string, account: Partial<Account>): Promise<void> {
    try {
      this._cleanWhiteSpaces(account);
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId), account),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deleteAccount(accountId: string): Promise<void> {
    try {
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId), {
          isDeleted: true,
        }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addTransaction(transaction: Transaction): Promise<string> {
    try {
      this._cleanWhiteSpaces(transaction);
      await this._updateAccountsByTransaction(transaction);
      const docRef = doc(collection(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS));
      await this._performOperation(() => setDoc(docRef, transaction));
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editTransaction(
    transactionId: string,
    transactionToSave: Transaction,
    currentTransaction: Transaction,
  ): Promise<void> {
    try {
      this._cleanWhiteSpaces(transactionToSave);
      this._cleanWhiteSpaces(currentTransaction);
      await this._updateAccountsByTransaction(transactionToSave, currentTransaction);
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId), {
          ...transactionToSave,
        }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactionToDelete = this.getUserTransaction(transactionId)!;
      this._cleanWhiteSpaces(transactionToDelete);
      await this._rollbackTransaction(transactionToDelete);
      await this._performOperation(() =>
        deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId)),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addUserSettings(settings: UserSettings): Promise<string> {
    try {
      this._cleanWhiteSpaces(settings);
      const docRef = doc(collection(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS));
      await this._performOperation(() => setDoc(docRef, settings));
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addBudgetPreference(preference: BudgetPreference): Promise<string> {
    try {
      this._cleanWhiteSpaces(preference);
      const docRef = doc(collection(this._db, FIREBASE_COLLECTION_NAMES.BUDGET_PREFERENCES));
      await this._performOperation(() => setDoc(docRef, preference));
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editBudgetPreferences(
    preferenceId: string,
    preference: BudgetPreference,
  ): Promise<void> {
    try {
      this._cleanWhiteSpaces(preference);
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.BUDGET_PREFERENCES, preferenceId), {
          ...preference,
        }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addPending(pending: Pending): Promise<string> {
    try {
      this._cleanWhiteSpaces(pending);
      const docRef = doc(collection(this._db, FIREBASE_COLLECTION_NAMES.PENDINGS));
      await this._performOperation(() => setDoc(docRef, pending));
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editPending(pendingId: string, pending: Pending): Promise<void> {
    try {
      this._cleanWhiteSpaces(pending);
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.PENDINGS, pendingId), { ...pending }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async setPendingCompletion(pending: Pending, isDone: boolean): Promise<void> {
    try {
      const dataToUpdate: Partial<Pending> = { isDone };
      if (isDone) {
        const completionDate: Date = new Date();
        if (pending.hasAssociatedTransaction) {
          const transaction: Transaction = {
            type: pending.transactionType!,
            amount: pending.amount,
            date: completionDate,
            originAccountId: pending.originAccountId!,
            targetAccountId: pending.targetAccountId,
            description: pending.label,
            ownerId: pending.ownerId,
            includedInBudget: true,
          };
          await this.addTransaction(transaction);
        }
        dataToUpdate.lastCompletionDate = completionDate;
      }
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.PENDINGS, pending.id!), {
          ...dataToUpdate,
        }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deletePending(pendingId: string): Promise<void> {
    try {
      await this._performOperation(() =>
        deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.PENDINGS, pendingId)),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editUserSettings(settingsId: string, settings: UserSettings): Promise<void> {
    try {
      this._cleanWhiteSpaces(settings);
      await this._performOperation(() =>
        updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS, settingsId), {
          ...settings,
        }),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public getUserAccountsById() {
    return this._userAccountsById.asReadonly();
  }

  public getUserAccountSortedIds() {
    return this._userAccountSortedIds.asReadonly();
  }

  public getUserTransactionsById() {
    return this._userTransactionsById.asReadonly();
  }

  public getUserTransactionSortedIds() {
    return this._userTransactionSortedIds.asReadonly();
  }

  public getUserSettings() {
    return this._userSettings.asReadonly();
  }

  public getUserBudgetPreference() {
    return this._userBudgetPreference.asReadonly();
  }

  public getUserPendingsById() {
    return this._userPendingsById.asReadonly();
  }

  public getUserPendingsSortedIds() {
    return this._userPendingsSortedIds.asReadonly();
  }

  private _updateListenedDoc<T>(
    parseFn: (doc: QueryDocumentSnapshot) => T,
    byIdSignal: WritableSignal<Record<string, T>>,
    sortedIdsSignal: WritableSignal<string[]>,
    changes: DocumentChange[],
  ) {
    const entities = { ...byIdSignal() };
    const ids = [...sortedIdsSignal()];

    for (const change of changes) {
      const entity = parseFn(change.doc);

      switch (change.type) {
        case 'added':
          entities[change.doc.id] = entity;
          ids.splice(change.newIndex, 0, change.doc.id);
          break;
        case 'removed':
          delete entities[change.doc.id];
          ids.splice(change.oldIndex, 1);
          break;
        case 'modified':
          entities[change.doc.id] = entity;
          if (change.oldIndex !== change.newIndex) {
            ids.splice(change.oldIndex, 1);
            ids.splice(change.newIndex, 0, change.doc.id);
          }
          break;
      }
    }

    byIdSignal.set(entities);
    sortedIdsSignal.set(ids);
  }

  private _parseAccount(doc: QueryDocumentSnapshot): Account {
    return {
      ...(doc.data() as Account),
      id: doc.id,
    };
  }

  private _parseTransaction(doc: QueryDocumentSnapshot): Transaction {
    return {
      ...(doc.data() as Transaction),
      date: (doc.data()['date'] as Timestamp).toDate(),
      id: doc.id,
    };
  }

  private _parsePending(doc: QueryDocumentSnapshot): Pending {
    return {
      ...(doc.data() as Pending),
      lastCompletionDate: doc.data()['lastCompletionDate']
        ? (doc.data()['lastCompletionDate'] as Timestamp).toDate()
        : undefined,
      id: doc.id,
    };
  }

  private _listenToUserAccounts(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS),
        where('ownerId', '==', userId),
        orderBy('type', 'asc'),
        orderBy('label', 'asc'),
      );
      return onSnapshot(q, (snapshot) =>
        this._updateListenedDoc(
          this._parseAccount,
          this._userAccountsById,
          this._userAccountSortedIds,
          snapshot.docChanges(),
        ),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  private _listenToUserTransactions(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS),
        where('ownerId', '==', userId),
        orderBy('date', 'desc'),
      );
      return onSnapshot(q, (snapshot) =>
        this._updateListenedDoc(
          this._parseTransaction,
          this._userTransactionsById,
          this._userTransactionSortedIds,
          snapshot.docChanges(),
        ),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  private _listenToUserPendings(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.PENDINGS),
        where('ownerId', '==', userId),
        orderBy('isDone', 'asc'),
        orderBy('label', 'asc'),
      );
      return onSnapshot(q, (snapshot) =>
        this._updateListenedDoc(
          this._parsePending,
          this._userPendingsById,
          this._userPendingsSortedIds,
          snapshot.docChanges(),
        ),
      );
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  private _listenToUserSettings(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS),
        where('ownerId', '==', userId),
      );
      return onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this._userSettings.set({
            ...doc.data(),
            id: doc.id,
          } as UserSettings);
        });
      });
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  private _listenToUserBudgetPreference(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.BUDGET_PREFERENCES),
        where('ownerId', '==', userId),
      );
      return onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this._userBudgetPreference.set({
            ...doc.data(),
            id: doc.id,
          } as BudgetPreference);
        });
      });
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  private _cleanWhiteSpaces(obj: any): void {
    Object.keys(obj).map((k) => (obj[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k]));
  }

  private async _updateAccountsByTransaction(
    transactionToPerform: Transaction,
    previousTransaction?: Transaction,
  ) {
    await this._performTransaction(transactionToPerform);
    if (previousTransaction) {
      await this._rollbackTransaction(previousTransaction);
    }
  }

  private async _performTransaction(transaction: Transaction) {
    const originAccount = this.getUserAccount(transaction.originAccountId)!;
    switch (transaction.type) {
      case TransactionType.Income:
        await this.editAccount(originAccount.id!, {
          balance: originAccount.balance + transaction.amount,
        });
        break;
      case TransactionType.Expense:
        await this.editAccount(originAccount.id!, {
          balance: originAccount.balance - transaction.amount,
        });
        break;
      case TransactionType.Transfer:
        const targetAccount = this.getUserAccount(transaction.targetAccountId!)!;
        await Promise.all([
          this.editAccount(originAccount.id!, {
            balance: originAccount.balance - transaction.amount,
          }),
          this.editAccount(targetAccount.id!, {
            balance: targetAccount.balance + transaction.amount,
          }),
        ]);
        break;
    }
  }

  private async _performOperation(operation: Function) {
    try {
      if (this.isOnline()) {
        await operation();
      } else {
        operation();
      }
    } catch (e) {
      throw e;
    }
  }

  private async _rollbackTransaction(transaction: Transaction) {
    await this._performTransaction({ ...transaction, amount: transaction.amount * -1 });
  }

  private _logError(error: any) {
    console.error('FireStore error: ' + error);
  }
}
