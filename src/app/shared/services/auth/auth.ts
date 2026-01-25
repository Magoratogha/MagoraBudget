import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth as FireAuth, GoogleAuthProvider, signInWithPopup, signOut, user, } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Overlay } from '../overlay/overlay';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _auth: FireAuth = inject(FireAuth);
  private _provider = new GoogleAuthProvider();
  private _user = toSignal(user(this._auth), { initialValue: null });
  private _router = inject(Router);
  private _overlay = inject(Overlay);

  async login() {
    try {
      const result = await signInWithPopup(this._auth, this._provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        await this._router.navigate(['home']);
      }
    } catch (error) {
      console.error('Log in error: ' + error);
    }
  }

  async logout() {
    try {
      this._overlay.closeSidePanel();
      await signOut(this._auth);
      await this._router.navigate(['/']);
    } catch (error) {
      console.error('Log out error: ' + error);
    }
  }

  public getLoggedUser() {
    return this._user();
  }
}
