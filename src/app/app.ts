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

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel, ProfilePicture, MatSidenavModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(MatDrawer) sidePanel!: MatDrawer;
  overlay = inject(Overlay);
  auth = inject(Auth);
  newVersionAvailable = signal(false);
  private _sw = inject(SwUpdate);
  private _platformId = inject(PLATFORM_ID);
  private _fireStore = inject(FireStore);

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
    this.overlay.initOverlays(this.sidePanel);
  }

  onCreateButtonClick() {
    this.overlay.openBottomSheet(EditTransaction);
  }

  @HostListener('window:offline')
  onOfflineConnection(): void {
    this._fireStore.isOnline.set(false);
    this.overlay.showSnackBar('Se perdió la conexión a internet', 'globe_2_cancel')
  }

  @HostListener('window:online')
  onOnlineConnection(): void {
    this._fireStore.isOnline.set(true);
    this.overlay.showSnackBar('Se restableció la conexión a internet', 'mobiledata_arrows')
  }
}
