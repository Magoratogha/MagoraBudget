import { inject, Injectable, Type } from '@angular/core';
import { BottomSheet, Loader, Modal, SidePanel } from '../../components';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: SidePanel | null = null;
  private _loader: Loader | null = null;
  private _bottomSheet: BottomSheet | null = null;
  private _modal: Modal | null = null;
  private _matBottomSheet = inject(MatBottomSheet);
  private _matBottomSheetRef?: MatBottomSheetRef;

  public initOverlays(sidePanel: SidePanel, loader: Loader, bottomSheet: BottomSheet, modal: Modal) {
    this._sidePanel = sidePanel;
    this._loader = loader;
    this._bottomSheet = bottomSheet;
    this._modal = modal;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }

  public openBottomSheet(innerComponent: Type<any>, innerComponentInputs?: { [key: string]: any }) {
    //this._bottomSheet?.open(innerComponent, innerComponentInputs);
    //return this._bottomSheet?.bottomSheetClosed;
    this._matBottomSheetRef = this._matBottomSheet.open(innerComponent, { data: innerComponentInputs });
    return this._matBottomSheetRef.afterDismissed();
  }

  public closeBottomSheet(triggerCallback: boolean = false) {
    //this._bottomSheet?.close(triggerCallback);
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
