import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../../shared/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  auth = inject(Auth);
  router = inject(Router);

  ngOnInit() {
  }

  public async login() {
    const credential = await this.auth.login();
    if (credential) {
      await this.router.navigate(['/']);
    }
  }
}
