import { Component, computed, inject, input } from '@angular/core';
import { Auth, Query } from '../../services';

@Component({
  selector: 'app-profile-picture',
  imports: [],
  templateUrl: './profile-picture.html',
  styleUrl: './profile-picture.scss',
})
export class ProfilePicture {
  auth = inject(Auth);
  private _query = inject(Query);
  size = input(120);
  radius = input('16px');
  fontSize = computed(() => this.size() / 40);
  userSettings = this._query.userSettings;
}
