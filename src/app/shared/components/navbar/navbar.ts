import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarItem } from '../../models';
import { Overlay, Query } from '../../services';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private _query = inject(Query);
  private _overlay = inject(Overlay);

  items = input<NavbarItem[]>([]);
  leftSideItems = computed(() => {
    const halfwayThrough = Math.floor(this.items().length / 2);
    return this.items().slice(0, halfwayThrough);
  });
  rightSideItems = computed(() => {
    const halfwayThrough = Math.floor(this.items().length / 2);
    return this.items().slice(halfwayThrough, this.items().length);
  });
  createButtonClicked = output();

  async onCreateClick() {
    await this._overlay.triggerVibration('OPEN_BOTTOM_SHEET');
    this.createButtonClicked.emit();
  }

  updateQueryDate() {
    this._overlay.triggerVibration('TAP');
    const currentDate = new Date();
    const queryDate = this._query.getCurrentDate();

    if (
      currentDate.getMonth() !== queryDate.getMonth() ||
      currentDate.getFullYear() !== queryDate.getFullYear()
    ) {
      this._query.updateCurrentDate(currentDate);
    }
  }
}
