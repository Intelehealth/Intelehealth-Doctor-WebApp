import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSpecialityComponent } from './doctor-speciality.component';

describe('DoctorSpecialityComponent', () => {
  let component: DoctorSpecialityComponent;
  let fixture: ComponentFixture<DoctorSpecialityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorSpecialityComponent]
    });
    fixture = TestBed.createComponent(DoctorSpecialityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
