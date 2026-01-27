import { Component } from '@angular/core';
import { Account } from '../../components';

@Component({
  selector: 'app-accounts',
  imports: [
    Account
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts {

}
