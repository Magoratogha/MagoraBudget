import { Component, computed, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import { NavbarItem } from '../../models';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, FireStore } from '../../services';
import { Unsubscribe } from '@firebase/firestore';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    MatButtonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  private _fireStore = inject(FireStore);
  private _auth = inject(Auth);
  private _unsubscribeFunctions: Unsubscribe[] = [];

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
    const unsubscribe = this._fireStore.listenToUserAccounts(this._auth.getLoggedUser()!.uid);
    this._unsubscribeFunctions.push(unsubscribe);
  }

  ngOnDestroy(): void {
    this._unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  }

  onCreateClick() {
    this.createButtonClicked.emit();
  }
}
