import { Component, computed, DestroyRef, inject, OnInit, Signal, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Pending } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { getAccountTypeIcon, getTransactionTypeIcon, onlyNumbersValidator } from '../../../shared/utils';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TransactionType } from '../../../transactions/models';
import { MatSelectModule } from '@angular/material/select';
import { Auth, FireStore, Overlay, Query } from '../../../shared/services';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Account } from '../../../accounts/models';
import { WARNING_MODAL_DELETE_WORDING } from '../../../shared/constants';
import { take } from 'rxjs';
import { UserSettings } from '../../../shared/models';

@Component({
  selector: 'app-edit-pending',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSelectModule
  ],
  templateUrl: './edit-pending.html',
  styleUrl: './edit-pending.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class EditPending implements OnInit {
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);
  private _query = inject(Query);
  private _auth = inject(Auth);
  private _overlay = inject(Overlay);
  private _fireStore = inject(FireStore);
  private _destroyRef = inject(DestroyRef);
  private _defaultAmountValidators = [Validators.required, onlyNumbersValidator(false)];

  pending = signal<Pending | undefined>(this._bottomSheetData?.pending);
  userAccounts: Signal<Account[]> = this._query.userAccounts;
  userSettings: Signal<UserSettings> = this._query.userSettings;

  form = new FormGroup({
    label: new FormControl<string>('', [Validators.required]),
    amount: new FormControl<number>(NaN, [...this._defaultAmountValidators, Validators.min(1)]),
    hasAssociatedTransaction: new FormControl<boolean>(true, [Validators.required]),
    isDone: new FormControl<boolean>(false, [Validators.required]),
    transactionType: new FormControl<TransactionType>(TransactionType.Expense, [Validators.required]),
    originAccountId: new FormControl<string>(this.userSettings().preferredExpensesAccountId || '', [Validators.required]),
    targetAccountId: new FormControl<string>(this.userSettings().preferredIncomesAccountId || ''),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  });

  selectedTransactionType = toSignal(this.form.controls.transactionType.valueChanges, { initialValue: this.form.controls.transactionType.value });
  selectedOriginAccountId = toSignal(this.form.controls.originAccountId.valueChanges, { initialValue: this.form.controls.originAccountId.value });
  isTransactionEnabled = toSignal(this.form.controls.hasAssociatedTransaction.valueChanges, { initialValue: this.form.controls.hasAssociatedTransaction.value });

  availableOriginAccounts = computed(() => this.selectedTransactionType() === TransactionType.Income ? this.userAccounts() : this._query.availableExpensesAccounts());
  availableTargetAccounts = computed(() => this.userAccounts().filter((account) => account.id !== this.selectedOriginAccountId()));

  originAccountLabel = computed(() => {
    return this.selectedTransactionType() === TransactionType.Transfer ? 'De la cuenta' : 'Cuenta';
  })

  protected readonly TransactionType = TransactionType;
  protected readonly Number = Number;
  protected readonly getTransactionTypeIcon = getTransactionTypeIcon;
  protected readonly Object = Object;
  protected readonly isNaN = isNaN;

  ngOnInit() {
    if (this.pending()) {
      this.form.patchValue({
        label: this.pending()?.label ?? '',
        amount: this.pending()?.amount ?? NaN,
        isDone: this.pending()?.isDone ?? false,
        hasAssociatedTransaction: this.pending()?.hasAssociatedTransaction ?? true,
        transactionType: this.pending()?.transactionType ?? TransactionType.Expense,
        originAccountId: this.pending()?.originAccountId || this.userSettings().preferredExpensesAccountId || '',
        targetAccountId: this.pending()?.targetAccountId || this.userSettings().preferredIncomesAccountId || '',
        ownerId: this.pending()?.ownerId ?? this._auth.getLoggedUser()!.uid,
      }, { emitEvent: true });
      this.onToggleChange(this.pending()?.hasAssociatedTransaction ?? true,)
      this.onTypeChange(this.pending()?.transactionType ?? TransactionType.Expense);
    }
  }

  onTypeChange(type: TransactionType) {
    switch (type) {
      case TransactionType.Transfer:
        this.form.get('targetAccountId')?.setValidators([Validators.required]);
        this.form.get('originAccountId')?.setValue(this.pending()?.originAccountId || this.userSettings().preferredExpensesAccountId || '');
        this.form.get('targetAccountId')?.setValue(this.pending()?.targetAccountId || this.userSettings().preferredIncomesAccountId || '');
        if (this.form.get('originAccountId')?.value === this.form.get('targetAccountId')?.value) {
          this.form.get('targetAccountId')?.setValue('');
        }
        break;
      case TransactionType.Income:
        this.form.get('targetAccountId')?.setValidators([]);
        this.form.get('originAccountId')?.setValue(this.pending()?.originAccountId || this.userSettings().preferredIncomesAccountId || '');
        break;
      case TransactionType.Expense:
        this.form.get('targetAccountId')?.setValidators([]);
        this.form.get('originAccountId')?.setValue(this.pending()?.originAccountId || this.userSettings().preferredExpensesAccountId || '');
        break;
    }
    this.form.get('targetAccountId')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  delete() {
    this._overlay.openModal(WARNING_MODAL_DELETE_WORDING.title, WARNING_MODAL_DELETE_WORDING.description)
      ?.pipe(take(1), takeUntilDestroyed(this._destroyRef))
      .subscribe(async (shouldDelete) => {
        if (shouldDelete) {
          try {
            this._overlay.showLoader();
            await this._fireStore.deletePending(this.pending()!.id!);
          } catch (e) {
            console.error('Error deleting pending: ', e);
          } finally {
            this._overlay.hideLoader();
            this._overlay.closeBottomSheet(true);
          }
        }
      });
  }

  async save() {
    if (this.form.valid) {
      try {
        this._overlay.showLoader();
        const pendingToSave: Pending = { ...this.form.value } as unknown as Pending;
        if (this.pending()?.id) {
          await this._fireStore.editPending(this.pending()!.id!, pendingToSave);
        } else {
          await this._fireStore.addPending(pendingToSave);
        }
      } catch (e) {
        console.error('Error saving pending: ', e);
      } finally {
        this._overlay.hideLoader();
        this._overlay.closeBottomSheet(true);
      }
    }
  }

  onToggleChange(isChecked: boolean) {
    if (isChecked) {
      this.form.get('amount')?.setValidators([...this._defaultAmountValidators, Validators.min(1)]);
    } else {
      this.form.get('amount')?.setValidators([...this._defaultAmountValidators, Validators.min(0)]);
    }

    this.form.get('amount')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  cancel() {
    this._overlay.closeBottomSheet();
  }

  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
