import { Injectable, Type } from '@angular/core';
import { BottomSheet, Loader, SidePanel } from '../../components';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: SidePanel | null = null;
  private _loader: Loader | null = null;
  private _bottomSheet: BottomSheet | null = null;

  public initOverlays(sidePanel: SidePanel, loader: Loader, bottomSheet: BottomSheet) {
    this._sidePanel = sidePanel;
    this._loader = loader;
    this._bottomSheet = bottomSheet;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }

  public openBottomSheet(innerComponent: Type<any>) {
    this._bottomSheet?.open(innerComponent);
  }

  public closeBottomSheet() {
    this._bottomSheet?.close();
  }

  public showLoader() {
    this._loader?.isVisible.set(true);
  }

  public hideLoader() {
    this._loader?.isVisible.set(false);
  }
}
