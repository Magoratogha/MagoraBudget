import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  dialogData = inject(MAT_DIALOG_DATA);
  title = signal<string>(this.dialogData.title);
  description = signal<string | undefined>(this.dialogData.description);
}
