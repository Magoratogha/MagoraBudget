import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPreferences } from './budget-preferences';

describe('BudgetPreferences', () => {
  let component: BudgetPreferences;
  let fixture: ComponentFixture<BudgetPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPreferences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPreferences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
