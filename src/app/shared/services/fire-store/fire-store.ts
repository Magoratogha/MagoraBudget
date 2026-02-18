import { effect, inject, Injectable, signal } from '@angular/core';
import { User } from "@angular/fire/auth";
import {
  collection,
  deleteDoc,
  disableNetwork,
  doc,
  enableNetwork,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';
import { Account } from '../../../accounts/models';
import { Transaction, TransactionType } from '../../../transactions/models';
import { UserSettings } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);
  private _userAccounts = signal<Account[]>([]);
  private _userTransactions = signal<Transaction[]>([]);
  private _userSettings = signal<UserSettings>({} as UserSettings);
  public isOnline = signal<boolean>(true);

  constructor() {
    effect(async () => {
      if (this.isOnline()) {
        await enableNetwork(this._db);
      } else {
        await disableNetwork(this._db);
      }
    })
  }

  public async addNewUser(user: User) {
    try {
      const data = {
        name: user.displayName,
        mail: user.email,
        provider: user.providerId,
        pictureUrl: user.photoURL || null,
      }
      await this._performOperation(() => setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USERS, user.uid), data));
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public getUserAccount(accountId: string) {
    return this._userAccounts().find(account => account.id === accountId) || null;
  }

  public getUserTransaction(transactionId: string) {
    return this._userTransactions().find(transaction => transaction.id === transactionId) || null;
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
      await this._performOperation(() => updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId), account));
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deleteAccount(accountId: string): Promise<void> {
    try {
      await this._performOperation(() => deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId)));
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

  public async editTransaction(transactionId: string, transactionToSave: Transaction, currentTransaction: Transaction): Promise<void> {
    try {
      this._cleanWhiteSpaces(transactionToSave);
      this._cleanWhiteSpaces(currentTransaction);
      await this._updateAccountsByTransaction(transactionToSave, currentTransaction);
      await this._performOperation(() => updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId), { ...transactionToSave }));
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
      await this._performOperation(() => deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId)));
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

  public async editUserSettings(settingsId: string, settings: UserSettings): Promise<void> {
    try {
      this._cleanWhiteSpaces(settings);
      await this._performOperation(() => updateDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS, settingsId), { ...settings }));
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public getUserAccounts() {
    return this._userAccounts.asReadonly();
  }

  public getUserTransactions() {
    return this._userTransactions.asReadonly();
  }

  public getUserSettings() {
    return this._userSettings.asReadonly();
  }

  public listenToUserAccounts(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS),
        where('ownerId', "==", userId),
        orderBy('type', 'asc'),
        orderBy('label', 'asc')
      );
      return onSnapshot(q, (querySnapshot) => {
        const accounts: Account[] = [];
        querySnapshot.forEach((doc) => {
          accounts.push({
            ...doc.data(),
            id: doc.id,
          } as Account);
        });
        this._userAccounts.set(accounts);
      });
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public listenToUserTransactions(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS),
        where('ownerId', "==", userId),
        orderBy('date', 'desc')
      );
      return onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({
            ...doc.data(),
            date: (doc.data()['date'] as Timestamp).toDate(),
            id: doc.id,
          } as Transaction);
        });
        this._userTransactions.set(transactions);
      });
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public listenToUserSettings(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS),
        where('ownerId', "==", userId)
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

  private _cleanWhiteSpaces(obj: any): void {
    Object.keys(obj).map(
      (k) => (obj[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k])
    );
  }

  private async _updateAccountsByTransaction(transactionToPerform: Transaction, previousTransaction?: Transaction) {
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
          })
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
