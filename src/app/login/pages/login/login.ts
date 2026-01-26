import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../../shared/services';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  auth = inject(Auth);

  ngOnInit() {
  }

  public async login() {
    await this.auth.login();
  }
}
