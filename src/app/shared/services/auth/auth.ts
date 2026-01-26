import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth as FireAuth, GoogleAuthProvider, signInWithPopup, signOut, user, } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Overlay } from '../overlay/overlay';
import { FireStore } from '../fire-store/fire-store';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _auth: FireAuth = inject(FireAuth);
  private _fireStore = inject(FireStore);
  private _provider = new GoogleAuthProvider();
  private _user = toSignal(user(this._auth), { initialValue: null });
  private _router = inject(Router);
  private _overlay = inject(Overlay);

  async login() {
    try {
      this._overlay.showLoader();
      const result = await signInWithPopup(this._auth, this._provider);
      if (result.user) {
        if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
          await this._fireStore.addNewUser(result.user);
        }
        this._overlay.hideLoader();
        await this._router.navigate(['home']);
      }
    } catch (error) {
      console.error('Log in error: ' + error);
      throw error;
    } finally {
      this._overlay.hideLoader();
    }
  }

  async logout() {
    try {
      this._overlay.showLoader();
      this._overlay.closeSidePanel();
      await signOut(this._auth);
      await this._router.navigate(['/']);
    } catch (error) {
      console.error('Log out error: ' + error);
      throw error;
    } finally {
      this._overlay.hideLoader();
    }
  }

  public getLoggedUser() {
    return this._user();
  }
}
