import { inject, Injectable, PLATFORM_ID, Type } from '@angular/core';
import { Loader, Modal, SnackBar } from '../../components';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { DEFAULT_VIBRATION_PATTERN } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class Overlay {
  private _sidePanel: MatDrawer | null = null;
  private _platformId = inject(PLATFORM_ID);
  private _matBottomSheet = inject(MatBottomSheet);
  private _matDialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _matBottomSheetRef?: MatBottomSheetRef;
  private _matModalDialogRef?: MatDialogRef<Modal>;
  private _matLoaderDialogRef?: MatDialogRef<Loader>;
  private _matSnackBarRef?: MatSnackBarRef<SnackBar>;

  public initOverlays(sidePanel: MatDrawer) {
    this._sidePanel = sidePanel;
  }

  public openSidePanel() {
    this._sidePanel?.open();
  }

  public async closeSidePanel() {
    await this._sidePanel?.close();
  }

  public openBottomSheet(innerComponent: Type<any>, innerComponentInputs?: { [key: string]: any }) {
    this._matBottomSheetRef = this._matBottomSheet.open(innerComponent, {
      data: innerComponentInputs,
      autoFocus: false,
      backdropClass: 'app-overlay-backdrop',
    });
    return this._matBottomSheetRef.afterDismissed();
  }

  public closeBottomSheet(triggerCallback: boolean = false) {
    this._matBottomSheetRef?.dismiss(triggerCallback);
  }

  public openModal(title: string, description?: string | string[]) {
    this._matModalDialogRef = this._matDialog.open(Modal, {
      data: { title, description },
      autoFocus: false,
      backdropClass: 'app-overlay-backdrop',
    });
    return this._matModalDialogRef.afterClosed();
  }

  public closeModal(triggerCallback: boolean = false) {
    this._matModalDialogRef?.close(triggerCallback);
  }

  public showSnackBar(message: string, icon: string) {
    this._matSnackBarRef = this._snackBar.openFromComponent(SnackBar, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      data: { message, icon }
    });
    return this._matSnackBarRef.afterDismissed();
  }

  public dismissSnackBar() {
    this._matSnackBarRef?.dismiss();
  }

  public showLoader() {
    if (!this._matLoaderDialogRef) {
      this._matLoaderDialogRef = this._matDialog.open(Loader, {
        autoFocus: false,
        disableClose: true,
        backdropClass: 'app-overlay-backdrop',
        panelClass: 'loader-panel'
      });
    }
  }

  public hideLoader() {
    this._matLoaderDialogRef?.close();
    this._matLoaderDialogRef = undefined;
  }

  public triggerVibration() {
    if (isPlatformBrowser(this._platformId)) {
      navigator.vibrate(DEFAULT_VIBRATION_PATTERN);
    }
  }
}
