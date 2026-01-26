import { inject, Injectable } from '@angular/core';
import { User } from "@angular/fire/auth";
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Overlay } from '../overlay/overlay';
import { FIREBASE_COLLECTION_NAMES } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class FireStore {
  private _db = inject(Firestore);
  private _overlay = inject(Overlay)

  public async addNewUser(user: User) {
    await this._performDBOperation(async () => {
      try {
        await setDoc(doc(this._db, FIREBASE_COLLECTION_NAMES.USERS, user.uid), {
          name: user.displayName,
          mail: user.email,
          provider: user.providerId,
          pictureUrl: user.photoURL || null,
        });
      } catch (e) {
        throw e;
      }
    });
  }

  private async _performDBOperation(operation: () => Promise<void>) {
    try {
      this._overlay.showLoader();
      await operation();
    } catch (e) {
      console.error('DB operation error: ' + e);
    } finally {
      this._overlay.hideLoader();
    }
  }
}
