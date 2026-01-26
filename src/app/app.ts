import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader, Navbar, SidePanel } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';
import { Auth, Overlay } from './shared/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(SidePanel) sidePanel!: SidePanel;
  @ViewChild(Loader) loader!: Loader;
  overlay = inject(Overlay)
  auth = inject(Auth)
  NAVBAR_ITEMS = NAVBAR_ITEMS;

  ngAfterViewInit() {
    this.overlay.initOverlays(this.sidePanel, this.loader);
  }
}
