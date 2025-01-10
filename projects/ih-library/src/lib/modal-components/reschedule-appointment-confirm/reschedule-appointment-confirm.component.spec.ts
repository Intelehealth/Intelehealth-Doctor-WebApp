import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleAppointmentConfirmComponent } from './reschedule-appointment-confirm.component';

describe('RescheduleAppointmentConfirmComponent', () => {
  let component: RescheduleAppointmentConfirmComponent;
  let fixture: ComponentFixture<RescheduleAppointmentConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RescheduleAppointmentConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RescheduleAppointmentConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
