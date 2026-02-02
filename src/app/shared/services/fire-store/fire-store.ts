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
  where
} from '@angular/fire/firestore';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';
import { Account } from '../../../accounts/models';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);
  private _userAccounts = signal<Account[]>([]);

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

  public getUserAccounts() {
    return this._userAccounts.asReadonly();
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
            id: doc.id,
            ...doc.data()
          } as Account);
        });
        this._userAccounts.set(accounts);
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
