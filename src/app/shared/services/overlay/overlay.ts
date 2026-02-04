import { inject, Injectable, Type } from '@angular/core';
import { Loader, Modal } from '../../components';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _loader: Loader | null = null;
  private _modal: Modal | null = null;
  private _sidePanel: MatDrawer | null = null;
  private _matBottomSheet = inject(MatBottomSheet);
  private _matBottomSheetRef?: MatBottomSheetRef;

  public initOverlays(sidePanel: MatDrawer, loader: Loader, modal: Modal) {
    this._sidePanel = sidePanel;
    this._loader = loader;
    this._modal = modal;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }

  public openBottomSheet(innerComponent: Type<any>, innerComponentInputs?: { [key: string]: any }) {
    this._matBottomSheetRef = this._matBottomSheet.open(innerComponent, { data: innerComponentInputs });
    return this._matBottomSheetRef.afterDismissed();
  }

  public closeBottomSheet(triggerCallback: boolean = false) {
    this._matBottomSheetRef?.dismiss(triggerCallback);
  }

  public openModal(title: string, description?: string) {
    this._modal?.open(title, description);
    return this._modal?.modalClosed;
  }

  public closeModal(triggerCallback: boolean = false) {
    this._modal?.close(triggerCallback);
  }

  public showLoader() {
    this._loader?.isVisible.set(true);
  }

  public hideLoader() {
    this._loader?.isVisible.set(false);
  }
}
