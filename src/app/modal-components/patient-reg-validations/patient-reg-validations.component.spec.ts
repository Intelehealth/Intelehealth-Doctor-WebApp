import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRegValidationsComponent } from './patient-reg-validations.component';

describe('PatientRegValidationsComponent', () => {
  let component: PatientRegValidationsComponent;
  let fixture: ComponentFixture<PatientRegValidationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientRegValidationsComponent]
    });
    fixture = TestBed.createComponent(PatientRegValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
