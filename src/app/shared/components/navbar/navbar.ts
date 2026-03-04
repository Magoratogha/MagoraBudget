import { Component, computed, inject, input, OnDestroy, OnInit, output, PLATFORM_ID } from '@angular/core';
import { NavbarItem } from '../../models';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, FireStore, Query } from '../../services';
import { Unsubscribe } from '@firebase/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  private _fireStore = inject(FireStore);
  private _query = inject(Query);
  private _auth = inject(Auth);
  private _unsubscribeFunctions: Unsubscribe[] = [];
  private _platformId = inject(PLATFORM_ID);

  items = input<NavbarItem[]>([]);
  leftSideItems = computed(() => {
    const halfwayThrough = Math.floor(this.items().length / 2)
    return this.items().slice(0, halfwayThrough);
  });
  rightSideItems = computed(() => {
    const halfwayThrough = Math.floor(this.items().length / 2)
    return this.items().slice(halfwayThrough, this.items().length);
  })
  createButtonClicked = output();

  ngOnInit(): void {
    const userId = this._auth.getLoggedUser()!.uid;
    this._unsubscribeFunctions.push(
      this._fireStore.listenToUserAccounts(userId),
      this._fireStore.listenToUserTransactions(userId),
      this._fireStore.listenToUserSettings(userId),
      this._fireStore.listenToUserBudgetPreference(userId),
      this._fireStore.listenToUserPendings(userId)
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  }

  onCreateClick() {
    if (isPlatformBrowser(this._platformId)) {
      navigator.vibrate(1000);
    }
    this.createButtonClicked.emit();
  }

  updateQueryDate() {
    if (isPlatformBrowser(this._platformId)) {
      navigator.vibrate(1000);
    }
    const currentDate = new Date();
    const queryDate = this._query.getCurrentDate();

    if (currentDate.getMonth() !== queryDate.getMonth() || currentDate.getFullYear() !== queryDate.getFullYear()) {
      this._query.updateCurrentDate(currentDate);
    }
  }
}
