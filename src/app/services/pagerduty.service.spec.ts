import { TestBed } from '@angular/core/testing';

import { PagerdutyService } from './pagerduty.service';

describe('PagerdutyService', () => {
  let service: PagerdutyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagerdutyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
