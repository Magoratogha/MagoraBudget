import { AfterViewInit, Component, HostListener, inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar, ProfilePicture, SidePanel } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';
import { Auth, FireStore, Overlay } from './shared/services';
import { EditTransaction } from './transactions/components';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { SwUpdate } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel, ProfilePicture, MatSidenavModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(MatDrawer) sidePanel!: MatDrawer;
  auth = inject(Auth);
  newVersionAvailable = signal(false);
  private _sw = inject(SwUpdate);
  private _platformId = inject(PLATFORM_ID);
  private _fireStore = inject(FireStore);
  private _overlay = inject(Overlay);

  constructor() {
    if (isPlatformBrowser(this._platformId) && location.hostname === 'localhost') {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    if (this._sw.isEnabled) {
      this._sw.versionUpdates.pipe(
        takeUntilDestroyed(),
        filter(version => version.type === 'VERSION_READY'),
        tap(() => this.newVersionAvailable.set(true))
      ).subscribe();
    }
  }

  NAVBAR_ITEMS = NAVBAR_ITEMS;

  ngAfterViewInit() {
    this._overlay.initOverlays(this.sidePanel);
  }

  async reload() {
    if (isPlatformBrowser(this._platformId)) {
      this._overlay.triggerVibration('TAP');
      await this._overlay.closeSidePanel();
      this.newVersionAvailable.set(false);
      window.location.reload();
    }
  }

  onCreateButtonClick() {
    this._overlay.openBottomSheet(EditTransaction);
  }

  openSidePanel() {
    this._overlay.triggerVibration('TAP');
    this._overlay.openSidePanel();
  }

  @HostListener('window:offline')
  onOfflineConnection(): void {
    this._fireStore.isOnline.set(false);
    this._overlay.showSnackBar('Se perdió la conexión a internet', 'globe_2_cancel')
  }

  @HostListener('window:online')
  onOnlineConnection(): void {
    this._fireStore.isOnline.set(true);
    this._overlay.showSnackBar('Se restableció la conexión a internet', 'mobiledata_arrows')
  }
}
