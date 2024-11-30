import { TestBed } from '@angular/core/testing';

import { FacilityModuleConfigurationService } from './facility-module-configuration.service';

describe('FacilityModuleConfigurationService', () => {
  let service: FacilityModuleConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacilityModuleConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
