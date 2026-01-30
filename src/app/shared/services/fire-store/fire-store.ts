import { inject, Injectable } from '@angular/core';
import { User } from "@angular/fire/auth";
import { addDoc, collection, doc, Firestore, getDocs, orderBy, query, setDoc, where } from '@angular/fire/firestore';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';
import { Account } from '../../../accounts/models';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);

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

  public async getUserAccounts(userId: string) {
    try {
      const q = query(
        collection(this._db, FIREBASE_COLLECTION_NAMES.ACCOUNTS),
        where('ownerId', "==", userId),
        orderBy('type', 'asc'),
        orderBy('label', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
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
