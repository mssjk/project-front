import { TestBed } from '@angular/core/testing';

import { BrokeService } from './broke.service';

describe('BrokeService', () => {
  let service: BrokeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrokeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
