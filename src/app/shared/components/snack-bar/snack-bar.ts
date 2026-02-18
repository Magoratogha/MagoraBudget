import { Component, inject, signal } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { getAccountTypeIcon } from '../../utils';

@Component({
  selector: 'app-snack-bar',
  imports: [
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './snack-bar.html',
  styleUrl: './snack-bar.scss',
})
export class SnackBar {
  snackBarData = inject(MAT_SNACK_BAR_DATA);
  snackBarRef = inject(MatSnackBarRef);
  icon = signal<string>(this.snackBarData.icon);
  message = signal<string>(this.snackBarData.message);
  protected readonly getAccountTypeIcon = getAccountTypeIcon;
}
