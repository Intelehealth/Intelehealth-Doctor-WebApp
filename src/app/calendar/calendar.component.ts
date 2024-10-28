import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { CoreService } from '../services/core/core.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from 'src/config/constant';
import { ApiResponseModel, AppointmentDetailResponseModel, AppointmentModel, CustomEncounterModel, EncounterModel, FollowUpModel, HwModel, ProviderAttributeModel, ProviderModel, RescheduleAppointmentModalResponseModel, ScheduleModel, ScheduleSlotModel, UserModel } from '../model/model';
import { MindmapService } from '../services/mindmap.service';
import { NgxRolesService } from 'ngx-permissions';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  viewDate = new Date();
  view: CalendarView = CalendarView.Day;
  CalendarView = CalendarView;
  events: CalendarEvent[] = [];
  baseUrl: string = environment.baseURL;
  base: string = environment.base;
  provider: ProviderModel;
  user: UserModel;
  fetchedYears: number[] = [];
  fetchedMonths: string[] = [];
  daysOff: ScheduleModel[] = [];
  monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  refresh = new Subject<void>();

  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private coreService: CoreService,
    private router: Router,
    private toastr: ToastrService,
    private mindmapService: MindmapService,
    private translateService:TranslateService,
    private roleService: NgxRolesService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "", imgUrl: "assets/svgs/menu-calendar-circle.svg" });
    this.user = getCacheData(true, doctorDetails.USER);
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    this.fetchedYears.push(new Date().getFullYear());
    this.fetchedMonths.push(`${moment(new Date()).format("MMMM")} ${moment(new Date()).format("YYYY")}`);
    this.getFollowUpVisit();
    this.getAppointments(moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'));
    this.getSchedule();
  }

  /**
  * Callback for date changed event on calendar view
  * @param {Date} viewDate - New Date
  * @return {void}
  */
  dateChanged(viewDate: Date) {
    if (this.fetchedYears.indexOf(viewDate.getFullYear()) == -1) {
      this.fetchedYears.push(viewDate.getFullYear());
      this.getAppointments(moment(viewDate).startOf('year').format('DD/MM/YYYY'), moment(viewDate).endOf('year').format('DD/MM/YYYY'));
    }
    if (this.fetchedMonths.indexOf(`${moment(viewDate).format("MMMM")} ${moment(viewDate).format("YYYY")}`) == -1) {
      this.fetchedMonths.push(`${moment(viewDate).format("MMMM")} ${moment(viewDate).format("YYYY")}`);
      this.getSchedule(moment(viewDate).format("YYYY"), moment(viewDate).format("MMMM"));
    }
  }

  /**
  * Get booked appointments for a logged-in doctor between from and to date
  * @param {string} from - From Date
  * @param {string} to - To Date
  * @return {void}
  */
  getAppointments(from: string, to: string) {
    const isMCCUser = !!this.roleService.getRole('ORGANIZATIONAL:MCC');
    this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, from, to, isMCCUser ? this.getSpeciality(): null )
      .subscribe((res: ApiResponseModel) => {
        let appointmentsdata: AppointmentModel[] = res.data;
        appointmentsdata.forEach((appointment: AppointmentModel) => {
          if (appointment.status == 'booked' && (appointment.visitStatus == 'Awaiting Consult'||appointment.visitStatus == 'Visit In Progress')) {
            if (appointment.visit) {
              if (!this.events.find((o: CalendarEvent) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id)) {
                this.events.push({
                  id: appointment.visitUuid,
                  title: 'Appointment',
                  start: moment(appointment.slotJsDate).toDate(),
                  end: moment(appointment.slotJsDate).add(appointment.slotDuration, appointment.slotDurationUnit).toDate(),
                  meta: appointment
                });
              }
            }
          }
        });
        setTimeout(() => {
          this.refresh.next();
        }, 500);
    });
  }

  /**
  * Get calendar schedule for a logged-in doctor for a given year and month
  * @param {string} year - Year
  * @param {string} month - Month
  * @return {void}
  */
  getSchedule(year = moment(new Date()).format("YYYY"), month = moment(new Date()).format("MMMM")) {
    this.appointmentService.getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: ApiResponseModel) => {
          if (res && res.data) {
            if (!res.data.daysOff) {
              res.data.daysOff = [];
            }
            this.daysOff.push(res.data);
          } else {
            this.daysOff.push({
              type: "month",
              month: month,
              year: year,
              daysOff: [],
              slotSchedule: [],
              startDate: moment(`${month} ${year}`, "MMMM yyyy").startOf('month').add(1, 'day').toISOString(),
              endDate: moment(`${month} ${year}`, "MMMM yyyy").endOf('month').toISOString(),
              drName: this.drName,
              userUuid: this.userId,
              speciality: this.getSpeciality(),
              slotDays: ""
            });
          }
        },
      });
  }

  /**
  * Get follow-up visits for a logged-in doctor
  * @return {void}
  */
  getFollowUpVisit() {
    this.appointmentService.getFollowUpVisit(this.providerId).subscribe({
      next: (res: FollowUpModel[]) => {
        if(res) {
          let followUpVisits = res;
          followUpVisits.forEach((folloUp: FollowUpModel) => {
            this.visitService.fetchVisitDetails(folloUp.visit_id).subscribe((visit)=> {
              let followUpDate = (folloUp.followup_text.includes('Time:')) ? moment(folloUp.followup_text.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(folloUp.followup_text.split(', Remark: ')[0]).format('YYYY-MM-DD');
              let followUpTime = (folloUp.followup_text.includes('Time:')) ? folloUp.followup_text.split(', Time: ')[1].split(', Remark: ')[0] : null;
              let start = (followUpTime)?  moment(followUpDate + ' ' + followUpTime, 'YYYY-MM-DD hh:mm a').toDate() : setHours(setMinutes(new Date(followUpDate), 0), 9);
              let end = (followUpTime)?  moment(followUpDate + ' ' + followUpTime, 'YYYY-MM-DD hh:mm a').add(30, 'minutes').toDate() : setHours(setMinutes(new Date(followUpDate), 30), 9);
              if (moment(start).isValid() && moment(end).isValid()) {
                let hw = this.getHW(visit.encounters);
                this.events.push({
                  id: visit.uuid,
                  title: 'Follow-up visit',
                  start,
                  end,
                  meta: {
                    createdAt: this.getCreatedAtTime(visit.encounters),
                    drName: this.provider?.person.display,
                    hwAge: hw.hwAge,
                    hwGender: hw.hwGender,
                    hwName: hw.hwName,
                    hwPic: null,
                    hwUUID: hw.hwProviderUuid,
                    openMrsId: visit.patient.identifiers[0].identifier,
                    patientAge: visit.patient.person.age,
                    patientGender: visit.patient.person.gender,
                    patientId: visit.patient.uuid,
                    patientName: visit.patient.person.display,
                    patientPic: null,
                    slotDate: moment(followUpDate).format('DD/MM/YYYY'),
                    slotDay: moment(followUpDate).format('dddd'),
                    slotDuration: 30,
                    slotDurationUnit: "minutes",
                    slotJsDate: moment(start).utc().format(),
                    slotTime: (followUpTime) ? followUpTime:"9:00 AM",
                    type: "follow-up visit",
                    userUuid: this.user.uuid,
                    visitUuid: visit.uuid,
                    visit_info: visit
                  }
                });
              }
            })
          });
        }
      },
    });
  }

  /**
  * Get encounter datetime for a visit note encounter
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {string} - Visit note encounter datetime
  */
  getCreatedAtTime(encounters: EncounterModel[]): string {
    let encounterDateTime: string = '';
    encounters.forEach((encounter: EncounterModel) => {
      const display = encounter.display;
      if (display.match(visitTypes.VISIT_NOTE) !== null) {
        encounterDateTime = encounter.encounterDatetime;
      }
    });
    return encounterDateTime;
  }

  /**
  * Get calendar schedule for a logged-in doctor for a given year and month
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @param {string} month - Month
  * @return {HwModel} - HW details
  */
  getHW(encounters: EncounterModel[]) {
    let obj: HwModel = {
      hwName: null,
      hwAge: null,
      hwGender: null,
      hwProviderUuid: null
    };
    encounters.forEach((encounter: EncounterModel) => {
      const display = encounter.display;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        obj.hwName = encounter.encounterProviders[0].provider.person.display;
        obj.hwAge = encounter.encounterProviders[0].provider.person.age;
        obj.hwGender = encounter.encounterProviders[0].provider.person.gender;
        obj.hwProviderUuid = encounter.encounterProviders[0].provider.uuid;
      }
    });
    return obj;
  }

  /**
  * Get provider uuid from localstorage provider
  * @return {string} - Provider uuid
  */
  get providerId(): string {
    return getCacheData(true, doctorDetails.PROVIDER).uuid;
  }

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  private get userId(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Get doctor name from localstorage user
  * @return {string} - Doctor name
  */
  private get drName(): string {
    return (
      getCacheData(true, doctorDetails.USER)?.person?.display ||
      getCacheData(true, doctorDetails.USER)?.display
    );
  }

  /**
  * Get doctor speciality from localstorage provider
  * @return {string} - Doctor Speciality
  */
  private getSpeciality(): string {
    return getCacheData(true, doctorDetails.PROVIDER).attributes.find((a: ProviderAttributeModel) =>
      a.display.includes(doctorDetails.SPECIALIZATION)
    ).value;
  }

  /**
  * Calendar view tab changed event callback
  * @param {number} event - Tab index
  * @return {void}
  */
  onTabChanged(event: number) {
    switch (event) {
      case 0:
        this.setView(CalendarView.Day);
        break;
      case 1:
        this.setView(CalendarView.Week);
        break;
      case 2:
        this.setView(CalendarView.Month);
        break;
    }
  }

  /**
  * Set calendar view
  * @param {CalendarView} view - View to be set
  * @return {void}
  */
  setView(view: CalendarView) {
    this.view = view;
  }

  /**
  * Returns count of events of a given type
  * @param {string} type - Type of event
  * @param {CalendarEvent[]} events - Array of calendar events
  * @return {number} - Count of events of a given type
  */
  getCount(type: string, events: CalendarEvent[]): number {
    let count: number = 0;
    events.forEach((e: CalendarEvent) => {
      if (e.title == type) {
        count++;
      }
    });
    return count;
  }

  /**
  * Callback for calendar day click event of month view
  * @param {string} view - Calendar view
  * @return {void}
  */
  dayClicked(view: string, day: any) {
    if (view == 'monthView') {
      let oldDaysOff = this.daysOff.find((o: ScheduleModel) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
      if (oldDaysOff) {
        if (oldDaysOff.daysOff.indexOf(moment(day.date).format('DD/MM/YYYY')) != -1) {
          this.toastr.warning(this.translateService.instant("This day is already marked as Day Off"), this.translateService.instant("Already DayOff"));
          return;
        }
      }
      this.coreService.openAppointmentDetailMonthViewModal(day).subscribe((res: AppointmentDetailResponseModel) => {
        if (res) {
          switch (res.markAs) {
            case 'dayOff':
              this.coreService.openConfirmDayOffModal(day.date).subscribe((result: boolean) => {
                if (result) {
                  let body = {
                    userUuid: this.userId,
                    daysOff: (oldDaysOff)? oldDaysOff.daysOff.concat([moment(day.date).format('DD/MM/YYYY')]) : [moment(day.date).format('DD/MM/YYYY')],
                    month: this.monthNames[day.date.getMonth()],
                    year: day.date.getFullYear().toString()
                  };
                  this.appointmentService.updateDaysOff(body).subscribe({
                    next: (res: ApiResponseModel) => {
                      if (res.status) {
                        let index = this.daysOff.findIndex((o: ScheduleModel) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
                        if (index != -1) {
                          this.daysOff[index].daysOff = (this.daysOff[index].daysOff)?this.daysOff[index].daysOff.concat(moment(day.date).format('DD/MM/YYYY')): [moment(day.date).format('DD/MM/YYYY')];
                        }
                        day.events.forEach((event: CalendarEvent) => {
                          if (event.title == 'Appointment') {
                            this.cancel(event.meta, false);
                          }
                        });

                        // Update schedule as per new dayOff
                        let schedule = this.daysOff.find((o: ScheduleModel) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
                        if (schedule?.slotSchedule.length) {
                          schedule.slotSchedule = schedule.slotSchedule.filter((s: ScheduleSlotModel) => { return !moment(day.date).isSame(moment(s.date)) });
                          this.appointmentService.updateOrCreateAppointment(schedule).subscribe({
                            next: (res: ApiResponseModel) => {
                              if (res.status) {
                                this.daysOff[index] = schedule;
                              }
                            },
                          });
                        }
                      }
                    },
                  });
                }
              });
              break;
            case 'hoursOff':
              this.coreService.openConfirmHoursOffModal({ day: day.date, detail: res}).subscribe((result: boolean) => {
                if (result) {
                  day.events.forEach((event: CalendarEvent) => {
                    if (event.title == 'Appointment') {
                      if (moment(event.meta.slotTime,'LT').isBetween(moment(res.from, 'LT'), moment(res.to, 'LT'))) {
                        this.cancel(event.meta, false);
                      }
                    }
                  });
                }
              });
              break;
          }
        }
      });
    }
  }

  /**
  * Callback to handle calendar cell click event of day or week view
  * @param {string} view - calendar view
  * @param {CalendarEvent[]} events - Array of calendar events
  * @return {void}
  */
  handleEvent(view: string, event: CalendarEvent) {
    if (view == 'dayView' || view == 'weekView') {
        this.coreService.openAppointmentDetailDayViewModal(event).subscribe((res: string|boolean) => {
          if (res) {
            switch (res) {
              case 'view':
                this.router.navigate(['/dashboard/visit-summary', event.id]);
                break;
              case 'reschedule':
                this.reschedule(event.meta);
                break;
              case 'cancel':
                this.cancel(event.meta);
                break;
            }
          }
        });
    }
  }

  /**
  * Cancel appointment with confirmation
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @param {boolean} withConfirmation - Need confirmation or not
  * @return {void}
  */
  cancel(appointment: AppointmentModel, withConfirmation: boolean = true) {
    if (withConfirmation) {
      this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: boolean) => {
        if (res) {
          this.events.splice(this.events.findIndex((o: CalendarEvent) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
          this.toastr.success(this.translateService.instant("The Appointment has been successfully canceled."), this.translateService.instant('Canceling successful'));
          setTimeout(() => {
            this.refresh.next();
          }, 500);
        }
      });
    } else {
      const payload = {
        id: appointment.id,
        visitUuid: appointment.visitUuid,
        hwUUID: this.userId,
      };
      this.appointmentService.cancelAppointment(payload).subscribe((res: ApiResponseModel) => {
          if(res) {
            if (res.status) {
              this.events.splice(this.events.findIndex((o: CalendarEvent) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
              setTimeout(() => {
                this.refresh.next();
              }, 500);
            }
          }
      });
    }
  }

  /**
  * Reschedule appointment
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @return {void}
  */
  reschedule(appointment: AppointmentModel) {
    const len = appointment.visit.encounters.filter((e: CustomEncounterModel) => {
      return (e.type.name.includes(visitTypes.PATIENT_EXIT_SURVEY) || e.type.name.includes(visitTypes.VISIT_COMPLETE));
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error(this.translateService.instant("Visit is already completed, it can't be rescheduled."), this.translateService.instant('Rescheduling failed'));
    } else {
      this.coreService.openRescheduleAppointmentModal(appointment).subscribe((res: RescheduleAppointmentModalResponseModel) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: boolean) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              delete appointment["visit_info"];
              this.appointmentService.rescheduleAppointment(appointment).subscribe((res: ApiResponseModel) => {
                const message = res.message;
                if (res.status) {
                  this.events.splice(this.events.findIndex((o: CalendarEvent) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
                  this.mindmapService.notifyHwForRescheduleAppointment(appointment)
                  this.events.push({
                    id: appointment.visitUuid,
                    title: 'Appointment',
                    start: moment(res.data.slotJsDate).toDate(),
                    end: moment(res.data.slotJsDate).add(res.data.slotDuration, res.data.slotDurationUnit).toDate(),
                    meta: res.data
                  });
                  this.toastr.success(this.translateService.instant("The appointment has been rescheduled successfully!"), this.translateService.instant('Rescheduling successful!'));
                } else {
                  this.toastr.success(message, this.translateService.instant('Rescheduling failed!'));
                }
              });
            }
          });
        }
      });
    }
  }

  /**
  * Check if day clicked is dayoff or not
  * @param {Date} date - Date
  * @return {boolean} - True if dayoff else false
  */
  checkIfDayOff(date: Date): boolean {
    let oldDaysOff = this.daysOff.find((o: ScheduleModel) => o.month == this.monthNames[date.getMonth()] && o.year == date.getFullYear().toString());
    if (oldDaysOff && oldDaysOff?.daysOff) {
      if (oldDaysOff.daysOff.indexOf(moment(date).format('DD/MM/YYYY')) != -1) {
        return true;
      }
    }
    return false;
  }

  /**
  * Get user uuid from localstorage user
  * @return {string}
  */
  get locale(): string {
    return getCacheData(false, languages.SELECTED_LANGUAGE);
  }

}
