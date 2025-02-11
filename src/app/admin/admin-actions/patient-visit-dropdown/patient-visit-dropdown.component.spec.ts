import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVisitDropdownComponent } from './patient-visit-dropdown.component';

describe('PatientVisitDropdownComponent', () => {
  let component: PatientVisitDropdownComponent;
  let fixture: ComponentFixture<PatientVisitDropdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientVisitDropdownComponent]
    });
    fixture = TestBed.createComponent(PatientVisitDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
