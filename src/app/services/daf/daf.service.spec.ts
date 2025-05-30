import { TestBed } from '@angular/core/testing';

import { DAFService } from './daf.service';

describe('DAFService', () => {
  let service: DAFService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DAFService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
