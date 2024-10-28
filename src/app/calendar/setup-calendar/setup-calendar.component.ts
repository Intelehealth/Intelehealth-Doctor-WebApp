import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';
import { ApiResponseModel, DataItemModel, ProviderAttributeModel, ScheduleModel, ScheduleSlotModel, ScheduledMonthModel } from 'src/app/model/model';

export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

@Injectable()
class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          return formatDate(date,'dd MMM, yyyy',this.locale);
      } else {
          return date.toDateString();
      }
  }
}

@Component({
  selector: 'app-setup-calendar',
  templateUrl: './setup-calendar.component.html',
  styleUrls: ['./setup-calendar.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class SetupCalendarComponent implements OnInit {

  days: DataItemModel[] = [
    {
      id: 1,
      name: 'Monday',
      shortName: 'Mon'
    },
    {
      id: 2,
      name: 'Tuesday',
      shortName: 'Tue'
    },
    {
      id: 3,
      name: 'Wednesday',
      shortName: 'Wed'
    },
    {
      id: 4,
      name: 'Thursday',
      shortName: 'Thu'
    },
    {
      id: 5,
      name: 'Friday',
      shortName: 'Fri'
    },
    {
      id: 6,
      name: 'Saturday',
      shortName: 'Sat'
    },
    {
      id: 7,
      name: 'Sunday',
      shortName: 'Sun'
    },
  ];
  timeList: DataItemModel[] = [
    { id: 1, name: "9:00" },
    { id: 2, name: "10:00" },
    { id: 3, name: "11:00" },
    { id: 4, name: "12:00" },
    { id: 5, name: "1:00" },
    { id: 6, name: "2:00" },
    { id: 7, name: "3:00" },
    { id: 8, name: "4:00" },
    { id: 9, name: "5:00" },
    { id: 10, name: "6:00" },
    { id: 11, name: "7:00" },
    { id: 12, name: "8:00" }
  ];
  clockTimeAmPM: DataItemModel[] = [
    { id: 1, name: "AM" },
    { id: 2, name: "PM" }
  ];
  monthNames: string[] = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

  minDate: string;
  maxDate: string;
  scheduledMonths: ScheduledMonthModel[] = [];
  selectedMonth: ScheduledMonthModel;
  selectedMonthSchedule: ScheduleModel;
  addSlotsForm: FormGroup;
  _addMoreTiming: boolean = false;
  daysOffSelected: string[] = [];
  filteredDays=[];
  @ViewChild('picker3', { static: true }) _picker: MatDatepicker<Date>;
  submitted: boolean = false;
  timeslotError: string = "";

  constructor(
    private appointmentService: AppointmentService,
    private pageTitleService: PageTitleService,
    private toastr: ToastrService,
    private coreService: CoreService,
    private translateService:TranslateService) {

    this.addSlotsForm = new FormGroup({
      drName: new FormControl(this.drName, Validators.required),
      userUuid: new FormControl(this.userId, Validators.required),
      speciality: new FormControl(this.getSpeciality(), Validators.required),
      type: new FormControl('month', Validators.required),
      month: new FormControl(null, Validators.required),
      year: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      slotDays: new FormControl(''),
      slotSchedule: new FormArray([]),
      timings: new FormArray([]),
      daysOff: new FormArray([])
    });

  }

  get f() { return this.addSlotsForm.controls; }
  get ft() { return this.addSlotsForm.get('timings') as FormArray; };
  get fd() { return this.addSlotsForm.get('daysOff') as FormArray; };
  get fs() { return this.addSlotsForm.get('slotSchedule') as FormArray; }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: 'assets/svgs/menu-calendar-circle.svg' });
    this.getScheduledMonths();
  }

  /**
  * Add new month
  * @return {void}
  */
  addMonth() {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let lastMonthObj = this.scheduledMonths.length ? this.scheduledMonths[this.scheduledMonths.length - 1] : {name: this.monthNames[month], year: year.toString()};
    let intMonth = this.monthNames.indexOf(lastMonthObj.name);
    if(intMonth >= 0){
      let newMonth = new Date(+lastMonthObj.year, intMonth+1, 1);
      if([year,(year+1)].indexOf(newMonth.getFullYear()) != -1){
        this.scheduledMonths.push({ name: this.monthNames[newMonth.getMonth()], year: newMonth.getFullYear().toString() });
      }
    }
  }

  /**
  * Select month
  * @param {string} name - Month
  * @param {string} year - Year
  * @return {void}
  */
  selectMonth(name: string, year: string) {
    if (this.selectedMonth.name != name) {
      this.selectedMonth = { name, year };
      this.getSchedule(year, name);
      this.submitted = false;
    }
  }

  /**
  * Get max and min date for the selected month
  * @return {void}
  */
  getMinMaxDate() {
    let today = moment();
    let min = moment(`${this.selectedMonth.year}-${this.selectedMonth.name}-1`, 'YYYY-MMMM-D');
    let max = moment(`${this.selectedMonth.year}-${this.selectedMonth.name}-1`, 'YYYY-MMMM-D').endOf('month');
    this.minDate = (min < today) ? today.format('YYYY-MM-DD') : min.format('YYYY-MM-DD');
    this.maxDate = max.format('YYYY-MM-DD');
  }

  /**
  * Get scheduled months of the current year for the logged-in doctor
  * @return {void}
  */
  getScheduledMonths() {
    this.appointmentService.getScheduledMonths(this.userId, new Date().getFullYear().toString())
      .subscribe({
        next: (res: ApiResponseModel) => {
          this.scheduledMonths = res.data;
          if (this.scheduledMonths.length === 0) {
            this.scheduledMonths.push({ name: this.monthNames[new Date().getMonth()], year: new Date().getFullYear().toString() });
            this.getSchedule(this.scheduledMonths[0].year, this.scheduledMonths[0].name);
            this.selectedMonth = { name: this.scheduledMonths[0].name, year: this.scheduledMonths[0].year };
          }
          else {
            this.selectedMonth = this.scheduledMonths.find((o: ScheduledMonthModel) => o.name == this.monthNames[new Date().getMonth()] && o.year == new Date().getFullYear().toString());
            if (this.selectedMonth) {
              this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
            } else {
              this.getSchedule(this.scheduledMonths[0].year, this.scheduledMonths[0].name);
              this.selectedMonth = { name: this.scheduledMonths[0].name, year: this.scheduledMonths[0].year };
            }
          }
        }
      });
  }

  /**
  * Get calendar schedule for a logged-in doctor for a given year and month
  * @param {string} year - Year
  * @param {string} month - Month
  * @return {void}
  */
  getSchedule(year = moment(this.minDate).format("YYYY"), month = moment(this.minDate).format("MMMM")) {
    this.appointmentService.getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: ApiResponseModel) => {
          if (res && res.data) {
            this.selectedMonthSchedule = res.data;
            this.selectedMonthSchedule.added = true;
            this.setData(res.data);
          } else {
            this.selectedMonthSchedule = {
              added: false,
              month: month,
              year: year,
              startDate: null,
              endDate: null,
              slotDays: '',
              slotSchedule: [],
              timings: [],
              daysOff: []
            };
            this.setData(this.selectedMonthSchedule);
          }
          this.getMinMaxDate();
        },
      });
  }

  /**
  * Set schedule data for a selected month
  * @param {ScheduleModel} schedule - Schedule of the selected month
  * @return {void}
  */
  private setData(schedule: ScheduleModel) {
    if (!this.scheduledMonths.some((month: ScheduledMonthModel) => month.name === schedule.month)) {
      this.scheduledMonths.push({ name: schedule.month, year: schedule.year });
    }
    this.ft.clear();
    this.fd.clear();
    this.fs.clear();
    let uniqTiming = [];
    for (let h = 0; h < schedule.slotSchedule.length; h++) {
      if (uniqTiming.findIndex((o: ScheduleSlotModel) => o.startTime == schedule.slotSchedule[h].startTime && o.endTime == schedule.slotSchedule[h].endTime) == -1) {
        uniqTiming.push(schedule.slotSchedule[h]);
      }
    }
    uniqTiming.forEach((ut: ScheduleSlotModel) => {
      let utslots = schedule.slotSchedule.filter((o: ScheduleSlotModel) => o.startTime == ut.startTime && o.endTime == ut.endTime);
      let timingFormGroup = new FormGroup({
        startTime: new FormControl({ value: ut.startTime.split(" ")[0], disabled: true }, Validators.required),
        startMeridiem: new FormControl({ value: ut.startTime.split(" ")[1], disabled: true }, Validators.required),
        endTime: new FormControl({ value: ut.endTime.split(" ")[0], disabled: true }, Validators.required),
        endMeridiem: new FormControl({ value: ut.endTime.split(" ")[1], disabled: true }, Validators.required),
        days: new FormControl({ value: [...new Set(utslots.map((item: ScheduleSlotModel) => item.day))].map((val: string) => val.slice(0,3)), disabled: true }, Validators.required),
        slots: this.getSlotsArray(utslots)
      });
      this.ft.push(timingFormGroup);
    });

    // Add empty formGroup to Timings array for new entry
    this.ft.push(
      new FormGroup({
        startTime: new FormControl(null, Validators.required),
        startMeridiem: new FormControl(null, Validators.required),
        endTime: new FormControl(null, Validators.required),
        endMeridiem: new FormControl(null, Validators.required),
        days: new FormControl(null, Validators.required),
        slots: new FormArray([])
      })
    );
    // Push daysOff's to the form
    if (schedule.daysOff) {
      schedule.daysOff.forEach((doff: string) => {
        this.fd.push(new FormControl(moment(doff, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss"), Validators.required));
      });
    }

    this.addSlotsForm.patchValue({
      month: this.selectedMonth['name'],
      year: this.selectedMonth['year'],
      startDate: (schedule.startDate) ? moment(schedule.startDate).format('YYYY-MM-DD') : null,
      endDate: (schedule.endDate) ? moment(schedule.endDate).format('YYYY-MM-DD') : null,
      slotDays: ''
    });

    this.daysOffSelected = [];
    this.filteredDays = [];
    this.days.forEach((element, i) => {
      this.filteredDays.push(element);
    });
  }

  /**
  * Returns formarray from a given schedule slots
  * @param {ScheduleSlotModel[]} utslots - Array of schedule slots
  * @return {FormArray} - Formarray for schedule slots
  */
  getSlotsArray(utslots: ScheduleSlotModel[]): FormArray {
    let dataArray = new FormArray([]);
    utslots.forEach((uts: ScheduleSlotModel) => {
      let d: FormGroup;
      d = new FormGroup({
        id: new FormControl(uts.id, Validators.required),
        day: new FormControl(uts.day, Validators.required),
        date: new FormControl(moment(uts.date).format('YYYY-MM-DD HH:mm:ss'), Validators.required),
        startTime: new FormControl(uts.startTime, Validators.required),
        endTime: new FormControl(uts.endTime, Validators.required)
      });
      dataArray.push(d);
    });
    return dataArray;
  }

  /**
  * Toggle add more timing button
  * @return {void}
  */
  toggleAddMoreTiming() {
    this._addMoreTiming = !this._addMoreTiming;
  }

  /**
  * Returns slot formarray at particular index in formgroup array
  * @param {number} i - Index
  * @return {FormArray} - Formarray at particular index in formgroup array
  */
  getSlotsFormArray(i: number): FormArray {
    return this.ft.at(i).get("slots") as FormArray;
  }

  /**
  * Calculate and save the timing slots for selected schedule month
  * @return {void}
  */
  save() {
    this.submitted = true;
    this.fs.clear();
    if (this.addSlotsForm.invalid) {
      return;
    }
    if (moment(this.addSlotsForm.value.startDate) > moment(this.addSlotsForm.value.endDate)) {
      this.toastr.warning(this.translateService.instant("Start date should greater than end date."), this.translateService.instant("Invalid Dates!"));
      return;
    }
    let flag = 0;
    let ts = [...this.ft.getRawValue()];
    this.timeslotError = "";
    const validTimeSlot:any = this.validateDuplicateTimeSlot(ts);
    if(validTimeSlot?.invalid){
      this.timeslotError = validTimeSlot.error;
      return false;
    }
    for (let i = 0; i < ts.length; i++) {
      if (this.validateTimeSlot({ startTime: `${ts[i].startTime} ${ts[i].startMeridiem}`, endTime: `${ts[i].endTime} ${ts[i].endMeridiem}` })) {
        let newSlots = this.createSlots(ts[i].days, `${ts[i].startTime} ${ts[i].startMeridiem}`, `${ts[i].endTime} ${ts[i].endMeridiem}`);
        let oldSlots = [...this.getSlotsFormArray(i).value];
        this.getSlotsFormArray(i).clear();
        for (let x = 0; x < oldSlots.length; x++) {
          if (newSlots.find((o: ScheduleSlotModel) => o.date == oldSlots[x].date && o.day == oldSlots[x].day)) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
          }
        }
        oldSlots = [...this.getSlotsFormArray(i).value];
        for (let x = 0; x < newSlots.length; x++) {
          if (!oldSlots.find((o: ScheduleSlotModel) => o.date == newSlots[x].date && o.day == newSlots[x].day)) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
          }
        }

        if (i == ts.length-1) {
          this.addSlotsForm.get('slotDays').setValue([...new Set([...this.getSlotsFormArray(i).value].map((o: ScheduleSlotModel) => o.day))].join('||'));
        }
      }
      else {
        this.toastr.warning(this.translateService.instant("Slot start time should be less than end time."), this.translateService.instant("Invalid Slot Timings!"));
        flag = 1;
        break;
      }
    }
    if (flag == 1) {
      return;
    }
    let body = { ...this.addSlotsForm.value };
    delete body['timings'];
    delete body['daysOff'];
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.status) {
          this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
          this.submitted = false;
        }
      },
    });
  }

  /**
  * Delete the timing slots for selected schedule month from perticular index of formgroup array
  * @param {number} index - Index
  * @return {void}
  */
  deleteSlot(index: number) {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to delete this timing slot?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        this.fs.clear();
        if (moment(this.addSlotsForm.value.startDate) > moment(this.addSlotsForm.value.endDate)) {
          this.toastr.warning(this.translateService.instant("Start date should greater than end date."), this.translateService.instant("Invalid Dates!"));
          return;
        }
        let flag = 0;
        let ts = [...this.ft.getRawValue()];
        for (let i = 0; i < ts.length - 1; i++) {
          if (i != index) {
            if (this.validateTimeSlot({ startTime: `${ts[i].startTime} ${ts[i].startMeridiem}`, endTime: `${ts[i].endTime} ${ts[i].endMeridiem}` })) {
              let newSlots = this.createSlots(ts[i].days, `${ts[i].startTime} ${ts[i].startMeridiem}`, `${ts[i].endTime} ${ts[i].endMeridiem}`);
              let oldSlots = [...this.getSlotsFormArray(i).value];
              this.getSlotsFormArray(i).clear();
              for (let x = 0; x < oldSlots.length; x++) {
                if (newSlots.find((o: ScheduleSlotModel) => o.date == oldSlots[x].date && o.day == oldSlots[x].day)) {
                  this.getSlotsFormArray(i).push(
                    new FormGroup({
                      id: new FormControl(oldSlots[x].id, Validators.required),
                      day: new FormControl(oldSlots[x].day, Validators.required),
                      date: new FormControl(oldSlots[x].date, Validators.required),
                      startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                      endTime: new FormControl(oldSlots[x].endTime, Validators.required)
                    })
                  );
                  this.fs.push(
                    new FormGroup({
                      id: new FormControl(oldSlots[x].id, Validators.required),
                      day: new FormControl(oldSlots[x].day, Validators.required),
                      date: new FormControl(oldSlots[x].date, Validators.required),
                      startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                      endTime: new FormControl(oldSlots[x].endTime, Validators.required)
                    })
                  );
                }
              }
              oldSlots = [...this.getSlotsFormArray(i).value];
              for (let x = 0; x < newSlots.length; x++) {
                if (!oldSlots.find((o: ScheduleSlotModel) => o.date == newSlots[x].date  && o.day == newSlots[x].day)) {
                  this.getSlotsFormArray(i).push(
                    new FormGroup({
                      id: new FormControl(newSlots[x].id, Validators.required),
                      day: new FormControl(newSlots[x].day, Validators.required),
                      date: new FormControl(newSlots[x].date, Validators.required),
                      startTime: new FormControl(newSlots[x].startTime, Validators.required),
                      endTime: new FormControl(newSlots[x].endTime, Validators.required)
                    })
                  );
                  this.fs.push(
                    new FormGroup({
                      id: new FormControl(newSlots[x].id, Validators.required),
                      day: new FormControl(newSlots[x].day, Validators.required),
                      date: new FormControl(newSlots[x].date, Validators.required),
                      startTime: new FormControl(newSlots[x].startTime, Validators.required),
                      endTime: new FormControl(newSlots[x].endTime, Validators.required)
                    })
                  );
                }
              }

              this.addSlotsForm.get('slotDays').setValue('');
            }
            else {
              this.toastr.warning(this.translateService.instant("Slot start time should be less than end time."), this.translateService.instant("Invalid Slot Timings!"));
              flag = 1;
              break;
            }
          }
        }
        if (flag == 1) {
          return;
        }
        let body = { ...this.addSlotsForm.value };
        delete body['timings'];
        delete body['daysOff'];
        this.appointmentService.updateOrCreateAppointment(body).subscribe({
          next: (res: ApiResponseModel) => {
            if (res.status) {
              this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
              this.submitted = false;
            }
          },
        });
      }
    });
  }

  /**
  * Return the created slot timing is valid or not
  * @param {ScheduleSlotModel} slot - Slot
  * @return {boolean} - Returns true if slot timing is valid else false
  */
  validateTimeSlot(slot: ScheduleSlotModel): boolean {
    if (moment(slot.startTime, ["h:mm A"]).format("HH:mm:ss") >= moment(slot.endTime, ["h:mm A"]).format("HH:mm:ss")) {
      return false;
    }
    return true;
  }

  /**
  * Returns the slots for a given days, startTime and endTime
  * @param {string[]} days - Array of day
  * @param {string} startTime - Start Time
  * @param {string} endTime - End Time
  * @return {ScheduleSlotModel[]} - Slots for a given days, startTime and endTime
  */
  createSlots(days: string[], startTime: string, endTime: string): ScheduleSlotModel[] {
    let slots: ScheduleSlotModel[] = [];
    const start = moment(this.addSlotsForm.value.startDate).format('YYYY-MM-DD');
    const end = moment(this.addSlotsForm.value.endDate).format('YYYY-MM-DD');
    const daysOff = [...this.fd.value];
    let currentDate = moment(start);
    while (currentDate <= moment(end)) {
      const currentDateDay = currentDate.format('ddd');
      if (days.includes(currentDateDay) && !daysOff.includes(currentDate.format("YYYY-MM-DD HH:mm:ss"))) {
        slots.push({
          id: this.getUniqueId(),
          day: currentDate.format('dddd'),
          date: currentDate.format('YYYY-MM-DD HH:mm:ss'),
          startTime,
          endTime
        });
      }
      currentDate.add(1, "day");
    }
    return slots;
  }

  /**
  * Check if date is in dayOff list or not
  * @param {Date} event - Date
  * @return {string|null} - Returns 'dayOffDate' if date is in dayOff list else null
  */
  isDayOff = (event: Date) => {
    const date = moment(
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2)).format('YYYY-MM-DD HH:mm:ss');
    return this.daysOffSelected.find((x: string) => x == date) ? "dayOffDate" : null;
  }

  /**
  * Callback for dayOff selected
  * @param {{value: string}} event - DayOff data
  * @return {void}
  */
  dayOffSelected(event: { value: string }) {
    if (event.value) {
      const date = moment(event.value).format('YYYY-MM-DD HH:mm:ss');
      const index = this.daysOffSelected.indexOf(date);
      if (index < 0) {
        this.daysOffSelected.push(date);
      }
      else {
        this.daysOffSelected.splice(index, 1);
      }
      this._picker.select(undefined);
      this._picker.close();
    }
  }

  /**
  * Reset the selected dayOff's list
  * @return {void}
  */
  resetSelectedDaysOff() {
    this.daysOffSelected = [];
  }

  /**
  * Save dayOff's
  * @return {void}
  */
  saveDaysOff() {
    if(!this.daysOffSelected.length) {
      this.toastr.warning(this.translateService.instant("Please select atleast 1 date for day off."),this.translateService.instant("Select dates!"));
      return;
    }

    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to save these days off ?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        let finalDaysOff = [...new Set([...this.fd.value].concat(this.daysOffSelected))].map((val: string)=> {
          return moment(val, "YYYY-MM-DD HH:mm:ss").format('DD/MM/YYYY');
        });

        if (this.selectedMonthSchedule.added) {
          let body = {
            userUuid: this.userId,
            daysOff: finalDaysOff,
            month: this.selectedMonth.name,
            year: this.selectedMonth.year
          }
          this.appointmentService.updateDaysOff(body).subscribe({
            next: (res: ApiResponseModel) => {
              if (res.status) {
                this.daysOffSelected.forEach(doff => {
                  this.fd.push(new FormControl(doff, Validators.required));
                });
                this.daysOffSelected = [];
                this.updateSlot();
              }
            },
          });
        } else {
          if (moment(this.minDate).isAfter(this.maxDate)) {
            this.toastr.warning(this.translateService.instant("Can't add daysOff's for the past dates!"),this.translateService.instant("Can't add daysOff's"));
            return;
          }
          let body = { ...this.addSlotsForm.value };
          delete body['timings'];
          delete body['daysOff'];
          body.startDate = moment(this.minDate, 'YYYY-MM-DD').toISOString();
          body.endDate = moment(this.maxDate, 'YYYY-MM-DD').toISOString();
          this.appointmentService.updateOrCreateAppointment(body).subscribe({
            next: (res: ApiResponseModel) => {
              if (res.status) {
                let body2 = {
                  userUuid: this.userId,
                  daysOff: finalDaysOff,
                  month: this.selectedMonth.name,
                  year: this.selectedMonth.year
                }
                this.appointmentService.updateDaysOff(body2).subscribe({
                  next: (res: ApiResponseModel) => {
                    if (res.status) {
                      this.daysOffSelected = [];
                      this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
                    }
                  },
                });
              }
            },
          });
        }
      }
    });
  }

  /**
  * Remove a day from dayOff's list at a given index
  * @param {number} index - Index
  * @return {void}
  */
  removeDaysOff(index: number) {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to remove this day off ?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        let finalDaysOff = [...this.fd.value];
        finalDaysOff.splice(index, 1);
        finalDaysOff = [...new Set(finalDaysOff)].map((val: string)=> {
          return moment(val, "YYYY-MM-DD HH:mm:ss").format('DD/MM/YYYY');
        });
        let body = {
          userUuid: this.userId,
          daysOff: finalDaysOff,
          month: this.selectedMonth.name,
          year: this.selectedMonth.year
        }
        this.appointmentService.updateDaysOff(body).subscribe({
          next: (res: ApiResponseModel) => {
            if (res.status) {
              this.fd.removeAt(index);
              this.updateSlot();
            }
          },
        });
      }
    });
  }

  /**
  * Getter for dayOff dates
  * @return {string} - String containing comma seperated dayOff's list
  */
  get daysOffDates(): string {
    let data: string = '';
    this.daysOffSelected.forEach((d) => {
      data += `${moment(d).format('DD MMM')}, `;
    });
    return data;
  }

  /**
  * Get Unique string
  * @return {string} - Unique string
  */
  getUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  };

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  private get userId() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Get doctor name from localstorage user
  * @return {string} - Doctor name
  */
  private get drName() {
    return (
      getCacheData(true, doctorDetails.USER)?.person?.display ||
      getCacheData(true, doctorDetails.USER)?.display
    );
  }

  /**
  * Get doctor speciality from localstorage provider
  * @return {string} - Doctor Speciality
  */
  private getSpeciality() {
    return getCacheData(true, doctorDetails.PROVIDER).attributes.find((a: ProviderAttributeModel) =>
      a.display.includes(doctorDetails.SPECIALIZATION)
    )?.value;
  }

  /**
  * Re-calculate and Update the slots for a selected schedule month
  * @return {void}
  */
  updateSlot() {
    this.fs.clear();
    if (moment(this.addSlotsForm.value.startDate) > moment(this.addSlotsForm.value.endDate)) {
      this.toastr.warning(this.translateService.instant("Start date should greater than end date."), this.translateService.instant("Invalid Dates!"));
      return;
    }
    let flag = 0;
    let ts = [...this.ft.getRawValue()];
    for (let i = 0; i < ts.length - 1; i++) {
      if (this.validateTimeSlot({ startTime: `${ts[i].startTime} ${ts[i].startMeridiem}`, endTime: `${ts[i].endTime} ${ts[i].endMeridiem}` })) {
        let newSlots = this.createSlots(ts[i].days, `${ts[i].startTime} ${ts[i].startMeridiem}`, `${ts[i].endTime} ${ts[i].endMeridiem}`);
        let oldSlots = [...this.getSlotsFormArray(i).value];
        this.getSlotsFormArray(i).clear();
        for (let x = 0; x < oldSlots.length; x++) {
          if (newSlots.find((o: ScheduleSlotModel) => o.date == oldSlots[x].date && o.day == oldSlots[x].day)) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
          }
        }
        oldSlots = [...this.getSlotsFormArray(i).value];
        for (let x = 0; x < newSlots.length; x++) {
          if (oldSlots.find((o: ScheduleSlotModel) => o.date == newSlots[x].date && o.day == newSlots[x].day)) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
          }
        }

        this.addSlotsForm.get('slotDays').setValue('');
      }
      else {
        this.toastr.warning(this.translateService.instant("Slot start time should be less than end time."), this.translateService.instant("Invalid Slot Timings!"));
        flag = 1;
        break;
      }
    }
    if (flag == 1) {
      return;
    }
    let body = { ...this.addSlotsForm.value };
    delete body['timings'];
    delete body['daysOff'];
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.status) {
          this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
        }
      },
    });
  }

  validateDuplicateTimeSlot(timeSlots){
    if(timeSlots){
      const lastIndex = (timeSlots.length-1);
      const lastSlot = timeSlots[lastIndex];
      const startdate = moment(this.addSlotsForm.value.startDate);
      const enddate = moment(this.addSlotsForm.value.endDate);

      if(enddate.diff(startdate,"days") < 7){
        let WeekDays = ["Sun", "Mon", "Tue", "Wed","Thu", "Fri","Sat"];
        let WeekFullDays = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday","Saturday"]
        let missingDays = [];
        lastSlot.days.forEach(day=>{
          let isValidDays = false;
          let currDate = moment(new Date(startdate.toString()));
          while(currDate.unix() <= enddate.unix()){
            if(WeekDays.indexOf(day) === currDate.weekday()) isValidDays = true;
            currDate.add(1,'d');
          };
          if(!isValidDays) missingDays.push(WeekFullDays[WeekDays.indexOf(day)]);
        });
        if(missingDays.length > 0){
          let error = "not present in current date range";
          if(missingDays.length > 1) error = missingDays.join(", ")+" are " + error;
          else error = missingDays.join(", ")+" is " + error;
          return {invalid: true, error: error};
        }
      }
      
      if (timeSlots.length < 2) return {invalid: false, error: ""};
      // compare each slot to every other slot
      const start1 = moment([lastSlot.startTime,lastSlot.startMeridiem].join(" ") , ["h:mm A"]);
      const end1 = moment([lastSlot.endTime,lastSlot.endMeridiem].join(" "), ["h:mm A"]);
      let countSameDay = 1;
      for (let i = 0; i < lastIndex; i++) {
        // prevent comparision of slot with itself
        const currSlot = timeSlots[i];
        const isUniqueDay = (currSlot.days.filter(day => lastSlot.days.includes(day)).length === 0);
        
        if (isUniqueDay) continue;
        else countSameDay++;

        if (countSameDay > 3) return {invalid: true, error: "Maximum 3 slots allowed for a day"};

        const start2 = moment([currSlot.startTime,currSlot.startMeridiem].join(" "), ["h:mm A"]);
        const end2 = moment([currSlot.endTime,currSlot.endMeridiem].join(" "), ["h:mm A"]);

        if (
          (start2.isBetween(start1, end1, undefined, "[]") ||
          end2.isBetween(start1, end1, undefined, "[]")) 
        ) {
          return {invalid: true, error: "This time slot is already selected for the day"};
        }
      }
    }
    
    // All time slots are are valid
    return {invalid: false, error: ""};
  };

}
