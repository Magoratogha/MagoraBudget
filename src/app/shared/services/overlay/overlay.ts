import { inject, Injectable, Type } from '@angular/core';
import { Loader, Modal } from '../../components';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: MatDrawer | null = null;
  private _matBottomSheet = inject(MatBottomSheet);
  private _matDialog = inject(MatDialog);
  private _matBottomSheetRef?: MatBottomSheetRef;
  private _matModalDialogRef?: MatDialogRef<Modal>;
  private _matLoaderDialogRef?: MatDialogRef<Loader>;

  public initOverlays(sidePanel: MatDrawer) {
    this._sidePanel = sidePanel;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public closeSidePanel() {
    this._sidePanel?.close();
  }

  public openBottomSheet(innerComponent: Type<any>, innerComponentInputs?: { [key: string]: any }) {
    this._matBottomSheetRef = this._matBottomSheet.open(innerComponent, {
      data: innerComponentInputs,
      autoFocus: false
    });
    return this._matBottomSheetRef.afterDismissed();
  }

  public closeBottomSheet(triggerCallback: boolean = false) {
    this._matBottomSheetRef?.dismiss(triggerCallback);
  }

  public openModal(title: string, description?: string) {
    this._matModalDialogRef = this._matDialog.open(Modal, { data: { title, description }, autoFocus: false });
    return this._matModalDialogRef.afterClosed();
  }

  public closeModal(triggerCallback: boolean = false) {
    this._matModalDialogRef?.close(triggerCallback);
  }

  public showLoader() {
    if (!this._matLoaderDialogRef) {
      this._matLoaderDialogRef = this._matDialog.open(Loader, {
        autoFocus: false,
        disableClose: true,
        backdropClass: 'loader-backdrop',
        panelClass: 'loader-panel'
      });
    }
  }

  public hideLoader() {
    this._matLoaderDialogRef?.close();
    this._matLoaderDialogRef = undefined;
  }
}
