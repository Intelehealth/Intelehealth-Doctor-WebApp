import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticReportsComponent } from './diagnostic-reports.component';

describe('DiagnosticReportsComponent', () => {
  let component: DiagnosticReportsComponent;
  let fixture: ComponentFixture<DiagnosticReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiagnosticReportsComponent]
    });
    fixture = TestBed.createComponent(DiagnosticReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
