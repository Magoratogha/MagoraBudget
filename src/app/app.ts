import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components';
import { NAVBAR_ITEMS } from './shared/constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  NAVBAR_ITEMS = NAVBAR_ITEMS;
}
