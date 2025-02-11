import { TestBed } from '@angular/core/testing';

import { LibPresciptionService } from './lib-presciption.service';

describe('LibPresciptionService', () => {
  let service: LibPresciptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibPresciptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
