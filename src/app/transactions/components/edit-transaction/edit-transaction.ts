import { Component, computed, effect, ElementRef, inject, input, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Transaction, TransactionType } from '../../models';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import { TRANSACTION_TYPE_INFO_MAP } from '../../constants';
import { NgClass } from '@angular/common';
import { onlyNumbersValidator } from '../../../shared/utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePicker, MoneyInput } from '../../../shared/components';
import { toSignal } from '@angular/core/rxjs-interop';
import { Account, AccountType } from '../../../accounts/models';

@Component({
  selector: 'app-edit-transaction',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    DatePicker,
    MoneyInput,
  ],
  host: { class: 'inner-bottom-sheet-component' },
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.scss',
})
export class EditTransaction implements OnInit {
  TRANSACTION_TYPE_INFO_MAP = TRANSACTION_TYPE_INFO_MAP;
  private _auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _overlay = inject(Overlay);

  TransactionType = TransactionType;
  transaction = input<Transaction>();
  form = new FormGroup({
    type: new FormControl<TransactionType>(TransactionType.Expense, [Validators.required]),
    amount: new FormControl<number>(0, [Validators.required, Validators.min(1), onlyNumbersValidator(false)]),
    date: new FormControl<Date>(new Date(), [Validators.required]),
    originAccountId: new FormControl<string>('', [Validators.required]),
    targetAccountId: new FormControl<string>(''),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  });
  selectedTransactionType = toSignal(this.form.controls.type.valueChanges, { initialValue: this.form.controls.type.value });
  selectedOriginAccountId = toSignal(this.form.controls.originAccountId.valueChanges, { initialValue: this.form.controls.originAccountId.value });
  userAccounts: Signal<Account[]> = this._fireStore.getUserAccounts();
  availableOriginAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.type !== AccountType.Debt);
  });
  availableTargetAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.id !== this.selectedOriginAccountId());
  });
  offCanvasRef = input<ElementRef>();

  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;

  constructor() {
    effect(() => {
      if (this.selectedTransactionType() !== TransactionType.Transfer) {
        this.form.controls.targetAccountId.removeValidators(Validators.required);
      } else {
        this.form.controls.targetAccountId.addValidators(Validators.required);
      }
      if (this.selectedOriginAccountId() === this.form.controls.targetAccountId.value) {
        this.form.controls.targetAccountId.setValue('');
      }
      this.form.controls.targetAccountId.updateValueAndValidity();
      this.form.updateValueAndValidity();
    });
  }

  ngOnInit() {

  }

  changeAccountType(accountType: TransactionType): void {
    this.form.reset({
      type: accountType,
      amount: this.form.get('amount')?.value || 0,
      date: this.form.get('date')?.value || new Date(),
      originAccountId: this.form.get('originAccountId')?.value || '',
      targetAccountId: this.form.get('targetAccountId')?.value || '',
      ownerId: this._auth.getLoggedUser()!.uid
    });
  }

  save() {
    this._overlay.closeBottomSheet();
  }

  delete() {
    this._overlay.closeBottomSheet();
  }

  cancel() {
    this._overlay.closeBottomSheet();
  }
}
