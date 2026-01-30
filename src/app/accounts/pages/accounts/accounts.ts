import { Component, computed, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Account, EditAccount } from '../../components';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import { Account as IAccount } from '../../models';
import { CurrencyPipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-accounts',
  imports: [
    Account,
    CurrencyPipe,
    NgClass
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts implements OnInit {
  accounts: WritableSignal<IAccount[]> = signal([]);
  globalBalance = computed(() => {
    return this.accounts().reduce((total, account) => total + account.balance, 0);
  });
  private _overlay = inject(Overlay);
  private _fireStore = inject(FireStore);
  private _auth = inject(Auth);
  private _destroyRef = inject(DestroyRef);

  async ngOnInit(): Promise<void> {
    try {
      this._overlay.showLoader();
      const accounts = await this._fireStore.getUserAccounts(this._auth.getLoggedUser()!.uid)
      this.accounts.set(accounts);
    } catch (e) {
      console.error('Error loading accounts: ' + e);
    } finally {
      this._overlay.hideLoader();
    }
  }

  addNewAccount() {
    this._overlay.openBottomSheet(EditAccount)?.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(async (shouldFetchData) => {
        if (shouldFetchData) {
          await this.ngOnInit();
        }
      });
  }
}
