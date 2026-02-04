import { Component, inject } from '@angular/core';
import { Auth } from '../../services';
import { ProfilePicture } from '../profile-picture/profile-picture';
import { APP_VERSION_STRING } from '../../../../../version-info';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-side-panel',
  imports: [
    ProfilePicture,
    MatButtonModule
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel {
  auth = inject(Auth);
  APP_VERSION = APP_VERSION_STRING;
}
