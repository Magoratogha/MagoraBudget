import { Component, inject, input } from '@angular/core';
import { ACCOUNT_TYPE_INFO_MAP } from '../../constants';
import { NgClass } from '@angular/common';
import { Account, AccountType } from '../../models';
import { Auth } from '../../../shared/services';
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
  private _auth = inject(Auth)

  AccountType = AccountType;
  account = input<Account>();
  form = new FormGroup({
    id: new FormControl('', []),
    label: new FormControl('', [Validators.required]),
    type: new FormControl(AccountType.Savings, [Validators.required]),
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

}
