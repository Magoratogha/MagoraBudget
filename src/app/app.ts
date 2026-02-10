import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar, ProfilePicture, SidePanel } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';
import { Auth, Overlay } from './shared/services';
import { EditTransaction } from './transactions/components';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { SwUpdate } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel, ProfilePicture, MatSidenavModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(MatDrawer) sidePanel!: MatDrawer;
  overlay = inject(Overlay)
  auth = inject(Auth)
  newVersionAvailable = signal(false);
  private _sw = inject(SwUpdate);

  constructor() {
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
}
