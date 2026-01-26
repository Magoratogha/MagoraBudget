import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../../shared/services';
import { APP_VERSION_STRING } from '../../../../../version-info';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  auth = inject(Auth);
  APP_VERSION = APP_VERSION_STRING;

  ngOnInit() {
  }

  public async login() {
    await this.auth.login();
  }
}
