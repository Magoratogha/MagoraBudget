import { Injectable } from '@angular/core';
import { SidePanel } from '../../components';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: SidePanel | null = null;

  public initSidePanel(component: SidePanel) {
    this._sidePanel = component;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }
}
