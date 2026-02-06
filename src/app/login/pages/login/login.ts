import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../../shared/services';
import { APP_VERSION_STRING } from '../../../../../version-info';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  auth = inject(Auth);
  APP_VERSION = APP_VERSION_STRING;

  ngOnInit() {
  }

  public login() {
    this.auth.login();
  }
}
