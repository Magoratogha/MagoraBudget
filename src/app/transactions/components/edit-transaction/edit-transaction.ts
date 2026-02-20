import { Component, computed, DestroyRef, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Transaction, TransactionType } from '../../models';
import { Auth, FireStore, Overlay, Query } from '../../../shared/services';
import {
  getAccountTypeIcon,
  getAccountTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeLabel,
  onlyNumbersValidator
} from '../../../shared/utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePicker } from '../../../shared/components';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Account, AccountType } from '../../../accounts/models';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { WARNING_MODAL_DELETE_WORDING } from '../../../shared/constants';
import { take } from 'rxjs';
import { UserSettings } from '../../../shared/models';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatChipsModule } from '@angular/material/chips';
import { NgxMaskDirective } from 'ngx-mask';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-edit-transaction',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    DatePicker,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    NgxMaskDirective,
    CurrencyPipe,
    MatCardModule
  ],
  host: { class: 'inner-bottom-sheet-component' },
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.scss',
})
export class EditTransaction implements OnInit {
  private _auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _query = inject(Query);
  private _overlay = inject(Overlay);
  private _destroyRef = inject(DestroyRef);
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);
  private _amountDefaultValidations = [Validators.required, Validators.min(1), onlyNumbersValidator(false)]

  TransactionType = TransactionType;
  transaction = signal<Transaction | undefined>(this._bottomSheetData?.transaction);

  userAccounts: Signal<Account[]> = this._query.userAccounts;
  userSettings: Signal<UserSettings> = this._query.userSettings;

  form = new FormGroup({
    type: new FormControl<TransactionType>(TransactionType.Expense, [Validators.required]),
    amount: new FormControl<number>(0, this._amountDefaultValidations),
    date: new FormControl<Date>(new Date(), [Validators.required]),
    originAccountId: new FormControl<string>('', [Validators.required]),
    targetAccountId: new FormControl<string>(''),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  });

  selectedTransactionType = toSignal(this.form.controls.type.valueChanges, { initialValue: this.form.controls.type.value });
  selectedOriginAccountId = toSignal(this.form.controls.originAccountId.valueChanges, { initialValue: this.form.controls.originAccountId.value });
  selectedTargetAccountId = toSignal(this.form.controls.targetAccountId.valueChanges, { initialValue: this.form.controls.targetAccountId.value });

  availableOriginAccounts = computed(() => this.selectedTransactionType() === TransactionType.Income ? this.userAccounts() : this._query.availableExpensesAccounts());
  availableTargetAccounts = computed(() => this.userAccounts().filter((account) => account.id !== this.selectedOriginAccountId()));

  originAccountLabel = computed(() => {
    return this.selectedTransactionType() === TransactionType.Transfer ? 'De la cuenta' : 'Cuenta';
  })

  maxExpenseAmount = signal<number | null>(null);
  maxIncomeAmount = signal<number | null>(null);

  amountErrorLabel = computed(() => {
    const incomeLabel = ['A esa cuenta puedes enviar máximo', this.maxIncomeAmount()];
    const expenseLabel = ['En esa cuenta solo tienes', this.maxExpenseAmount()];
    switch (this.selectedTransactionType()) {
      case TransactionType.Transfer:
        const maxAmount = Math.min(
          this.maxExpenseAmount() ?? Infinity,
          this.maxIncomeAmount() ?? Infinity
        );
        if (maxAmount === this.maxIncomeAmount()) {
          return incomeLabel;
        } else {
          return expenseLabel;
        }
      case TransactionType.Income:
        return incomeLabel;
      case TransactionType.Expense:
        return expenseLabel;
      default:
        return ['', null];
    }
  })

  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;

  constructor() {
    effect(() => {
      switch (this.selectedTransactionType()) {
        case TransactionType.Transfer:
          this.form.controls.targetAccountId.setValidators([Validators.required]);
          this.form.controls.originAccountId.setValue(this.transaction()?.originAccountId || this.userSettings().preferredExpensesAccountId || '');
          this.form.controls.targetAccountId.setValue(this.transaction()?.targetAccountId || this.userSettings().preferredIncomesAccountId || '');
          if (this.form.controls.originAccountId.value === this.form.controls.targetAccountId.value) {
            this.form.controls.targetAccountId.setValue('');
          }
          break;
        case TransactionType.Income:
          this.form.controls.targetAccountId.setValidators([]);
          this.form.controls.originAccountId.setValue(this.transaction()?.originAccountId || this.userSettings().preferredIncomesAccountId || '');
          break;
        case TransactionType.Expense:
          this.form.controls.targetAccountId.setValidators([]);
          this.form.controls.originAccountId.setValue(this.transaction()?.originAccountId || this.userSettings().preferredExpensesAccountId || '');
          break;
      }
      this.form.controls.targetAccountId.updateValueAndValidity();
      this.form.updateValueAndValidity();
    });

    effect(() => {
      const originAccount = this.userAccounts().find(account => account.id === this.selectedOriginAccountId());
      const targetAccount = this.userAccounts().find(account => account.id === this.selectedTargetAccountId());
      const transactionType = this.selectedTransactionType();

      this.form.controls.amount.setValidators(this._amountDefaultValidations);
      this.maxIncomeAmount.set(null);
      this.maxExpenseAmount.set(null);

      switch (transactionType) {
        case TransactionType.Transfer:
          if (originAccount || (targetAccount && targetAccount.quota)) {
            if (originAccount) {
              this._setMaxExpenseAmount(originAccount);
            }
            if (targetAccount && targetAccount.quota) {
              this._setMaxIncomeAmount(targetAccount);
            }
            const maxAmount = Math.min(
              this.maxExpenseAmount() ?? Infinity,
              this.maxIncomeAmount() ?? Infinity
            );
            this.form.controls.amount.setValidators([...this._amountDefaultValidations, Validators.max(maxAmount)]);
          }
          break;
        case TransactionType.Income:
          if (originAccount && originAccount.quota) {
            this._setMaxIncomeAmount(originAccount);
            this.form.controls.amount.setValidators([...this._amountDefaultValidations, Validators.max(this.maxIncomeAmount() as number)]);
          }
          break;
        case TransactionType.Expense:
          if (originAccount) {
            this._setMaxExpenseAmount(originAccount);
            this.form.controls.amount.setValidators([...this._amountDefaultValidations, Validators.max(this.maxExpenseAmount() as number)]);
          }
          break;
      }
      this.form.controls.amount.updateValueAndValidity();
      this.form.updateValueAndValidity();
    })
  }

  private _setMaxExpenseAmount(account: Account): void {
    this.maxExpenseAmount.set(
      account.type === AccountType.CreditCard ?
        Math.abs(account.quota!) - Math.abs(account.balance)
        : account.balance
    );
  }

  private _setMaxIncomeAmount(account: Account): void {
    this.maxIncomeAmount.set(
      account.type === AccountType.SavingsGoal ?
        account.quota! - account.balance
        : Math.abs(account.balance)
    );
  }

  ngOnInit() {
    if (this.transaction()) {
      this.form.patchValue({
        amount: this.transaction()?.amount || 0,
        date: this.transaction()?.date || new Date(),
        originAccountId: this.transaction()?.originAccountId || this.userSettings().preferredExpensesAccountId || '',
        targetAccountId: this.transaction()?.targetAccountId || this.userSettings().preferredIncomesAccountId || '',
        ownerId: this.transaction()?.ownerId || this._auth.getLoggedUser()!.uid
      }, { emitEvent: false });

      this.form.controls.type.setValue(this.transaction()?.type || TransactionType.Expense);
    }
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
          await this._fireStore.editTransaction(this.transaction()!.id!, transactionToSave, this.transaction()!);
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
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
}
