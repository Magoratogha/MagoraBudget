import { Component, inject } from '@angular/core';
import { Auth } from '../../../shared/services';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  authServive = inject(Auth);
}
