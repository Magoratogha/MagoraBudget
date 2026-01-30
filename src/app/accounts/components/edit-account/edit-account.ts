import { Component, inject, input } from '@angular/core';
import { ACCOUNT_TYPE_INFO_MAP } from '../../constants';
import { NgClass } from '@angular/common';
import { Account, AccountType } from '../../models';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { onlyNumbersValidator } from '../../../shared/utils';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-edit-account',
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgxMaskDirective
  ],
  templateUrl: './edit-account.html',
  styleUrl: './edit-account.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class EditAccount {
  ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
  Object = Object;
  Number = Number;
  isNaN = isNaN;
  private _auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _overlay = inject(Overlay);

  AccountType = AccountType;
  account = input<Account>();
  form = new FormGroup({
    label: new FormControl('', [Validators.required]),
    type: new FormControl(AccountType.Cash, [Validators.required]),
    balance: new FormControl(null, [Validators.required, Validators.min(0), onlyNumbersValidator()]),
    quota: new FormControl(null, [Validators.min(0), onlyNumbersValidator()]),
    ownerId: new FormControl(this._auth.getLoggedUser()!.uid, [Validators.required])
  })

  changeAccountType(accountType: AccountType): void {
    this.form.reset({
      type: accountType,
      ownerId: this._auth.getLoggedUser()!.uid
    });
  }

  get labelPlaceholder(): string {
    switch (this.form.controls.type.value) {
      case AccountType.Cash:
        return 'Billetera';
      case AccountType.Savings:
        return 'Cuenta de ahorros Bancolombia';
      case AccountType.CreditCard:
        return 'Tarjeta de crédito Davivienda';
      case AccountType.Debt:
        return 'Libranza Banco de Bogotá';
      case AccountType.SavingsGoal:
        return 'Ahorro para viaje';
      default:
        return '';
    }
  }

  async saveAccount() {
    if (this.form.valid) {
      try {
        this._overlay.showLoader();
        const accountToSave: Account = { ...this.form.value } as unknown as Account;
        if (accountToSave.type === AccountType.CreditCard || accountToSave.type === AccountType.Debt) {
          accountToSave.balance = accountToSave.balance * (-1);
          accountToSave.quota = accountToSave.quota! * (-1);
        }
        await this._fireStore.addAccount(accountToSave);
      } catch (e) {
        console.error('Error saving account: ', e);
      } finally {
        this._overlay.hideLoader();
        this._overlay.closeBottomSheet(true);
      }
    }
  }
}
