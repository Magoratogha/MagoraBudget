import {
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  Signal
} from '@angular/core';
import { Auth, FireStore, Query } from '../../services';
import { ProfilePicture } from '../profile-picture/profile-picture';
import { APP_VERSION_STRING } from '../../../../../version-info';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserSettings } from '../../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { getAccountTypeIcon } from '../../utils';
import { MatChipsModule } from '@angular/material/chips';
import { isPlatformBrowser } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-side-panel',
  imports: [
    ProfilePicture,
    MatButtonModule,
    MatFormField,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel implements OnInit {
  auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _query = inject(Query);
  private _destroyRef = inject(DestroyRef);
  private _providerId = inject(PLATFORM_ID);
  private _renderer = inject(Renderer2);
  private _document = inject(DOCUMENT);
  showNewVersionBadge = input(false);

  userSettings: Signal<UserSettings> = this._query.userSettings;
  availableExpensesAccounts = this._query.availableExpensesAccounts;
  availableIncomesAccounts = this._query.availableIncomesAccounts;
  isDarkModeEnabled = signal<boolean>(true);

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

    effect(() => {
      const darkMode = this.isDarkModeEnabled();
      this._setTheme(darkMode);
    });

    if (isPlatformBrowser(this._providerId)) {
      const isDarkModeEnabled = localStorage.getItem('isDarkModeEnabled') !== 'false';
      this.isDarkModeEnabled.set(isDarkModeEnabled);
    }
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

  reload() {
    if (isPlatformBrowser(this._providerId)) {
      window.location.reload();
    }
  }

  private _setTheme(isDarkModeEnabled: boolean) {
    if (isDarkModeEnabled) {
      this._renderer.removeClass(this._document.body, 'light-mode');
    } else {
      this._renderer.addClass(this._document.body, 'light-mode');
    }
    const themeColorTag = this._document.querySelector("meta[name='theme-color']")
    this._renderer.setAttribute(themeColorTag, 'content', isDarkModeEnabled ? "#11150d" : "#f8fbee");

    if (isPlatformBrowser(this._providerId)) {
      localStorage.setItem('isDarkModeEnabled', String(isDarkModeEnabled));
    }
  }

  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
