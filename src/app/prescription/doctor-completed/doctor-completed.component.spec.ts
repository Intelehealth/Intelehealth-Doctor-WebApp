import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCompleted } from './doctor-completed.component';

describe('DoctorCompleted', () => {
  let component: DoctorCompleted;
  let fixture: ComponentFixture<DoctorCompleted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorCompleted ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorCompleted);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
