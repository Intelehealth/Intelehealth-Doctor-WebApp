import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDiagnosticsComponent } from './patient-diagnostics.component';

describe('PatientDiagnosticsComponent', () => {
  let component: PatientDiagnosticsComponent;
  let fixture: ComponentFixture<PatientDiagnosticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDiagnosticsComponent]
    });
    fixture = TestBed.createComponent(PatientDiagnosticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
