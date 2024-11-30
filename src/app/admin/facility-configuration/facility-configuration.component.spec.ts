import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityConfigurationComponent } from './facility-configuration.component';

describe('FacilityConfigurationComponent', () => {
  let component: FacilityConfigurationComponent;
  let fixture: ComponentFixture<FacilityConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityConfigurationComponent]
    });
    fixture = TestBed.createComponent(FacilityConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
