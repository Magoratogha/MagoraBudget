import { Component, inject, input, OnInit } from '@angular/core';
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
export class EditAccount implements OnInit {
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
    label: new FormControl<string>('', [Validators.required]),
    type: new FormControl<AccountType>(AccountType.Cash, [Validators.required]),
    balance: new FormControl<number>(NaN, [Validators.required, Validators.min(0), onlyNumbersValidator()]),
    quota: new FormControl<number>(NaN, [Validators.min(0), onlyNumbersValidator()]),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  })

  ngOnInit(): void {
    if (this.account()) {
      this.form.setValue({
        label: this.account()?.label || '',
        type: this.account()?.type || AccountType.Cash,
        balance: this.account()?.balance ? Math.abs(this.account()!.balance) : NaN,
        quota: this.account()?.quota ? Math.abs(this.account()!.quota as number) : NaN,
        ownerId: this.account()?.ownerId || this._auth.getLoggedUser()!.uid
      });
    }
  }

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
        if (this.account()?.id) {
          await this._fireStore.editAccount(this.account()!.id!, accountToSave);
        } else {
          await this._fireStore.addAccount(accountToSave);
        }
      } catch (e) {
        console.error('Error saving account: ', e);
      } finally {
        this._overlay.hideLoader();
        this._overlay.closeBottomSheet(true);
      }
    }
  }

  cancel() {
    this._overlay.closeBottomSheet();
  }
}
