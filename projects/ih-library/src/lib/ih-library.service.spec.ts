import { TestBed } from '@angular/core/testing';

import { IhLibraryService } from './ih-library.service';

describe('IhLibraryService', () => {
  let service: IhLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IhLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
