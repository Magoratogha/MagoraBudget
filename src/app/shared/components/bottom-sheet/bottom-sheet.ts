import { AfterViewInit, Component, ElementRef, inject, signal, Type, ViewChild } from '@angular/core';
import { Auth } from '../../services';
import { Offcanvas } from 'bootstrap';
import { NgComponentOutlet } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bottom-sheet',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.scss',
})
export class BottomSheet implements AfterViewInit{
  @ViewChild('offCanvas') offCanvasRef!: ElementRef;
  auth = inject(Auth);
  bottomSheetClosed = new Subject<boolean>();
  innerComponent = signal<Type<any> | null>(null);
  private _offCanvasInstance: Offcanvas | undefined;

  ngAfterViewInit() {
    this._offCanvasInstance = new Offcanvas(this.offCanvasRef.nativeElement);
  }

  open(innerComponent: Type<any>): void {
    this.innerComponent.set(innerComponent);
    this._offCanvasInstance?.show();
  }

  close(triggerCallback: boolean = false) {
    this._offCanvasInstance?.hide();
    this.innerComponent.set(null);
    this.bottomSheetClosed.next(triggerCallback);
  }
}
