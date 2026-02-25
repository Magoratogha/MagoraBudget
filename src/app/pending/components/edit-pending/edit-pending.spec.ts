import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPending } from './edit-pending';

describe('EditPending', () => {
  let component: EditPending;
  let fixture: ComponentFixture<EditPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPending]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
