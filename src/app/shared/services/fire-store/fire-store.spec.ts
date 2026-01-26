import { TestBed } from '@angular/core/testing';

import { FireStore } from './fire-store';

describe('FireStore', () => {
  let service: FireStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
