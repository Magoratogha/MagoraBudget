import { Component, input } from '@angular/core';
import { NavbarItem } from '../../models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    NgClass
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  items = input<NavbarItem[]>();
}
