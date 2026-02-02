import { Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Transaction, TransactionType } from '../../models';
import { Auth } from '../../../shared/services';
import { TRANSACTION_TYPE_INFO_MAP } from '../../constants';
import { JsonPipe, NgClass } from '@angular/common';
import { onlyNumbersValidator } from '../../../shared/utils';
import { NgxMaskDirective } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePicker } from '../../../shared/components';

@Component({
  selector: 'app-edit-transaction',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgxMaskDirective,
    MatFormFieldModule,
    MatInputModule,
    DatePicker,
    JsonPipe
  ],
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.scss',
})
export class EditTransaction {
  TRANSACTION_TYPE_INFO_MAP = TRANSACTION_TYPE_INFO_MAP;
  private _auth = inject(Auth);

  TransactionType = TransactionType;
  transaction = input<Transaction>();
  form = new FormGroup({
    type: new FormControl<TransactionType>(TransactionType.Expense, [Validators.required]),
    amount: new FormControl<number>(0, [Validators.required, Validators.min(0), onlyNumbersValidator()]),
    date: new FormControl<Date>(new Date(), [Validators.required]),
    originAccountId: new FormControl<string>('', [Validators.required]),
    targetAccountId: new FormControl<string>(''),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  });
  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;

  changeAccountType(accountType: TransactionType): void {
    this.form.reset({
      type: accountType,
      amount: this.form.get('amount')?.value || 0,
      ownerId: this._auth.getLoggedUser()!.uid
    });
  }
}
