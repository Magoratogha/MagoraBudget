import { Injectable } from '@angular/core';
import { Loader, SidePanel } from '../../components';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: SidePanel | null = null;
  private _loader: Loader | null = null;
  private _loaderCallCount = 0;

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
    this._loaderCallCount++;
    this._loader?.count.set(this._loaderCallCount);
  }

  public hideLoader() {
    this._loaderCallCount--;
    this._loader?.count.set(this._loaderCallCount);
    if (this._loaderCallCount === 0) {
      this._loader?.isVisible.set(false);
    }
  }
}
