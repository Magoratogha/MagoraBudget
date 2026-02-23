import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountType } from '../../../accounts/models';
import { getAccountTypeIcon, getAccountTypeLabel } from '../../../shared/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Overlay } from '../../../shared/services';

@Component({
  selector: 'app-budget-preferences',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButton
  ],
  templateUrl: './budget-preferences.html',
  styleUrl: './budget-preferences.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class BudgetPreferences {
  private _overlay = inject(Overlay);
  protected readonly AccountType = AccountType;
  protected readonly Object = Object;
  protected readonly isNaN = isNaN;
  protected readonly Number = Number;
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
  protected readonly getAccountTypeIcon = getAccountTypeIcon;

  save() {
    this._overlay.closeBottomSheet();
  }

  cancel() {
    this._overlay.closeBottomSheet();
  }
}
