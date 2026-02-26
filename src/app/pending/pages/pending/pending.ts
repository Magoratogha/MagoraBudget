import { Component, computed, inject, QueryList, Signal, ViewChildren } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FireStore, Overlay, Query } from '../../../shared/services';
import { EditPending } from '../../components';
import { Pending as IPending } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionType } from '../../../transactions/models';
import { Account, AccountType } from '../../../accounts/models';
import { WARNING_MODAL_PENDING_ACCOUNT_WORDING, WARNING_MODAL_PENDING_AMOUNT_WORDING } from '../../../shared/constants';
import { getAccountTypeIcon, getAccountTypeLabel, getTransactionTypeIcon } from '../../../shared/utils';

@Component({
  selector: 'app-pending',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './pending.html',
  styleUrl: './pending.scss',
})
export class Pending {
  @ViewChildren(MatCheckbox) checkboxes!: QueryList<MatCheckbox>;

  private _overlay = inject(Overlay);
  private _query = inject(Query);
  private _fireStore = inject(FireStore);

  pendings: Signal<IPending[]> = this._query.userPendings;
  pendingExpensesPerAccountType: Signal<[AccountType, number][]> = computed(() => {
    return [...this._query.pendingExpensesPerAccountType().entries()].sort((a, b) => a[1] - b[1]);
  });

  async onCheckboxChange(pending: IPending, isDone: boolean, checkboxIndex: number) {
    const validationResults = this._validateCheckboxChange(pending, isDone);
    if (validationResults.valid) {
      try {
        this._overlay.showLoader();
        await this._fireStore.setPendingCompletion(pending, isDone);
      } catch (e) {
        this._rollbackCheckboxToggle(checkboxIndex);
        console.error('Error saving pending completion: ', e);
      } finally {
        this._overlay.hideLoader();
      }
    } else {
      if (validationResults.error === 'amount') {
        this._overlay.openModal(WARNING_MODAL_PENDING_AMOUNT_WORDING.title, WARNING_MODAL_PENDING_AMOUNT_WORDING.description);
      } else if (validationResults.error === 'account') {
        this._overlay.openModal(WARNING_MODAL_PENDING_ACCOUNT_WORDING.title, WARNING_MODAL_PENDING_ACCOUNT_WORDING.description);
      }
      this._rollbackCheckboxToggle(checkboxIndex);
    }
  }

  private _validateCheckboxChange(pending: IPending, isDone: boolean): {
    valid: boolean,
    error?: 'amount' | 'account'
  } {
    if (!pending.hasAssociatedTransaction || !isDone) {
      return { valid: true };
    }
    const { transactionType, amount, originAccountId, targetAccountId } = pending;
    const originAccount = this._fireStore.getUserAccount(originAccountId!);

    switch (transactionType) {
      case TransactionType.Expense:
        if (originAccount) {
          const maxExpenseAmount = this._getMaxExpenseAmount(originAccount);
          const valid = amount <= maxExpenseAmount;
          return { valid, error: valid ? undefined : 'amount' };
        }
        return { valid: false, error: 'account' };
      case TransactionType.Income:
        if (originAccount) {
          const maxIncomeAmount = this._getMaxIncomeAmount(originAccount);
          const valid = amount <= maxIncomeAmount;
          return { valid, error: valid ? undefined : 'amount' };
        }
        return { valid: false, error: 'account' };
      case TransactionType.Transfer:
        const targetAccount = this._fireStore.getUserAccount(targetAccountId!);
        if (originAccount && targetAccount) {
          const maxExpenseAmount = this._getMaxExpenseAmount(originAccount);
          const maxIncomeAmount = this._getMaxIncomeAmount(targetAccount);
          const valid = amount <= maxExpenseAmount && amount <= maxIncomeAmount;
          return { valid, error: valid ? undefined : 'amount' };
        }
        return { valid: false, error: 'account' };
    }
  }

  private _getMaxIncomeAmount(account: Account) {
    return account.type === AccountType.SavingsGoal ?
      account.quota! - account.balance
      : Math.abs(account.balance);
  }

  private _getMaxExpenseAmount(account: Account) {
    return account.type === AccountType.CreditCard ?
      Math.abs(account.quota!) - Math.abs(account.balance)
      : account.balance;
  }

  private _rollbackCheckboxToggle(checkboxIndex: number) {
    const checkbox = this.checkboxes.get(checkboxIndex);
    if (checkbox) {
      checkbox.toggle();
    }
  }

  async cleanAll() {
    const completedPendings = this.pendings().filter(p => p.isDone);
    try {
      this._overlay.showLoader();
      await Promise.all(completedPendings.map((pending) => this._fireStore.setPendingCompletion(pending, false)));
    } catch (e) {
      console.error('Error saving cleaning pendings: ', e);
    } finally {
      this._overlay.hideLoader();
    }
  }

  editPending(pending: IPending) {
    this._overlay.openBottomSheet(EditPending, { pending });
  }

  addNew() {
    this._overlay.openBottomSheet(EditPending);
  }

  protected readonly getAccountTypeIcon = getAccountTypeIcon;
  protected readonly getAccountTypeLabel = getAccountTypeLabel;
  protected readonly AccountType = AccountType;
  protected readonly getTransactionTypeIcon = getTransactionTypeIcon;
}
