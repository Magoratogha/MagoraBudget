import { Component, input } from '@angular/core';
import { AccountType } from '../../models';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  type = input<AccountType>();
}
