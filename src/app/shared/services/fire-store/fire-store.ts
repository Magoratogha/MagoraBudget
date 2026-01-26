import { inject, Injectable } from '@angular/core';
import { User } from "@angular/fire/auth";
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';

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

  private _logError(error: any) {
    console.error('FireStore error: ' + error);
  }
}
