import { Component, computed, DestroyRef, effect, inject, input, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Transaction, TransactionType } from '../../models';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import {
  getAccountTypeIcon,
  getTransactionTypeIcon,
  getTransactionTypeLabel,
  onlyNumbersValidator
} from '../../../shared/utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePicker, MoneyInput } from '../../../shared/components';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Account, AccountType } from '../../../accounts/models';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { WARNING_MODAL_DELETE_WORDING } from '../../../shared/constants';
import { take } from 'rxjs';
import { UserSettings } from '../../../shared/models';

@Component({
  selector: 'app-edit-transaction',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    DatePicker,
    MoneyInput,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
  ],
  host: { class: 'inner-bottom-sheet-component' },
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.scss',
})
export class EditTransaction implements OnInit {
  private _auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _overlay = inject(Overlay);
  private _destroyRef = inject(DestroyRef);
  userAccounts: Signal<Account[]> = this._fireStore.getUserAccounts();
  userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();

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
  availableOriginAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.type !== AccountType.Debt);
  });
  availableTargetAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.id !== this.selectedOriginAccountId());
  });

  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;

  constructor() {
    effect(() => {
      switch (this.selectedTransactionType()) {
        case TransactionType.Transfer:
          this.form.controls.targetAccountId.setValidators([Validators.required]);
          this.form.controls.originAccountId.setValue(this.userSettings().preferredExpensesAccountId || '');
          this.form.controls.targetAccountId.setValue(this.userSettings().preferredIncomesAccountId || '');
          if (this.form.controls.originAccountId.value === this.form.controls.targetAccountId.value) {
            this.form.controls.targetAccountId.setValue('');
          }
          break;
        case TransactionType.Income:
          this.form.controls.targetAccountId.setValidators([]);
          this.form.controls.originAccountId.setValue(this.userSettings().preferredIncomesAccountId || '');
          break;
        case TransactionType.Expense:
          this.form.controls.targetAccountId.setValidators([]);
          this.form.controls.originAccountId.setValue(this.userSettings().preferredExpensesAccountId || '');
          break;
      }
      this.form.controls.targetAccountId.updateValueAndValidity();
      this.form.updateValueAndValidity();
    });
  }

  ngOnInit() {

  }

  async save() {
    if (this.form.valid) {
      try {
        this._overlay.showLoader();
        const transactionToSave: Transaction = { ...this.form.value } as unknown as Transaction;
        if (transactionToSave.type !== TransactionType.Transfer) {
          transactionToSave.targetAccountId = '';
        }
        if (this.transaction()?.id) {
          await this._fireStore.editTransaction(this.transaction()!.id!, transactionToSave);
        } else {
          await this._fireStore.addTransaction(transactionToSave);
        }
      } catch (e) {
        console.error('Error saving transaction: ', e);
      } finally {
        this._overlay.hideLoader();
        this._overlay.closeBottomSheet(true);
      }
    }
  }

  delete() {
    this._overlay.openModal(WARNING_MODAL_DELETE_WORDING.title, WARNING_MODAL_DELETE_WORDING.description)
      ?.pipe(take(1), takeUntilDestroyed(this._destroyRef))
      .subscribe(async (shouldDelete) => {
        if (shouldDelete) {
          try {
            this._overlay.showLoader();
            await this._fireStore.deleteTransaction(this.transaction()!.id!);
          } catch (e) {
            console.error('Error deleting transaction: ', e);
          } finally {
            this._overlay.hideLoader();
            this._overlay.closeBottomSheet(true);
          }
        }
      });
  }

  cancel() {
    this._overlay.closeBottomSheet();
  }

  protected readonly getAccountTypeIcon = getAccountTypeIcon;
  protected readonly getTransactionTypeIcon = getTransactionTypeIcon;
  protected readonly getTransactionTypeLabel = getTransactionTypeLabel;
}
