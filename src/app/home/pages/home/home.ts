import { Component, inject } from '@angular/core';
import { Overlay } from '../../../shared/services';
import { ProfilePicture } from '../../../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    ProfilePicture
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  overlay = inject(Overlay)
}
