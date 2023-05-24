import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
import * as moment from "moment";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  age: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit, OnDestroy {
  value: any = {};
  flagPatientNo = 0;
  activePatient = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  followUpVisitNo = 0;
  setSpiner = true;
  setSpiner1 = true;
  specialization;
  allVisits = [];
  followUpVisit = [];
  limit = 100;
  allVisitsLoaded = false;
  systemAccess = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
    private helper: HelperService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
    const userDetails = getFromStorage("user");
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid).subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        const attributes = provider.results[0].attributes;
        attributes.forEach((element) => {
          if (
            element.attributeType.uuid ===
            "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
            !element.voided
          ) {
            this.specialization = element.value;
          }
        });
        userDetails["roles"].forEach((role) => {
          if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
            role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
            this.systemAccess = true;
          }
        });
        this.getVisits();
        //  this.getVisitCounts(this.specialization);
      });
    } else {
      this.authService.logout();
    }
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.socket.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });
      this.playNotify();
    });
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find(({ Status }: any) => Status === type);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        this.flagPatientNo = getTotal(data, "Priority");
        this.activePatient = getTotal(data, "Awaiting Consult");
        this.visitNoteNo = getTotal(data, "Visit In Progress");
        this.completeVisitNo = getTotal(data, "Completed Visit");
      }
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getVisits(query: any = {}, cb = () => { }) {
    this.service.getVisits(query, false).subscribe(
      (response) => {
        response.results.forEach((item) => {
          var i = this.allVisits.findIndex(x => x.patient.identifiers[0].identifier == item.patient.identifiers[0].identifier);
          if (i <= -1) {
            this.allVisits.push(item);
          }
        });
        this.allVisits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (this.systemAccess) {
              this.visitCategory(active);
            } else if (active.attributes.length) {
              const attributes = active.attributes;
              const speRequired = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
              );
              if (speRequired.length) {
                speRequired.forEach((spe, index) => {
                  if (spe.value === this.specialization) {
                    this.visitCategory(active);
                  }
                });
              }
            }
          }
          this.value = {};
        });
        this.setVisitlengthAsPerLoadedData();
        if (response.results.length === 0) {
          this.setVisitlengthAsPerLoadedData();
          this.allVisitsLoaded = true;
        }
        this.helper.refreshTable.next();
        this.setSpiner = false;
        this.isLoadingNextSlot = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.snackbar.open("Client-side error", null, { duration: 4000 });
        } else {
          this.snackbar.open("Server-side error", null, { duration: 4000 });
        }
      }
    );
  }

  getLength(arr) {
    let data = [];
    arr.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    return data.filter((i) => i).slice().length;
  }

  setVisitlengthAsPerLoadedData() {
    this.flagPatientNo = this.getLength(this.flagVisit);
    this.activePatient = this.getLength(this.waitingVisit);
    this.visitNoteNo = this.getLength(this.progressVisit);
    this.completeVisitNo = this.getLength(this.completedVisit);
  }

  get completedVisit() {
    return this.service.completedVisit;
  }
  get progressVisit() {
    return this.service.progressVisit;
  }

  get flagVisit() {
    return this.service.flagVisit;
  }
  get waitingVisit() {
    return this.service.waitingVisit;
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter;
    if (this.checkVisit(encounters, "Visit Complete") ||
      this.checkVisit(encounters, "Patient Exit Survey")
      || active.stopDatetime != null) {
      const values = this.assignValueToProperty(active, encounter);
      let found = this.service.completedVisit.find(c => c.id === values.id);
      if (!found) {
        this.service.completedVisit.push(this.setValues(values, active));
      }
    } else if (this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.progressVisit.push(values);
    } else if (this.checkVisit(encounters, "Flagged") &&
      active.stopDatetime == null) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        this.service.flagVisit.push(values);
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.waitingVisit.push(values);
    }
  }

  get nextPage() {
    return Number((this.allVisits.length / this.limit).toFixed()) + 2;
  }

  tableChange({ loadMore, refresh }) {
    if (loadMore) {
      if (!this.isLoadingNextSlot) this.setSpiner = true;
      const query = {
        limit: this.limit,
        startIndex: this.allVisits.length,
      };
      this.getVisits(query, refresh);
    }
  }

  isLoadingNextSlot = false;
  loadNextSlot() {
    if (!this.isLoadingNextSlot && !this.allVisitsLoaded) {
      this.isLoadingNextSlot = true;
      this.tableChange({ loadMore: true, refresh: () => { } });
    }
  }
  getPhoneNumber(attributes) {
    let phoneObj = attributes.find(({ display = "" }) =>
      display.includes("Telephone Number")
    );
    return phoneObj ? phoneObj.value : "NA";
  }
  assignValueToProperty(active, encounter, followUpDate?) {
    let value:any= {}
    value.visitId = active.uuid;
    value.patientId = active.patient.uuid;
    value.id = active.patient.identifiers[0].identifier;
    value.name = active.patient.person.display;
    value.telephone = this.getPhoneNumber(active.patient.attributes);
    value.gender = active.patient.person.gender;
    value.age = active.patient.person.age;
    value.location = active.location.display;
    value.status = active.encounters[0]?.encounterType.display;
    let visitCompleteEnc = active.encounters.find(enc => enc.display.includes("Visit Complete"));
      if(visitCompleteEnc) {
        value.provider = visitCompleteEnc?.encounterProviders[0]?.provider.display.split("- ")[1];
      } else {
        value.provider = active.encounters[0]?.encounterProviders[0]?.provider.display.split("- ")[1];
      }
    value.lastSeen = active.encounters[0]?.encounterDatetime;
    value.date =  moment(followUpDate, "DD-MM-YYYY").format("DD-MMM-YYYY");
    value.isPastDate = moment().toDate() > moment(followUpDate, "DD-MM-YYYY").toDate();
    return value;
  }

  setValues(value, visitDetail) {
    let values = value;
    visitDetail.encounters.forEach(encounter => {
      if (encounter.display.match('ADULTINITIAL') !== null) {
        values.healthWorker = encounter.encounterProviders[0].provider.display.split("- ")[1];
      }

      if (encounter.display.match('Visit Note') !== null) {
        let diagnosis = [];
        encounter.obs.forEach(res => {
          if (res.display.match('TELEMEDICINE DIAGNOSIS') !== null) {
            diagnosis.push(res.value);
          }
        });
        values.diagnosis = diagnosis.length > 0 ? diagnosis : "Not Provided";
      }
      return values;
    });
    return values;
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  getFollowUpdVisits() {
    this.setSpiner1= true;
    this.followUpVisit = [];
    this.followUpVisitNo = 0;
    let fromStartDate = moment().add(-2, 'months').startOf('month').format();
    this.service.getVisitWithDateFilter({}, true, fromStartDate).subscribe(
      (response) => {
        let allVisits = [];
        response.results.forEach((item) => {
          var i = allVisits.findIndex(x => x.patient.identifiers[0].identifier == item.patient.identifiers[0].identifier);
          if (i <= -1) {
            allVisits.push(item);
          }
        });
        allVisits.forEach((visit) => {
            if (visit.encounters.length > 0) {
              if (this.systemAccess) {
                this.getFollowUpVisits(visit);
              } else if (visit.attributes.length) {
                const attributes = visit.attributes;
                const speRequired = attributes.filter(
                  (attr) =>
                    attr.attributeType.uuid ===
                    "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
                );
                if (speRequired.length) {
                  speRequired.forEach((spe) => {
                    if (spe.value === this.specialization) {
                      this.getFollowUpVisits(visit);
                    }
                  });
                }
              }
            }
        });
        this.setSpiner1 = false;
      });
  }

  private getFollowUpVisits(visit: any) {
    this.getFollowUpDateAndExamination(visit);
    if (visit.followUp && /\d/.test(visit.followUp)) {
      let v = this.assignValueToProperty(visit, visit.encounters[0], visit.followUp);  
      let found = this.followUpVisit.find(c => c.id === v.id);
      if (!found) {
      this.followUpVisit.push(this.setValues(v, visit));
      this.followUpVisitNo += 1;
    }
  }
  }

  getFollowUpDateAndExamination(visit) {
    let visit1 = visit;
    visit?.encounters?.forEach((encounter) => {
      const display = encounter.display;
      if (display.match("Visit Note") !== null) {
        const observations = encounter.obs;
        observations?.forEach((obs) => {
          if (obs.display.match("Follow up visit") !== null) {
            visit1.followUp = obs.value?.split(',')[0]?.trim();
          }
        });
        return visit1;
      } else {
        return visit1;
      }
    });
  }

 updateFollowUpVisits(v: any) {
    let found = this.followUpVisit.find(c => c.id === v.id);
    if (!found) {
      this.followUpVisit.push(v);
      this.followUpVisitNo += 1;
    }
  }
}
