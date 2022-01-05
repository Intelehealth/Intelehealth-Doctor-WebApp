import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CalendarEvent, CalendarView } from "angular-calendar";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";
import { TranslationService } from "src/app/services/translation.service";

const colors: any = {
  red: {
    primary: "#ad2121",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ff",
    secondary: "#D1E8FF",
  },
  yellow: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
};

@Component({
  selector: "app-appointment",
  templateUrl: "./appointment.component.html",
  styleUrls: ["./appointment.component.css"],
})
export class AppointmentComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  @ViewChild("schedule") schedule: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  selectedDays = [];
  scheduleForm = new FormGroup({
    startTime: new FormControl("9:00 AM", [Validators.required]),
    endTime: new FormControl("6:00 PM", [Validators.required]),
  });
  userSchedule: any = Object;
  type: string = "month";
  types: any = [
    { day: "All Days", startTime: null, endTime: null, checked: false },
    { day: "Week Day", startTime: null, endTime: null, checked: false },
  ];
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null, checked: false },
    { day: "Tuesday", startTime: null, endTime: null, checked: false },
    { day: "Wednesday", startTime: null, endTime: null, checked: false },
    { day: "Thursday", startTime: null, endTime: null, checked: false },
    { day: "Friday", startTime: null, endTime: null, checked: false },
  ];
  weekends: any = [
    { day: "Saturday", startTime: null, endTime: null, checked: false },
    { day: "Sunday", startTime: null, endTime: null, checked: false },
  ];
  slotHours = [];
  errorMsg: string = null;
  modalData: {
    date: Date;
    events: CalendarEvent[];
  };
  constructor(
    private appointmentService: AppointmentService,
    private snackbar: MatSnackBar,
    private translationService: TranslationService,
    private modal: NgbModal,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.getSchedule();
    this.slotHours = this.getHours();
  }

  checkDaysFromSchedule() {
    try {
      this.weekDays.forEach((day) => (day.checked = false));
      this.weekends.forEach((day) => (day.checked = false));
      if (this.userSchedule.slotDays) {
        const slotDays = this.userSchedule.slotDays.split("||");
        slotDays.forEach((day) => {
          const weekIdx = this.weekDays.findIndex((d) => d.day === day);
          const weekndIdx = this.weekends.findIndex((d) => d.day === day);
          if (weekIdx != -1) {
            this.weekDays[weekIdx].checked = true;
          }
          if (weekndIdx != -1) {
            this.weekends[weekndIdx].checked = true;
          }
        });
      }
      let weekDayCheck = true;
      let allDayCheck = true;
      this.weekDays.forEach((day) => {
        if (!day.checked) {
          weekDayCheck = false;
          allDayCheck = false;
        }
      });
      this.weekends.forEach((day) => {
        if (!day.checked) {
          allDayCheck = false;
        }
      });
      let [allDay, weekDay] = this.types;
      weekDay.checked = weekDayCheck;
      allDay.checked = allDayCheck;
    } catch (error) {
      console.log("error: ", error);
    }
  }

  get locale() {
    return localStorage.getItem("selectedLanguage");
  }

  get viewDateLabel() {
    return moment(this.viewDate).locale(this.locale).format("MMMM YYYY");
  }

  getSchedule(
    year = moment(this.viewDate).format("YYYY"),
    month = moment(this.viewDate).format("MMMM")
  ) {
    this.appointmentService
      .getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.userSchedule = res.data;
          } else {
            this.userSchedule = {
              slotSchedule: [],
            };
          }
          this.initializeEvents(this.userSchedule.slotSchedule);
        },
      });
  }

  private initializeEvents(slots) {
    let slot = slots.reverse().filter(
      (
        (set) => (f) =>
          !set.has(new Date(f.date).getTime()) &&
          set.add(new Date(f.date).getTime())
      )(new Set())
    );
    let array: CalendarEvent[] = [];
    for (let i = 0; i < slot.length; i++) {
      let event1 = {
        title: `${slot[i].startTime}-${slot[i].endTime}`,
        color: colors.yellow,
        start: new Date(slot[i].date),
        startTime: slot[i].startTime,
        endTime: slot[i].endTime,
        day: slot[i].day,
      };
      const isToday = this.isToday(event1.start);
      if (isToday) {
        event1["isTimeOver"] = false;
      } else {
        event1["isTimeOver"] = event1.start < new Date();
      }
      array.push(event1);
    }
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.events = Object.assign([], array);
    this.checkDaysFromSchedule();
  }

  getHours(returnAll = true, date?) {
    const hours = Array.from(
      {
        length: 24,
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

  toast({
    message,
    duration = 5000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.snackbar.open(message, null, opts);
  }

  getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a) =>
      a.display.includes("specialization")
    ).value;
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }

  validateTimeSlots(t1) {
    if (t1.startTime == null || t1.endTime == null) {
      return false;
    } else if (
      moment(t1.startTime, ["h:mm A"]).format("HH:mm:ss") >
      moment(t1.endTime, ["h:mm A"]).format("HH:mm:ss")
    ) {
      return false;
    }
    return true;
  }

  addSchedule() {
    this.selectedDays = [];
    this.slotHours = this.getHours(true);
    this.checkDaysFromSchedule();
    this.modal.open(this.modalContent);
  }

  set(type) {
    this.errorMsg = null;
    if (type.day === "All Days") {
      this.type = "month";
      this.weekDays.forEach((element) => (element.checked = !!type.checked));
      this.weekends.forEach((element) => (element.checked = !!type.checked));
      this.types.forEach((element) => (element.checked = !!type.checked));
    } else if (type.day === "Week Day") {
      this.weekDays.forEach((element) => (element.checked = !!type.checked));
      this.type = "week";
    } else {
      this.type = "week";
    }
    this.selectedDays = this.weekDays
      .filter((day) => day.checked)
      .concat(this.weekends.filter((day) => day.checked));
    let weekDayCheck = true;
    let allDayCheck = true;
    this.weekDays.forEach((day) => {
      if (!day.checked) {
        weekDayCheck = false;
        allDayCheck = false;
      }
    });
    this.weekends.forEach((day) => {
      if (!day.checked) {
        allDayCheck = false;
      }
    });
    let [allDay, weekDay] = this.types;
    weekDay.checked = weekDayCheck;
    allDay.checked = allDayCheck;
  }

  getSlotSchedule(selectedDays) {
    let schedules = [];
    const start = moment(this.viewDate).startOf("month");
    const end = moment(this.viewDate).endOf("month");
    const todaysDate = moment(moment().format("LL"), "LL");
    let currentDay = moment(start.format());
    const days = selectedDays.map((d) => d.day);
    while (currentDay < end) {
      if (currentDay > todaysDate) {
        const day = currentDay.format("dddd");
        if (days.includes(day)) {
          schedules.push({
            day,
            endTime: this.scheduleForm.value.endTime,
            startTime: this.scheduleForm.value.startTime,
            date: currentDay.format(),
          });
        }
      }
      currentDay.add(1, "day");
    }
    let existingToKeep = [];
    const { slotSchedule = [] } = this.userSchedule;
    slotSchedule.forEach((s) => {
      const date = moment(s.date);
      let slotToPush = s;
      if (
        !date.isSame(end) &&
        !date.isSame(start) &&
        (!date.isBetween(start, end) || date <= todaysDate)
      ) {
        existingToKeep.push(slotToPush);
      }
    });
    return existingToKeep.concat(schedules);
  }

  isToday(date = this.viewDate) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }

  isPast() {
    const lastDayOfMonthStart = moment().endOf("month").startOf("day");
    const lastDayOfMonthEnd = moment().endOf("month").endOf("day");
    return moment(this.viewDate).isBetween(
      lastDayOfMonthStart,
      lastDayOfMonthEnd
    );
  }

  submit() {
    if (this.isPast()) {
      this.toast({
        message: `You can't create/update past and schedule`,
      });
      return;
    }
    if (this.validateTimeSlots(this.scheduleForm.value)) {
      if (this.selectedDays.length > 0) {
        const speciality = this.getSpeciality();
        let body = this.getJson(speciality);
        this.saveSchedule(body);
        this.getSchedule();
        this.modal.dismissAll();
        this.errorMsg = null;
      } else {
        this.error("Select Day Message");
      }
    } else {
      this.error("Check Time Message");
    }
  }

  private saveSchedule(body: {
    speciality: any;
    type: string;
    userUuid: any;
    slotDays: any;
    slotSchedule: any[];
    drName: any;
  }) {
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.getSchedule();
          this.translationService.getTranslation(res.message);
        }
      },
    });
  }

  private getJson(speciality: any) {
    return {
      speciality,
      type: this.type,
      userUuid: this.userId,
      slotDays: this.selectedDays.map((d) => d.day).join("||"),
      slotSchedule: this.getSlotSchedule(this.selectedDays),
      drName: this.drName,
      year: moment(this.viewDate).format("YYYY"),
      month: moment(this.viewDate).format("MMMM"),
    };
  }

  clear() {
    this.weekDays.forEach((element) => {
      element.checked = false;
    });
    this.weekends.forEach((element) => {
      element.checked = false;
    });
    this.types.forEach((element) => {
      element.checked = false;
    });
    this.errorMsg = null;
    this.selectedDays = [];
  }

  closeOpenMonthViewDay(type?) {
    this.getSchedule();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length !== 0) {
      this.modalData = { date, events };
      this.slotHours = this.getHours(false, date);
      this.modal.open(this.schedule);
    }
  }

  update(selectedDay, operation) {
    let array = this.userSchedule.slotSchedule;
    array.forEach((element, index) => {
      if (
        operation === "cancel" &&
        new Date(element.date).getTime() ===
          new Date(selectedDay.start).getTime()
      ) {
        array.splice(index, 1);
      }
      if (
        operation === "update" &&
        new Date(element.date).getTime() ===
          new Date(selectedDay.start).getTime()
      ) {
        element.startTime = selectedDay.startTime;
        element.endTime = selectedDay.endTime;
      }
    });
    this.userSchedule.slotSchedule = array;
    let body = {
      speciality: this.userSchedule.speciality,
      type: this.userSchedule.type,
      userUuid: this.userSchedule.userUuid,
      slotDays: this.userSchedule.slotDays,
      slotSchedule: this.userSchedule.slotSchedule,
      drName: this.userSchedule.drName,
      year: moment(this.viewDate).format("YYYY"),
      month: moment(this.viewDate).format("MMMM"),
    };
    this.saveSchedule(body);
  }

  private error(msg) {
    this.translateService.get(`messages.${msg}`).subscribe((res: string) => {
      this.errorMsg = res;
    });
  }
}
