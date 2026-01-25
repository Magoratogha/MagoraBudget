import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar, SidePanel } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';
import { Auth, Overlay } from './shared/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SidePanel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild(SidePanel) sidePanel!: SidePanel;
  overlayService = inject(Overlay)
  authService = inject(Auth)
  NAVBAR_ITEMS = NAVBAR_ITEMS;

  ngAfterViewInit() {
    this.overlayService.initSidePanel(this.sidePanel);
  }
}
