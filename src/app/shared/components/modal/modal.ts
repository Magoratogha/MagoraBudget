import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { Modal as BSModal } from 'bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements AfterViewInit {
  @ViewChild('modal') modalRef!: ElementRef;
  modalClosed = new Subject<boolean>();
  title = signal<string>('');
  description = signal<string | undefined>(undefined);
  private _bsModalInstance: BSModal | undefined;

  ngAfterViewInit() {
    this._bsModalInstance = new BSModal(this.modalRef.nativeElement);
  }

  open(title: string, description?: string): void {
    this.title.set(title);
    this.description.set(description);
    this._bsModalInstance?.show();
  }

  close(triggerCallback: boolean = false) {
    this._bsModalInstance?.hide();
    this.modalClosed.next(triggerCallback);
  }
}
