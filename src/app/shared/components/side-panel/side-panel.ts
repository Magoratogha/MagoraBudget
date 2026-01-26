import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { Auth } from '../../services';
import { ProfilePicture } from '../profile-picture/profile-picture';

@Component({
  selector: 'app-side-panel',
  imports: [
    ProfilePicture
  ],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel implements AfterViewInit {
  @ViewChild('offCanvas') offCanvasRef!: ElementRef;
  auth = inject(Auth);
  private _offCanvasInstance: Offcanvas | undefined;

  ngAfterViewInit() {
    this._offCanvasInstance = new Offcanvas(this.offCanvasRef.nativeElement);
  }

  open() {
    this._offCanvasInstance?.show();
  }

  close() {
    this._offCanvasInstance?.hide();
  }
}
