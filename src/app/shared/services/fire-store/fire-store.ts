import { inject, Injectable, signal } from '@angular/core';
import { User } from "@angular/fire/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where
} from '@angular/fire/firestore';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';
import { Account } from '../../../accounts/models';
import { Transaction } from '../../../transactions/models';
import { UserSettings } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);
  private _userAccounts = signal<Account[]>([]);
  private _userTransactions = signal<Transaction[]>([]);
  private _userSettings = signal<UserSettings>({} as UserSettings);

  public async addNewUser(user: User) {
    try {
      await setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USERS, user.uid), {
        name: user.displayName,
        mail: user.email,
        provider: user.providerId,
        pictureUrl: user.photoURL || null,
      });
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public getUserAccount(accountId: string) {
    return this._userAccounts().find(account => account.id === accountId) || null;
  }

  public async addAccount(account: Account): Promise<string> {
    try {
      this._cleanWhiteSpaces(account);
      const docRef = await addDoc(
        collection(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS),
        account
      );
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editAccount(accountId: string, account: Account): Promise<void> {
    try {
      this._cleanWhiteSpaces(account);
      await setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId), account);
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deleteAccount(accountId: string): Promise<void> {
    try {
      await deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS, accountId));
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addTransaction(transaction: Transaction): Promise<string> {
    try {
      this._cleanWhiteSpaces(transaction);
      const docRef = await addDoc(
        collection(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS),
        transaction
      );
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editTransaction(transactionId: string, transaction: Transaction): Promise<void> {
    try {
      this._cleanWhiteSpaces(transaction);
      await setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId), transaction);
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await deleteDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.TRANSACTIONS, transactionId));
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async addUserSettings(settings: UserSettings): Promise<string> {
    try {
      this._cleanWhiteSpaces(settings);
      const docRef = await addDoc(
        collection(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS),
        settings
      );
      return docRef.id;
    } catch (e) {
      this._logError(e);
      throw e;
    }
  }

  public async editUserSettings(settingsId: string, settings: UserSettings): Promise<void> {
    try {
      this._cleanWhiteSpaces(settings);
      await setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USER_SETTINGS, settingsId), settings);
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
        orderBy('date', 'asc')
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

  private _logError(error: any) {
    console.error('FireStore error: ' + error);
  }
}
