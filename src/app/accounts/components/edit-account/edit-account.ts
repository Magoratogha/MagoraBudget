import { Component, inject, input } from '@angular/core';
import { ACCOUNT_TYPE_INFO_MAP } from '../../constants';
import { NgClass } from '@angular/common';
import { Account, AccountType } from '../../models';
import { Auth } from '../../../shared/services';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-account',
  imports: [
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './edit-account.html',
  styleUrl: './edit-account.scss',
  host: {
    class: 'w-100'
  }
})
export class EditAccount {
  ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
  Object = Object;
  Number = Number;
  isNaN = isNaN;
  private _auth = inject(Auth)

  AccountType = AccountType;
  account = input<Account>();
  form = new FormGroup({
    id: new FormControl('', []),
    label: new FormControl('', [Validators.required]),
    type: new FormControl(AccountType.Savings, [Validators.required]),
    balance: new FormControl(0, [Validators.required]),
    quota: new FormControl(0, []),
    ownerId: new FormControl(this._auth.getLoggedUser()!.uid, [Validators.required])
  })

  changeAccountType(accountType: AccountType): void {
    this.form.get('type')?.setValue(accountType);
  }

}
