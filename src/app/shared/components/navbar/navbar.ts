import { Component, computed, input, output } from '@angular/core';
import { NavbarItem } from '../../models';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
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
}
