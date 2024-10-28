import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVitalsComponent } from './patient-vitals.component';

describe('PatientVitalsComponent', () => {
  let component: PatientVitalsComponent;
  let fixture: ComponentFixture<PatientVitalsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientVitalsComponent]
    });
    fixture = TestBed.createComponent(PatientVitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
