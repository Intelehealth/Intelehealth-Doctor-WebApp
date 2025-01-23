import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVisitSectionsComponent } from './patient-visit-sections.component';

describe('PatientVisitSectionsComponent', () => {
  let component: PatientVisitSectionsComponent;
  let fixture: ComponentFixture<PatientVisitSectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientVisitSectionsComponent]
    });
    fixture = TestBed.createComponent(PatientVisitSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
