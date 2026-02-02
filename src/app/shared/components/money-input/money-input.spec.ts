import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyInput } from './money-input';

describe('MoneyInput', () => {
  let component: MoneyInput;
  let fixture: ComponentFixture<MoneyInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoneyInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
