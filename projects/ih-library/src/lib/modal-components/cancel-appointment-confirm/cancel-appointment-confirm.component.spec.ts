import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAppointmentConfirmComponent } from './cancel-appointment-confirm.component';

describe('CancelAppointmentConfirmComponent', () => {
  let component: CancelAppointmentConfirmComponent;
  let fixture: ComponentFixture<CancelAppointmentConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelAppointmentConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelAppointmentConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
