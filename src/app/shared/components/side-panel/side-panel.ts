import { Component, DOCUMENT, effect, inject, input, PLATFORM_ID, Renderer2, signal, Signal } from '@angular/core';
import { Auth, FireStore, Overlay, Query } from '../../services';
import { ProfilePicture } from '../profile-picture/profile-picture';
import { APP_VERSION_STRING } from '../../../../../version-info';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSettings } from '../../models';
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
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel {
  auth = inject(Auth);
  private _fireStore = inject(FireStore);
  private _query = inject(Query);
  private _overlay = inject(Overlay);
  private _providerId = inject(PLATFORM_ID);
  private _renderer = inject(Renderer2);
  private _document = inject(DOCUMENT);
  showNewVersionBadge = input(false);

  userSettings: Signal<UserSettings> = this._query.userSettings;
  availableExpensesAccounts = this._query.availableExpensesAccounts;
  availableIncomesAccounts = this._query.availableIncomesAccounts;
  monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
  isDarkModeEnabled = signal<boolean>(true);

  APP_VERSION = APP_VERSION_STRING;

  form = new FormGroup({
    preferredIncomesAccountId: new FormControl<string>(''),
    preferredExpensesAccountId: new FormControl<string>(''),
    startDayOfMonth: new FormControl<number>(1, [Validators.required]),
  });

  constructor() {
    effect(async () => {
      const settings = this.userSettings();
      if (settings.id) {
        this.form.patchValue({
          preferredIncomesAccountId: settings.preferredIncomesAccountId,
          preferredExpensesAccountId: settings.preferredExpensesAccountId,
          startDayOfMonth: settings.startDayOfMonth ?? 1,
        }, { emitEvent: true });
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

  async save() {
    try {
      this._overlay.showLoader();
      const settingsToSave = this.form.value as UserSettings;
      const userId = this.auth.getLoggedUser()?.uid;
      const userSettings = this.userSettings();
      if (userId) {
        if (userSettings.id) {
          await this._fireStore.editUserSettings(userSettings.id, {
            preferredExpensesAccountId: settingsToSave?.preferredExpensesAccountId || '',
            preferredIncomesAccountId: settingsToSave?.preferredIncomesAccountId || '',
            startDayOfMonth: settingsToSave?.startDayOfMonth || 1,
            ownerId: userId
          } as UserSettings);
        } else {
          await this._fireStore.addUserSettings({
            preferredExpensesAccountId: settingsToSave?.preferredExpensesAccountId || '',
            preferredIncomesAccountId: settingsToSave?.preferredIncomesAccountId || '',
            startDayOfMonth: settingsToSave?.startDayOfMonth || 1,
            ownerId: userId
          } as UserSettings);
        }
        this.form.markAsPristine();
      }
    } catch (e) {
      console.error('Error saving user settings: ', e);
    } finally {
      this._overlay.hideLoader();
    }
  }

  async reload() {
    if (isPlatformBrowser(this._providerId)) {
      await this._overlay.closeSidePanel();
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
    this._query.isDarkModeEnabled.set(isDarkModeEnabled);

    if (isPlatformBrowser(this._providerId)) {
      localStorage.setItem('isDarkModeEnabled', String(isDarkModeEnabled));
    }
  }

  async logOut() {
    this._overlay.showLoader();
    await this._overlay.closeSidePanel();
    await this.auth.logout();
    this._overlay.hideLoader();
  }
  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
