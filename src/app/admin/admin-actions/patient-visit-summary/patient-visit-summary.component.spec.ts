import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVisitSummaryComponent } from './patient-visit-summary.component';

describe('PatientVisitSummaryComponent', () => {
  let component: PatientVisitSummaryComponent;
  let fixture: ComponentFixture<PatientVisitSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientVisitSummaryComponent]
    });
    fixture = TestBed.createComponent(PatientVisitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
