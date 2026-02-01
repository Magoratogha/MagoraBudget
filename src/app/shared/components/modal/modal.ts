import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { Subject } from 'rxjs';
import { ACCOUNT_TYPE_INFO_MAP } from '../../../accounts/constants';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements AfterViewInit {
  @ViewChild('offCanvas') offCanvasRef!: ElementRef;
  modalClosed = new Subject<boolean>();
  title = signal<string>('');
  description = signal<string | undefined>(undefined);
  private _offCanvasInstance: Offcanvas | undefined;

  ngAfterViewInit() {
    this._offCanvasInstance = new Offcanvas(this.offCanvasRef.nativeElement);
  }

  open(title: string, description?: string): void {
    this.title.set(title);
    this.description.set(description);
    this._offCanvasInstance?.show();
  }

  close(triggerCallback: boolean = false) {
    this._offCanvasInstance?.hide();
    this.modalClosed.next(triggerCallback);
  }

  protected readonly ACCOUNT_TYPE_INFO_MAP = ACCOUNT_TYPE_INFO_MAP;
}
