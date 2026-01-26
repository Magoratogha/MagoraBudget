import { Injectable } from '@angular/core';
import { Loader, SidePanel } from '../../components';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: SidePanel | null = null;
  private _loader: Loader | null = null;

  public initOverlays(sidePanel: SidePanel, loader: Loader) {
    this._sidePanel = sidePanel;
    this._loader = loader;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }

  public showLoader() {
    this._loader?.isVisible.set(true);
  }

  public hideLoader() {
    this._loader?.isVisible.set(false);
  }
}
