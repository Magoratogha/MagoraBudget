import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Pending } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { getAccountTypeIcon, getTransactionTypeIcon } from '../../../shared/utils';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TransactionType } from '../../../transactions/models';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Query } from '../../../shared/services';

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
    MatOption,
    MatSelect
  ],
  templateUrl: './edit-pending.html',
  styleUrl: './edit-pending.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class EditPending {
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);
  private _query = inject(Query);

  pending = signal<Pending | undefined>(this._bottomSheetData?.pending);
  availableOriginAccounts = computed(() => this._query.availableExpensesAccounts());

  protected readonly TransactionType = TransactionType;
  protected readonly Number = Number;
  protected readonly getTransactionTypeIcon = getTransactionTypeIcon;
  protected readonly Object = Object;
  protected readonly isNaN = isNaN;

  delete() {
  }

  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
