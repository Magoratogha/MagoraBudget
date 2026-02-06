import { Component, computed, DestroyRef, effect, inject, OnInit, Signal } from '@angular/core';
import { Auth, FireStore } from '../../services';
import { ProfilePicture } from '../profile-picture/profile-picture';
import { APP_VERSION_STRING } from '../../../../../version-info';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Account, AccountType } from '../../../accounts/models';
import { UserSettings } from '../../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ACCOUNT_TYPE_INFO_MAP } from '../../../accounts/constants';

@Component({
  selector: 'app-side-panel',
  imports: [
    ProfilePicture,
    MatButtonModule,
    MatFormField,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel implements OnInit {
  auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _destroyRef = inject(DestroyRef);

  userAccounts: Signal<Account[]> = this._fireStore.getUserAccounts();
  userSettings: Signal<UserSettings> = this._fireStore.getUserSettings();
  availableExpensesAccounts = computed(() => {
    return this.userAccounts().filter((account) => account.type !== AccountType.Debt);
  });
  availableIncomesAccounts = computed(() => {
    return this.userAccounts();
  });

  APP_VERSION = APP_VERSION_STRING;

  form = new FormGroup({
    preferredIncomesAccountId: new FormControl<string>(''),
    preferredExpensesAccountId: new FormControl<string>(''),
  });

  constructor() {
    effect(async () => {
      const settings = this.userSettings();
      if (settings.id) {
        this.form.setValue({
          preferredIncomesAccountId: settings.preferredIncomesAccountId,
          preferredExpensesAccountId: settings.preferredExpensesAccountId,
        }, { emitEvent: false });
      }
    });
  }

  async ngOnInit() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(async (value) => {
      const userId = this.auth.getLoggedUser()?.uid;
      const userSettings = this.userSettings();
      if (userId) {
        if (userSettings.id) {
          await this._fireStore.editUserSettings(userSettings.id, {
            preferredExpensesAccountId: value?.preferredExpensesAccountId || '',
            preferredIncomesAccountId: value?.preferredIncomesAccountId || '',
            ownerId: userId
          } as UserSettings)
        } else {
          await this._fireStore.addUserSettings({
            preferredExpensesAccountId: value?.preferredExpensesAccountId || '',
            preferredIncomesAccountId: value?.preferredIncomesAccountId || '',
            ownerId: userId
          } as UserSettings)
        }
      }
    });
  }

  protected readonly ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
}
