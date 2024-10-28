import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AppointmentDetailResponseModel } from 'src/app/model/model';

@Component({
  selector: 'app-appointment-detail-month',
  templateUrl: './appointment-detail-month.component.html',
  styleUrls: ['./appointment-detail-month.component.scss']
})
export class AppointmentDetailMonthComponent implements OnInit {

  appointmentCount: number = 0;
  followupCount: number = 0;
  timeList: string[] = [];
  dayOffForm: FormGroup;
  isFutureDate: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<AppointmentDetailMonthComponent>,
    private toastr: ToastrService
  ) {
    this.dayOffForm = new FormGroup({
      markAs: new FormControl('dayOff'),
      from: new FormControl(null),
      to: new FormControl(null)
    });
  }

  ngOnInit(): void {
    let todayDate = moment(moment().format("YYYY-MM-DD")).unix();
    let selectedDate = moment(new Date(this.data?.date)).unix();
    this.isFutureDate = selectedDate >= todayDate;
    this.appointmentCount = this.getCount('Appointment');
    this.followupCount = this.getCount('Follow-up visit');
    this.timeList= this.getHours();
    this.dayOffForm.get('markAs').valueChanges.subscribe((val: string) => {
      if (val == 'dayOff') {
        this.dayOffForm.get('from').clearValidators();
        this.dayOffForm.get('from').updateValueAndValidity();
        this.dayOffForm.get('to').clearValidators();
        this.dayOffForm.get('to').updateValueAndValidity();
        this.dayOffForm.patchValue({ from: null, to: null });
      } else {
        this.dayOffForm.get('from').setValidators(Validators.required);
        this.dayOffForm.get('from').updateValueAndValidity();
        this.dayOffForm.get('to').setValidators(Validators.required);
        this.dayOffForm.get('to').updateValueAndValidity();
        this.dayOffForm.patchValue({ from: null, to: null });
      }
    })
  }

  /**
  * Mark a day as Dayoff
  * @return {void}
  */
  markDayOff() {
    if (this.dayOffForm.invalid) {
      this.toastr.warning("Please select from and to time", "Invalid Time!");
      return;
    }
    if (this.dayOffForm.value.markAs == 'dayOff') {
      this.close(this.dayOffForm.value);
    } else {
      if (this.validateTimeSlot(this.dayOffForm.value.from, this.dayOffForm.value.to)) {
        this.close(this.dayOffForm.value);
      } else {
        this.toastr.warning("Please select valid from and to time", "Invalid Time!");
      }
    }
  }

  /**
  * Close modal
  * @param {AppointmentDetailResponseModel|boolean} val - Dialog result
  * @return {void}
  */
  close(val: AppointmentDetailResponseModel|boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Get count of events for a given type
  * @param {string} type - Type of event
  * @return {number} - Count of events
  */
  getCount(type: string) {
    let count = 0;
    this.data?.events.forEach((e: CalendarEvent) => {
      if (e.title == type) {
        count++;
      }
    });
    return count;
  }

  /**
  * Returns all hours segements for a given date
  * @param {boolean} returnAll - Return all true/false
  * @param {string} date - date
  * @return {string[]} - Hour segements for a given date
  */
  getHours(returnAll = true, date?: string) {
    const hours = Array.from(
      {
        length: 21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT")
    );
    hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  }

  /**
  * Check if given date is today's date or not
  * @param {string} date - Date
  * @return {boolean} - Returns true if date if today's date else false
  */
  isToday(date: string) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }

  /**
  * Return the slot timing is valid or not
  * @param {string} from - from time
  * @param {string} to - to time
  * @return {boolean} - Returns true if slot timing is valid else false
  */
  validateTimeSlot(from: string, to: string) {
    if (moment(from, "h:mm A").format("HH:mm:ss") >= moment(to, "h:mm A").format("HH:mm:ss")) {
      return false;
    }
    return true;
  }

}
