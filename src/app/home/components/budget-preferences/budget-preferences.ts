import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountType } from '../../../accounts/models';
import { getAccountTypeIcon, getAccountTypeLabel } from '../../../shared/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Auth, FireStore, Overlay } from '../../../shared/services';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BudgetPreference } from '../../models';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-budget-preferences',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './budget-preferences.html',
  styleUrl: './budget-preferences.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class BudgetPreferences implements OnInit {
  private _overlay = inject(Overlay);
  private _auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  protected readonly AccountType = AccountType;
  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;

  preference = signal<BudgetPreference | undefined>(this._bottomSheetData?.preference);

  validAccountTypes: AccountType[] = Object.keys(AccountType)
    .filter(type => !isNaN(Number(type)) && Number(type) !== AccountType.Debt)
    .map(type => Number(type) as AccountType);

  form = new FormGroup({
    ownerId: new FormControl<string>(this._auth.getLoggedUser()!.uid, [Validators.required]),
    budgets: new FormGroup({})
  });

  constructor() {
    for (const type of this.validAccountTypes) {
      this.form.controls.budgets.addControl(type.toString(), new FormGroup({
        enabled: new FormControl<boolean>(false, [Validators.required]),
        amount: new FormControl<number>(NaN, [Validators.min(0)])
      }));
    }
  }

  ngOnInit() {
    if (this.preference()) {
      this.form.patchValue({
        ownerId: this.preference()?.ownerId ?? this._auth.getLoggedUser()!.uid,
        budgets: this.preference()?.budgets ?? {}
      }, { emitEvent: false });
      for (const type of this.validAccountTypes) {
        const isEnabled = this.form.get(['budgets', type.toString(), 'enabled'])!.value;
        if (isEnabled) {
          this.form.get(['budgets', type.toString(), 'amount'])?.addValidators([Validators.required]);
        }
      }
    }
  }

  onToggleChange(type: string, isEnabled: boolean) {
    if (isEnabled) {
      this.form.get(['budgets', type, 'amount'])?.addValidators([Validators.required]);
    } else {
      this.form.get(['budgets', type, 'amount'])?.removeValidators([Validators.required]);
      this.form.get(['budgets', type, 'amount'])?.reset(NaN);
    }
    this.form.get(['budgets', type, 'amount'])?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  async save() {
    if (this.form.valid) {
      try {
        this._overlay.showLoader();
        const preferenceToSave: BudgetPreference = { ...this.form.value } as unknown as BudgetPreference;
        if (this.preference()?.id) {
          await this._fireStore.editBudgetPreferences(this.preference()!.id!, preferenceToSave);
        } else {
          await this._fireStore.addBudgetPreference(preferenceToSave);
        }
      } catch (e) {
        console.error('Error saving budget preference: ', e);
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
