import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { Auth } from '../../services';

@Component({
  selector: 'app-side-panel',
  imports: [],
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
