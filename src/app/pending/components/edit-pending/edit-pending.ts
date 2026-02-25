import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Pending } from '../../models';

@Component({
  selector: 'app-edit-pending',
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './edit-pending.html',
  styleUrl: './edit-pending.scss',
  host: {
    class: 'inner-bottom-sheet-component'
  }
})
export class EditPending {
  private _bottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  pending = signal<Pending | undefined>(this._bottomSheetData?.pending);


  delete() {}
}
