import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import {
  ACCOUNT_TYPE_INFO_MAP,
  BALANCE_FIELD_WORDING_MAP,
  LABEL_FIELD_WORDING_MAP,
  QUOTA_FIELD_WORDING_MAP
} from '../../constants';
import { Account, AccountType } from '../../models';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { onlyNumbersValidator, quotaMinValueValidator } from '../../../shared/utils';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { WARNING_MODAL_DELETE_WORDING } from '../../../shared/constants';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export class QuotaValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const formHasError = form?.hasError('quotaLessThanBalance');
    return !!((control && control.invalid || formHasError) && (control?.dirty || control?.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-edit-account',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    NgxMaskDirective,
    MatChip,
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
  private _destroyRef = inject(DestroyRef);
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  AccountType = AccountType;
  account = signal<Account | undefined>(this._bottomSheetData?.account);
  form = new FormGroup({
    label: new FormControl<string>('', [Validators.required]),
    type: new FormControl<AccountType>(AccountType.Cash, [Validators.required]),
    balance: new FormControl<number>(NaN, [Validators.required, Validators.min(0), onlyNumbersValidator()]),
    quota: new FormControl<number>(NaN, [Validators.min(0), onlyNumbersValidator()]),
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required])
  }, [quotaMinValueValidator()]);
  selectedAccountType = toSignal(this.form.controls.type.valueChanges, { initialValue: this.form.controls.type.value });
  labelPlaceholder = computed(() => {
    return LABEL_FIELD_WORDING_MAP[this.selectedAccountType()!];
  });
  balanceLabelAndPlaceholder = computed(() => {
    return BALANCE_FIELD_WORDING_MAP[this.selectedAccountType()!];
  });
  quotaLabelAndPlaceholder = computed(() => {
    return QUOTA_FIELD_WORDING_MAP[this.selectedAccountType()!];
  });
  quotaValueErrorStateMatcher = new QuotaValueErrorStateMatcher();

  constructor() {
    effect(() => {
      if (this.selectedAccountType() === AccountType.Savings || this.selectedAccountType() === AccountType.Cash) {
        this.form.controls.quota.removeValidators(Validators.required);
      } else {
        this.form.controls.quota.addValidators(Validators.required);
      }
      this.form.controls.quota.updateValueAndValidity();
      this.form.updateValueAndValidity();
    });
  }

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

  async saveAccount() {
    if (this.form.valid) {
      try {
        this._overlay.showLoader();
        const accountToSave: Account = { ...this.form.value } as unknown as Account;
        if (accountToSave.type === AccountType.CreditCard || accountToSave.type === AccountType.Debt) {
          accountToSave.balance = accountToSave.balance * (-1);
          accountToSave.quota = accountToSave.quota! * (-1);
        }
        if (accountToSave.type === AccountType.Cash || accountToSave.type === AccountType.Savings) {
          accountToSave.quota = NaN;
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

  async deleteAccount() {
    this._overlay.openModal(WARNING_MODAL_DELETE_WORDING.title, WARNING_MODAL_DELETE_WORDING.description)
      ?.pipe(take(1), takeUntilDestroyed(this._destroyRef))
      .subscribe(async (shouldDelete) => {
        if (shouldDelete) {
          try {
            this._overlay.showLoader();
            await this._fireStore.deleteAccount(this.account()!.id!);
          } catch (e) {
            console.error('Error deleting account: ', e);
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
}
