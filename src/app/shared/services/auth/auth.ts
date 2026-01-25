import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth as FireAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _auth: FireAuth = inject(FireAuth);
  private _provider = new GoogleAuthProvider();
  private _user = toSignal(user(this._auth), { initialValue: null });

  async login() {
    const result = await signInWithPopup(this._auth, this._provider);
    return GoogleAuthProvider.credentialFromResult(result);
  }

  async logout() {
    try {
      await signOut(this._auth);
    } catch (error) {
      console.error('Sign out error: ' + error);
    }
  }

  public getLoggedUser() {
    return this._user();
  }
}
