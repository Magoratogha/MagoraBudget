import { Component, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Overlay } from '../../../shared/services';
import { EditPending } from '../../components';

@Component({
  selector: 'app-pending',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './pending.html',
  styleUrl: './pending.scss',
})
export class Pending {
  private _overlay = inject(Overlay);

  addNew() {
    this._overlay.openBottomSheet(EditPending);
  }
}
