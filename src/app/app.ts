import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomSheet, Loader, Modal, Navbar, ProfilePicture, SidePanel } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';
import { Auth, Overlay } from './shared/services';
import { EditTransaction } from './transactions/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel, Loader, BottomSheet, ProfilePicture, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(SidePanel) sidePanel!: SidePanel;
  @ViewChild(Loader) loader!: Loader;
  @ViewChild(BottomSheet) bottomSheet!: BottomSheet;
  @ViewChild(Modal) modal!: Modal;
  overlay = inject(Overlay)
  auth = inject(Auth)
  NAVBAR_ITEMS = NAVBAR_ITEMS;

  ngAfterViewInit() {
    this.overlay.initOverlays(this.sidePanel, this.loader, this.bottomSheet, this.modal);
  }

  onCreateButtonClick() {
    this.overlay.openBottomSheet(EditTransaction);
  }
}
